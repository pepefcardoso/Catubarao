import { getProducts } from "@/lib/products";
import { ProductCard } from "./components/product-card";
import { CategoryFilter } from "./components/category-filter";
import { SortFilter } from "./components/sort-filter";
import { EmptyState } from "./components/empty-state";
import { ShoppingBag } from "lucide-react";

export const metadata = {
  title: "Loja | Clube Atlético Tubarão",
  description: "Produtos oficiais do Clube Atlético Tubarão",
};

interface StorePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function StorePage(props: StorePageProps) {
  const searchParams = await props.searchParams;
  const categoryParam = typeof searchParams.category === "string" ? searchParams.category : undefined;
  const sortParam = typeof searchParams.sort === "string" ? searchParams.sort : "relevance";

  const products = await getProducts();

  // Extract unique categories
  const categories = Array.from(new Set(products.map((p) => p.category))).sort();

  // Filter products
  let filteredProducts = products;
  if (categoryParam) {
    filteredProducts = filteredProducts.filter((p) => p.category === categoryParam);
  }

  // Sort products
  if (sortParam === "price-asc") {
    filteredProducts.sort((a, b) => a.basePrice - b.basePrice);
  } else if (sortParam === "price-desc") {
    filteredProducts.sort((a, b) => b.basePrice - a.basePrice);
  } else {
    // "relevance" - let's say newest first (which is the default from the API)
    // Actually the API returns ordered by createdAt desc. We can just leave it or explicitly sort.
    filteredProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return (
    <div className="container py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 border-b pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">Loja Oficial</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Vista a paixão pelo Tubarão com nossos produtos exclusivos.
          </p>
        </div>
        
        <SortFilter />
      </div>

      <CategoryFilter categories={categories} />

      {filteredProducts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
