"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Building2,
  CalendarClock,
  Car,
  Check,
  FileText,
  Search,
  SearchX,
  Wrench,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge, Card, Eyebrow, Plate } from "@/components/ui/primitives";
import { formatDate, formatTime, formatToman, toLocaleDigits } from "@/lib/format";
import type { Dict, Locale } from "@/lib/i18n";
import type { TrackResponse } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TrackView({
  locale,
  dict,
  initialCode,
}: {
  locale: Locale;
  dict: Dict;
  initialCode: string;
}) {
  const reduced = useReducedMotion();
  const fa = locale === "fa";
  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState<TrackResponse | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "missing" | "found">("idle");

  const lookup = useCallback(async (raw: string) => {
    const trimmed = raw.trim().toUpperCase();
    if (!trimmed) return;
    setState("loading");
    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(trimmed)}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        setResult(null);
        setState("missing");
        return;
      }
      setResult((await res.json()) as TrackResponse);
      setState("found");
    } catch {
      setResult(null);
      setState("missing");
    }
  }, []);

  useEffect(() => {
    if (initialCode) void lookup(initialCode);
  }, [initialCode, lookup]);

  const booking = result?.booking;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Eyebrow>{dict.nav.track}</Eyebrow>
        <h1 className="text-3xl font-semibold sm:text-4xl">{dict.track.title}</h1>
        <p className="max-w-xl text-[0.95rem] text-muted">{dict.track.lead}</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void lookup(code);
        }}
        className="flex flex-col gap-2 sm:max-w-xl"
      >
        <div className="glass edge-light flex items-center gap-2 rounded-full p-1.5 ps-4">
          <Search className="size-4 shrink-0 text-subtle" strokeWidth={1.9} />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={dict.track.placeholder}
            dir="ltr"
            aria-label={dict.track.title}
            className="h-10 min-w-0 flex-1 bg-transparent font-mono text-[0.92rem] tracking-wide text-fg outline-none placeholder:font-sans placeholder:tracking-normal placeholder:text-subtle"
          />
          <Button type="submit" disabled={state === "loading" || !code.trim()}>
            {state === "loading" ? dict.common.loading : dict.track.submit}
          </Button>
        </div>
        {state === "idle" && !code && (
          <p className="ps-4 text-[0.75rem] text-subtle">{dict.track.demoHint}</p>
        )}
      </form>

      <AnimatePresence mode="wait">
        {state === "missing" && (
          <motion.div
            key="missing"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          >
            <Card className="flex flex-col items-center gap-2 py-10 text-center">
              <SearchX className="size-7 text-subtle" strokeWidth={1.6} />
              <p className="text-[0.92rem] font-medium">{dict.track.notFound}</p>
              <p className="text-[0.8rem] text-muted">{dict.track.notFoundHint}</p>
            </Card>
          </motion.div>
        )}

        {state === "found" && result && booking && (
          <motion.div
            key={booking.code}
            className="grid gap-6 lg:grid-cols-[1fr_20rem]"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
          >
            {/* timeline */}
            <Card className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span
                  dir="ltr"
                  className="font-mono text-[1.05rem] font-semibold tracking-wider text-accent"
                >
                  {booking.code}
                </span>
                {result.canceled ? (
                  <Badge tone="crit">{dict.status.canceled}</Badge>
                ) : (
                  <Badge tone="accent">{dict.status[booking.status]}</Badge>
                )}
              </div>

              <ol className="relative flex flex-col gap-0">
                {result.timeline.map((node, index) => {
                  const last = index === result.timeline.length - 1;
                  return (
                    <li key={node.status} className="flex gap-3.5">
                      <div className="flex flex-col items-center">
                        <span
                          className={cn(
                            "relative grid size-7 shrink-0 place-items-center rounded-full transition-colors",
                            node.reached
                              ? "accent-gradient text-white"
                              : "border border-line text-transparent",
                          )}
                        >
                          <Check className="size-3.5" strokeWidth={3} />
                          {node.current && !reduced && (
                            <span
                              aria-hidden
                              className="absolute inset-0 rounded-full border-2 border-accent [animation:pulse-ring_1.9s_ease-out_infinite]"
                            />
                          )}
                        </span>
                        {!last && (
                          <span
                            className={cn(
                              "w-px flex-1 transition-colors",
                              node.reached ? "bg-accent/50" : "bg-line",
                            )}
                          />
                        )}
                      </div>
                      <div className={cn("pb-6", last && "pb-0")}>
                        <span
                          className={cn(
                            "text-[0.9rem]",
                            node.current
                              ? "font-semibold text-fg"
                              : node.reached
                                ? "text-fg"
                                : "text-subtle",
                          )}
                        >
                          {dict.status[node.status]}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ol>

              {booking.report_code && (
                <div className="glass-strong flex flex-wrap items-center justify-between gap-3 rounded-md p-4">
                  <span className="flex items-center gap-2.5 text-[0.86rem] font-medium">
                    <FileText className="size-4 text-accent" strokeWidth={1.9} />
                    {dict.track.reportReady}
                  </span>
                  <ButtonLink
                    href={`/${locale}/report/${booking.report_code}`}
                    size="sm"
                    variant="glass"
                  >
                    {dict.track.viewReport}
                  </ButtonLink>
                </div>
              )}
            </Card>

            {/* details */}
            <Card className="flex flex-col gap-4">
              <DetailRow
                icon={Wrench}
                label={dict.track.service}
                value={
                  result.service ? (fa ? result.service.name_fa : result.service.name_en) : "—"
                }
                sub={
                  booking.mode === "mobile"
                    ? dict.book.service.mobile
                    : dict.book.service.onsite
                }
              />
              <DetailRow
                icon={Building2}
                label={dict.track.center}
                value={result.center ? (fa ? result.center.name_fa : result.center.name_en) : "—"}
                sub={
                  booking.address ??
                  (result.center ? (fa ? result.center.address_fa : result.center.address_en) : undefined)
                }
              />
              <DetailRow
                icon={CalendarClock}
                label={dict.track.slot}
                value={formatDate(booking.slot_start, locale)}
                sub={formatTime(booking.slot_start, locale)}
              />
              <DetailRow
                icon={Car}
                label={dict.track.vehicle}
                value={[booking.car_make, booking.car_model].filter(Boolean).join(" ") || "—"}
                sub={booking.car_year ? toLocaleDigits(booking.car_year, locale) : undefined}
                extra={
                  booking.plate ? (
                    <Plate plate={booking.plate} locale={locale} size="sm" className="mt-2" />
                  ) : null
                }
              />
              <div className="flex items-baseline justify-between border-t border-line pt-3.5">
                <span className="text-[0.76rem] text-muted">{dict.track.estimate}</span>
                <span className="text-[0.98rem] font-semibold text-accent">
                  {formatToman(booking.price_estimate, locale)}
                </span>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  sub,
  extra,
}: {
  icon: typeof Wrench;
  label: string;
  value: string;
  sub?: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={1.9} />
      <div className="flex min-w-0 flex-col">
        <span className="text-[0.7rem] text-subtle">{label}</span>
        <span className="text-[0.86rem] font-medium break-words">{value}</span>
        {sub && <span className="mt-0.5 text-[0.74rem] text-muted">{sub}</span>}
        {extra}
      </div>
    </div>
  );
}
