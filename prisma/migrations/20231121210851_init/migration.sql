/*
  Warnings:

  - You are about to drop the `UploadData` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `uploadDataId` on the `InvData` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "UploadData";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InvData" (
    "sku" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "disponible" INTEGER NOT NULL,
    "enMano" INTEGER NOT NULL,
    "fechaDisponible" TEXT
);
INSERT INTO "new_InvData" ("disponible", "enMano", "fechaDisponible", "handle", "location", "sku", "title") SELECT "disponible", "enMano", "fechaDisponible", "handle", "location", "sku", "title" FROM "InvData";
DROP TABLE "InvData";
ALTER TABLE "new_InvData" RENAME TO "InvData";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
