// src/app/layout.tsx
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import localFont from "next/font/local";
import "./globals.css";
import AuthInitProvider from "@/modules/auth/components/AuthInitProvider";
import Header from "@/components/layout/Header";
import ConditionalFooter from "@/components/layout/ConditionalFooter";
import Footer from "@/components/layout/Footer";
import QueryProvider from "@/lib/query-provider";
import CartDrawer from "@/modules/cart/components/CartDrawer";
import BottomNav from "@/components/layout/bottom-nav/BottomNav";

const vazirmatn = localFont({
  src: [
    {
      path: "../../public/fonts/Vazirmatn-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Vazirmatn-Bold.woff2",
      weight: "500",
      style: "normal",
    },

    {
      path: "../../public/fonts/Vazirmatn-Black.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "نازی شاپ | فروشگاه اینترنتی",
    template: "%s | نازی شاپ",
  },
  description: "فروشگاه اینترنتی نازی شاپ - خرید آنلاین با بهترین قیمت",
  icons: {
    icon: "/favicon.ico",
  },
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yoursite.com';

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'نازی شاپ',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={vazirmatn.variable}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-text-primary antialiased flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthInitProvider>
              <Header />
              <main className="flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
                {children}
              </main>
              <CartDrawer />
              <BottomNav />
              <ConditionalFooter>
                <Footer />
              </ConditionalFooter>
            </AuthInitProvider>
          </QueryProvider>
          <Toaster
            position="bottom-left"
            reverseOrder={false}
            toastOptions={{
              duration: 4000,
              style: {
                background: "var(--color-surface)",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-card)",
                fontFamily: "var(--font-vazirmatn)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
