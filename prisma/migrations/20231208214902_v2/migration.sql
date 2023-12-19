/*
  Warnings:

  - You are about to drop the column `comprometido` on the `InvData` table. All the data in the column will be lost.
  - You are about to drop the column `enCamino` on the `InvData` table. All the data in the column will be lost.
  - You are about to drop the column `enMano` on the `InvData` table. All the data in the column will be lost.
  - You are about to drop the column `noDisponible` on the `InvData` table. All the data in the column will be lost.
  - Added the required column `estado` to the `InvData` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InvData" (
    "sku" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "disponible" INTEGER NOT NULL,
    "estado" TEXT NOT NULL,
    "fechaDisponible" TEXT
);
INSERT INTO "new_InvData" ("disponible", "fechaDisponible", "handle", "sku", "title") SELECT "disponible", "fechaDisponible", "handle", "sku", "title" FROM "InvData";
DROP TABLE "InvData";
ALTER TABLE "new_InvData" RENAME TO "InvData";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
