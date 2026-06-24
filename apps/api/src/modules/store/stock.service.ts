import type { PrismaClient } from "@repo/db";
import { ConflictError, NotFoundError } from "../../lib/errors";

export async function decrementStock(
  productId: string,
  variantId: string | null | undefined,
  quantity: number,
  db: PrismaClient,
  queues?: any,
) {
  await db.$transaction(async (tx) => {
    let variants: any[];
    if (variantId) {
      variants = await tx.$queryRaw`
        SELECT v.id, p."stockType", v."stockQuantity", v."stockAlertThreshold", p."name", v."sku"
        FROM product_variants v
        JOIN products p ON p.id = v."productId"
        WHERE v.id = ${variantId}::uuid AND p.id = ${productId}::uuid
        FOR UPDATE
      `;
    } else {
      variants = await tx.$queryRaw`
        SELECT v.id, p."stockType", v."stockQuantity", v."stockAlertThreshold", p."name", v."sku"
        FROM product_variants v
        JOIN products p ON p.id = v."productId"
        WHERE p.id = ${productId}::uuid
        LIMIT 1
        FOR UPDATE
      `;
    }

    if (!variants.length) {
      // If no variants exist but product is ESTOQUE_FIXO, we can't fulfill it
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new NotFoundError("Product not found");
      if (product.stockType === "SOB_DEMANDA") return;
      throw new ConflictError("out_of_stock");
    }
    const variant = variants[0];

    if (variant.stockType === "SOB_DEMANDA") {
      return;
    }

    const currentStock = variant.stockQuantity === null ? 0 : Number(variant.stockQuantity);

    if (currentStock < quantity) {
      throw new ConflictError("out_of_stock");
    }

    const updated = await tx.productVariant.update({
      where: { id: variant.id },
      data: { stockQuantity: currentStock - quantity },
    });

    const crossedThreshold =
      updated.stockAlertThreshold !== null &&
      currentStock > updated.stockAlertThreshold &&
      updated.stockQuantity !== null &&
      updated.stockQuantity <= updated.stockAlertThreshold;

    if (crossedThreshold) {
      if (queues && queues.email) {
        await queues.email.add("send-email", {
          template: "LowStockEmail",
          to: "admin@catubarao.com.br",
          subject: `[Alerta] Estoque baixo para ${variant.name} (${variant.sku})`,
          props: {
            productName: variant.name,
            productId: productId,
            variantSku: variant.sku,
            currentStock: updated.stockQuantity,
            threshold: updated.stockAlertThreshold,
          },
        });
      }
    }
  });
}

export async function incrementStock(
  productId: string,
  variantId: string | null | undefined,
  quantity: number,
  db: PrismaClient,
) {
  await db.$transaction(async (tx) => {
    let variants: any[];
    if (variantId) {
      variants = await tx.$queryRaw`
        SELECT v.id, p."stockType", v."stockQuantity"
        FROM product_variants v
        JOIN products p ON p.id = v."productId"
        WHERE v.id = ${variantId}::uuid AND p.id = ${productId}::uuid
        FOR UPDATE
      `;
    } else {
      variants = await tx.$queryRaw`
        SELECT v.id, p."stockType", v."stockQuantity"
        FROM product_variants v
        JOIN products p ON p.id = v."productId"
        WHERE p.id = ${productId}::uuid
        LIMIT 1
        FOR UPDATE
      `;
    }

    if (!variants.length) return;
    const variant = variants[0];

    if (variant.stockType === "SOB_DEMANDA") {
      return;
    }

    const currentStock = variant.stockQuantity === null ? 0 : Number(variant.stockQuantity);

    await tx.productVariant.update({
      where: { id: variant.id },
      data: { stockQuantity: currentStock + quantity },
    });
  });
}

export async function checkStock(productId: string, variantId: string | null | undefined, db: PrismaClient) {
  const product = await db.product.findUnique({
    where: { id: productId },
    include: { variants: true },
  });

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  if (product.stockType === "SOB_DEMANDA") {
    return Number.POSITIVE_INFINITY;
  }

  let variant = null;
  if (variantId) {
    variant = product.variants.find(v => v.id === variantId);
  } else if (product.variants.length > 0) {
    variant = product.variants[0];
  }

  if (!variant) return 0;
  return variant.stockQuantity || 0;
}
