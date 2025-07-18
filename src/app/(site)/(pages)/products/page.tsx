import React from "react";
import { Metadata } from "next";
import ProductListing from "@/components/ProductListing";

export const metadata: Metadata = {
  title: "Tüm Ürünler | E-Ticaret",
  description: "Tüm ürünlerimizi keşfedin. En yeni ve popüler ürünlerimizi inceleyin.",
};

const ProductsPage = () => {
  return (
    <main>
      <ProductListing />
    </main>
  );
};

export default ProductsPage; 