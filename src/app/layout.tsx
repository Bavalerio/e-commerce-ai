import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ClerkProvider } from '@clerk/nextjs';
import AppThemeProvider from '@/providers/ThemeProvider';
import RootLayout from '@/components/layout/RootLayout';
import "./globals.css";

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: {
    default: "E-Commerce AI",
    template: "%s | E-Commerce AI"
  },
  description: "Modern mobile-first PWA e-commerce platform with the latest React stack",
  keywords: ["e-commerce", "PWA", "mobile-first", "React", "Next.js"],
  authors: [{ name: "E-Commerce AI Team" }],
  creator: "E-Commerce AI",
  publisher: "E-Commerce AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "E-Commerce AI",
  },
  icons: {
    icon: "/icons/icon-192.png",
    shortcut: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  openGraph: {
    type: "website",
    siteName: "E-Commerce AI",
    title: "E-Commerce AI",
    description: "Modern mobile-first PWA e-commerce platform",
  },
  twitter: {
    card: "summary_large_image",
    title: "E-Commerce AI",
    description: "Modern mobile-first PWA e-commerce platform",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1976d2' },
    { media: '(prefers-color-scheme: dark)', color: '#90caf9' }
  ],
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={roboto.variable}>
        <head>
          <meta name="application-name" content="E-Commerce AI" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        </head>
        <body className={`${roboto.variable} font-sans`}>
          <AppRouterCacheProvider>
            <AppThemeProvider>
              <RootLayout>
                {children}
              </RootLayout>
            </AppThemeProvider>
          </AppRouterCacheProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
