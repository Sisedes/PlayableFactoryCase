import React from "react";
import Checkout from "@/components/Checkout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ödeme | Pazarcık - Güvenli Alışveriş",
  description:
    "Güvenli ödeme sayfası. Teslimat ve fatura adreslerinizi girin, ödeme yönteminizi seçin ve siparişinizi tamamlayın. SSL sertifikalı güvenli ödeme.",
  keywords: [
    "ödeme",
    "checkout",
    "güvenli ödeme",
    "kredi kartı",
    "teslimat adresi",
    "fatura adresi",
    "sipariş tamamlama",
    "pazarcık",
    "e-ticaret",
  ],
  openGraph: {
    title: "Ödeme | Pazarcık",
    description:
      "Güvenli ödeme sayfası. Teslimat ve fatura adreslerinizi girin, ödeme yönteminizi seçin ve siparişinizi tamamlayın.",
    type: "website",
    locale: "tr_TR",
    url: "/checkout",
    siteName: "Pazarcık",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ödeme | Pazarcık",
    description:
      "Güvenli ödeme sayfası. Teslimat ve fatura adreslerinizi girin, ödeme yönteminizi seçin ve siparişinizi tamamlayın.",
  },
  alternates: {
    canonical: "/checkout",
  },
  robots: {
    index: false, 
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

const CheckoutPage = () => {
  return (
    <main className="min-h-screen">
      <Checkout />
    </main>
  );
};

export default CheckoutPage;
