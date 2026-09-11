import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, locales } from "@/lib/i18n";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/").filter(Boolean)[0];
  if (first && isLocale(first)) return NextResponse.next();

  const preferred = request.headers
    .get("accept-language")
    ?.split(",")
    .map((part) => part.split(";")[0].trim().slice(0, 2))
    .find((code) => (locales as readonly string[]).includes(code));

  const url = request.nextUrl.clone();
  url.pathname = `/${preferred ?? defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|manifest.webmanifest|.*\\..*).*)"],
};
