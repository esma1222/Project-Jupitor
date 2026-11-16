import { useEffect, useState } from 'react';

// Minimal client-side routing for the two pages; Vercel rewrites every path to index.html.
export const ROUTES = { tree: '/', planner: '/szenarioplanung' } as const;

export function navigate(path: string) {
  const [p, hash] = path.split('#');
  if (p !== window.location.pathname) {
    window.history.pushState(null, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
  if (hash) requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' }));
  else window.scrollTo({ top: 0 });
}

export function usePath(): string {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const on = () => setPath(window.location.pathname);
    window.addEventListener('popstate', on);
    return () => window.removeEventListener('popstate', on);
  }, []);
  return path;
}
