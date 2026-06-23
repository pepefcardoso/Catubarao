import type { PrismaClient } from "@repo/db";
import { ConflictError, ForbiddenError, NotFoundError } from "../../lib/errors";
import { checkStock } from "./stock.service";
import type { CreateOrderInput } from "@repo/schemas/store";
import { mp } from "../../lib/mercadopago";
import { env } from "../../lib/env";

export async function createOrder(
  input: CreateOrderInput,
  authenticatedMemberId: string | undefined,
  db: PrismaClient,
  queues: any
) {
  const memberId = input.customerId || authenticatedMemberId;
  
  if (input.customerId && input.customerId !== authenticatedMemberId) {
    throw new ForbiddenError("Invalid customerId");
  }

  let total = 0;

  const productIds = input.items.map(i => i.productId);
  const products = await db.product.findMany({
    where: { id: { in: productIds } }
  });

  const variantIds = input.items.map(i => i.variantId).filter(Boolean) as string[];
  const variants = variantIds.length > 0 ? await db.productVariant.findMany({
    where: { id: { in: variantIds } }
  }) : [];

  const productMap = new Map(products.map(p => [p.id, p]));
  const variantMap = new Map(variants.map(v => [v.id, v]));

  // Verify all products exist and are active
  const hasMembersOnly = input.items.some(i => {
    const p = productMap.get(i.productId);
    return p?.membersOnly;
  });

  if (hasMembersOnly) {
    if (!memberId) {
      throw new ForbiddenError("Apenas membros ativos podem comprar produtos exclusivos.");
    }
    const hasActiveSub = await db.subscription.findFirst({
      where: { memberId, status: "ACTIVE" }
    });
    if (!hasActiveSub) {
      throw new ForbiddenError("Apenas membros ativos podem comprar produtos exclusivos.");
    }
  }

  // Validate items and calculate total
  for (const item of input.items) {
    const product = productMap.get(item.productId);
    if (!product) throw new NotFoundError(`Produto não encontrado: ${item.productId}`);
    if (!product.isActive) throw new ConflictError(`Produto inativo: ${product.name}`);

    if (item.variantId) {
      const variant = variantMap.get(item.variantId);
      if (!variant) throw new NotFoundError(`Variante não encontrada: ${item.variantId}`);
    }

    if (product.stockType === "ESTOQUE_FIXO") {
      const stock = await checkStock(product.id, db);
      if (stock < item.quantity) {
        throw new ConflictError(`Estoque insuficiente para o produto: ${product.name}`);
      }
    }

    const basePrice = Number(product.basePrice);
    const priceAdjustment = item.variantId ? Number(variantMap.get(item.variantId)?.priceAdjustment || 0) : 0;
    const unitPrice = basePrice + priceAdjustment;
    total += unitPrice * item.quantity;
  }

  const order = await db.$transaction(async (tx) => {
    return tx.order.create({
      data: {
        customerId: memberId || null,
        guestEmail: input.guestEmail,
        guestCpf: input.guestCpf,
        shippingAddress: input.shippingAddress as any,
        status: "AGUARDANDO_PAGAMENTO",
        total,
        items: {
          create: input.items.map(item => {
            const product = productMap.get(item.productId)!;
            const priceAdjustment = item.variantId ? Number(variantMap.get(item.variantId)?.priceAdjustment || 0) : 0;
            return {
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              unitPrice: Number(product.basePrice) + priceAdjustment,
            };
          })
        }
      }
    });
  });

  const mpItems = input.items.map(item => {
    const product = productMap.get(item.productId)!;
    const priceAdjustment = item.variantId ? Number(variantMap.get(item.variantId)?.priceAdjustment || 0) : 0;
    return {
      id: item.productId,
      title: product.name,
      quantity: item.quantity,
      unit_price: Number(product.basePrice) + priceAdjustment,
      currency_id: "BRL"
    };
  });

  const preferenceData: any = {
    items: mpItems,
    external_reference: order.id,
    back_urls: {
      success: `${env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/success?order_id=${order.id}`,
      failure: `${env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/failure?order_id=${order.id}`,
      pending: `${env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/pending?order_id=${order.id}`,
    },
    auto_return: "approved",
  };

  if (input.guestEmail) {
    preferenceData.payer = { email: input.guestEmail };
  } else if (memberId) {
    const member = await db.member.findUnique({ where: { id: memberId } });
    if (member?.email) {
      preferenceData.payer = { email: member.email };
    }
  }

  const preference = await mp.preference.create(preferenceData);

  if (queues && queues.scheduled) {
    await queues.scheduled.add(
      "cancel-abandoned-order",
      { orderId: order.id },
      { delay: 30 * 60 * 1000 }
    );
  }

  return {
    orderId: order.id,
    checkoutUrl: preference.init_point,
    preferenceId: preference.id
  };
}

export async function updateOrderStatus(
  orderId: string,
  input: { status: "EM_PRODUCAO" | "ENVIADO" | "ENTREGUE"; trackingCode?: string | null },
  db: PrismaClient,
  queues: any
) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { customer: true }
  });

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  const updatedOrder = await db.order.update({
    where: { id: orderId },
    data: {
      status: input.status,
      ...(input.trackingCode !== undefined ? { trackingCode: input.trackingCode } : {})
    }
  });

  if (input.status === "ENVIADO" && order.status !== "ENVIADO") {
    const customerEmail = order.guestEmail || order.customer?.email;
    if (customerEmail && queues && queues.email) {
      await queues.email.add("send-email", {
        to: customerEmail,
        template: "OrderShippedEmail",
        subject: "Seu pedido foi enviado - Clube Atlético Tubarão",
        props: {
          orderId: order.id,
          trackingCode: updatedOrder.trackingCode
        }
      });
    }
  }

  return updatedOrder;
}
