import { describe, expect, it } from 'vitest';
import middleware from './middleware';

// Test password via the SITE_PASSWORD override; the real password is never written into the repo.
process.env.SITE_PASSWORD = 'test-password-123';

const html = (path: string, cookie?: string) =>
  new Request('https://x.test' + path, { headers: { accept: 'text/html', ...(cookie ? { cookie } : {}) } });
const post = (pw: string) => new Request('https://x.test/__login', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ password: pw, next: '/?code=abc#tornado' }),
});
const isLogin = async (r: Response) => (await r.text()).includes('name="password"');
const passes = (r: Response) => r.headers.get('x-middleware-next') === '1';

describe('password gate (asked on every open)', () => {
  it('shows the login page instead of the app', async () => {
    expect(await isLogin(await middleware(html('/')))).toBe(true);
  });
  it('blocks the app bundle without the cookie', async () => {
    expect((await middleware(new Request('https://x.test/assets/index-abc.js'))).status).toBe(401);
  });
  it('rejects a wrong password', async () => {
    const r = await middleware(post('wrong-password'));
    expect(r.status).toBe(401);
    expect(r.headers.get('set-cookie')).toBeNull();
  });

  it('the right password opens the page once; reopening asks again', async () => {
    const r = await middleware(post('test-password-123'));
    expect(r.status).toBe(303);
    const loc = new URL(r.headers.get('location')!, 'https://x.test');
    expect(loc.pathname).toBe('/');
    expect(loc.searchParams.get('code')).toBe('abc');
    expect(loc.hash).toBe('#tornado');
    const setCookie = r.headers.get('set-cookie')!;
    expect(setCookie).not.toMatch(/Max-Age|Expires/i);
    const cookie = setCookie.split(';')[0];

    // The redirect target (with the one-time pass) loads the app...
    expect(passes(await middleware(html(loc.pathname + loc.search, cookie)))).toBe(true);
    // ...and its JS file loads with the session cookie.
    expect(passes(await middleware(new Request('https://x.test/assets/index-abc.js', { headers: { cookie } })))).toBe(true);
    // Reload / reopen the link (no pass): password page again, even with the cookie.
    expect(await isLogin(await middleware(html('/', cookie)))).toBe(true);
  });

  it('rejects forged or expired passes', async () => {
    expect(await isLogin(await middleware(html('/?k=abc.def')))).toBe(true);
    const old = (Date.now() - 120_000).toString(36);
    expect(await isLogin(await middleware(html('/?k=' + old + '.' + 'f'.repeat(64))))).toBe(true);
  });

  it('without SITE_PASSWORD it uses the built-in password hash', async () => {
    const saved = process.env.SITE_PASSWORD;
    delete process.env.SITE_PASSWORD;
    expect(await isLogin(await middleware(html('/')))).toBe(true);
    expect((await middleware(post('test-password-123'))).status).toBe(401);
    process.env.SITE_PASSWORD = saved;
  });

  it('lets login-page images through', async () => {
    expect(passes(await middleware(new Request('https://x.test/img/bg-dark.jpg')))).toBe(true);
  });
});
