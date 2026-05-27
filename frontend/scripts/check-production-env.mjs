const frontendRequired = ['VITE_API_BASE_URL', 'VITE_SITE_URL'];
const backendRequired = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_URLS'];

const missingFrontend = frontendRequired.filter((key) => !process.env[key]);
const missingBackend = backendRequired.filter((key) => !process.env[key]);

if (missingFrontend.length || missingBackend.length) {
  if (missingFrontend.length) {
    console.error(`Missing frontend env vars: ${missingFrontend.join(', ')}`);
  }
  if (missingBackend.length) {
    console.error(`Missing backend env vars: ${missingBackend.join(', ')}`);
  }
  process.exit(1);
}

console.log('Production environment variables check passed.');
