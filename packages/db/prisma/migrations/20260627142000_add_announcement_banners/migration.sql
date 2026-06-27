-- CreateEnum
CREATE TYPE "BannerType" AS ENUM ('ANNOUNCEMENT', 'BADGE', 'MILESTONE');

-- AlterTable
ALTER TABLE "announcement_banners" DROP COLUMN "description",
DROP COLUMN "logoUrl",
DROP COLUMN "milestone",
ADD COLUMN     "link" TEXT,
DROP COLUMN "type",
ADD COLUMN     "type" "BannerType" NOT NULL DEFAULT 'ANNOUNCEMENT';

-- DropEnum
DROP TYPE "BadgeType";

