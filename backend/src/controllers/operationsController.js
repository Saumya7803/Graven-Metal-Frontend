import { Quote } from '../models/Quote.js';
import { Lead } from '../models/Lead.js';
import { OperationRecord } from '../models/OperationRecord.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const quoteModules = new Set([
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
]);

const procurementModules = new Set([
  'supplier-management',
  'price-requests',
  'vendor-comparison',
  'cost-analysis',
  'purchase-orders',
  'availability-tracking',
  'procurement-reports',
  'supplier-communication',
]);

function assertTeamAccess(req, team) {
  if (req.user.role === 'super_admin') return null;
  if (req.user.role !== team) return 'Forbidden: team dashboard access denied';
  return null;
}

function formatQuoteRow(quote) {
  return {
    id: quote._id,
    source: 'quote',
    account: quote.fullName,
    owner: quote.assignedToName || 'Unassigned',
    detail: `${quote.metal}, ${quote.quantity}`,
    status: quote.leadTemperature || quote.status,
    quoteStatus: quote.status,
    next: quote.followUps?.find((item) => item.status === 'pending')?.note || 'Review requirement',
    value: quote.quotation?.amount ? `${quote.quotation.currency || 'INR'} ${quote.quotation.amount}` : quote.requirement,
    email: quote.email,
    phone: quote.phone,
    requirement: quote.requirement,
    assignedTeam: quote.assignedTeam,
    assignedTo: quote.assignedTo,
    leadTemperature: quote.leadTemperature,
    quotation: quote.quotation,
    order: quote.order,
    callNotes: quote.callNotes || [],
    followUps: quote.followUps || [],
    meetings: quote.meetings || [],
    createdAt: quote.createdAt,
    updatedAt: quote.updatedAt,
  };
}

function formatLeadRow(lead) {
  const pendingFollowUp = lead.followUps?.find((item) => item.status === 'pending');
  return {
    id: lead._id,
    source: 'lead',
    sourceLabel: 'Website Lead',
    leadId: lead.leadId,
    account: lead.fullName,
    companyName: lead.companyName,
    owner: lead.assignedToName || 'Unassigned',
    detail: `${lead.product}, ${lead.quantity} ${lead.unit}`,
    product: lead.product,
    quantity: `${lead.quantity} ${lead.unit}`,
    status: lead.status,
    leadStatus: lead.status,
    next: pendingFollowUp?.note || 'Review website inquiry',
    lastFollowUp: pendingFollowUp?.dueAt || '',
    value: `${lead.priority} (${lead.priorityScore})`,
    priority: lead.priority,
    priorityScore: lead.priorityScore,
    buyerType: lead.industryType,
    email: lead.email,
    phone: lead.phone,
    whatsappNumber: lead.whatsappNumber,
    requirement: lead.requirement,
    assignedTeam: lead.assignedTeam,
    assignedTo: lead.assignedTo,
    leadTemperature: lead.leadTemperature,
    quotation: lead.quotation,
    order: lead.order,
    callNotes: lead.notes || [],
    followUps: lead.followUps || [],
    meetings: lead.meetings || [],
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  };
}

