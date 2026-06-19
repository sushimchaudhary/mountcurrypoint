import type { Metadata } from "next";
import { Nunito } from "next/font/google";import "./globals.css";
import ClientProviders from "@/components/ClientProvider";
import GoogleTranslate from "@/components/GoogleTranslate";
import { ThemeProvider } from "@/lib/context/ThemeContext";
import { Toaster } from "sonner";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thearyatara.info"),
  title: {
    default: "Arya Tara PVT LTD",
    template: "%s | Arya Tara",
  },
  description: "Arya Tara PVT LTD - Expert services in Japan and Nepal. Connecting talent with opportunities.",
  keywords: ["Arya Tara", "Job Agency", "Nepal to Japan", "Career", "Recruitment"],
  authors: [{ name: "Arya Tara" }],
  openGraph: {
    title: "Arya Tara PVT LTD",
    description: "Your trusted partner for career opportunities.",
    url: "https://thearyatara.info",
    siteName: "Arya Tara",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arya Tara PVT LTD",
    description: "Your trusted partner for career opportunities.",
  },
};


export const viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Schema डेटा यहाँ डिफाइन गर्नुहोस्
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Arya Tara PVT LTD",
    "url": "https://thearyatara.info/",
    "logo": "https://thearyatara.info/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "business@thearyatara.info",
      "contactType": "customer service"
    }
  };
  return (
    <html
      lang="en"
      className={`${nunito.variable} h-full antialiased`}
    >

      <head>
        {/* यहाँ राख्नुहोस् */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      
      <body className="min-h-full flex flex-col">
        <Toaster
          richColors
          position="top-right"
          expand={false}
          toastOptions={{
            style: {
              padding: "6px 10px",
              fontSize: "10px",
              borderRadius: "4px",
              minWidth: "150px",
              maxWidth: "150px",
            },
            className: "font-sans",
          }}
        />

        <GoogleTranslate /> 
        <ClientProviders>
           <ThemeProvider>{children}</ThemeProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
