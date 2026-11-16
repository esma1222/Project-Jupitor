import { useEffect, useState } from 'react';
import type { Lang } from './i18n';
import Planner from './Planner';
import TreePage from './tree/TreePage';
import { ROUTES, usePath } from './router';

const LANG_KEY = 'jupiter-szen-lang';

function initialLang(): Lang {
  try {
    return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'de';
  } catch {
    return 'de';
  }
}

export default function App() {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const path = usePath();
  const setLang = (l: Lang) => {
    try { localStorage.setItem(LANG_KEY, l); } catch { /* storage unavailable */ }
    setLangState(l);
  };
  const planner = path.replace(/\/+$/, '') === ROUTES.planner;

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = (planner
      ? (lang === 'de' ? 'JUPITER Szenarioplanung' : 'JUPITER Scenario Planning')
      : (lang === 'de' ? 'JUPITER Werttreiberbaum' : 'JUPITER Value Driver Tree'));
  }, [lang, planner]);

  return planner ? <Planner lang={lang} setLang={setLang} /> : <TreePage lang={lang} setLang={setLang} />;
}
