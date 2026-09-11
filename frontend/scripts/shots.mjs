import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = process.env.SHOT_DIR ?? "./shots";
const BASE = process.env.BASE_URL ?? "http://localhost:3000";

const targets = process.argv.slice(2).length
  ? JSON.parse(process.argv[2])
  : [
      { name: "fa-dark", path: "/fa", theme: "dark", w: 1440, h: 960 },
      { name: "fa-light", path: "/fa", theme: "light", w: 1440, h: 960 },
      { name: "en-dark", path: "/en", theme: "dark", w: 1440, h: 960 },
      { name: "fa-mobile-dark", path: "/fa", theme: "dark", w: 390, h: 844 },
    ];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

for (const t of targets) {
  const context = await browser.newContext({
    viewport: { width: t.w, height: t.h },
    colorScheme: t.theme,
    deviceScaleFactor: t.dpr ?? 1,
    locale: t.path.startsWith("/fa") ? "fa-IR" : "en-US",
  });
  await context.addInitScript(
    ([theme]) => window.localStorage.setItem("theme", theme),
    [t.theme],
  );
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

  await page.goto(`${BASE}${t.path}`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(t.wait ?? 1400);

  for (const step of t.click ?? []) {
    await page.getByText(step, { exact: false }).first().click({ timeout: 10000 });
    await page.waitForTimeout(t.clickWait ?? 1800);
  }

  if (t.scrollTo) {
    await page.evaluate(
      (sel) => document.querySelector(sel)?.scrollIntoView({ behavior: "instant", block: "start" }),
      t.scrollTo,
    );
    await page.waitForTimeout(1800);
  }

  await page.screenshot({
    path: `${OUT}/${t.name}.png`,
    fullPage: t.full ?? false,
  });
  console.log(`${t.name}: saved${errors.length ? ` | errors: ${errors.slice(0, 4).join(" || ")}` : ""}`);
  await context.close();
}

await browser.close();
