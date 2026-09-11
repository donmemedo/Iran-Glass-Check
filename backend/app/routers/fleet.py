from collections import Counter
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..database import get_session
from ..models import (
    CheckReport,
    CheckResult,
    CheckStatus,
    Checkpoint,
    Organization,
    Referral,
    ReferralStatus,
    Vehicle,
)
from ..schemas import LoginRequest
from ..security import current_org, issue_token

router = APIRouter(prefix="/api/fleet", tags=["fleet"])


def public_org(org: Organization) -> dict:
    return org.model_dump(exclude={"password"})


@router.post("/login")
def login(payload: LoginRequest, session: Session = Depends(get_session)):
    org = session.exec(
        select(Organization).where(Organization.contact_email == payload.email.strip().lower())
    ).first()
    if not org or org.password != payload.password:
        raise HTTPException(401, "bad_credentials")
    return {"token": issue_token(org.id), "org": public_org(org)}


@router.get("/overview")
def overview(
    org: Organization = Depends(current_org),
    session: Session = Depends(get_session),
):
    vehicles = session.exec(select(Vehicle).where(Vehicle.org_id == org.id)).all()
    reports = session.exec(select(CheckReport).where(CheckReport.org_id == org.id)).all()
    referrals = session.exec(select(Referral).where(Referral.org_id == org.id)).all()

    now = datetime.now()
    month_ago = now - timedelta(days=30)
    recent_reports = [r for r in reports if r.performed_at >= month_ago]
    high_risk = [v for v in vehicles if v.risk_score >= 60]
    watch = [v for v in vehicles if 35 <= v.risk_score < 60]

    report_ids = {r.id for r in reports}
    results = [
        r
        for r in session.exec(select(CheckResult)).all()
        if r.report_id in report_ids and r.status != CheckStatus.OK
    ]
    titles = {c.code: (c.title_fa, c.title_en) for c in session.exec(select(Checkpoint)).all()}
    issue_counts = Counter(r.checkpoint_code for r in results)
    top_issues = [
        {
            "code": code,
            "title_fa": titles[code][0],
            "title_en": titles[code][1],
            "count": count,
        }
        for code, count in issue_counts.most_common(6)
    ]

    trend = []
    for i in range(5, -1, -1):
        start = (now - timedelta(days=30 * (i + 1))).date()
        end = (now - timedelta(days=30 * i)).date()
        bucket = [r for r in reports if start <= r.performed_at.date() < end]
        trend.append(
            {
                "label": end.isoformat(),
                "checks": len(bucket),
                "critical": sum(1 for r in bucket if r.risk_score >= 60),
            }
        )

    # A hazard counts as avoided once the fleet has acted on the referral,
    # not only after the invoice lands.
    acted_on = (ReferralStatus.APPROVED, ReferralStatus.DONE)
    avoided = sum(r.avoided_cost for r in referrals if r.status in acted_on)
    program_cost = org.monthly_fee_per_vehicle * max(len(vehicles), 1) * 12

    return {
        "org": public_org(org),
        "kpi": {
            "vehicles": len(vehicles),
            "avg_risk": round(sum(v.risk_score for v in vehicles) / max(len(vehicles), 1)),
            "high_risk": len(high_risk),
            "watch": len(watch),
            "checks_30d": len(recent_reports),
            "open_referrals": sum(1 for r in referrals if r.status == ReferralStatus.PENDING),
            "in_service": sum(1 for v in vehicles if v.in_service),
            "avoided_cost": avoided,
            "program_cost": program_cost,
            "net_saving": avoided - program_cost,
            "due_soon": sum(
                1 for v in vehicles if v.next_due_at and v.next_due_at <= now + timedelta(days=21)
            ),
        },
        "risk_buckets": {
            "healthy": sum(1 for v in vehicles if v.risk_score < 35),
            "watch": len(watch),
            "critical": len(high_risk),
        },
        "top_issues": top_issues,
        "trend": trend,
    }


@router.get("/vehicles")
def fleet_vehicles(
    org: Organization = Depends(current_org),
    session: Session = Depends(get_session),
):
    vehicles = session.exec(
        select(Vehicle).where(Vehicle.org_id == org.id).order_by(Vehicle.risk_score.desc())
    ).all()
    latest: dict[int, str] = {}
    for rep in session.exec(
        select(CheckReport)
        .where(CheckReport.org_id == org.id)
        .order_by(CheckReport.performed_at.desc())
    ).all():
        latest.setdefault(rep.vehicle_id, rep.code)
    return [{"vehicle": v, "last_report_code": latest.get(v.id)} for v in vehicles]


@router.get("/reports")
def fleet_reports(
    org: Organization = Depends(current_org),
    session: Session = Depends(get_session),
    limit: int = 40,
):
    return session.exec(
        select(CheckReport)
        .where(CheckReport.org_id == org.id)
        .order_by(CheckReport.performed_at.desc())
        .limit(limit)
    ).all()


@router.get("/referrals")
def fleet_referrals(
    org: Organization = Depends(current_org),
    session: Session = Depends(get_session),
):
    refs = session.exec(
        select(Referral).where(Referral.org_id == org.id).order_by(Referral.created_at.desc())
    ).all()
    reports = {
        r.id: r
        for r in session.exec(select(CheckReport).where(CheckReport.org_id == org.id)).all()
    }
    return [
        {
            "referral": ref,
            "plate": reports[ref.report_id].plate if ref.report_id in reports else None,
            "report_code": reports[ref.report_id].code if ref.report_id in reports else None,
        }
        for ref in refs
    ]


@router.patch("/referrals/{referral_id}")
def update_referral(
    referral_id: int,
    status: ReferralStatus,
    org: Organization = Depends(current_org),
    session: Session = Depends(get_session),
):
    ref = session.exec(
        select(Referral).where(Referral.id == referral_id, Referral.org_id == org.id)
    ).first()
    if not ref:
        raise HTTPException(404, "referral_not_found")
    ref.status = status
    session.add(ref)
    session.commit()
    session.refresh(ref)
    return ref
