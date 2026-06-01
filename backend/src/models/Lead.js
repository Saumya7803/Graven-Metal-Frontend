import crypto from 'crypto';
import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema(
  {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
    name: { type: String, default: '' },
    mimeType: { type: String, default: '' },
    size: { type: Number, default: 0 },
  },
  { _id: false }
);

const noteSchema = new mongoose.Schema(
  {
    note: { type: String, required: true, trim: true, maxlength: 2000 },
    authorName: { type: String, default: '', trim: true },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: true }
);

const followUpSchema = new mongoose.Schema(
  {
    dueAt: { type: Date, default: null },
    note: { type: String, default: '', trim: true, maxlength: 1000 },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: true }
);

const meetingSchema = new mongoose.Schema(
  {
    scheduledAt: { type: Date, default: null },
    note: { type: String, default: '', trim: true, maxlength: 1000 },
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: true }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: '' },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const createLeadId = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `GM-WEB-${date}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
};

export const LEAD_STATUSES = [
  'New',
  'LQT Qualification',
  'Buyer Verified',
  'Requirement Analyzed',
  'Qualified',
  'Sales Assigned',
  'Follow-up',
  'Quotation Sent',
  'Negotiation',
  'Order Confirmed',
  'Won',
  'Lost',
];

const leadSchema = new mongoose.Schema(
  {
    leadId: { type: String, unique: true, index: true, default: createLeadId },
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    companyName: { type: String, required: true, trim: true, maxlength: 180 },
    designation: { type: String, default: '', trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 40 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 180 },
    whatsappNumber: { type: String, default: '', trim: true, maxlength: 40 },
    industryType: {
      type: String,
      enum: ['Manufacturing', 'Fabrication', 'Automobile', 'Electrical', 'Construction', 'Export', 'Other'],
      required: true,
    },
    companyLocation: { type: String, required: true, trim: true, maxlength: 240 },
    city: { type: String, default: '', trim: true, maxlength: 100 },
    state: { type: String, default: '', trim: true, maxlength: 100 },
    country: { type: String, default: '', trim: true, maxlength: 100 },
    gstNumber: { type: String, default: '', trim: true, uppercase: true, maxlength: 24 },
    product: {
      type: String,
      enum: ['Copper Cathodes', 'Copper Rods', 'Brass Rods', 'Aluminium Ingots', 'Lead Ingots', 'Custom Requirement'],
      required: true,
    },
    requirement: { type: String, required: true, trim: true, maxlength: 3000 },
    quantity: { type: Number, required: true, min: 0.01 },
    unit: { type: String, enum: ['Kg', 'MT', 'Ton'], required: true },
    deliveryLocation: { type: String, required: true, trim: true, maxlength: 240 },
    purchaseTimeline: {
      type: String,
      enum: ['Immediate', 'Within 7 Days', 'Within 30 Days', 'Future Requirement'],
      required: true,
    },
    preferredContactMethod: { type: String, enum: ['Phone', 'Email', 'WhatsApp'], default: 'Phone' },
    attachment: { type: attachmentSchema, default: () => ({}) },
    source: { type: String, enum: ['Website'], default: 'Website', index: true },
    status: { type: String, enum: LEAD_STATUSES, default: 'New', index: true },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium', index: true },
    priorityScore: { type: Number, default: 0, min: 0 },
    assignedTeam: { type: String, enum: ['lqt', 'sales', ''], default: 'lqt', index: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    assignedToName: { type: String, default: '', trim: true, maxlength: 120 },
    leadTemperature: { type: String, enum: ['hot', 'warm', 'cold', 'rejected'], default: 'warm', index: true },
    notes: { type: [noteSchema], default: [] },
    followUps: { type: [followUpSchema], default: [] },
    meetings: { type: [meetingSchema], default: [] },
    statusHistory: { type: [statusHistorySchema], default: [{ status: 'New', note: 'Website inquiry received' }] },
    quotation: {
      amount: { type: Number, default: 0 },
      currency: { type: String, default: 'INR', trim: true },
      sentAt: { type: Date, default: null },
      status: { type: String, enum: ['draft', 'sent', 'accepted', 'rejected'], default: 'draft' },
    },
    order: {
      poNumber: { type: String, default: '', trim: true },
      amount: { type: Number, default: 0 },
      status: { type: String, enum: ['none', 'pending', 'confirmed', 'fulfilled', 'cancelled'], default: 'none' },
    },
  },
  { timestamps: true }
);

leadSchema.virtual('attachmentUrl').get(function getAttachmentUrl() {
  return this.attachment?.url || '';
});

leadSchema.set('toJSON', { virtuals: true });
leadSchema.set('toObject', { virtuals: true });

export const Lead = mongoose.model('Lead', leadSchema);
