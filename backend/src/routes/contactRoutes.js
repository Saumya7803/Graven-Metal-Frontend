import { Router } from 'express';
import { body } from 'express-validator';
import {
  createContact,
  deleteContact,
  getContactById,
  getContacts,
  updateContact,
} from '../controllers/contactController.js';
import { authorize, authorizePermission, protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { PERMISSIONS } from '../constants/permissions.js';
import { adminRateLimit, contactSubmitRateLimit } from '../middlewares/securityMiddleware.js';

const router = Router();

router.post(
  '/',
  contactSubmitRateLimit,
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ max: 120 }),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required').isLength({ max: 30 }),
    body('subject').optional().trim().isLength({ max: 180 }),
    body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 5000 }),
  ],
  validate,
  createContact
);
router.get(
  '/',
  adminRateLimit,
  protect,
  authorize('super_admin', 'admin', 'editor'),
  authorizePermission(PERMISSIONS.MANAGE_CONTACTS),
  getContacts
);
router.get(
  '/:id',
  adminRateLimit,
  protect,
  authorize('super_admin', 'admin', 'editor'),
  authorizePermission(PERMISSIONS.MANAGE_CONTACTS),
  getContactById
);
router.put(
  '/:id',
  adminRateLimit,
  protect,
  authorize('super_admin', 'admin', 'editor'),
  authorizePermission(PERMISSIONS.MANAGE_CONTACTS),
  [
    body('status').optional().isIn(['unread', 'read', 'replied', 'archived']),
    body('adminNotes').optional().isString().isLength({ max: 1000 }),
  ],
  validate,
  updateContact
);
router.delete(
  '/:id',
  adminRateLimit,
  protect,
  authorize('super_admin', 'admin'),
  authorizePermission(PERMISSIONS.MANAGE_CONTACTS),
  deleteContact
);

export default router;
