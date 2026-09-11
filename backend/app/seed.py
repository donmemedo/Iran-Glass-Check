"""Demo data: centers, services, the 12 checkpoints, fleets, vehicles and reports."""

from __future__ import annotations

import random
from datetime import date, datetime, timedelta

from sqlmodel import Session, select

from .models import (
    Booking,
    BookingStatus,
    Center,
    CheckReport,
    CheckResult,
    CheckStatus,
    Checkpoint,
    Organization,
    Referral,
    ReferralStatus,
    Service,
    ServiceCategory,
    ServiceMode,
    Vehicle,
)

CENTERS = [
    Center(
        slug="tehran-sattari",
        name_fa="مرکز غرب تهران",
        name_en="Tehran West Hub",
        city_fa="تهران",
        city_en="Tehran",
        address_fa="بزرگراه ستاری، بعد از پل اشرفی اصفهانی، پلاک ۲۴۰",
        address_en="Sattari Expressway, after Ashrafi Bridge, No. 240",
        phone="۰۲۱-۴۴۹۸۲۲۱۰",
        lat=35.7404,
        lng=51.3305,
        bays=3,
        mobile_vans=2,
        rating=4.9,
    ),
    Center(
        slug="tehran-resalat",
        name_fa="مرکز شرق تهران",
        name_en="Tehran East Hub",
        city_fa="تهران",
        city_en="Tehran",
        address_fa="بزرگراه رسالت، نبش خیابان کرمان، پلاک ۱۱",
        address_en="Resalat Expressway, Kerman St. corner, No. 11",
        phone="۰۲۱-۷۷۶۵۴۱۹۰",
        lat=35.7440,
        lng=51.4915,
        bays=2,
        mobile_vans=1,
        rating=4.8,
    ),
    Center(
        slug="tehran-karegar",
        name_fa="مرکز مرکز تهران",
        name_en="Tehran Central Hub",
        city_fa="تهران",
        city_en="Tehran",
        address_fa="کارگر شمالی، بالاتر از بلوار کشاورز، پلاک ۹۶",
        address_en="North Karegar St., above Keshavarz Blvd., No. 96",
        phone="۰۲۱-۶۶۴۳۸۸۲۰",
        lat=35.7130,
        lng=51.3890,
        bays=2,
        mobile_vans=1,
        rating=4.7,
    ),
    Center(
        slug="karaj-azimieh",
        name_fa="مرکز کرج",
        name_en="Karaj Hub",
        city_fa="کرج",
        city_en="Karaj",
        address_fa="عظیمیه، بلوار تعاون، نبش گلستان ۵",
        address_en="Azimieh, Ta'avon Blvd., Golestan 5 corner",
        phone="۰۲۶-۳۲۵۴۷۷۱۰",
        lat=35.8355,
        lng=50.9915,
        bays=2,
        mobile_vans=1,
        rating=4.8,
    ),
    Center(
        slug="isfahan",
        name_fa="مرکز اصفهان",
        name_en="Isfahan Hub",
        city_fa="اصفهان",
        city_en="Isfahan",
        address_fa="خیابان امام خمینی، نرسیده به میدان آزادی",
        address_en="Imam Khomeini St., before Azadi Square",
        phone="۰۳۱-۳۳۳۳۰۰۱۲",
        lat=32.6546,
        lng=51.6680,
        bays=2,
        is_live=False,
        opening_label_fa="پاییز ۱۴۰۵",
        opening_label_en="Autumn 2026",
    ),
    Center(
        slug="mashhad",
        name_fa="مرکز مشهد",
        name_en="Mashhad Hub",
        city_fa="مشهد",
        city_en="Mashhad",
        address_fa="بلوار وکیل‌آباد، بین وکیل‌آباد ۱۲ و ۱۴",
        address_en="Vakilabad Blvd., between 12 and 14",
        phone="۰۵۱-۳۸۶۷۴۴۳۰",
        lat=36.3150,
        lng=59.5270,
        bays=2,
        is_live=False,
        opening_label_fa="زمستان ۱۴۰۵",
        opening_label_en="Winter 2026",
    ),
    Center(
        slug="shiraz",
        name_fa="مرکز شیراز",
        name_en="Shiraz Hub",
        city_fa="شیراز",
        city_en="Shiraz",
        address_fa="بلوار چمران، نبش کوچه ۱۸",
        address_en="Chamran Blvd., Alley 18 corner",
        phone="۰۷۱-۳۶۲۸۹۹۴۰",
        lat=29.6360,
        lng=52.5220,
        bays=2,
        is_live=False,
        opening_label_fa="بهار ۱۴۰۶",
        opening_label_en="Spring 2027",
    ),
]

