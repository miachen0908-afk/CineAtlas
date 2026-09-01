import "dotenv/config";

import { createClient } from "@libsql/client";
import Database from "better-sqlite3";

const sourcePath = process.env.LOCAL_SQLITE_PATH ?? "prisma/dev.db";
const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
const allowReplace = process.argv.includes("--replace");

if (!url || !authToken) {
  throw new Error(
    "TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required. Run `vercel env pull` first.",
  );
}

const source = new Database(sourcePath, { readonly: true });
const destination = createClient({ url, authToken });

const applicationTables = [
  "Film",
  "CountryCinemaHistoryContent",
  "CountryCinemaHistoryRevision",
];

function quoteIdentifier(value) {
  return `"${value.replaceAll('"', '""')}"`;
}

async function tableExists(table) {
  const result = await destination.execute({
    sql: "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1",
    args: [table],
  });
  return result.rows.length > 0;
}

async function destinationHasData() {
  for (const table of applicationTables) {
    if (!(await tableExists(table))) continue;
    const result = await destination.execute(
      `SELECT COUNT(*) AS count FROM ${quoteIdentifier(table)}`,
    );
    if (Number(result.rows[0]?.count ?? 0) > 0) return true;
  }
  return false;
}

async function createSchema() {
  const schema = source
    .prepare(
      `SELECT type, name, sql
       FROM sqlite_master
       WHERE sql IS NOT NULL
         AND name NOT LIKE 'sqlite_%'
         AND name != '_prisma_migrations'
       ORDER BY CASE type WHEN 'table' THEN 0 ELSE 1 END, name`,
    )
    .all();

  for (const item of schema) {
    if (item.type === "table" && !applicationTables.includes(item.name)) continue;
    if (item.type !== "table") {
      const belongsToApp = applicationTables.some((table) =>
        item.sql.includes(quoteIdentifier(table)),
      );
      if (!belongsToApp) continue;
    }
    const safeSql =
      item.type === "table"
        ? item.sql.replace(/^CREATE TABLE /, "CREATE TABLE IF NOT EXISTS ")
        : item.sql
            .replace(
              /^CREATE UNIQUE INDEX /,
              "CREATE UNIQUE INDEX IF NOT EXISTS ",
            )
            .replace(/^CREATE INDEX /, "CREATE INDEX IF NOT EXISTS ");
    await destination.execute(safeSql);
  }
}

async function clearDestination() {
  await destination.execute("PRAGMA foreign_keys = OFF");
  for (const table of [...applicationTables].reverse()) {
    if (await tableExists(table)) {
      await destination.execute(`DELETE FROM ${quoteIdentifier(table)}`);
    }
  }
  await destination.execute("PRAGMA foreign_keys = ON");
}

async function copyTable(table) {
  const columns = source
    .prepare(`PRAGMA table_info(${quoteIdentifier(table)})`)
    .all()
    .map((column) => column.name);
  const rows = source.prepare(`SELECT * FROM ${quoteIdentifier(table)}`).all();
  if (rows.length === 0) return 0;

  const sql = `INSERT INTO ${quoteIdentifier(table)} (${columns
    .map(quoteIdentifier)
    .join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`;

  for (let offset = 0; offset < rows.length; offset += 50) {
    const statements = rows.slice(offset, offset + 50).map((row) => ({
      sql,
      args: columns.map((column) => row[column]),
    }));
    await destination.batch(statements, "write");
  }
  return rows.length;
}

try {
  if ((await destinationHasData()) && !allowReplace) {
    throw new Error(
      "The Turso database already contains data. Re-run with --replace only when you intend to overwrite it.",
    );
  }

  await createSchema();
  if (allowReplace) await clearDestination();

  for (const table of applicationTables) {
    const count = await copyTable(table);
    console.log(`${table}: ${count} rows copied`);
  }
} finally {
  source.close();
  destination.close();
}
