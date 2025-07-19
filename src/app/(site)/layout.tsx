import "../css/euclid-circular-a-font.css";
import "../css/style.css";
import ClientLayout from "./ClientLayout";

// Add global metadata for better SEO
export const metadata = {
  title: {
    default: "Pazarcık | Alışverişin Model Hali",
    template: "%s | E-Commerce Platform"
  },
  description: "Discover amazing products with our modern e-commerce platform. Shop electronics, clothing, home & garden, sports, books, health & beauty, toys, and food categories.",
  keywords: ["e-commerce", "online shopping", "electronics", "clothing", "home", "garden", "sports", "books", "health", "beauty", "toys", "food"],
  authors: [{ name: "E-Commerce Platform Team" }],
  creator: "E-Commerce Platform",
  publisher: "E-Commerce Platform",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "/",
    title: "E-Commerce Platform | Modern Online Shopping Experience",
    description: "Discover amazing products with our modern e-commerce platform. Shop across multiple categories with secure checkout and fast delivery.",
    siteName: "E-Commerce Platform",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "E-Commerce Platform - Online Shopping",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "E-Commerce Platform | Modern Online Shopping Experience",
    description: "Discover amazing products with our modern e-commerce platform.",
    images: ["/images/twitter-image.jpg"],
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
  verification: {
    google: "google-site-verification-code",
    yandex: "yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning={true}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1C274C" />
      </head>
      <body>
        <ClientLayout>
                    {children}
        </ClientLayout>
      </body>
    </html>
  );
}
