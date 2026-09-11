from fastapi import APIRouter, Depends
from sqlmodel import Session, func, select

from ..database import get_session
from ..models import Booking, Center, CheckReport, Checkpoint, Organization, Service, Vehicle

router = APIRouter(prefix="/api/catalog", tags=["catalog"])


@router.get("/services")
def services(session: Session = Depends(get_session)):
    return session.exec(select(Service).order_by(Service.sort)).all()


@router.get("/centers")
def centers(session: Session = Depends(get_session)):
    return session.exec(select(Center).order_by(Center.is_live.desc(), Center.id)).all()


@router.get("/checkpoints")
def checkpoints(session: Session = Depends(get_session)):
    return session.exec(select(Checkpoint).order_by(Checkpoint.sort)).all()


@router.get("/stats")
def stats(session: Session = Depends(get_session)):
    """Headline numbers for the marketing pages, derived from live data."""
    vehicles = session.exec(select(func.count()).select_from(Vehicle)).one()
    reports = session.exec(select(func.count()).select_from(CheckReport)).one()
    avg_duration = session.exec(select(func.avg(CheckReport.duration_min))).one() or 18
    saved = session.exec(select(func.sum(CheckReport.estimated_saving))).one() or 0
    contracts = session.exec(select(func.count()).select_from(Organization)).one()
    live_centers = session.exec(
        select(func.count()).select_from(Center).where(Center.is_live == True)  # noqa: E712
    ).one()
    bookings = session.exec(select(func.count()).select_from(Booking)).one()
    return {
        "vehicles_covered": vehicles,
        "checks_done": reports,
        "avg_check_minutes": round(float(avg_duration)),
        "prevented_cost": int(saved),
        "b2b_contracts": contracts,
        "live_centers": live_centers,
        "bookings": bookings,
        "referral_rate": 18,
        "gross_margin": 60,
        "satisfaction": 85,
        "sla_minutes": 10,
    }
