/*
  Warnings:

  - You are about to drop the column `disponible` on the `InvData` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `InvData` table. All the data in the column will be lost.
  - Added the required column `available` to the `InvData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `color` to the `InvData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inventoryId` to the `InvData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variantId` to the `InvData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InvData" DROP COLUMN "disponible",
DROP COLUMN "id",
ADD COLUMN     "available" INTEGER NOT NULL,
ADD COLUMN     "color" TEXT NOT NULL,
ADD COLUMN     "inventoryId" TEXT NOT NULL,
ADD COLUMN     "variantId" TEXT NOT NULL;
