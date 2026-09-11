"use client";

import { motion, useReducedMotion } from "motion/react";
import { formatMonth, formatNumber } from "@/lib/format";
import type { Locale } from "@/lib/i18n";

interface TrendPoint {
  label: string;
  checks: number;
  critical: number;
}

const VIEW_W = 600;
const VIEW_H = 140;
const PLOT_H = 128;

/**
 * Hand-rolled so it inherits the theme tokens. Labels live in HTML rather than
 * inside the SVG, so text never stretches when the chart box changes shape.
 * The time axis stays left-to-right in both locales — mirroring it reads as a
 * different dataset.
 */
export function TrendChart({
  data,
  locale,
  title,
}: {
  data: TrendPoint[];
  locale: Locale;
  title: string;
}) {
  const reduced = useReducedMotion();
  const max = Math.max(...data.map((d) => d.checks), 1);
  const slot = VIEW_W / Math.max(data.length, 1);
  const barW = Math.min(slot * 0.44, 56);

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[0.82rem] font-semibold">{title}</h3>

      <div dir="ltr" className="w-full">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
          className="h-40 w-full"
          role="img"
          aria-label={title}
        >
          <defs>
            <linearGradient id="trend-bar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.95" />
              <stop offset="100%" stopColor="var(--accent-2)" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {[0, 0.5, 1].map((ratio) => (
            <line
              key={ratio}
              x1={0}
              x2={VIEW_W}
              y1={PLOT_H - PLOT_H * ratio}
              y2={PLOT_H - PLOT_H * ratio}
              stroke="var(--line)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              opacity={ratio === 0 ? 0.9 : 0.4}
              strokeDasharray={ratio === 0 ? undefined : "4 6"}
            />
          ))}

          {data.map((point, index) => {
            const height = point.checks ? Math.max((point.checks / max) * PLOT_H, 4) : 0;
            const x = slot * index + (slot - barW) / 2;
            const criticalHeight = point.checks
              ? (point.critical / point.checks) * height
              : 0;
            return (
              <g key={point.label}>
                <motion.rect
                  x={x}
                  width={barW}
                  rx={5}
                  fill="url(#trend-bar)"
                  initial={reduced ? false : { height: 0, y: PLOT_H }}
                  animate={{ height, y: PLOT_H - height }}
                  transition={{
                    type: "spring",
                    bounce: 0,
                    duration: 0.55,
                    delay: reduced ? 0 : index * 0.05,
                  }}
                />
                {criticalHeight > 0 && (
                  <rect
                    x={x}
                    y={PLOT_H - criticalHeight}
                    width={barW}
                    height={criticalHeight}
                    rx={5}
                    fill="var(--crit)"
                    opacity={0.85}
                  />
                )}
              </g>
            );
          })}
        </svg>

        <div
          className="mt-2 grid gap-1"
          style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}
        >
          {data.map((point) => (
            <span key={point.label} className="flex flex-col items-center gap-0.5">
              <span className="text-[0.8rem] font-semibold tabular-nums">
                {formatNumber(point.checks, locale)}
              </span>
              <span className="text-[0.65rem] text-subtle">
                {formatMonth(point.label, locale)}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
