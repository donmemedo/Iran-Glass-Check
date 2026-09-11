"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "glass" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "press relative inline-flex select-none items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap disabled:pointer-events-none disabled:opacity-50 overflow-hidden";

const variants: Record<Variant, string> = {
  primary:
    "accent-gradient text-white shadow-[0_10px_30px_-8px_color-mix(in_oklab,var(--accent)_60%,transparent)] hover:brightness-[1.07]",
  glass:
    "glass text-fg hover:border-[color-mix(in_oklab,var(--accent)_45%,transparent)] hover:shadow-raised",
  outline:
    "border border-line-strong bg-transparent text-fg hover:border-accent hover:text-accent",
  ghost: "text-muted hover:bg-[color-mix(in_oklab,var(--fg)_6%,transparent)] hover:text-fg",
  danger: "bg-crit text-white hover:brightness-110",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.8rem]",
  md: "h-11 px-6 text-[0.9rem]",
  lg: "h-14 px-8 text-base",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  icon?: ReactNode;
  shimmer?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  icon,
  shimmer,
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {shimmer && <Shimmer />}
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
        {icon}
      </span>
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  icon,
  shimmer,
  ...rest
}: CommonProps & { href: string } & Omit<
    React.ComponentProps<typeof Link>,
    "href" | "className" | "children"
  >) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {shimmer && <Shimmer />}
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
        {icon}
      </span>
    </Link>
  );
}

/** A single pass of light across the button, the way it catches on real glass. */
function Shimmer() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-y-0 -inset-x-2 z-0 opacity-0 [animation:sheen_2.6s_ease-in-out_infinite] group-hover:opacity-100"
      style={{
        background:
          "linear-gradient(90deg, transparent, color-mix(in oklab, white 45%, transparent), transparent)",
        width: "38%",
        opacity: 0.5,
      }}
    />
  );
}
