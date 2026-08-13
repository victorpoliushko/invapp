-- Split PortfolioAsset/Transaction (stocks+crypto combined, distinguished
-- only by Asset.type) into dedicated StockPosition/CryptoPosition and
-- StockTransaction/CryptoTransaction tables, consistent with Bond/
-- RealEstate/MixedAsset each having their own table. Existing rows are
-- routed by Asset.type: CRYPTOCURRENCY -> crypto tables, everything else
-- (including NULL) -> stock tables.

-- CreateTable
CREATE TABLE "StockPosition" (
    "portfolioId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION,

    CONSTRAINT "StockPosition_pkey" PRIMARY KEY ("portfolioId","assetId")
);

-- CreateTable
CREATE TABLE "CryptoPosition" (
    "portfolioId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION,

    CONSTRAINT "CryptoPosition_pkey" PRIMARY KEY ("portfolioId","assetId")
);

-- CreateTable
CREATE TABLE "StockTransaction" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "quantityChange" DOUBLE PRECISION NOT NULL,
    "pricePerUnit" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CryptoTransaction" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "quantityChange" DOUBLE PRECISION NOT NULL,
    "pricePerUnit" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CryptoTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StockTransaction_id_portfolioId_assetId_idx" ON "StockTransaction"("id", "portfolioId", "assetId");

-- CreateIndex
CREATE INDEX "CryptoTransaction_id_portfolioId_assetId_idx" ON "CryptoTransaction"("id", "portfolioId", "assetId");

-- Migrate data: positions
INSERT INTO "StockPosition" ("portfolioId", "assetId", "quantity", "price")
SELECT pa."portfolioId", pa."assetId", pa."quantity", pa."price"
FROM "PortfolioAsset" pa
JOIN "Asset" a ON a."id" = pa."assetId"
WHERE a."type" IS DISTINCT FROM 'CRYPTOCURRENCY';

INSERT INTO "CryptoPosition" ("portfolioId", "assetId", "quantity", "price")
SELECT pa."portfolioId", pa."assetId", pa."quantity", pa."price"
FROM "PortfolioAsset" pa
JOIN "Asset" a ON a."id" = pa."assetId"
WHERE a."type" = 'CRYPTOCURRENCY';

-- Migrate data: transactions
INSERT INTO "StockTransaction" ("id", "portfolioId", "assetId", "type", "quantityChange", "pricePerUnit", "date")
SELECT t."id", t."portfolioId", t."assetId", t."type", t."quantityChange", t."pricePerUnit", t."date"
FROM "Transaction" t
JOIN "Asset" a ON a."id" = t."assetId"
WHERE a."type" IS DISTINCT FROM 'CRYPTOCURRENCY';

INSERT INTO "CryptoTransaction" ("id", "portfolioId", "assetId", "type", "quantityChange", "pricePerUnit", "date")
SELECT t."id", t."portfolioId", t."assetId", t."type", t."quantityChange", t."pricePerUnit", t."date"
FROM "Transaction" t
JOIN "Asset" a ON a."id" = t."assetId"
WHERE a."type" = 'CRYPTOCURRENCY';

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT IF EXISTS "Transaction_portfolioId_assetId_fkey";

-- DropForeignKey
ALTER TABLE "PortfolioAsset" DROP CONSTRAINT IF EXISTS "PortfolioAsset_portfolioId_fkey";
ALTER TABLE "PortfolioAsset" DROP CONSTRAINT IF EXISTS "PortfolioAsset_assetId_fkey";

-- DropTable
DROP TABLE "Transaction";

-- DropTable
DROP TABLE "PortfolioAsset";

-- AddForeignKey
ALTER TABLE "StockPosition" ADD CONSTRAINT "StockPosition_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockPosition" ADD CONSTRAINT "StockPosition_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CryptoPosition" ADD CONSTRAINT "CryptoPosition_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CryptoPosition" ADD CONSTRAINT "CryptoPosition_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransaction" ADD CONSTRAINT "StockTransaction_portfolioId_assetId_fkey" FOREIGN KEY ("portfolioId", "assetId") REFERENCES "StockPosition"("portfolioId", "assetId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CryptoTransaction" ADD CONSTRAINT "CryptoTransaction_portfolioId_assetId_fkey" FOREIGN KEY ("portfolioId", "assetId") REFERENCES "CryptoPosition"("portfolioId", "assetId") ON DELETE RESTRICT ON UPDATE CASCADE;
