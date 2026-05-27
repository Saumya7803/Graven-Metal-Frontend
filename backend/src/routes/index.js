import { Router } from 'express';
import authRoutes from './authRoutes.js';
import productRoutes from './productRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import quoteRoutes from './quoteRoutes.js';
import contactRoutes from './contactRoutes.js';
import blogRoutes from './blogRoutes.js';
import superAdminRoutes from './superAdminRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import {
  adminRateLimit,
  apiRateLimit,
  publicReadRateLimit,
} from '../middlewares/securityMiddleware.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', publicReadRateLimit, productRoutes);
router.use('/categories', publicReadRateLimit, categoryRoutes);
router.use('/blogs', publicReadRateLimit, blogRoutes);
router.use('/quotes', quoteRoutes);
router.use('/contacts', contactRoutes);
router.use('/settings', adminRateLimit, settingsRoutes);
router.use('/super-admin', adminRateLimit, superAdminRoutes);
router.use(apiRateLimit);

export default router;
