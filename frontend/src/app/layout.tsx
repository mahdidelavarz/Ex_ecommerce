// src/app/layout.tsx
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import localFont from 'next/font/local';
import './globals.css';

const vazirmatn = localFont({
  src: [
    {
      path: '../../public/fonts/Vazirmatn-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Vazirmatn-Bold.woff2',
      weight: '500',
      style: 'normal',
    },
   
    {
      path: '../../public/fonts/Vazirmatn-Black.woff2',
      weight: '800',
      style: 'normal',
    },
  ],
  variable: '--font-vazirmatn',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'نازی شاپ | فروشگاه اینترنتی',
    template: '%s | نازی شاپ',
  },
  description: 'فروشگاه اینترنتی نازی شاپ - خرید آنلاین با بهترین قیمت',
  icons: {
    icon: '/favicon.ico',
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
      <body className="min-h-screen bg-background text-text-primary antialiased">
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="bottom-left"
            reverseOrder={false}
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-card)',
                fontFamily: 'var(--font-vazirmatn)',
              },
              success: {
                iconTheme: {
                  primary: 'var(--color-success)',
                  secondary: 'white',
                },
              },
              error: {
                iconTheme: {
                  primary: 'var(--color-error)',
                  secondary: 'white',
                },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}