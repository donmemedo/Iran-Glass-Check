"use client";

import { motion, useReducedMotion } from "motion/react";
import { Check, Copy, MessageSquare } from "lucide-react";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { formatDate, formatTime, formatToman } from "@/lib/format";
import type { Dict, Locale } from "@/lib/i18n";
import type { Booking } from "@/lib/types";

export function SuccessView({
  booking,
  locale,
  dict,
  onReset,
}: {
  booking: Booking;
  locale: Locale;
  dict: Dict;
  onReset: () => void;
}) {
  const reduced = useReducedMotion();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(booking.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — the code is on screen anyway */
    }
  };

  return (
    <motion.div
      className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center"
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", bounce: 0.12, duration: 0.6 }}
    >
      <motion.span
        className="accent-gradient grid size-16 place-items-center rounded-full text-white shadow-float"
        initial={reduced ? false : { scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.34, duration: 0.7, delay: 0.08 }}
      >
        <Check className="size-8" strokeWidth={2.6} />
      </motion.span>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">{dict.book.success.title}</h1>
        <p className="text-[0.92rem] text-muted">{dict.book.success.lead}</p>
      </div>

      <div className="glass-strong edge-light flex w-full flex-col items-center gap-3 rounded-lg p-6">
        <span className="text-[0.74rem] text-subtle">{dict.book.success.code}</span>
        <span
          dir="ltr"
          className="font-mono text-[1.75rem] font-semibold tracking-[0.12em] text-accent sm:text-[2.1rem]"
        >
          {booking.code}
        </span>
        <Button variant="glass" size="sm" onClick={copy}>
          {copied ? (
            <>
              <Check className="size-3.5" strokeWidth={2.4} />
              {dict.actions.copied}
            </>
          ) : (
            <>
              <Copy className="size-3.5" strokeWidth={1.9} />
              {dict.actions.copy}
            </>
          )}
        </Button>
        <span className="flex items-center gap-1.5 text-[0.72rem] text-subtle">
          <MessageSquare className="size-3.5" strokeWidth={1.8} />
          {dict.book.success.smsNote}
        </span>
      </div>

      <dl className="grid w-full grid-cols-2 gap-3 text-start">
        <div className="panel-card rounded-md p-4">
          <dt className="text-[0.7rem] text-subtle">{dict.track.slot}</dt>
          <dd className="mt-1 text-[0.84rem] font-medium">
            {formatDate(booking.slot_start, locale)}
            <span className="mx-1 text-subtle">·</span>
            {formatTime(booking.slot_start, locale)}
          </dd>
        </div>
        <div className="panel-card rounded-md p-4">
          <dt className="text-[0.7rem] text-subtle">{dict.track.estimate}</dt>
          <dd className="mt-1 text-[0.84rem] font-medium text-accent">
            {formatToman(booking.price_estimate, locale)}
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <ButtonLink href={`/${locale}/track?code=${booking.code}`} size="lg">
          {dict.book.success.trackCta}
        </ButtonLink>
        <Button variant="glass" size="lg" onClick={onReset}>
          {dict.book.success.newBooking}
        </Button>
      </div>
    </motion.div>
  );
}
