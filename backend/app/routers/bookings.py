import random
from datetime import date, datetime, time, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..database import get_session
from ..models import Booking, BookingStatus, Center, Service
from ..schemas import BookingCreate

router = APIRouter(prefix="/api/bookings", tags=["bookings"])

STATUS_FLOW = [
    BookingStatus.PENDING,
    BookingStatus.CONFIRMED,
    BookingStatus.IN_PROGRESS,
    BookingStatus.READY,
    BookingStatus.DELIVERED,
]


@router.get("/slots")
def slots(center_slug: str, day: date, session: Session = Depends(get_session)):
    """Half-hour slots for a centre, with a deterministic pattern of taken ones."""
    center = session.exec(select(Center).where(Center.slug == center_slug)).first()
    if not center:
        raise HTTPException(404, "center_not_found")

    open_h, open_m = (int(x) for x in center.opens_at.split(":"))
    close_h, close_m = (int(x) for x in center.closes_at.split(":"))
    cursor = datetime.combine(day, time(open_h, open_m))
    end = datetime.combine(day, time(close_h, close_m))
    taken = session.exec(
        select(Booking).where(
            Booking.center_slug == center_slug,
            Booking.status != BookingStatus.CANCELED,
        )
    ).all()
    taken_keys = {b.slot_start.strftime("%Y-%m-%d %H:%M") for b in taken}

    rng = random.Random(f"{center_slug}-{day.isoformat()}")
    out = []
    now = datetime.now()
    while cursor < end:
        key = cursor.strftime("%Y-%m-%d %H:%M")
        busy = key in taken_keys or rng.random() < 0.28
        out.append(
            {
                "start": cursor.isoformat(),
                "label": cursor.strftime("%H:%M"),
                "available": not busy and cursor > now,
            }
        )
        cursor += timedelta(minutes=30)
    return {"center": center_slug, "day": day.isoformat(), "slots": out}


@router.post("", status_code=201)
def create(payload: BookingCreate, session: Session = Depends(get_session)):
    service = session.exec(select(Service).where(Service.slug == payload.service_slug)).first()
    if not service:
        raise HTTPException(422, "service_not_found")
    center = session.exec(select(Center).where(Center.slug == payload.center_slug)).first()
    if not center or not center.is_live:
        raise HTTPException(422, "center_not_available")

    code = f"IGC-{random.randint(10000, 99999)}"
    while session.exec(select(Booking).where(Booking.code == code)).first():
        code = f"IGC-{random.randint(10000, 99999)}"

    booking = Booking(
        code=code,
        status=BookingStatus.CONFIRMED,
        price_estimate=service.price_from,
        **payload.model_dump(),
    )
    session.add(booking)
    session.commit()
    session.refresh(booking)
    return booking


@router.get("/{code}")
def track(code: str, session: Session = Depends(get_session)):
    booking = session.exec(select(Booking).where(Booking.code == code.upper().strip())).first()
    if not booking:
        raise HTTPException(404, "booking_not_found")
    service = session.exec(select(Service).where(Service.slug == booking.service_slug)).first()
    center = session.exec(select(Center).where(Center.slug == booking.center_slug)).first()
    reached = (
        STATUS_FLOW.index(booking.status) if booking.status in STATUS_FLOW else -1
    )
    timeline = [
        {"status": s.value, "reached": i <= reached, "current": i == reached}
        for i, s in enumerate(STATUS_FLOW)
    ]
    return {
        "booking": booking,
        "service": service,
        "center": center,
        "timeline": timeline,
        "canceled": booking.status == BookingStatus.CANCELED,
    }