SERVICES = [
    Service(
        slug="glass-repair",
        category=ServiceCategory.GLASS_REPAIR,
        name_fa="تعمیر ترک شیشه",
        name_en="Chip & crack repair",
        tagline_fa="ترک تا اندازه یک سکه، بدون تعویض",
        tagline_en="Coin-sized damage, no replacement",
        description_fa="تزریق رزین و پخت نوری روی ترک‌های کوچک شیشه جلو؛ استحکام شیشه برمی‌گردد و ترک دیگر رشد نمی‌کند. عکس قبل و بعد در گزارش ثبت می‌شود.",
        description_en="Resin injection and UV curing on small windscreen chips. The glass regains strength and the crack stops spreading. Before/after photos land in your report.",
        price_from=1_200_000,
        duration_min=30,
        warranty_months=12,
        icon="crack",
        highlight=True,
        sort=1,
    ),
    Service(
        slug="glass-replace",
        category=ServiceCategory.GLASS_REPLACE,
        name_fa="تعویض شیشه",
        name_en="Glass replacement",
        tagline_fa="شیشه استاندارد با گارانتی نشتی",
        tagline_en="OEM-grade glass, leak warranty",
        description_fa="برداشتن شیشه آسیب‌دیده، آماده‌سازی قاب، نصب شیشه استاندارد و آب‌بندی با چسب پلی‌اورتان. تحویل خودرو پس از زمان پخت ایمن.",
        description_en="Damaged glass removal, frame prep, OEM-grade fitting and polyurethane sealing. The car is handed back after a safe cure time.",
        price_from=5_000_000,
        price_to=25_000_000,
        duration_min=120,
        warranty_months=24,
        icon="windshield",
        highlight=True,
        sort=2,
    ),
    Service(
        slug="car-check",
        category=ServiceCategory.CHECK,
        name_fa="چکاپ ۱۲ نقطه‌ای",
        name_en="12-point check",
        tagline_fa="زیر ۲۰ دقیقه، همراه گزارش دیجیتال",
        tagline_en="Under 20 minutes, digital report",
        description_fa="بررسی روغن، مایعات، لاستیک، باتری، ترمز، چراغ‌ها و هشدارهای داشبورد؛ خروجی یک امتیاز ریسک و فهرست کارهای لازم است.",
        description_en="Oil, fluids, tyres, battery, brakes, lights and dashboard warnings — the output is a risk score and a short to-do list.",
        price_from=450_000,
        duration_min=20,
        icon="clipboard",
        highlight=True,
        sort=3,
    ),
    Service(
        slug="fleet-subscription",
        category=ServiceCategory.FLEET_SUBSCRIPTION,
        name_fa="اشتراک چکاپ ناوگان",
        name_en="Fleet check subscription",
        tagline_fa="هر خودرو، هر ماه، قیمت پلکانی",
        tagline_en="Per vehicle, per month, tiered",
        description_fa="قرارداد سالانه با SLA مشخص، چکاپ دوره‌ای هر خودرو، قیمت ترجیحی شیشه و گزارش ماهانه صرفه‌جویی برای مدیر ناوگان.",
        description_en="An annual contract with a defined SLA, periodic checks for every vehicle, preferred glass pricing and a monthly savings report for the fleet manager.",
        price_from=300_000,
        price_to=380_000,
        per_fa="هر خودرو / ماه",
        per_en="per vehicle / month",
        duration_min=20,
        icon="fleet",
        sort=4,
    ),
    Service(
        slug="mobile-visit",
        category=ServiceCategory.MOBILE,
        name_fa="بازدید سیار",
        name_en="Mobile visit",
        tagline_fa="ون ما در پارکینگ شما",
        tagline_en="Our van in your car park",
        description_fa="تیم سیار با تجهیزات کامل به محل ناوگان می‌آید؛ تعمیر ترک و چکاپ بدون خواب خودرو انجام می‌شود.",
        description_en="A fully equipped mobile team comes to your site; chip repair and checks happen without taking the vehicle off the road.",
        price_from=1_500_000,
        duration_min=60,
        icon="van",
        sort=5,
    ),
    Service(
        slug="fleet-dashboard",
        category=ServiceCategory.DATA,
        name_fa="پیش‌خوان داده ناوگان",
        name_en="Fleet data dashboard",
        tagline_fa="خروجی اکسل و API",
        tagline_en="Excel export and API",
        description_fa="پیش‌خوان اختصاصی با خودروهای پرریسک، تاریخچه چکاپ، تایید ارجاع تعمیرگاهی، خروجی اکسل و API برای اتصال به سامانه شما.",
        description_en="A dedicated dashboard with high-risk vehicles, check history, garage referral approvals, Excel export and an API for your own systems.",
        price_from=25_000_000,
        per_fa="ماهانه",
        per_en="monthly",
        duration_min=0,
        icon="dashboard",
        sort=6,
    ),
]

