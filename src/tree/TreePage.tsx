import type { CSSProperties, ReactNode } from 'react';
import type { Lang } from '../i18n';
import Header from '../components/Header';
import { ROUTES, navigate } from '../router';
import { TAG_STYLE, TREE, type Leaf } from './content';

const INK = '#000000';
const bold: CSSProperties = { fontWeight: 700 };

/** Three plan values under their IBCS period labels (25 AC, 26 FC, 27 PL), instead of arrows. */
function Periods({ labels, values, dark }: { labels: string[]; values: string[]; dark?: boolean }) {
  return (
    <span className="vt-periods" style={{ borderColor: dark ? 'rgba(255,255,255,0.35)' : '#D9D9D9' }}>
      {labels.map((l, i) => (
        <span key={l}><small style={{ color: dark ? 'rgba(255,255,255,0.75)' : '#595959' }}>{l}</small><b>{values[i]}</b></span>
      ))}
    </span>
  );
}

function Box({ variant, children, style }: { variant: 'root' | 'branch' | 'comp' | 'driver' | 'effect'; children: ReactNode; style?: CSSProperties }) {
  return <div className={'vt-box vt-' + variant} style={style}>{children}</div>;
}

function LeafRow({ leaf }: { leaf: Leaf }) {
  const tag = TAG_STYLE[leaf.tag];
  return (
    <div className="vt-leaf">
      <Box variant="driver"><span><b style={bold}>{leaf.title}</b><br />{leaf.evidence}</span></Box>
      <Box variant="effect">
        <span>
          <span style={{ display: 'inline-block', padding: '0 6px', marginRight: 6, borderRadius: 4, background: tag.bg, color: tag.fg, fontSize: 11, lineHeight: '17px', fontWeight: 700 }}>{leaf.tagLabel}</span>
          {leaf.effect}
        </span>
      </Box>
    </div>
  );
}

export default function TreePage({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const t = TREE[lang];
  const toPlanner = (e: React.MouseEvent) => { e.preventDefault(); navigate(ROUTES.planner); };

  return (
    <>
      <Header lang={lang} setLang={setLang} title={t.brand} conf={t.conf} links={[
        { label: t.navTree, href: ROUTES.tree, page: true, active: true },
        { label: t.navPlanner, href: ROUTES.planner, page: true },
      ]} />

      <main style={{ background: '#FFFFFF', color: INK }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '40px 24px 48px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
              <h1 style={{ ...bold, margin: 0, flex: '1 1 600px', fontSize: 'clamp(20px,1.9vw,25px)', lineHeight: 1.32, color: '#00C3BF', textWrap: 'pretty' } as CSSProperties}>{t.headline}</h1>
              <a href={ROUTES.planner} onClick={toPlanner} className="btn-solid"
                style={{ flex: '0 0 auto', padding: '9px 18px', borderRadius: 4, fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>{t.toPlanner}</a>
            </div>
            <div style={{ borderTop: '1.33px solid #003E5F' }} />
            <div style={{ fontSize: 17, lineHeight: '24px', fontWeight: 700, color: '#000000' }}>{t.subtitle}</div>
          </div>

          {/* Plan bridge */}
          <section style={{ border: '1.33px solid #D9D9D9', borderRadius: 4, overflow: 'hidden' }}>
            <div className="vt-head">{t.bridgeTitle}</div>
            <div className="vt-bridge">
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, color: INK, minWidth: 380 }}>
                  <thead>
                    <tr style={{ background: '#003E5F', color: '#FFFFFF' }}>
                      {t.cols.map((c, i) => <th key={c} style={{ padding: '6px 8px', textAlign: i ? 'right' : 'left', fontWeight: 700 }}>{c}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {t.rows.map((r) => (
                      <tr key={r.k} style={r.bold ? { fontWeight: 700 } : undefined}>
                        <td style={{ padding: '5px 8px', borderBottom: '1.33px solid #D9D9D9' }}>{r.k}</td>
                        {r.v.map((v, i) => (
                          <td key={i} style={{ padding: '5px 8px', textAlign: 'right', borderBottom: '1.33px solid #D9D9D9', ...(i === 3 ? { fontWeight: 700 } : {}) }}>{v}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, lineHeight: '18px' }}>
                {t.messages.map(([h, b]) => <p key={h} style={{ margin: 0 }}><b>{h}</b> {b}</p>)}
              </div>
            </div>
          </section>

          {/* Tree */}
          <section aria-label={t.subtitle}>
            <div className="vt-colheads" aria-hidden="true">
              <span /><span /><div className="vt-head">{t.colHeads[0]}</div><div className="vt-head">{t.colHeads[1]}</div><div className="vt-head">{t.colHeads[2]}</div>
            </div>
            <div className="vt">
              <Box variant="root">
                <span><b style={{ ...bold, fontSize: 17 }}>{t.root.title}</b><br />{t.root.lines.join(' ')}<br />
                  <Periods labels={t.periods} values={t.root.values} dark />{t.root.after.map((l) => <span key={l} style={{ display: 'block' }}>{l}</span>)}</span>
              </Box>
              <div className="vt-children" style={{ '--vt-gap': '40px' } as CSSProperties}>
                {t.branches.map((b) => (
                  <div className="vt-item" key={b.title}>
                    <div className="vt-row">
                      <Box variant="branch">
                        <span><b style={{ ...bold, fontSize: 15 }}>{b.title}</b>{b.titleNote ? ' ' + b.titleNote : ''}<br /><Periods labels={t.periods} values={b.values} />
                          {b.lines.map((l) => <span key={l} style={{ display: 'block' }}>{l}</span>)}</span>
                      </Box>
                      <div className="vt-children" style={{ '--vt-gap': '24px' } as CSSProperties}>
                        {b.children.map((c) => (
                          <div className="vt-item" key={c.title}>
                            <div className="vt-row">
                              <Box variant="comp">
                                <span><b style={bold}>{c.title}</b>{c.titleNote ? ' ' + c.titleNote : ''}
                                  {c.values && <><br /><Periods labels={t.periods} values={c.values} /></>}
                                  {c.sub && <span style={{ display: 'block' }}>{c.sub}</span>}</span>
                              </Box>
                              <div className="vt-children vt-leaves" style={{ '--vt-gap': '10px' } as CSSProperties}>
                                {c.leaves.map((l) => <div className="vt-item" key={l.title}><LeafRow leaf={l} /></div>)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <a href={ROUTES.planner} onClick={toPlanner} className="btn-solid"
              style={{ padding: '9px 18px', borderRadius: 4, fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>{t.toPlanner}</a>
          </div>
        </div>
      </main>

    </>
  );
}
