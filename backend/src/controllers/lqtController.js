import { LqtLead } from '../models/LqtLead.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const leadSources = ['Website', 'IndiaMART', 'TradeIndia', 'WhatsApp', 'Referral', 'Email', 'Direct Call'];

function checklistScore(checklist = {}) {
  let total = 0;
  if (checklist.firstContactDone) total += 15;
  if (checklist.requirementCollected) total += 20;
  if (checklist.decisionMakerIdentified) total += 15;
  if (checklist.budgetConfirmed) total += 20;
  if (checklist.timelineConfirmed) total += 15;
  if (checklist.technicalRequirementClear) total += 15;
  return total;
}

function qualificationBand(score) {
  if (score >= 80) return 'Qualified';
  if (score >= 60) return 'Need More Information';
  if (score >= 40) return 'Need More Information';
  return 'Rejected';
}

function stageLabel(stage) {
  return (
    {
      newLead: 'New',
      qualified: 'Qualified',
      needMoreInformation: 'Need More Information',
      rejected: 'Rejected',
      assignedToSales: 'Assigned To Sales',
      contacted: 'Need More Information',
      requirementGathering: 'Qualified',
      assigned: 'Assigned To Sales',
      accepted: 'Assigned To Sales',
      returned: 'Rejected',
    }[stage] || stage
  );
}

function formatFollowUp(followUp = {}) {
  return {
    id: `${followUp._id || followUp.id || ''}`,
    leadId: followUp.leadId || '',
    leadName: followUp.leadName || '',
    followUpDate: followUp.followUpDate || null,
    followUpTime: followUp.followUpTime || '',
    reason: followUp.reason || '',
    notes: followUp.notes || '',
    assignedExecutive: followUp.assignedExecutive || '',
    status: followUp.status || 'scheduled',
  };
}

function formatHistoryEvent(event = {}) {
  return {
    id: `${event._id || event.id || ''}`,
    title: event.title || '',
    details: event.details || '',
    timestamp: event.timestamp || new Date().toISOString(),
    by: event.by || '',
  };
}

function formatLead(lead) {
  const score = checklistScore(lead.checklist);
  return {
    id: `${lead._id}`,
    leadName: lead.leadName || '',
    companyName: lead.companyName || '',
    contactPerson: lead.contactPerson || '',
    mobileNumber: lead.mobileNumber || '',
    email: lead.email || '',
    leadSource: lead.leadSource || 'Website',
    productRequired: lead.productRequired || '',
    gradeSpecification: lead.gradeSpecification || '',
    quantity: lead.quantity || '',
    deliveryLocation: lead.deliveryLocation || '',
    industry: lead.industry || '',
    expectedTimeline: lead.expectedTimeline || '',
    decisionMakerName: lead.decisionMakerName || '',
    budgetDiscussed: lead.budgetDiscussed || '',
    requirementNotes: lead.requirementNotes || '',
    internalNotes: lead.internalNotes || '',
    owner: lead.owner || '',
    salesAssignee: lead.salesAssignee || '',
    priority: lead.priority || 'medium',
    stage: lead.stage || 'newLead',
    stageLabel: stageLabel(lead.stage),
    qualificationScore: score,
    qualificationBand: qualificationBand(score),
    checklist: {
      firstContactDone: !!lead.checklist?.firstContactDone,
      requirementCollected: !!lead.checklist?.requirementCollected,
      decisionMakerIdentified: !!lead.checklist?.decisionMakerIdentified,
      budgetConfirmed: !!lead.checklist?.budgetConfirmed,
      timelineConfirmed: !!lead.checklist?.timelineConfirmed,
      technicalRequirementClear: !!lead.checklist?.technicalRequirementClear,
    },
    nextActionAt: lead.nextActionAt || null,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
    followUps: (lead.followUps || []).map(formatFollowUp),
    history: (lead.history || []).map(formatHistoryEvent),
    metadata: lead.metadata || {},
  };
}

function formatMember(member) {
  return {
    id: `${member._id}`,
    name: member.name,
    email: member.email,
    role: member.role,
  };
}

function summarizeCounts(rows, key) {
  return rows.reduce((acc, row) => {
    const label = row[key] || 'open';
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});
}

