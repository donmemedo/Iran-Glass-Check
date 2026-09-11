import type { Metadata } from "next";
import { Geist, Geist_Mono, Vazirmatn } from "next/font/google";
import { notFound } from "next/navigation";
import { Providers } from "@/components/site/providers";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteNav } from "@/components/site/site-nav";
import { dir, getDict, isLocale, locales, type Locale } from "@/lib/i18n";
import "../globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-vazir",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDict(isLocale(locale) ? locale : "fa");
  return {
    title: { default: dict.meta.title, template: `%s — ${dict.brand.name}` },
    description: dict.meta.description,
    applicationName: dict.brand.name,
    manifest: "/manifest.webmanifest",
    appleWebApp: { capable: true, title: dict.brand.name, statusBarStyle: "black-translucent" },
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      type: "website",
    },
  };
}

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f8fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1220" },
  ],
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typedLocale = locale as Locale;
  const dict = getDict(typedLocale);

  return (
    <html
      lang={typedLocale}
      dir={dir(typedLocale)}
      suppressHydrationWarning
      className={`${vazirmatn.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="grain min-h-dvh">
        <Providers>
          {/* the lit interlayer that sits behind every page */}
          <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <div className="aurora" />
            <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,transparent_35%,var(--bg)_100%)]" />
          </div>

          <SiteNav locale={typedLocale} dict={dict} />
          <main className="pt-[var(--nav-h)]">{children}</main>
          <SiteFooter locale={typedLocale} dict={dict} />
        </Providers>
      </body>
    </html>
  );
}
