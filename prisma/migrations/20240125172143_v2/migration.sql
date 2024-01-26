/*
  Warnings:

  - You are about to drop the column `handle` on the `InvData` table. All the data in the column will be lost.
  - Added the required column `id` to the `InvData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InvData" DROP COLUMN "handle",
ADD COLUMN     "id" TEXT NOT NULL;
