"use client";

import { motion } from "motion/react";
import { CalendarX2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatDayNumber, formatMonth, formatTime, formatWeekday } from "@/lib/format";
import type { Dict, Locale } from "@/lib/i18n";
import type { Slot } from "@/lib/types";
import { cn } from "@/lib/utils";

const dayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

export function SlotStep({
  centerSlug,
  selected,
  onSelect,
  locale,
  dict,
}: {
  centerSlug: string;
  selected: string | null;
  onSelect: (iso: string) => void;
  locale: Locale;
  dict: Dict;
}) {
  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 10 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      date.setHours(0, 0, 0, 0);
      return date;
    });
  }, []);

  const [activeDay, setActiveDay] = useState(() => dayKey(days[0]));
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/bookings/slots?center_slug=${centerSlug}&day=${activeDay}`, {
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("slots"))))
      .then((data: { slots: Slot[] }) => {
        if (!cancelled) setSlots(data.slots);
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [centerSlug, activeDay]);

  const available = slots?.filter((slot) => slot.available) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold sm:text-2xl">{dict.book.slot.title}</h2>

      {/* day strip */}
      <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1">
        {days.map((date, index) => {
          const key = dayKey(date);
          const active = key === activeDay;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveDay(key)}
              aria-pressed={active}
              className={cn(
                "press relative flex min-w-[4.6rem] shrink-0 snap-start flex-col items-center gap-0.5 rounded-md border px-3 py-2.5 transition-colors",
                active
                  ? "border-transparent text-white"
                  : "border-line text-muted hover:border-line-strong hover:text-fg",
              )}
            >
              {active && (
                <motion.span
                  layoutId="day-pill"
                  className="accent-gradient absolute inset-0 rounded-md"
                  transition={{ type: "spring", bounce: 0.14, duration: 0.4 }}
                />
              )}
              <span className="relative z-10 text-[0.68rem]">
                {index === 0 ? dict.book.slot.today : formatWeekday(date, locale)}
              </span>
              <span className="relative z-10 text-[1.05rem] font-semibold tabular-nums">
                {formatDayNumber(date, locale)}
              </span>
              <span className="relative z-10 text-[0.62rem] opacity-80">
                {formatMonth(date, locale)}
              </span>
            </button>
          );
        })}
      </div>

      {/* slots */}
      {loading ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="h-11 animate-pulse rounded-md bg-[color-mix(in_oklab,var(--fg)_7%,transparent)]"
            />
          ))}
        </div>
      ) : available.length === 0 ? (
        <div className="glass flex flex-col items-center gap-2 rounded-lg px-6 py-10 text-center">
          <CalendarX2 className="size-6 text-subtle" strokeWidth={1.6} />
          <p className="text-[0.86rem] text-muted">{dict.book.slot.noSlots}</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {slots?.map((slot) => {
            const active = selected === slot.start;
            return (
              <button
                key={slot.start}
                type="button"
                disabled={!slot.available}
                onClick={() => onSelect(slot.start)}
                aria-pressed={active}
                title={slot.available ? undefined : dict.book.slot.taken}
                className={cn(
                  "press h-11 rounded-md border text-[0.82rem] font-medium tabular-nums transition-colors",
                  active && "accent-gradient border-transparent text-white shadow-raised",
                  !active &&
                    slot.available &&
                    "border-line bg-[color-mix(in_oklab,var(--panel)_55%,transparent)] text-fg hover:border-accent",
                  !slot.available &&
                    "cursor-not-allowed border-dashed border-line text-subtle opacity-55",
                )}
              >
                {formatTime(slot.start, locale)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
