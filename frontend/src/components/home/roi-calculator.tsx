"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowDownRight, Clock3, ShieldAlert, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Counter } from "@/components/ui/counter";
import { SectionHead } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { Slider } from "@/components/ui/slider";
import { formatNumber, formatToman, toLocaleDigits } from "@/lib/format";
import type { Dict, Locale } from "@/lib/i18n";
import type { RoiResult } from "@/lib/types";

export function RoiCalculator({ dict, locale }: { dict: Dict; locale: Locale }) {
  const [fleetSize, setFleetSize] = useState(180);
  const [age, setAge] = useState(9);
  const [checks, setChecks] = useState(2);
  const [result, setResult] = useState<RoiResult | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const controller = new AbortController();
    const id = setTimeout(() => {
      fetch("/api/roi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fleet_size: fleetSize,
          avg_vehicle_age: age,
          checks_per_year: checks,
        }),
        signal: controller.signal,
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data: RoiResult | null) => data && setResult(data))
        .catch(() => undefined);
    }, 140);
    return () => {
      clearTimeout(id);
      controller.abort();
    };
  }, [fleetSize, age, checks]);

  const programRatio = result ? Math.max(result.program.total / result.baseline.total, 0.05) : 0.8;

  const lines = result
    ? [
        { label: dict.roi.breakdown.repairs, base: result.baseline.repairs, prog: result.program.repairs },
        { label: dict.roi.breakdown.downtime, base: result.baseline.downtime, prog: result.program.downtime },
        { label: dict.roi.breakdown.glass, base: result.baseline.glass, prog: result.program.glass },
        { label: dict.roi.breakdown.subscription, base: 0, prog: result.program.subscription },
        { label: dict.roi.breakdown.minor, base: 0, prog: result.program.minor_jobs },
      ]
    : [];

  return (
    <section id="roi" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="shell">
        <Reveal>
          <SectionHead eyebrow={dict.roi.eyebrow} title={dict.roi.title} lead={dict.roi.lead} />
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          {/* ----------------------------- controls ----------------------------- */}
          <Reveal>
            <div className="glass edge-light flex h-full flex-col gap-7 rounded-lg p-7">
              <Slider
                label={dict.roi.fleetSize}
                value={fleetSize}
                min={10}
                max={2000}
                step={10}
                onChange={setFleetSize}
                display={formatNumber(fleetSize, locale)}
              />
              <Slider
                label={dict.roi.vehicleAge}
                value={age}
                min={3}
                max={18}
                onChange={setAge}
                display={`${toLocaleDigits(age, locale)} ${dict.roi.years}`}
              />
              <Slider
                label={dict.roi.checksPerYear}
                value={checks}
                min={1}
                max={4}
                onChange={setChecks}
                display={`${toLocaleDigits(checks, locale)} ${dict.roi.times}`}
              />

              <div className="mt-auto flex flex-col gap-3 border-t border-line pt-5">
                <div className="flex items-center justify-between text-[0.82rem]">
                  <span className="text-muted">{dict.pricing.perVehicleMonth}</span>
                  <span className="font-semibold tabular-nums">
                    {result ? formatToman(result.monthly_fee_per_vehicle, locale) : "—"}
                  </span>
                </div>
                <p className="text-[0.72rem] leading-relaxed text-subtle">{dict.roi.disclaimer}</p>
              </div>
            </div>
          </Reveal>

          {/* ------------------------------ results ----------------------------- */}
          <Reveal delay={0.08}>
            <div className="glass-strong flex h-full flex-col gap-6 rounded-lg p-7">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[0.78rem] text-muted">{dict.roi.netSaving}</span>
                  <span className="text-3xl font-semibold text-ok sm:text-4xl">
                    {result ? (
                      <Counter value={result.net_saving} locale={locale} money duration={700} />
                    ) : (
                      "—"
                    )}
                  </span>
                  <span className="text-[0.75rem] text-subtle">
                    {result
                      ? `${formatNumber(result.saving_percent, locale, { maximumFractionDigits: 1 })}٪ ${
                          locale === "fa" ? "کمتر از حالت بدون برنامه" : "below the do-nothing case"
                        }`
                      : ""}
                  </span>
                </div>
                <span className="rounded-full border border-[color-mix(in_oklab,var(--ok)_35%,transparent)] bg-ok-soft px-3 py-1.5 text-[0.72rem] font-medium text-ok">
                  {dict.roi.resultTitle}
                </span>
              </div>

              {/* baseline vs programme */}
              <div className="flex flex-col gap-4">
                <BarRow
                  label={dict.roi.baseline}
                  amount={result?.baseline.total ?? 0}
                  ratio={1}
                  locale={locale}
                  tone="crit"
                  reduced={!!reduced}
                />
                <BarRow
                  label={dict.roi.program}
                  amount={result?.program.total ?? 0}
                  ratio={programRatio}
                  locale={locale}
                  tone="accent"
                  reduced={!!reduced}
                />
              </div>

              {/* small stats */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MiniStat
                  icon={<ShieldAlert className="size-4" strokeWidth={1.8} />}
                  label={dict.roi.avoided}
                  value={result ? formatNumber(result.breakdowns_avoided, locale, { maximumFractionDigits: 1 }) : "—"}
                />
                <MiniStat
                  icon={<Clock3 className="size-4" strokeWidth={1.8} />}
                  label={dict.roi.downtime}
                  value={result ? formatNumber(result.downtime_days_saved, locale) : "—"}
                />
                <MiniStat
                  icon={<TrendingUp className="size-4" strokeWidth={1.8} />}
                  label={dict.roi.payback}
                  value={
                    result
                      ? `${formatNumber(result.payback_months, locale, { maximumFractionDigits: 1 })} ${dict.roi.months}`
                      : "—"
                  }
                />
                <MiniStat
                  icon={<ArrowDownRight className="size-4" strokeWidth={1.8} />}
                  label={dict.roi.perVehicle}
                  value={result ? formatToman(result.saving_per_vehicle, locale) : "—"}
                />
              </div>

              {/* breakdown */}
              <div className="overflow-hidden rounded-md border border-line">
                <table className="w-full text-[0.78rem]">
                  <thead className="bg-[color-mix(in_oklab,var(--fg)_4%,transparent)] text-subtle">
                    <tr>
                      <th className="px-3 py-2 text-start font-medium">{dict.roi.resultTitle}</th>
                      <th className="px-3 py-2 text-end font-medium">{dict.roi.baseline}</th>
                      <th className="px-3 py-2 text-end font-medium">{dict.roi.program}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line) => (
                      <tr key={line.label} className="border-t border-line">
                        <td className="px-3 py-2 text-muted">{line.label}</td>
                        <td className="px-3 py-2 text-end tabular-nums">
                          {line.base ? formatToman(line.base, locale) : "—"}
                        </td>
                        <td className="px-3 py-2 text-end tabular-nums">
                          {line.prog ? formatToman(line.prog, locale) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ButtonLink href={`/${locale}#contact`} size="lg" className="self-start">
                {dict.roi.cta}
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function BarRow({
  label,
  amount,
  ratio,
  locale,
  tone,
  reduced,
}: {
  label: string;
  amount: number;
  ratio: number;
  locale: Locale;
  tone: "crit" | "accent";
  reduced: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[0.8rem] text-muted">{label}</span>
        <span className="text-[0.88rem] font-semibold tabular-nums">
          {amount ? formatToman(amount, locale) : "—"}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--fg)_8%,transparent)]">
        <motion.div
          className="h-full rounded-full"
          style={{
            background:
              tone === "crit"
                ? "linear-gradient(90deg, color-mix(in oklab, var(--crit) 85%, transparent), color-mix(in oklab, var(--warn) 85%, transparent))"
                : "linear-gradient(90deg, var(--accent), var(--accent-2))",
          }}
          animate={{ width: `${Math.min(ratio, 1) * 100}%` }}
          transition={reduced ? { duration: 0.15 } : { type: "spring", bounce: 0, duration: 0.6 }}
        />
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-line px-3.5 py-3">
      <span className="flex items-center gap-1.5 text-accent">{icon}</span>
      <div className="mt-2 text-[0.95rem] font-semibold tabular-nums">{value}</div>
      <div className="mt-0.5 text-[0.68rem] leading-snug text-subtle">{label}</div>
    </div>
  );
}
