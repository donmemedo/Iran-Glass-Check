"use client";

import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { formatNumber, formatToman } from "@/lib/format";
import type { Locale } from "@/lib/i18n";

interface CounterProps {
  value: number;
  locale: Locale;
  className?: string;
  decimals?: number;
  money?: boolean;
  duration?: number;
}

/** Counts up once the number is on screen — never re-runs on scroll-back. */
export function Counter({
  value,
  locale,
  className,
  decimals = 0,
  money = false,
  duration = 1100,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? value : 0);

  useEffect(() => {
    if (!inView || reduced) {
      if (reduced) setDisplay(value);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // easeOutExpo: fast commitment, gentle settle
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setDisplay(value * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, duration, reduced]);

  const text = money
    ? formatToman(Math.round(display), locale)
    : formatNumber(
        decimals ? Number(display.toFixed(decimals)) : Math.round(display),
        locale,
        decimals ? { minimumFractionDigits: decimals, maximumFractionDigits: decimals } : undefined,
      );

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {text}
    </span>
  );
}
