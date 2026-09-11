"use client";

import { usePathname, useRouter } from "next/navigation";
import { swapLocale, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LocaleSwitch({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      className="glass flex h-10 items-center rounded-full p-1 text-[0.78rem] font-medium"
      role="group"
      aria-label={label}
    >
      {(["fa", "en"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => router.push(swapLocale(pathname, code))}
          aria-current={locale === code}
          className={cn(
            "press h-8 rounded-full px-3 transition-colors",
            locale === code
              ? "accent-gradient text-white shadow-soft"
              : "text-muted hover:text-fg",
          )}
        >
          {code === "fa" ? "فا" : "EN"}
        </button>
      ))}
    </div>
  );
}
