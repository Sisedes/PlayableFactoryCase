import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pazarcık | Alışverişin Modern Hali - En İyi Fırsatlar ve Kaliteli Ürünler",
  description: "Pazarcık'ta en yeni ürünler, en iyi fırsatlar ve kaliteli hizmet. Elektronik, giyim, ev & bahçe, spor, kitap, sağlık & güzellik kategorilerinde güvenli alışveriş deneyimi.",
  keywords: [
    "online alışveriş",
    "e-ticaret",
    "elektronik",
    "giyim",
    "ev & bahçe",
    "spor",
    "kitap",
    "sağlık & güzellik",
    "oyuncak",
    "gıda",
    "indirim",
    "fırsat"
  ],
  openGraph: {
    title: "Pazarcık | Alışverişin Modern Hali",
    description: "En yeni ürünler, en iyi fırsatlar ve kaliteli hizmet için Pazarcık'a hoş geldiniz",
    type: "website",
    locale: "tr_TR",
    url: "/",
    siteName: "Pazarcık",
    images: [
      {
        url: "/images/hero/hero-01.png",
        width: 1200,
        height: 630,
        alt: "Pazarcık - Modern Alışveriş Deneyimi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  title: "Pazarcık | Alışverişin Modern Hali",
  description: "En yeni ürünler, en iyi fırsatlar ve kaliteli hizmet için Pazarcık'a hoş geldiniz",
    images: ["/images/hero/hero-01.png"],
  },
  alternates: {
    canonical: "/",
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

export default function HomePage() {
  return (
    <main>
      <Home />
    </main>
  );
}
