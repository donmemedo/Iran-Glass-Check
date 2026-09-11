import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PanelClient } from "@/components/fleet/panel-client";
import { getDict, isLocale, type Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDict(isLocale(locale) ? locale : "fa");
  return { title: dict.panel.title };
}

export default async function PanelPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typedLocale = locale as Locale;
  return <PanelClient dict={getDict(typedLocale)} locale={typedLocale} />;
}
