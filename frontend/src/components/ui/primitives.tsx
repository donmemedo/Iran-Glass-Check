import type { ReactNode } from "react";
import { parsePlate, toLocaleDigits } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-full border border-line bg-[color-mix(in_oklab,var(--panel)_70%,transparent)] px-3.5 py-1.5 text-[0.72rem] font-medium tracking-wide text-muted backdrop-blur",
        className,
      )}
    >
      <span className="size-1.5 rounded-full accent-gradient" />
      {children}
    </span>
  );
}

export function SectionHead({
  eyebrow,
  title,
  lead,
  align = "start",
  className,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: "start" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start",
        className,
      )}
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="max-w-3xl text-3xl font-semibold sm:text-4xl lg:text-[2.7rem]">{title}</h2>
      {lead && <p className="max-w-2xl text-[0.98rem] text-muted sm:text-lg">{lead}</p>}
    </div>
  );
}

type Tone = "neutral" | "accent" | "ok" | "warn" | "crit";

const toneClasses: Record<Tone, string> = {
  neutral: "border-line bg-[color-mix(in_oklab,var(--fg)_5%,transparent)] text-muted",
  accent: "border-[color-mix(in_oklab,var(--accent)_35%,transparent)] bg-accent-soft text-accent",
  ok: "border-[color-mix(in_oklab,var(--ok)_35%,transparent)] bg-ok-soft text-ok",
  warn: "border-[color-mix(in_oklab,var(--warn)_35%,transparent)] bg-warn-soft text-warn",
  crit: "border-[color-mix(in_oklab,var(--crit)_35%,transparent)] bg-crit-soft text-crit",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.7rem] font-medium",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  className,
  glass = true,
}: {
  children: ReactNode;
  className?: string;
  glass?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg p-6",
        glass ? "glass edge-light" : "panel-card",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Stat({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: Tone;
}) {
  const accentText =
    tone === "ok"
      ? "text-ok"
      : tone === "warn"
        ? "text-warn"
        : tone === "crit"
          ? "text-crit"
          : tone === "accent"
            ? "text-accent"
            : "text-fg";
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[0.75rem] text-subtle">{label}</span>
      <span className={cn("text-2xl font-semibold tabular-nums", accentText)}>{value}</span>
      {sub && <span className="text-[0.72rem] text-muted">{sub}</span>}
    </div>
  );
}

/** Iranian licence plate — blue strip, letter block, province box. */
export function Plate({
  plate,
  locale,
  size = "md",
  className,
}: {
  plate: string;
  locale: Locale;
  size?: "sm" | "md";
  className?: string;
}) {
  const { left, letter, right, province } = parsePlate(plate);
  const small = size === "sm";
  return (
    <span
      dir="ltr"
      className={cn(
        "inline-flex items-stretch overflow-hidden rounded-[0.4rem] border border-line-strong bg-white font-semibold text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.18)]",
        small ? "h-7 text-[0.72rem]" : "h-9 text-[0.9rem]",
        className,
      )}
    >
      <span
        className={cn(
          "grid place-items-center bg-[#1e3fae] text-white",
          small ? "w-3.5" : "w-4",
        )}
      />
      <span className={cn("flex items-center gap-1 px-2 tabular-nums", small ? "gap-0.5" : "")}>
        <span>{toLocaleDigits(left, locale)}</span>
        <span className="px-0.5">{letter}</span>
        <span>{toLocaleDigits(right, locale)}</span>
      </span>
      <span
        className={cn(
          "flex flex-col items-center justify-center border-s border-line-strong bg-neutral-50 px-1.5 leading-none",
          small ? "text-[0.55rem]" : "text-[0.62rem]",
        )}
      >
        <span className="text-[0.5em] text-neutral-500">IR</span>
        <span className="tabular-nums">{toLocaleDigits(province, locale)}</span>
      </span>
    </span>
  );
}

export function Marquee({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  const doubled = [...items, ...items];
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        maskImage: "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
      }}
    >
      <div
        className="flex w-max items-center gap-12 [animation:marquee_32s_linear_infinite] hover:[animation-play-state:paused]"
        style={{ "--marquee-gap": "3rem" } as React.CSSProperties}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-3 text-sm font-medium whitespace-nowrap text-subtle"
          >
            <span className="size-1.5 rounded-full bg-accent/60" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
