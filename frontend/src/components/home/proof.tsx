"use client";

import { Quote } from "lucide-react";
import { Counter } from "@/components/ui/counter";
import { SectionHead } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { toLocaleDigits } from "@/lib/format";
import type { Dict, Locale } from "@/lib/i18n";
import type { Stats } from "@/lib/types";

export function Proof({
  dict,
  locale,
  stats,
}: {
  dict: Dict;
  locale: Locale;
  stats: Stats | null;
}) {
  const tiles = stats
    ? [
        { label: dict.proof.stats.vehicles, value: stats.vehicles_covered, money: false },
        { label: dict.proof.stats.checks, value: stats.checks_done, money: false },
        { label: dict.proof.stats.prevented, value: stats.prevented_cost, money: true },
        { label: dict.proof.stats.contracts, value: stats.b2b_contracts, money: false },
      ]
    : [];

  return (
    <section className="relative py-20 sm:py-28">
      <div className="shell">
        <Reveal>
          <SectionHead eyebrow={dict.proof.eyebrow} title={dict.proof.title} align="center" />
        </Reveal>

        {tiles.length > 0 && (
          <Reveal delay={0.06}>
            <div className="glass edge-light mt-12 grid gap-6 rounded-lg p-7 sm:grid-cols-2 lg:grid-cols-4">
              {tiles.map((tile) => (
                <div key={tile.label} className="flex flex-col items-center gap-1.5 text-center">
                  <span className="text-2xl font-semibold sm:text-[1.75rem]">
                    <Counter value={tile.value} locale={locale} money={tile.money} />
                  </span>
                  <span className="text-[0.76rem] leading-snug text-muted">{tile.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {dict.proof.testimonials.map((item, i) => (
            <Reveal key={item.role} delay={0.06 * i}>
              <figure className="panel-card flex h-full flex-col gap-4 rounded-lg p-6">
                <Quote className="size-5 text-accent" strokeWidth={1.8} />
                <blockquote className="text-[0.88rem] leading-relaxed text-fg">
                  {item.quote}
                </blockquote>
                <figcaption className="mt-auto flex items-center gap-3 border-t border-line pt-4">
                  <span className="accent-gradient grid size-9 place-items-center rounded-full text-[0.8rem] font-semibold text-white">
                    {item.name.slice(0, 1)}
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span className="text-[0.82rem] font-medium">{item.name}</span>
                    <span className="text-[0.72rem] text-subtle">{item.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        {stats && (
          <Reveal delay={0.12}>
            <p className="mt-6 text-center text-[0.76rem] text-subtle">
              {dict.proof.stats.minutes}: {toLocaleDigits(stats.avg_check_minutes, locale)} ·{" "}
              {dict.proof.stats.referral}: {toLocaleDigits(stats.referral_rate, locale)}٪
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
