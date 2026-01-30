-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE');
CREATE TYPE "CategoryGroup" AS ENUM ('CASA','ALIMENTACAO','TRANSPORTE_CARRO','CRIANCAS_ESCOLA','LAZER_ENTRETENIMENTO','ASSINATURAS','PROFISSIONAL','SAUDE','OUTROS');
CREATE TYPE "AssetType" AS ENUM ('STOCK','FII','CRYPTO','FIXED_INCOME','OTHER');
CREATE TYPE "InvestmentMovementType" AS ENUM ('BUY','SELL','DIVIDEND');

-- CreateTable
CREATE TABLE "User" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "username" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

CREATE TABLE "Category" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID,
  "name" TEXT NOT NULL,
  "group" "CategoryGroup" NOT NULL,
  "icon" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Category_name_userId_key" ON "Category"("name", "userId");

CREATE TABLE "Transaction" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "type" "TransactionType" NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "categoryId" UUID NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InvestmentAsset" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "symbolOrName" TEXT NOT NULL,
  "assetType" "AssetType" NOT NULL,
  "quantity" DECIMAL(18,4) NOT NULL,
  "avgPrice" DECIMAL(18,4) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InvestmentAsset_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InvestmentMovement" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "assetId" UUID NOT NULL,
  "type" "InvestmentMovementType" NOT NULL,
  "quantity" DECIMAL(18,4) NOT NULL,
  "price" DECIMAL(18,4) NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InvestmentMovement_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Category" ADD CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InvestmentAsset" ADD CONSTRAINT "InvestmentAsset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InvestmentMovement" ADD CONSTRAINT "InvestmentMovement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InvestmentMovement" ADD CONSTRAINT "InvestmentMovement_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "InvestmentAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
