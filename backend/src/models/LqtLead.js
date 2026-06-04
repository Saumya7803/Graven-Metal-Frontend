import mongoose from 'mongoose';

const checklistSchema = new mongoose.Schema(
  {
    firstContactDone: { type: Boolean, default: false },
    requirementCollected: { type: Boolean, default: false },
    decisionMakerIdentified: { type: Boolean, default: false },
    budgetConfirmed: { type: Boolean, default: false },
    timelineConfirmed: { type: Boolean, default: false },
    technicalRequirementClear: { type: Boolean, default: false },
  },
  { _id: false }
);

const followUpSchema = new mongoose.Schema(
  {
    leadId: { type: String, required: true, trim: true },
    leadName: { type: String, required: true, trim: true },
    followUpDate: { type: Date, required: true },
    followUpTime: { type: String, default: '', trim: true },
    reason: { type: String, default: '', trim: true },
    notes: { type: String, default: '', trim: true },
    assignedExecutive: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'overdue', 'rescheduled'],
      default: 'scheduled',
    },
  },
  { timestamps: true, _id: true }
);

const historySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    details: { type: String, default: '', trim: true, maxlength: 1000 },
    timestamp: { type: Date, default: Date.now },
    by: { type: String, default: '', trim: true, maxlength: 120 },
  },
  { _id: true }
);

const lqtLeadSchema = new mongoose.Schema(
  {
    leadName: { type: String, required: true, trim: true, maxlength: 140, index: true },
    companyName: { type: String, required: true, trim: true, maxlength: 180 },
    contactPerson: { type: String, default: '', trim: true, maxlength: 120 },
    mobileNumber: { type: String, default: '', trim: true, maxlength: 40 },
    email: { type: String, default: '', trim: true, lowercase: true, maxlength: 180 },
    leadSource: {
      type: String,
      enum: ['Website', 'IndiaMART', 'TradeIndia', 'WhatsApp', 'Referral', 'Email', 'Direct Call'],
      default: 'Website',
      index: true,
    },
    productRequired: { type: String, default: '', trim: true, maxlength: 180 },
    gradeSpecification: { type: String, default: '', trim: true, maxlength: 120 },
    quantity: { type: String, default: '', trim: true, maxlength: 80 },
    deliveryLocation: { type: String, default: '', trim: true, maxlength: 180 },
    industry: { type: String, default: '', trim: true, maxlength: 120 },
    expectedTimeline: { type: String, default: '', trim: true, maxlength: 80 },
    decisionMakerName: { type: String, default: '', trim: true, maxlength: 120 },
    budgetDiscussed: { type: String, default: '', trim: true, maxlength: 120 },
    requirementNotes: { type: String, default: '', trim: true, maxlength: 3000 },
    internalNotes: { type: String, default: '', trim: true, maxlength: 3000 },
    owner: { type: String, default: '', trim: true, maxlength: 120 },
    salesAssignee: { type: String, default: '', trim: true, maxlength: 120 },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    stage: {
      type: String,
      enum: [
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
      ],
      default: 'newLead',
      index: true,
    },
    checklist: { type: checklistSchema, default: () => ({}) },
    nextActionAt: { type: Date },
    followUps: { type: [followUpSchema], default: [] },
    history: { type: [historySchema], default: [] },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdBy: { type: String, default: '', trim: true, maxlength: 120 },
    updatedBy: { type: String, default: '', trim: true, maxlength: 120 },
  },
  { timestamps: true }
);

export const LqtLead = mongoose.model('LqtLead', lqtLeadSchema);
