from fastapi import APIRouter, Depends
from sqlmodel import Session

from .. import pricing
from ..database import get_session
from ..models import Lead
from ..schemas import LeadCreate, RoiRequest

router = APIRouter(prefix="/api", tags=["misc"])


@router.post("/roi")
def roi(payload: RoiRequest):
    return pricing.estimate(
        fleet_size=payload.fleet_size,
        avg_vehicle_age=payload.avg_vehicle_age,
        checks_per_year=payload.checks_per_year,
    )


@router.post("/leads", status_code=201)
def create_lead(payload: LeadCreate, session: Session = Depends(get_session)):
    lead = Lead(**payload.model_dump())
    session.add(lead)
    session.commit()
    session.refresh(lead)
    return {"ok": True, "id": lead.id}
