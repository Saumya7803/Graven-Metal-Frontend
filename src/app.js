import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middlewares/errorMiddleware.js';
import { apiRateLimit, sanitizeInput } from './middlewares/securityMiddleware.js';

export const createApp = () => {
  const app = express();
  const isProduction = process.env.NODE_ENV === 'production';
  const normalizeOrigin = (value) => value.replace(/\/+$/, '');
  const rawOrigins = process.env.CLIENT_URLS || process.env.CLIENT_URL || '';
  const allowList = rawOrigins
    .split(',')
    .map((x) => x.trim())
    .map((x) => normalizeOrigin(x))
    .filter(Boolean);

  const corsOptions = {
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      // In development/tests allow local tools without strict origin matching.
      if (!isProduction && allowList.length === 0) return callback(null, true);
      if (allowList.includes(normalizeOrigin(origin))) return callback(null, true);

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      referrerPolicy: { policy: 'no-referrer' },
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    })
  );
  app.use(cors(corsOptions));
  app.set('trust proxy', 1);
  app.use(apiRateLimit);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(sanitizeInput);
  app.use(morgan(isProduction ? 'combined' : 'dev'));

  app.get('/api/health', (req, res) => res.json({ ok: true, service: 'graven-api' }));
  app.use('/api', apiRoutes);

  app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
  app.use(errorHandler);

  return app;
};
