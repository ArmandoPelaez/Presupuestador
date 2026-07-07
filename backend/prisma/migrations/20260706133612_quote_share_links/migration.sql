-- CreateTable
CREATE TABLE "QuoteShareLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quoteId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "revokedAt" DATETIME,
    "respondedAt" DATETIME,
    "decision" TEXT,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuoteShareLink_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "QuoteShareLink_tokenHash_key" ON "QuoteShareLink"("tokenHash");

-- CreateIndex
CREATE INDEX "QuoteShareLink_quoteId_revokedAt_respondedAt_idx" ON "QuoteShareLink"("quoteId", "revokedAt", "respondedAt");

-- CreateIndex
CREATE INDEX "QuoteShareLink_expiresAt_idx" ON "QuoteShareLink"("expiresAt");