function buildDashboard(leads) {
  const rows = leads.map(formatLead);
  const today = new Date();
  const sameDay = (value) =>
    value &&
    new Date(value).getFullYear() === today.getFullYear() &&
    new Date(value).getMonth() === today.getMonth() &&
    new Date(value).getDate() === today.getDate();

  return {
    kpis: {
      newLeads: rows.filter((row) => row.stage === 'newLead').length,
      pendingQualification: rows.filter((row) => ['needMoreInformation', 'contacted', 'requirementGathering'].includes(row.stage)).length,
      followUpsDue: rows.filter((row) => row.nextActionAt && new Date(row.nextActionAt) <= new Date(today.getTime() + 24 * 60 * 60 * 1000)).length,
      salesReady: rows.filter((row) => ['qualified', 'assignedToSales', 'assigned', 'accepted'].includes(row.stage)).length,
      assignedToday: rows.filter((row) => row.stage === 'assignedToSales' && sameDay(row.createdAt)).length,
      slaPercent: rows.length ? Math.round((rows.filter((row) => ['assignedToSales', 'rejected', 'assigned', 'accepted'].includes(row.stage)).length / rows.length) * 100) : 0,
    },
    funnel: [
      { label: 'New Leads', value: rows.filter((row) => row.stage === 'newLead').length },
      { label: 'Qualified', value: rows.filter((row) => row.stage === 'qualified').length },
      { label: 'Need More Information', value: rows.filter((row) => row.stage === 'needMoreInformation').length },
      { label: 'Rejected', value: rows.filter((row) => row.stage === 'rejected').length },
      { label: 'Assigned To Sales', value: rows.filter((row) => row.stage === 'assignedToSales').length },
    ],
    statusMix: summarizeCounts(rows, 'stage'),
    assignmentTracker: {
      assignedToday: rows.filter((row) => row.stage === 'assignedToSales' && sameDay(row.createdAt)).length,
      acceptedBySales: rows.filter((row) => row.stage === 'assignedToSales').length,
      pendingAcceptance: rows.filter((row) => row.stage === 'assignedToSales').length,
      returnedLeads: rows.filter((row) => row.stage === 'rejected' || row.stage === 'returned').length,
    },
  };
}

function buildReports(rows, teamMembers) {
  const sourceCounts = leadSources.map((source) => ({
    label: source,
    value: rows.filter((row) => row.leadSource === source).length,
  }));
  const qualificationBuckets = [
    { label: 'Qualified', value: rows.filter((row) => row.stage === 'qualified').length },
    { label: 'Need More Information', value: rows.filter((row) => row.stage === 'needMoreInformation').length },
    { label: 'Assigned To Sales', value: rows.filter((row) => row.stage === 'assignedToSales').length },
    { label: 'Rejected', value: rows.filter((row) => row.stage === 'rejected').length },
  ];

  const completedFollowUps = rows.reduce(
    (sum, row) => sum + row.followUps.filter((followUp) => followUp.status === 'completed').length,
    0
  );
  const scheduledFollowUps = rows.reduce((sum, row) => sum + row.followUps.length, 0);

  const executivePerformance = teamMembers.map((member) => ({
    label: member.name,
    value: rows.filter((row) => row.owner === member.name || row.salesAssignee === member.name).length,
  }));

  return {
    leadSourcePerformance: sourceCounts,
    qualificationRate: qualificationBuckets,
    averageQualificationTime: rows.length ? '2.4 days' : '0 days',
    assignmentSuccessRate: rows.length
      ? `${Math.round((rows.filter((row) => ['assigned', 'accepted'].includes(row.stage)).length / rows.length) * 100)}%`
      : '0%',
    followUpCompletionRate: scheduledFollowUps
      ? `${Math.round((completedFollowUps / scheduledFollowUps) * 100)}%`
      : '0%',
    executivePerformance,
  };
}

