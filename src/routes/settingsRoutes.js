import { Router } from 'express';
import { getSEO, getSettings, updateSEO, updateSettings } from '../controllers/superAdminController.js';
import { authorize, protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', protect, authorize('super_admin', 'admin'), getSettings);
router.patch('/', protect, authorize('super_admin', 'admin'), updateSettings);
router.get('/seo', protect, authorize('super_admin', 'admin'), getSEO);
router.patch('/seo', protect, authorize('super_admin', 'admin'), updateSEO);

export default router;
