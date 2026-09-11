"use client";

import { Building2, CalendarClock, MapPin, Truck, Wrench } from "lucide-react";
import { formatDate, formatTime, formatToman } from "@/lib/format";
import type { Dict, Locale } from "@/lib/i18n";
import type { Center, Service } from "@/lib/types";
import type { Mode } from "./steps";

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wrench;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={1.9} />
      <div className="flex min-w-0 flex-col">
        <span className="text-[0.7rem] text-subtle">{label}</span>
        <span className="text-[0.84rem] font-medium break-words">{value}</span>
      </div>
    </div>
  );
}

export function SummaryPanel({
  service,
  center,
  mode,
  slot,
  locale,
  dict,
}: {
  service: Service | null;
  center: Center | null;
  mode: Mode;
  slot: string | null;
  locale: Locale;
  dict: Dict;
}) {
  const fa = locale === "fa";

  return (
    <aside className="glass edge-light sticky top-[calc(var(--nav-h)+1.5rem)] flex flex-col gap-4 rounded-lg p-5">
      <h3 className="text-[0.9rem] font-semibold">{dict.book.details.summary}</h3>

      <div className="flex flex-col gap-3.5">
        <Row
          icon={mode === "mobile" ? Truck : Wrench}
          label={dict.track.service}
          value={
            service
              ? `${fa ? service.name_fa : service.name_en} — ${
                  mode === "mobile" ? dict.book.service.mobile : dict.book.service.onsite
                }`
              : "—"
          }
        />
        <Row
          icon={mode === "mobile" ? MapPin : Building2}
          label={dict.track.center}
          value={center ? (fa ? center.name_fa : center.name_en) : "—"}
        />
        <Row
          icon={CalendarClock}
          label={dict.track.slot}
          value={slot ? `${formatDate(slot, locale)} — ${formatTime(slot, locale)}` : "—"}
        />
      </div>

      {service && (
        <div className="flex items-baseline justify-between border-t border-line pt-3.5">
          <span className="text-[0.76rem] text-muted">{dict.book.details.estimate}</span>
          <span className="text-[1rem] font-semibold text-accent">
            {formatToman(service.price_from, locale)}
          </span>
        </div>
      )}
    </aside>
  );
}
