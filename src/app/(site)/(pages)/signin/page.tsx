import Signin from "@/components/Auth/Signin";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giriş Yap | Pazarcık - Alışverişin Modern Hali",
  description: "Pazarcık hesabınıza güvenli bir şekilde giriş yapın. E-posta ve parola ile hızlı giriş, sosyal medya ile giriş seçenekleri ve güvenli kimlik doğrulama.",
  keywords: [
    "giriş yap",
    "hesap girişi",
    "kullanıcı girişi",
    "e-posta girişi",
    "parola girişi",
    "güvenli giriş",
    "pazarcık giriş",
    "online alışveriş giriş"
  ],
  openGraph: {
    title: "Giriş Yap | Pazarcık",
    description: "Pazarcık hesabınıza güvenli bir şekilde giriş yapın. E-posta ve parola ile hızlı giriş seçenekleri.",
    type: "website",
    locale: "tr_TR",
    url: "/signin",
    siteName: "Pazarcık",
  },
  twitter: {
    card: "summary_large_image",
    title: "Giriş Yap | Pazarcık",
    description: "Pazarcık hesabınıza güvenli bir şekilde giriş yapın. E-posta ve parola ile hızlı giriş seçenekleri.",
  },
  alternates: {
    canonical: "/signin",
  },
  robots: {
    index: false,
    follow: false,
  },
};

const SigninPage = () => {
  return (
    <main className="min-h-screen">
      <Signin />
    </main>
  );
};

export default SigninPage;
