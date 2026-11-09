# Auth0 Login Flow (MLH Global Hack Week Challenge)

A clean, modern Express.js web application implementing the **Auth0 Universal Login** flow using [`express-openid-connect`](https://github.com/auth0/express-openid-connect) (Authorization Code Flow with OpenID Connect).

Built for the MLH Global Hack Week challenge **"Set up your first Auth0 log-in flow"** (Auth0 Getting Started guide).

---

## Features

- **Auth0 Universal Login (OIDC Authorization Code Flow)**: Leverages `express-openid-connect` to handle the heavy lifting of state, nonce, token exchange, and encrypted session management.
- **Full Route Suite**:
  - `/` &mdash; Landing page displaying dynamic authenticated / unauthenticated states and links.
  - `/login` &mdash; Initiates Universal Login with Auth0 (or local mock authentication).
  - `/callback` &mdash; Handles the OpenID Connect authorization code exchange callback.
  - `/logout` &mdash; Clears the local application session and terminates the Auth0 tenant session.
  - `/profile` &mdash; Protected route displaying the user's ID token claims (`name`, `email`, `picture`, `sub`, etc.).
- **Zero-Build Lightweight UI**: Elegant, responsive dark-mode styled HTML interface rendered cleanly with template literals without requiring frontend bundlers or transpilation.
- **Mock / Offline Mode**: When `AUTH0_DOMAIN` is not set (or when running tests), the app automatically runs in a local mock authentication mode so anyone can evaluate and test the full login, logout, and protected route behaviors offline without creating an Auth0 account.
- **Node.js 22 & Native Testing**: ESM native (`"type": "module"`), tested using Node's built-in `node:test` test runner.
- **Strict Secrets Management**: Secrets are loaded exclusively from environment variables with `.env` ignored from version control.

---

## Auth0 Dashboard Setup Guide

To run this application in live Auth0 mode:

### 1. Create an Application in Auth0
1. Sign up or log in to your [Auth0 Dashboard](https://manage.auth0.com/).
2. Navigate to **Applications** > **Applications** in the left sidebar.
3. Click **Create Application**.
4. Enter an application name (e.g., `MLH Auth0 Login Flow`).
5. Choose **Regular Web Applications** as the application type.
6. Click **Create**.

### 2. Configure Application Settings & URLs
In your newly created application's **Settings** tab:
1. Note down:
   - **Domain** (e.g. `dev-xyz123.us.auth0.com`)
   - **Client ID** (e.g. `AbCdEf123456...`)
   - **Client Secret** (e.g. `xyz987...`)
2. Scroll down to **Application URIs**:
   - **Allowed Callback URLs**: `http://localhost:3000/callback`
   - **Allowed Logout URLs**: `http://localhost:3000`
   - **Allowed Web Origins**: `http://localhost:3000`
3. Click **Save Changes** at the bottom of the page.

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set the following variables in `.env`:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `AUTH0_SECRET` | A long, random string (at least 32 characters) used to encrypt the session cookie | `use_a_long_random_string_of_at_least_32_characters` |
| `AUTH0_BASE_URL` | The base URL of your application | `http://localhost:3000` |
| `AUTH0_CLIENT_ID` | Your Auth0 Application Client ID | `your_auth0_client_id_here` |
| `AUTH0_CLIENT_SECRET` | Your Auth0 Application Client Secret | `your_auth0_client_secret_here` |
| `AUTH0_DOMAIN` | Your Auth0 tenant domain | `your-tenant.us.auth0.com` |
| `PORT` | Local web server port (optional, defaults to 3000) | `3000` |

> **Note on Mock Mode**: If `AUTH0_DOMAIN` is omitted or left unset, the application automatically launches in **Mock Mode**, allowing you to test the full login, profile protection, and logout mechanics without external credentials.

---

## How to Run

### Installation
Install dependencies:

```bash
npm install
```

### Running in Mock / Offline Mode
Run without setting `AUTH0_DOMAIN`:

```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser:
- You will see the banner indicating mock mode.
- Click **Log In** to simulate successful authentication.
- Visit **Profile** at `/profile` to view mock user claims (`name`, `email`, `picture`, `sub`).
- Click **Log Out** to return to unauthenticated status.

### Running with Real Auth0 Universal Login
Populate `.env` with your real Auth0 credentials, then start:

```bash
npm start
```
Navigate to [http://localhost:3000](http://localhost:3000):
- Click **Log In** &rarr; You will be redirected to the Auth0 Universal Login hosted page.
- Log in or sign up with email/password or social login.
- Upon successful authentication, Auth0 redirects back to `/callback`, the SDK completes the authorization code exchange, and redirects to `/`.
- Navigate to `/profile` to view your actual Auth0 ID token claims.
- Click **Log Out** &rarr; Terminates local and Auth0 session.

---

## Running Automated Tests

Run the test suite using Node's built-in `node:test` runner:

```bash
npm test
```

Tests cover:
- Mock login flow and session cookie generation.
- Route protection verifying `/profile` redirects unauthenticated users to `/login`.
- Rendering claims on the profile page (`name`, `email`, `sub`, `picture`).
- Logout flow clearing cookies and protecting `/profile` thereafter.
- Live OIDC configuration validation and HTML view rendering.

---

## How This Meets the Challenge Success Criteria

The MLH Global Hack Week challenge *"Set up your first Auth0 log-in flow"* requires completing an Auth0 Getting Started integration using Express:

1. **Authorization Code Flow using `express-openid-connect`**:
   - The application mounts the standard `auth()` middleware from `express-openid-connect` in `src/app.js`.
   - The SDK automatically establishes the `/login`, `/logout`, and `/callback` routes adhering to RFC 6749 and OpenID Connect specifications.
2. **Landing Page (`/`)**:
   - Renders current authentication status (`req.oidc.isAuthenticated()`), displaying contextual buttons (Log In vs View Profile & Log Out).
3. **Protected Route (`/profile`)**:
   - Guarded by `requiresAuth()` middleware.
   - Extracts and displays user claims from the verified ID token (`req.oidc.user`):
     - `name`
     - `email`
     - `picture`
     - `sub` (Auth0 unique user identifier)
4. **Mock Mode for Instant Verification**:
   - Guarantees automated test suites and offline review can run without breaking due to absent credentials.
5. **No Secret Leaks & Node 22 ESM Standard**:
   - Strict `.gitignore`, sample configuration via `.env.example`, and clean modular ESM design.
