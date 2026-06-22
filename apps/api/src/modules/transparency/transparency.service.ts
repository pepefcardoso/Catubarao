import type { PrismaClient, TransparencyCategory } from "@repo/db";
import type { CreateTransparencyPostInput } from "@repo/schemas/transparency";
import { ConflictError, NotFoundError } from "../../lib/errors";

export async function getPosts(
  db: PrismaClient,
  options: {
    page?: number;
    limit?: number;
    category?: TransparencyCategory;
    referenceYear?: number;
  } = {}
) {
  const { page = 1, limit = 10, category, referenceYear } = options;
  const skip = (page - 1) * limit;

  const where = {
    isArchived: false,
    supersededById: null,
    ...(category ? { category } : {}),
    ...(referenceYear ? { referenceYear } : {}),
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

  return post;
}

export async function createPost(
  input: CreateTransparencyPostInput,
  userId: string,
  db: PrismaClient
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

  return db.transparencyPost.create({
    data: {
      ...input,
      supersededById: null,
      createdBy: userId,
      version: 1,
    },
  });
}

export async function updatePost(
  id: string,
  input: CreateTransparencyPostInput,
  userId: string,
  db: PrismaClient
) {
  return db.$transaction(async (tx) => {
    const oldPost = await tx.transparencyPost.findUnique({
      where: { id },
    });

    if (!oldPost) {
      throw new NotFoundError("Post not found");
    }

    if (oldPost.isArchived) {
      throw new ConflictError("Cannot update an archived post");
    }

    if (oldPost.supersededById) {
      throw new ConflictError("Cannot update a superseded post");
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
}

export async function archivePost(id: string, db: PrismaClient) {
  const post = await db.transparencyPost.findUnique({ where: { id } });
  if (!post) {
    throw new NotFoundError("Post not found");
  }

  return db.transparencyPost.update({
    where: { id },
    data: { isArchived: true },
  });
}
