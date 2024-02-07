-- CreateTable
CREATE TABLE "statusData" (
    "variantId" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "status" TEXT,
    "price" DOUBLE PRECISION,

    CONSTRAINT "statusData_pkey" PRIMARY KEY ("sku")
);

-- CreateIndex
CREATE UNIQUE INDEX "statusData_variantId_key" ON "statusData"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "statusData_inventoryId_key" ON "statusData"("inventoryId");
