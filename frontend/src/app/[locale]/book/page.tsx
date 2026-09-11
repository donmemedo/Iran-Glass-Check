import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { Card } from "@/components/ui/primitives";
import { getCenters, getServices } from "@/lib/api";
import { getDict, isLocale, type Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDict(isLocale(locale) ? locale : "fa");
  return { title: dict.book.title, description: dict.book.lead };
}

export default async function BookPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typedLocale = locale as Locale;
  const dict = getDict(typedLocale);

  const [services, centers] = await Promise.all([getServices(), getCenters()]);

  return (
    <div className="shell py-10 sm:py-14">
      {services.length === 0 || centers.length === 0 ? (
        <Card className="mx-auto max-w-md text-center">
          <p className="text-[0.92rem] font-medium">{dict.common.apiOffline}</p>
          <p className="mt-2 text-[0.8rem] text-muted">{dict.common.apiOfflineHint}</p>
        </Card>
      ) : (
        <BookingWizard
          services={services}
          centers={centers}
          locale={typedLocale}
          dict={dict}
        />
      )}
    </div>
  );
}
