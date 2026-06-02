/*
  Warnings:

  - You are about to drop the column `maturityDate` on the `Bond` table. All the data in the column will be lost.
  - You are about to drop the `BondTransaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BondTransaction" DROP CONSTRAINT "BondTransaction_bondId_fkey";

-- AlterTable
ALTER TABLE "Bond" DROP COLUMN "maturityDate",
ADD COLUMN     "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "purchasePrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "BondTransaction";
