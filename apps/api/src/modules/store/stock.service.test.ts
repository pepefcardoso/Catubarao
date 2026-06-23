import { describe, it, expect, beforeEach, vi } from "vitest";
import { decrementStock, incrementStock, checkStock } from "./stock.service";
import { PrismaClient } from "@repo/db";
import { ConflictError, NotFoundError } from "../../lib/errors";

const prisma = new PrismaClient();

describe("Stock Service", () => {
  beforeEach(async () => {
    // Clear existing
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
  });

  it("should decrement stock successfully", async () => {
    const product = await prisma.product.create({
      data: {
        name: "Test Shirt",
        description: "A nice shirt",
        category: "Clothing",
        basePrice: 100,
        stockType: "ESTOQUE_FIXO",
        stockQuantity: 10,
        stockAlertThreshold: 2,
      },
    });

    const variant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        sku: "SHIRT-M",
        size: "M",
      },
    });

    await decrementStock(product.id, 3, prisma);

    const check = await checkStock(product.id, prisma);
    expect(check).toBe(7);
  });

  it("should throw ConflictError on out of stock", async () => {
    const product = await prisma.product.create({
      data: {
        name: "Test Shirt",
        description: "A nice shirt",
        category: "Clothing",
        basePrice: 100,
        stockType: "ESTOQUE_FIXO",
        stockQuantity: 1,
      },
    });

    const variant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        sku: "SHIRT-S",
        size: "S",
      },
    });

    await expect(decrementStock(product.id, 2, prisma)).rejects.toThrow(ConflictError);
  });

  it("should enqueue alert email when stock hits threshold", async () => {
    const product = await prisma.product.create({
      data: {
        name: "Test Mug",
        description: "A nice mug",
        category: "Accessories",
        basePrice: 50,
        stockType: "ESTOQUE_FIXO",
        stockQuantity: 5,
        stockAlertThreshold: 2,
      },
    });

    const variant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        sku: "MUG-1",
      },
    });

    const queues = {
      email: {
        add: vi.fn(),
      },
    };

    // Decrement from 5 to 2
    await decrementStock(product.id, 3, prisma, queues);

    expect(queues.email.add).toHaveBeenCalledWith("send-email", expect.objectContaining({
      template: "LowStockEmail",
      subject: expect.stringContaining("Estoque baixo para Test Mug"),
    }));
  });

  it("should increment stock successfully", async () => {
    const product = await prisma.product.create({
      data: {
        name: "Test Hat",
        description: "A nice hat",
        category: "Accessories",
        basePrice: 30,
        stockType: "ESTOQUE_FIXO",
        stockQuantity: 0,
      },
    });

    const variant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        sku: "HAT-1",
      },
    });

    await incrementStock(product.id, 5, prisma);

    const check = await checkStock(product.id, prisma);
    expect(check).toBe(5);
  });

  it("should bypass checks for SOB_DEMANDA", async () => {
    const product = await prisma.product.create({
      data: {
        name: "Test Digital Art",
        description: "A nice art",
        category: "Digital",
        basePrice: 500,
        stockType: "SOB_DEMANDA",
      },
    });

    const variant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        sku: "ART-1",
      },
    });

    await decrementStock(product.id, 100, prisma);
    await incrementStock(product.id, 50, prisma);

    const check = await checkStock(product.id, prisma);
    expect(check).toBe(Number.POSITIVE_INFINITY);
  });
});
