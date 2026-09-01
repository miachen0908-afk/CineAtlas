import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

type Variant = {
  name: "desktop" | "mobile";
  width: number;
  height: number;
};

const ATLAS_SIZE = 2048;
const PADDING = 2;
const variants: Variant[] = [
  { name: "desktop", width: 128, height: 192 },
  { name: "mobile", width: 96, height: 144 },
];
const root = process.cwd();
const posterRoot = path.join(root, "public/posters");
const outputRoot = path.join(root, "public/poster-atlas");

async function collectPosters(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectPosters(absolute)));
    else if (/\.(jpe?g|png|webp)$/i.test(entry.name)) files.push(absolute);
  }
  return files;
}

async function sourceSignature(files: string[]): Promise<string> {
  const hash = createHash("sha256");
  for (const file of files) {
    const info = await stat(file);
    hash.update(path.relative(root, file));
    hash.update(String(info.size));
    hash.update(String(info.mtimeMs));
  }
  return hash.digest("hex").slice(0, 16);
}

async function main() {
  const files = (await collectPosters(posterRoot)).sort((a, b) =>
    a.localeCompare(b)
  );
  await mkdir(outputRoot, { recursive: true });
  const signature = await sourceSignature(files);
  const manifestPath = path.join(outputRoot, "manifest.json");
  try {
    const previous = JSON.parse(await readFile(manifestPath, "utf8"));
    if (previous.signature === signature) {
      console.log(`Poster atlases are current (${files.length} posters).`);
      return;
    }
  } catch {
    // First generation or an invalid old manifest.
  }

  const manifest: {
    version: number;
    signature: string;
    atlasSize: number;
    variants: Record<string, { pages: string[] }>;
    entries: Record<string, Record<string, { page: number; uv: number[] }>>;
  } = {
    version: 1,
    signature,
    atlasSize: ATLAS_SIZE,
    variants: {},
    entries: {},
  };

  for (const variant of variants) {
    const cellWidth = variant.width + PADDING * 2;
    const cellHeight = variant.height + PADDING * 2;
    const columns = Math.floor(ATLAS_SIZE / cellWidth);
    const rows = Math.floor(ATLAS_SIZE / cellHeight);
    const perPage = columns * rows;
    const pageCount = Math.ceil(files.length / perPage);
    const pageUrls: string[] = [];

    for (let page = 0; page < pageCount; page += 1) {
      const pageFiles = files.slice(page * perPage, (page + 1) * perPage);
      const composites = await Promise.all(
        pageFiles.map(async (file, index) => {
          const left = (index % columns) * cellWidth + PADDING;
          const top = Math.floor(index / columns) * cellHeight + PADDING;
          const input = await sharp(file)
            .resize(variant.width, variant.height, { fit: "cover" })
            .webp({ quality: 82, smartSubsample: true })
            .toBuffer();
          const filmId = path.basename(file, path.extname(file));
          manifest.entries[filmId] ??= {};
          manifest.entries[filmId]![variant.name] = {
            page,
            uv: [
              left / ATLAS_SIZE,
              1 - (top + variant.height) / ATLAS_SIZE,
              variant.width / ATLAS_SIZE,
              variant.height / ATLAS_SIZE,
            ],
          };
          return { input, left, top };
        })
      );
      const fileName = `${variant.name}-${page}.webp`;
      await sharp({
        create: {
          width: ATLAS_SIZE,
          height: ATLAS_SIZE,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      })
        .composite(composites)
        .webp({ quality: 84, smartSubsample: true })
        .toFile(path.join(outputRoot, fileName));
      pageUrls.push(`/poster-atlas/${fileName}`);
    }
    manifest.variants[variant.name] = { pages: pageUrls };
  }

  await writeFile(manifestPath, `${JSON.stringify(manifest)}\n`);
  console.log(`Generated poster atlases for ${files.length} posters.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
