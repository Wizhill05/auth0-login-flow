import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

test('App configuration & edge cases', async (t) => {
  await t.test('createApp with explicit mock: false mounts oidc auth middleware', async () => {
    // Test that when mock: false is passed, it attempts to load express-openid-connect
    process.env.AUTH0_DOMAIN = 'test.auth0.com';
    process.env.AUTH0_CLIENT_ID = 'test-client-id';
    process.env.AUTH0_CLIENT_SECRET = 'test-secret';
    process.env.AUTH0_SECRET = 'this-is-a-valid-length-secret-with-more-than-32-chars';

    let err = null;
    try {
      const app = createApp({ mock: false });
      assert.ok(app);
    } catch (e) {
      err = e;
    } finally {
      delete process.env.AUTH0_DOMAIN;
      delete process.env.AUTH0_CLIENT_ID;
      delete process.env.AUTH0_CLIENT_SECRET;
      delete process.env.AUTH0_SECRET;
    }
    assert.equal(err, null);
  });

  await t.test('GET /callback sets mock session and redirects to / in mock mode', async () => {
    const app = createApp({ mock: true });
    const server = app.listen(0);
    const address = server.address();
    const baseUrl = `http://127.0.0.1:${address.port}`;

    t.after(() => server.close());

    const res = await fetch(`${baseUrl}/callback`, { redirect: 'manual' });
    assert.equal(res.status, 302);
    assert.equal(res.headers.get('location'), '/');
    assert.match(res.headers.get('set-cookie') || '', /mock_session=authenticated/);
  });
});
