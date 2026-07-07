-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_CatalogItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unitPrice" DECIMAL NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CatalogItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_CatalogItem" (
    "createdAt",
    "id",
    "isActive",
    "name",
    "type",
    "unitPrice",
    "updatedAt",
    "userId"
)
SELECT
    "createdAt",
    "id",
    "isActive",
    "name",
    "type",
    "unitPrice",
    "updatedAt",
    "userId"
FROM "CatalogItem";

DROP TABLE "CatalogItem";
ALTER TABLE "new_CatalogItem" RENAME TO "CatalogItem";

CREATE INDEX "CatalogItem_userId_name_idx" ON "CatalogItem"("userId", "name");
CREATE INDEX "CatalogItem_userId_type_isActive_idx" ON "CatalogItem"("userId", "type", "isActive");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
