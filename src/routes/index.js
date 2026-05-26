import { Router } from 'express';
import authRoutes from './authRoutes.js';
import productRoutes from './productRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import quoteRoutes from './quoteRoutes.js';
import contactRoutes from './contactRoutes.js';
import blogRoutes from './blogRoutes.js';
import superAdminRoutes from './superAdminRoutes.js';
import settingsRoutes from './settingsRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/quotes', quoteRoutes);
router.use('/contacts', contactRoutes);
router.use('/blogs', blogRoutes);
router.use('/settings', settingsRoutes);
router.use('/super-admin', superAdminRoutes);

export default router;
