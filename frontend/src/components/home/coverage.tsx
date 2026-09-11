import { Clock3, MapPin, Phone, Star, Truck, Wrench } from "lucide-react";
import { Badge, SectionHead } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { formatNumber, toLocaleDigits } from "@/lib/format";
import type { Dict, Locale } from "@/lib/i18n";
import type { Center } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Coverage({
  dict,
  locale,
  centers,
}: {
  dict: Dict;
  locale: Locale;
  centers: Center[];
}) {
  if (centers.length === 0) return null;

  return (
    <section id="centers" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="shell">
        <Reveal>
          <SectionHead
            eyebrow={dict.coverage.eyebrow}
            title={dict.coverage.title}
            lead={dict.coverage.lead}
          />
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {centers.map((center, i) => {
            const name = locale === "fa" ? center.name_fa : center.name_en;
            const city = locale === "fa" ? center.city_fa : center.city_en;
            const address = locale === "fa" ? center.address_fa : center.address_en;
            const openingLabel =
              locale === "fa" ? center.opening_label_fa : center.opening_label_en;

            return (
              <Reveal key={center.slug} delay={i * 0.05}>
                <article
                  className={cn(
                    "flex h-full flex-col gap-4 rounded-lg p-6",
                    center.is_live ? "glass edge-light" : "panel-card opacity-80",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[0.72rem] text-subtle">{city}</span>
                      <h3 className="text-[1.05rem] font-semibold">{name}</h3>
                    </div>
                    <Badge tone={center.is_live ? "ok" : "neutral"}>
                      {center.is_live ? dict.coverage.live : (openingLabel ?? dict.coverage.soon)}
                    </Badge>
                  </div>

                  <p className="flex items-start gap-2 text-[0.8rem] leading-relaxed text-muted">
                    <MapPin className="mt-0.5 size-3.5 shrink-0 text-accent" strokeWidth={1.8} />
                    {address}
                  </p>

                  {center.is_live && (
                    <>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.75rem] text-muted">
                        <span className="flex items-center gap-1.5">
                          <Wrench className="size-3.5 text-subtle" strokeWidth={1.8} />
                          {toLocaleDigits(center.bays, locale)} {dict.coverage.bays}
                        </span>
                        {center.mobile_vans > 0 && (
                          <span className="flex items-center gap-1.5">
                            <Truck className="size-3.5 text-subtle" strokeWidth={1.8} />
                            {toLocaleDigits(center.mobile_vans, locale)} {dict.coverage.vans}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Star className="size-3.5 text-warn" strokeWidth={1.8} />
                          {formatNumber(center.rating, locale, { minimumFractionDigits: 1 })}
                        </span>
                      </div>

                      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-[0.75rem]">
                        <span className="flex items-center gap-1.5 text-muted">
                          <Clock3 className="size-3.5 text-subtle" strokeWidth={1.8} />
                          <span dir="ltr">
                            {center.opens_at}–{center.closes_at}
                          </span>
                        </span>
                        <a
                          href={`tel:${center.phone.replace(/[^\d+]/g, "")}`}
                          className="press flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-muted transition-colors hover:border-accent hover:text-accent"
                        >
                          <Phone className="size-3.5" strokeWidth={1.8} />
                          <span dir="ltr">{center.phone}</span>
                        </a>
                      </div>
                    </>
                  )}
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
