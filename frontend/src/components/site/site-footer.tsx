import Link from "next/link";
import { Clock, MapPin, Phone } from "lucide-react";
import { LogoMark } from "./logo";
import type { Dict, Locale } from "@/lib/i18n";

export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dict }) {
  const columns = [
    {
      title: dict.footer.services,
      links: [
        { href: `/${locale}#services`, label: dict.nav.services },
        { href: `/${locale}#checks`, label: dict.nav.checks },
        { href: `/${locale}#pricing`, label: dict.nav.pricing },
        { href: `/${locale}/book`, label: dict.nav.book },
      ],
    },
    {
      title: dict.footer.company,
      links: [
        { href: `/${locale}#centers`, label: dict.nav.centers },
        { href: `/${locale}#fleet`, label: dict.nav.fleet },
        { href: `/${locale}/panel`, label: dict.nav.panel },
      ],
    },
    {
      title: dict.footer.support,
      links: [
        { href: `/${locale}/track`, label: dict.nav.track },
        { href: `/${locale}#faq`, label: dict.faq.eyebrow },
        { href: `/${locale}#contact`, label: dict.footer.onlineSupport },
      ],
    },
  ];

  return (
    <footer className="relative mt-24 border-t border-line bg-[color-mix(in_oklab,var(--bg-deep)_55%,transparent)]">
      <div className="shell grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <span className="flex items-center gap-2.5">
            <LogoMark />
            <span className="text-[0.95rem] font-semibold">{dict.brand.name}</span>
          </span>
          <p className="max-w-sm text-[0.85rem] leading-relaxed text-muted">{dict.footer.about}</p>
          <ul className="mt-1 flex flex-col gap-2.5 text-[0.8rem] text-muted">
            <li className="flex items-center gap-2">
              <MapPin className="size-3.5 shrink-0 text-accent" strokeWidth={1.8} />
              {dict.footer.address}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-3.5 shrink-0 text-accent" strokeWidth={1.8} />
              <span dir="ltr">{dict.footer.phone}</span>
            </li>
            <li className="flex items-center gap-2">
              <Clock className="size-3.5 shrink-0 text-accent" strokeWidth={1.8} />
              {dict.footer.sla}
            </li>
          </ul>
        </div>

        {columns.map((column) => (
          <div key={column.title} className="flex flex-col gap-3">
            <h3 className="text-[0.82rem] font-semibold">{column.title}</h3>
            <ul className="flex flex-col gap-2.5">
              {column.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-[0.82rem] text-muted transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="shell flex flex-col items-center justify-between gap-3 py-5 text-[0.75rem] text-subtle sm:flex-row">
          <span>
            © {new Intl.DateTimeFormat(locale === "fa" ? "fa-IR" : "en-US", {
              year: "numeric",
            }).format(new Date())} {dict.brand.name} — {dict.footer.rights}
          </span>
          <div className="flex items-center gap-5">
            <span>{dict.footer.privacy}</span>
            <span>{dict.footer.terms}</span>
            <span className="hidden md:inline">{dict.footer.builtOn}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