async function ensureLqtSeedData() {
  if (process.env.NODE_ENV === 'production') return;
  const count = await LqtLead.countDocuments();
  if (count > 0) return;

  await LqtLead.insertMany([
    {
      leadName: 'Apex Fabricators',
      companyName: 'Apex Fabricators Pvt Ltd',
      contactPerson: 'Ravi Sharma',
      mobileNumber: '9876543210',
      email: 'ravi@apexfabricators.com',
      leadSource: 'Website',
      productRequired: 'Mild Steel Coils',
      gradeSpecification: 'IS 2062',
      quantity: '120 MT',
      deliveryLocation: 'Pune, Maharashtra',
      industry: 'Fabrication',
      expectedTimeline: '15 days',
      decisionMakerName: 'Anita Mehra',
      budgetDiscussed: 'Yes',
      requirementNotes: 'Urgent supply for fabrication line.',
      internalNotes: 'High potential, needs next-day follow-up.',
      owner: 'Priya',
      priority: 'high',
      stage: 'newLead',
      checklist: {
        firstContactDone: true,
        requirementCollected: true,
        technicalRequirementClear: true,
      },
      nextActionAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
      history: [{ title: 'Lead Created', details: 'Lead created in CRM', by: 'System' }],
    },
    {
      leadName: 'Nova Automotive',
      companyName: 'Nova Automotive Components',
      contactPerson: 'Mohan Iyer',
      mobileNumber: '9988776655',
      email: 'mohan@novaauto.in',
      leadSource: 'IndiaMART',
      productRequired: 'Aluminium Sheets',
      gradeSpecification: '5052-H32',
      quantity: '2400 kg',
      deliveryLocation: 'Chennai, Tamil Nadu',
      industry: 'Automotive',
      expectedTimeline: '7 days',
      decisionMakerName: 'Vikram Rao',
      budgetDiscussed: 'Yes',
      requirementNotes: 'Need corrosion-resistant lightweight sheets.',
      internalNotes: 'Warm lead, qualification in progress.',
      owner: 'Suresh',
      priority: 'urgent',
      stage: 'needMoreInformation',
      checklist: {
        firstContactDone: true,
        requirementCollected: true,
        decisionMakerIdentified: true,
        budgetConfirmed: true,
        timelineConfirmed: true,
      },
      nextActionAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      history: [{ title: 'Call Completed', details: 'Initial conversation completed', by: 'System' }],
    },
    {
      leadName: 'Zenith Traders',
      companyName: 'Zenith Traders LLP',
      contactPerson: 'Karan Bedi',
      mobileNumber: '9011223344',
      email: 'sales@zenithtraders.in',
      leadSource: 'TradeIndia',
      productRequired: 'Copper Cathode Sheets',
      gradeSpecification: 'C11000',
      quantity: '80 MT',
      deliveryLocation: 'Ahmedabad, Gujarat',
      industry: 'Electrical',
      expectedTimeline: '30 days',
      decisionMakerName: 'Karan Bedi',
      budgetDiscussed: 'Discussed',
      requirementNotes: 'Awaiting final specification sheet.',
      internalNotes: 'Suitable for qualification checklist.',
      owner: 'Meena',
      salesAssignee: 'Arjun',
      priority: 'medium',
      stage: 'qualified',
      checklist: {
        firstContactDone: true,
        requirementCollected: true,
        decisionMakerIdentified: true,
        timelineConfirmed: true,
        technicalRequirementClear: true,
      },
      nextActionAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      history: [{ title: 'Requirement Updated', details: 'Requirement details captured', by: 'System' }],
    },
    {
      leadName: 'Sterling Projects',
      companyName: 'Sterling Infra Projects',
      contactPerson: 'Divya Nair',
      mobileNumber: '9123456780',
      email: 'divya@sterlinginfra.com',
      leadSource: 'Referral',
      productRequired: 'Iron TMT Bars',
      gradeSpecification: 'Fe 500',
      quantity: '310 MT',
      deliveryLocation: 'Hyderabad, Telangana',
      industry: 'Infrastructure',
      expectedTimeline: '14 days',
      decisionMakerName: 'Divya Nair',
      budgetDiscussed: 'Yes',
      requirementNotes: 'Project order, follow-up required with procurement.',
      internalNotes: 'Sales ready if documentation is complete.',
      owner: 'Priya',
      salesAssignee: 'Mehul',
      priority: 'high',
      stage: 'assignedToSales',
      checklist: {
        firstContactDone: true,
        requirementCollected: true,
        decisionMakerIdentified: true,
        budgetConfirmed: true,
        timelineConfirmed: true,
        technicalRequirementClear: true,
      },
      followUps: [
        {
          leadId: 'seed-4',
          leadName: 'Sterling Projects',
          followUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          followUpTime: '10:30 AM',
          reason: 'Procurement confirmation',
          notes: 'Call procurement and finance together.',
          assignedExecutive: 'Mehul',
          status: 'scheduled',
        },
      ],
      history: [{ title: 'Lead Qualified', details: 'Lead moved to qualified stage', by: 'System' }],
    },
    {
      leadName: 'Prime Metals',
      companyName: 'Prime Metals Trading',
      contactPerson: 'Farah Khan',
      mobileNumber: '9567834210',
      email: 'farah@primemetals.in',
      leadSource: 'WhatsApp',
      productRequired: 'Brass Rods',
      gradeSpecification: 'CZ121',
      quantity: '40 MT',
      deliveryLocation: 'Rajkot, Gujarat',
      industry: 'Machining',
      expectedTimeline: '21 days',
      decisionMakerName: 'Farah Khan',
      budgetDiscussed: 'No',
      requirementNotes: 'Needs technical clarification on tolerance.',
      internalNotes: 'Nurture for next follow-up.',
      owner: 'Suresh',
      priority: 'medium',
      stage: 'needMoreInformation',
      checklist: {
        firstContactDone: true,
      },
      nextActionAt: new Date(Date.now() + 20 * 60 * 60 * 1000),
      history: [{ title: 'WhatsApp Conversation', details: 'Initial WhatsApp engagement', by: 'System' }],
    },
    {
      leadName: 'Blue Ridge Engineering',
      companyName: 'Blue Ridge Engineering Pvt Ltd',
      contactPerson: 'Nikhil Sen',
      mobileNumber: '9223344556',
      email: 'nikhil@blueridgeeng.com',
      leadSource: 'Email',
      productRequired: 'Stainless Steel Pipe',
      gradeSpecification: '304',
      quantity: '110 MT',
      deliveryLocation: 'Coimbatore, Tamil Nadu',
      industry: 'Engineering',
      expectedTimeline: '10 days',
      decisionMakerName: 'Nikhil Sen',
      budgetDiscussed: 'Partial',
      requirementNotes: 'Need more technical specification details.',
      internalNotes: 'Return pending from sales for clarification.',
      owner: 'Meena',
      salesAssignee: 'Arjun',
      priority: 'low',
      stage: 'rejected',
      checklist: {
        firstContactDone: true,
        requirementCollected: true,
        decisionMakerIdentified: true,
        technicalRequirementClear: true,
      },
      nextActionAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      history: [{ title: 'Sales Returned', details: 'Need additional technical info', by: 'System' }],
    },
  ]);
}

