-- CreateTable
CREATE TABLE "Film" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tmdbId" INTEGER,
    "titleZh" TEXT NOT NULL,
    "titleOriginal" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "primaryProductionCountry" TEXT NOT NULL,
    "otherProductionCountries" JSONB NOT NULL DEFAULT [],
    "productionCity" TEXT,
    "filmingLocations" JSONB NOT NULL DEFAULT [],
    "coordinates" JSONB NOT NULL,
    "genreIds" JSONB NOT NULL DEFAULT [],
    "directorIds" JSONB NOT NULL DEFAULT [],
    "posterUrl" TEXT,
    "posterColor" TEXT,
    "summary" TEXT NOT NULL DEFAULT '',
    "rating" REAL,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "importStatus" TEXT NOT NULL DEFAULT 'pending',
    "importCandidates" JSONB,
    "importError" TEXT,
    "dataSource" TEXT,
    "importedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Film_tmdbId_key" ON "Film"("tmdbId");
