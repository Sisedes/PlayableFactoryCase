import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pazarcık | Alışverişin Modern Hali",
  description: "En yeni ürünler, en iyi fırsatlar ve kaliteli hizmet için Pazarcık'a hoş geldiniz",
};

export default function HomePage() {
  return (
    <>
      <Home />
    </>
  );
}
