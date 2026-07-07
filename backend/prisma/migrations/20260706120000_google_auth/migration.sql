-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "googleSubject" TEXT,
    "businessName" TEXT,
    "taxId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "new_User" ("businessName", "createdAt", "email", "id", "name", "passwordHash", "taxId", "updatedAt")
SELECT "businessName", "createdAt", "email", "id", "name", "passwordHash", "taxId", "updatedAt" FROM "User";

DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_googleSubject_key" ON "User"("googleSubject");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
