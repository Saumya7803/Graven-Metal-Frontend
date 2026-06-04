import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createOperationRecord,
  getOperationsDashboard,
  listOperationMembers,
  listOperationRecords,
  updateOperationRecord,
  updateQuoteOperation,
} from '../controllers/operationsController.js';
import {
  createLqtLead as createLqtLeadRecord,
  getLqtWorkspace as getLqtWorkspaceRecord,
  listLqtLeads as listLqtLeadsRecord,
  listLqtTeamMembers as listLqtTeamMembersRecord,
  updateLqtLead as updateLqtLeadRecord,
} from '../controllers/lqtController.js';
import { authorize, protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';

const router = Router();
const teamRoles = ['super_admin', 'lqt', 'sales', 'procurement', 'cct', 'inventory', 'dispatch', 'finance'];
const quoteModules = [
  'overview',
  'new-leads',
  'assigned-leads',
  'qualification',
  'lead-status',
  'follow-ups',
  'call-notes',
  'meeting-scheduling',
  'sales-assignment',
  'lead-history',
  'rfq-management',
  'quotation-management',
  'negotiation-tracking',
  'order-management',
  'lead-conversion',
];
const recordModules = [
  'supplier-management',
  'price-requests',
  'vendor-comparison',
  'cost-analysis',
  'purchase-orders',
  'availability-tracking',
  'procurement-reports',
  'supplier-communication',
  'customer-management',
  'sales-reports',
  'approval-queue',
  'margin-review',
  'cost-review',
  'target-price-review',
  'commercial-approval',
  'pricing-approval',
  'sourcing-approval',
  'approval-history',
  'inventory-dashboard',
  'warehouses',
  'stock',
  'grn',
  'transfers',
  'alerts',
  'batch-tracking',
  'inventory-reports',
  'dispatch-dashboard',
  'packaging',
  'vehicle-assignment',
  'tracking',
  'pod-upload',
  'delivery-reports',
  'logistics',
  'invoice-queue',
  'payments',
  'receivables',
  'accounts',
  'finance-reports',
  'profit-analysis',
  'margin-analysis',
];

router.use(protect, authorize(...teamRoles));

router.get('/lqt/workspace', getLqtWorkspaceRecord);
router.get('/lqt/leads', listLqtLeadsRecord);
router.get('/lqt/members', listLqtTeamMembersRecord);
router.post(
  '/lqt/leads',
  [
    body('leadName').trim().notEmpty().isLength({ max: 140 }),
    body('companyName').trim().notEmpty().isLength({ max: 180 }),
    body('leadSource').optional().isIn(['Website', 'IndiaMART', 'TradeIndia', 'WhatsApp', 'Referral', 'Email', 'Direct Call']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    body('stage').optional().isIn([
      'newLead',
      'qualified',
      'needMoreInformation',
      'rejected',
      'assignedToSales',
      'contacted',
      'requirementGathering',
      'assigned',
      'accepted',
      'returned',
    ]),
    body('checklist').optional().isObject(),
    body('followUps').optional().isArray(),
    body('history').optional().isArray(),
  ],
  validate,
  createLqtLeadRecord
);
router.patch(
  '/lqt/leads/:id',
  [
    param('id').isMongoId(),
    body('leadName').optional().trim().notEmpty().isLength({ max: 140 }),
    body('companyName').optional().trim().notEmpty().isLength({ max: 180 }),
    body('leadSource').optional().isIn(['Website', 'IndiaMART', 'TradeIndia', 'WhatsApp', 'Referral', 'Email', 'Direct Call']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    body('stage').optional().isIn([
      'newLead',
      'qualified',
      'needMoreInformation',
      'rejected',
      'assignedToSales',
      'contacted',
      'requirementGathering',
      'assigned',
      'accepted',
      'returned',
    ]),
    body('checklist').optional().isObject(),
    body('nextActionAt').optional().isISO8601(),
    body('followUps').optional().isArray(),
    body('history').optional().isArray(),
  ],
  validate,
  updateLqtLeadRecord
);

router.get('/:team/dashboard', [param('team').isIn(['lqt', 'sales', 'procurement', 'cct', 'inventory', 'dispatch', 'finance'])], validate, getOperationsDashboard);
router.get('/:team/members', [param('team').isIn(['lqt', 'sales', 'procurement', 'cct', 'inventory', 'dispatch', 'finance'])], validate, listOperationMembers);
router.get('/:team/records', [param('team').isIn(['sales', 'procurement', 'cct', 'inventory', 'dispatch', 'finance'])], validate, listOperationRecords);
router.post(
  '/:team/records',
  [
    param('team').isIn(['sales', 'procurement', 'cct', 'inventory', 'dispatch', 'finance']),
    body('module').isString().notEmpty(),
    body('title').trim().notEmpty().isLength({ max: 180 }),
    body('owner').optional().isString().isLength({ max: 120 }),
    body('detail').optional().isString().isLength({ max: 1000 }),
    body('status').optional().isString().isLength({ max: 80 }),
    body('nextStep').optional().isString().isLength({ max: 300 }),
    body('value').optional().isString().isLength({ max: 120 }),
    body('metadata').optional().isObject(),
    body('note').optional().trim().notEmpty().isLength({ max: 2000 }),
  ],
  validate,
  createOperationRecord
);
router.patch(
  '/:team/records/:id',
  [
    param('team').isIn(['sales', 'procurement', 'cct', 'inventory', 'dispatch', 'finance']),
    param('id').isMongoId(),
    body('title').optional().trim().notEmpty().isLength({ max: 180 }),
    body('owner').optional().trim().isLength({ max: 120 }),
    body('detail').optional().trim().isLength({ max: 1000 }),
    body('status').optional().trim().notEmpty().isLength({ max: 80 }),
    body('nextStep').optional().trim().isLength({ max: 300 }),
    body('value').optional().trim().isLength({ max: 120 }),
    body('metadata').optional().isObject(),
    body('note').optional().trim().notEmpty().isLength({ max: 2000 }),
  ],
  validate,
  updateOperationRecord
);
router.patch(
  '/:team/quotes/:id',
  [
    param('team').isIn(['lqt', 'sales']),
    param('id').isMongoId(),
    body('module').optional().isIn(quoteModules),
    body('status').optional().isIn(['new', 'in_review', 'quoted', 'closed']),
    body('leadTemperature').optional().isIn(['hot', 'warm', 'cold', 'rejected']),
    body('assignedTeam').optional().isIn(['lqt', 'sales', 'procurement', '']),
    body('assignedTo').optional({ values: 'falsy' }).isMongoId(),
    body('assignedToName').optional().isString().isLength({ max: 120 }),
    body('requirement').optional().trim().notEmpty().isLength({ max: 2000 }),
    body('adminNotes').optional().isString().isLength({ max: 2000 }),
    body('note').optional().isString().isLength({ max: 2000 }),
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
    body('quotation.sentAt').optional().isISO8601(),
    body('quotation.status').optional().isIn(['draft', 'sent', 'accepted', 'rejected']),
    body('order').optional().isObject(),
    body('order.poNumber').optional().isString().isLength({ max: 80 }),
    body('order.amount').optional().isNumeric(),
    body('order.status').optional().isIn(['none', 'pending', 'confirmed', 'fulfilled', 'cancelled']),
  ],
  validate,
  updateQuoteOperation
);

export default router;
