import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favori Ürünlerim | Pazarcık - Beğendiğiniz Ürünler",
  description:
    "Favori ürünlerinizi görüntüleyin, sepete ekleyin ve yönetin. Beğendiğiniz ürünleri favorilere ekleyerek daha sonra kolayca erişebilirsiniz.",
  keywords: [
    "favori ürünler",
    "beğenilen ürünler",
    "wishlist",
    "favoriler",
    "ürün listesi",
    "pazarcık",
    "e-ticaret",
  ],
  openGraph: {
    title: "Favori Ürünlerim | Pazarcık",
    description:
      "Favori ürünlerinizi görüntüleyin, sepete ekleyin ve yönetin. Beğendiğiniz ürünleri favorilere ekleyerek daha sonra kolayca erişebilirsiniz.",
    type: "website",
    locale: "tr_TR",
    url: "/wishlist",
    siteName: "Pazarcık",
  },
  twitter: {
    card: "summary_large_image",
    title: "Favori Ürünlerim | Pazarcık",
    description:
      "Favori ürünlerinizi görüntüleyin, sepete ekleyin ve yönetin. Beğendiğiniz ürünleri favorilere ekleyerek daha sonra kolayca erişebilirsiniz.",
  },
  alternates: {
    canonical: "/wishlist",
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