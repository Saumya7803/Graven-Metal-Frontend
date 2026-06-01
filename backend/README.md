# GRAVEN METAL Backend

Node.js + Express + MongoDB API for GRAVEN METAL.

## Local Run
1. Copy `backend/.env.example` to `backend/.env`.
2. Install dependencies:
   - From repo root: `npm install`
   - Or backend-only: `cd backend && npm install`
3. Start API:
   - From repo root: `npm run dev:server`
   - From backend folder: `npm run dev`

## Production Run
- From repo root: `npm run start:server`
- From backend folder: `npm start`
- Render preflight: `npm run env:check:render`

## Production Env Guard
- In `NODE_ENV=production`, backend startup validates required env:
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `CLIENT_URLS`
  - `JWT_ISSUER`
  - `JWT_AUDIENCE`

## Security Defaults
- JWT hardening: issuer/audience + HS256 enforcement
- Rate limiting: global API + stricter auth endpoint limiter
- Security headers: `helmet` with production-safe defaults
- Input sanitization: strips dangerous operators and basic HTML chars
- API validation: strict route/body/ID validation with `express-validator`
- Password security: complexity policy + configurable bcrypt rounds
- Upload validation: MIME filter + binary signature checks for images/PDF

## Auth Endpoints
- `POST /api/auth/login`
- `POST /api/auth/login/admin`
- `POST /api/auth/login/super-admin`
- `GET /api/auth/me`

## Core Endpoints
- Products: `/api/products`
- Categories: `/api/categories`
- Quotes: `/api/quotes`
- Website leads: `POST /api/leads`
- Contacts: `/api/contacts`
- Blogs: `/api/blogs`
- Super Admin: `/api/super-admin/*`

## Render Notes
- Service must run with `NODE_ENV=production`.
- Set `CLIENT_URLS` to your Vercel domains (comma-separated).
- Health check path: `/api/health`.
- Build command recommended: `npm ci --omit=dev`.
- Run `npm run migrate:leads` after configuring `MONGODB_URI` to synchronize website-lead indexes.
- Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`, and `LEAD_NOTIFICATION_EMAIL` to notify admins about new website inquiries.
- Configure `SMTP_USER` and `SMTP_PASS` when the SMTP server requires authentication.
