import { User } from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function formatAuthResponse(user) {
  const token = signToken({
    id: user._id,
    role: user.role,
    permissions: user.permissions,
    sessionVersion: user.sessionVersion || 0,
  });
  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      company: user.company || '',
      role: user.role,
      permissions: user.permissions,
      lastLoginAt: user.lastLoginAt,
      lastActiveAt: user.lastActiveAt,
      twoFactorEnabled: !!user.twoFactorEnabled,
    },
  };
}

function formatUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    company: user.company || '',
    role: user.role,
    permissions: user.permissions || [],
    lastLoginAt: user.lastLoginAt,
    lastActiveAt: user.lastActiveAt,
    twoFactorEnabled: !!user.twoFactorEnabled,
  };
}

async function loginByRole(email, password, allowedRoles) {
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return { error: 'Invalid credentials' };
  }
  if (!allowedRoles.includes(user.role)) {
    return { error: 'Unauthorized role for this login portal' };
  }
  user.lastLoginAt = new Date();
  user.lastActiveAt = user.lastLoginAt;
  await user.save();
  return { data: formatAuthResponse(user) };
}

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await loginByRole(email, password, ['super_admin', 'admin', 'editor']);
  if (result.error) {
    return res.status(401).json({ message: result.error });
  }
  res.json(result.data);
});

export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await loginByRole(email, password, ['admin', 'editor']);
  if (result.error) {
    return res.status(401).json({ message: result.error });
  }
  res.json(result.data);
});

export const loginSuperAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await loginByRole(email, password, ['super_admin']);
  if (result.error) {
    return res.status(401).json({ message: result.error });
  }
  res.json(result.data);
});

export const loginCustomer = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await loginByRole(email, password, ['user']);
  if (result.error) {
    return res.status(401).json({ message: result.error });
  }
  res.json(result.data);
});

export const registerCustomer = asyncHandler(async (req, res) => {
  const { name, email, password, phone = '', company = '' } = req.body;
  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    company,
    role: 'user',
  });

  res.status(201).json(formatAuthResponse(user));
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: formatUser(req.user) });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const isValid = await user.comparePassword(currentPassword);
  if (!isValid) return res.status(400).json({ message: 'Current password is incorrect' });

  user.password = newPassword;
  await user.save();

  res.json({ message: 'Password updated successfully' });
});
