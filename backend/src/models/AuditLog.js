import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true, trim: true },
    actor: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, default: '', trim: true },
      email: { type: String, default: '', trim: true },
      role: { type: String, default: '', trim: true },
    },
    target: {
      type: { type: String, default: '', trim: true },
      id: { type: String, default: '', trim: true },
      label: { type: String, default: '', trim: true },
    },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ 'actor.id': 1, createdAt: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
