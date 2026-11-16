import type { Lang } from '../i18n';
import { navigate } from '../router';

export interface NavLink {
  label: string;
  href: string;
  /** Internal page link (client-side navigation) rather than an in-page anchor. */
  page?: boolean;
  active?: boolean;
}

interface Props {
  lang: Lang;
  setLang: (l: Lang) => void;
  title: string;
  conf: string;
  links: NavLink[];
}

export default function Header({ lang, setLang, title, conf, links }: Props) {
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(0,35,54,0.86)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px 24px', flexWrap: 'wrap' }}>
        <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#FFFFFF' }}>JUPITER <span style={{ color: '#00C3BF' }}>{title}</span></span>
        </a>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '10px 24px', flexWrap: 'wrap', fontSize: 14, whiteSpace: 'nowrap' }}>
          {links.map((l) => (
            <a key={l.href} className="nav-link" href={l.href} aria-current={l.active ? 'page' : undefined}
              style={l.active ? { color: '#FFFFFF', fontWeight: 700 } : undefined}
              onClick={l.page ? (e) => { e.preventDefault(); navigate(l.href); } : undefined}>
              {l.label}
            </a>
          ))}
          <div role="group" aria-label="Sprache / Language" style={{ display: 'flex', gap: 2, padding: 3, border: '1.33px solid rgba(255,255,255,0.3)', borderRadius: 4, fontSize: 12, fontWeight: 700 }}>
            {(['de', 'en'] as Lang[]).map((l) => (
              <button key={l} type="button" className="chip" aria-pressed={l === lang} onClick={() => setLang(l)}
                style={{ padding: '4px 10px', borderRadius: 4, border: 0, fontSize: 12, fontWeight: 700, background: l === lang ? '#FFFFFF' : 'transparent', color: l === lang ? '#003E5F' : 'rgba(255,255,255,0.78)' }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <span style={{ padding: '7px 14px', borderRadius: 4, border: '1.33px solid rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, color: '#FFFFFF' }}>{conf}</span>
        </nav>
      </div>
    </header>
  );
}
