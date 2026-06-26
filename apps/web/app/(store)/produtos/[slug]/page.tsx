import { getProductByIdOrSlug } from "@/lib/products";
import { ProductClient } from "./product-client";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: ProductPageProps): Promise<Metadata> {
  try {
    const params = await props.params;
    const product = await getProductByIdOrSlug(params.slug);
    return {
      title: `${product.name} | Loja Oficial Tubarão`,
      description: product.description,
    };
  } catch (error) {
    return {
      title: "Produto não encontrado",
    };
  }
}

export default async function ProductPage(props: ProductPageProps) {
  try {
    const params = await props.params;
    const product = await getProductByIdOrSlug(params.slug);

    if (product.slug && product.slug !== params.slug) {
      redirect(`/produtos/${product.slug}`);
    }

    return (
      <div className="container py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductClient product={product} />
      </div>
    );
  } catch (error) {
    notFound();
  }
}
