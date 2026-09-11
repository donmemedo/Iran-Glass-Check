"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { CarFront, ClipboardCheck, Check, Route } from "lucide-react";
import { useRef } from "react";
import { Reveal } from "@/components/ui/reveal";
import { SectionHead } from "@/components/ui/primitives";
import type { Dict } from "@/lib/i18n";

const ICONS = [CarFront, ClipboardCheck, Route];

export function Offerings({ dict }: { dict: Dict }) {
  return (
    <section id="services" className="shell scroll-mt-24 py-20 sm:py-28">
      <Reveal>
        <SectionHead
          eyebrow={dict.offerings.eyebrow}
          title={dict.offerings.title}
          lead={dict.offerings.lead}
        />
      </Reveal>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {dict.offerings.items.map((item, i) => (
          <Reveal key={item.key} delay={i * 0.08}>
            <TiltCard index={i} item={item} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function TiltCard({
  item,
  index,
}: {
  item: Dict["offerings"]["items"][number];
  index: number;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const Icon = ICONS[index] ?? CarFront;

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const springConfig = { stiffness: 260, damping: 26, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [0, 1], [5.5, -5.5]), springConfig);
  const rotateY = useSpring(useTransform(px, [0, 1], [-5.5, 5.5]), springConfig);

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (reduced) return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
    event.currentTarget.style.setProperty("--mx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
    event.currentTarget.style.setProperty("--my", `${((event.clientY - rect.top) / rect.height) * 100}%`);
  };

  const reset = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.article
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      style={reduced ? undefined : { rotateX, rotateY, transformPerspective: 900 }}
      className="glass edge-light group relative h-full overflow-hidden rounded-lg p-7"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(320px circle at var(--mx, 50%) var(--my, 0%), color-mix(in oklab, var(--accent) 20%, transparent), transparent 60%)",
        }}
      />

      <div className="relative z-10 flex h-full flex-col gap-4">
        <span className="accent-gradient grid size-12 place-items-center rounded-md text-white shadow-[0_8px_24px_-10px_color-mix(in_oklab,var(--accent)_70%,transparent)]">
          <Icon className="size-[1.35rem]" strokeWidth={1.7} />
        </span>

        <h3 className="text-xl font-semibold">{item.title}</h3>
        <p className="text-[0.88rem] leading-relaxed text-muted">{item.body}</p>

        <ul className="mt-auto flex flex-col gap-2.5 pt-3">
          {item.points.map((point) => (
            <li key={point} className="flex items-start gap-2.5 text-[0.82rem]">
              <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                <Check className="size-2.5" strokeWidth={3} />
              </span>
              <span className="text-muted">{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}
