// Vercel Routing Middleware: password gate for the whole site.
// Runs on Vercel before any file is served, so the app bundle (which contains the
// plan figures) is never delivered without the password. Local `npm run dev` is not gated.
//
// Password: only its SHA-256 hash is stored below, never the password itself.
// Optional override without a code change: set SITE_PASSWORD in Vercel → Settings →
// Environment Variables. Cookie path is "/", so one login covers both pages.
//
// The password is asked on EVERY page open (reload, new tab, link opened again):
//  - every HTML page request gets the password page,
//  - a correct password redirects to the page with a one-time pass `?k=` valid 60 s,
//  - the app removes `k` from the address bar at once (src/main.tsx), so a reload asks again,
//  - JS/CSS files need a browser-session cookie set at login (cleared when the browser closes).
import { next } from '@vercel/functions';

export const config = { matcher: '/:path*' };

const COOKIE = 'jupiter_auth';
const LOGIN_PATH = '/__login';
const PASS_PARAM = 'k';
const PASS_TTL_MS = 60_000;

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

const PASSWORD_SHA256 = '28cbd570b06ff29f131bfebe8339491787be4e245c685708199571969c0610be';

async function expectedHash(): Promise<string> {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.SITE_PASSWORD;
  return env ? sha256(env) : PASSWORD_SHA256;
}

/** Cookie token derived from the password hash: changing the password signs everyone out. */
async function token(): Promise<string> {
  return sha256((await expectedHash()) + ':jupiter-session-v1');
}

/** One-time pass for the page load right after login: "<timestamp>.<signature>". */
async function makePass(): Promise<string> {
  const ts = Date.now().toString(36);
  return ts + '.' + (await sha256((await token()) + ':pass:' + ts));
}

async function checkPass(pass: string | null): Promise<boolean> {
  if (!pass) return false;
  const [ts, sig] = pass.split('.');
  const age = Date.now() - parseInt(ts, 36);
  if (!sig || !(age >= 0 && age <= PASS_TTL_MS)) return false;
  return safeEqual(sig, await sha256((await token()) + ':pass:' + ts));
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

function readCookie(req: Request, name: string): string | null {
  const m = (req.headers.get('cookie') ?? '').match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : null;
}

function safeNext(raw: string | null): string {
  return raw && raw.startsWith('/') && !raw.startsWith('//') && !raw.startsWith(LOGIN_PATH) ? raw : '/';
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

function loginPage(nextPath: string, error: boolean): Response {
  const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>JUPITER</title>
<link rel="icon" href="/img/favicon.svg">
<style>
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px 16px;
font-family:Aptos,"Noto Sans",Arial,Helvetica,sans-serif;color:#FFFFFF;-webkit-font-smoothing:antialiased;
background:#002336 url(/img/bg-dark.jpg) center/cover no-repeat}
.card{width:100%;max-width:400px;border-radius:4px;padding:32px 28px;display:flex;flex-direction:column;gap:18px;
background:rgba(0,35,54,0.72);border:1px solid rgba(255,255,255,0.18);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
h1{margin:0;font-size:22px;font-weight:800}
h1 span{color:#00C3BF}
p{margin:0;font-size:14px;line-height:1.5;color:rgba(255,255,255,0.78)}
label{font-size:13px;font-weight:700;color:#00C3BF}
input{width:100%;padding:12px 14px;border-radius:4px;border:1px solid rgba(255,255,255,0.28);background:rgba(255,255,255,0.08);
color:#FFFFFF;font:inherit;font-size:15px}
input:focus{outline:none;border-color:#00C3BF}
button{padding:12px 20px;border-radius:4px;border:0;background:#00C3BF;color:#003E5F;font:inherit;font-size:15px;font-weight:700;cursor:pointer}
button:hover{background:#FFFFFF}
.err{font-size:13px;font-weight:700;color:#F34832}
form{display:flex;flex-direction:column;gap:10px}
</style></head><body>
<main class="card">
<h1>JUPITER <span>Szenarioplanung</span></h1>
<p>Streng vertraulich. Bitte Passwort eingeben.<br>Strictly confidential. Please enter the password.</p>
<form method="post" action="${LOGIN_PATH}">
<input type="hidden" name="next" value="${escapeHtml(nextPath)}">
<label for="pw">Passwort / Password</label>
<input id="pw" name="password" type="password" autocomplete="current-password" required autofocus>
${error ? '<div class="err" role="alert">Falsches Passwort. / Wrong password.</div>' : ''}
<button type="submit">Öffnen / Open</button>
</form>
</main></body></html>`;
  return new Response(html, {
    status: error ? 401 : 200,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' },
  });
}

export default async function middleware(req: Request): Promise<Response> {
  const url = new URL(req.url);

  // Public, non-confidential files needed by the login page itself.
  if (url.pathname.startsWith('/img/') || url.pathname === '/robots.txt') return next();

  if (url.pathname === LOGIN_PATH) {
    if (req.method !== 'POST') return loginPage(safeNext(url.searchParams.get('next')), false);
    const form = await req.formData();
    const nextPath = safeNext(String(form.get('next') ?? '/'));
    const given = await sha256(String(form.get('password') ?? ''));
    if (!safeEqual(given, await expectedHash())) {
      await new Promise((r) => setTimeout(r, 800)); // slow down guessing
      return loginPage(nextPath, true);
    }
    const target = new URL(nextPath, url.origin);
    target.searchParams.set(PASS_PARAM, await makePass());
    return new Response(null, {
      status: 303,
      headers: {
        location: target.pathname + target.search + target.hash,
        'cache-control': 'no-store',
        // No Max-Age: a browser-session cookie, only used for the app's JS/CSS files.
        'set-cookie': `${COOKIE}=${await token()}; Path=/; HttpOnly; Secure; SameSite=Lax`,
      },
    });
  }

  // Page requests: always the password page, unless this is the load right after login.
  const wantsHtml = req.method === 'GET' && (req.headers.get('accept') ?? '').includes('text/html');
  if (wantsHtml) {
    if (await checkPass(url.searchParams.get(PASS_PARAM))) return next({ headers: { 'cache-control': 'no-store' } });
    url.searchParams.delete(PASS_PARAM);
    return loginPage(url.pathname + url.search, false);
  }

  // Other files (JS, CSS): need the session cookie set at login.
  const cookie = readCookie(req, COOKIE);
  if (cookie && safeEqual(cookie, await token())) return next();
  return new Response('Unauthorized', { status: 401, headers: { 'cache-control': 'no-store' } });
}
