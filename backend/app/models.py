"""Database tables for IranGlassCheck (ایران‌گلس‌چک)."""

from __future__ import annotations

from datetime import date, datetime
from enum import Enum

from sqlmodel import Field, SQLModel


class ServiceCategory(str, Enum):
    GLASS_REPAIR = "glass_repair"
    GLASS_REPLACE = "glass_replace"
    CHECK = "check"
    FLEET_SUBSCRIPTION = "fleet_subscription"
    MOBILE = "mobile"
    DATA = "data"


class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    READY = "ready"
    DELIVERED = "delivered"
    CANCELED = "canceled"


class CheckStatus(str, Enum):
    OK = "ok"
    ATTENTION = "attention"
    CRITICAL = "critical"


class ReferralStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    DONE = "done"
    DECLINED = "declined"


class ServiceMode(str, Enum):
    ONSITE = "onsite"
    MOBILE = "mobile"


class Center(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    slug: str = Field(index=True, unique=True)
    name_fa: str
    name_en: str
    city_fa: str
    city_en: str
    address_fa: str
    address_en: str
    phone: str
    lat: float
    lng: float
    bays: int = 2
    mobile_vans: int = 0
    rating: float = 4.8
    opens_at: str = "08:00"
    closes_at: str = "20:00"
    is_live: bool = True
    opening_label_fa: str | None = None
    opening_label_en: str | None = None


class Service(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    slug: str = Field(index=True, unique=True)
    category: ServiceCategory
    name_fa: str
    name_en: str
    tagline_fa: str
    tagline_en: str
    description_fa: str
    description_en: str
    price_from: int
    price_to: int | None = None
    price_unit_fa: str = "تومان"
    price_unit_en: str = "IRT"
    per_fa: str | None = None
    per_en: str | None = None
    duration_min: int = 30
    warranty_months: int = 0
    icon: str = "sparkles"
    highlight: bool = False
    sort: int = 0


class Checkpoint(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    code: str = Field(index=True, unique=True)
    title_fa: str
    title_en: str
    detail_fa: str
    detail_en: str
    zone: str  # engine | wheels | electrical | cabin | body
    icon: str
    weight: int = 1  # risk weight when critical
    sort: int = 0
    # position of the hotspot over the car diagram, in percent
    pos_x: float = 50
    pos_y: float = 50


class Organization(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    slug: str = Field(index=True, unique=True)
    name_fa: str
    name_en: str
    industry_fa: str
    industry_en: str
    plan: str = "fleet"
    contract_vehicles: int = 0
    monthly_fee_per_vehicle: int = 340_000
    contract_start: date | None = None
    contact_email: str = Field(index=True)
    password: str = "demo1234"
    logo_seed: str = "A"


class Vehicle(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    org_id: int = Field(foreign_key="organization.id", index=True)
    plate: str = Field(index=True)
    make_fa: str
    make_en: str
    model_name: str
    year: int
    mileage_km: int
    driver_name_fa: str
    driver_name_en: str
    driver_phone: str
    risk_score: int = 20
    last_check_at: datetime | None = None
    next_due_at: datetime | None = None
    open_issues: int = 0
    in_service: bool = False


class Booking(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    code: str = Field(index=True, unique=True)
    service_slug: str
    center_slug: str
    mode: ServiceMode = ServiceMode.ONSITE
    status: BookingStatus = BookingStatus.PENDING
    customer_name: str
    customer_phone: str
    customer_email: str | None = None
    org_name: str | None = None
    plate: str | None = None
    car_make: str | None = None
    car_model: str | None = None
    car_year: int | None = None
    slot_start: datetime
    address: str | None = None
    note: str | None = None
    price_estimate: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    report_code: str | None = None


class CheckReport(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    code: str = Field(index=True, unique=True)
    org_id: int | None = Field(default=None, foreign_key="organization.id", index=True)
    vehicle_id: int | None = Field(default=None, foreign_key="vehicle.id", index=True)
    booking_code: str | None = None
    plate: str
    car_label_fa: str
    car_label_en: str
    technician_fa: str
    technician_en: str
    center_slug: str
    performed_at: datetime
    duration_min: int = 18
    risk_score: int = 20
    mileage_km: int = 0
    summary_fa: str = ""
    summary_en: str = ""
    estimated_saving: int = 0


class CheckResult(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    report_id: int = Field(foreign_key="checkreport.id", index=True)
    checkpoint_code: str
    status: CheckStatus = CheckStatus.OK
    value_fa: str | None = None
    value_en: str | None = None
    note_fa: str | None = None
    note_en: str | None = None


class Referral(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    report_id: int = Field(foreign_key="checkreport.id", index=True)
    org_id: int | None = Field(default=None, foreign_key="organization.id", index=True)
    partner_fa: str
    partner_en: str
    job_fa: str
    job_en: str
    status: ReferralStatus = ReferralStatus.PENDING
    estimated_cost: int = 0
    avoided_cost: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Lead(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    company: str
    name: str
    phone: str
    email: str | None = None
    fleet_size: int = 0
    message: str | None = None
    locale: str = "fa"
    created_at: datetime = Field(default_factory=datetime.utcnow)
