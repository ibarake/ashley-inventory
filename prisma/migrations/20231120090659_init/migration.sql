-- CreateTable
CREATE TABLE "invData" (
    "sku" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "disponible" INTEGER NOT NULL,
    "enMano" INTEGER NOT NULL,
    "fechaDisponible" TEXT NOT NULL
);
