"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { clamp, cn, rubberband } from "@/lib/utils";

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  label: string;
  display: ReactNode;
  className?: string;
}

/**
 * Pointer-driven, 1:1 with the finger. Past either end the thumb resists
 * instead of stopping dead — the value clamps, the material gives a little.
 */
export function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  display,
  className,
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [overshoot, setOvershoot] = useState(0);

  const percent = ((value - min) / (max - min)) * 100;

  const valueFromPointer = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return { value, past: 0 };
      const rect = track.getBoundingClientRect();
      const rtl = getComputedStyle(track).direction === "rtl";
      const raw = (clientX - rect.left) / rect.width;
      const ratio = rtl ? 1 - raw : raw;
      const past = ratio < 0 ? ratio : ratio > 1 ? ratio - 1 : 0;
      const next = min + clamp(ratio, 0, 1) * (max - min);
      return { value: Math.round(next / step) * step, past: past * rect.width };
    },
    [max, min, step, value],
  );

  const apply = (clientX: number) => {
    const { value: next, past } = valueFromPointer(clientX);
    setOvershoot(past === 0 ? 0 : rubberband(past, trackRef.current?.offsetWidth ?? 300) * 0.35);
    if (next !== value) onChange(clamp(next, min, max));
  };

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[0.82rem] text-muted">{label}</span>
        <span className="text-[0.95rem] font-semibold tabular-nums">{display}</span>
      </div>

      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        className="relative h-11 cursor-grab touch-none select-none active:cursor-grabbing"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
          apply(e.clientX);
        }}
        onPointerMove={(e) => {
          if (!dragging) return;
          apply(e.clientX);
        }}
        onPointerUp={(e) => {
          e.currentTarget.releasePointerCapture(e.pointerId);
          setDragging(false);
          setOvershoot(0);
        }}
        onPointerCancel={() => {
          setDragging(false);
          setOvershoot(0);
        }}
        onKeyDown={(e) => {
          const big = (max - min) / 10;
          const map: Record<string, number> = {
            ArrowRight: step,
            ArrowUp: step,
            ArrowLeft: -step,
            ArrowDown: -step,
            PageUp: big,
            PageDown: -big,
          };
          if (e.key === "Home") return onChange(min);
          if (e.key === "End") return onChange(max);
          const delta = map[e.key];
          if (delta === undefined) return;
          e.preventDefault();
          onChange(clamp(Math.round((value + delta) / step) * step, min, max));
        }}
      >
        <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--fg)_10%,transparent)]">
          <div
            className="accent-gradient absolute inset-y-0 inset-inline-start-0 rounded-full"
            style={{
              insetInlineStart: 0,
              width: `${percent}%`,
              transition: dragging ? "none" : "width 220ms var(--ease-glass)",
            }}
          />
        </div>

        <div
          className="absolute top-1/2 -translate-y-1/2"
          style={{
            insetInlineStart: `${percent}%`,
            marginInlineStart: `calc(-0.875rem + ${overshoot}px)`,
            transition: dragging ? "none" : "inset-inline-start 220ms var(--ease-glass)",
          }}
        >
          <span
            className={cn(
              "block size-7 rounded-full border-2 border-[var(--bg)] bg-[var(--accent)] shadow-raised transition-transform duration-150",
              dragging && "scale-110",
            )}
          />
        </div>
      </div>
    </div>
  );
}
