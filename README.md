# ایران‌گلس‌چک — IranGlassCheck

A web app for the business in the localised plan in
`01-Business-plan-toolkit_Carglass_Iran_completed.pdf`: auto glass repair/replacement, a
12-point vehicle check performed during the same visit, and a digital report that reaches
the fleet manager before the breakdown does.

```
api/     FastAPI + SQLModel + SQLite  →  http://127.0.0.1:8000  (/docs for OpenAPI)
web/     Next.js 16 + Tailwind 4      →  http://localhost:3000
```

## Run

```bash
./run.sh                 # both services
```

Or separately:

```bash
cd api && .venv/bin/uvicorn app.main:app --reload --port 8000
cd web && npm run dev
```

The database seeds itself on first boot (`api/iranglasscheck.db`): 4 live centres, 6 services,
the 12 checkpoints, 3 demo fleets, 58 vehicles and 88 check reports.

## What is in it

| Route | What it does |
| --- | --- |
| `/fa`, `/en` | Marketing site: offerings, process, interactive 12-point diagram, prevention ROI calculator, pricing, centres, FAQ, B2B lead form |
| `/[locale]/book` | Four-step booking wizard → issues a tracking code |
| `/[locale]/track` | Order status by tracking code (try `IGC-48213`) |
| `/[locale]/report/[code]` | The check report a fleet manager receives (try `CHK-24101`) |
| `/[locale]/panel` | Fleet dashboard — demo login `fleet@sepehr.ir` / `demo1234` |

## Design

- **Light and dark are both first-class.** Every colour is an OKLCH token defined once in
  `web/src/app/globals.css` and redefined for `.dark`; nothing is hard-coded.
- **Laminated glass** is the material metaphor — translucent layers, a hairline of caught
  light on the top edge, pointer-tracked speculars.
- **Motion follows Apple's fluid-interface rules**: springs rather than fixed-duration
  curves, feedback on pointer-down, interruptible transitions, and full
  `prefers-reduced-motion` / `prefers-reduced-transparency` / `prefers-contrast` support.
- **RTL and LTR are structural.** Persian is the default locale; layout uses logical
  properties throughout, and numbers/dates go through `Intl` (Persian digits, Jalali dates).

Persian UI copy follows the vocabulary in
[Persian-vocabulary-in-UXwriting](https://github.com/Aylarrazzaghi/Persian-vocabulary-in-UXwriting):
«ورود»، «حساب کاربری»، «پیش‌خوان»، «سفارش‌ها»، «پیگیری سفارش»، «نشانی»، «کد تایید»،
«در حال بررسی»، «تحویل‌شده»، «لغوشده».

## API

`GET /api/catalog/{services,centers,checkpoints,stats}` · `POST /api/bookings` ·
`GET /api/bookings/{code}` · `GET /api/bookings/slots` · `GET /api/reports/{code}` ·
`POST /api/roi` · `POST /api/leads` · `POST /api/fleet/login` ·
`GET /api/fleet/{overview,vehicles,reports,referrals}` · `PATCH /api/fleet/referrals/{id}`

The browser calls same-origin `/api/*`; `next.config.ts` rewrites that to FastAPI, so there
is no CORS in the loop.

## Next steps

PWA (installable, offline shell), then Android APK and iOS IPA — the manifest, icon and
standalone display mode are already in place at `web/src/app/manifest.ts`.

## License

This project is proprietary software.

All rights reserved.

No permission is granted to use, copy, modify, distribute, fork,
reproduce, or commercially exploit this software without prior
written permission from the copyright holder.

See the LICENSE file for full terms.
