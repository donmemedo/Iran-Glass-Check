export type CheckStatusKey = "ok" | "attention" | "critical";
export type BookingStatusKey =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "ready"
  | "delivered"
  | "canceled";
export type ReferralStatusKey = "pending" | "approved" | "done" | "declined";

export interface Service {
  id: number;
  slug: string;
  category: string;
  name_fa: string;
  name_en: string;
  tagline_fa: string;
  tagline_en: string;
  description_fa: string;
  description_en: string;
  price_from: number;
  price_to: number | null;
  per_fa: string | null;
  per_en: string | null;
  duration_min: number;
  warranty_months: number;
  icon: string;
  highlight: boolean;
  sort: number;
}

export interface Center {
  id: number;
  slug: string;
  name_fa: string;
  name_en: string;
  city_fa: string;
  city_en: string;
  address_fa: string;
  address_en: string;
  phone: string;
  lat: number;
  lng: number;
  bays: number;
  mobile_vans: number;
  rating: number;
  opens_at: string;
  closes_at: string;
  is_live: boolean;
  opening_label_fa: string | null;
  opening_label_en: string | null;
}

export interface Checkpoint {
  id: number;
  code: string;
  title_fa: string;
  title_en: string;
  detail_fa: string;
  detail_en: string;
  zone: "engine" | "wheels" | "electrical" | "cabin" | "body";
  icon: string;
  weight: number;
  sort: number;
  pos_x: number;
  pos_y: number;
}

export interface Stats {
  vehicles_covered: number;
  checks_done: number;
  avg_check_minutes: number;
  prevented_cost: number;
  b2b_contracts: number;
  live_centers: number;
  bookings: number;
  referral_rate: number;
  gross_margin: number;
  satisfaction: number;
  sla_minutes: number;
}

export interface Booking {
  id: number;
  code: string;
  service_slug: string;
  center_slug: string;
  mode: "onsite" | "mobile";
  status: BookingStatusKey;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  org_name: string | null;
  plate: string | null;
  car_make: string | null;
  car_model: string | null;
  car_year: number | null;
  slot_start: string;
  address: string | null;
  note: string | null;
  price_estimate: number;
  created_at: string;
  report_code: string | null;
}

export interface Slot {
  start: string;
  label: string;
  available: boolean;
}

export interface TrackResponse {
  booking: Booking;
  service: Service | null;
  center: Center | null;
  timeline: { status: BookingStatusKey; reached: boolean; current: boolean }[];
  canceled: boolean;
}

export interface Vehicle {
  id: number;
  org_id: number;
  plate: string;
  make_fa: string;
  make_en: string;
  model_name: string;
  year: number;
  mileage_km: number;
  driver_name_fa: string;
  driver_name_en: string;
  driver_phone: string;
  risk_score: number;
  last_check_at: string | null;
  next_due_at: string | null;
  open_issues: number;
  in_service: boolean;
}

export interface CheckReport {
  id: number;
  code: string;
  org_id: number | null;
  vehicle_id: number | null;
  booking_code: string | null;
  plate: string;
  car_label_fa: string;
  car_label_en: string;
  technician_fa: string;
  technician_en: string;
  center_slug: string;
  performed_at: string;
  duration_min: number;
  risk_score: number;
  mileage_km: number;
  summary_fa: string;
  summary_en: string;
  estimated_saving: number;
}

export interface CheckResult {
  id: number;
  report_id: number;
  checkpoint_code: string;
  status: CheckStatusKey;
  value_fa: string | null;
  value_en: string | null;
  note_fa: string | null;
  note_en: string | null;
}

export interface Referral {
  id: number;
  report_id: number;
  org_id: number | null;
  partner_fa: string;
  partner_en: string;
  job_fa: string;
  job_en: string;
  status: ReferralStatusKey;
  estimated_cost: number;
  avoided_cost: number;
  created_at: string;
}

export interface ReportResponse {
  report: CheckReport;
  center: Center | null;
  vehicle: Vehicle | null;
  referrals: Referral[];
  results: { result: CheckResult; checkpoint: Checkpoint }[];
  counts: Record<CheckStatusKey, number>;
}

export interface Organization {
  id: number;
  slug: string;
  name_fa: string;
  name_en: string;
  industry_fa: string;
  industry_en: string;
  plan: string;
  contract_vehicles: number;
  monthly_fee_per_vehicle: number;
  contract_start: string | null;
  contact_email: string;
  logo_seed: string;
}

export interface FleetOverview {
  org: Organization;
  kpi: {
    vehicles: number;
    avg_risk: number;
    high_risk: number;
    watch: number;
    checks_30d: number;
    open_referrals: number;
    in_service: number;
    avoided_cost: number;
    program_cost: number;
    net_saving: number;
    due_soon: number;
  };
  risk_buckets: { healthy: number; watch: number; critical: number };
  top_issues: { code: string; title_fa: string; title_en: string; count: number }[];
  trend: { label: string; checks: number; critical: number }[];
}

export interface RoiResult {
  fleet_size: number;
  avg_vehicle_age: number;
  checks_per_year: number;
  monthly_fee_per_vehicle: number;
  baseline: { repairs: number; downtime: number; glass: number; total: number };
  program: {
    subscription: number;
    minor_jobs: number;
    repairs: number;
    downtime: number;
    glass: number;
    total: number;
  };
  net_saving: number;
  saving_percent: number;
  saving_per_vehicle: number;
  monthly_saving: number;
  breakdowns_avoided: number;
  downtime_days_saved: number;
  payback_months: number;
}
