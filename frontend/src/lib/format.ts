import type { Locale } from "./i18n";

const intlLocale = (locale: Locale) => (locale === "fa" ? "fa-IR" : "en-US");

export function formatNumber(value: number, locale: Locale, opts?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(intlLocale(locale), opts).format(value);
}

export function toLocaleDigits(value: string | number, locale: Locale) {
  const text = String(value);
  if (locale !== "fa") return text;
  const digits = "۰۱۲۳۴۵۶۷۸۹";
  return text.replace(/\d/g, (d) => digits[Number(d)]);
}

/**
 * Amounts in this product are always Toman. Anything above a million reads far
 * better spelled out than with six zeros, so we switch to words past 1e6.
 */
export function formatToman(value: number, locale: Locale, opts?: { short?: boolean }) {
  const fa = locale === "fa";
  const unit = fa ? "تومان" : "IRT";
  const abs = Math.abs(value);

  const scaled = (divisor: number, faWord: string, enWord: string) => {
    const n = value / divisor;
    const text = formatNumber(Number(n.toFixed(n >= 100 ? 0 : 1)), locale);
    return fa ? `${text} ${faWord} ${unit}` : `${text}${enWord} ${unit}`;
  };

  if (abs >= 1_000_000_000_000) return scaled(1_000_000_000_000, "هزار میلیارد", "T");
  if (abs >= 1_000_000_000) return scaled(1_000_000_000, "میلیارد", "B");
  if (abs >= 1_000_000) return scaled(1_000_000, "میلیون", "M");
  if (abs >= 1_000 && opts?.short) return scaled(1_000, "هزار", "K");
  return `${formatNumber(value, locale)} ${unit}`;
}

export function formatDate(value: string | Date, locale: Locale, withTime = false) {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(intlLocale(locale), {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

export function formatWeekday(value: string | Date, locale: Locale) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(intlLocale(locale), { weekday: "long" }).format(date);
}

export function formatDayNumber(value: string | Date, locale: Locale) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(intlLocale(locale), { day: "numeric" }).format(date);
}

export function formatMonth(value: string | Date, locale: Locale) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(intlLocale(locale), { month: "short" }).format(date);
}

export function formatTime(value: string | Date, locale: Locale) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(intlLocale(locale), {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function relativeDays(value: string | Date, locale: Locale) {
  const date = typeof value === "string" ? new Date(value) : value;
  const days = Math.round((date.getTime() - Date.now()) / 86_400_000);
  return new Intl.RelativeTimeFormat(intlLocale(locale), { numeric: "auto" }).format(days, "day");
}

/** "34-ب-782-10" -> { left: "34", letter: "ب", right: "782", province: "10" } */
export function parsePlate(plate: string) {
  const normalised = plate.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
  const [left, letter, right, province] = normalised.split("-");
  return { left: left ?? "", letter: letter ?? "", right: right ?? "", province: province ?? "" };
}
