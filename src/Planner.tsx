import { useMemo, useState, type CSSProperties } from 'react';
import {
  BASE, DRIVER_DEFS, PLAN, PLAN_REVENUE_2027, PRESETS, bridgeSteps, calc, driverEffect, tornado,
  type DriverDef, type DriverKey, type Drivers, type PresetKey,
} from './model';
import { T, type Lang } from './i18n';
import Header from './components/Header';
import { ROUTES, navigate } from './router';
import { TREE } from './tree/content';

// Golden Rules: green and red only with meaning (increase/decrease), blue main colour, rest black and grey.
const POS = '#00B167', NEG = '#F34832', NEU = '#595959';
export default function Planner({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const [s, setS] = useState<Drivers>({ ...BASE });
  const [preset, setPreset] = useState<PresetKey>('plan');
  const t = T[lang];
  const tt = TREE[lang];
  const toTree = (e: React.MouseEvent) => { e.preventDefault(); navigate(ROUTES.tree); };

  // Number formatting identical to the mockup (German decimal comma, negatives in brackets).
  const fx = (v: number, d: number) => (lang === 'de' ? v.toFixed(d).replace('.', ',') : v.toFixed(d));
  const f1 = (v: number) => fx(v, 1);
  const sg = (v: number) => (Math.abs(v) < 0.05 ? '±' + f1(0) : (v > 0 ? '+' : '(') + f1(Math.abs(v)) + (v > 0 ? '' : ')'));
  // Running text uses a minus sign; tiles and charts use brackets (IBCS).
  const sgText = (v: number) => (Math.abs(v) < 0.05 ? '±' + f1(0) : (v > 0 ? '+' : '-') + f1(Math.abs(v)));
  const col = (v: number) => (Math.abs(v) < 0.05 ? NEU : v > 0 ? POS : NEG);
  const colDark = (v: number) => (Math.abs(v) < 0.05 ? 'rgba(255,255,255,0.78)' : v > 0 ? '#00B167' : '#F34832');
  const pct = (v: number) => (v > 0 ? '+' : v < 0 ? '-' : '') + fx(Math.abs(v), 1) + '%';

  const fmt: Record<DriverKey, (v: number) => string> = {
    gL: (v) => fx(v, 1) + '%',
    nL: (v) => v + ' ' + (v === 1 ? t.land : t.lands),
    price: pct,
    churn: (v) => fx(v, 1) + 'pp',
    gS: (v) => fx(v, 1) + '%',
    anc: (v) => v + '%',
    pers: pct,
    sach: pct,
    volL: (v) => fx(v, 1),
    volS: (v) => fx(v, 1),
    ftL: (v) => v + '%',
    ftS: (v) => v + '%',
    ftAnc: (v) => v + '%',
    mult: (v) => fx(v, 1) + 'x',
  };
  const copy = (d: DriverDef) => t.drivers[d.k] as readonly string[];

  const c = useMemo(() => calc(s), [s]);
  const tor = useMemo(() => tornado(s), [s]);

  const update = (k: DriverKey, v: number) => {
    setS((prev) => ({ ...prev, [k]: v }));
    setPreset('custom');
  };
  const applyPreset = (key: PresetKey, v: Partial<Drivers>) => {
    setS({ ...BASE, ...v });
    setPreset(key);
  };

  // KPIs
  const dE = c.ebitda - PLAN.ebitda2027, dR = c.rev - PLAN_REVENUE_2027;
  const evPlan = PLAN.ebitda2027 * s.mult, ev = c.ebitda * s.mult;
  const margin = (c.ebitda / c.rev) * 100;
  const m = fx(s.mult, 1);
  const kpis = [
    { label: t.kRev, value: f1(c.rev), delta: sg(dR) + ' ' + t.vsPlan + ' ' + f1(PLAN_REVENUE_2027), sub: t.kRevSub + fx((Math.sqrt(c.rev / PLAN.revenue2025) - 1) * 100, 1) + t.pa, hi: false, d: dR },
    { label: t.kE, value: f1(c.ebitda), delta: sg(dE) + ' ' + t.vsPlan + ' ' + f1(PLAN.ebitda2027), sub: t.kESub, hi: true, d: dE },
    { label: t.kM, value: f1(margin) + '%', delta: sg(margin - PLAN.margin2027) + 'pp ' + t.vsPlan + ' ' + f1(PLAN.margin2027) + '%', sub: t.kMSub, hi: false, d: margin - PLAN.margin2027 },
    { label: t.kEV(m), value: f1(ev), delta: sg(ev - evPlan) + ' ' + t.vsPlan + ' ' + f1(evPlan), sub: t.kEVSub, hi: false, d: ev - evPlan },
  ];

  // Bridge
  const steps = bridgeSteps(c.e);
  const pts: number[] = [PLAN.ebitda2027];
  let run: number = PLAN.ebitda2027;
  steps.forEach((v) => { run += v; pts.push(run); });
  const lo = Math.min(0, ...pts), hi = Math.max(...pts) * 1.12 + 0.8;
  const H = 260;
  const px = (v: number) => ((v - lo) / (hi - lo)) * H;
  type Bar = { label: string; a: number; b: number; v: number; total: boolean; color: string };
  const bars: Bar[] = [{ label: t.bars[0], a: 0, b: PLAN.ebitda2027, v: PLAN.ebitda2027, total: true, color: '#98A6AE' }];
  run = PLAN.ebitda2027;
  steps.forEach((v, i) => {
    const a = run, b = run + v;
    bars.push({ label: t.bars[i + 1], a, b, v, total: false, color: Math.abs(v) < 0.005 ? '#98A6AE' : v > 0 ? POS : NEG });
    run = b;
  });
  bars.push({ label: t.bars[9], a: 0, b: c.ebitda, v: c.ebitda, total: true, color: '#003E5F' });
  const bridge = bars.map((x) => {
    const y1 = px(Math.min(x.a, x.b)), y2 = px(Math.max(x.a, x.b));
    const h = Math.max(2, y2 - y1);
    return {
      ...x, bottom: y1, height: h, labelBottom: y1 + h + 4,
      valText: x.total ? f1(x.v) : Math.abs(x.v) < 0.05 ? f1(0) : sg(x.v),
      textColor: x.total ? '#003E5F' : col(x.v),
    };
  });

  // Tornado
  const all: number[] = [PLAN.ebitda2027];
  tor.forEach((r) => all.push(r.eLo, r.eHi, r.eCur));
  const tLo = Math.min(...all) - 2.5, tHi = Math.max(...all) + 2.5;
  const tp = (v: number) => ((v - tLo) / (tHi - tLo)) * 100;
  const P = PLAN.ebitda2027;
  const top = tor[0], second = tor[1];
  const insight = t.insight({
    top: copy(top.def)[2], topSpan: f1(top.span), m, topEV: f1(top.span * s.mult),
    sec: copy(second.def)[2], secSpan: f1(second.span), half: f1(s.mult),
  });


  const card: CSSProperties = { borderRadius: 4, border: '1.33px solid #D9D9D9', overflow: 'hidden', background: '#FFFFFF' };

  return (
    <>
      <Header lang={lang} setLang={setLang} title={t.brand} conf={t.conf} links={[
        { label: tt.navTree, href: ROUTES.tree, page: true },
        { label: tt.navPlanner, href: ROUTES.planner, page: true, active: true },
      ]} />

      <section id="top" style={{ position: 'relative', overflow: 'hidden', background: '#002336 url(/img/bg-dark.jpg) center/cover no-repeat', color: '#FFFFFF' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(0,35,54,0.62),rgba(0,35,54,0.8))', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 1320, margin: '0 auto', padding: '72px 24px 64px', display: 'flex', flexDirection: 'column', gap: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 900, flex: '1 1 600px' }}>
            <h1 style={{ margin: 0, fontSize: 'clamp(32px,4.2vw,54px)', lineHeight: 1.08, fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF', textWrap: 'balance' } as CSSProperties}>{t.heroTitle}</h1>
          </div>
          <a href={ROUTES.tree} onClick={toTree} className="btn-light"
            style={{ flex: '0 0 auto', padding: '9px 18px', borderRadius: 4, fontSize: 13, fontWeight: 700 }}>{tt.toTree}</a>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {PRESETS.map((p, i) => {
                const on = preset === p.key;
                return (
                  <button key={p.key} type="button" className="chip preset" aria-pressed={on} onClick={() => applyPreset(p.key, p.v)}
                    style={{ padding: '11px 20px', borderRadius: 4, fontSize: 15, fontWeight: 700, border: '1.33px solid ' + (on ? '#FFFFFF' : 'rgba(255,255,255,0.4)'), background: on ? '#FFFFFF' : 'transparent', color: on ? '#003E5F' : '#FFFFFF' }}>
                    {t.presets[i]}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,210px),1fr))', gap: 14 }}>
            {kpis.map((k) => (
              <div key={k.label} style={{ borderRadius: 4, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 6, background: k.hi ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.06)', border: '1.33px solid ' + (k.hi ? '#FFFFFF' : 'rgba(255,255,255,0.25)'), backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: k.hi ? '#FFFFFF' : 'rgba(255,255,255,0.78)' }}>{k.label}</div>
                <div style={{ fontSize: 36, lineHeight: 1.1, fontWeight: 800, color: '#FFFFFF' }}>{k.value}</div>
                <div style={{ fontSize: 14, lineHeight: 1.4, fontWeight: 700, color: colDark(k.d) }}>{k.delta}</div>
                <div style={{ fontSize: 12.5, lineHeight: 1.45, color: 'rgba(255,255,255,0.72)' }}>{k.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="treiber" style={{ background: '#FFFFFF', scrollMarginTop: 70 }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '72px 24px 88px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: 28, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
            {t.groups.map((title, gi) => (
              <div key={title} style={{ borderRadius: 4, border: '1.33px solid #D9D9D9', background: '#F2F2F2', overflow: 'hidden' }}>
                <div style={{ background: '#003E5F', color: '#FFFFFF', fontSize: 14, fontWeight: 700, padding: '12px 20px' }}>{title}</div>
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {DRIVER_DEFS.filter((d) => d.g === gi).map((d) => {
                    const eff = driverEffect(d.k, c.e);
                    const id = 'sl-' + d.k;
                    return (
                      <div key={d.k} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                          <label htmlFor={id} style={{ fontSize: 14, fontWeight: 700, color: '#000000' }}>{copy(d)[0]}</label>
                          <span style={{ fontSize: 14, fontWeight: 800, color: s[d.k] === BASE[d.k] ? '#000000' : '#003E5F', whiteSpace: 'nowrap' }}>{fmt[d.k](s[d.k])}</span>
                        </div>
                        <input id={id} type="range" min={d.min} max={d.max} step={d.step} value={s[d.k]}
                          onChange={(ev) => update(d.k, parseFloat(ev.target.value))}
                          style={{ width: '100%', height: 24, margin: 0 }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', fontSize: 12.5, lineHeight: 1.4, color: '#595959' }}>
                          <span>{copy(d)[1]}</span>
                          <span style={{ fontWeight: 700, color: eff === null ? NEU : col(eff) }}>{eff === null ? t.via[d.k] : 'EBITDA ' + sgText(eff) + ' ' + t.unit}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="button" className="btn-outline" onClick={() => applyPreset('plan', {})}
                style={{ padding: '10px 18px', borderRadius: 4, fontSize: 14, fontWeight: 700 }}>
                {t.reset}
              </button>
              <a href={ROUTES.tree} onClick={toTree} className="btn-solid"
                style={{ padding: '10px 18px', borderRadius: 4, fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>{tt.toTree}</a>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
            <div id="bruecke" style={{ ...card, scrollMarginTop: 80 }}>
              <div style={{ padding: '20px 24px 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#000000' }}>{t.bridgeTitle}</div>
                <div style={{ fontSize: 13, color: '#595959' }}>{t.bridgeSub}</div>
              </div>
              <div style={{ padding: '20px 24px 18px' }}>
                <div role="img" aria-label={t.bridgeTitle + ': ' + bridge.map((b) => b.label + ' ' + b.valText).join(', ')}
                  style={{ position: 'relative', height: 300, display: 'flex', gap: 6, alignItems: 'stretch', borderBottom: '1.33px solid #003E5F' }}>
                  {bridge.map((b) => (
                    <div key={b.label} style={{ position: 'relative', flex: '1 1 0', minWidth: 0 }}>
                      <div style={{ position: 'absolute', left: 3, right: 3, bottom: b.bottom, height: b.height, background: b.color, borderRadius: 4, transition: 'all .25s' }} />
                      <div style={{ position: 'absolute', left: 0, right: 0, bottom: b.labelBottom, textAlign: 'center', fontSize: 13, fontWeight: 700, color: b.textColor, transition: 'bottom .25s' }}>{b.valText}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6, paddingTop: 8 }}>
                  {bridge.map((b) => (
                    <div key={b.label} style={{ flex: '1 1 0', minWidth: 0, textAlign: 'center', fontSize: 11.5, lineHeight: 1.3, color: '#595959', overflowWrap: 'break-word', hyphens: 'auto', WebkitHyphens: 'auto' }}>{b.label}</div>
                  ))}
                </div>
              </div>
            </div>

            <div id="tornado" style={{ ...card, scrollMarginTop: 80 }}>
              <div style={{ padding: '20px 24px 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#000000' }}>{t.tornTitle}</div>
              </div>
              <div style={{ padding: '18px 24px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {tor.map((r) => {
                  const mn = Math.min(r.eLo, r.eHi), mx = Math.max(r.eLo, r.eHi);
                  const f = fmt[r.def.k];
                  return (
                    <div key={r.def.k} className="tornado-row">
                      <div style={{ fontSize: 13, lineHeight: 1.35 }}>
                        <span style={{ fontWeight: 700, color: '#000000' }}>{copy(r.def)[0]}</span><br />
                        <span style={{ color: '#595959' }}>{r.def.k === 'nL' ? `${r.def.min} ${t.to} ${r.def.max} ${t.lands}` : f(r.def.min) + ' ' + t.to + ' ' + f(r.def.max)}</span>
                      </div>
                      <div className="tornado-bar" style={{ position: 'relative', height: 30, background: '#F2F2F2', borderRadius: 4 }}>
                        <div style={{ position: 'absolute', top: 6, height: 18, left: tp(Math.min(mn, P)) + '%', width: tp(P) - tp(Math.min(mn, P)) + '%', background: NEG }} />
                        <div style={{ position: 'absolute', top: 6, height: 18, left: tp(P) + '%', width: tp(Math.max(mx, P)) - tp(P) + '%', background: POS }} />
                        <div style={{ position: 'absolute', top: 0, bottom: 0, left: tp(P) + '%', width: 2, background: '#003E5F' }} />
                        <div style={{ position: 'absolute', top: 8, width: 14, height: 14, marginLeft: -7, borderRadius: '50%', left: tp(r.eCur) + '%', background: '#FFFFFF', border: '3px solid #003E5F', transition: 'left .25s' }} />
                        <span style={{ position: 'absolute', top: 7, right: `calc(${100 - tp(mn)}% + 6px)`, fontSize: 12, color: '#000000' }}>{f1(mn)}</span>
                        <span style={{ position: 'absolute', top: 7, left: `calc(${tp(mx)}% + 6px)`, fontSize: 12, color: '#000000' }}>{f1(mx)}</span>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 800, color: '#000000' }}>{f1(r.span)}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ background: '#003E5F', color: '#FFFFFF', borderRadius: 4, padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.75)' }}>{t.reading}</div>
              <div style={{ fontSize: 16, lineHeight: 1.6, textWrap: 'pretty' } as CSSProperties}>{insight}</div>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
