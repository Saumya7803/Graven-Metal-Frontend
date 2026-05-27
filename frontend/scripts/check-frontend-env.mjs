const required = ['VITE_API_BASE_URL', 'VITE_SITE_URL'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`Missing Vercel frontend env vars: ${missing.join(', ')}`);
  process.exit(1);
}

if (!/^https:\/\//.test(process.env.VITE_API_BASE_URL)) {
  console.error('VITE_API_BASE_URL must be an HTTPS URL in production.');
  process.exit(1);
}

if (!/^https:\/\//.test(process.env.VITE_SITE_URL)) {
  console.error('VITE_SITE_URL must be an HTTPS URL in production.');
  process.exit(1);
}

console.log('Frontend environment variables check passed.');
