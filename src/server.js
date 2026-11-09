import 'dotenv/config';
import { createApp } from './app.js';

const PORT = process.env.PORT || 3000;
const app = createApp();

app.listen(PORT, () => {
  const isMock = !process.env.AUTH0_DOMAIN;
  console.log(`\n======================================================`);
  console.log(`🚀 Auth0 Login Flow server running at http://localhost:${PORT}`);
  if (isMock) {
    console.log(`⚠️  Running in MOCK MODE (AUTH0_DOMAIN is not set)`);
    console.log(`   - Visit http://localhost:${PORT} to test offline`);
    console.log(`   - Click 'Log In' to simulate authentication`);
  } else {
    console.log(`🔒 Running in AUTH0 LIVE MODE`);
    console.log(`   - Domain: ${process.env.AUTH0_DOMAIN}`);
    console.log(`   - Client ID: ${process.env.AUTH0_CLIENT_ID}`);
  }
  console.log(`======================================================\n`);
});
