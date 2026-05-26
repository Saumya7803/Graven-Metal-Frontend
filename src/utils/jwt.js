import jwt from 'jsonwebtoken';

const getJwtSecret = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV !== 'production') {
    process.env.JWT_SECRET = 'graven-metal-local-development-secret';
    return process.env.JWT_SECRET;
  }
  throw new Error('JWT_SECRET is missing');
};

export const signToken = (payload) => {
  const jwtSecret = getJwtSecret();

  return jwt.sign(payload, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'graven-metal-api',
    audience: process.env.JWT_AUDIENCE || 'graven-metal-client',
    algorithm: 'HS256',
  });
};
