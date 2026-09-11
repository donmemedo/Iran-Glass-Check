import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ایران‌گلس‌چک — IranGlassCheck",
    short_name: "گلس‌چک",
    description:
      "تعمیر و تعویض شیشه خودرو، چکاپ ۱۲ نقطه‌ای و گزارش دیجیتال برای ناوگان.",
    start_url: "/fa",
    scope: "/",
    display: "standalone",
    background_color: "#0d1220",
    theme_color: "#0d1220",
    dir: "rtl",
    lang: "fa-IR",
    categories: ["business", "productivity", "utilities"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
