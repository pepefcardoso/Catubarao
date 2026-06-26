import type { PrismaClient } from "@repo/db";
import type { CreateProductInput, UpdateProductInput } from "@repo/schemas/store";
import { NotFoundError, ConflictError } from "../../lib/errors";

export function generateSlug(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function listProducts(db: PrismaClient, isFeatured?: boolean) {
  return db.product.findMany({
    where: {
      isActive: true,
      ...(isFeatured !== undefined ? { isFeatured } : {}),
    },
    include: { variants: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function listAdminProducts(db: PrismaClient) {
  return db.product.findMany({
    include: { variants: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductByIdOrSlug(identifier: string, db: PrismaClient) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

  const product = await db.product.findFirst({
    where: isUuid ? { id: identifier } : { slug: identifier },
    include: { variants: true },
  });

  if (!product || !product.isActive) {
    throw new NotFoundError("Product not found");
  }

  return product;
}

export async function createProduct(input: CreateProductInput, db: PrismaClient) {
  const slug = input.slug || generateSlug(input.name);

  try {
    return await db.product.create({
      data: {
        name: input.name,
        slug,
        description: input.description,
        category: input.category,
        images: input.images,
        basePrice: input.basePrice,
        stockType: input.stockType,
        membersOnly: input.membersOnly,
        isActive: input.isActive,
        isFeatured: input.isFeatured,
        variants: {
          create: input.variants,
        },
      },
      include: { variants: true },
    });
  } catch (error: any) {
    if (error.code === "P2002" && error.meta?.target?.includes("slug")) {
      throw new ConflictError("Product slug already exists");
    }
    throw error;
  }
}

export async function updateProduct(id: string, input: UpdateProductInput, db: PrismaClient) {
  const product = await db.product.findUnique({ where: { id } });
  if (!product) {
    throw new NotFoundError("Product not found");
  }

  const { variants, ...productData } = input;

  try {
    return await db.$transaction(async (tx) => {
    const updatedProduct = await tx.product.update({
      where: { id },
      data: productData,
      include: { variants: true },
    });

    if (variants) {
      const inputSkus = variants.map((v) => v.sku);

      // Check if deleted variants are referenced by open orders
      const deletedVariants = await tx.productVariant.findMany({
        where: {
          productId: id,
          sku: { notIn: inputSkus },
        },
      });

      if (deletedVariants.length > 0) {
        const deletedVariantIds = deletedVariants.map((v) => v.id);
        const openOrdersCount = await tx.orderItem.count({
          where: {
            variantId: { in: deletedVariantIds },
            order: {
              status: {
                in: ["AGUARDANDO_PAGAMENTO", "PAGO", "EM_PRODUCAO", "ENVIADO"],
              },
            },
          },
        });

        if (openOrdersCount > 0) {
          throw new ConflictError("Cannot remove variants that have open orders");
        }

        await tx.productVariant.deleteMany({
          where: {
            id: { in: deletedVariantIds },
          },
        });
      }

      // Upsert provided variants
      for (const variant of variants) {
        await tx.productVariant.upsert({
          where: { sku: variant.sku },
          create: {
            productId: id,
            sku: variant.sku,
            size: variant.size,
            color: variant.color,
            priceAdjustment: variant.priceAdjustment,
            stockQuantity: variant.stockQuantity,
            stockAlertThreshold: variant.stockAlertThreshold,
            initialStockQuantity: variant.initialStockQuantity,
          },
          update: {
            size: variant.size,
            color: variant.color,
            priceAdjustment: variant.priceAdjustment,
            stockQuantity: variant.stockQuantity,
            stockAlertThreshold: variant.stockAlertThreshold,
            initialStockQuantity: variant.initialStockQuantity,
          },
        });
      }
    }

    return tx.product.findUnique({
      where: { id },
      include: { variants: true },
    });
  });
  } catch (error: any) {
    if (error.code === "P2002" && error.meta?.target?.includes("slug")) {
      throw new ConflictError("Product slug already exists");
    }
    throw error;
  }
}

export async function deleteProduct(id: string, db: PrismaClient) {
  const product = await db.product.findUnique({ where: { id } });
  if (!product) {
    throw new NotFoundError("Product not found");
  }

  const openOrdersCount = await db.orderItem.count({
    where: {
      productId: id,
      order: {
        status: {
          in: ["AGUARDANDO_PAGAMENTO", "PAGO", "EM_PRODUCAO", "ENVIADO"],
        },
      },
    },
  });

  if (openOrdersCount > 0) {
    throw new ConflictError("Cannot deactivate product with open orders");
  }

  return db.product.update({
    where: { id },
    data: { isActive: false },
    include: { variants: true },
  });
}
