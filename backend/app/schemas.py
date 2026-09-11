from datetime import datetime

from pydantic import BaseModel, Field

from .models import ServiceMode


class BookingCreate(BaseModel):
    service_slug: str
    center_slug: str
    mode: ServiceMode = ServiceMode.ONSITE
    customer_name: str = Field(min_length=2, max_length=80)
    customer_phone: str = Field(min_length=8, max_length=20)
    customer_email: str | None = None
    org_name: str | None = None
    plate: str | None = None
    car_make: str | None = None
    car_model: str | None = None
    car_year: int | None = None
    slot_start: datetime
    address: str | None = None
    note: str | None = None


class LeadCreate(BaseModel):
    company: str = Field(min_length=2, max_length=120)
    name: str = Field(min_length=2, max_length=80)
    phone: str = Field(min_length=8, max_length=20)
    email: str | None = None
    fleet_size: int = 0
    message: str | None = None
    locale: str = "fa"


class RoiRequest(BaseModel):
    fleet_size: int = 120
    avg_vehicle_age: int = 8
    checks_per_year: int = 2


class LoginRequest(BaseModel):
    email: str
    password: str
