import { ArrowUpRight, Gauge, MapPin, Route, UserRound, Wrench } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PrintButton } from "@/components/report/print-button";
import { StatusChip } from "@/components/report/status-chip";
import { ButtonLink } from "@/components/ui/button";
import { Badge, Card, Eyebrow, Plate } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { RiskRing } from "@/components/ui/risk-ring";
import { api } from "@/lib/api";
import { formatDate, formatNumber, formatToman } from "@/lib/format";
import { getDict, isLocale, type Dict, type Locale } from "@/lib/i18n";
import type { CheckStatusKey, ReportResponse } from "@/lib/types";
import { riskLevel } from "@/lib/utils";

const PRINT_CSS = `
@media print {
  header, footer, .no-print { display: none !important; }
  [aria-hidden="true"].fixed { display: none !important; }
  html, body { background: #fff !important; color: #111 !important; }
  main { padding-top: 0 !important; }
  .glass, .glass-strong, .panel-card {
    background: #fff !important;
    backdrop-filter: none !important;
    box-shadow: none !important;
    border: 1px solid #d4d4d8 !important;
  }
  .print-break { break-inside: avoid; }
  a[href]::after { content: ""; }
}
`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}): Promise<Metadata> {
  const { locale, code } = await params;
  const dict = getDict(isLocale(locale) ? locale : "fa");
  return { title: `${dict.report.title} ${code.toUpperCase()}` };
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { locale, code } = await params;
  if (!isLocale(locale)) notFound();
  const typedLocale = locale as Locale;
  const dict = getDict(typedLocale);
  const fa = typedLocale === "fa";

  let data: ReportResponse;
  try {
    data = await api<ReportResponse>(`/api/reports/${encodeURIComponent(code)}`, {
      revalidate: 0,
    });
  } catch {
    notFound();
  }

  const { report, center, vehicle, referrals, results, counts } = data;
  const level = riskLevel(report.risk_score);
  const levelTone = level === "high" ? "crit" : level === "medium" ? "warn" : "ok";

  // Group by zone, keeping the technician's inspection order
  const zones: { zone: keyof Dict["checks"]["zones"]; items: typeof results }[] = [];
  for (const entry of results) {
    const zone = entry.checkpoint.zone;
    const bucket = zones.find((z) => z.zone === zone);
    if (bucket) bucket.items.push(entry);
    else zones.push({ zone, items: [entry] });
  }

  const meta = [
    {
      icon: Route,
      label: dict.report.vehicle,
      value: fa ? report.car_label_fa : report.car_label_en,
    },
    {
      icon: UserRound,
      label: dict.report.technician,
      value: fa ? report.technician_fa : report.technician_en,
    },
    {
      icon: MapPin,
      label: dict.report.center,
      value: center ? (fa ? center.name_fa : center.name_en) : "—",
    },
    {
      icon: Wrench,
      label: dict.report.duration,
      value: `${formatNumber(report.duration_min, typedLocale)} ${dict.pricing.minutes}`,
    },
    {
      icon: Gauge,
      label: dict.report.mileage,
      value: formatNumber(report.mileage_km, typedLocale),
    },
  ];

  const countItems: { key: CheckStatusKey; value: number }[] = [
    { key: "ok", value: counts.ok },
    { key: "attention", value: counts.attention },
    { key: "critical", value: counts.critical },
  ];

  return (
    <div className="shell py-10 sm:py-14">
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-3">
          <Eyebrow>{dict.report.title}</Eyebrow>
          <h1 className="text-2xl font-semibold sm:text-3xl">{dict.report.lead}</h1>
        </div>
        <div className="flex items-center gap-2">
          <PrintButton label={dict.actions.print} />
          <ButtonLink href={`/${typedLocale}/panel`} size="sm" variant="outline" className="no-print">
            {dict.panel.title}
            <ArrowUpRight className="size-3.5" />
          </ButtonLink>
        </div>
      </div>

      {/* ------------------------------ summary ------------------------------ */}
      <Reveal className="mt-8">
        <Card className="print-break grid gap-8 lg:grid-cols-[auto_1fr]">
          <div className="flex flex-col items-center gap-3">
            <RiskRing
              score={report.risk_score}
              locale={typedLocale}
              label={dict.report.riskScore}
              caption={dict.report.riskScore}
            />
            <Badge tone={levelTone}>{dict.report.riskLevels[level]}</Badge>
            <p className="max-w-[13rem] text-center text-[0.7rem] leading-relaxed text-subtle">
              {dict.report.riskHint}
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-[0.72rem] text-subtle">{dict.report.code}</span>
                <span className="font-mono text-lg font-semibold tracking-wide" dir="ltr">
                  {report.code}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[0.72rem] text-subtle">{dict.report.plate}</span>
                <Plate plate={report.plate} locale={typedLocale} />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[0.72rem] text-subtle">{dict.report.date}</span>
                <span className="text-[0.88rem] font-medium">
                  {formatDate(report.performed_at, typedLocale, true)}
                </span>
              </div>
            </div>

            <div className="rounded-md border border-line bg-[color-mix(in_oklab,var(--fg)_4%,transparent)] p-4">
              <h2 className="text-[0.78rem] font-semibold text-muted">{dict.report.summary}</h2>
              <p className="mt-2 text-[0.92rem] leading-relaxed">
                {fa ? report.summary_fa : report.summary_en}
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              {meta.map((item) => (
                <div key={item.label} className="flex items-start gap-2.5">
                  <item.icon
                    className="mt-0.5 size-3.5 shrink-0 text-accent"
                    strokeWidth={1.9}
                    aria-hidden
                  />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <dt className="text-[0.7rem] text-subtle">{item.label}</dt>
                    <dd className="truncate text-[0.84rem] font-medium">{item.value}</dd>
                  </div>
                </div>
              ))}
              {vehicle && (
                <div className="flex items-start gap-2.5">
                  <UserRound
                    className="mt-0.5 size-3.5 shrink-0 text-accent"
                    strokeWidth={1.9}
                    aria-hidden
                  />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <dt className="text-[0.7rem] text-subtle">
                      {dict.panel.vehicles.driver}
                    </dt>
                    <dd className="truncate text-[0.84rem] font-medium">
                      {fa ? vehicle.driver_name_fa : vehicle.driver_name_en}
                    </dd>
                  </div>
                </div>
              )}
            </dl>
          </div>
        </Card>
      </Reveal>

      {/* ------------------------------- counts ------------------------------ */}
      <Reveal className="mt-6" delay={0.05}>
        <div className="grid grid-cols-3 gap-3">
          {countItems.map((item) => (
            <div
              key={item.key}
              className="glass edge-light print-break flex flex-col items-center gap-2 rounded-md px-3 py-4 text-center"
            >
              <span
                className="text-2xl font-semibold tabular-nums"
                style={{
                  color:
                    item.key === "ok"
                      ? "var(--ok)"
                      : item.key === "attention"
                        ? "var(--warn)"
                        : "var(--crit)",
                }}
              >
                {formatNumber(item.value, typedLocale)}
              </span>
              <span className="text-[0.72rem] text-muted">{dict.report.counts[item.key]}</span>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ------------------------------ results ------------------------------ */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold">{dict.report.results}</h2>
        <div className="mt-5 flex flex-col gap-7">
          {zones.map((group, groupIndex) => (
            <Reveal key={group.zone} delay={groupIndex * 0.04}>
              <div className="print-break">
                <h3 className="mb-3 flex items-center gap-3 text-[0.78rem] font-medium text-subtle">
                  {dict.checks.zones[group.zone]}
                  <span className="h-px flex-1 bg-line" />
                </h3>
                <ul className="flex flex-col gap-2">
                  {group.items.map(({ result, checkpoint }) => {
                    const value = fa ? result.value_fa : result.value_en;
                    const note = fa ? result.note_fa : result.note_en;
                    return (
                      <li
                        key={checkpoint.code}
                        className="panel-card flex flex-col gap-2 rounded-md p-4 sm:flex-row sm:items-center sm:gap-5"
                      >
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <span className="text-[0.9rem] font-medium">
                            {fa ? checkpoint.title_fa : checkpoint.title_en}
                          </span>
                          <span className="text-[0.74rem] text-subtle">
                            {fa ? checkpoint.detail_fa : checkpoint.detail_en}
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          {value && <span className="text-[0.84rem] font-medium">{value}</span>}
                          {note && <span className="text-[0.74rem] text-muted">{note}</span>}
                        </div>
                        <StatusChip status={result.status} dict={dict} className="self-start sm:self-center" />
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ----------------------------- referrals ----------------------------- */}
      {referrals.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold">{dict.report.referrals}</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {referrals.map((referral, index) => (
              <Reveal key={referral.id} delay={index * 0.05}>
                <Card className="print-break flex h-full flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[0.7rem] text-subtle">{dict.report.partner}</span>
                      <span className="text-[0.95rem] font-semibold">
                        {fa ? referral.partner_fa : referral.partner_en}
                      </span>
                    </div>
                    <Badge
                      tone={
                        referral.status === "done"
                          ? "ok"
                          : referral.status === "declined"
                            ? "crit"
                            : referral.status === "approved"
                              ? "accent"
                              : "neutral"
                      }
                    >
                      {dict.referralStatus[referral.status]}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[0.7rem] text-subtle">{dict.report.referralJob}</span>
                    <span className="text-[0.86rem]">{fa ? referral.job_fa : referral.job_en}</span>
                  </div>
                  <div className="mt-auto grid grid-cols-2 gap-3 border-t border-line pt-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[0.7rem] text-subtle">{dict.report.estimatedCost}</span>
                      <span className="text-[0.86rem] font-semibold tabular-nums">
                        {formatToman(referral.estimated_cost, typedLocale)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[0.7rem] text-subtle">{dict.report.avoidedCost}</span>
                      <span className="text-[0.86rem] font-semibold tabular-nums text-ok">
                        {formatToman(referral.avoided_cost, typedLocale)}
                      </span>
                    </div>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <p className="mt-10 text-center text-[0.72rem] text-subtle">
        {dict.report.scanHint} · {dict.report.demoNote}
      </p>
    </div>
  );
}
