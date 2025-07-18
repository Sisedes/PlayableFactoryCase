import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/services/categoryService";
import ProductListing from "@/components/ProductListing";

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  try {
    const response = await getCategoryBySlug(params.slug);
    
    if (!response.success || !response.data) {
      return {
        title: "Kategori Bulunamadı",
        description: "Aradığınız kategori bulunamadı.",
      };
    }

    const category = response.data;

    return {
      title: `${category.name} | E-Ticaret`,
      description: category.description || `${category.name} kategorisindeki ürünleri keşfedin.`,
      openGraph: {
        title: category.name,
        description: category.description,
        images: category.image ? [category.image] : [],
      },
    };
  } catch (error) {
    return {
      title: "Kategori",
      description: "Kategori sayfası yüklenirken hata oluştu.",
    };
  }
}

const CategoryPage = async ({ params }: CategoryPageProps) => {
  try {
    const response = await getCategoryBySlug(params.slug);
    
    if (!response.success || !response.data) {
      notFound();
    }

    return (
      <main>
        <ProductListing categorySlug={params.slug} />
      </main>
    );
  } catch (error) {
    console.error("Kategori yüklenirken hata:", error);
    notFound();
  }
};

export default CategoryPage; 