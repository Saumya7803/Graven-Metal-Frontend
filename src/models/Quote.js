import mongoose from 'mongoose';

const quoteFileSchema = new mongoose.Schema(
  {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
    name: { type: String, default: '' },
    mimeType: { type: String, default: '' },
    size: { type: Number, default: 0 },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: ['new', 'in_review', 'quoted', 'closed'], required: true },
    note: { type: String, default: '' },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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

const quoteSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    quantity: { type: String, required: true, trim: true },
    metal: { type: String, required: true, trim: true },
    requirement: { type: String, required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    file: { type: quoteFileSchema, default: () => ({}) },
    status: { type: String, enum: ['new', 'in_review', 'quoted', 'closed'], default: 'new' },
    leadTemperature: { type: String, enum: ['hot', 'warm', 'cold', 'rejected'], default: 'warm', index: true },
    assignedTeam: { type: String, enum: ['lqt', 'sales', 'procurement', ''], default: 'lqt', index: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    assignedToName: { type: String, default: '', trim: true },
    adminNotes: { type: String, default: '' },
    statusHistory: { type: [statusHistorySchema], default: [{ status: 'new', note: 'Quote submitted' }] },
    callNotes: { type: [noteSchema], default: [] },
    followUps: { type: [followUpSchema], default: [] },
    meetings: { type: [meetingSchema], default: [] },
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

quoteSchema.virtual('fileUrl').get(function getFileUrl() {
  return this.file?.url || '';
});

quoteSchema.set('toJSON', { virtuals: true });
quoteSchema.set('toObject', { virtuals: true });

export const Quote = mongoose.model('Quote', quoteSchema);
