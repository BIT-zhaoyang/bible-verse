import type { Metadata } from "next";
import "./globals.css";

import { appConfig } from "@/lib/config";

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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
