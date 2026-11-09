import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

test('App in mock mode (no AUTH0_DOMAIN)', async (t) => {
  const app = createApp({ mock: true });
  const server = app.listen(0);
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  t.after(() => {
    server.close();
  });

  await t.test('GET / returns 200 and indicates logged out status when unauthenticated', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.equal(res.status, 200);
    const text = await res.text();
    assert.match(text, /You are currently logged out/i);
    assert.match(text, /href="\/login"/);
  });

  await t.test('GET /profile redirects unauthenticated user to /login', async () => {
    const res = await fetch(`${baseUrl}/profile`, { redirect: 'manual' });
    assert.equal(res.status, 302);
    assert.equal(res.headers.get('location'), '/login');
  });

  await t.test('Mock login flow: GET /login logs in user and sets cookie', async () => {
    const res = await fetch(`${baseUrl}/login`, { redirect: 'manual' });
    assert.equal(res.status, 302);
    assert.equal(res.headers.get('location'), '/');
    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie, 'Expected Set-Cookie header');
    assert.match(setCookie, /mock_session=/);
  });

  await t.test('GET / with mock session shows logged in state with user details', async () => {
    const loginRes = await fetch(`${baseUrl}/login`, { redirect: 'manual' });
    const cookie = loginRes.headers.get('set-cookie');

    const homeRes = await fetch(`${baseUrl}/`, {
      headers: { cookie }
    });
    assert.equal(homeRes.status, 200);
    const html = await homeRes.text();
    assert.match(html, /Logged In/i);
    assert.match(html, /Jane Doe/);
    assert.match(html, /href="\/profile"/);
    assert.match(html, /href="\/logout"/);
  });

  await t.test('GET /profile with mock session displays user claims', async () => {
    const loginRes = await fetch(`${baseUrl}/login`, { redirect: 'manual' });
    const cookie = loginRes.headers.get('set-cookie');

    const profileRes = await fetch(`${baseUrl}/profile`, {
      headers: { cookie }
    });
    assert.equal(profileRes.status, 200);
    const html = await profileRes.text();
    assert.match(html, /Jane Doe/);
    assert.match(html, /jane\.doe@example\.com/);
    assert.match(html, /auth0\|mock123456789/);
    assert.match(html, /<img/);
  });

  await t.test('GET /logout clears session and redirects to /', async () => {
    const loginRes = await fetch(`${baseUrl}/login`, { redirect: 'manual' });
    const cookie = loginRes.headers.get('set-cookie');

    const logoutRes = await fetch(`${baseUrl}/logout`, {
      headers: { cookie },
      redirect: 'manual'
    });
    assert.equal(logoutRes.status, 302);
    assert.equal(logoutRes.headers.get('location'), '/');
    const setCookie = logoutRes.headers.get('set-cookie');
    assert.ok(setCookie);

    // Profile should now be inaccessible with cleared session
    const profileRes = await fetch(`${baseUrl}/profile`, {
      headers: { cookie: setCookie },
      redirect: 'manual'
    });
    assert.equal(profileRes.status, 302);
    assert.equal(profileRes.headers.get('location'), '/login');
  });
});
