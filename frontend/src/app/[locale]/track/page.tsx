import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TrackView } from "@/components/booking/track-view";
import { getDict, isLocale, type Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDict(isLocale(locale) ? locale : "fa");
  return { title: dict.track.title, description: dict.track.lead };
}

export default async function TrackPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ code?: string | string[] }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typedLocale = locale as Locale;
  const { code } = await searchParams;
  const initialCode = Array.isArray(code) ? (code[0] ?? "") : (code ?? "");

  return (
    <div className="shell py-10 sm:py-14">
      <TrackView locale={typedLocale} dict={getDict(typedLocale)} initialCode={initialCode} />
    </div>
  );
}
