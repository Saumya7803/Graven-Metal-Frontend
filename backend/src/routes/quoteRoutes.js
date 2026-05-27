import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createQuote,
  deleteQuote,
  getMyQuotes,
  getQuoteById,
  getQuotes,
  updateQuote,
  updateQuoteStatus,
} from '../controllers/quoteController.js';
import { authorize, authorizePermission, optionalProtect, protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { PERMISSIONS } from '../constants/permissions.js';
import { uploadAttachment, validateUploadedFile } from '../middlewares/uploadMiddleware.js';
import { adminRateLimit, quoteSubmitRateLimit } from '../middlewares/securityMiddleware.js';

const router = Router();

router.post(
  '/',
  quoteSubmitRateLimit,
  optionalProtect,
  uploadAttachment.single('file'),
  validateUploadedFile('attachment'),
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ max: 120 }),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required').isLength({ max: 40 }),
    body('metal').trim().notEmpty().withMessage('Metal is required').isLength({ max: 80 }),
    body('quantity').trim().notEmpty().withMessage('Quantity is required').isLength({ max: 60 }),
    body('requirement').trim().notEmpty().withMessage('Requirement is required').isLength({ max: 3000 }),
  ],
  validate,
  createQuote,
);

router.get('/mine', protect, authorize('user'), getMyQuotes);

router.get(
  '/',
  adminRateLimit,
  protect,
  authorize('super_admin', 'admin'),
  authorizePermission(PERMISSIONS.MANAGE_QUOTES),
  getQuotes,
);

router.get(
  '/:id',
  adminRateLimit,
  protect,
  authorize('super_admin', 'admin'),
  authorizePermission(PERMISSIONS.MANAGE_QUOTES),
  [param('id').isMongoId()],
  validate,
  getQuoteById,
);

router.put(
  '/:id',
  adminRateLimit,
  protect,
  authorize('super_admin', 'admin'),
  authorizePermission(PERMISSIONS.MANAGE_QUOTES),
  [param('id').isMongoId()],
  validate,
  uploadAttachment.single('file'),
  validateUploadedFile('attachment'),
  updateQuote,
);

router.patch(
  '/:id/status',
  adminRateLimit,
  protect,
  authorize('super_admin', 'admin'),
  authorizePermission(PERMISSIONS.MANAGE_QUOTES),
  [param('id').isMongoId()],
  [
    body('status').isIn(['new', 'in_review', 'quoted', 'closed']).withMessage('Invalid status'),
    body('note').optional().isString().isLength({ max: 1000 }),
  ],
  validate,
  updateQuoteStatus,
);

router.delete(
  '/:id',
  adminRateLimit,
  protect,
  authorize('super_admin'),
  authorizePermission(PERMISSIONS.MANAGE_QUOTES),
  [param('id').isMongoId()],
  validate,
  deleteQuote,
);

export default router;
