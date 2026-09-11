"use client";

import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { cn, riskLevel } from "@/lib/utils";

const LEVEL_COLOR = {
  low: "var(--ok)",
  medium: "var(--warn)",
  high: "var(--crit)",
} as const;

interface RiskRingProps {
  score: number;
  locale: Locale;
  label?: string;
  caption?: string;
  size?: number;
  className?: string;
}

/** The score arc sweeps in once, then holds — it is data, not decoration. */
export function RiskRing({
  score,
  locale,
  label,
  caption,
  size = 168,
  className,
}: RiskRingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(reduced ? score : 0);
  const level = riskLevel(score);
  const color = LEVEL_COLOR[level];

  useEffect(() => {
    if (!inView || reduced) {
      if (reduced) setShown(score);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / 1200, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(score * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, score, reduced]);

  const stroke = size * 0.075;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - shown / 100);

  return (
    <div
      ref={ref}
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <div
        aria-hidden
        className="absolute inset-[14%] rounded-full blur-2xl"
        style={{ background: color, opacity: 0.22 }}
      />
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={label}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--line)"
          strokeWidth={stroke}
          opacity={0.55}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <div
          className="font-semibold tabular-nums"
          style={{ fontSize: size * 0.27, color, lineHeight: 1 }}
        >
          {formatNumber(Math.round(shown), locale)}
        </div>
        {caption && (
          <div className="mt-1 text-[0.68rem] font-medium text-muted">{caption}</div>
        )}
      </div>
    </div>
  );
}
