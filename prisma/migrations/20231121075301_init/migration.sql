-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InvData" (
    "sku" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "disponible" INTEGER NOT NULL,
    "enMano" INTEGER NOT NULL,
    "fechaDisponible" TEXT,
    "uploadDataId" INTEGER,
    CONSTRAINT "InvData_uploadDataId_fkey" FOREIGN KEY ("uploadDataId") REFERENCES "UploadData" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_InvData" ("disponible", "enMano", "fechaDisponible", "handle", "location", "sku", "title", "uploadDataId") SELECT "disponible", "enMano", "fechaDisponible", "handle", "location", "sku", "title", "uploadDataId" FROM "InvData";
DROP TABLE "InvData";
ALTER TABLE "new_InvData" RENAME TO "InvData";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
