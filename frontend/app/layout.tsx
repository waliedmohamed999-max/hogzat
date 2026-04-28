import type { Metadata, Viewport } from "next";
import { resolveBrand } from "@/lib/brand";
import { getPublicSystemSettings } from "@/lib/api";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSystemSettings();
  const siteBrand = resolveBrand(settings);

  return {
    title: siteBrand.title,
    description: siteBrand.descriptionAr,
    openGraph: {
      title: siteBrand.title,
      description: siteBrand.descriptionAr,
      siteName: siteBrand.nameAr,
      locale: "ar_SA",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: siteBrand.title,
      description: siteBrand.descriptionAr,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
