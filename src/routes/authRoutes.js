import { Router } from 'express';
import { body } from 'express-validator';
import { changePassword, login, loginAdmin, loginSuperAdmin, me } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { authRateLimit } from '../middlewares/securityMiddleware.js';

const router = Router();

const loginValidators = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isString().isLength({ min: 8, max: 128 }).withMessage('Password is invalid'),
];

router.post('/login', authRateLimit, loginValidators, validate, login);
router.post('/login/admin', authRateLimit, loginValidators, validate, loginAdmin);
router.post('/login/super-admin', authRateLimit, loginValidators, validate, loginSuperAdmin);
router.get('/me', protect, me);
router.post(
  '/change-password',
  protect,
  [
    body('currentPassword').isString().isLength({ min: 8, max: 128 }),
    body('newPassword')
      .isString()
      .isLength({ min: 8, max: 128 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
  ],
  validate,
  changePassword
);

export default router;
