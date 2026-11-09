/**
 * Simple HTML page wrapper with modern, clean styling (no external build step required)
 */
export function layout({ title, content, user, isMock = false }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Auth0 Login Flow</title>
  <style>
    :root {
      --bg: #0f172a;
      --card-bg: #1e293b;
      --card-border: #334155;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --primary: #6366f1;
      --primary-hover: #4f46e5;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --danger-hover: #dc2626;
      --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--font);
      line-height: 1.6;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    header {
      border-bottom: 1px solid var(--card-border);
      background: rgba(30, 41, 59, 0.8);
      backdrop-filter: blur(8px);
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: var(--text);
      font-weight: 700;
      font-size: 1.25rem;
    }

    .brand-badge {
      background: linear-gradient(135deg, #eb5424, #ff8c69);
      color: white;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: 0.05em;
    }

    .mock-banner {
      background-color: rgba(245, 158, 11, 0.15);
      border-left: 4px solid var(--warning);
      color: #fbbf24;
      padding: 0.6rem 2rem;
      font-size: 0.875rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    nav {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    nav a {
      color: var(--text-muted);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.15s ease;
    }

    nav a:hover {
      color: var(--text);
    }

    .btn {
      display: inline-block;
      padding: 0.5rem 1.25rem;
      border-radius: 6px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
      border: none;
      font-size: 0.95rem;
    }

    .btn-primary {
      background-color: var(--primary);
      color: white;
    }

    .btn-primary:hover {
      background-color: var(--primary-hover);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }

    .btn-danger {
      background-color: transparent;
      border: 1px solid var(--danger);
      color: #fca5a5;
    }

    .btn-danger:hover {
      background-color: var(--danger);
      color: white;
    }

    main {
      flex: 1;
      max-width: 800px;
      margin: 2.5rem auto;
      padding: 0 1.5rem;
      width: 100%;
    }

    .card {
      background-color: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
    }

    h1 {
      font-size: 1.875rem;
      margin-bottom: 1rem;
      font-weight: 700;
    }

    p {
      color: var(--text-muted);
      margin-bottom: 1.5rem;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
    }

    .status-pill.logged-in {
      background-color: rgba(16, 185, 129, 0.15);
      color: var(--success);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .status-pill.logged-out {
      background-color: rgba(148, 163, 184, 0.1);
      color: var(--text-muted);
      border: 1px solid rgba(148, 163, 184, 0.2);
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: currentColor;
    }

    .profile-header {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 3px solid var(--primary);
      object-fit: cover;
      background-color: #334155;
    }

    .claims-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
      font-size: 0.95rem;
    }

    .claims-table th, .claims-table td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid var(--card-border);
    }

    .claims-table th {
      color: var(--text-muted);
      font-weight: 600;
      width: 30%;
    }

    .claims-table td {
      color: var(--text);
      word-break: break-all;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.9rem;
    }

    pre {
      background-color: #0b1120;
      padding: 1.25rem;
      border-radius: 8px;
      overflow-x: auto;
      border: 1px solid var(--card-border);
      color: #38bdf8;
      font-size: 0.85rem;
      line-height: 1.4;
    }

    footer {
      border-top: 1px solid var(--card-border);
      text-align: center;
      padding: 1.5rem;
      color: var(--text-muted);
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  ${isMock ? `
  <div class="mock-banner">
    <span><strong>Mock Mode Active:</strong> Running locally without live Auth0 credentials. Set <code>AUTH0_DOMAIN</code> to switch to live Universal Login.</span>
    <span>⚡ Offline Ready</span>
  </div>` : ''}

  <header>
    <a href="/" class="brand">
      <span class="brand-badge">Auth0</span>
      <span>Express Login Flow</span>
    </a>
    <nav>
      <a href="/">Home</a>
      ${user ? `
        <a href="/profile">Profile</a>
        <a href="/logout" class="btn btn-danger">Log Out</a>
      ` : `
        <a href="/login" class="btn btn-primary">Log In</a>
      `}
    </nav>
  </header>

  <main>
    ${content}
  </main>

  <footer>
    Auth0 Getting Started &bull; MLH Global Hack Week Challenge &bull; Node.js ${process.version}
  </footer>
</body>
</html>`;
}
