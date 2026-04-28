import type { Metadata } from "next";
import { resolveBrand } from "@/lib/brand";
import { getPublicSystemSettings } from "@/lib/api";
import "./globals.css";

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
