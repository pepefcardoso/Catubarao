import type { PrismaClient, BannerType } from "@repo/db";
import type { CreateAnnouncementBannerInput } from "@repo/schemas/banner";
import { NotFoundError } from "../../lib/errors";

export async function getActiveAnnouncements(
  db: PrismaClient,
  type?: BannerType
) {
  return db.announcementBanner.findMany({
    where: {
      isActive: true,
      ...(type ? { type } : {}),
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAdminAnnouncements(
  db: PrismaClient,
  options: {
    page?: number;
    limit?: number;
  } = {}
) {
  const { page = 1, limit = 50 } = options;
  const skip = (page - 1) * limit;

  const [banners, total] = await Promise.all([
    db.announcementBanner.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    db.announcementBanner.count(),
  ]);

  return { banners, total, page, limit };
}

export async function createAnnouncement(
  input: CreateAnnouncementBannerInput,
  db: PrismaClient
) {
  return db.announcementBanner.create({
    data: input,
  });
}

export async function updateAnnouncement(
  id: string,
  input: Partial<CreateAnnouncementBannerInput>,
  db: PrismaClient
) {
  const banner = await db.announcementBanner.findUnique({ where: { id } });
  if (!banner) {
    throw new NotFoundError("Banner not found");
  }

  return db.announcementBanner.update({
    where: { id },
    data: input,
  });
}

export async function deleteAnnouncement(id: string, db: PrismaClient) {
  const banner = await db.announcementBanner.findUnique({ where: { id } });
  if (!banner) {
    throw new NotFoundError("Banner not found");
  }

  return db.announcementBanner.update({
    where: { id },
    data: { isActive: false },
  });
}
