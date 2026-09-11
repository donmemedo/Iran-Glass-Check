"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}

/**
 * Content arrives with a critically damped spring — no overshoot, because
 * nothing here was thrown by the user. Reduced motion gets a plain cross-fade.
 */
export function Reveal({ children, delay = 0, y = 22, className, once = true }: RevealProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y, filter: "blur(6px)" }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once, margin: "-12% 0px -12% 0px" }}
      transition={
        reduced
          ? { duration: 0.25, delay }
          : { type: "spring", bounce: 0, duration: 0.7, delay }
      }
    >
      {children}
    </motion.div>
  );
}

export function RevealGroup({
  children,
  className,
  stagger = 0.07,
}: {
  children: ReactNode[];
  className?: string;
  stagger?: number;
}) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <Reveal key={i} delay={i * stagger}>
          {child}
        </Reveal>
      ))}
    </div>
  );
}
