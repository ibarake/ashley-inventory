/*
  Warnings:

  - You are about to drop the `invData` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "invData";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "UploadData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);

-- CreateTable
CREATE TABLE "InvData" (
    "sku" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "disponible" INTEGER NOT NULL,
    "enMano" INTEGER NOT NULL,
    "fechaDisponible" TEXT NOT NULL,
    "uploadDataId" INTEGER,
    CONSTRAINT "InvData_uploadDataId_fkey" FOREIGN KEY ("uploadDataId") REFERENCES "UploadData" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
