import React from "react";
import Cart from "@/components/Cart";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sepetim - Alışveriş Sepetiniz | Pazarcık",
  description: "Sepetinizdeki ürünleri görüntüleyin, miktarlarını güncelleyin, indirim kuponları uygulayın ve güvenli ödeme ile siparişinizi tamamlayın. Hızlı kargo ve 30 gün iade garantisi.",
  keywords: "sepet, alışveriş sepeti, online alışveriş, indirim kuponu, ödeme, kargo",
  openGraph: {
    title: "Sepetim - Alışveriş Sepetiniz | Pazarcık",
    description: "Sepetinizdeki ürünleri görüntüleyin, miktarlarını güncelleyin ve güvenli ödeme ile siparişinizi tamamlayın.",
    type: "website",
    locale: "tr_TR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sepetim - Alışveriş Sepetiniz | Pazarcık",
    description: "Sepetinizdeki ürünleri görüntüleyin ve güvenli ödeme ile siparişinizi tamamlayın.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const CartPage = () => {
  return (
    <>
      <Cart />
    </>
  );
};

export default CartPage;
