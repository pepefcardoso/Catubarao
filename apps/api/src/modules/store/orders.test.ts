import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import fastify from "../../../server";
import { PrismaClient } from "@repo/db";
import { auth } from "../../../lib/auth";
import { mp } from "../../../lib/mercadopago";

const prisma = new PrismaClient();

vi.mock("../../../lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("../../../lib/mercadopago", () => ({
  mp: {
    preference: {
      create: vi.fn(),
    },
  },
}));

describe("Orders Routes", () => {
  beforeEach(async () => {
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.membershipPlan.deleteMany();
    await prisma.member.deleteMany();

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should allow guest to order non-membersOnly item", async () => {
    const product = await prisma.product.create({
      data: {
        name: "Guest Product",
        description: "Public product",
        category: "Test",
        basePrice: 100,
        stockType: "SOB_DEMANDA",
        membersOnly: false,
      },
    });

    // Mock MP preference
    (mp.preference.create as any).mockResolvedValue({ init_point: "https://mp.local/checkout" });
    // Mock no session
    (auth.api.getSession as any).mockResolvedValue(null);

    const res = await fastify.inject({
      method: "POST",
      url: "/store/orders",
      payload: {
        guestEmail: "guest@example.com",
        guestCpf: "12345678901",
        shippingAddress: {
          street: "Rua 1",
          number: "123",
          neighborhood: "Centro",
          city: "Tubarão",
          state: "SC",
          zipCode: "88700000",
        },
        items: [
          {
            productId: product.id,
            quantity: 2,
          },
        ],
      },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body).toHaveProperty("orderId");
    expect(body.checkoutUrl).toBe("https://mp.local/checkout");

    const order = await prisma.order.findUnique({
      where: { id: body.orderId },
      include: { items: true },
    });
    expect(order).not.toBeNull();
    expect(order!.status).toBe("AGUARDANDO_PAGAMENTO");
    expect(order!.total.toNumber()).toBe(200);
    expect(order!.items.length).toBe(1);
  });

  it("should return 403 when guest orders membersOnly item", async () => {
    const product = await prisma.product.create({
      data: {
        name: "Exclusive Product",
        description: "Members only",
        category: "Test",
        basePrice: 100,
        stockType: "SOB_DEMANDA",
        membersOnly: true,
      },
    });

    (auth.api.getSession as any).mockResolvedValue(null);

    const res = await fastify.inject({
      method: "POST",
      url: "/store/orders",
      payload: {
        guestEmail: "guest@example.com",
        guestCpf: "12345678901",
        shippingAddress: {
          street: "Rua 1",
          number: "123",
          neighborhood: "Centro",
          city: "Tubarão",
          state: "SC",
          zipCode: "88700000",
        },
        items: [
          {
            productId: product.id,
            quantity: 1,
          },
        ],
      },
    });

    expect(res.statusCode).toBe(403);
    expect(res.json().message).toBe("Apenas membros ativos podem comprar produtos exclusivos.");
  });

  it("should return 403 when member without active subscription orders membersOnly item", async () => {
    const member = await prisma.member.create({
      data: {
        id: "mem_1",
        name: "Inactive Member",
        email: "inactive@example.com",
        cpf: "09876543211",
      },
    });

    const product = await prisma.product.create({
      data: {
        name: "Exclusive Product",
        description: "Members only",
        category: "Test",
        basePrice: 100,
        stockType: "SOB_DEMANDA",
        membersOnly: true,
      },
    });

    (auth.api.getSession as any).mockResolvedValue({
      user: { id: member.id },
    });

    const res = await fastify.inject({
      method: "POST",
      url: "/store/orders",
      payload: {
        customerId: member.id,
        shippingAddress: {
          street: "Rua 1",
          number: "123",
          neighborhood: "Centro",
          city: "Tubarão",
          state: "SC",
          zipCode: "88700000",
        },
        items: [
          {
            productId: product.id,
            quantity: 1,
          },
        ],
      },
    });

    expect(res.statusCode).toBe(403);
  });

  it("should allow member with active subscription to order membersOnly item", async () => {
    const member = await prisma.member.create({
      data: {
        id: "mem_1",
        name: "Active Member",
        email: "active@example.com",
        cpf: "12312312312",
      },
    });

    const plan = await prisma.membershipPlan.create({
      data: {
        name: "Plan A",
        price: 50,
        interval: "MONTHLY",
        benefits: [],
      },
    });

    await prisma.subscription.create({
      data: {
        memberId: member.id,
        planId: plan.id,
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 86400000),
      },
    });

    const product = await prisma.product.create({
      data: {
        name: "Exclusive Product",
        description: "Members only",
        category: "Test",
        basePrice: 100,
        stockType: "SOB_DEMANDA",
        membersOnly: true,
      },
    });

    (mp.preference.create as any).mockResolvedValue({ init_point: "https://mp.local/checkout" });

    (auth.api.getSession as any).mockResolvedValue({
      user: { id: member.id },
    });

    const res = await fastify.inject({
      method: "POST",
      url: "/store/orders",
      payload: {
        customerId: member.id,
        shippingAddress: {
          street: "Rua 1",
          number: "123",
          neighborhood: "Centro",
          city: "Tubarão",
          state: "SC",
          zipCode: "88700000",
        },
        items: [
          {
            productId: product.id,
            quantity: 1,
          },
        ],
      },
    });

    expect(res.statusCode).toBe(201);
  });

  it("should return 409 when ESTOQUE_FIXO item is out of stock", async () => {
    const product = await prisma.product.create({
      data: {
        name: "Limited Item",
        description: "Limited",
        category: "Test",
        basePrice: 100,
        stockType: "ESTOQUE_FIXO",
        stockQuantity: 1,
        membersOnly: false,
      },
    });

    (auth.api.getSession as any).mockResolvedValue(null);

    const res = await fastify.inject({
      method: "POST",
      url: "/store/orders",
      payload: {
        guestEmail: "guest@example.com",
        guestCpf: "12345678901",
        shippingAddress: {
          street: "Rua 1",
          number: "123",
          neighborhood: "Centro",
          city: "Tubarão",
          state: "SC",
          zipCode: "88700000",
        },
        items: [
          {
            productId: product.id,
            quantity: 2, // Only 1 available
          },
        ],
      },
    });

    expect(res.statusCode).toBe(409);
    expect(res.json().message).toContain("Estoque insuficiente");
  });
});
