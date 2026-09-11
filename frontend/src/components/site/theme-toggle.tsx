"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useRef } from "react";
import { flushSync } from "react-dom";
import { cn } from "@/lib/utils";

/**
 * The theme change ripples out of the button itself rather than flashing the
 * page — the new theme is revealed along a circle anchored to the trigger.
 */
export function ThemeToggle({ label, className }: { label: string; className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const ref = useRef<HTMLButtonElement>(null);
  const isDark = resolvedTheme === "dark";

  const toggle = async () => {
    const next = isDark ? "light" : "dark";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = ref.current;

    if (!el || reduced || !document.startViewTransition) {
      setTheme(next);
      return;
    }

    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const transition = document.startViewTransition(() => {
      flushSync(() => setTheme(next));
    });

    try {
      await transition.ready;
      document.documentElement.animate(
        {
          clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
        },
        {
          duration: 560,
          easing: "cubic-bezier(0.32, 0.72, 0, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    } catch {
      /* the transition was skipped; the theme still changed */
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        "press glass grid size-10 place-items-center rounded-full text-muted hover:text-fg",
        className,
      )}
    >
      {/* driven by the .dark class, so the right icon is there before hydration */}
      <Sun className="hidden size-[1.05rem] dark:block" strokeWidth={1.8} />
      <Moon className="size-[1.05rem] dark:hidden" strokeWidth={1.8} />
    </button>
  );
}
