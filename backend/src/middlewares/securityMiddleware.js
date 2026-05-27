const DEFAULT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const DEFAULT_MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX || 300);
const AUTH_WINDOW_MS = Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const AUTH_MAX_REQUESTS = Number(process.env.AUTH_RATE_LIMIT_MAX || 10);
const PUBLIC_READ_WINDOW_MS = Number(process.env.PUBLIC_READ_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const PUBLIC_READ_MAX_REQUESTS = Number(process.env.PUBLIC_READ_RATE_LIMIT_MAX || 1200);
const QUOTE_FORM_WINDOW_MS = Number(process.env.QUOTE_FORM_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const QUOTE_FORM_MAX_REQUESTS = Number(process.env.QUOTE_FORM_RATE_LIMIT_MAX || 240);
const CONTACT_FORM_WINDOW_MS = Number(process.env.CONTACT_FORM_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const CONTACT_FORM_MAX_REQUESTS = Number(process.env.CONTACT_FORM_RATE_LIMIT_MAX || 240);
const ADMIN_WINDOW_MS = Number(process.env.ADMIN_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const ADMIN_MAX_REQUESTS = Number(process.env.ADMIN_RATE_LIMIT_MAX || 900);

const WINDOW_CLEANUP_INTERVAL = 60 * 1000;

function createRateLimiter({ windowMs, max, keyPrefix }) {
  const hits = new Map();

  setInterval(() => {
    const now = Date.now();
    for (const [key, data] of hits.entries()) {
      if (data.expiresAt <= now) hits.delete(key);
    }
  }, WINDOW_CLEANUP_INTERVAL).unref();

  return (req, res, next) => {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();
    const current = hits.get(key);

    if (!current || current.expiresAt <= now) {
      hits.set(key, { count: 1, expiresAt: now + windowMs });
      return next();
    }

    if (current.count >= max) {
      const retryAfterSec = Math.ceil((current.expiresAt - now) / 1000);
      res.set('Retry-After', String(retryAfterSec));
      return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }

    current.count += 1;
    return next();
  };
}

function sanitizeObject(input) {
  if (Array.isArray(input)) return input.map(sanitizeObject);
  if (!input || typeof input !== 'object') {
    if (typeof input === 'string') return input.replace(/[<>]/g, '').trim();
    return input;
  }

  const clean = {};
  for (const [key, value] of Object.entries(input)) {
    const safeKey = key.replace(/\$/g, '').replace(/\./g, '');
    clean[safeKey] = sanitizeObject(value);
  }
  return clean;
}

export const apiRateLimit = createRateLimiter({
  windowMs: DEFAULT_WINDOW_MS,
  max: DEFAULT_MAX_REQUESTS,
  keyPrefix: 'api',
});

export const authRateLimit = createRateLimiter({
  windowMs: AUTH_WINDOW_MS,
  max: AUTH_MAX_REQUESTS,
  keyPrefix: 'auth',
});

export const publicReadRateLimit = createRateLimiter({
  windowMs: PUBLIC_READ_WINDOW_MS,
  max: PUBLIC_READ_MAX_REQUESTS,
  keyPrefix: 'public-read',
});

export const quoteSubmitRateLimit = createRateLimiter({
  windowMs: QUOTE_FORM_WINDOW_MS,
  max: QUOTE_FORM_MAX_REQUESTS,
  keyPrefix: 'quote-submit',
});

export const contactSubmitRateLimit = createRateLimiter({
  windowMs: CONTACT_FORM_WINDOW_MS,
  max: CONTACT_FORM_MAX_REQUESTS,
  keyPrefix: 'contact-submit',
});

export const adminRateLimit = createRateLimiter({
  windowMs: ADMIN_WINDOW_MS,
  max: ADMIN_MAX_REQUESTS,
  keyPrefix: 'admin',
});

export const sanitizeInput = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }

  next();
};
