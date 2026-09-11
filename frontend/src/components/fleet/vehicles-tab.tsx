"use client";

import { ArrowUpDown, FileText, Search, Wrench } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, Plate } from "@/components/ui/primitives";
import { formatDate, formatNumber } from "@/lib/format";
import type { Dict, Locale } from "@/lib/i18n";
import type { Vehicle } from "@/lib/types";
import { cn, riskLevel } from "@/lib/utils";
import type { VehicleRow } from "./fleet-api";

type SortKey = "risk" | "mileage" | "lastCheck";
type RiskFilter = "all" | "low" | "medium" | "high";

const TONE = { low: "ok", medium: "warn", high: "crit" } as const;

function carLabel(vehicle: Vehicle, fa: boolean) {
  const parts = vehicle.model_name.split("|");
  return `${fa ? vehicle.make_fa : vehicle.make_en} ${fa ? parts[0] : (parts[1] ?? parts[0])}`;
}

export function VehiclesTab({
  rows,
  dict,
  locale,
}: {
  rows: VehicleRow[];
  dict: Dict;
  locale: Locale;
}) {
  const fa = locale === "fa";
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("risk");
  const [filter, setFilter] = useState<RiskFilter>("all");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows
      .filter(({ vehicle }) => {
        if (filter !== "all" && riskLevel(vehicle.risk_score) !== filter) return false;
        if (!needle) return true;
        return [
          vehicle.plate,
          vehicle.model_name,
          vehicle.make_fa,
          vehicle.make_en,
          vehicle.driver_name_fa,
          vehicle.driver_name_en,
        ]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      })
      .sort((a, b) => {
        if (sort === "mileage") return b.vehicle.mileage_km - a.vehicle.mileage_km;
        if (sort === "lastCheck") {
          return (
            new Date(b.vehicle.last_check_at ?? 0).getTime() -
            new Date(a.vehicle.last_check_at ?? 0).getTime()
          );
        }
        return b.vehicle.risk_score - a.vehicle.risk_score;
      });
  }, [rows, query, sort, filter]);

  const filters: { key: RiskFilter; label: string }[] = [
    { key: "all", label: dict.panel.vehicles.all },
    { key: "low", label: dict.panel.riskBuckets.healthy },
    { key: "medium", label: dict.panel.riskBuckets.watch },
    { key: "high", label: dict.panel.riskBuckets.critical },
  ];

  const sorts: { key: SortKey; label: string }[] = [
    { key: "risk", label: dict.panel.vehicles.risk },
    { key: "mileage", label: dict.panel.vehicles.mileage },
    { key: "lastCheck", label: dict.panel.vehicles.lastCheck },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative flex max-w-sm flex-1 items-center">
          <Search
            className="pointer-events-none absolute start-3.5 size-4 text-subtle"
            strokeWidth={1.8}
            aria-hidden
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={dict.panel.vehicles.search}
            aria-label={dict.panel.vehicles.search}
            className="h-11 w-full rounded-full border border-line bg-[color-mix(in_oklab,var(--panel)_70%,transparent)] ps-10 pe-4 text-[0.85rem] outline-none transition-colors placeholder:text-subtle focus:border-accent"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <div className="glass flex items-center rounded-full p-1" role="group" aria-label={dict.panel.vehicles.filterRisk}>
            {filters.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                aria-pressed={filter === item.key}
                className={cn(
                  "press h-8 rounded-full px-3 text-[0.75rem] transition-colors",
                  filter === item.key
                    ? "accent-gradient text-white"
                    : "text-muted hover:text-fg",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="glass flex items-center gap-1 rounded-full p-1">
            <ArrowUpDown className="ms-2 size-3.5 text-subtle" strokeWidth={1.8} aria-hidden />
            {sorts.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setSort(item.key)}
                aria-pressed={sort === item.key}
                className={cn(
                  "press h-8 rounded-full px-3 text-[0.75rem] transition-colors",
                  sort === item.key ? "bg-[color-mix(in_oklab,var(--fg)_10%,transparent)] text-fg" : "text-muted hover:text-fg",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="panel-card rounded-md p-8 text-center text-[0.85rem] text-subtle">
          {dict.panel.vehicles.empty}
        </p>
      ) : (
        <>
          {/* desktop */}
          <div className="hidden overflow-hidden rounded-lg border border-line lg:block">
            <table className="w-full border-collapse text-[0.82rem]">
              <thead>
                <tr className="bg-[color-mix(in_oklab,var(--fg)_5%,transparent)] text-start text-[0.72rem] text-subtle">
                  <th className="px-4 py-3 text-start font-medium">{dict.panel.vehicles.plate}</th>
                  <th className="px-4 py-3 text-start font-medium">{dict.panel.vehicles.car}</th>
                  <th className="px-4 py-3 text-start font-medium">{dict.panel.vehicles.driver}</th>
                  <th className="px-4 py-3 text-start font-medium">{dict.panel.vehicles.mileage}</th>
                  <th className="px-4 py-3 text-start font-medium">{dict.panel.vehicles.risk}</th>
                  <th className="px-4 py-3 text-start font-medium">{dict.panel.vehicles.lastCheck}</th>
                  <th className="px-4 py-3 text-start font-medium">{dict.panel.vehicles.issues}</th>
                  <th className="px-4 py-3 text-start font-medium">{dict.panel.vehicles.report}</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(({ vehicle, last_report_code }) => {
                  const level = riskLevel(vehicle.risk_score);
                  return (
                    <tr
                      key={vehicle.id}
                      className="border-t border-line transition-colors hover:bg-[color-mix(in_oklab,var(--fg)_4%,transparent)]"
                    >
                      <td className="px-4 py-3">
                        <Plate plate={vehicle.plate} locale={locale} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {carLabel(vehicle, fa)}
                          {vehicle.in_service && (
                            <Wrench
                              className="size-3.5 text-warn"
                              strokeWidth={1.9}
                              aria-label={dict.panel.kpi.inService}
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {fa ? vehicle.driver_name_fa : vehicle.driver_name_en}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-muted">
                        {formatNumber(vehicle.mileage_km, locale)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={TONE[level]}>
                          <span className="tabular-nums">
                            {formatNumber(vehicle.risk_score, locale)}
                          </span>
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {vehicle.last_check_at ? formatDate(vehicle.last_check_at, locale) : "—"}
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {vehicle.open_issues > 0 ? (
                          <span className="text-warn">
                            {formatNumber(vehicle.open_issues, locale)}
                          </span>
                        ) : (
                          <span className="text-subtle">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {last_report_code ? (
                          <Link
                            href={`/${locale}/report/${last_report_code}`}
                            className="press inline-flex items-center gap-1.5 text-accent hover:underline"
                          >
                            <FileText className="size-3.5" strokeWidth={1.9} />
                            {dict.panel.reports.view}
                          </Link>
                        ) : (
                          <span className="text-subtle">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* mobile */}
          <ul className="flex flex-col gap-3 lg:hidden">
            {visible.map(({ vehicle, last_report_code }) => {
              const level = riskLevel(vehicle.risk_score);
              return (
                <li key={vehicle.id} className="panel-card flex flex-col gap-3 rounded-md p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Plate plate={vehicle.plate} locale={locale} size="sm" />
                    <Badge tone={TONE[level]}>
                      <span className="tabular-nums">
                        {formatNumber(vehicle.risk_score, locale)}
                      </span>
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[0.88rem] font-medium">{carLabel(vehicle, fa)}</span>
                    <span className="text-[0.76rem] text-muted">
                      {fa ? vehicle.driver_name_fa : vehicle.driver_name_en}
                    </span>
                  </div>
                  <dl className="grid grid-cols-2 gap-2 text-[0.74rem]">
                    <div className="flex justify-between gap-2">
                      <dt className="text-subtle">{dict.panel.vehicles.mileage}</dt>
                      <dd className="tabular-nums">{formatNumber(vehicle.mileage_km, locale)}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-subtle">{dict.panel.vehicles.issues}</dt>
                      <dd className="tabular-nums">
                        {formatNumber(vehicle.open_issues, locale)}
                      </dd>
                    </div>
                    <div className="col-span-2 flex justify-between gap-2">
                      <dt className="text-subtle">{dict.panel.vehicles.lastCheck}</dt>
                      <dd>
                        {vehicle.last_check_at ? formatDate(vehicle.last_check_at, locale) : "—"}
                      </dd>
                    </div>
                  </dl>
                  {last_report_code && (
                    <Link
                      href={`/${locale}/report/${last_report_code}`}
                      className="press inline-flex items-center gap-1.5 text-[0.8rem] text-accent"
                    >
                      <FileText className="size-3.5" strokeWidth={1.9} />
                      {dict.panel.reports.view}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
