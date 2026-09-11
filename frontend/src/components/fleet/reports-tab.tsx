"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Badge, Plate } from "@/components/ui/primitives";
import { formatDate, formatNumber } from "@/lib/format";
import type { Dict, Locale } from "@/lib/i18n";
import type { CheckReport } from "@/lib/types";
import { riskLevel } from "@/lib/utils";

const TONE = { low: "ok", medium: "warn", high: "crit" } as const;

export function ReportsTab({
  reports,
  dict,
  locale,
}: {
  reports: CheckReport[];
  dict: Dict;
  locale: Locale;
}) {
  const fa = locale === "fa";
  const Chevron = fa ? ChevronLeft : ChevronRight;

  if (reports.length === 0) {
    return (
      <p className="panel-card rounded-md p-8 text-center text-[0.85rem] text-subtle">
        {dict.common.empty}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {reports.map((report) => {
        const level = riskLevel(report.risk_score);
        return (
          <li key={report.id}>
            <Link
              href={`/${locale}/report/${report.code}`}
              className="press panel-card flex flex-wrap items-center gap-x-5 gap-y-3 rounded-md p-4 transition-colors hover:border-[color-mix(in_oklab,var(--accent)_45%,transparent)]"
            >
              <span
                className="font-mono text-[0.8rem] font-semibold tracking-wide text-accent"
                dir="ltr"
              >
                {report.code}
              </span>
              <Plate plate={report.plate} locale={locale} size="sm" />
              <span className="text-[0.82rem]">{fa ? report.car_label_fa : report.car_label_en}</span>
              <span className="text-[0.76rem] text-muted">
                {formatDate(report.performed_at, locale)}
              </span>
              <Badge tone={TONE[level]} className="ms-auto">
                <span className="tabular-nums">{formatNumber(report.risk_score, locale)}</span>
              </Badge>
              <Chevron className="size-4 text-subtle" strokeWidth={1.9} aria-hidden />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
