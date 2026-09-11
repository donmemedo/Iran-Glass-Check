import { Clock3, ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Badge, SectionHead } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { formatToman, toLocaleDigits } from "@/lib/format";
import type { Dict, Locale } from "@/lib/i18n";
import type { Service } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Pricing({
  dict,
  locale,
  services,
}: {
  dict: Dict;
  locale: Locale;
  services: Service[];
}) {
  if (services.length === 0) return null;

  return (
    <section id="pricing" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="shell">
        <Reveal>
          <SectionHead
            eyebrow={dict.pricing.eyebrow}
            title={dict.pricing.title}
            lead={dict.pricing.lead}
            align="center"
            className="mx-auto items-center text-center"
          />
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => {
            const name = locale === "fa" ? service.name_fa : service.name_en;
            const tagline = locale === "fa" ? service.tagline_fa : service.tagline_en;
            const description = locale === "fa" ? service.description_fa : service.description_en;
            const per = locale === "fa" ? service.per_fa : service.per_en;

            return (
              <Reveal key={service.slug} delay={i * 0.06}>
                <article
                  className={cn(
                    "relative flex h-full flex-col gap-4 rounded-lg p-6",
                    service.highlight ? "glass-strong edge-light" : "panel-card",
                  )}
                >
                  {service.highlight && (
                    <Badge tone="accent" className="absolute end-5 top-5">
                      {dict.pricing.popular}
                    </Badge>
                  )}

                  <div className="flex flex-col gap-1.5 pe-20">
                    <h3 className="text-lg font-semibold">{name}</h3>
                    <p className="text-[0.78rem] text-accent">{tagline}</p>
                  </div>

                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="text-[0.72rem] text-subtle">{dict.pricing.from}</span>
                    <span className="text-[1.45rem] font-semibold tabular-nums">
                      {formatToman(service.price_from, locale)}
                    </span>
                    {service.price_to && (
                      <>
                        <span className="text-[0.72rem] text-subtle">{dict.pricing.to}</span>
                        <span className="text-[0.95rem] font-medium tabular-nums text-muted">
                          {formatToman(service.price_to, locale)}
                        </span>
                      </>
                    )}
                    {per && <span className="w-full text-[0.72rem] text-subtle">{per}</span>}
                  </div>

                  <p className="text-[0.84rem] leading-relaxed text-muted">{description}</p>

                  <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4 text-[0.74rem] text-subtle">
                    {service.duration_min > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Clock3 className="size-3.5" strokeWidth={1.8} />
                        {toLocaleDigits(service.duration_min, locale)} {dict.pricing.minutes}
                      </span>
                    )}
                    {service.warranty_months > 0 && (
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="size-3.5" strokeWidth={1.8} />
                        {toLocaleDigits(service.warranty_months, locale)}{" "}
                        {dict.pricing.monthsWarranty} {dict.pricing.warranty}
                      </span>
                    )}
                    <ButtonLink
                      href={`/${locale}/book?service=${service.slug}`}
                      size="sm"
                      variant={service.highlight ? "primary" : "outline"}
                      className="ms-auto"
                    >
                      {dict.pricing.book}
                    </ButtonLink>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        {/* volume tiers */}
        <Reveal delay={0.1}>
          <div className="glass mt-8 rounded-lg p-6 sm:p-7">
            <h3 className="text-[0.95rem] font-semibold">{dict.pricing.tiersTitle}</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {dict.pricing.tiers.map((tier) => (
                <div
                  key={tier.size}
                  className="rounded-md border border-line px-4 py-3.5 transition-colors hover:border-[color-mix(in_oklab,var(--accent)_45%,transparent)]"
                >
                  <div className="text-[0.76rem] text-muted">{tier.size}</div>
                  <div className="mt-1.5 text-[1.05rem] font-semibold tabular-nums">
                    {formatToman(tier.price, locale)}
                  </div>
                  <div className="text-[0.68rem] text-subtle">{dict.pricing.perVehicleMonth}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
