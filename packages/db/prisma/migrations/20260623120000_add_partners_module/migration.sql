-- CreateEnum
CREATE TYPE "PartnerStatus" AS ENUM ('PROSPECT', 'ACTIVE', 'INACTIVE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DealType" AS ENUM ('FINANCEIRO', 'PERMUTA', 'MISTO');

-- CreateEnum
CREATE TYPE "DealStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DeliverableFrequency" AS ENUM ('UNICO', 'POR_JOGO', 'MENSAL');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('FOTO', 'PRINT_POST', 'LINK', 'NOTA');

-- CreateTable
CREATE TABLE "match_events" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "opponent" TEXT NOT NULL,
    "competition" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partners" (
    "id" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "tradeName" TEXT NOT NULL,
    "cnpj" TEXT,
    "segment" TEXT NOT NULL,
    "status" "PartnerStatus" NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sponsorship_deals" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "type" "DealType" NOT NULL,
    "financialValue" DECIMAL(65,30),
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "status" "DealStatus" NOT NULL,
    "ownerId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sponsorship_deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliverables" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "frequency" "DeliverableFrequency" NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "deliverables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_proofs" (
    "id" TEXT NOT NULL,
    "deliverableId" TEXT NOT NULL,
    "matchEventId" TEXT,
    "deliveredAt" DATE NOT NULL,
    "evidenceType" "EvidenceType" NOT NULL,
    "fileUrl" TEXT,
    "linkUrl" TEXT,
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivery_proofs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pending_deliveries" (
    "id" TEXT NOT NULL,
    "deliverableId" TEXT NOT NULL,
    "matchEventId" TEXT,
    "month" INTEGER,
    "year" INTEGER,
    "isFulfilled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pending_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sponsorship_deals_endDate_idx" ON "sponsorship_deals"("endDate");

-- AddForeignKey
ALTER TABLE "sponsorship_deals" ADD CONSTRAINT "sponsorship_deals_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsorship_deals" ADD CONSTRAINT "sponsorship_deals_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "sponsorship_deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_proofs" ADD CONSTRAINT "delivery_proofs_deliverableId_fkey" FOREIGN KEY ("deliverableId") REFERENCES "deliverables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_proofs" ADD CONSTRAINT "delivery_proofs_matchEventId_fkey" FOREIGN KEY ("matchEventId") REFERENCES "match_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_proofs" ADD CONSTRAINT "delivery_proofs_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pending_deliveries" ADD CONSTRAINT "pending_deliveries_deliverableId_fkey" FOREIGN KEY ("deliverableId") REFERENCES "deliverables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pending_deliveries" ADD CONSTRAINT "pending_deliveries_matchEventId_fkey" FOREIGN KEY ("matchEventId") REFERENCES "match_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
