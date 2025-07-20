import Signup from "@/components/Auth/Signup";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kayıt Ol | Pazarcık - Alışverişin Modern Hali",
  description: "Pazarcık'ta yeni hesap oluşturun. Güvenli kayıt, hızlı doğrulama ve özel avantajlar için hemen üye olun. Ad, soyad, e-posta ve güvenli parola ile kolay kayıt.",
  keywords: [
    "kayıt ol",
    "üye ol",
    "hesap oluştur",
    "yeni hesap",
    "kullanıcı kaydı",
    "e-posta kaydı",
    "güvenli kayıt",
    "pazarcık kayıt",
    "online alışveriş kayıt"
  ],
  openGraph: {
    title: "Kayıt Ol | Pazarcık",
    description: "Pazarcık'ta yeni hesap oluşturun. Güvenli kayıt, hızlı doğrulama ve özel avantajlar için hemen üye olun.",
    type: "website",
    locale: "tr_TR",
    url: "/signup",
    siteName: "Pazarcık",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kayıt Ol | Pazarcık",
    description: "Pazarcık'ta yeni hesap oluşturun. Güvenli kayıt, hızlı doğrulama ve özel avantajlar için hemen üye olun.",
  },
  alternates: {
    canonical: "/signup",
  },
  robots: {
    index: false,
    follow: false,
  },
};

const SignupPage = () => {
  return (
    <main className="min-h-screen">
      <Signup />
    </main>
  );
};

export default SignupPage;
