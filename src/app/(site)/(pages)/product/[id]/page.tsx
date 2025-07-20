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
        title: "Ürün Bulunamadı | Pazarcık",
        description: "Aradığınız ürün bulunamadı. Pazarcık'ta binlerce ürün arasından size uygun olanı bulun.",
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const product = response.data.product;
    const hasDiscount = product.salePrice && product.salePrice < product.price;
    const discountPercentage = hasDiscount 
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;

    return {
      title: `${product.name} | Pazarcık`,
      description: product.description || `${product.name} - ${product.category.name} kategorisinde kaliteli ürün. ${hasDiscount ? `%${discountPercentage} indirimle` : ''} uygun fiyatlarla Pazarcık'ta.`,
      keywords: [
        product.name,
        product.category.name,
        "online alışveriş",
        "e-ticaret",
        "pazarcık",
        ...(product.tags || [])
      ],
      openGraph: {
        title: product.name,
        description: product.description || `${product.name} ürün detayları`,
        type: "website",
        locale: "tr_TR",
        url: `/product/${product._id}`,
        siteName: "Pazarcık",
        images: product.images && product.images.length > 0 ? [
          {
            url: product.images[0].url,
            width: 800,
            height: 800,
            alt: product.name,
          }
        ] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: product.name,
        description: product.description || `${product.name} ürün detayları`,
        images: product.images && product.images.length > 0 ? [product.images[0].url] : [],
      },
      alternates: {
        canonical: `/product/${product._id}`,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  } catch (error) {
    return {
      title: "Ürün Detayları | Pazarcık",
      description: "Ürün detayları yüklenirken hata oluştu. Lütfen daha sonra tekrar deneyin.",
      robots: {
        index: false,
        follow: false,
      },
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
      <main className="min-h-screen">
        <ProductDetails product={response.data.product} />
      </main>
    );
  } catch (error) {
    console.error("Ürün yüklenirken hata:", error);
    notFound();
  }
};

export default ProductPage; 