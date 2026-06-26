-- CreateEnum
CREATE TYPE "TransparencyCategory" AS ENUM ('BALANCO_MENSAL', 'STATUS_DIVIDAS', 'ATA_ASSEMBLEIA', 'COMPOSICAO_SOCIETARIA', 'DOCUMENTO_SAF', 'OUTRO');

-- CreateEnum
CREATE TYPE "DebtStatus" AS ENUM ('EM_NEGOCIACAO', 'EM_DIA', 'ATRASADO', 'QUITADO');

-- CreateEnum
CREATE TYPE "BadgeType" AS ENUM ('ANNOUNCEMENT', 'BADGE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "GamificationEventType" ADD VALUE 'STREAK_24M';
ALTER TYPE "GamificationEventType" ADD VALUE 'STREAK_36M';
ALTER TYPE "GamificationEventType" ADD VALUE 'STREAK_60M';

-- AlterTable
ALTER TABLE "gamification_events" ADD COLUMN     "idempotencyKey" TEXT;

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "adimplenciaStreakMonths" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "adminNotes" TEXT,
ADD COLUMN     "isAnonymized" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastAdimplenciaResetAt" TIMESTAMP(3),
ADD COLUMN     "showOnLeaderboard" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "whatsappOptInDismissedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "membership_plans" ADD COLUMN     "accentColor" TEXT,
ADD COLUMN     "highlightLabel" TEXT,
ADD COLUMN     "marketingDescription" TEXT,
ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN     "initialStockQuantity" INTEGER,
ADD COLUMN     "stockAlertThreshold" INTEGER,
ADD COLUMN     "stockQuantity" INTEGER;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "stockAlertThreshold",
DROP COLUMN "stockQuantity";

-- AlterTable
ALTER TABLE "sponsorship_deals" ADD COLUMN     "cancellationReason" TEXT;

-- CreateTable
CREATE TABLE "gamification_rules" (
    "id" TEXT NOT NULL,
    "type" "GamificationEventType" NOT NULL,
    "points" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gamification_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_notifications" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_goals" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "metric" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dashboard_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transparency_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "TransparencyCategory" NOT NULL,
    "referenceMonth" INTEGER,
    "referenceYear" INTEGER,
    "body" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "scheduledFor" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "supersededById" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transparency_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debt_records" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "creditorName" TEXT NOT NULL,
    "creditorGroup" TEXT,
    "originalAmount" DECIMAL(65,30) NOT NULL,
    "negotiatedAmount" DECIMAL(65,30),
    "paidAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "status" "DebtStatus" NOT NULL,
    "publicNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debt_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debt_snapshots" (
    "id" TEXT NOT NULL,
    "totalOriginal" DECIMAL(65,30) NOT NULL,
    "totalNegotiated" DECIMAL(65,30) NOT NULL,
    "totalPaid" DECIMAL(65,30) NOT NULL,
    "totalRemaining" DECIMAL(65,30) NOT NULL,
    "snapshotDate" DATE NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "debt_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcement_banners" (
    "id" TEXT NOT NULL,
    "type" "BadgeType" NOT NULL DEFAULT 'ANNOUNCEMENT',
    "text" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'brand-primary',
    "milestone" INTEGER,
    "logoUrl" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcement_banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deal_alerts" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deal_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "memberId" TEXT,
    "performedBy" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_logs" (
    "id" TEXT NOT NULL,
    "memberId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "choices" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_notifications" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waitlist" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gamification_rules_type_key" ON "gamification_rules"("type");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_notifications_subscriptionId_type_key" ON "subscription_notifications"("subscriptionId", "type");

-- CreateIndex
CREATE INDEX "transparency_posts_category_publishedAt_idx" ON "transparency_posts"("category", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "debt_records_slug_key" ON "debt_records"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "deal_alerts_dealId_type_key" ON "deal_alerts"("dealId", "type");

-- CreateIndex
CREATE INDEX "audit_logs_memberId_idx" ON "audit_logs"("memberId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "stock_notifications_variantId_idx" ON "stock_notifications"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "waitlist_email_key" ON "waitlist"("email");

-- CreateIndex
CREATE UNIQUE INDEX "gamification_events_idempotencyKey_key" ON "gamification_events"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "members_referralCode_key" ON "members"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "membership_plans_slug_key" ON "membership_plans"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "payments_gatewayPaymentId_key" ON "payments"("gatewayPaymentId");

-- AddForeignKey
ALTER TABLE "subscription_notifications" ADD CONSTRAINT "subscription_notifications_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transparency_posts" ADD CONSTRAINT "transparency_posts_supersededById_fkey" FOREIGN KEY ("supersededById") REFERENCES "transparency_posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transparency_posts" ADD CONSTRAINT "transparency_posts_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt_snapshots" ADD CONSTRAINT "debt_snapshots_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deal_alerts" ADD CONSTRAINT "deal_alerts_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "sponsorship_deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_logs" ADD CONSTRAINT "consent_logs_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_notifications" ADD CONSTRAINT "stock_notifications_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

