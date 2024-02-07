/*
  Warnings:

  - You are about to drop the column `inventoryId` on the `statusData` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `statusData` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `statusData` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "statusData_inventoryId_key";

-- AlterTable
ALTER TABLE "statusData" DROP COLUMN "inventoryId",
ADD COLUMN     "id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "statusData_id_key" ON "statusData"("id");
