"use client";

import type { Dict } from "@/lib/i18n";
import { TextAreaField, TextField } from "./field";
import {
  EMPTY_PLATE,
  PlateInput,
  type PlateValue,
  plateIsComplete,
  plateIsEmpty,
} from "./plate-input";
import type { Mode } from "./steps";

export interface BookingForm {
  name: string;
  phone: string;
  email: string;
  org: string;
  plate: PlateValue;
  make: string;
  model: string;
  year: string;
  address: string;
  note: string;
}

export const emptyForm: BookingForm = {
  name: "",
  phone: "",
  email: "",
  org: "",
  plate: EMPTY_PLATE,
  make: "",
  model: "",
  year: "",
  address: "",
  note: "",
};

export const toLatinDigits = (value: string) =>
  value.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).trim();

export function validateDetails(
  form: BookingForm,
  mode: Mode,
  dict: Dict,
): Partial<Record<keyof BookingForm, string>> {
  const errors: Partial<Record<keyof BookingForm, string>> = {};
  const phone = toLatinDigits(form.phone).replace(/[\s-]/g, "");

  if (!form.name.trim()) errors.name = dict.form.required;
  if (!phone) errors.phone = dict.form.required;
  else if (!/^(\+?98|0)?9\d{9}$/.test(phone)) errors.phone = dict.form.invalidPhone;

  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
    errors.email = dict.form.invalidEmail;
  }

  if (!plateIsEmpty(form.plate) && !plateIsComplete(form.plate)) {
    errors.plate = dict.form.required;
  }

  const year = Number(toLatinDigits(form.year));
  if (form.year.trim() && !((year >= 1300 && year <= 1500) || (year >= 1900 && year <= 2100))) {
    errors.year = dict.form.invalidYear;
  }

  if (mode === "mobile" && !form.address.trim()) errors.address = dict.form.required;

  return errors;
}

export function DetailsStep({
  form,
  errors,
  touched,
  mode,
  dict,
  onChange,
  onBlur,
}: {
  form: BookingForm;
  errors: Partial<Record<keyof BookingForm, string>>;
  touched: Partial<Record<keyof BookingForm, boolean>>;
  mode: Mode;
  dict: Dict;
  onChange: <K extends keyof BookingForm>(key: K, value: BookingForm[K]) => void;
  onBlur: (key: keyof BookingForm) => void;
}) {
  const errorFor = (key: keyof BookingForm) => (touched[key] ? errors[key] : undefined);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold sm:text-2xl">{dict.book.details.title}</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label={dict.book.details.name}
          value={form.name}
          autoComplete="name"
          onChange={(e) => onChange("name", e.target.value)}
          onBlur={() => onBlur("name")}
          error={errorFor("name")}
        />
        <TextField
          label={dict.book.details.phone}
          value={form.phone}
          inputMode="tel"
          autoComplete="tel"
          dir="ltr"
          placeholder="09xxxxxxxxx"
          onChange={(e) => onChange("phone", e.target.value)}
          onBlur={() => onBlur("phone")}
          error={errorFor("phone")}
        />
        <TextField
          label={dict.book.details.email}
          value={form.email}
          type="email"
          dir="ltr"
          autoComplete="email"
          onChange={(e) => onChange("email", e.target.value)}
          onBlur={() => onBlur("email")}
          error={errorFor("email")}
        />
        <TextField
          label={dict.book.details.org}
          value={form.org}
          autoComplete="organization"
          onChange={(e) => onChange("org", e.target.value)}
          onBlur={() => onBlur("org")}
          error={errorFor("org")}
        />

        <div className="sm:col-span-2">
          <PlateInput
            label={dict.book.details.plate}
            value={form.plate}
            onChange={(next) => {
              onChange("plate", next);
              onBlur("plate");
            }}
            error={errorFor("plate")}
          />
        </div>

        <TextField
          label={dict.book.details.make}
          value={form.make}
          onChange={(e) => onChange("make", e.target.value)}
          onBlur={() => onBlur("make")}
        />
        <TextField
          label={dict.book.details.model}
          value={form.model}
          onChange={(e) => onChange("model", e.target.value)}
          onBlur={() => onBlur("model")}
        />
        <TextField
          label={dict.book.details.year}
          value={form.year}
          inputMode="numeric"
          onChange={(e) => onChange("year", e.target.value)}
          onBlur={() => onBlur("year")}
          error={errorFor("year")}
        />

        {mode === "mobile" && (
          <TextAreaField
            className="sm:col-span-2"
            label={dict.book.details.address}
            value={form.address}
            onChange={(e) => onChange("address", e.target.value)}
            onBlur={() => onBlur("address")}
            error={errorFor("address")}
          />
        )}

        <TextAreaField
          className="sm:col-span-2"
          label={dict.book.details.note}
          value={form.note}
          onChange={(e) => onChange("note", e.target.value)}
          onBlur={() => onBlur("note")}
        />
      </div>
    </div>
  );
}
