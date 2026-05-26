const REQUIRED_ENV = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_URLS', 'JWT_ISSUER', 'JWT_AUDIENCE'];

const DEVELOPMENT_DEFAULTS = {
  JWT_SECRET: 'graven-metal-local-development-secret',
  JWT_EXPIRES_IN: '7d',
  JWT_ISSUER: 'graven-metal-api',
  JWT_AUDIENCE: 'graven-metal-client',
  CLIENT_URLS: 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174',
};

function applyDevelopmentDefaults() {
  Object.entries(DEVELOPMENT_DEFAULTS).forEach(([key, value]) => {
    if (!process.env[key]) process.env[key] = value;
  });
}

export function validateEnv() {
  if (process.env.NODE_ENV !== 'production') {
    applyDevelopmentDefaults();
    return;
  }

  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
  }
}
