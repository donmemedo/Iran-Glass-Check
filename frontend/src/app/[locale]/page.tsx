import { notFound } from "next/navigation";
import { CheckShowcase } from "@/components/home/check-showcase";
import { ContactCta } from "@/components/home/contact-cta";
import { Coverage } from "@/components/home/coverage";
import { Faq } from "@/components/home/faq";
import { Hero } from "@/components/home/hero";
import { Offerings } from "@/components/home/offerings";
import { Pricing } from "@/components/home/pricing";
import { Process } from "@/components/home/process";
import { Proof } from "@/components/home/proof";
import { RoiCalculator } from "@/components/home/roi-calculator";
import { Marquee } from "@/components/ui/primitives";
import { getCenters, getCheckpoints, getServices, getStats } from "@/lib/api";
import { getDict, isLocale, type Locale } from "@/lib/i18n";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const typedLocale = locale as Locale;
  const dict = getDict(typedLocale);

  const [services, centers, checkpoints, stats] = await Promise.all([
    getServices(),
    getCenters(),
    getCheckpoints(),
    getStats(),
  ]);

  const checkLabels = checkpoints
    .slice(0, 4)
    .map((c) => (typedLocale === "fa" ? c.title_fa : c.title_en));

  return (
    <>
      <Hero
        locale={typedLocale}
        dict={dict}
        checkLabels={
          checkLabels.length
            ? checkLabels
            : typedLocale === "fa"
              ? ["روغن موتور", "لاستیک‌ها", "باتری", "ترمز"]
              : ["Engine oil", "Tyres", "Battery", "Brakes"]
        }
      />

      <section className="shell py-8">
        <p className="mb-5 text-center text-[0.75rem] tracking-wide text-subtle">
          {dict.trust.title}
        </p>
        <Marquee items={dict.trust.items} />
      </section>

      <Offerings dict={dict} />
      <Process dict={dict} locale={typedLocale} />
      <CheckShowcase dict={dict} locale={typedLocale} checkpoints={checkpoints} />

      <div id="fleet" className="scroll-mt-24">
        <RoiCalculator dict={dict} locale={typedLocale} />
      </div>

      <Pricing dict={dict} locale={typedLocale} services={services} />
      <Coverage dict={dict} locale={typedLocale} centers={centers} />
      <Proof dict={dict} locale={typedLocale} stats={stats} />
      <Faq dict={dict} />
      <ContactCta dict={dict} locale={typedLocale} />
    </>
  );
}