function buildLeadPayload(body, existingLead = null, user = null) {
  return {
    leadName: body.leadName ?? existingLead?.leadName ?? '',
    companyName: body.companyName ?? existingLead?.companyName ?? '',
    contactPerson: body.contactPerson ?? existingLead?.contactPerson ?? '',
    mobileNumber: body.mobileNumber ?? existingLead?.mobileNumber ?? '',
    email: body.email ?? existingLead?.email ?? '',
    leadSource: body.leadSource ?? existingLead?.leadSource ?? 'Website',
    productRequired: body.productRequired ?? existingLead?.productRequired ?? '',
    gradeSpecification: body.gradeSpecification ?? existingLead?.gradeSpecification ?? '',
    quantity: body.quantity ?? existingLead?.quantity ?? '',
    deliveryLocation: body.deliveryLocation ?? existingLead?.deliveryLocation ?? '',
    industry: body.industry ?? existingLead?.industry ?? '',
    expectedTimeline: body.expectedTimeline ?? existingLead?.expectedTimeline ?? '',
    decisionMakerName: body.decisionMakerName ?? existingLead?.decisionMakerName ?? '',
    budgetDiscussed: body.budgetDiscussed ?? existingLead?.budgetDiscussed ?? '',
    requirementNotes: body.requirementNotes ?? existingLead?.requirementNotes ?? '',
    internalNotes: body.internalNotes ?? existingLead?.internalNotes ?? '',
    owner: body.owner ?? existingLead?.owner ?? user?.name ?? '',
    salesAssignee: body.salesAssignee ?? existingLead?.salesAssignee ?? '',
    priority: body.priority ?? existingLead?.priority ?? 'medium',
    stage: body.stage ?? existingLead?.stage ?? 'newLead',
    checklist: body.checklist ?? existingLead?.checklist ?? {},
    nextActionAt: body.nextActionAt ?? existingLead?.nextActionAt ?? null,
    followUps: Array.isArray(body.followUps) ? body.followUps : existingLead?.followUps ?? [],
    history: Array.isArray(body.history) ? body.history : existingLead?.history ?? [],
    metadata: body.metadata ?? existingLead?.metadata ?? {},
    createdBy: existingLead?.createdBy ?? user?.name ?? '',
    updatedBy: user?.name ?? existingLead?.updatedBy ?? '',
  };
}

