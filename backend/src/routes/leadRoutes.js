import { Router } from 'express';
import { body, param } from 'express-validator';
import { createLead, getLeadById, getLeads, updateLead } from '../controllers/leadController.js';
import { authorize, authorizePermission, protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { PERMISSIONS } from '../constants/permissions.js';
import { leadSubmitRateLimit } from '../middlewares/securityMiddleware.js';
import { uploadAttachment, validateUploadedFile } from '../middlewares/uploadMiddleware.js';
import { LEAD_STATUSES } from '../models/Lead.js';

const router = Router();

router.post(
  '/',
  leadSubmitRateLimit,
  uploadAttachment.single('file'),
  validateUploadedFile('attachment'),
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ max: 120 }),
    body('companyName').trim().notEmpty().withMessage('Company name is required').isLength({ max: 180 }),
    body('designation').optional().trim().isLength({ max: 120 }),
    body('phone').trim().notEmpty().withMessage('Mobile number is required').isLength({ max: 40 }),
    body('email').isEmail().normalizeEmail().withMessage('Valid email address is required'),
    body('whatsappNumber').optional().trim().isLength({ max: 40 }),
    body('industryType').isIn(['Manufacturing', 'Fabrication', 'Automobile', 'Electrical', 'Construction', 'Export', 'Other']),
    body('companyLocation').trim().notEmpty().withMessage('Company location is required').isLength({ max: 240 }),
    body('city').optional().trim().isLength({ max: 100 }),
    body('state').optional().trim().isLength({ max: 100 }),
    body('country').optional().trim().isLength({ max: 100 }),
    body('gstNumber').optional().trim().isLength({ max: 24 }),
    body('product').isIn(['Copper Cathodes', 'Copper Rods', 'Brass Rods', 'Aluminium Ingots', 'Lead Ingots', 'Custom Requirement']),
    body('quantity').isFloat({ gt: 0 }).withMessage('Required quantity must be greater than zero'),
    body('unit').isIn(['Kg', 'MT', 'Ton']),
    body('deliveryLocation').trim().notEmpty().withMessage('Delivery location is required').isLength({ max: 240 }),
    body('requirement').trim().notEmpty().withMessage('Requirement description is required').isLength({ max: 3000 }),
    body('purchaseTimeline').isIn(['Immediate', 'Within 7 Days', 'Within 30 Days', 'Future Requirement']),
    body('preferredContactMethod').optional().isIn(['Phone', 'Email', 'WhatsApp']),
  ],
  validate,
  createLead
);

router.use(protect, authorize('super_admin', 'lqt', 'sales'), authorizePermission(PERMISSIONS.MANAGE_LEADS));
router.get('/', getLeads);
router.get('/:id', [param('id').isMongoId()], validate, getLeadById);
router.patch(
  '/:id',
  [
    param('id').isMongoId(),
    body('status').optional().isIn(LEAD_STATUSES),
    body('leadTemperature').optional().isIn(['hot', 'warm', 'cold', 'rejected']),
    body('assignedTeam').optional().isIn(['lqt', 'sales', '']),
    body('assignedTo').optional({ values: 'falsy' }).isMongoId(),
    body('requirement').optional().trim().notEmpty().isLength({ max: 3000 }),
    body('note').optional().trim().notEmpty().isLength({ max: 2000 }),
    body('followUp').optional().isObject(),
    body('followUp.note').optional().isString().isLength({ max: 1000 }),
    body('followUp.dueAt').optional().isISO8601(),
    body('followUp.status').optional().isIn(['pending', 'completed']),
    body('meeting').optional().isObject(),
    body('meeting.note').optional().isString().isLength({ max: 1000 }),
    body('meeting.scheduledAt').optional().isISO8601(),
    body('meeting.status').optional().isIn(['scheduled', 'completed', 'cancelled']),
    body('quotation').optional().isObject(),
    body('quotation.amount').optional().isNumeric(),
    body('quotation.currency').optional().isString().isLength({ max: 12 }),
    body('quotation.status').optional().isIn(['draft', 'sent', 'accepted', 'rejected']),
    body('order').optional().isObject(),
    body('order.poNumber').optional().isString().isLength({ max: 80 }),
    body('order.amount').optional().isNumeric(),
    body('order.status').optional().isIn(['none', 'pending', 'confirmed', 'fulfilled', 'cancelled']),
  ],
  validate,
  updateLead
);

export default router;
