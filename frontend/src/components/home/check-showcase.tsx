"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { Badge, SectionHead } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { toLocaleDigits } from "@/lib/format";
import type { Dict, Locale } from "@/lib/i18n";
import type { Checkpoint } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CheckShowcase({
  dict,
  locale,
  checkpoints,
}: {
  dict: Dict;
  locale: Locale;
  checkpoints: Checkpoint[];
}) {
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (touched || reduced || checkpoints.length === 0) return;
    const id = setInterval(() => setActive((i) => (i + 1) % checkpoints.length), 2400);
    return () => clearInterval(id);
  }, [touched, reduced, checkpoints.length]);

  if (checkpoints.length === 0) return null;

  const current = checkpoints[active] ?? checkpoints[0];
  const title = (c: Checkpoint) => (locale === "fa" ? c.title_fa : c.title_en);
  const detail = (c: Checkpoint) => (locale === "fa" ? c.detail_fa : c.detail_en);

  const select = (index: number) => {
    setTouched(true);
    setActive(index);
  };

  return (
    <section id="checks" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="shell">
        <Reveal>
          <SectionHead
            eyebrow={dict.checks.eyebrow}
            title={dict.checks.title}
            lead={dict.checks.lead}
          />
        </Reveal>

        <div className="mt-12 grid items-center gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-12">
          {/* ------------------------------ diagram ------------------------------ */}
          <Reveal className="order-2 lg:order-1">
            <div className="glass edge-light relative mx-auto w-full max-w-md rounded-xl p-6 sm:p-8">
              <svg viewBox="0 0 100 100" className="w-full" role="img" aria-label={dict.checks.title}>
                <defs>
                  <linearGradient id="car-body" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="color-mix(in oklab, var(--fg) 10%, transparent)" />
                    <stop offset="100%" stopColor="color-mix(in oklab, var(--fg) 4%, transparent)" />
                  </linearGradient>
                  <linearGradient id="car-glass" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="color-mix(in oklab, var(--accent) 32%, transparent)" />
                    <stop offset="100%" stopColor="color-mix(in oklab, var(--accent-2) 22%, transparent)" />
                  </linearGradient>
                </defs>

                {/* wheels sit under the body */}
                {[
                  [13.2, 21],
                  [79.6, 21],
                  [13.2, 66],
                  [79.6, 66],
                ].map(([x, y]) => (
                  <rect
                    key={`${x}-${y}`}
                    x={x}
                    y={y}
                    width={7.2}
                    height={14}
                    rx={2.6}
                    fill="color-mix(in oklab, var(--fg) 26%, transparent)"
                  />
                ))}

                {/* body */}
                <path
                  d="M50 5C61 5 70 8 73.5 16C77 24 80 36 80.5 50C81 64 80 80 78 87C76 93 70 95 62 95L38 95C30 95 24 93 22 87C20 80 19 64 19.5 50C20 36 23 24 26.5 16C30 8 39 5 50 5Z"
                  fill="url(#car-body)"
                  stroke="color-mix(in oklab, var(--fg) 30%, transparent)"
                  strokeWidth={0.9}
                />
                {/* windscreen, roof, rear screen */}
                <path
                  d="M31.5 43L37 31.5C38 30 39 29.5 41 29.5L59 29.5C61 29.5 62 30 63 31.5L68.5 43Z"
                  fill="url(#car-glass)"
                  stroke="color-mix(in oklab, var(--fg) 22%, transparent)"
                  strokeWidth={0.6}
                />
                <rect
                  x={31}
                  y={43.6}
                  width={38}
                  height={20}
                  rx={2}
                  fill="color-mix(in oklab, var(--fg) 7%, transparent)"
                  stroke="color-mix(in oklab, var(--fg) 18%, transparent)"
                  strokeWidth={0.5}
                />
                <path
                  d="M31.5 64.2L37 75.5C38 77 39 77.5 41 77.5L59 77.5C61 77.5 62 77 63 75.5L68.5 64.2Z"
                  fill="url(#car-glass)"
                  opacity={0.75}
                  stroke="color-mix(in oklab, var(--fg) 22%, transparent)"
                  strokeWidth={0.6}
                />
                {/* lights */}
                <rect x={27} y={8.5} width={11} height={3.4} rx={1.7} fill="color-mix(in oklab, var(--warn) 55%, transparent)" />
                <rect x={62} y={8.5} width={11} height={3.4} rx={1.7} fill="color-mix(in oklab, var(--warn) 55%, transparent)" />
                <rect x={28} y={89} width={10} height={2.8} rx={1.4} fill="color-mix(in oklab, var(--crit) 45%, transparent)" />
                <rect x={62} y={89} width={10} height={2.8} rx={1.4} fill="color-mix(in oklab, var(--crit) 45%, transparent)" />
                {/* mirrors */}
                <rect x={15.5} y={36} width={5} height={3} rx={1.4} fill="color-mix(in oklab, var(--fg) 24%, transparent)" />
                <rect x={79.5} y={36} width={5} height={3} rx={1.4} fill="color-mix(in oklab, var(--fg) 24%, transparent)" />

                {/* hotspots */}
                {checkpoints.map((point, i) => {
                  const isActive = i === active;
                  return (
                    <g
                      key={point.code}
                      role="button"
                      tabIndex={0}
                      aria-label={title(point)}
                      aria-pressed={isActive}
                      className="cursor-pointer outline-none"
                      onPointerDown={() => select(i)}
                      onFocus={() => select(i)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") select(i);
                      }}
                    >
                      {isActive && !reduced && (
                        <circle
                          cx={point.pos_x}
                          cy={point.pos_y}
                          r={3.4}
                          fill="var(--accent)"
                          opacity={0.45}
                          style={{
                            transformOrigin: `${point.pos_x}px ${point.pos_y}px`,
                            animation: "pulse-ring 1.8s ease-out infinite",
                          }}
                        />
                      )}
                      <circle cx={point.pos_x} cy={point.pos_y} r={6} fill="transparent" />
                      <circle
                        cx={point.pos_x}
                        cy={point.pos_y}
                        r={isActive ? 3.4 : 2.2}
                        fill={isActive ? "var(--accent)" : "color-mix(in oklab, var(--fg) 45%, transparent)"}
                        stroke="var(--bg)"
                        strokeWidth={0.9}
                        style={{ transition: "r 320ms var(--ease-glass), fill 320ms var(--ease-glass)" }}
                      />
                      {isActive && (
                        <text
                          x={point.pos_x}
                          y={point.pos_y + 1.2}
                          textAnchor="middle"
                          fontSize={3}
                          fontWeight={700}
                          fill="var(--bg)"
                        >
                          {i + 1}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              <p className="mt-4 text-center text-[0.72rem] text-subtle">{dict.checks.hint}</p>
            </div>
          </Reveal>

          {/* ------------------------------- detail ------------------------------ */}
          <div className="order-1 flex flex-col gap-5 lg:order-2">
            <Reveal>
              <div className="glass-strong min-h-[9.5rem] rounded-lg p-6">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={current.code}
                    initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, filter: "blur(4px)" }}
                    transition={{ type: "spring", bounce: 0, duration: 0.35 }}
                    className="flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="accent-gradient grid size-9 place-items-center rounded-full text-[0.8rem] font-semibold text-white">
                        {toLocaleDigits(active + 1, locale)}
                      </span>
                      <h3 className="text-lg font-semibold">{title(current)}</h3>
                      <Badge tone="accent" className="ms-auto">
                        {dict.checks.zones[current.zone]}
                      </Badge>
                    </div>
                    <p className="text-[0.88rem] leading-relaxed text-muted">{detail(current)}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {checkpoints.map((point, i) => (
                  <li key={point.code}>
                    <button
                      type="button"
                      onPointerDown={() => select(i)}
                      className={cn(
                        "press w-full rounded-md border px-3 py-2.5 text-start text-[0.76rem] transition-colors",
                        i === active
                          ? "border-[color-mix(in_oklab,var(--accent)_50%,transparent)] bg-accent-soft text-accent"
                          : "border-line text-muted hover:border-line-strong hover:text-fg",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-[0.68rem] tabular-nums opacity-60">
                          {toLocaleDigits(i + 1, locale)}
                        </span>
                        <span className="truncate">{title(point)}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
