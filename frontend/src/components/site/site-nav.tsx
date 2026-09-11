"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { LocaleSwitch } from "./locale-switch";
import { LogoMark } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import type { Dict, Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function SiteNav({ locale, dict }: { locale: Locale; dict: Dict }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const reduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const links = [
    { href: `/${locale}#services`, label: dict.nav.services },
    { href: `/${locale}#checks`, label: dict.nav.checks },
    { href: `/${locale}#pricing`, label: dict.nav.pricing },
    { href: `/${locale}#centers`, label: dict.nav.centers },
    { href: `/${locale}/track`, label: dict.nav.track },
    { href: `/${locale}/panel`, label: dict.nav.panel },
  ];

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background,box-shadow,backdrop-filter] duration-500",
          scrolled &&
            "bg-[color-mix(in_oklab,var(--bg)_72%,transparent)] shadow-[0_1px_0_color-mix(in_oklab,var(--fg)_8%,transparent)] backdrop-blur-xl backdrop-saturate-150",
        )}
        style={{ height: "var(--nav-h)" }}
      >
        <nav className="shell flex h-full items-center justify-between gap-4">
          <Link
            href={`/${locale}`}
            className="press flex items-center gap-2.5"
            aria-label={dict.brand.name}
          >
            <LogoMark />
            <span className="flex flex-col leading-none">
              <span className="text-[0.95rem] font-semibold">{dict.brand.name}</span>
              <span className="mt-1 text-[0.62rem] text-subtle">{dict.brand.tagline}</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="press rounded-full px-3.5 py-2 text-[0.84rem] text-muted transition-colors hover:bg-[color-mix(in_oklab,var(--fg)_6%,transparent)] hover:text-fg"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <LocaleSwitch locale={locale} label={dict.nav.language} />
            </div>
            <ThemeToggle label={dict.nav.theme} />
            <ButtonLink href={`/${locale}/book`} size="sm" className="hidden sm:inline-flex">
              {dict.nav.book}
            </ButtonLink>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={dict.nav.menu}
              className="press glass grid size-10 place-items-center rounded-full lg:hidden"
            >
              <Menu className="size-[1.05rem]" strokeWidth={1.8} />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
          >
            <div
              className="absolute inset-0 bg-[color-mix(in_oklab,var(--bg-deep)_72%,transparent)] backdrop-blur-xl"
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="glass-strong absolute inset-x-3 top-3 rounded-xl p-5"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: -18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -18, scale: 0.97 }}
              transition={{ type: "spring", bounce: 0.12, duration: 0.42 }}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2.5">
                  <LogoMark className="size-7" />
                  <span className="font-semibold">{dict.brand.name}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={dict.nav.close}
                  className="press grid size-9 place-items-center rounded-full border border-line"
                >
                  <X className="size-4" strokeWidth={1.8} />
                </button>
              </div>

              <div className="mt-5 flex flex-col">
                {links.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={reduced ? false : { opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i + 0.05, type: "spring", bounce: 0, duration: 0.4 }}
                  >
                    <Link
                      href={link.href}
                      className="flex items-center justify-between border-b border-line py-3.5 text-[0.95rem]"
                    >
                      {link.label}
                      <span className="text-subtle rtl:rotate-180">›</span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <LocaleSwitch locale={locale} label={dict.nav.language} />
                <ButtonLink href={`/${locale}/book`} className="flex-1">
                  {dict.nav.book}
                </ButtonLink>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
