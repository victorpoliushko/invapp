-- CreateEnum
CREATE TYPE "MixedAssetType" AS ENUM ('REAL_ESTATE', 'APPS');

-- CreateTable
CREATE TABLE "MixedAssets" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "MixedAssetType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "MixedAssets_pkey" PRIMARY KEY ("id")
);