CHECKPOINTS = [
    ("engine-oil", "روغن موتور", "Engine oil", "سطح، رنگ و فاصله تا سرویس بعدی", "Level, colour and distance to next service", "engine", "oil", 3, 40.0, 20.0),
    ("coolant", "مایع خنک‌کننده", "Coolant", "سطح مخزن، نشتی و وضعیت ضدیخ", "Reservoir level, leaks and antifreeze condition", "engine", "thermometer", 3, 60.0, 20.0),
    ("battery", "باتری و شارژ", "Battery & charging", "ولتاژ در حالت خاموش و روشن، سلامت ترمینال", "Resting and running voltage, terminal health", "electrical", "battery", 2, 50.0, 12.0),
    ("washer", "مایع شیشه‌شور", "Washer fluid", "سطح مخزن و عملکرد نازل‌ها", "Reservoir level and nozzle spray", "engine", "droplet", 1, 50.0, 27.0),
    ("lights", "چراغ‌ها و راهنماها", "Lights & indicators", "جلو، عقب، ترمز، مه‌شکن و راهنما", "Head, tail, brake, fog and indicators", "electrical", "lamp", 2, 26.0, 9.0),
    ("tyres", "لاستیک‌ها", "Tyres", "عمق آج، فشار باد و سایش نامتقارن", "Tread depth, pressure and uneven wear", "wheels", "tyre", 3, 15.0, 30.0),
    ("brakes", "لنت و دیسک ترمز", "Brakes", "ضخامت لنت، وضعیت دیسک و روغن ترمز", "Pad thickness, disc condition and brake fluid", "wheels", "brake", 3, 85.0, 30.0),
    ("wipers", "برف‌پاک‌کن", "Wipers", "وضعیت تیغه و کیفیت پاک‌کردن", "Blade condition and wipe quality", "cabin", "wiper", 1, 50.0, 35.0),
    ("glass", "شیشه و آینه‌ها", "Glass & mirrors", "ترک، خط‌افتادگی و دید راننده", "Chips, scratches and driver visibility", "cabin", "glass", 2, 50.0, 46.0),
    ("dashboard", "هشدارهای داشبورد", "Dashboard warnings", "چراغ‌های خطا و خواندن کد OBD", "Warning lights and OBD code read", "cabin", "alert", 3, 37.0, 55.0),
    ("leaks", "نشتی زیر خودرو", "Underbody leaks", "روغن، ضدیخ و روغن گیربکس", "Oil, coolant and gearbox fluid", "body", "leak", 2, 63.0, 66.0),
    ("noise", "صدا و لرزش", "Noise & vibration", "صدای غیرعادی موتور، تعلیق و فرمان", "Unusual engine, suspension and steering noise", "body", "wave", 2, 15.0, 76.0),
]

