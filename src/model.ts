// EBITDA 2027 scenario model for Project Jupiter.
// Pure functions only, so the arithmetic can be unit-tested independently of the UI.
// All amounts are an index: group revenue 2025 AC = 100. Index values are stored rounded to
// one decimal; percentages, margins, growth rates and multiples are the plan values.

export const PLAN = {
  revenue2025: 100,
  ebitda2027: 13.7,
  margin2027: 12.7,
  licences2025: 14.2,
  services2025: 83.3,
  other2025: 2.5,
  other2027: 0.9,
  growthLicences: 14.354, // % p. a. 2025-2027, plan
  growthServices: 2.917, // % p. a. 2025-2027, plan
  recurringBase: 46.6,
  churnRevenuePerPp: 0.9,
  anchorRevenue: 24.7,
  personnelBase: 61.4,
  materialsBase: 35.1,
} as const;

/** Plan values 2027 follow from the 2025 index values and the plan growth rates. */
export const PLAN_LICENCES_2027 = PLAN.licences2025 * Math.pow(1 + PLAN.growthLicences / 100, 2);
export const PLAN_SERVICES_2027 = PLAN.services2025 * Math.pow(1 + PLAN.growthServices / 100, 2);
export const PLAN_REVENUE_2027 = PLAN_LICENCES_2027 + PLAN_SERVICES_2027 + PLAN.other2027;

export type DriverKey =
  | 'gL' | 'nL' | 'price' | 'churn' | 'gS' | 'anc' | 'pers' | 'sach'
  | 'volL' | 'volS' | 'ftL' | 'ftS' | 'ftAnc' | 'mult';

export type Drivers = Record<DriverKey, number>;

export type PresetKey = 'plan' | 'down' | 'up' | 'anchor' | 'custom';

export const BASE: Drivers = {
  gL: PLAN.growthLicences, gS: PLAN.growthServices, nL: 0, volL: 1.4, volS: 1.4, price: 0, churn: 0,
  pers: 0, sach: 0, anc: 0, ftL: 80, ftS: 25, ftAnc: 50, mult: 14.5,
};

export const PRESETS: { key: Exclude<PresetKey, 'custom'>; v: Partial<Drivers> }[] = [
  { key: 'plan', v: {} },
  { key: 'down', v: { gL: 8, gS: 0, churn: 1, pers: 2, sach: 2 } },
  { key: 'up', v: { gL: 18, gS: 5, nL: 1, price: 2, pers: -2 } },
  { key: 'anchor', v: { anc: 60, gL: 10, churn: 1 } },
];

export interface DriverDef {
  k: DriverKey;
  /** 0 revenue drivers, 1 cost drivers, 2 assumptions and valuation */
  g: 0 | 1 | 2;
  min: number;
  max: number;
  step: number;
}

export const DRIVER_DEFS: DriverDef[] = [
  { k: 'gL', g: 0, min: 0, max: 25, step: 0.5 },
  { k: 'nL', g: 0, min: 0, max: 3, step: 1 },
  { k: 'price', g: 0, min: -3, max: 5, step: 0.5 },
  { k: 'churn', g: 0, min: 0, max: 4, step: 0.5 },
  { k: 'gS', g: 0, min: -5, max: 8, step: 0.5 },
  { k: 'anc', g: 0, min: 0, max: 100, step: 5 },
  { k: 'pers', g: 1, min: -5, max: 5, step: 0.5 },
  { k: 'sach', g: 1, min: -5, max: 5, step: 0.5 },
  { k: 'volL', g: 2, min: 0.7, max: 5.6, step: 0.7 },
  { k: 'volS', g: 2, min: 0, max: 5.6, step: 0.7 },
  { k: 'ftL', g: 2, min: 50, max: 95, step: 5 },
  { k: 'ftS', g: 2, min: 5, max: 50, step: 5 },
  { k: 'ftAnc', g: 2, min: 20, max: 80, step: 5 },
  { k: 'mult', g: 2, min: 8, max: 20, step: 0.5 },
];

