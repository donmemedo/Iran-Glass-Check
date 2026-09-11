"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/primitives";
import type { Dict, Locale } from "@/lib/i18n";
import type { Booking, Center, Service } from "@/lib/types";
import {
  DetailsStep,
  emptyForm,
  toLatinDigits,
  validateDetails,
  type BookingForm,
} from "./details-step";
import { plateIsEmpty, serializePlate } from "./plate-input";
import { SlotStep } from "./slot-step";
import { StepRail } from "./step-rail";
import { CenterStep, ServiceStep, type Mode } from "./steps";
import { SuccessView } from "./success-view";
import { SummaryPanel } from "./summary-panel";

export function BookingWizard({
  services,
  centers,
  locale,
  dict,
}: {
  services: Service[];
  centers: Center[];
  locale: Locale;
  dict: Dict;
}) {
  const reduced = useReducedMotion();
  const sign = locale === "fa" ? -1 : 1;
  const Forward = locale === "fa" ? ArrowLeft : ArrowRight;
  const Backward = locale === "fa" ? ArrowRight : ArrowLeft;

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [mode, setMode] = useState<Mode>("onsite");
  const [serviceSlug, setServiceSlug] = useState<string | null>(null);
  const [centerSlug, setCenterSlug] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [form, setForm] = useState<BookingForm>(emptyForm);
  const [touched, setTouched] = useState<Partial<Record<keyof BookingForm, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);

  const service = services.find((s) => s.slug === serviceSlug) ?? null;
  const center = centers.find((c) => c.slug === centerSlug) ?? null;
  const errors = useMemo(() => validateDetails(form, mode, dict), [form, mode, dict]);

  const canAdvance = [Boolean(serviceSlug), Boolean(centerSlug), Boolean(slot), true][step];

  const go = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const onChange = <K extends keyof BookingForm>(key: K, value: BookingForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));
  const onBlur = (key: keyof BookingForm) => setTouched((prev) => ({ ...prev, [key]: true }));

  const submit = async () => {
    const allTouched = Object.keys(emptyForm).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Record<keyof BookingForm, boolean>,
    );
    setTouched(allTouched);
    if (Object.keys(errors).length > 0 || !serviceSlug || !centerSlug || !slot) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_slug: serviceSlug,
          center_slug: centerSlug,
          mode,
          customer_name: form.name.trim(),
          customer_phone: toLatinDigits(form.phone).replace(/[\s-]/g, ""),
          customer_email: form.email.trim() || null,
          org_name: form.org.trim() || null,
          plate: plateIsEmpty(form.plate) ? null : serializePlate(form.plate),
          car_make: form.make.trim() || null,
          car_model: form.model.trim() || null,
          car_year: form.year.trim() ? Number(toLatinDigits(form.year)) : null,
          slot_start: slot,
          address: mode === "mobile" ? form.address.trim() : null,
          note: form.note.trim() || null,
        }),
      });
      if (!res.ok) throw new Error("booking failed");
      setBooking((await res.json()) as Booking);
    } catch {
      setSubmitError(dict.form.error);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setBooking(null);
    setStep(0);
    setDirection(-1);
    setSlot(null);
    setForm(emptyForm);
    setTouched({});
  };

  if (booking) {
    return <SuccessView booking={booking} locale={locale} dict={dict} onReset={reset} />;
  }

  const variants = {
    enter: (d: number) => (reduced ? { opacity: 0 } : { opacity: 0, x: 44 * sign * d }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => (reduced ? { opacity: 0 } : { opacity: 0, x: -44 * sign * d }),
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Eyebrow>{dict.book.lead}</Eyebrow>
        <h1 className="text-3xl font-semibold sm:text-4xl">{dict.book.title}</h1>
      </div>

      <StepRail
        steps={dict.book.steps}
        current={step}
        locale={locale}
        ofLabel={dict.common.of}
        onJump={go}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            >
              {step === 0 && (
                <ServiceStep
                  services={services}
                  selected={serviceSlug}
                  onSelect={setServiceSlug}
                  mode={mode}
                  onModeChange={setMode}
                  locale={locale}
                  dict={dict}
                />
              )}
              {step === 1 && (
                <CenterStep
                  centers={centers}
                  selected={centerSlug}
                  onSelect={(slug) => {
                    setCenterSlug(slug);
                    setSlot(null);
                  }}
                  locale={locale}
                  dict={dict}
                />
              )}
              {step === 2 && centerSlug && (
                <SlotStep
                  centerSlug={centerSlug}
                  selected={slot}
                  onSelect={setSlot}
                  locale={locale}
                  dict={dict}
                />
              )}
              {step === 3 && (
                <div className="flex flex-col gap-6">
                  <DetailsStep
                    form={form}
                    errors={errors}
                    touched={touched}
                    mode={mode}
                    dict={dict}
                    onChange={onChange}
                    onBlur={onBlur}
                  />
                  <div className="lg:hidden">
                    <SummaryPanel
                      service={service}
                      center={center}
                      mode={mode}
                      slot={slot}
                      locale={locale}
                      dict={dict}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {submitError && (
            <p className="mt-4 flex items-center gap-2 text-[0.8rem] text-crit">
              <AlertCircle className="size-4" strokeWidth={2} />
              {submitError}
            </p>
          )}

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
            <Button
              variant="ghost"
              onClick={() => go(step - 1)}
              disabled={step === 0}
              className={step === 0 ? "invisible" : ""}
            >
              <Backward className="size-4" strokeWidth={2} />
              {dict.actions.back}
            </Button>

            {step < 3 ? (
              <Button onClick={() => go(step + 1)} disabled={!canAdvance} size="lg">
                {dict.actions.continue}
                <Forward className="size-4" strokeWidth={2} />
              </Button>
            ) : (
              <Button onClick={submit} disabled={submitting} size="lg">
                {submitting ? dict.form.sending : dict.book.details.submit}
              </Button>
            )}
          </div>
        </div>

        <div className="hidden lg:block">
          <SummaryPanel
            service={service}
            center={center}
            mode={mode}
            slot={slot}
            locale={locale}
            dict={dict}
          />
        </div>
      </div>
    </div>
  );
}
