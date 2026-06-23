import type { PrismaClient } from "@repo/db";
import { ConflictError, NotFoundError } from "../../lib/errors";

export async function decrementStock(
  variantId: string,
  quantity: number,
  db: PrismaClient,
  queues?: any,
) {
  await db.$transaction(async (tx) => {
    const variant = await tx.productVariant.findUnique({
      where: { id: variantId },
      select: { productId: true },
    });

    if (!variant) {
      throw new NotFoundError("Variant not found");
    }

    // Lock the product row
    const products: any[] = await tx.$queryRaw`
      SELECT id, "stockType", "stockQuantity", "stockAlertThreshold", "name"
      FROM products
      WHERE id = ${variant.productId}::uuid
      FOR UPDATE
    `;

    if (!products.length) {
      throw new NotFoundError("Product not found");
    }
    const product = products[0];

    if (product.stockType === "SOB_DEMANDA") {
      return;
    }

    const currentStock = product.stockQuantity === null ? 0 : Number(product.stockQuantity);

    if (currentStock < quantity) {
      throw new ConflictError("out_of_stock");
    }

    const updated = await tx.product.update({
      where: { id: product.id },
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
          subject: `[Alerta] Estoque baixo para ${updated.name}`,
          props: {
            productName: updated.name,
            productId: updated.id,
            currentStock: updated.stockQuantity,
            threshold: updated.stockAlertThreshold,
          },
        });
      }
    }
  });
}

export async function incrementStock(
  variantId: string,
  quantity: number,
  db: PrismaClient,
) {
  await db.$transaction(async (tx) => {
    const variant = await tx.productVariant.findUnique({
      where: { id: variantId },
      select: { productId: true },
    });

    if (!variant) {
      throw new NotFoundError("Variant not found");
    }

    const products: any[] = await tx.$queryRaw`
      SELECT id, "stockType"
      FROM products
      WHERE id = ${variant.productId}::uuid
      FOR UPDATE
    `;

    if (!products.length) {
      throw new NotFoundError("Product not found");
    }
    const product = products[0];

    if (product.stockType === "SOB_DEMANDA") {
      return;
    }

    const currentStock = product.stockQuantity === null ? 0 : Number(product.stockQuantity);

    await tx.product.update({
      where: { id: product.id },
      data: { stockQuantity: currentStock + quantity },
    });
  });
}

export async function checkStock(variantId: string, db: PrismaClient) {
  const variant = await db.productVariant.findUnique({
    where: { id: variantId },
    include: { product: true },
  });

  if (!variant) {
    throw new NotFoundError("Variant not found");
  }

  if (variant.product.stockType === "SOB_DEMANDA") {
    return Number.POSITIVE_INFINITY;
  }

  return variant.product.stockQuantity || 0;
}