ORGS = [
    Organization(
        slug="sepehr-tarabar",
        name_fa="سپهر ترابر تهران",
        name_en="Sepehr Tarabar Tehran",
        industry_fa="پخش و لجستیک شهری",
        industry_en="Urban distribution & logistics",
        contract_vehicles=420,
        monthly_fee_per_vehicle=320_000,
        contract_start=date(2026, 2, 21),
        contact_email="fleet@sepehr.ir",
        password="demo1234",
        logo_seed="س",
    ),
    Organization(
        slug="pars-leasing",
        name_fa="لیزینگ خودرو پارس",
        name_en="Pars Auto Leasing",
        industry_fa="اجاره و لیزینگ خودرو",
        industry_en="Car leasing & rental",
        contract_vehicles=260,
        monthly_fee_per_vehicle=320_000,
        contract_start=date(2026, 4, 10),
        contact_email="fleet@parsleasing.ir",
        password="demo1234",
        logo_seed="پ",
    ),
    Organization(
        slug="shahr-taxi",
        name_fa="تاکسی هوشمند شهر",
        name_en="Shahr Smart Taxi",
        industry_fa="حمل‌ونقل درون‌شهری",
        industry_en="Ride hailing",
        contract_vehicles=880,
        monthly_fee_per_vehicle=300_000,
        contract_start=date(2026, 1, 5),
        contact_email="fleet@shahrtaxi.ir",
        password="demo1234",
        logo_seed="ت",
    ),
]

CAR_MODELS = [
    ("ایران خودرو", "Iran Khodro", "پژو ۲۰۶ تیپ ۵", "Peugeot 206 TU5"),
    ("ایران خودرو", "Iran Khodro", "پژو پارس", "Peugeot Pars"),
    ("ایران خودرو", "Iran Khodro", "سمند LX", "Samand LX"),
    ("ایران خودرو", "Iran Khodro", "دنا پلاس توربو", "Dena Plus Turbo"),
    ("ایران خودرو", "Iran Khodro", "رانا پلاس", "Runna Plus"),
    ("سایپا", "Saipa", "کوییک R", "Quick R"),
    ("سایپا", "Saipa", "تیبا ۲", "Tiba 2"),
    ("سایپا", "Saipa", "شاهین", "Shahin"),
    ("سایپا", "Saipa", "وانت نیسان", "Nissan Pickup"),
    ("مدیران خودرو", "MVM", "X22 پرو", "MVM X22 Pro"),
    ("کرمان موتور", "Kerman Motor", "جک S3", "JAC S3"),
    ("بهمن موتور", "Bahman", "کاپرا ۲", "Capra 2"),
]

PLATE_LETTERS = ["الف", "ب", "ج", "د", "س", "ص", "ط", "ق", "ل", "م", "ن", "و", "ه", "ی", "ت", "ع"]

DRIVERS = [
    ("رضا محمدی", "Reza Mohammadi"),
    ("مهدی کریمی", "Mehdi Karimi"),
    ("سارا نیکنام", "Sara Niknam"),
    ("حسین رستمی", "Hossein Rostami"),
    ("علی شریفی", "Ali Sharifi"),
    ("زهرا موسوی", "Zahra Mousavi"),
    ("امیر قاسمی", "Amir Ghasemi"),
    ("نرگس احمدی", "Narges Ahmadi"),
    ("بهروز صادقی", "Behrouz Sadeghi"),
    ("مریم توکلی", "Maryam Tavakoli"),
    ("یاسر عباسی", "Yaser Abbasi"),
    ("پیمان رهنما", "Peyman Rahnama"),
]

TECHNICIANS = [
    ("کاوه اسدی", "Kaveh Asadi"),
    ("سعید برزگر", "Saeed Barzegar"),
    ("فرشاد نوری", "Farshad Nouri"),
    ("الهام رادمنش", "Elham Radmanesh"),
]

PARTNERS = [
    ("تعمیرگاه مرکزی ستاری", "Sattari Central Garage", "تعویض روغن و فیلتر", "Oil and filter change", 1_850_000, 85_000_000),
    ("تایر سرویس آریا", "Aria Tyre Service", "تعویض دو حلقه لاستیک جلو", "Two front tyres replaced", 9_400_000, 42_000_000),
    ("باتری اکسیدان", "Oxidan Battery", "تعویض باتری ۶۶ آمپر", "66Ah battery replacement", 5_200_000, 18_000_000),
    ("ترمز ایمن شرق", "Imen East Brakes", "تعویض لنت جلو و روتور", "Front pads and rotor", 6_700_000, 60_000_000),
    ("خدمات خنک‌کاری پارس", "Pars Cooling", "شست‌وشوی رادیاتور و ضدیخ", "Radiator flush and coolant", 3_100_000, 95_000_000),
]

