import express from 'express';
import pkg from 'express-openid-connect';
const { auth, requiresAuth } = pkg;
import { layout } from './views.js';

export function createApp(options = {}) {
  const app = express();

  // Determine if mock mode is explicitly requested or inferred from missing AUTH0_DOMAIN
  const isMock = options.mock ?? !process.env.AUTH0_DOMAIN;

  if (isMock) {
    setupMockAuth(app);
  } else {
    setupRealAuth(app, options.authConfig);
  }

  // --- Core Application Routes ---

  // Route /: Shows login/logout state and navigation
  app.get('/', (req, res) => {
    const isAuthenticated = req.oidc ? req.oidc.isAuthenticated() : Boolean(req.user);
    const user = req.oidc ? req.oidc.user : req.user;

    const content = `
      <div class="card">
        <div class="status-pill ${isAuthenticated ? 'logged-in' : 'logged-out'}">
          <span class="status-dot"></span>
          <span>${isAuthenticated ? 'Logged In' : 'Logged Out'}</span>
        </div>

        <h1>Welcome to the Auth0 Login Flow Demo</h1>
        <p>This application demonstrates the Auth0 Universal Login Authorization Code Flow using <code>express-openid-connect</code>.</p>

        ${isAuthenticated ? `
          <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: 8px; padding: 1.25rem; margin-bottom: 1.5rem;">
            <h3 style="margin-bottom: 0.5rem; color: #a5b4fc;">Hello, ${escapeHtml(user?.name || user?.nickname || 'User')}!</h3>
            <p style="margin-bottom: 1rem;">You are currently authenticated. You can view your protected user profile claims or log out.</p>
            <div style="display: flex; gap: 0.75rem;">
              <a href="/profile" class="btn btn-primary">View My Profile</a>
              <a href="/logout" class="btn btn-danger">Log Out</a>
            </div>
          </div>
        ` : `
          <div style="background: rgba(148, 163, 184, 0.05); border: 1px solid var(--card-border); border-radius: 8px; padding: 1.25rem; margin-bottom: 1.5rem;">
            <h3 style="margin-bottom: 0.5rem;">You are currently logged out</h3>
            <p style="margin-bottom: 1rem;">Click below to initiate the login flow via Auth0 Universal Login.</p>
            <a href="/login" class="btn btn-primary">Log In Now</a>
          </div>
        `}

        <h3 style="margin-top: 2rem; margin-bottom: 0.75rem;">Challenge Checklist</h3>
        <ul style="padding-left: 1.5rem; color: var(--text-muted); line-height: 1.8;">
          <li><code>/</code> &mdash; Landing page displaying active login/logout status</li>
          <li><code>/login</code> &mdash; Initiates Universal Login or local mock authentication</li>
          <li><code>/callback</code> &mdash; OIDC authorization code exchange callback</li>
          <li><code>/logout</code> &mdash; Clears session and terminates Auth0 session</li>
          <li><code>/profile</code> &mdash; Protected route displaying ID token claims (name, email, picture, sub)</li>
        </ul>
      </div>
    `;

    res.send(layout({
      title: 'Home',
      content,
      user,
      isMock
    }));
  });

  // Protection middleware: either mock check or SDK requiresAuth()
  const authGuard = isMock ? mockRequiresAuth() : requiresAuth();

  // Route /profile: Protected route showing ID token claims
  app.get('/profile', authGuard, (req, res) => {
    const user = req.oidc ? req.oidc.user : req.user;

    const content = `
      <div class="card">
        <div class="profile-header">
          <img src="${escapeHtml(user?.picture || 'https://via.placeholder.com/80')}" alt="User Avatar" class="avatar" referrerpolicy="no-referrer" />
          <div>
            <h1>User Profile</h1>
            <p style="margin-bottom: 0;">Protected Route: <code>/profile</code></p>
          </div>
        </div>

        <h3 style="margin-bottom: 0.75rem;">Key ID Token Claims</h3>
        <table class="claims-table">
          <tbody>
            <tr>
              <th>Name</th>
              <td>${escapeHtml(user?.name || 'N/A')}</td>
            </tr>
            <tr>
              <th>Email</th>
              <td>${escapeHtml(user?.email || 'N/A')}</td>
            </tr>
            <tr>
              <th>Picture URL</th>
              <td><a href="${escapeHtml(user?.picture || '')}" target="_blank" style="color: #818cf8;">${escapeHtml(user?.picture || 'N/A')}</a></td>
            </tr>
            <tr>
              <th>Subject (sub)</th>
              <td>${escapeHtml(user?.sub || 'N/A')}</td>
            </tr>
          </tbody>
        </table>

        <h3 style="margin-top: 2rem; margin-bottom: 0.75rem;">Raw Token Claims (JSON)</h3>
        <pre><code>${escapeHtml(JSON.stringify(user, null, 2))}</code></pre>

        <div style="margin-top: 2rem; display: flex; gap: 1rem;">
          <a href="/" class="btn btn-primary">&larr; Back to Home</a>
          <a href="/logout" class="btn btn-danger">Log Out</a>
        </div>
      </div>
    `;

    res.send(layout({
      title: 'Profile',
      content,
      user,
      isMock
    }));
  });

  return app;
}

// Simple cookie parser helper for mock mode without pulling extra dependencies
function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const [name, ...rest] = part.trim().split('=');
    if (name) {
      cookies[name] = decodeURIComponent(rest.join('='));
    }
  }
  return cookies;
}

function setupMockAuth(app) {
  const MOCK_USER = {
    name: 'Jane Doe',
    nickname: 'janedoe',
    email: 'jane.doe@example.com',
    picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    sub: 'auth0|mock123456789',
    email_verified: true,
    updated_at: new Date().toISOString()
  };

  // Mock session middleware
  app.use((req, res, next) => {
    const cookies = parseCookies(req.headers.cookie);
    if (cookies.mock_session === 'authenticated') {
      req.user = MOCK_USER;
    } else {
      req.user = null;
    }
    next();
  });

  // /login route for mock
  app.get('/login', (req, res) => {
    res.setHeader('Set-Cookie', 'mock_session=authenticated; Path=/; HttpOnly; SameSite=Lax');
    res.redirect('/');
  });

  // /callback route for mock (mirrors OIDC callback)
  app.get('/callback', (req, res) => {
    res.setHeader('Set-Cookie', 'mock_session=authenticated; Path=/; HttpOnly; SameSite=Lax');
    res.redirect('/');
  });

  // /logout route for mock
  app.get('/logout', (req, res) => {
    res.setHeader('Set-Cookie', 'mock_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax');
    res.redirect('/');
  });
}

function mockRequiresAuth() {
  return (req, res, next) => {
    if (!req.user) {
      return res.redirect('/login');
    }
    next();
  };
}

function setupRealAuth(app, customConfig = {}) {
  const domain = process.env.AUTH0_DOMAIN || 'example.us.auth0.com';
  const issuerBaseURL = domain.startsWith('http') ? domain : `https://${domain}`;

  const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_SECRET || 'a-very-long-secret-key-that-is-at-least-32-chars-long',
    baseURL: process.env.AUTH0_BASE_URL || `http://localhost:${process.env.PORT || 3000}`,
    clientID: process.env.AUTH0_CLIENT_ID || 'dummy-client-id-for-initialization',
    issuerBaseURL,
    ...customConfig
  };

  app.use(auth(config));
}

function escapeHtml(str) {
  if (typeof str !== 'string') return String(str ?? '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
