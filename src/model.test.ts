import { describe, expect, it } from 'vitest';
import { BASE, PLAN, PLAN_REVENUE_2027, PRESETS, calc, sanitizeDrivers, tornado } from './model';

describe('scenario model', () => {
  it('starts from revenue 2025 = 100 and keeps the plan structure', () => {
    expect(PLAN.licences2025 + PLAN.services2025 + PLAN.other2025).toBeCloseTo(100, 9);
    expect(PLAN_REVENUE_2027).toBeCloseTo(107.7, 1);
  });

  it('reproduces the management plan at base settings', () => {
    const r = calc(BASE);
    // exact, not just rounded: every delta vs. plan must read ±0,0
    expect(r.ebitda).toBeCloseTo(PLAN.ebitda2027, 9);
    expect(r.rev).toBeCloseTo(PLAN_REVENUE_2027, 9);
    expect(r.rev * BASE.mult).toBeCloseTo(PLAN_REVENUE_2027 * BASE.mult, 9);
  });

  it('downside lowers and upside raises EBITDA', () => {
    const run = (k: string) => calc({ ...BASE, ...PRESETS.find((p) => p.key === k)!.v }).ebitda;
    expect(run('down')).toBeLessThan(PLAN.ebitda2027);
    expect(run('up')).toBeGreaterThan(PLAN.ebitda2027);
    expect(run('anchor')).toBeLessThan(run('down'));
  });

  it('1% personnel cost increase costs 0.614 index points EBITDA', () => {
    expect(calc({ ...BASE, pers: 1 }).e.pers).toBeCloseTo(-0.614, 6);
  });

  it('churn uses a blended flow-through (50% licence, 50% services)', () => {
    // 1pp churn = 0.9 index points revenue x (0.5 x 80% + 0.5 x 25%) = 52.5%
    expect(calc({ ...BASE, churn: 1 }).e.churn).toBeCloseTo(-0.9 * 0.525, 9);
  });

  it('tornado is sorted by span and covers the 8 revenue/cost drivers', () => {
    const t = tornado(BASE);
    expect(t).toHaveLength(8);
    for (let i = 1; i < t.length; i++) expect(t[i - 1].span).toBeGreaterThanOrEqual(t[i].span);
  });

  it('sanitizes stored drivers', () => {
    const d = sanitizeDrivers({ gL: 999, mult: 'x', evil: 1 });
    expect(d.gL).toBe(25);
    expect(d.mult).toBe(BASE.mult);
    expect('evil' in d).toBe(false);
  });
});
