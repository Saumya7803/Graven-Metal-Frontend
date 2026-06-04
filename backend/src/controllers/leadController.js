import { Lead, LEAD_STATUSES } from '../models/Lead.js';
import { LqtLead } from '../models/LqtLead.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadBufferToCloudinary } from '../utils/cloudinaryUpload.js';
import { notifyAdminOfNewLead } from '../utils/leadNotification.js';
import { calculateLeadScore } from '../utils/leadScoring.js';

const attachmentMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
];

const mapPriorityForLqt = (priority) =>
  ({
    High: 'high',
    Medium: 'medium',
    Low: 'low',
  })[priority] || 'medium';

function buildLqtLeadMirror(lead) {
  return {
    leadName: lead.fullName,
    companyName: lead.companyName,
    contactPerson: lead.fullName,
    mobileNumber: lead.phone,
    email: lead.email,
    leadSource: 'Website',
    productRequired: lead.product,
    quantity: `${lead.quantity} ${lead.unit}`,
    deliveryLocation: lead.deliveryLocation,
    industry: lead.industryType,
    expectedTimeline: lead.purchaseTimeline,
    requirementNotes: lead.requirement,
    internalNotes: `Website Lead ${lead.leadId}. Priority score: ${lead.priorityScore}. Preferred contact: ${lead.preferredContactMethod}.`,
    owner: 'Unassigned',
    priority: mapPriorityForLqt(lead.priority),
    stage: 'newLead',
    nextActionAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    history: [
      {
        title: 'Website Inquiry Received',
        details: `Lead ${lead.leadId} created from website form.`,
        by: 'Website',
      },
    ],
    metadata: {
      websiteLeadId: `${lead._id}`,
      leadId: lead.leadId,
      priorityScore: lead.priorityScore,
      preferredContactMethod: lead.preferredContactMethod,
      whatsappNumber: lead.whatsappNumber,
      city: lead.city,
      state: lead.state,
      country: lead.country,
      gstNumber: lead.gstNumber,
      attachmentUrl: lead.attachment?.url || '',
    },
    createdBy: 'Website',
    updatedBy: 'Website',
  };
}

export const createLead = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  const scoring = calculateLeadScore(payload);
  const uploadedFile = await uploadBufferToCloudinary(req.file, {
    folder: 'graven-metal/leads',
    resourceType: 'auto',
    allowedMime: attachmentMimeTypes,
  });

  const lead = await Lead.create({
    ...payload,
    attachment: uploadedFile || undefined,
    priority: scoring.priority,
    priorityScore: scoring.score,
    source: 'Website',
    status: 'New',
    assignedTeam: 'lqt',
  });

  await LqtLead.create(buildLqtLeadMirror(lead));

  notifyAdminOfNewLead(lead).catch((error) => {
    console.error('Lead notification email failed:', error.message);
  });

  res.status(201).json({
    success: true,
    message: 'Thank you for your inquiry. Our metal sourcing team will review your requirement and contact you within 24 hours.',
    data: {
      id: lead._id,
      leadId: lead.leadId,
      status: lead.status,
      source: lead.source,
      priority: lead.priority,
      priorityScore: lead.priorityScore,
      createdAt: lead.createdAt,
    },
  });
});

export const getLeads = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.source) filter.source = req.query.source;
  const leads = await Lead.find(filter).sort({ createdAt: -1 }).limit(500);
  res.json({ success: true, data: leads });
});

export const getLeadById = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: 'Lead not found' });
  res.json({ success: true, data: lead });
});

function recordStatus(lead, status, note, userId) {
  if (lead.status === status) return;
  lead.status = status;
  lead.statusHistory.push({
    status,
    note: note || 'Updated from CRM dashboard',
    changedBy: userId,
    changedAt: new Date(),
  });
}

export const updateLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: 'Lead not found' });

  const {
    status,
    leadTemperature,
    assignedTeam,
    assignedTo,
    requirement,
    note,
    followUp,
    meeting,
    quotation,
    order,
  } = req.body;

  if (status) {
    recordStatus(lead, status, note, req.user._id);
    if (status === 'Assigned To Sales') {
      lead.assignedTeam = 'sales';
    } else if (status === 'New' || status === 'Qualified' || status === 'Need More Information' || status === 'Rejected') {
      lead.assignedTeam = 'lqt';
    }
  }
  if (leadTemperature) lead.leadTemperature = leadTemperature;
  if (assignedTeam !== undefined) lead.assignedTeam = assignedTeam;
  if (assignedTo !== undefined) {
    if (!assignedTo) {
      lead.assignedTo = null;
      lead.assignedToName = '';
    } else {
      const assignmentTeam = assignedTeam || lead.assignedTeam || 'lqt';
      const member = await User.findOne({ _id: assignedTo, role: assignmentTeam }).select('_id name');
      if (!member) return res.status(400).json({ message: `Assigned employee must belong to the ${assignmentTeam} team` });
      lead.assignedTo = member._id;
      lead.assignedToName = member.name;
    }
  }
  if (requirement !== undefined) lead.requirement = requirement;
  if (note) {
    lead.notes.push({ note, authorName: req.user.name, createdBy: req.user._id });
  }
  if (followUp?.note || followUp?.dueAt) {
    lead.followUps.push({
      note: followUp.note || '',
      dueAt: followUp.dueAt || null,
      status: followUp.status || 'pending',
      createdBy: req.user._id,
    });
  }
  if (meeting?.note || meeting?.scheduledAt) {
    lead.meetings.push({
      note: meeting.note || '',
      scheduledAt: meeting.scheduledAt || null,
      status: meeting.status || 'scheduled',
      createdBy: req.user._id,
    });
  }
  if (quotation) {
    lead.quotation = {
      ...lead.quotation?.toObject?.(),
      ...quotation,
      sentAt: quotation.sentAt || lead.quotation?.sentAt || (quotation.status === 'sent' ? new Date() : null),
    };
    if (quotation.status === 'sent') recordStatus(lead, 'Quotation Sent', note || 'Quotation sent', req.user._id);
  }
  if (order) {
    lead.order = { ...lead.order?.toObject?.(), ...order };
    if (order.status === 'confirmed') recordStatus(lead, 'Order Confirmed', note || 'Order confirmed', req.user._id);
    if (order.status === 'fulfilled') recordStatus(lead, 'Won', note || 'Order fulfilled', req.user._id);
  }

  await lead.save();
  res.json({ success: true, message: 'Lead updated', data: lead });
});

export { LEAD_STATUSES };
