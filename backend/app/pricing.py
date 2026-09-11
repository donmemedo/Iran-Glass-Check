"""Prevention-vs-breakdown economics.

The numbers come from the IranGlassCheck business plan: a fleet pays a small
monthly per-vehicle fee so that engine-killing neglect (oil, coolant, brakes)
is caught at the glass appointment instead of on the roadside.
"""

from dataclasses import dataclass

TOMAN = 1


@dataclass(frozen=True)
class Assumptions:
    major_failure_rate: float = 0.09  # major breakdowns per vehicle per year
    prevention_effectiveness: float = 0.62  # share of those a 12-point check prevents
    avg_major_repair: int = 85_000_000
    downtime_days_major: int = 7
    downtime_cost_per_day: int = 2_500_000
    minor_fix_rate: float = 0.55  # vehicles needing a small preventive job
    avg_minor_cost: int = 2_800_000
    glass_incident_rate: float = 0.22
    avg_glass_cost: int = 9_500_000
    contract_glass_discount: float = 0.18
    single_check_price: int = 450_000


ASSUMPTIONS = Assumptions()


def subscription_per_vehicle(fleet_size: int) -> int:
    """Volume tiers from the plan: 300k–380k Toman per vehicle per month."""
    if fleet_size >= 500:
        return 300_000
    if fleet_size >= 200:
        return 320_000
    if fleet_size >= 50:
        return 350_000
    return 380_000


def estimate(fleet_size: int, avg_vehicle_age: int = 8, checks_per_year: int = 2) -> dict:
    a = ASSUMPTIONS
    fleet_size = max(1, min(fleet_size, 20_000))
    checks_per_year = max(1, min(checks_per_year, 4))

    # Older fleets fail more; cap the multiplier so the model stays honest.
    age_factor = min(1.0 + max(0, avg_vehicle_age - 5) * 0.07, 1.9)
    coverage = min(1.0, 0.55 + 0.22 * checks_per_year)  # more visits, more caught

    baseline_failures = fleet_size * a.major_failure_rate * age_factor
    prevented = baseline_failures * a.prevention_effectiveness * coverage
    remaining_failures = baseline_failures - prevented

    downtime_per_failure = a.downtime_days_major * a.downtime_cost_per_day
    baseline_repair = baseline_failures * a.avg_major_repair
    baseline_downtime = baseline_failures * downtime_per_failure
    baseline_glass = fleet_size * a.glass_incident_rate * a.avg_glass_cost
    baseline_total = baseline_repair + baseline_downtime + baseline_glass

    monthly_fee = subscription_per_vehicle(fleet_size)
    program_fee = monthly_fee * 12 * fleet_size
    minor_jobs = fleet_size * a.minor_fix_rate * a.avg_minor_cost
    program_repair = remaining_failures * a.avg_major_repair
    program_downtime = remaining_failures * downtime_per_failure
    program_glass = fleet_size * a.glass_incident_rate * a.avg_glass_cost * (
        1 - a.contract_glass_discount
    )
    program_total = program_fee + minor_jobs + program_repair + program_downtime + program_glass

    net_saving = baseline_total - program_total
    monthly_saving = net_saving / 12
    payback_months = (program_fee / 12) / monthly_saving if monthly_saving > 0 else 0

    return {
        "fleet_size": fleet_size,
        "avg_vehicle_age": avg_vehicle_age,
        "checks_per_year": checks_per_year,
        "monthly_fee_per_vehicle": monthly_fee,
        "baseline": {
            "repairs": round(baseline_repair),
            "downtime": round(baseline_downtime),
            "glass": round(baseline_glass),
            "total": round(baseline_total),
        },
        "program": {
            "subscription": round(program_fee),
            "minor_jobs": round(minor_jobs),
            "repairs": round(program_repair),
            "downtime": round(program_downtime),
            "glass": round(program_glass),
            "total": round(program_total),
        },
        "net_saving": round(net_saving),
        "saving_percent": round(net_saving / baseline_total * 100, 1) if baseline_total else 0,
        "saving_per_vehicle": round(net_saving / fleet_size),
        "monthly_saving": round(monthly_saving),
        "breakdowns_avoided": round(prevented, 1),
        "downtime_days_saved": round(prevented * a.downtime_days_major),
        "payback_months": round(max(payback_months, 0.3), 1),
    }
