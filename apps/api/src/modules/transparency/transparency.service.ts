import type { PrismaClient, TransparencyCategory, DebtStatus } from "@repo/db";
import type { 
  CreateTransparencyPostInput,
  CreateDebtRecordInput,
  UpdateDebtRecordInput
} from "@repo/schemas/transparency";
import { ConflictError, NotFoundError } from "../../lib/errors";

export async function generateFeedXml(
  db: PrismaClient,
  category?: TransparencyCategory
): Promise<string> {
  const { posts } = await getPosts(db, { limit: 20, category });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tubarao.fc";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.tubarao.fc";
  const title = category ? `Portal de Transparência - ${category}` : "Portal de Transparência";
  const description = "Atualizações do Portal de Transparência do Clube Atlético Tubarão";

  const feedUrl = category
    ? `${apiUrl}/transparency/feed.xml?category=${category}`
    : `${apiUrl}/transparency/feed.xml`;

  const items = posts.map((post) => {
    const link = `${appUrl}/transparencia/${post.id}`;
    const pubDate = new Date(post.publishedAt).toUTCString();
    return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description><![CDATA[${post.body}]]></description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${title}</title>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    <link>${appUrl}/transparencia</link>
    <description>${description}</description>
    <language>pt-br</language>
${items}
  </channel>
</rss>`;
}

export async function getAdminPosts(
  db: PrismaClient,
  options: {
    page?: number;
    limit?: number;
  } = {}
) {
  const { page = 1, limit = 50 } = options;
  const skip = (page - 1) * limit;

  const where = {
    supersededById: null,
  };

  const [posts, total] = await Promise.all([
    db.transparencyPost.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
    }),
    db.transparencyPost.count({ where }),
  ]);

  return { posts, total, page, limit };
}

export async function getPosts(
  db: PrismaClient,
  options: {
    page?: number;
    limit?: number;
    category?: TransparencyCategory | TransparencyCategory[];
    referenceYear?: number;
    hasAttachment?: boolean;
  } = {}
) {
  const { page = 1, limit = 10, category, referenceYear, hasAttachment } = options;
  const skip = (page - 1) * limit;

  const where: any = {
    isArchived: false,
    supersededById: null,
    OR: [
      { scheduledFor: null },
      { scheduledFor: { lte: new Date() } }
    ],
    ...(category ? { category: Array.isArray(category) ? { in: category } : category } : {}),
    ...(referenceYear ? { referenceYear } : {}),
    ...(hasAttachment ? { attachmentUrl: { not: null } } : {}),
  };

  const [posts, total] = await Promise.all([
    db.transparencyPost.findMany({
      where,
      skip,
      take: limit,
      orderBy: { publishedAt: "desc" },
    }),
    db.transparencyPost.count({ where }),
  ]);

  return { posts, total, page, limit };
}

export async function getPostById(id: string, db: PrismaClient) {
  const post = await db.transparencyPost.findUnique({
    where: { id },
  });

  if (!post) {
    throw new NotFoundError("Post not found");
  }

  const backwardChain = [];
  let currentPost = await db.transparencyPost.findUnique({
    where: { id },
    include: { versions: { select: { id: true, version: true, publishedAt: true } } },
  });
  
  while (currentPost && currentPost.versions && currentPost.versions.length > 0) {
    const older = currentPost.versions[0];
    backwardChain.push(older);
    currentPost = await db.transparencyPost.findUnique({
      where: { id: older.id },
      include: { versions: { select: { id: true, version: true, publishedAt: true } } },
    });
  }

  const forwardChain = [];
  let forwardCurrent = post;
  while (forwardCurrent.supersededById) {
    const newer = await db.transparencyPost.findUnique({
      where: { id: forwardCurrent.supersededById },
      select: { id: true, version: true, supersededById: true, publishedAt: true },
    });
    if (!newer) break;
    forwardChain.push({ id: newer.id, version: newer.version, publishedAt: newer.publishedAt });
    forwardCurrent = newer as any;
  }

  backwardChain.reverse();
  const versionChain = [
    ...backwardChain,
    { id: post.id, version: post.version, publishedAt: post.publishedAt },
    ...forwardChain,
  ];

  return {
    ...post,
    versionChain,
  };
}

export async function createPost(
  input: CreateTransparencyPostInput,
  userId: string,
  db: PrismaClient,
  queues: any
) {
  if (input.category === "BALANCO_MENSAL" && input.referenceMonth && input.referenceYear) {
    const existing = await db.transparencyPost.findFirst({
      where: {
        category: "BALANCO_MENSAL",
        referenceMonth: input.referenceMonth,
        referenceYear: input.referenceYear,
        isArchived: false,
        supersededById: null,
      },
    });

    if (existing) {
      throw new ConflictError("A BALANCO_MENSAL post for this month/year already exists.");
    }
  }

  const post = await db.transparencyPost.create({
    data: {
      ...input,
      supersededById: null,
      createdBy: userId,
      version: 1,
    },
  });

  if (post.scheduledFor) {
    const delay = Math.max(0, new Date(post.scheduledFor).getTime() - Date.now());
    await queues.scheduled.add(
      "publish-scheduled-post",
      { postId: post.id },
      { delay, jobId: `publish-post-${post.id}` }
    );
  }

  return post;
}

export async function updatePost(
  id: string,
  input: CreateTransparencyPostInput,
  userId: string,
  db: PrismaClient,
  queues: any
) {
  let oldPostScheduledFor: Date | null = null;

  const newPost = await db.$transaction(async (tx) => {
    const oldPost = await tx.transparencyPost.findUnique({
      where: { id },
    });

    if (!oldPost) {
      throw new NotFoundError("Post not found");
    }

    if (oldPost.isArchived) {
      throw new ConflictError("Cannot update an archived post");
    }

    oldPostScheduledFor = oldPost.scheduledFor;

    if (oldPost.supersededById) {
      throw new ConflictError("Cannot update a superseded post");
    }

    if (input.category === "BALANCO_MENSAL" && input.referenceMonth && input.referenceYear) {
      const existing = await tx.transparencyPost.findFirst({
        where: {
          category: "BALANCO_MENSAL",
          referenceMonth: input.referenceMonth,
          referenceYear: input.referenceYear,
          isArchived: false,
          supersededById: null,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictError("A BALANCO_MENSAL post for this month/year already exists.");
      }
    }

    const newPost = await tx.transparencyPost.create({
      data: {
        ...input,
        supersededById: null,
        version: oldPost.version + 1,
        createdBy: userId,
      },
    });

    await tx.transparencyPost.update({
      where: { id: oldPost.id },
      data: { supersededById: newPost.id },
    });

    return newPost;
  });

  if (oldPostScheduledFor) {
    await queues.scheduled.remove(`publish-post-${id}`);
  }

  if (newPost.scheduledFor) {
    const delay = Math.max(0, new Date(newPost.scheduledFor).getTime() - Date.now());
    await queues.scheduled.add(
      "publish-scheduled-post",
      { postId: newPost.id },
      { delay, jobId: `publish-post-${newPost.id}` }
    );
  }

  return newPost;
}

export async function archivePost(id: string, db: PrismaClient, queues: any) {
  const post = await db.transparencyPost.findUnique({ where: { id } });
  if (!post) {
    throw new NotFoundError("Post not found");
  }

  const archived = await db.transparencyPost.update({
    where: { id },
    data: { isArchived: true },
  });

  if (archived.scheduledFor) {
    await queues.scheduled.remove(`publish-post-${id}`);
  }

  return archived;
}

export async function getDebts(db: PrismaClient) {
  const debts = await db.debtRecord.findMany({
    orderBy: { createdAt: "desc" },
  });

  const grouped = debts.reduce(
    (acc, debt) => {
      const status = debt.status;
      if (!acc[status]) acc[status] = [];
      acc[status].push(debt);
      return acc;
    },
    {} as Record<DebtStatus, typeof debts>
  );

  return grouped;
}

export async function getDebtSnapshots(db: PrismaClient) {
  return db.debtSnapshot.findMany({
    orderBy: { snapshotDate: "asc" },
  });
}

function slugify(text: string) {
  return text.toString().toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export async function getDebtBySlug(slug: string, db: PrismaClient) {
  const debt = await db.debtRecord.findUnique({ where: { slug } });
  if (!debt) {
    throw new NotFoundError("Debt record not found");
  }
  return debt;
}

export async function createDebtRecord(
  input: CreateDebtRecordInput,
  db: PrismaClient
) {
  const slug = input.slug || slugify(input.creditorName);
  
  const existing = await db.debtRecord.findUnique({ where: { slug } });
  if (existing) {
    throw new ConflictError("Slug already in use");
  }

  return db.debtRecord.create({
    data: {
      ...input,
      slug,
    },
  });
}

export async function updateDebtRecord(
  id: string,
  input: UpdateDebtRecordInput,
  db: PrismaClient
) {
  const debt = await db.debtRecord.findUnique({ where: { id } });
  if (!debt) {
    throw new NotFoundError("Debt record not found");
  }

  if (input.slug && input.slug !== debt.slug) {
    const existing = await db.debtRecord.findUnique({ where: { slug: input.slug } });
    if (existing) {
      throw new ConflictError("Slug already in use");
    }
  }

  return db.debtRecord.update({
    where: { id },
    data: input,
  });
}

export async function createDebtSnapshot(db: PrismaClient, userId?: string) {
  return db.$transaction(async (tx) => {
    const debts = await tx.debtRecord.findMany();

    let totalOriginal = 0;
    let totalNegotiated = 0;
    let totalPaid = 0;
    let totalRemaining = 0;

    for (const debt of debts) {
      const original = Number(debt.originalAmount);
      const hasNegotiated = debt.negotiatedAmount != null;
      const negotiated = hasNegotiated ? Number(debt.negotiatedAmount) : 0;
      const paid = Number(debt.paidAmount);

      totalOriginal += original;
      if (hasNegotiated) {
        totalNegotiated += negotiated;
        totalRemaining += Math.max(0, negotiated - paid);
      } else {
        totalRemaining += Math.max(0, original - paid);
      }
      totalPaid += paid;
    }

    return tx.debtSnapshot.create({
      data: {
        totalOriginal,
        totalNegotiated,
        totalPaid,
        totalRemaining,
        snapshotDate: new Date(),
        createdBy: userId,
      },
    });
  });
}



const MILESTONES = [25, 50, 75, 100] as const;

export async function checkAndCreateMilestoneBanner(
  snapshot: { totalPaid: any; totalOriginal: any },
  db: PrismaClient
) {
  const pctPaid = snapshot.totalOriginal.isZero()
    ? 0
    : snapshot.totalPaid.div(snapshot.totalOriginal).mul(100).toNumber();

  for (const milestone of MILESTONES) {
    if (pctPaid < milestone) continue;

    const already = await db.announcementBanner.findFirst({
      where: { link: String(milestone), type: "MILESTONE" },
    });
    if (already) continue;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await db.announcementBanner.create({
      data: {
        text: `🎉 O Tubarão já pagou ${milestone}% da dívida total!`,
        color: "brand-primary",
        link: String(milestone),
        type: "MILESTONE",
        expiresAt,
      },
    });
  }
}
