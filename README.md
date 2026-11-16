# Projekt Jupiter: Werttreiberbaum und Szenarioplanung

Two pages, German and English, behind a site password:

- `/` Werttreiberbaum (value driver tree revenue to EBITDA, plan bridge)
- `/szenarioplanung` interactive EBITDA 2027 scenario planner: sliders for revenue and
  cost drivers, four presets, key figures, EBITDA bridge and tornado sensitivity

All amounts are shown as an index: group revenue 2025 AC = 100. Percentages, margins,
growth rates and multiples are plan values. Strictly confidential.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173 (not password-protected locally)
npm test           # model and password-gate tests
npm run build      # production build in dist/
```

## Structure

| Path | Purpose |
| --- | --- |
| `src/model.ts` | Plan index values, drivers, presets, EBITDA calculation, tornado (pure, tested) |
| `src/i18n.ts` | German/English copy of the scenario planner |
| `src/tree/` | Werttreiberbaum page and its content |
| `src/Planner.tsx` | Scenario planner page |
| `src/App.tsx`, `src/router.ts` | Language state and the two routes |
| `middleware.ts` | Password gate (Vercel Routing Middleware) |
| `vercel.json` | Vercel deploy config with security headers |

## Password protection

`middleware.ts` puts the whole site behind a password before any file is served,
including the JavaScript bundle. Only the SHA-256 hash of the password is in the code.
To change the password without a code change, set `SITE_PASSWORD` in Vercel
(Settings, Environment Variables) and redeploy. The password is asked every time a page
is opened; the session cookie (path `/`) covers both pages.

## Deploy (Vercel)

Production branch `main`. Every push to `main` deploys to production.
