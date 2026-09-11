"use client";

import { motion } from "motion/react";
import { Building2, Check, Clock, MapPin, Star, Truck } from "lucide-react";
import { formatNumber, formatToman } from "@/lib/format";
import type { Dict, Locale } from "@/lib/i18n";
import type { Center, Service } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/primitives";

export type Mode = "onsite" | "mobile";

function SelectedRing({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 rounded-lg ring-2 transition-opacity duration-200",
        selected ? "opacity-100 ring-accent" : "opacity-0 ring-transparent",
      )}
    />
  );
}

function SelectedTick({ selected }: { selected: boolean }) {
  return (
    <motion.span
      className="accent-gradient grid size-6 shrink-0 place-items-center rounded-full text-white"
      initial={false}
      animate={{ scale: selected ? 1 : 0, opacity: selected ? 1 : 0 }}
      transition={{ type: "spring", bounce: 0.3, duration: 0.35 }}
    >
      <Check className="size-3.5" strokeWidth={3} />
    </motion.span>
  );
}

export function ModeToggle({
  mode,
  onChange,
  dict,
}: {
  mode: Mode;
  onChange: (mode: Mode) => void;
  dict: Dict;
}) {
  const options: { value: Mode; label: string; icon: typeof Building2 }[] = [
    { value: "onsite", label: dict.book.service.onsite, icon: Building2 },
    { value: "mobile", label: dict.book.service.mobile, icon: Truck },
  ];

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[0.78rem] font-medium text-muted">{dict.book.service.mode}</span>
      <div className="glass inline-flex w-fit rounded-full p-1">
        {options.map((option) => {
          const active = mode === option.value;
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={active}
              className={cn(
                "press relative flex items-center gap-2 rounded-full px-4 py-2 text-[0.82rem] font-medium transition-colors",
                active ? "text-white" : "text-muted hover:text-fg",
              )}
            >
              {active && (
                <motion.span
                  layoutId="mode-pill"
                  className="accent-gradient absolute inset-0 rounded-full"
                  transition={{ type: "spring", bounce: 0.16, duration: 0.42 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Icon className="size-4" strokeWidth={1.9} />
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
      {mode === "mobile" && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[0.75rem] text-subtle"
        >
          {dict.book.service.mobileHint}
        </motion.p>
      )}
    </div>
  );
}

export function ServiceStep({
  services,
  selected,
  onSelect,
  mode,
  onModeChange,
  locale,
  dict,
}: {
  services: Service[];
  selected: string | null;
  onSelect: (slug: string) => void;
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  locale: Locale;
  dict: Dict;
}) {
  const fa = locale === "fa";

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold sm:text-2xl">{dict.book.service.title}</h2>
      <ModeToggle mode={mode} onChange={onModeChange} dict={dict} />

      <div className="grid gap-3 sm:grid-cols-2">
        {services.map((service) => {
          const active = selected === service.slug;
          return (
            <button
              key={service.slug}
              type="button"
              onClick={() => onSelect(service.slug)}
              aria-pressed={active}
              className={cn(
                "press glass edge-light relative flex flex-col gap-3 rounded-lg p-5 text-start transition-shadow",
                active ? "shadow-float" : "hover:shadow-raised",
              )}
            >
              <SelectedRing selected={active} />
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[0.98rem] font-semibold">
                    {fa ? service.name_fa : service.name_en}
                  </span>
                  <span className="text-[0.78rem] text-muted">
                    {fa ? service.tagline_fa : service.tagline_en}
                  </span>
                </div>
                <SelectedTick selected={active} />
              </div>

              <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                <Badge tone="accent">
                  {dict.pricing.from} {formatToman(service.price_from, locale)}
                  {service.per_fa && (
                    <span className="opacity-80">
                      {" · "}
                      {fa ? service.per_fa : service.per_en}
                    </span>
                  )}
                </Badge>
                {service.duration_min > 0 && (
                  <span className="flex items-center gap-1.5 text-[0.72rem] text-subtle">
                    <Clock className="size-3.5" strokeWidth={1.9} />
                    {formatNumber(service.duration_min, locale)} {dict.pricing.minutes}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CenterStep({
  centers,
  selected,
  onSelect,
  locale,
  dict,
}: {
  centers: Center[];
  selected: string | null;
  onSelect: (slug: string) => void;
  locale: Locale;
  dict: Dict;
}) {
  const fa = locale === "fa";

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold sm:text-2xl">{dict.book.center.title}</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        {centers.map((center) => {
          const active = selected === center.slug;
          const disabled = !center.is_live;
          return (
            <button
              key={center.slug}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(center.slug)}
              aria-pressed={active}
              className={cn(
                "press glass edge-light relative flex flex-col gap-3 rounded-lg p-5 text-start transition-shadow",
                disabled && "cursor-not-allowed opacity-55",
                active && "shadow-float",
                !disabled && !active && "hover:shadow-raised",
              )}
            >
              <SelectedRing selected={active} />
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-2 text-[0.95rem] font-semibold">
                    {fa ? center.name_fa : center.name_en}
                    {disabled ? (
                      <Badge tone="neutral">{dict.coverage.soon}</Badge>
                    ) : (
                      <Badge tone="ok">{dict.coverage.live}</Badge>
                    )}
                  </span>
                  <span className="flex items-start gap-1.5 text-[0.76rem] leading-relaxed text-muted">
                    <MapPin className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.9} />
                    {fa ? center.address_fa : center.address_en}
                  </span>
                </div>
                <SelectedTick selected={active} />
              </div>

              <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-[0.72rem] text-subtle">
                {disabled ? (
                  <span>
                    {dict.book.center.soonNote}
                    {(fa ? center.opening_label_fa : center.opening_label_en) &&
                      ` — ${fa ? center.opening_label_fa : center.opening_label_en}`}
                  </span>
                ) : (
                  <>
                    <span>
                      {formatNumber(center.bays, locale)} {dict.coverage.bays}
                    </span>
                    {center.mobile_vans > 0 && (
                      <span>
                        {formatNumber(center.mobile_vans, locale)} {dict.coverage.vans}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Star className="size-3 fill-warn text-warn" strokeWidth={0} />
                      {formatNumber(center.rating, locale, { minimumFractionDigits: 1 })}
                    </span>
                    <span className="flex items-center gap-1" dir="ltr">
                      <Clock className="size-3" strokeWidth={1.9} />
                      {center.opens_at}–{center.closes_at}
                    </span>
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
