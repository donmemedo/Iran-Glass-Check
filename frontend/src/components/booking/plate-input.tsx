"use client";

import { useRef } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const LETTERS = [
  "الف", "ب", "پ", "ت", "ث", "ج", "د", "س", "ص", "ط", "ع", "ق", "ک", "ل", "م", "ن", "و", "ه", "ی",
];

export interface PlateValue {
  left: string;
  letter: string;
  right: string;
  province: string;
}

export const EMPTY_PLATE: PlateValue = { left: "", letter: "ب", right: "", province: "" };

export function plateIsEmpty(value: PlateValue) {
  return !value.left && !value.right && !value.province;
}

export function plateIsComplete(value: PlateValue) {
  return value.left.length === 2 && value.right.length === 3 && value.province.length === 2;
}

export function serializePlate(value: PlateValue) {
  return `${value.left}-${value.letter}-${value.right}-${value.province}`;
}

const digitsOnly = (raw: string, max: number) =>
  raw
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[^0-9]/g, "")
    .slice(0, max);

/** Mirrors the real plate: number block, letter, number block, province box. */
export function PlateInput({
  label,
  value,
  onChange,
  error,
  hint,
}: {
  label: string;
  value: PlateValue;
  onChange: (next: PlateValue) => void;
  error?: string;
  hint?: string;
}) {
  const rightRef = useRef<HTMLInputElement>(null);
  const provinceRef = useRef<HTMLInputElement>(null);

  const cell =
    "h-full bg-transparent text-center font-semibold tabular-nums text-neutral-900 outline-none placeholder:font-normal placeholder:text-neutral-400";

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[0.78rem] font-medium text-muted">{label}</span>
      <div
        dir="ltr"
        className={cn(
          "flex h-12 w-full max-w-xs items-stretch overflow-hidden rounded-[0.5rem] border bg-white shadow-[0_1px_3px_rgba(0,0,0,0.16)] focus-within:border-accent",
          error ? "border-crit" : "border-line-strong",
        )}
      >
        <span className="w-5 shrink-0 bg-[#1e3fae]" aria-hidden />
        <input
          inputMode="numeric"
          value={value.left}
          placeholder="۱۲"
          aria-label={`${label} 1`}
          onChange={(e) => {
            const left = digitsOnly(e.target.value, 2);
            onChange({ ...value, left });
            if (left.length === 2) rightRef.current?.focus();
          }}
          className={cn(cell, "w-12 text-[1rem]")}
        />
        <select
          value={value.letter}
          aria-label={`${label} letter`}
          onChange={(e) => onChange({ ...value, letter: e.target.value })}
          className={cn(cell, "w-14 cursor-pointer appearance-none text-[0.95rem]")}
        >
          {LETTERS.map((letter) => (
            <option key={letter} value={letter}>
              {letter}
            </option>
          ))}
        </select>
        <input
          ref={rightRef}
          inputMode="numeric"
          value={value.right}
          placeholder="۳۴۵"
          aria-label={`${label} 2`}
          onChange={(e) => {
            const right = digitsOnly(e.target.value, 3);
            onChange({ ...value, right });
            if (right.length === 3) provinceRef.current?.focus();
          }}
          className={cn(cell, "w-16 text-[1rem]")}
        />
        <span className="flex flex-col items-center justify-center border-l border-neutral-300 bg-neutral-50 px-1.5">
          <span className="text-[0.5rem] leading-none text-neutral-500">IR</span>
          <input
            ref={provinceRef}
            inputMode="numeric"
            value={value.province}
            placeholder="۶۸"
            aria-label={`${label} province`}
            onChange={(e) => onChange({ ...value, province: digitsOnly(e.target.value, 2) })}
            className={cn(cell, "w-8 bg-transparent text-[0.85rem]")}
          />
        </span>
      </div>
      {error ? (
        <span className="flex items-center gap-1.5 text-[0.72rem] text-crit">
          <AlertCircle className="size-3.5 shrink-0" strokeWidth={2} />
          {error}
        </span>
      ) : hint ? (
        <span className="text-[0.72rem] text-subtle">{hint}</span>
      ) : null}
    </div>
  );
}
