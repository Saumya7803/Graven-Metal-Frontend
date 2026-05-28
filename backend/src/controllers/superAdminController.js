import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Quote } from '../models/Quote.js';
import { Contact } from '../models/Contact.js';
import { Blog } from '../models/Blog.js';
import { SiteSettings } from '../models/SiteSettings.js';
import { AuditLog } from '../models/AuditLog.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLE_DEFAULT_PERMISSIONS } from '../constants/permissions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKUP_DIR = path.resolve(__dirname, '../../backups');

async function recordAudit(req, action, target = {}, metadata = {}) {
  await AuditLog.create({
    action,
    actor: {
      id: req.user?._id,
      name: req.user?.name || '',
      email: req.user?.email || '',
      role: req.user?.role || '',
    },
    target,
    metadata,
  });
}

export const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'admin', permissions } = req.body;
  if (!['admin', 'editor'].includes(role)) {
    return res.status(400).json({ message: 'Role must be admin or editor' });
  }

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already exists' });

  const user = await User.create({
    name,
    email,
    password,
    role,
    permissions: permissions?.length ? permissions : ROLE_DEFAULT_PERMISSIONS[role],
  });

  await recordAudit(
    req,
    'admin.created',
    { type: 'user', id: user._id.toString(), label: user.email },
    { role: user.role, permissions: user.permissions }
  );

  res.status(201).json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
  });
});

export const deleteAdmin = asyncHandler(async (req, res) => {
  const admin = await User.findById(req.params.id);
  if (!admin) return res.status(404).json({ message: 'Admin not found' });
  if (admin.role === 'super_admin') return res.status(400).json({ message: 'Cannot delete super admin' });
  if (!['admin', 'editor'].includes(admin.role)) return res.status(400).json({ message: 'Target user is not admin/editor' });

  await admin.deleteOne();
  await recordAudit(req, 'admin.deleted', { type: 'user', id: admin._id.toString(), label: admin.email }, { role: admin.role });
  res.json({ message: 'Admin deleted' });
});

export const assignPermissions = asyncHandler(async (req, res) => {
  const { permissions = [], role } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.role === 'super_admin') return res.status(400).json({ message: 'Super admin permissions are fixed' });

  if (role && ['admin', 'editor', 'user'].includes(role)) user.role = role;
  user.permissions = permissions;
  await user.save();

  await recordAudit(
    req,
    'admin.permissions_updated',
    { type: 'user', id: user._id.toString(), label: user.email },
    { role: user.role, permissions: user.permissions }
  );

  res.json({ id: user._id, role: user.role, permissions: user.permissions });
});

export const listAdmins = asyncHandler(async (req, res) => {
  const admins = await User.find({ role: { $in: ['admin', 'editor'] } }).select('-password -sessionVersion').sort({ createdAt: -1 });
  res.json(admins);
});

export const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password -sessionVersion').sort({ createdAt: -1 });
  res.json(users);
});

export const getCustomerActivity = asyncHandler(async (req, res) => {
  const [customers, quotes, contacts] = await Promise.all([
    User.find({ role: 'user' }).select('name email phone company createdAt updatedAt').sort({ createdAt: -1 }).lean(),
    Quote.find().select('fullName email phone metal quantity status requirement createdAt updatedAt customer').sort({ createdAt: -1 }).lean(),
    Contact.find().select('fullName email phone subject message status createdAt updatedAt').sort({ createdAt: -1 }).lean(),
  ]);

  const rows = new Map();

  const ensureRow = ({ email, name = '', phone = '', company = '', registered = false, createdAt = '' }) => {
    const normalizedEmail = String(email || '').toLowerCase();
    if (!normalizedEmail) return null;

    if (!rows.has(normalizedEmail)) {
      rows.set(normalizedEmail, {
        id: normalizedEmail,
        name,
        email: normalizedEmail,
        phone,
        company,
        registered,
        joinedAt: createdAt,
        quoteCount: 0,
        contactCount: 0,
        openQuotes: 0,
        unreadContacts: 0,
        lastActivityAt: createdAt,
        lastActivityType: registered ? 'registered' : '',
        lastActivityDetail: registered ? 'Customer account created' : '',
      });
    }

    const row = rows.get(normalizedEmail);
    row.name = row.name || name;
    row.phone = row.phone || phone;
    row.company = row.company || company;
    row.registered = row.registered || registered;
    row.joinedAt = row.joinedAt || createdAt;
    return row;
  };

  const touch = (row, date, type, detail) => {
    if (!row || !date) return;
    const current = row.lastActivityAt ? new Date(row.lastActivityAt).getTime() : 0;
    const next = new Date(date).getTime();
    if (!current || next >= current) {
      row.lastActivityAt = date;
      row.lastActivityType = type;
      row.lastActivityDetail = detail;
    }
  };

  customers.forEach((customer) => {
    ensureRow({
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      company: customer.company,
      registered: true,
      createdAt: customer.createdAt,
    });
  });

  quotes.forEach((quote) => {
    const row = ensureRow({
      email: quote.email,
      name: quote.fullName,
      phone: quote.phone,
      registered: false,
      createdAt: quote.createdAt,
    });
    if (!row) return;
    row.quoteCount += 1;
    if (['new', 'in_review', 'quoted'].includes(quote.status)) row.openQuotes += 1;
    touch(row, quote.createdAt, 'quote', `${quote.metal || 'Quote'} - ${quote.status}`);
  });

  contacts.forEach((contact) => {
    const row = ensureRow({
      email: contact.email,
      name: contact.fullName,
      phone: contact.phone,
      registered: false,
      createdAt: contact.createdAt,
    });
    if (!row) return;
    row.contactCount += 1;
    if (contact.status === 'unread') row.unreadContacts += 1;
    touch(row, contact.createdAt, 'contact', contact.subject || contact.message || 'Contact message');
  });

  res.json(
    Array.from(rows.values()).sort(
      (a, b) => new Date(b.lastActivityAt || 0).getTime() - new Date(a.lastActivityAt || 0).getTime()
    )
  );
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.role === 'super_admin' && req.user._id.toString() !== user._id.toString()) {
    return res.status(403).json({ message: 'Cannot modify another super admin' });
  }

  const { name, role, permissions } = req.body;
  if (name) user.name = name;
  if (role && ['admin', 'editor', 'user'].includes(role)) user.role = role;
  if (permissions) user.permissions = permissions;

  await user.save();
  await recordAudit(
    req,
    'user.updated',
    { type: 'user', id: user._id.toString(), label: user.email },
    { role: user.role, permissions: user.permissions }
  );
  res.json({ id: user._id, name: user.name, role: user.role, permissions: user.permissions });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.role === 'super_admin') return res.status(400).json({ message: 'Cannot delete super admin' });
  await user.deleteOne();
  await recordAudit(req, 'user.deleted', { type: 'user', id: user._id.toString(), label: user.email }, { role: user.role });
  res.json({ message: 'User deleted' });
});

