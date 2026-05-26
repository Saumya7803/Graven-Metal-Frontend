import { Router } from 'express';
import { body } from 'express-validator';
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from '../controllers/categoryController.js';
import { authorize, authorizePermission, protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { PERMISSIONS } from '../constants/permissions.js';
import { uploadImage, validateUploadedFile } from '../middlewares/uploadMiddleware.js';

const router = Router();

router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post(
  '/',
  protect,
  authorize('super_admin', 'admin', 'editor'),
  authorizePermission(PERMISSIONS.MANAGE_CATEGORIES),
  uploadImage.single('image'),
  validateUploadedFile('image'),
  [body('name').notEmpty(), body('slug').notEmpty(), body('sortOrder').optional().isInt({ min: 0 })],
  validate,
  createCategory
);
router.put(
  '/:id',
  protect,
  authorize('super_admin', 'admin', 'editor'),
  authorizePermission(PERMISSIONS.MANAGE_CATEGORIES),
  uploadImage.single('image'),
  validateUploadedFile('image'),
  [body('name').optional().notEmpty(), body('slug').optional().notEmpty(), body('sortOrder').optional().isInt({ min: 0 })],
  validate,
  updateCategory
);
router.delete('/:id', protect, authorize('super_admin', 'admin'), authorizePermission(PERMISSIONS.MANAGE_CATEGORIES), deleteCategory);

export default router;
