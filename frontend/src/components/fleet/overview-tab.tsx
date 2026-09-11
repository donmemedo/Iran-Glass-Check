"use client";

import { AlertTriangle, CarFront, ClipboardCheck, Send, Timer, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { Counter } from "@/components/ui/counter";
import { Reveal } from "@/components/ui/reveal";
import { RiskRing } from "@/components/ui/risk-ring";
import { formatNumber, formatToman } from "@/lib/format";
import type { Dict, Locale } from "@/lib/i18n";
import type { FleetOverview } from "@/lib/types";
import { TrendChart } from "./trend-chart";

const BUCKET_COLOR = {
  healthy: "var(--ok)",
  watch: "var(--warn)",
  critical: "var(--crit)",
} as const;

export function OverviewTab({
  data,
  dict,
  locale,
}: {
  data: FleetOverview;
  dict: Dict;
  locale: Locale;
}) {
  const { kpi, risk_buckets, top_issues, trend } = data;
  const fa = locale === "fa";

  const tiles: { icon: LucideIcon; label: string; value: number; tone?: string }[] = [
    { icon: CarFront, label: dict.panel.kpi.vehicles, value: kpi.vehicles },
    { icon: ClipboardCheck, label: dict.panel.kpi.checks30d, value: kpi.checks_30d },
    {
      icon: AlertTriangle,
      label: dict.panel.kpi.highRisk,
      value: kpi.high_risk,
      tone: kpi.high_risk > 0 ? "var(--crit)" : undefined,
    },
    {
      icon: Send,
      label: dict.panel.kpi.openReferrals,
      value: kpi.open_referrals,
      tone: kpi.open_referrals > 0 ? "var(--warn)" : undefined,
    },
    { icon: Wrench, label: dict.panel.kpi.inService, value: kpi.in_service },
    { icon: Timer, label: dict.panel.kpi.dueSoon, value: kpi.due_soon },
  ];

  const totalBuckets =
    risk_buckets.healthy + risk_buckets.watch + risk_buckets.critical || 1;
  const buckets = (["healthy", "watch", "critical"] as const).map((key) => ({
    key,
    value: risk_buckets[key],
    percent: (risk_buckets[key] / totalBuckets) * 100,
  }));

  const maxIssue = Math.max(...top_issues.map((issue) => issue.count), 1);

  return (
    <div className="flex flex-col gap-5">
      <Reveal>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {tiles.map((tile) => (
            <div key={tile.label} className="glass edge-light rounded-md px-4 py-4">
              <tile.icon className="size-4 text-accent" strokeWidth={1.8} aria-hidden />
              <div
                className="mt-3 text-2xl font-semibold tabular-nums"
                style={tile.tone ? { color: tile.tone } : undefined}
              >
                <Counter value={tile.value} locale={locale} />
              </div>
              <div className="mt-1 text-[0.7rem] leading-snug text-muted">{tile.label}</div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* --------------------------- the economics --------------------------- */}
      <Reveal delay={0.05}>
        <Card className="grid gap-5 sm:grid-cols-3">
          {[
            {
              label: dict.panel.kpi.avoided,
              value: kpi.avoided_cost,
              color: "var(--ok)",
            },
            {
              label: dict.panel.kpi.programCost,
              value: kpi.program_cost,
              color: "var(--fg)",
            },
            {
              label: dict.panel.kpi.netSaving,
              value: kpi.net_saving,
              color: kpi.net_saving >= 0 ? "var(--ok)" : "var(--crit)",
            },
          ].map((item) => (
            <div key={item.label} className="flex flex-col gap-1.5">
              <span className="text-[0.72rem] text-subtle">{item.label}</span>
              <span
                className="text-xl font-semibold tabular-nums"
                style={{ color: item.color }}
              >
                {formatToman(item.value, locale)}
              </span>
            </div>
          ))}
        </Card>
      </Reveal>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* ------------------------ risk distribution ------------------------ */}
        <Reveal delay={0.08}>
          <Card className="flex h-full flex-col gap-5">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-[0.82rem] font-semibold">{dict.panel.kpi.avgRisk}</h3>
              <RiskRing
                score={kpi.avg_risk}
                locale={locale}
                label={dict.panel.kpi.avgRisk}
                size={92}
              />
            </div>

            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--fg)_8%,transparent)]">
              {buckets.map((bucket) =>
                bucket.percent > 0 ? (
                  <span
                    key={bucket.key}
                    style={{
                      width: `${bucket.percent}%`,
                      background: BUCKET_COLOR[bucket.key],
                    }}
                    className="h-full transition-[width] duration-700"
                  />
                ) : null,
              )}
            </div>

            <ul className="flex flex-col gap-2.5">
              {buckets.map((bucket) => (
                <li key={bucket.key} className="flex items-center gap-2.5 text-[0.8rem]">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: BUCKET_COLOR[bucket.key] }}
                  />
                  <span className="text-muted">{dict.panel.riskBuckets[bucket.key]}</span>
                  <span className="ms-auto font-semibold tabular-nums">
                    {formatNumber(bucket.value, locale)}
                  </span>
                  <span className="w-12 text-end text-[0.72rem] tabular-nums text-subtle">
                    {formatNumber(Math.round(bucket.percent), locale)}٪
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>

        {/* --------------------------- top issues --------------------------- */}
        <Reveal delay={0.11}>
          <Card className="flex h-full flex-col gap-4">
            <h3 className="text-[0.82rem] font-semibold">{dict.panel.topIssues}</h3>
            <ul className="flex flex-col gap-3">
              {top_issues.map((issue) => (
                <li key={issue.code} className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[0.82rem]">{fa ? issue.title_fa : issue.title_en}</span>
                    <span className="text-[0.78rem] font-semibold tabular-nums text-muted">
                      {formatNumber(issue.count, locale)}
                    </span>
                  </div>
                  <span className="h-1.5 w-full overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--fg)_8%,transparent)]">
                    <span
                      className="accent-gradient block h-full rounded-full transition-[width] duration-700"
                      style={{ width: `${(issue.count / maxIssue) * 100}%` }}
                    />
                  </span>
                </li>
              ))}
              {top_issues.length === 0 && (
                <li className="text-[0.8rem] text-subtle">{dict.common.empty}</li>
              )}
            </ul>
          </Card>
        </Reveal>
      </div>

      <Reveal delay={0.14}>
        <Card>
          <TrendChart data={trend} locale={locale} title={dict.panel.trend} />
        </Card>
      </Reveal>
    </div>
  );
}
