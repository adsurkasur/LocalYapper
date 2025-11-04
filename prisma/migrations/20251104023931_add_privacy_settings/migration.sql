-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "displayName" TEXT NOT NULL,
    "avatarPath" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en-US',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "theme" TEXT NOT NULL DEFAULT 'system',
    "defaultBotId" TEXT,
    "defaultModel" TEXT,
    "autoSaveSessions" BOOLEAN NOT NULL DEFAULT true,
    "dataRetention" TEXT NOT NULL DEFAULT 'forever',
    "analytics" BOOLEAN NOT NULL DEFAULT false,
    "security" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("autoSaveSessions", "avatarPath", "createdAt", "defaultBotId", "defaultModel", "displayName", "id", "locale", "security", "theme", "timezone", "updatedAt") SELECT "autoSaveSessions", "avatarPath", "createdAt", "defaultBotId", "defaultModel", "displayName", "id", "locale", "security", "theme", "timezone", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
