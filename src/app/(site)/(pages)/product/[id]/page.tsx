import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById } from "@/services/productService";
import ProductDetails from "@/components/ProductDetails";

interface ProductPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const response = await getProductById(params.id);
    
    if (!response.success || !response.data.product) {
      return {
        title: "Ürün Bulunamadı",
        description: "Aradığınız ürün bulunamadı.",
      };
    }

    const product = response.data.product;

    return {
      title: `${product.name} | E-Ticaret`,
      description: product.description || `${product.name} ürün detayları`,
      openGraph: {
        title: product.name,
        description: product.description,
        images: product.images && product.images.length > 0 ? [product.images[0].url] : [],
      },
    };
  } catch (error) {
    return {
      title: "Ürün Detayları",
      description: "Ürün detayları yüklenirken hata oluştu.",
    };
  }
}

const ProductPage = async ({ params }: ProductPageProps) => {
  try {
    const response = await getProductById(params.id);
    
    if (!response.success || !response.data.product) {
      notFound();
    }

    return (
      <main>
        <ProductDetails product={response.data.product} />
      </main>
    );
  } catch (error) {
    console.error("Ürün yüklenirken hata:", error);
    notFound();
  }
};

export default ProductPage; 