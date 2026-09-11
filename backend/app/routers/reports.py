from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..database import get_session
from ..models import Center, CheckReport, CheckResult, CheckStatus, Checkpoint, Referral, Vehicle

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/{code}")
def report(code: str, session: Session = Depends(get_session)):
    rep = session.exec(select(CheckReport).where(CheckReport.code == code.upper().strip())).first()
    if not rep:
        raise HTTPException(404, "report_not_found")
    results = session.exec(select(CheckResult).where(CheckResult.report_id == rep.id)).all()
    checkpoints = {c.code: c for c in session.exec(select(Checkpoint)).all()}
    center = session.exec(select(Center).where(Center.slug == rep.center_slug)).first()
    referrals = session.exec(select(Referral).where(Referral.report_id == rep.id)).all()
    vehicle = (
        session.exec(select(Vehicle).where(Vehicle.id == rep.vehicle_id)).first()
        if rep.vehicle_id
        else None
    )
    ordered = sorted(results, key=lambda r: checkpoints[r.checkpoint_code].sort)
    return {
        "report": rep,
        "center": center,
        "vehicle": vehicle,
        "referrals": referrals,
        "results": [
            {"result": r, "checkpoint": checkpoints[r.checkpoint_code]} for r in ordered
        ],
        "counts": {
            "ok": sum(1 for r in results if r.status == CheckStatus.OK),
            "attention": sum(1 for r in results if r.status == CheckStatus.ATTENTION),
            "critical": sum(1 for r in results if r.status == CheckStatus.CRITICAL),
        },
    }
