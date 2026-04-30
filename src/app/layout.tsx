import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { appConfig } from "@/lib/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(appConfig.siteUrl),
  title: {
    default: appConfig.siteName,
    template: `%s | ${appConfig.siteName}`,
  },
  description: appConfig.siteDescription,
  openGraph: {
    title: appConfig.siteName,
    description: appConfig.siteDescription,
    siteName: appConfig.siteName,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: appConfig.siteName,
    description: appConfig.siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
