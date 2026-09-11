"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/primitives";
import type { Dict, Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const CRACK_LINES = [
  "M50 50 L34 30",
  "M50 50 L70 33",
  "M50 50 L38 72",
  "M50 50 L74 64",
  "M50 50 L58 24",
  "M50 50 L26 58",
];

export function Hero({
  locale,
  dict,
  checkLabels,
}: {
  locale: Locale;
  dict: Dict;
  checkLabels: string[];
}) {
  const reduced = useReducedMotion();
  const [healed, setHealed] = useState(false);
  const [tick, setTick] = useState(0);
  const paneRef = useRef<HTMLDivElement>(null);
  const Arrow = locale === "fa" ? ArrowLeft : ArrowRight;

  useEffect(() => {
    if (reduced) {
      setHealed(true);
      return;
    }
    const id = setInterval(() => setHealed((value) => !value), 3600);
    return () => clearInterval(id);
  }, [reduced]);

  useEffect(() => {
    const id = setInterval(() => setTick((value) => (value + 1) % (checkLabels.length + 1)), 1150);
    return () => clearInterval(id);
  }, [checkLabels.length]);

  /* The specular highlight tracks the pointer 1:1 — light raking across glass. */
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = paneRef.current;
    if (!el || reduced) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
    el.style.setProperty("--my", `${((event.clientY - rect.top) / rect.height) * 100}%`);
  };

  return (
    <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 lg:pb-24">
      <div className="shell grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div className="flex flex-col items-start gap-6">
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.6 }}
          >
            <Eyebrow>{dict.hero.badge}</Eyebrow>
          </motion.div>

          <motion.h1
            className="text-[2.15rem] leading-[1.18] font-semibold sm:text-5xl lg:text-[3.55rem] lg:leading-[1.12]"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ type: "spring", bounce: 0, duration: 0.8, delay: 0.06 }}
          >
            <span className="text-gradient">{dict.hero.title}</span>
          </motion.h1>

          <motion.p
            className="max-w-xl text-[0.98rem] text-muted sm:text-lg"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.7, delay: 0.14 }}
          >
            {dict.hero.lead}
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center gap-3"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.7, delay: 0.2 }}
          >
            <ButtonLink href={`/${locale}/book`} size="lg" className="group">
              {dict.hero.primary}
              <Arrow className="size-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
            </ButtonLink>
            <ButtonLink href={`/${locale}#roi`} size="lg" variant="glass">
              {dict.hero.secondary}
            </ButtonLink>
          </motion.div>

          <motion.dl
            className="mt-2 grid w-full max-w-lg grid-cols-3 gap-3"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.7, delay: 0.28 }}
          >
            {dict.hero.stats.map((stat) => (
              <div
                key={stat.label}
                className="glass edge-light rounded-md px-4 py-3.5"
              >
                <dt className="sr-only">{stat.label}</dt>
                <dd className="flex flex-col gap-1">
                  <span className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-semibold tabular-nums">{stat.value}</span>
                    <span className="text-[0.7rem] text-subtle">{stat.suffix}</span>
                  </span>
                  <span className="text-[0.72rem] leading-snug text-muted">{stat.label}</span>
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* ---------------------------- the pane ---------------------------- */}
        <motion.div
          className="relative mx-auto w-full max-w-lg"
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", bounce: 0.08, duration: 0.95, delay: 0.1 }}
        >
          <div
            ref={paneRef}
            onPointerMove={onPointerMove}
            className="group relative aspect-[4/5] w-full overflow-hidden rounded-2xl border sm:aspect-[5/5]"
            style={{
              background: "linear-gradient(150deg, var(--pane-from), var(--pane-to))",
              borderColor: "var(--pane-line)",
              boxShadow: "var(--shadow-lg), inset 0 1px 0 var(--glass-sheen)",
            }}
          >
            {/* pointer-tracked specular highlight */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-70 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(420px circle at var(--mx, 68%) var(--my, 22%), color-mix(in oklab, var(--accent) 30%, transparent), transparent 62%)",
              }}
            />
            {/* laminated layers */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "repeating-linear-gradient(118deg, transparent 0 22px, color-mix(in oklab, white 4%, transparent) 22px 23px)",
              }}
            />
            <div
              aria-hidden
              className="absolute -inset-x-10 top-[18%] h-24 -rotate-[18deg] bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,white_22%,transparent),transparent)] blur-md"
            />

            {/* the crack that heals */}
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 size-full"
              aria-hidden
              preserveAspectRatio="xMidYMid slice"
            >
              <g transform="translate(4 -4) scale(0.92)">
                {CRACK_LINES.map((d, i) => (
                  <motion.path
                    key={d}
                    d={d}
                    stroke="var(--crack)"
                    strokeWidth={0.6}
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={
                      healed
                        ? { pathLength: 1, opacity: 0 }
                        : { pathLength: 1, opacity: 0.85 }
                    }
                    transition={{
                      pathLength: { duration: 0.45, delay: healed ? 0 : i * 0.05 },
                      opacity: { duration: healed ? 0.7 : 0.25, delay: healed ? 0.1 : i * 0.05 },
                    }}
                  />
                ))}
                <motion.circle
                  cx={50}
                  cy={50}
                  r={2.4}
                  fill="var(--crack)"
                  animate={{ opacity: healed ? 0 : 0.9, scale: healed ? 0.4 : 1 }}
                  style={{ transformOrigin: "50px 50px" }}
                  transition={{ duration: 0.5 }}
                />
                {/* resin filling the chip */}
                <motion.circle
                  cx={50}
                  cy={50}
                  r={9}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth={0.7}
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={
                    healed
                      ? { opacity: [0, 0.9, 0], scale: [0.3, 1.5, 2.1] }
                      : { opacity: 0, scale: 0.3 }
                  }
                  style={{ transformOrigin: "50px 50px" }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                />
              </g>
            </svg>

            {/* state chip */}
            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
              <span className="glass flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.7rem] font-medium">
                <span
                  className={cn(
                    "size-1.5 rounded-full transition-colors duration-500",
                    healed ? "bg-ok" : "bg-warn",
                  )}
                />
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={healed ? "healed" : "crack"}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.22 }}
                  >
                    {healed ? dict.hero.healedLabel : dict.hero.crackLabel}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="glass grid size-9 place-items-center rounded-full text-accent">
                <Sparkles className="size-4" strokeWidth={1.8} />
              </span>
            </div>

            {/* live check HUD */}
            <div className="absolute inset-x-4 bottom-4">
              <div className="glass-strong rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[0.75rem] font-medium">
                    <ShieldCheck className="size-4 text-accent" strokeWidth={1.9} />
                    {dict.hero.liveLabel}
                  </span>
                  <span className="text-[0.68rem] tabular-nums text-subtle">
                    {Math.min(tick, checkLabels.length)}/{checkLabels.length}
                  </span>
                </div>
                <ul className="mt-3 flex flex-col gap-2">
                  {checkLabels.map((label, i) => {
                    const done = i < tick;
                    return (
                      <li key={label} className="flex items-center gap-2.5">
                        <motion.span
                          className={cn(
                            "grid size-4 shrink-0 place-items-center rounded-full border transition-colors duration-300",
                            done
                              ? "border-transparent bg-ok text-white"
                              : "border-line text-transparent",
                          )}
                          animate={done ? { scale: [1, 1.18, 1] } : { scale: 1 }}
                          transition={{ duration: 0.32 }}
                        >
                          <Check className="size-2.5" strokeWidth={3} />
                        </motion.span>
                        <span
                          className={cn(
                            "text-[0.76rem] transition-colors duration-300",
                            done ? "text-fg" : "text-subtle",
                          )}
                        >
                          {label}
                        </span>
                        <span className="ms-auto h-px flex-1 bg-line" />
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>

          {/* floating badge */}
          <motion.div
            className="glass-strong absolute -bottom-5 start-2 flex items-center gap-2.5 rounded-full px-4 py-2.5 sm:-start-6"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.7, delay: 0.5 }}
          >
            <span className="accent-gradient grid size-8 place-items-center rounded-full text-white">
              <Check className="size-4" strokeWidth={2.6} />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-[0.78rem] font-semibold">{dict.hero.stats[2].value} {dict.hero.stats[2].suffix}</span>
              <span className="text-[0.66rem] text-subtle">{dict.hero.stats[2].label}</span>
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
