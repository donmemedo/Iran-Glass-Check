"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { SectionHead } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import type { Dict } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function Faq({ dict }: { dict: Dict }) {
  const [open, setOpen] = useState<number | null>(0);
  const reduced = useReducedMotion();

  return (
    <section id="faq" className="relative scroll-mt-24 py-20 sm:py-24">
      <div className="shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <SectionHead eyebrow={dict.faq.eyebrow} title={dict.faq.title} />
        </Reveal>

        <Reveal delay={0.06}>
          <ul className="flex flex-col">
            {dict.faq.items.map((item, i) => {
              const isOpen = open === i;
              return (
                <li key={item.q} className="border-b border-line">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="press flex w-full items-center justify-between gap-4 py-5 text-start"
                  >
                    <span
                      className={cn(
                        "text-[0.95rem] font-medium transition-colors",
                        isOpen ? "text-accent" : "text-fg",
                      )}
                    >
                      {item.q}
                    </span>
                    <span
                      className={cn(
                        "grid size-7 shrink-0 place-items-center rounded-full border transition-all duration-300",
                        isOpen
                          ? "rotate-45 border-transparent bg-accent text-white"
                          : "border-line text-muted",
                      )}
                    >
                      <Plus className="size-3.5" strokeWidth={2.2} />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={
                          reduced
                            ? { duration: 0.12 }
                            : { type: "spring", bounce: 0, duration: 0.42 }
                        }
                        className="overflow-hidden"
                      >
                        <p className="pb-5 pe-10 text-[0.86rem] leading-relaxed text-muted">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
