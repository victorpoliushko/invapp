/*
  Warnings:

  - A unique constraint covering the columns `[symbol]` on the table `Symbol` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Symbol" ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "exchange" DROP NOT NULL,
ALTER COLUMN "dataSource" DROP NOT NULL,
ALTER COLUMN "type" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Symbol_symbol_key" ON "Symbol"("symbol");