async function fetchTeamMembers(rows = []) {
  const members = await User.find({ role: { $in: ['lqt', 'sales'] } }).select('_id name email role').sort({ name: 1 });
  return members.map((member) => {
    const memberRows = rows.filter((row) => row.owner === member.name || row.salesAssignee === member.name);
    const activeRows = memberRows.filter((row) => !['assignedToSales', 'accepted', 'rejected', 'returned'].includes(row.stage));
    const pendingFollowUps = memberRows.reduce(
      (sum, row) =>
        sum + row.followUps.filter((followUp) => followUp.assignedExecutive === member.name && followUp.status !== 'completed').length,
      0
    );
    const qualifiedLeads = memberRows.filter((row) => ['qualified', 'assignedToSales', 'assigned', 'accepted'].includes(row.stage)).length;
    const assignmentsCompleted = memberRows.filter((row) => row.stage === 'assignedToSales' || row.stage === 'accepted').length;
    const slaPercent = memberRows.length
      ? Math.round((memberRows.filter((row) => ['assignedToSales', 'accepted', 'rejected'].includes(row.stage)).length / memberRows.length) * 100)
      : 0;

    return {
      ...formatMember(member),
      openLeads: activeRows.length,
      pendingFollowUps,
      qualifiedLeads,
      assignmentsCompleted,
      slaPercent,
    };
  });
}

export const getLqtWorkspace = asyncHandler(async (req, res) => {
  await ensureLqtSeedData();
  const leads = await LqtLead.find().sort({ updatedAt: -1, createdAt: -1 });
  const rows = leads.map(formatLead);
  const teamMembers = await fetchTeamMembers(rows);

  res.json({
    team: 'lqt',
    dashboard: buildDashboard(leads),
    leads: rows,
    teamMembers,
    reports: buildReports(rows, teamMembers),
  });
});

export const listLqtLeads = asyncHandler(async (req, res) => {
  await ensureLqtSeedData();
  const leads = await LqtLead.find().sort({ updatedAt: -1, createdAt: -1 });
  res.json({ data: leads.map(formatLead) });
});

export const listLqtTeamMembers = asyncHandler(async (req, res) => {
  await ensureLqtSeedData();
  const leads = await LqtLead.find().sort({ updatedAt: -1, createdAt: -1 });
  const teamMembers = await fetchTeamMembers(leads.map(formatLead));
  res.json({ data: teamMembers });
});

export const createLqtLead = asyncHandler(async (req, res) => {
  const payload = buildLeadPayload(req.body, null, req.user);
  if (!payload.leadName || !payload.companyName) {
    return res.status(400).json({ message: 'Lead name and company name are required' });
  }
  const lead = await LqtLead.create(payload);
  res.status(201).json({ message: 'Lead created', data: formatLead(lead) });
});

export const updateLqtLead = asyncHandler(async (req, res) => {
  const lead = await LqtLead.findById(req.params.id);
  if (!lead) {
    return res.status(404).json({ message: 'Lead not found' });
  }

  const payload = buildLeadPayload(req.body, lead, req.user);
  lead.set(payload);
  await lead.save();

  res.json({ message: 'Lead updated', data: formatLead(lead) });
});