function formatRecord(record) {
  return {
    id: record._id,
    source: 'operation',
    team: record.team,
    module: record.module,
    account: record.title,
    owner: record.owner || 'Unassigned',
    detail: record.detail,
    status: record.status,
    next: record.nextStep,
    value: record.value,
    metadata: record.metadata || {},
    notes: record.notes || [],
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function statusCounts(rows, key = 'status') {
  return rows.reduce((acc, row) => {
    const label = row[key] || 'open';
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});
}

function teamQuoteFilter(team) {
  if (team === 'lqt') return { $or: [{ assignedTeam: 'lqt' }, { assignedTeam: '' }, { assignedTeam: { $exists: false } }] };
  if (team === 'sales') return { $or: [{ assignedTeam: 'sales' }, { status: { $in: ['in_review', 'quoted', 'closed'] } }] };
  return {};
}

function teamLeadFilter(team) {
  if (team === 'lqt') return { $or: [{ assignedTeam: 'lqt' }, { assignedTeam: '' }, { assignedTeam: { $exists: false } }] };
  if (team === 'sales') return { assignedTeam: 'sales' };
  return {};
}

function websiteLeadAnalytics(leads) {
  const totalInquiries = leads.length;
  const qualifiedStatuses = new Set([
    'Qualified',
    'Sales Assigned',
    'Follow-up',
    'Quotation Sent',
    'Negotiation',
    'Order Confirmed',
    'Won',
  ]);
  const qualifiedLeads = leads.filter((lead) => qualifiedStatuses.has(lead.status)).length;
  const salesAssigned = leads.filter((lead) => lead.assignedTeam === 'sales').length;
  const quotationsSent = leads.filter((lead) => lead.quotation?.status === 'sent').length;
  const ordersWon = leads.filter((lead) => lead.status === 'Won' || lead.order?.status === 'fulfilled').length;

  return {
    totalInquiries,
    totalWebsiteLeads: totalInquiries,
    newWebsiteLeads: leads.filter((lead) => lead.status === 'New').length,
    qualifiedLeads,
    salesAssigned,
    quotationsSent,
    ordersWon,
    convertedLeads: ordersWon,
    conversionRate: totalInquiries ? Number(((ordersWon / totalInquiries) * 100).toFixed(1)) : 0,
    leadSourcePerformance: { Website: totalInquiries },
  };
}

export const getOperationsDashboard = asyncHandler(async (req, res) => {
  const { team } = req.params;
  const accessError = assertTeamAccess(req, team);
  if (accessError) return res.status(403).json({ message: accessError });
  if (!['lqt', 'sales', 'procurement'].includes(team)) return res.status(400).json({ message: 'Invalid team' });

  if (team === 'procurement') {
    const records = await OperationRecord.find({ team }).sort({ updatedAt: -1 }).limit(200);
    const rows = records.map(formatRecord);
    return res.json({
      team,
      rows,
      counts: statusCounts(rows),
      modules: Object.fromEntries(
        [...procurementModules].map((module) => [module, rows.filter((row) => row.module === module).length])
      ),
    });
  }

  const [quotes, leads, allWebsiteLeads] = await Promise.all([
    Quote.find(teamQuoteFilter(team)).sort({ updatedAt: -1 }).limit(200),
    Lead.find(teamLeadFilter(team)).sort({ updatedAt: -1 }).limit(200),
    Lead.find({ source: 'Website' }).select('status assignedTeam quotation.status order.status').lean(),
  ]);
  const rows = [...leads.map(formatLeadRow), ...quotes.map(formatQuoteRow)].sort(
    (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
  );
  return res.json({
    team,
    rows,
    websiteLeadStats: websiteLeadAnalytics(allWebsiteLeads),
    counts: {
      quoteStatus: statusCounts(rows, 'quoteStatus'),
      leadTemperature: statusCounts(rows, 'leadTemperature'),
    },
    modules: {
      'new-leads': rows.filter((row) => row.quoteStatus === 'new' || row.leadStatus === 'New').length,
      'assigned-leads': rows.filter((row) => row.owner !== 'Unassigned').length,
      qualification: rows.filter((row) => row.quoteStatus === 'in_review' || row.leadStatus === 'Qualified').length,
      'lead-status': Object.keys(statusCounts(rows, 'leadTemperature')).length,
      'follow-ups': rows.reduce((sum, row) => sum + row.followUps.filter((item) => item.status === 'pending').length, 0),
      'call-notes': rows.reduce((sum, row) => sum + row.callNotes.length, 0),
      'meeting-scheduling': rows.reduce((sum, row) => sum + row.meetings.filter((item) => item.status === 'scheduled').length, 0),
      'sales-assignment': rows.filter((row) => row.assignedTeam === 'sales').length,
      'quotation-management': rows.filter((row) => row.quotation?.status === 'sent').length,
      'order-management': rows.filter((row) => row.order?.status && row.order.status !== 'none').length,
    },
  });
});

export const listOperationMembers = asyncHandler(async (req, res) => {
  const { team } = req.params;
  const canListSalesForHandoff = req.user.role === 'lqt' && team === 'sales';
  const accessError = canListSalesForHandoff ? null : assertTeamAccess(req, team);
  if (accessError) return res.status(403).json({ message: accessError });

  const members = await User.find({ role: team }).select('_id name email role').sort({ name: 1 });
  res.json({
    data: members.map((member) => ({
      id: member._id,
      name: member.name,
      email: member.email,
      role: member.role,
    })),
  });
});

export const updateQuoteOperation = asyncHandler(async (req, res) => {
  const { team, id } = req.params;
  const accessError = assertTeamAccess(req, team);
  if (accessError) return res.status(403).json({ message: accessError });
  if (!quoteModules.has(req.body.module || 'overview')) return res.status(400).json({ message: 'Invalid quote module' });

  const quote = await Quote.findById(id);
  if (!quote) return res.status(404).json({ message: 'Quote not found' });

  const {
    status,
    leadTemperature,
    assignedTeam,
    assignedTo,
    assignedToName,
    requirement,
    adminNotes,
    note,
    followUp,
    meeting,
    quotation,
    order,
  } = req.body;

  if (status) {
    quote.status = status;
    quote.statusHistory.push({
      status,
      note: note || 'Updated from operations dashboard',
      changedBy: req.user._id,
      changedAt: new Date(),
    });
  }
  if (leadTemperature) quote.leadTemperature = leadTemperature;
  if (assignedTeam !== undefined) quote.assignedTeam = assignedTeam;
  if (assignedTo !== undefined) {
    if (!assignedTo) {
      quote.assignedTo = null;
      quote.assignedToName = '';
    } else {
      const assignmentTeam = assignedTeam || quote.assignedTeam || team;
      const member = await User.findOne({ _id: assignedTo, role: assignmentTeam }).select('_id name');
      if (!member) return res.status(400).json({ message: `Assigned employee must belong to the ${assignmentTeam} team` });
      quote.assignedTo = member._id;
      quote.assignedToName = member.name;
    }
  } else if (assignedToName !== undefined) {
    quote.assignedToName = assignedToName;
  }
  if (requirement !== undefined) quote.requirement = requirement;
  if (adminNotes !== undefined) quote.adminNotes = adminNotes;
  if (note) {
    quote.callNotes.push({
      note,
      authorName: req.user.name,
      createdBy: req.user._id,
    });
  }
  if (followUp?.note || followUp?.dueAt) {
    quote.followUps.push({
      note: followUp.note || '',
      dueAt: followUp.dueAt || null,
      status: followUp.status || 'pending',
      createdBy: req.user._id,
    });
  }
  if (meeting?.note || meeting?.scheduledAt) {
    quote.meetings.push({
      note: meeting.note || '',
      scheduledAt: meeting.scheduledAt || null,
      status: meeting.status || 'scheduled',
      createdBy: req.user._id,
    });
  }
  if (quotation) {
    quote.quotation = {
      ...quote.quotation?.toObject?.(),
      ...quotation,
      sentAt: quotation.sentAt || quote.quotation?.sentAt || (quotation.status === 'sent' ? new Date() : null),
    };
    if (quotation.status === 'sent') quote.status = 'quoted';
  }
  if (order) quote.order = { ...quote.order?.toObject?.(), ...order };

  await quote.save();
  res.json({ message: 'Quote operation updated', data: formatQuoteRow(quote) });
});

export const listOperationRecords = asyncHandler(async (req, res) => {
  const { team } = req.params;
  const accessError = assertTeamAccess(req, team);
  if (accessError) return res.status(403).json({ message: accessError });

  const filter = { team };
  if (req.query.module) filter.module = req.query.module;
  const records = await OperationRecord.find(filter).sort({ updatedAt: -1 }).limit(200);
  res.json({ data: records.map(formatRecord) });
});

export const createOperationRecord = asyncHandler(async (req, res) => {
  const { team } = req.params;
  const accessError = assertTeamAccess(req, team);
  if (accessError) return res.status(403).json({ message: accessError });
  if (!procurementModules.has(req.body.module) && !['customer-management', 'sales-reports'].includes(req.body.module)) {
    return res.status(400).json({ message: 'Invalid operation module' });
  }

  const record = await OperationRecord.create({
    team,
    module: req.body.module,
    title: req.body.title,
    owner: req.body.owner || req.user.name,
    detail: req.body.detail || '',
    status: req.body.status || 'open',
    nextStep: req.body.nextStep || '',
    value: req.body.value || '',
    metadata: req.body.metadata || {},
    notes: req.body.note
      ? [{ note: req.body.note, authorName: req.user.name, createdBy: req.user._id }]
      : [],
  });

  res.status(201).json({ message: 'Operation record created', data: formatRecord(record) });
});

export const updateOperationRecord = asyncHandler(async (req, res) => {
  const { team, id } = req.params;
  const accessError = assertTeamAccess(req, team);
  if (accessError) return res.status(403).json({ message: accessError });

  const record = await OperationRecord.findOne({ _id: id, team });
  if (!record) return res.status(404).json({ message: 'Operation record not found' });

  ['title', 'owner', 'detail', 'status', 'value'].forEach((field) => {
    if (req.body[field] !== undefined) record[field] = req.body[field];
  });
  if (req.body.nextStep !== undefined) record.nextStep = req.body.nextStep;
  if (req.body.metadata !== undefined) record.metadata = req.body.metadata;
  if (req.body.note) {
    record.notes.push({ note: req.body.note, authorName: req.user.name, createdBy: req.user._id });
  }

  await record.save();
  res.json({ message: 'Operation record updated', data: formatRecord(record) });
});
