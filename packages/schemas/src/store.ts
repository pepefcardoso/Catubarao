import { z } from "zod";
import { AddressSchema } from "./common";

export const StockTypeEnum = z.enum(["SOB_DEMANDA", "ESTOQUE_FIXO"]);
export const OrderStatusEnum = z.enum([
  "AGUARDANDO_PAGAMENTO",
  "PAGO",
  "EM_PRODUCAO",
  "ENVIADO",
  "ENTREGUE",
  "CANCELADO",
]);

export const CreateProductVariantSchema = z.object({
  sku: z.string().min(1),
  size: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  priceAdjustment: z.coerce.number().optional().default(0),
  stockQuantity: z.number().int().nonnegative().optional().nullable(),
  stockAlertThreshold: z.number().int().nonnegative().optional().nullable(),
  initialStockQuantity: z.number().int().nonnegative().optional().nullable(),
});

export const CreateProductSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(1).optional(),
  description: z.string().min(1),
  category: z.string().min(1),
  images: z.array(z.string().url()).default([]),
  basePrice: z.coerce.number().positive(),
  stockType: StockTypeEnum,
  membersOnly: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  variants: z.array(CreateProductVariantSchema).default([]),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;

export const UpdateProductSchema = CreateProductSchema.partial();

export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

export const ProductVariantResponseSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  sku: z.string(),
  size: z.string().nullable(),
  color: z.string().nullable(),
  priceAdjustment: z.coerce.number(),
  stockQuantity: z.number().nullable(),
  stockAlertThreshold: z.number().nullable(),
  initialStockQuantity: z.number().nullable(),
});

export type ProductVariantResponse = z.infer<typeof ProductVariantResponseSchema>;

export const ProductResponseSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  images: z.array(z.string()),
  basePrice: z.coerce.number(),
  stockType: StockTypeEnum,
  membersOnly: z.boolean(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  createdAt: z.union([z.string(), z.date()]).transform((v) => new Date(v)),
  updatedAt: z.union([z.string(), z.date()]).transform((v) => new Date(v)),
  variants: z.array(ProductVariantResponseSchema).optional(),
});

export type ProductResponse = z.infer<typeof ProductResponseSchema>;

export const CreateOrderItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional().nullable(),
  quantity: z.number().int().positive("Quantity must be positive"),
});


export const CreateOrderSchema = z.object({
  customerId: z.string().uuid().optional().nullable(),
  guestEmail: z.string().email().optional().nullable(),
  guestCpf: z
    .string()
    .regex(/^\d{11}$/, "CPF must be 11 digits, no formatting")
    .optional()
    .nullable(),
  shippingAddress: AddressSchema,
  items: z.array(CreateOrderItemSchema).min(1, "Order must have at least one item"),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export const OrderItemResponseSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  productId: z.string().uuid(),
  variantId: z.string().uuid().nullable(),
  quantity: z.number().int(),
  unitPrice: z.coerce.number(),
  product: ProductResponseSchema.optional(),
  variant: ProductVariantResponseSchema.optional(),
});

export type OrderItemResponse = z.infer<typeof OrderItemResponseSchema>;

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(["EM_PRODUCAO", "ENVIADO", "ENTREGUE"]),
  trackingCode: z.string().optional().nullable(),
});

export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;

export const OrderResponseSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid().nullable(),
  guestEmail: z.string().nullable(),
  guestCpf: z.string().nullable(),
  shippingAddress: z.any(),
  status: OrderStatusEnum,
  trackingCode: z.string().nullable(),
  total: z.coerce.number(),
  createdAt: z.union([z.string(), z.date()]).transform((v) => new Date(v)),
  updatedAt: z.union([z.string(), z.date()]).transform((v) => new Date(v)),
  items: z.array(OrderItemResponseSchema).optional(),
});

export type OrderResponse = z.infer<typeof OrderResponseSchema>;

export const CreateStockNotificationSchema = z.object({
  email: z.string().email(),
  variantId: z.string().uuid(),
});

export type CreateStockNotificationInput = z.infer<typeof CreateStockNotificationSchema>;