export const getSettings = asyncHandler(async (req, res) => {
  let settings = await SiteSettings.findOne();
  if (!settings) settings = await SiteSettings.create({});
  res.json(settings);
});

export const updateSettings = asyncHandler(async (req, res) => {
  let settings = await SiteSettings.findOne();
  if (!settings) settings = await SiteSettings.create({});

  Object.assign(settings, req.body);
  await settings.save();
  await recordAudit(req, 'settings.updated', { type: 'settings', id: settings._id.toString(), label: 'Site settings' }, req.body);
  res.json(settings);
});

export const getSEO = asyncHandler(async (req, res) => {
  let settings = await SiteSettings.findOne();
  if (!settings) settings = await SiteSettings.create({});
  res.json(settings.seo);
});

export const updateSEO = asyncHandler(async (req, res) => {
  let settings = await SiteSettings.findOne();
  if (!settings) settings = await SiteSettings.create({});
  settings.seo = { ...settings.seo?.toObject?.(), ...req.body };
  await settings.save();
  await recordAudit(req, 'seo.updated', { type: 'settings', id: settings._id.toString(), label: 'SEO settings' }, req.body);
  res.json(settings.seo);
});

export const getAnalytics = asyncHandler(async (req, res) => {
  const [users, products, categories, blogs, quotes, contacts] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Category.countDocuments(),
    Blog.countDocuments(),
    Quote.countDocuments(),
    Contact.countDocuments(),
  ]);

  const [quoteByStatus, contactByStatus, usersByRole, recentUsers] = await Promise.all([
    Quote.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Contact.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    User.find().select('name email role createdAt').sort({ createdAt: -1 }).limit(6),
  ]);

  res.json({
    totals: { users, products, categories, blogs, quotes, contacts },
    quoteByStatus,
    contactByStatus,
    usersByRole,
    recentUsers,
  });
});

export const backupDatabase = asyncHandler(async (req, res) => {
  const [users, products, categories, blogs, quotes, contacts, settings] = await Promise.all([
    User.find().select('-password'),
    Product.find(),
    Category.find(),
    Blog.find(),
    Quote.find(),
    Contact.find(),
    SiteSettings.find(),
  ]);

  const snapshot = {
    generatedAt: new Date().toISOString(),
    collections: { users, products, categories, blogs, quotes, contacts, settings },
  };

  await fs.mkdir(BACKUP_DIR, { recursive: true });
  const fileName = `backup-${Date.now()}.json`;
  const filePath = path.join(BACKUP_DIR, fileName);
  await fs.writeFile(filePath, JSON.stringify(snapshot, null, 2));

  await recordAudit(req, 'backup.created', { type: 'backup', id: fileName, label: fileName }, { filePath });
  res.json({ message: 'Backup created', fileName, filePath });
});

export const revokeUserSessions = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.role === 'super_admin' && req.user._id.toString() !== user._id.toString()) {
    return res.status(403).json({ message: 'Cannot revoke another super admin session' });
  }

  user.sessionVersion = (user.sessionVersion || 0) + 1;
  await user.save();
  await recordAudit(
    req,
    'sessions.revoked',
    { type: 'user', id: user._id.toString(), label: user.email },
    { role: user.role, sessionVersion: user.sessionVersion }
  );

  res.json({ message: 'Sessions revoked' });
});

export const listAuditLogs = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 80, 200);
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(limit).lean();
  res.json(logs);
});
