/*
  Warnings:

  - You are about to drop the column `asset` on the `Asset` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ticker]` on the table `Asset` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ticker` to the `Asset` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Asset_asset_key";

-- AlterTable
ALTER TABLE "Asset" RENAME COLUMN "asset" TO "ticker";

-- CreateIndex
CREATE UNIQUE INDEX "Asset_ticker_key" ON "Asset"("ticker");
