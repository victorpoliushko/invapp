/*
  Warnings:

  - You are about to drop the column `monthlyRent` on the `RealEstate` table. All the data in the column will be lost.
  - You are about to drop the column `occupancyPct` on the `RealEstate` table. All the data in the column will be lost.
  - Added the required column `code` to the `RealEstate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RealEstate" DROP COLUMN "monthlyRent",
DROP COLUMN "occupancyPct",
ADD COLUMN     "code" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "RealEstateTransaction" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "monthlyRent" DOUBLE PRECISION NOT NULL,
    "realEstateId" TEXT NOT NULL,

    CONSTRAINT "RealEstateTransaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RealEstateTransaction" ADD CONSTRAINT "RealEstateTransaction_realEstateId_fkey" FOREIGN KEY ("realEstateId") REFERENCES "RealEstate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
