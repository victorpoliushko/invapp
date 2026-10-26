-- CreateTable
CREATE TABLE "BondTransaction" (
    "id" TEXT NOT NULL,
    "bondId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "pricePerUnit" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BondTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BondTransaction_bondId_idx" ON "BondTransaction"("bondId");

-- AddForeignKey
ALTER TABLE "BondTransaction" ADD CONSTRAINT "BondTransaction_bondId_fkey" FOREIGN KEY ("bondId") REFERENCES "Bond"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: each existing bond becomes a single BUY of its current holding
INSERT INTO "BondTransaction" ("id", "bondId", "type", "quantity", "pricePerUnit", "date")
SELECT gen_random_uuid()::text, "id", 'BUY', "quantity", "purchasePrice", "purchaseDate"
FROM "Bond"
WHERE "quantity" > 0;
