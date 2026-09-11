import { fa } from "./dictionaries/fa";
import { en } from "./dictionaries/en";

export const locales = ["fa", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fa";

export type Dict = typeof fa;

const dictionaries: Record<Locale, Dict> = { fa, en };

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getDict(locale: Locale): Dict {
  return dictionaries[locale];
}

export function dir(locale: Locale): "rtl" | "ltr" {
  return locale === "fa" ? "rtl" : "ltr";
}

/** Swaps the locale segment of a path: /fa/book -> /en/book */
export function swapLocale(pathname: string, next: Locale): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length && isLocale(parts[0])) {
    parts[0] = next;
    return "/" + parts.join("/");
  }
  return `/${next}${pathname === "/" ? "" : pathname}`;
}
