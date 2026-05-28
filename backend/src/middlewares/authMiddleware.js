import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getJwtSecret = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV !== 'production') {
    process.env.JWT_SECRET = 'graven-metal-local-development-secret';
    return process.env.JWT_SECRET;
  }
  return null;
};

export const protect = asyncHandler(async (req, res, next) => {
  const jwtSecret = getJwtSecret();
  if (!jwtSecret) {
    return res.status(500).json({ message: 'Server auth configuration error' });
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const token = header.split(' ')[1];
  const decoded = jwt.verify(token, jwtSecret, {
    algorithms: ['HS256'],
    issuer: process.env.JWT_ISSUER || 'graven-metal-api',
    audience: process.env.JWT_AUDIENCE || 'graven-metal-client',
  });
  const user = await User.findById(decoded.id).select('-password');

  if (!user) return res.status(401).json({ message: 'Invalid token user' });
  if ((user.sessionVersion || 0) !== (decoded.sessionVersion || 0)) {
    return res.status(401).json({ message: 'Session has been revoked' });
  }
  User.updateOne({ _id: user._id }, { $set: { lastActiveAt: new Date() } }).catch(() => {});
  req.user = user;
  next();
});

export const optionalProtect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return next();
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Invalid authorization header' });
  }

  const jwtSecret = getJwtSecret();
  if (!jwtSecret) {
    return res.status(500).json({ message: 'Server auth configuration error' });
  }

  const token = header.split(' ')[1];
  const decoded = jwt.verify(token, jwtSecret, {
    algorithms: ['HS256'],
    issuer: process.env.JWT_ISSUER || 'graven-metal-api',
    audience: process.env.JWT_AUDIENCE || 'graven-metal-client',
  });
  const user = await User.findById(decoded.id).select('-password');
  if (user && (user.sessionVersion || 0) === (decoded.sessionVersion || 0)) {
    User.updateOne({ _id: user._id }, { $set: { lastActiveAt: new Date() } }).catch(() => {});
    req.user = user;
  }
  next();
});

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden: insufficient role' });
  }
  next();
};

export const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Forbidden: super admin only' });
  }
  next();
};

export const authorizePermission = (...permissions) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  if (req.user.role === 'super_admin') return next();

  const userPermissions = req.user.permissions || [];
  const allowed = permissions.every((p) => userPermissions.includes(p));
  if (!allowed) {
    return res.status(403).json({ message: 'Forbidden: missing permission' });
  }
  next();
};
