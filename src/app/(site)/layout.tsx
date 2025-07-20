import "../css/euclid-circular-a-font.css";
import "../css/style.css";
import ClientLayout from "./ClientLayout";

// Add global metadata for better SEO
export const metadata = {
  title: {
    default: "Pazarcık | Alışverişin Modern Hali",
    template: "%s | Pazarcık"
  },
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
    "fırsat",
    "pazarcık"
  ],
  authors: [{ name: "Pazarcık E-Ticaret Platformu" }],
  creator: "Pazarcık",
  publisher: "Pazarcık",
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
    title: "Pazarcık | Alışverişin Modern Hali",
    description: "Pazarcık'ta en yeni ürünler, en iyi fırsatlar ve kaliteli hizmet. Güvenli alışveriş deneyimi için Pazarcık'ı tercih edin.",
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
    description: "Pazarcık'ta en yeni ürünler, en iyi fırsatlar ve kaliteli hizmet.",
    images: ["/images/hero/hero-01.png"],
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
  category: "e-commerce",
  classification: "online shopping",
  referrer: "origin-when-cross-origin",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3C50E0" },
    { media: "(prefers-color-scheme: dark)", color: "#1C274C" },
  ],
  colorScheme: "light dark",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  applicationName: "Pazarcık",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pazarcık",
  },
  manifest: "/manifest.json",
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
        <meta name="theme-color" content="#3C50E0" />
        <meta name="msapplication-TileColor" content="#3C50E0" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for better performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      </head>
      <body className="antialiased">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
