import test from 'node:test';
import assert from 'node:assert/strict';
import { layout } from '../src/views.js';

test('HTML views rendering', async (t) => {
  await t.test('layout renders unauthenticated view with login link', () => {
    const html = layout({
      title: 'Home',
      content: '<p>Content</p>',
      user: null,
      isMock: false
    });
    assert.match(html, /<title>Home \| Auth0 Login Flow<\/title>/);
    assert.match(html, /href="\/login"/);
    assert.doesNotMatch(html, /Mock Mode Active/);
  });

  await t.test('layout renders mock banner when isMock is true', () => {
    const html = layout({
      title: 'Home',
      content: '<p>Content</p>',
      user: null,
      isMock: true
    });
    assert.match(html, /Mock Mode Active/);
  });

  await t.test('layout renders profile and logout links when authenticated', () => {
    const html = layout({
      title: 'Dashboard',
      content: '<p>User area</p>',
      user: { name: 'Alice' },
      isMock: false
    });
    assert.match(html, /href="\/profile"/);
    assert.match(html, /href="\/logout"/);
  });
});
