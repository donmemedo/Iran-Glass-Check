"use client";

import { AlertCircle } from "lucide-react";
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const controlBase =
  "w-full rounded-md border bg-[color-mix(in_oklab,var(--panel)_65%,transparent)] px-3.5 py-2.5 text-[0.9rem] text-fg outline-none transition-colors placeholder:text-subtle focus:border-accent focus:bg-[color-mix(in_oklab,var(--panel)_85%,transparent)]";

export function FieldShell({
  label,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-[0.78rem] font-medium text-muted">{label}</span>
      {children}
      {error ? (
        <span className="flex items-center gap-1.5 text-[0.72rem] text-crit">
          <AlertCircle className="size-3.5 shrink-0" strokeWidth={2} />
          {error}
        </span>
      ) : hint ? (
        <span className="text-[0.72rem] text-subtle">{hint}</span>
      ) : null}
    </label>
  );
}

export function TextField({
  label,
  error,
  hint,
  className,
  ...rest
}: {
  label: string;
  error?: string;
  hint?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell label={label} error={error} hint={hint} className={className}>
      <input
        {...rest}
        aria-invalid={Boolean(error)}
        className={cn(controlBase, error ? "border-crit" : "border-line")}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  label,
  error,
  hint,
  className,
  ...rest
}: {
  label: string;
  error?: string;
  hint?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell label={label} error={error} hint={hint} className={className}>
      <textarea
        {...rest}
        rows={rest.rows ?? 3}
        aria-invalid={Boolean(error)}
        className={cn(controlBase, "resize-none", error ? "border-crit" : "border-line")}
      />
    </FieldShell>
  );
}
