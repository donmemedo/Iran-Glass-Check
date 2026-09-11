"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function StepRail({
  steps,
  current,
  locale,
  ofLabel,
  onJump,
}: {
  steps: string[];
  current: number;
  locale: Locale;
  ofLabel: string;
  onJump: (index: number) => void;
}) {
  const progress = ((current + 1) / steps.length) * 100;

  return (
    <>
      {/* compact progress on small screens */}
      <div className="flex flex-col gap-2 sm:hidden">
        <div className="flex items-baseline justify-between">
          <span className="text-[0.9rem] font-medium">{steps[current]}</span>
          <span className="text-[0.75rem] tabular-nums text-subtle">
            {formatNumber(current + 1, locale)} {ofLabel} {formatNumber(steps.length, locale)}
          </span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-line">
          <motion.div
            className="h-full accent-gradient"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
          />
        </div>
      </div>

      {/* full rail from sm up */}
      <ol className="hidden items-center gap-2 sm:flex">
        {steps.map((step, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li key={step} className="flex flex-1 items-center gap-2">
              <button
                type="button"
                disabled={index > current}
                onClick={() => onJump(index)}
                className={cn(
                  "press flex items-center gap-2.5 rounded-full py-1.5 pe-3.5 ps-1.5 transition-colors",
                  active && "glass",
                  index > current ? "cursor-default" : "cursor-pointer hover:text-fg",
                )}
              >
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full text-[0.75rem] font-semibold tabular-nums transition-colors",
                    done && "bg-ok text-white",
                    active && "accent-gradient text-white",
                    !done && !active && "border border-line text-subtle",
                  )}
                >
                  {done ? (
                    <Check className="size-3.5" strokeWidth={3} />
                  ) : (
                    formatNumber(index + 1, locale)
                  )}
                </span>
                <span
                  className={cn(
                    "text-[0.82rem] whitespace-nowrap",
                    active ? "font-medium text-fg" : "text-muted",
                  )}
                >
                  {step}
                </span>
              </button>
              {index < steps.length - 1 && (
                <span className="h-px flex-1 bg-line" aria-hidden />
              )}
            </li>
          );
        })}
      </ol>
    </>
  );
}
