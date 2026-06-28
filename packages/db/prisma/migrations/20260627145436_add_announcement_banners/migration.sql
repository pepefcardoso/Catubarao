/*
  Warnings:

  - You are about to drop the column `description` on the `announcement_banners` table. All the data in the column will be lost.
  - You are about to drop the column `logoUrl` on the `announcement_banners` table. All the data in the column will be lost.
  - You are about to drop the column `milestone` on the `announcement_banners` table. All the data in the column will be lost.
  - The `type` column on the `announcement_banners` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `slug` on table `products` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "BannerType" AS ENUM ('ANNOUNCEMENT', 'BADGE', 'MILESTONE');

-- AlterTable
ALTER TABLE "announcement_banners" DROP COLUMN "description",
DROP COLUMN "logoUrl",
DROP COLUMN "milestone",
ADD COLUMN     "link" TEXT,
DROP COLUMN "type",
ADD COLUMN     "type" "BannerType" NOT NULL DEFAULT 'ANNOUNCEMENT';

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "slug" SET NOT NULL;

-- DropEnum
DROP TYPE "BadgeType";
