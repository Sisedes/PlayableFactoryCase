import React from "react";
import ShopWithSidebar from "@/components/ShopWithSidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ürün Mağazası | Pazarcık - Alışverişin Modern Hali",
  description:
    "Binlerce ürün arasından size en uygun olanını bulun. Kategori, fiyat ve puana göre filtreleme yapın. Hızlı teslimat ve güvenli ödeme seçenekleri.",
  keywords: [
    "online alışveriş",
    "e-ticaret",
    "ürün mağazası",
    "kategori filtreleme",
    "fiyat filtreleme",
    "puan filtreleme",
    "pazarcık",
  ],
  openGraph: {
    title: "Ürün Mağazası | Pazarcık",
    description:
      "Binlerce ürün arasından size en uygun olanını bulun. Kategori, fiyat ve puana göre filtreleme yapın.",
    type: "website",
    locale: "tr_TR",
    url: "/shop-with-sidebar",
    siteName: "Pazarcık",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ürün Mağazası | Pazarcık",
    description:
      "Binlerce ürün arasından size en uygun olanını bulun. Kategori, fiyat ve puana göre filtreleme yapın.",
  },
  alternates: {
    canonical: "/shop-with-sidebar",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const ShopWithSidebarPage = () => {
  return (
    <main className="min-h-screen">
      <ShopWithSidebar />
    </main>
  );
};

export default ShopWithSidebarPage;
