/*
  Warnings:

  - A unique constraint covering the columns `[variantId]` on the table `InvData` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[inventoryId]` on the table `InvData` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `inventoryId` on the `InvData` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `variantId` on the `InvData` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "InvData" DROP COLUMN "inventoryId",
ADD COLUMN     "inventoryId" INTEGER NOT NULL,
DROP COLUMN "variantId",
ADD COLUMN     "variantId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "InvData_variantId_key" ON "InvData"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "InvData_inventoryId_key" ON "InvData"("inventoryId");
