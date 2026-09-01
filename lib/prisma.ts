import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const adapter = tursoUrl
    ? new PrismaLibSql(
        {
          url: tursoUrl,
          authToken: process.env.TURSO_AUTH_TOKEN,
        },
        { timestampFormat: "unixepoch-ms" },
      )
    : new PrismaBetterSqlite3(
        { url: process.env.DATABASE_URL ?? "file:./prisma/dev.db" },
        { timestampFormat: "unixepoch-ms" },
      );
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
