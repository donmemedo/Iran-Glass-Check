"use client";

import { Check, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge, Plate } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { formatDate, formatToman } from "@/lib/format";
import type { Dict, Locale } from "@/lib/i18n";
import type { ReferralStatusKey } from "@/lib/types";
import { fleetFetch, Unauthorized, type ReferralRow } from "./fleet-api";

const TONE: Record<ReferralStatusKey, "ok" | "warn" | "crit" | "accent" | "neutral"> = {
  pending: "warn",
  approved: "accent",
  done: "ok",
  declined: "crit",
};

export function ReferralsTab({
  rows,
  dict,
  locale,
  token,
  onUnauthorized,
}: {
  rows: ReferralRow[];
  dict: Dict;
  locale: Locale;
  token: string;
  onUnauthorized: () => void;
}) {
  const fa = locale === "fa";
  const [items, setItems] = useState(rows);
  const [pending, setPending] = useState<number | null>(null);

  const update = async (id: number, status: ReferralStatusKey) => {
    const previous = items;
    setPending(id);
    setItems((current) =>
      current.map((row) =>
        row.referral.id === id ? { ...row, referral: { ...row.referral, status } } : row,
      ),
    );
    try {
      await fleetFetch(`/api/fleet/referrals/${id}?status=${status}`, token, { method: "PATCH" });
    } catch (error) {
      setItems(previous);
      if (error instanceof Unauthorized) onUnauthorized();
    } finally {
      setPending(null);
    }
  };

  if (items.length === 0) {
    return (
      <p className="panel-card rounded-md p-8 text-center text-[0.85rem] text-subtle">
        {dict.panel.referrals.empty}
      </p>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((row, index) => {
        const { referral } = row;
        const busy = pending === referral.id;
        return (
          <Reveal key={referral.id} delay={Math.min(index * 0.04, 0.2)}>
            <div className="panel-card flex h-full flex-col gap-4 rounded-md p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[0.7rem] text-subtle">{dict.panel.referrals.partner}</span>
                  <span className="text-[0.92rem] font-semibold">
                    {fa ? referral.partner_fa : referral.partner_en}
                  </span>
                </div>
                <Badge tone={TONE[referral.status]}>{dict.referralStatus[referral.status]}</Badge>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[0.7rem] text-subtle">{dict.panel.referrals.job}</span>
                <span className="text-[0.85rem]">{fa ? referral.job_fa : referral.job_en}</span>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                {row.plate && (
                  <div className="flex items-center gap-2">
                    <span className="text-[0.7rem] text-subtle">
                      {dict.panel.referrals.plate}
                    </span>
                    <Plate plate={row.plate} locale={locale} size="sm" />
                  </div>
                )}
                {row.report_code && (
                  <Link
                    href={`/${locale}/report/${row.report_code}`}
                    className="press font-mono text-[0.74rem] text-accent hover:underline"
                    dir="ltr"
                  >
                    {row.report_code}
                  </Link>
                )}
                <span className="text-[0.72rem] text-subtle">
                  {formatDate(referral.created_at, locale)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-line pt-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[0.7rem] text-subtle">{dict.panel.referrals.cost}</span>
                  <span className="text-[0.84rem] font-semibold tabular-nums">
                    {formatToman(referral.estimated_cost, locale)}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[0.7rem] text-subtle">{dict.panel.referrals.avoided}</span>
                  <span className="text-[0.84rem] font-semibold tabular-nums text-ok">
                    {formatToman(referral.avoided_cost, locale)}
                  </span>
                </div>
              </div>

              {referral.status === "pending" && (
                <div className="mt-auto flex items-center gap-2">
                  <Button
                    size="sm"
                    disabled={busy}
                    onClick={() => void update(referral.id, "approved")}
                    className="flex-1"
                  >
                    <Check className="size-3.5" strokeWidth={2.4} />
                    {dict.actions.approve}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => void update(referral.id, "declined")}
                  >
                    <X className="size-3.5" strokeWidth={2.4} />
                    {dict.actions.decline}
                  </Button>
                </div>
              )}

              {referral.status === "approved" && (
                <Button
                  size="sm"
                  variant="glass"
                  disabled={busy}
                  onClick={() => void update(referral.id, "done")}
                  className="mt-auto"
                >
                  <Check className="size-3.5" strokeWidth={2.4} />
                  {dict.actions.done}
                </Button>
              )}
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