RESULT_NOTES = {
    "engine-oil": [
        (CheckStatus.CRITICAL, "زیر حداقل مجاز", "Below minimum", "۲٬۴۰۰ کیلومتر از سرویس گذشته", "2,400 km past service"),
        (CheckStatus.ATTENTION, "نزدیک حداقل", "Near minimum", "تا ۱٬۰۰۰ کیلومتر آینده تعویض شود", "Replace within 1,000 km"),
        (CheckStatus.OK, "در محدوده", "Within range", None, None),
    ],
    "coolant": [
        (CheckStatus.ATTENTION, "کمی پایین‌تر از حد", "Slightly low", "احتمال نشتی جزئی از شلنگ بالا", "Possible minor upper hose leak"),
        (CheckStatus.OK, "سطح مناسب", "Level fine", None, None),
    ],
    "battery": [
        (CheckStatus.ATTENTION, "۱۱٫۹ ولت", "11.9 V", "افت ولتاژ در استارت سرد", "Voltage drop on cold start"),
        (CheckStatus.OK, "۱۲٫۶ ولت", "12.6 V", None, None),
    ],
    "washer": [(CheckStatus.OK, "پر", "Full", None, None), (CheckStatus.ATTENTION, "خالی", "Empty", "نازل سمت راست گرفته است", "Right nozzle blocked")],
    "lights": [
        (CheckStatus.ATTENTION, "چراغ ترمز راست سوخته", "Right brake light out", "قطعه در مرکز موجود است", "Part available in centre"),
        (CheckStatus.OK, "همه سالم", "All working", None, None),
    ],
    "tyres": [
        (CheckStatus.CRITICAL, "آج ۱٫۶ میلی‌متر", "Tread 1.6 mm", "لاستیک جلو چپ زیر حد قانونی", "Front-left below legal limit"),
        (CheckStatus.ATTENTION, "فشار ۲۸ psi", "Pressure 28 psi", "کمتر از مقدار پیشنهادی سازنده", "Below manufacturer spec"),
        (CheckStatus.OK, "آج ۵٫۸ میلی‌متر", "Tread 5.8 mm", None, None),
    ],
    "brakes": [
        (CheckStatus.CRITICAL, "لنت ۲ میلی‌متر", "Pads 2 mm", "صدای فلز روی فلز", "Metal-on-metal noise"),
        (CheckStatus.ATTENTION, "لنت ۴ میلی‌متر", "Pads 4 mm", "تا سرویس بعد تعویض شود", "Replace by next service"),
        (CheckStatus.OK, "لنت ۷ میلی‌متر", "Pads 7 mm", None, None),
    ],
    "wipers": [(CheckStatus.ATTENTION, "تیغه فرسوده", "Worn blade", "رگه روی شیشه باقی می‌گذارد", "Leaves streaks"), (CheckStatus.OK, "سالم", "Good", None, None)],
    "glass": [
        (CheckStatus.ATTENTION, "ترک ۱۲ میلی‌متری", "12 mm chip", "قابل تعمیر با رزین", "Repairable with resin"),
        (CheckStatus.OK, "بدون آسیب", "No damage", None, None),
    ],
    "dashboard": [
        (CheckStatus.CRITICAL, "چراغ چک روشن", "Check engine on", "کد P0301 — نامیزانی سیلندر ۱", "Code P0301 — cylinder 1 misfire"),
        (CheckStatus.OK, "بدون هشدار", "No warnings", None, None),
    ],
    "leaks": [
        (CheckStatus.ATTENTION, "لکه روغن جزئی", "Minor oil spot", "واشر کارتر نم دارد", "Sump gasket weeping"),
        (CheckStatus.OK, "خشک", "Dry", None, None),
    ],
    "noise": [
        (CheckStatus.ATTENTION, "صدای تعلیق جلو", "Front suspension noise", "روی دست‌انداز شنیده می‌شود", "Audible over bumps"),
        (CheckStatus.OK, "بدون صدای غیرعادی", "Nothing unusual", None, None),
    ],
}


def _fa_digits(text: str) -> str:
    return text.translate(str.maketrans("0123456789", "۰۱۲۳۴۵۶۷۸۹"))


