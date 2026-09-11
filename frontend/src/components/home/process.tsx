import { CalendarCheck, ClipboardList, FileCheck2, ScanLine } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { SectionHead } from "@/components/ui/primitives";
import { toLocaleDigits } from "@/lib/format";
import type { Dict, Locale } from "@/lib/i18n";

const ICONS = [CalendarCheck, ScanLine, ClipboardList, FileCheck2];

export function Process({ dict, locale }: { dict: Dict; locale: Locale }) {
  return (
    <section className="relative py-20 sm:py-24">
      <div className="shell">
        <Reveal>
          <SectionHead eyebrow={dict.how.eyebrow} title={dict.how.title} align="center" />
        </Reveal>

        <ol className="relative mt-14 grid gap-6 md:grid-cols-4">
          {/* the rail the steps sit on */}
          <span
            aria-hidden
            className="absolute inset-x-[12%] top-6 hidden h-px bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--accent)_45%,transparent),color-mix(in_oklab,var(--accent-2)_45%,transparent),transparent)] md:block"
          />
          {dict.how.steps.map((step, i) => {
            const Icon = ICONS[i] ?? CalendarCheck;
            return (
              <Reveal key={step.title} delay={i * 0.09}>
                <li className="relative flex flex-col items-center gap-4 text-center">
                  <span className="glass relative z-10 grid size-12 place-items-center rounded-full text-accent">
                    <Icon className="size-5" strokeWidth={1.8} />
                    <span className="absolute -top-1.5 -end-1.5 grid size-5 place-items-center rounded-full accent-gradient text-[0.62rem] font-semibold text-white">
                      {toLocaleDigits(i + 1, locale)}
                    </span>
                  </span>
                  <h3 className="text-[1.02rem] font-semibold">{step.title}</h3>
                  <p className="text-[0.84rem] leading-relaxed text-muted">{step.body}</p>
                </li>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
