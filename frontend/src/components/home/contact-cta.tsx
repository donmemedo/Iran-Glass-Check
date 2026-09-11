"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Send } from "lucide-react";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import type { Dict, Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Field = "company" | "name" | "phone" | "email" | "fleet_size" | "message";

const EMPTY = {
  company: "",
  name: "",
  phone: "",
  email: "",
  fleet_size: "",
  message: "",
};

export function ContactCta({ dict, locale }: { dict: Dict; locale: Locale }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const reduced = useReducedMotion();

  const validate = (field: Field, value: string): string | undefined => {
    if (field === "company" || field === "name" || field === "phone") {
      if (!value.trim()) return dict.form.required;
    }
    if (field === "phone" && value.trim() && !/^[\d۰-۹+\-\s]{8,20}$/.test(value.trim())) {
      return dict.form.invalidPhone;
    }
    if (field === "email" && value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
      return dict.form.invalidEmail;
    }
    return undefined;
  };

  const setField = (field: Field, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // validate inline, as the user types out of an error state
    setErrors((prev) => (prev[field] ? { ...prev, [field]: validate(field, value) } : prev));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Partial<Record<Field, string>> = {};
    (Object.keys(EMPTY) as Field[]).forEach((field) => {
      const error = validate(field, values[field]);
      if (error) nextErrors[field] = error;
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setState("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: values.company,
          name: values.name,
          phone: values.phone,
          email: values.email || null,
          fleet_size: Number(values.fleet_size.replace(/\D/g, "")) || 0,
          message: values.message || null,
          locale,
        }),
      });
      if (!res.ok) throw new Error("failed");
      setState("done");
      setValues(EMPTY);
    } catch {
      setState("error");
    }
  };

  return (
    <section id="contact" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="shell">
        <Reveal>
          <div className="glass-strong edge-light relative overflow-hidden rounded-xl p-7 sm:p-10">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-1/2 end-0 size-[34rem] rounded-full opacity-60 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, color-mix(in oklab, var(--accent) 32%, transparent), transparent 68%)",
              }}
            />

            <div className="relative grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="flex flex-col items-start gap-5">
                <Eyebrow>{dict.roi.eyebrow}</Eyebrow>
                <h2 className="text-3xl font-semibold sm:text-4xl">{dict.ctaBand.title}</h2>
                <p className="max-w-md text-[0.95rem] leading-relaxed text-muted">
                  {dict.ctaBand.lead}
                </p>
                <ButtonLink href={`/${locale}/book`} variant="glass" size="lg">
                  {dict.ctaBand.secondary}
                </ButtonLink>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                {state === "done" ? (
                  <motion.div
                    key="done"
                    initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    className="flex flex-col items-center justify-center gap-4 rounded-lg border border-[color-mix(in_oklab,var(--ok)_35%,transparent)] bg-ok-soft p-10 text-center"
                  >
                    <span className="grid size-14 place-items-center rounded-full bg-ok text-white">
                      <Check className="size-7" strokeWidth={2.6} />
                    </span>
                    <h3 className="text-xl font-semibold text-ok">{dict.ctaBand.form.success}</h3>
                    <p className="text-[0.86rem] text-muted">{dict.ctaBand.form.successBody}</p>
                    <Button variant="outline" size="sm" onClick={() => setState("idle")}>
                      {dict.ctaBand.form.again}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={submit}
                    initial={false}
                    exit={{ opacity: 0 }}
                    className="grid gap-4 sm:grid-cols-2"
                    noValidate
                  >
                    <TextField
                      label={dict.ctaBand.form.company}
                      value={values.company}
                      error={errors.company}
                      onChange={(v) => setField("company", v)}
                      onBlur={() => setErrors((p) => ({ ...p, company: validate("company", values.company) }))}
                    />
                    <TextField
                      label={dict.ctaBand.form.name}
                      value={values.name}
                      error={errors.name}
                      onChange={(v) => setField("name", v)}
                      onBlur={() => setErrors((p) => ({ ...p, name: validate("name", values.name) }))}
                    />
                    <TextField
                      label={dict.ctaBand.form.phone}
                      value={values.phone}
                      error={errors.phone}
                      inputMode="tel"
                      dir="ltr"
                      onChange={(v) => setField("phone", v)}
                      onBlur={() => setErrors((p) => ({ ...p, phone: validate("phone", values.phone) }))}
                    />
                    <TextField
                      label={dict.ctaBand.form.email}
                      value={values.email}
                      error={errors.email}
                      inputMode="email"
                      dir="ltr"
                      optional={dict.common.optional}
                      onChange={(v) => setField("email", v)}
                      onBlur={() => setErrors((p) => ({ ...p, email: validate("email", values.email) }))}
                    />
                    <TextField
                      label={dict.ctaBand.form.fleetSize}
                      value={values.fleet_size}
                      inputMode="numeric"
                      optional={dict.common.optional}
                      onChange={(v) => setField("fleet_size", v)}
                    />
                    <TextField
                      label={dict.ctaBand.form.message}
                      value={values.message}
                      optional={dict.common.optional}
                      onChange={(v) => setField("message", v)}
                    />

                    <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
                      <Button type="submit" size="lg" disabled={state === "sending"}>
                        {state === "sending" ? dict.form.sending : dict.ctaBand.form.submit}
                        <Send className="size-4" strokeWidth={1.9} />
                      </Button>
                      {state === "error" && (
                        <span className="text-[0.78rem] text-crit">{dict.form.error}</span>
                      )}
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  onBlur,
  error,
  optional,
  inputMode,
  dir,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  optional?: string;
  inputMode?: "tel" | "email" | "numeric";
  dir?: "ltr";
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-baseline gap-2 text-[0.78rem] text-muted">
        {label}
        {optional && <span className="text-[0.68rem] text-subtle">({optional})</span>}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        inputMode={inputMode}
        dir={dir}
        className={cn(
          "h-11 rounded-md border bg-[color-mix(in_oklab,var(--panel)_65%,transparent)] px-3.5 text-[0.88rem] outline-none transition-colors",
          "focus:border-accent focus:ring-2 focus:ring-[color-mix(in_oklab,var(--accent)_25%,transparent)]",
          error ? "border-crit" : "border-line",
        )}
      />
      {error && <span className="text-[0.72rem] text-crit">{error}</span>}
    </label>
  );
}
