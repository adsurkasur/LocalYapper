/*
  Warnings:

  - You are about to drop the column `analytics` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `dataRetention` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `security` on the `users` table. All the data in the column will be lost.

*/
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("autoSaveSessions", "avatarPath", "createdAt", "defaultBotId", "defaultModel", "displayName", "id", "locale", "theme", "timezone", "updatedAt") SELECT "autoSaveSessions", "avatarPath", "createdAt", "defaultBotId", "defaultModel", "displayName", "id", "locale", "theme", "timezone", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
