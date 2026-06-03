import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from '../controllers/productController.js';
import { authorize, authorizePermission, protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { PERMISSIONS } from '../constants/permissions.js';
import { uploadImage, validateUploadedFile } from '../middlewares/uploadMiddleware.js';

const router = Router();

router.get('/', getProducts);
router.get('/:id', [param('id').isMongoId()], validate, getProductById);

router.post(
  '/',
  protect,
  authorize('super_admin', 'admin', 'editor'),
  authorizePermission(PERMISSIONS.MANAGE_PRODUCTS),
  uploadImage.single('image'),
  validateUploadedFile('image'),
  [
    body('name').trim().notEmpty().isLength({ max: 180 }),
    body('slug').trim().notEmpty().isSlug(),
    body('price').isFloat({ gt: 0 }),
    body('category').isMongoId(),
    body('stockQty').optional().isInt({ min: 0 }),
    body('weightPerUnit').optional().isFloat({ gt: 0 }),
    body('weightUnit').optional().trim().notEmpty().isLength({ max: 16 }),
    body('moq').optional().isInt({ min: 1 }),
    body('unitType').optional().trim().notEmpty().isLength({ max: 64 }),
  ],
  validate,
  createProduct,
);

router.put(
  '/:id',
  protect,
  authorize('super_admin', 'admin', 'editor'),
  authorizePermission(PERMISSIONS.MANAGE_PRODUCTS),
  [param('id').isMongoId()],
  validate,
  uploadImage.single('image'),
  validateUploadedFile('image'),
  [
    body('price').optional().isFloat({ gt: 0 }),
    body('stockQty').optional().isInt({ min: 0 }),
    body('weightPerUnit').optional().isFloat({ gt: 0 }),
    body('weightUnit').optional().trim().notEmpty().isLength({ max: 16 }),
    body('moq').optional().isInt({ min: 1 }),
    body('unitType').optional().trim().notEmpty().isLength({ max: 64 }),
  ],
  validate,
  updateProduct,
);

router.delete(
  '/:id',
  protect,
  authorize('super_admin', 'admin'),
  authorizePermission(PERMISSIONS.MANAGE_PRODUCTS),
  [param('id').isMongoId()],
  validate,
  deleteProduct,
);

export default router;
