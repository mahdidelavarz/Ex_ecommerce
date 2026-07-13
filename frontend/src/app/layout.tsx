// src/app/layout.tsx
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import AuthInitProvider from "@/modules/auth/components/AuthInitProvider";
import AuthRouteGuard from "@/modules/auth/components/AuthRouteGuard";
import RouteChrome from "@/components/layout/RouteChrome";
import Footer from "@/components/layout/Footer";
import QueryProvider from "@/lib/query-provider";
import CartMergeProvider from "@/modules/cart/components/CartMergeProvider";
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_OG_IMAGE,
} from "@/lib/seo";

// Keep edge-cached HTML fast while bounding stale deployments to roughly one
// minute. Catalog data has its own longer, tag-invalidated fetch cache.
export const revalidate = 60;

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: "نازی شاپ | فروشگاه اینترنتی",
    template: "%s | نازی شاپ",
  },
  description: "فروشگاه اینترنتی نازی شاپ - خرید آنلاین با بهترین قیمت",
  icons: {
    icon: "/favicon.ico",
  },
  // NOTE: do not set `alternates.canonical` here — it would cascade to every
  // page and canonicalize them all to "/". Canonicals are set per-page.
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: "نازی شاپ | فروشگاه اینترنتی",
    description: "فروشگاه اینترنتی نازی شاپ - خرید آنلاین با بهترین قیمت",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: "نازی شاپ | فروشگاه اینترنتی",
    description: "فروشگاه اینترنتی نازی شاپ - خرید آنلاین با بهترین قیمت",
    images: [DEFAULT_OG_IMAGE],
  },
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
      <body className="min-h-dvh bg-background text-text-primary antialiased flex flex-col">
        <ThemeProvider>
          <QueryProvider>
            <AuthInitProvider>
              <CartMergeProvider>
                <AuthRouteGuard>
                  <RouteChrome footer={<Footer />}>
                    {children}
                  </RouteChrome>
                </AuthRouteGuard>
              </CartMergeProvider>
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