export interface EbitdaEffects {
  lic: number; svc: number; neu: number; price: number; churn: number;
  pers: number; sach: number; anc: number;
}

export interface CalcResult {
  rev: number;
  ebitda: number;
  e: EbitdaEffects;
}

export function calc(s: Drivers): CalcResult {
  const lic = PLAN.licences2025 * Math.pow(1 + s.gL / 100, 2);
  const svc = PLAN.services2025 * Math.pow(1 + s.gS / 100, 2);
  const fL = s.ftL / 100, fS = s.ftS / 100, fA = s.ftAnc / 100;
  const r = {
    lic: lic - PLAN_LICENCES_2027,
    svc: svc - PLAN_SERVICES_2027,
    neu: s.nL * (s.volL + s.volS),
    price: (s.price / 100) * PLAN.recurringBase,
    churn: -s.churn * PLAN.churnRevenuePerPp,
    anc: (-s.anc / 100) * PLAN.anchorRevenue,
  };
  const e: EbitdaEffects = {
    lic: fL * r.lic,
    svc: fS * r.svc,
    neu: s.nL * (fL * s.volL + fS * s.volS),
    price: r.price,
    // A lost customer takes recurring and project revenue: blended flow-through, half licence, half services.
    churn: (0.5 * fL + 0.5 * fS) * r.churn,
    pers: (-s.pers / 100) * PLAN.personnelBase,
    sach: (-s.sach / 100) * PLAN.materialsBase,
    anc: fA * r.anc,
  };
  const rev = PLAN_REVENUE_2027 + r.lic + r.svc + r.neu + r.price + r.churn + r.anc;
  const ebitda = PLAN.ebitda2027 + Object.values(e).reduce((a, b) => a + b, 0);
  return { rev, ebitda, e };
}

/** Bridge steps in display order (matches the bridge labels after "Plan 27 PL"). */
export function bridgeSteps(e: EbitdaEffects): number[] {
  return [e.lic, e.svc, e.neu, e.price, e.churn, e.pers, e.sach, e.anc];
}

/** EBITDA effect attributed to each slider, or null where it acts through other drivers. */
export function driverEffect(k: DriverKey, e: EbitdaEffects): number | null {
  const map: Partial<Record<DriverKey, keyof EbitdaEffects>> = {
    gL: 'lic', nL: 'neu', price: 'price', churn: 'churn', gS: 'svc', anc: 'anc', pers: 'pers', sach: 'sach',
  };
  const m = map[k];
  return m ? e[m] : null;
}

export interface TornadoRow {
  def: DriverDef;
  eLo: number;
  eHi: number;
  eCur: number;
  span: number;
}

/** One-at-a-time sensitivity of EBITDA 2027 for revenue and cost drivers, sorted by span. */
export function tornado(s: Drivers): TornadoRow[] {
  return DRIVER_DEFS.filter((d) => d.g < 2)
    .map((def) => {
      const only = (val: number) => {
        const tt: Drivers = { ...BASE, volL: s.volL, volS: s.volS, ftL: s.ftL, ftS: s.ftS, ftAnc: s.ftAnc };
        tt[def.k] = val;
        return calc(tt).ebitda;
      };
      const eLo = only(def.min), eHi = only(def.max), eCur = only(s[def.k]);
      return { def, eLo, eHi, eCur, span: Math.abs(eHi - eLo) };
    })
    .sort((a, b) => b.span - a.span);
}

/** Sanitise drivers loaded from storage: unknown keys dropped, values clamped to slider ranges. */
export function sanitizeDrivers(raw: unknown): Drivers {
  const out: Drivers = { ...BASE };
  if (raw && typeof raw === 'object') {
    for (const d of DRIVER_DEFS) {
      const v = (raw as Record<string, unknown>)[d.k];
      if (typeof v === 'number' && Number.isFinite(v)) {
        out[d.k] = Math.min(d.max, Math.max(d.min, v));
      }
    }
  }
  return out;
}