def _plate(rng: random.Random) -> str:
    return f"{rng.randint(11, 99)}-{rng.choice(PLATE_LETTERS)}-{rng.randint(100, 999)}-{rng.choice([10, 11, 22, 33, 40, 55, 68, 78])}"


def _risk_from_results(results: list[CheckResult], weights: dict[str, int]) -> int:
    score = 8
    for r in results:
        w = weights.get(r.checkpoint_code, 1)
        if r.status == CheckStatus.CRITICAL:
            score += w * 11
        elif r.status == CheckStatus.ATTENTION:
            score += w * 4
    return min(score, 98)


def seed(session: Session) -> None:
    if session.exec(select(Service)).first():
        return

    for c in CENTERS:
        session.add(c)
    for s in SERVICES:
        session.add(s)
    weights: dict[str, int] = {}
    for i, (code, t_fa, t_en, d_fa, d_en, zone, icon, weight, x, y) in enumerate(CHECKPOINTS):
        weights[code] = weight
        session.add(
            Checkpoint(
                code=code,
                title_fa=t_fa,
                title_en=t_en,
                detail_fa=d_fa,
                detail_en=d_en,
                zone=zone,
                icon=icon,
                weight=weight,
                sort=i,
                pos_x=x,
                pos_y=y,
            )
        )
    for o in ORGS:
        session.add(o)
    session.commit()

    rng = random.Random(1405)
    now = datetime.now()
    orgs = session.exec(select(Organization)).all()
    live_centers = [c.slug for c in CENTERS if c.is_live]

    for org in orgs:
        count = {"sepehr-tarabar": 26, "pars-leasing": 14, "shahr-taxi": 18}[org.slug]
        for _ in range(count):
            make_fa, make_en, model_fa, model_en = rng.choice(CAR_MODELS)
            driver_fa, driver_en = rng.choice(DRIVERS)
            last = now - timedelta(days=rng.randint(2, 150), hours=rng.randint(0, 20))
            v = Vehicle(
                org_id=org.id,
                plate=_plate(rng),
                make_fa=make_fa,
                make_en=make_en,
                model_name=f"{model_fa}|{model_en}",
                year=rng.randint(1392, 1404),
                mileage_km=rng.randrange(38_000, 410_000, 1_000),
                driver_name_fa=driver_fa,
                driver_name_en=driver_en,
                driver_phone=f"09{rng.randint(10, 39)}{rng.randint(1000000, 9999999)}",
                last_check_at=last,
                next_due_at=last + timedelta(days=180),
                in_service=rng.random() < 0.08,
            )
            session.add(v)
    session.commit()

    vehicles = session.exec(select(Vehicle)).all()
    report_no = 24100
    for v in vehicles:
        n_reports = rng.choice([1, 1, 1, 2, 2, 3])
        latest_risk = 20
        for k in range(n_reports):
            performed = (v.last_check_at or now) - timedelta(days=175 * k)
            results: list[CheckResult] = []
            severity_budget = rng.choice([0, 0, 1, 1, 2, 2, 3, 4])
            codes = [c[0] for c in CHECKPOINTS]
            flagged = rng.sample(codes, k=min(severity_budget, len(codes)))
            for code in codes:
                options = RESULT_NOTES[code]
                if code in flagged:
                    pick = options[0] if rng.random() < 0.45 else options[min(1, len(options) - 1)]
                else:
                    pick = options[-1]
                status, val_fa, val_en, note_fa, note_en = pick
                results.append(
                    CheckResult(
                        report_id=0,
                        checkpoint_code=code,
                        status=status,
                        value_fa=val_fa,
                        value_en=val_en,
                        note_fa=note_fa,
                        note_en=note_en,
                    )
                )
            risk = _risk_from_results(results, weights)
            report_no += 1
            tech_fa, tech_en = rng.choice(TECHNICIANS)
            crit = [r for r in results if r.status == CheckStatus.CRITICAL]
            att = [r for r in results if r.status == CheckStatus.ATTENTION]
            if crit:
                sum_fa = _fa_digits(
                    f"{len(crit)} مورد بحرانی و {len(att)} مورد نیازمند توجه ثبت شد. ارجاع فوری پیشنهاد می‌شود."
                )
                sum_en = f"{len(crit)} critical and {len(att)} advisory items logged. Immediate referral recommended."
            elif att:
                sum_fa = _fa_digits(
                    f"{len(att)} مورد نیازمند توجه؛ خودرو قابل استفاده است اما سرویس کوتاه لازم دارد."
                )
                sum_en = f"{len(att)} advisory items; the vehicle is usable but needs a short service."
            else:
                sum_fa = "همه نقاط در محدوده سالم هستند؛ کار خاصی لازم نیست."
                sum_en = "All points are within healthy range; no action needed."
            report = CheckReport(
                code=f"CHK-{report_no}",
                org_id=v.org_id,
                vehicle_id=v.id,
                plate=v.plate,
                car_label_fa=f"{v.make_fa} {v.model_name.split('|')[0]}",
                car_label_en=f"{v.make_en} {v.model_name.split('|')[1]}",
                technician_fa=tech_fa,
                technician_en=tech_en,
                center_slug=rng.choice(live_centers),
                performed_at=performed,
                duration_min=rng.randint(14, 22),
                risk_score=risk,
                mileage_km=max(1000, v.mileage_km - k * rng.randint(4000, 12000)),
                summary_fa=sum_fa,
                summary_en=sum_en,
                estimated_saving=sum(
                    p[5] for p in rng.sample(PARTNERS, k=min(len(crit), 2))
                ) if crit else 0,
            )
            session.add(report)
            session.commit()
            session.refresh(report)
            for r in results:
                r.report_id = report.id
                session.add(r)
            if k == 0:
                latest_risk = risk
                v.open_issues = len(crit) + len(att)
                for _ in range(min(len(crit), 2)):
                    p_fa, p_en, j_fa, j_en, cost, avoided = rng.choice(PARTNERS)
                    session.add(
                        Referral(
                            report_id=report.id,
                            org_id=v.org_id,
                            partner_fa=p_fa,
                            partner_en=p_en,
                            job_fa=j_fa,
                            job_en=j_en,
                            status=rng.choice(
                                [ReferralStatus.PENDING, ReferralStatus.APPROVED, ReferralStatus.DONE]
                            ),
                            estimated_cost=cost,
                            avoided_cost=avoided,
                            created_at=performed,
                        )
                    )
        v.risk_score = latest_risk
        session.add(v)
    session.commit()

    demo_bookings = [
        Booking(
            code="IGC-48213",
            service_slug="glass-repair",
            center_slug="tehran-sattari",
            mode=ServiceMode.ONSITE,
            status=BookingStatus.IN_PROGRESS,
            customer_name="رضا محمدی",
            customer_phone="۰۹۱۲۳۴۵۶۷۸۹",
            org_name="سپهر ترابر تهران",
            plate="۳۴-ب-۷۸۲-۱۰",
            car_make="ایران خودرو",
            car_model="پژو پارس",
            car_year=1400,
            slot_start=now + timedelta(hours=3),
            price_estimate=1_200_000,
            report_code="CHK-24101",
        ),
        Booking(
            code="IGC-48219",
            service_slug="car-check",
            center_slug="tehran-resalat",
            mode=ServiceMode.ONSITE,
            status=BookingStatus.CONFIRMED,
            customer_name="سارا نیکنام",
            customer_phone="۰۹۳۵۱۱۲۲۳۳۴",
            plate="۶۲-ص-۱۴۹-۲۲",
            car_make="سایپا",
            car_model="شاهین",
            car_year=1402,
            slot_start=now + timedelta(days=1, hours=2),
            price_estimate=450_000,
        ),
        Booking(
            code="IGC-48190",
            service_slug="glass-replace",
            center_slug="tehran-karegar",
            mode=ServiceMode.MOBILE,
            status=BookingStatus.DELIVERED,
            customer_name="امیر قاسمی",
            customer_phone="۰۹۱۹۸۸۷۷۶۶۵",
            org_name="لیزینگ خودرو پارس",
            plate="۱۸-ط-۴۰۵-۶۸",
            car_make="ایران خودرو",
            car_model="دنا پلاس توربو",
            car_year=1403,
            slot_start=now - timedelta(days=2),
            address="تهران، شهرک غرب، خیابان ایران‌زمین، پارکینگ شماره ۲",
            price_estimate=14_500_000,
            report_code="CHK-24102",
        ),
    ]
    for b in demo_bookings:
        session.add(b)
    session.commit()
