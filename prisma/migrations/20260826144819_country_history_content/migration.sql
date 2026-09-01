-- CreateTable
CREATE TABLE "CountryCinemaHistoryContent" (
    "countryCode" TEXT NOT NULL PRIMARY KEY,
    "content" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CountryCinemaHistoryRevision" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "countryCode" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CountryCinemaHistoryRevision_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "CountryCinemaHistoryContent" ("countryCode") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CountryCinemaHistoryRevision_countryCode_createdAt_idx" ON "CountryCinemaHistoryRevision"("countryCode", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CountryCinemaHistoryRevision_countryCode_version_key" ON "CountryCinemaHistoryRevision"("countryCode", "version");
