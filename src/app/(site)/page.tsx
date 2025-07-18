import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "NextCommerce | Modern E-ticaret Sitesi",
  description: "En yeni ürünler, en iyi fırsatlar ve kaliteli hizmet için NextCommerce'e hoş geldiniz",
};

export default function HomePage() {
  return (
    <>
      <Home />
    </>
  );
}
