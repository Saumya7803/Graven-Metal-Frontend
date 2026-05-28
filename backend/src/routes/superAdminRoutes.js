import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  assignPermissions,
  backupDatabase,
  createAdmin,
  deleteAdmin,
  deleteUser,
  getAnalytics,
  getCustomerActivity,
  listAuditLogs,
  getSEO,
  getSettings,
  listAdmins,
  listUsers,
  revokeUserSessions,
  updateSEO,
  updateSettings,
  updateUser,
} from '../controllers/superAdminController.js';
import { protect, requireSuperAdmin } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';

const router = Router();

router.use(protect, requireSuperAdmin);

router.get('/admins', listAdmins);
router.post(
  '/admins',
  [
    body('name').trim().notEmpty().isLength({ max: 120 }),
    body('email').isEmail().normalizeEmail(),
    body('password')
      .isString()
      .isLength({ min: 8, max: 128 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
    body('role').optional().isIn(['admin', 'editor']),
  ],
  validate,
  createAdmin
);
router.delete('/admins/:id', [param('id').isMongoId()], validate, deleteAdmin);
router.patch(
  '/admins/:id/permissions',
  [param('id').isMongoId(), body('permissions').isArray().withMessage('permissions must be an array')],
  validate,
  assignPermissions
);

router.get('/users', listUsers);
router.get('/customer-activity', getCustomerActivity);
router.get('/audit-logs', listAuditLogs);
router.post('/users/:id/revoke-sessions', [param('id').isMongoId()], validate, revokeUserSessions);
router.patch(
  '/users/:id',
  [
    param('id').isMongoId(),
    body('permissions').optional().isArray(),
    body('role').optional().isIn(['super_admin', 'admin', 'editor', 'user']),
  ],
  validate,
  updateUser
);
router.delete('/users/:id', [param('id').isMongoId()], validate, deleteUser);

router.get('/settings', getSettings);
router.patch('/settings', updateSettings);

router.get('/seo', getSEO);
router.patch('/seo', updateSEO);

router.get('/analytics', getAnalytics);
router.post('/backup', backupDatabase);

export default router;
