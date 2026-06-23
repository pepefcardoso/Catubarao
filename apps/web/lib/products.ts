import { apiFetch } from "./api";
import { ProductResponse } from "@repo/schemas/store";

export async function getProducts(): Promise<ProductResponse[]> {
  return apiFetch<ProductResponse[]>("/store/products", {
    next: {
      revalidate: 300, // 5 minutes
    },
  });
}

export async function getProductById(id: string): Promise<ProductResponse> {
  return apiFetch<ProductResponse>(`/store/products/${id}`, {
    next: {
      revalidate: 300, // 5 minutes
    },
  });
}
