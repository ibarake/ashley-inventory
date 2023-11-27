/*
  Warnings:

  - You are about to drop the column `location` on the `InvData` table. All the data in the column will be lost.
  - Added the required column `comprometido` to the `InvData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enCamino` to the `InvData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `noDisponible` to the `InvData` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InvData" (
    "sku" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "enCamino" INTEGER NOT NULL,
    "noDisponible" INTEGER NOT NULL,
    "comprometido" INTEGER NOT NULL,
    "disponible" INTEGER NOT NULL,
    "enMano" INTEGER NOT NULL,
    "fechaDisponible" TEXT
);
INSERT INTO "new_InvData" ("disponible", "enMano", "fechaDisponible", "handle", "sku", "title") SELECT "disponible", "enMano", "fechaDisponible", "handle", "sku", "title" FROM "InvData";
DROP TABLE "InvData";
ALTER TABLE "new_InvData" RENAME TO "InvData";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
