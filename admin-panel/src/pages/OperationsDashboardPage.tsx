import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Briefcase,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Database,
  Clock,
  FileSpreadsheet,
  FileText,
  Globe2,
  History,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Package,
  Phone,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  TrendingUp,
  Truck,
  UserCheck,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BrandLogo } from '../components/BrandLogo';
import { SEO } from '../components/seo/SEO';
import { clearAuth, getAuthUser } from '../lib/auth';
import { operationsApi, type OperationMember, type OperationRow, type WebsiteLeadStats } from '../lib/operationsApi';

type DashboardKind = 'lqt' | 'sales' | 'procurement' | 'cct' | 'inventory' | 'dispatch' | 'finance';
type Tone = 'gold' | 'green' | 'blue' | 'red' | 'violet';

const recordTeamKinds = ['sales', 'procurement', 'cct', 'inventory', 'dispatch', 'finance'] as const;
type RecordTeamKind = (typeof recordTeamKinds)[number];

function isRecordTeamKind(kind: DashboardKind): kind is RecordTeamKind {
  return recordTeamKinds.includes(kind as RecordTeamKind);
}

type Metric = {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone: Tone;
};

type StatusMetric = {
  label: string;
  value: number;
  tone: Tone;
};

type WorkRow = {
  id?: string;
  source?: 'quote' | 'lead' | 'operation';
  sourceLabel?: string;
  leadId?: string;
  account: string;
  companyName?: string;
  owner: string;
  detail: string;
  status: string;
  next: string;
  value: string;
  assignedTeam?: string;
  assignedTo?: string;
  email?: string;
  phone?: string;
  requirement?: string;
  leadStatus?: string;
  product?: string;
  quantity?: string;
  priority?: string;
  priorityScore?: number;
  buyerType?: string;
  whatsappNumber?: string;
  lastFollowUp?: string;
};

type ModuleItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  metric: string;
  helper: string;
};

type RoleTheme = {
  accentRgb: string;
  accentStrongRgb: string;
  accentLightRgb: string;
  pageRgb: string;
  surfaceRgb: string;
  surfaceAltRgb: string;
  headerRgb: string;
  sidebarRgb: string;
  cardRgb: string;
  innerRgb: string;
  glowLeft: string;
  glowRight: string;
};

type DashboardConfig = {
  title: string;
  eyebrow: string;
  route: string;
  roleLabel: string;
  theme: RoleTheme;
  primaryColumn: string;
  detailColumn: string;
  stats: Metric[];
  statuses: StatusMetric[];
  modules: ModuleItem[];
  rows: WorkRow[];
  activity: string[];
  priorities: string[];
  responsibilities?: string[];
  workflow?: string[];
  playbook?: string;
  decisionExample?: {
    salesPrice: string;
    procurementCost: string;
    margin: string;
    decision: string;
  };
};

type WorkspaceProps = {
  kind: DashboardKind;
  activeModule: string;
  config: DashboardConfig;
  filteredRows: WorkRow[];
  queueMode: 'open' | 'due' | 'closed';
  selectedModule: ModuleItem;
  setQueueMode: (mode: 'open' | 'due' | 'closed') => void;
  statusTotal: number;
  actionBusy: boolean;
  onRowAction: (row: WorkRow, action?: string) => void;
  onCreateRecord: (module: string) => void;
  onOpenForm: (row: WorkRow) => void;
  onOpenNewForm: () => void;
};

const toneClass: Record<Tone, { icon: string; bar: string; chip: string; ring: string }> = {
  gold: {
    icon: 'text-gold bg-gold/10 ring-gold/25',
    bar: 'from-brass via-gold to-amberlux',
    chip: 'border-gold/30 bg-gold/10 text-gold',
    ring: 'border-gold/20',
  },
  green: {
    icon: 'text-emerald-300 bg-emerald-400/10 ring-emerald-400/25',
    bar: 'from-emerald-500 to-lime-300',
    chip: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
    ring: 'border-emerald-400/20',
  },
  blue: {
    icon: 'text-sky-300 bg-sky-400/10 ring-sky-400/25',
    bar: 'from-sky-500 to-cyan-300',
    chip: 'border-sky-400/30 bg-sky-400/10 text-sky-200',
    ring: 'border-sky-400/20',
  },
  red: {
    icon: 'text-red-300 bg-red-400/10 ring-red-400/25',
    bar: 'from-red-500 to-orange-300',
    chip: 'border-red-400/30 bg-red-400/10 text-red-200',
    ring: 'border-red-400/20',
  },
  violet: {
    icon: 'text-violet-300 bg-violet-400/10 ring-violet-400/25',
    bar: 'from-violet-500 to-fuchsia-300',
    chip: 'border-violet-400/30 bg-violet-400/10 text-violet-200',
    ring: 'border-violet-400/20',
  },
};

const statusMixClass: Record<string, string> = {
  New: 'bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-300',
  Pricing: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-300',
  Negotiation: 'bg-gradient-to-r from-violet-500 via-fuchsia-400 to-pink-300',
  'Follow-Up': 'bg-gradient-to-r from-emerald-500 via-green-400 to-lime-300',
  Won: 'bg-gradient-to-r from-emerald-600 via-green-500 to-lime-400',
  Lost: 'bg-gradient-to-r from-zinc-700 via-red-900 to-red-500',
  Qualified: 'bg-gradient-to-r from-emerald-500 via-green-400 to-lime-300',
  'Need More Information': 'bg-gradient-to-r from-amber-500 via-yellow-400 to-yellow-200',
  Rejected: 'bg-gradient-to-r from-zinc-700 via-red-900 to-red-500',
  'Assigned To Sales': 'bg-gradient-to-r from-violet-500 via-fuchsia-400 to-pink-300',
  'Sales Order': 'bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-300',
  'Awaiting Price': 'bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-300',
  RFQ: 'bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-300',
  'Supplier Quotation': 'bg-gradient-to-r from-violet-500 via-fuchsia-400 to-pink-300',
  'Final Cost': 'bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-300',
  'Purchase Order': 'bg-gradient-to-r from-emerald-500 via-green-400 to-lime-300',
  'Order Ready': 'bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-300',
  Packaging: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-300',
  Dispatch: 'bg-gradient-to-r from-violet-500 via-fuchsia-400 to-pink-300',
  Tracking: 'bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-300',
  Delivered: 'bg-gradient-to-r from-emerald-500 via-green-400 to-lime-300',
};

const procurementWorkflowStages = ['Sales Order', 'Awaiting Price', 'RFQ', 'Supplier Quotation', 'Final Cost', 'Purchase Order'] as const;
const dispatchWorkflowStages = ['Order Ready', 'Packaging', 'Dispatch', 'Tracking', 'Delivered'] as const;

const roleClass = {
  page: 'bg-[rgb(var(--role-page))]',
  shell: 'bg-[rgb(var(--role-page))]',
  surface:
    'bg-[linear-gradient(145deg,rgb(var(--role-surface)_/_0.98)_0%,rgb(var(--role-surface-alt)_/_0.94)_100%)]',
  header:
    'bg-[radial-gradient(circle_at_88%_8%,rgb(var(--role-accent-light)_/_0.20),transparent_32%),linear-gradient(135deg,rgb(var(--role-header)_/_0.98)_0%,rgb(var(--role-surface-alt)_/_0.95)_100%)]',
  sidebar:
    'bg-[linear-gradient(180deg,rgb(var(--role-sidebar)_/_0.98)_0%,rgb(var(--role-surface)_/_0.96)_100%)]',
  card:
    'bg-[linear-gradient(145deg,rgb(var(--role-card)_/_0.98)_0%,rgb(var(--role-inner)_/_0.94)_100%)]',
  inner: 'bg-[rgb(var(--role-inner)_/_0.95)]',
  border: 'border-[rgb(var(--role-accent)_/_0.20)]',
  borderSoft: 'border-[rgb(var(--role-accent)_/_0.12)]',
  borderStrong: 'border-[rgb(var(--role-accent)_/_0.35)]',
  bgSoft: 'bg-[rgb(var(--role-accent)_/_0.10)]',
  bgLift: 'bg-[rgb(var(--role-accent)_/_0.16)]',
  text: 'text-[rgb(var(--role-accent))]',
  textSoft: 'text-[rgb(var(--role-accent-light))]',
  focus: 'focus:border-[rgb(var(--role-accent)_/_0.60)]',
  cta:
    'bg-[linear-gradient(100deg,rgb(var(--role-accent-strong))_0%,rgb(var(--role-accent))_48%,rgb(var(--role-accent-light))_100%)]',
  gradientBar:
    'from-[rgb(var(--role-accent-strong))] via-[rgb(var(--role-accent))] to-[rgb(var(--role-accent-light))]',
  overlay: 'to-[rgb(var(--role-accent)_/_0.06)]',
};

function getStatusMixBar(status: StatusMetric) {
  return statusMixClass[status.label] || `bg-gradient-to-r ${toneClass[status.tone].bar}`;
}

function getSlaClass(metric: string, helper: string) {
  const isSla = helper.toLowerCase().includes('sla');
  if (!isSla) return `${roleClass.cta} text-black`;

  const value = Number.parseFloat(metric);
  if (!Number.isFinite(value)) return 'border border-sky-400/30 bg-sky-400/10 text-sky-100';
  if (value >= 90) return 'border border-emerald-400/40 bg-emerald-400/15 text-emerald-100';
  if (value >= 85) return 'border border-amber-400/45 bg-amber-400/15 text-amber-100';
  return 'border border-red-400/45 bg-red-400/15 text-red-100';
}

function getSlaLabel(metric: string, helper: string) {
  const isSla = helper.toLowerCase().includes('sla');
  if (!isSla) return metric;

  const value = Number.parseFloat(metric);
  const health = Number.isFinite(value) && value >= 90 ? 'On track' : Number.isFinite(value) && value >= 85 ? 'Watch' : 'At risk';
  return `${metric} ${health}`;
}

function getSourceLabel(row: WorkRow) {
  if (row.sourceLabel) return row.sourceLabel.replace(/\s*Lead$/i, '');
  if (row.source === 'lead') return 'Website';
  if (row.source === 'quote') return 'Quote';
  return 'Manual';
}

function getModuleCountTooltip(item: ModuleItem, metric: string) {
  return `${metric} ${item.helper || item.label}`;
}

const roleThemes: Record<DashboardKind, RoleTheme> = {
  lqt: {
    accentRgb: '251 191 36',
    accentStrongRgb: '245 158 11',
    accentLightRgb: '103 232 249',
    pageRgb: '8 8 3',
    surfaceRgb: '19 15 5',
    surfaceAltRgb: '10 24 24',
    headerRgb: '28 21 6',
    sidebarRgb: '14 12 5',
    cardRgb: '18 16 8',
    innerRgb: '10 19 19',
    glowLeft: 'bg-amber-400/20',
    glowRight: 'bg-cyan-400/20',
  },
  sales: {
    accentRgb: '52 211 153',
    accentStrongRgb: '16 185 129',
    accentLightRgb: '190 242 100',
    pageRgb: '1 11 8',
    surfaceRgb: '3 22 17',
    surfaceAltRgb: '7 36 22',
    headerRgb: '6 42 28',
    sidebarRgb: '2 18 15',
    cardRgb: '5 28 19',
    innerRgb: '5 23 18',
    glowLeft: 'bg-emerald-400/20',
    glowRight: 'bg-lime-300/20',
  },
  procurement: {
    accentRgb: '56 189 248',
    accentStrongRgb: '14 165 233',
    accentLightRgb: '165 180 252',
    pageRgb: '4 7 18',
    surfaceRgb: '6 13 31',
    surfaceAltRgb: '7 24 43',
    headerRgb: '8 20 45',
    sidebarRgb: '5 10 27',
    cardRgb: '7 18 36',
    innerRgb: '6 15 31',
    glowLeft: 'bg-sky-400/20',
    glowRight: 'bg-indigo-400/20',
  },
  cct: {
    accentRgb: '251 191 36',
    accentStrongRgb: '245 158 11',
    accentLightRgb: '252 211 77',
    pageRgb: '10 8 3',
    surfaceRgb: '20 15 5',
    surfaceAltRgb: '33 23 7',
    headerRgb: '35 25 8',
    sidebarRgb: '16 12 4',
    cardRgb: '23 17 7',
    innerRgb: '14 11 5',
    glowLeft: 'bg-amber-400/25',
    glowRight: 'bg-yellow-300/20',
  },
  inventory: {
    accentRgb: '56 189 248',
    accentStrongRgb: '14 165 233',
    accentLightRgb: '165 243 252',
    pageRgb: '4 10 18',
    surfaceRgb: '6 18 30',
    surfaceAltRgb: '8 26 43',
    headerRgb: '8 23 41',
    sidebarRgb: '5 13 24',
    cardRgb: '7 22 34',
    innerRgb: '7 18 30',
    glowLeft: 'bg-sky-400/20',
    glowRight: 'bg-cyan-300/20',
  },
  dispatch: {
    accentRgb: '251 146 60',
    accentStrongRgb: '249 115 22',
    accentLightRgb: '253 186 116',
    pageRgb: '17 7 4',
    surfaceRgb: '30 12 7',
    surfaceAltRgb: '42 19 9',
    headerRgb: '43 19 10',
    sidebarRgb: '23 10 6',
    cardRgb: '31 14 8',
    innerRgb: '22 11 7',
    glowLeft: 'bg-orange-400/20',
    glowRight: 'bg-red-400/15',
  },
  finance: {
    accentRgb: '52 211 153',
    accentStrongRgb: '16 185 129',
    accentLightRgb: '134 239 172',
    pageRgb: '3 12 8',
    surfaceRgb: '4 20 14',
    surfaceAltRgb: '8 31 21',
    headerRgb: '8 34 23',
    sidebarRgb: '3 16 11',
    cardRgb: '6 25 17',
    innerRgb: '5 20 14',
    glowLeft: 'bg-emerald-400/20',
    glowRight: 'bg-lime-300/15',
  },
};

const configs: Record<DashboardKind, DashboardConfig> = {
  lqt: {
    title: 'LQT Inbox',
    eyebrow: 'Lead Qualification Team',
    route: '/lqt',
    roleLabel: 'LQT',
    theme: roleThemes.lqt,
    primaryColumn: 'Lead',
    detailColumn: 'Qualification Work',
    stats: [
      { label: 'New Leads', value: '38', helper: 'Waiting in the inbox', icon: UserCheck, tone: 'blue' },
      { label: 'Qualified', value: '18', helper: 'Ready for CRO review', icon: Target, tone: 'green' },
      { label: 'Need More Info', value: '9', helper: 'Awaiting clarification', icon: Phone, tone: 'gold' },
      { label: 'Assigned To Sales', value: '12', helper: 'Moved to CRO dashboard', icon: ArrowRight, tone: 'violet' },
    ],
    statuses: [
      { label: 'New', value: 12, tone: 'blue' },
      { label: 'Qualified', value: 18, tone: 'green' },
      { label: 'Need More Information', value: 9, tone: 'gold' },
      { label: 'Rejected', value: 4, tone: 'violet' },
      { label: 'Assigned To Sales', value: 12, tone: 'violet' },
    ],
    modules: [
      { key: 'overview', label: 'Dashboard Overview', icon: BarChart3, metric: '82%', helper: 'Qualification SLA' },
      { key: 'new-leads', label: 'LQT Inbox', icon: UserCheck, metric: '38', helper: 'Incoming enquiries' },
      { key: 'qualification', label: 'Verify Requirement', icon: CheckCircle2, metric: '31', helper: 'Requirement checks' },
      { key: 'lead-status', label: 'Validate Customer', icon: SlidersHorizontal, metric: '4', helper: 'Customer verification' },
      { key: 'sales-assignment', label: 'Assign Sales Person', icon: ArrowRight, metric: '12', helper: 'CRO handoffs' },
      { key: 'assigned-leads', label: 'Leads', icon: Users, metric: '24', helper: 'Assigned to CRO' },
      { key: 'lead-history', label: 'Customer', icon: History, metric: '120', helper: 'Customer timeline' },
      { key: 'follow-ups', label: 'Follow-Ups', icon: Phone, metric: '17', helper: 'Pending calls' },
      { key: 'call-notes', label: 'Call Notes', icon: MessageSquare, metric: '64', helper: 'Logged conversations' },
      { key: 'meeting-scheduling', label: 'Meeting Scheduling', icon: Calendar, metric: '6', helper: 'Booked meetings' },
    ],
    rows: [
      { account: 'Pioneer Infra', owner: 'Aarav', detail: 'Copper cathode, 12 MT', status: 'New', next: 'Verify requirement', value: 'High' },
      { account: 'Kavya Electricals', owner: 'Meera', detail: 'Aluminium ingots, monthly supply', status: 'Qualified', next: 'Validate customer profile', value: 'Medium' },
      { account: 'Northline Works', owner: 'Rohan', detail: 'Steel coils for fabrication', status: 'Need More Information', next: 'Request missing details', value: 'Low' },
      { account: 'Vertex Components', owner: 'Isha', detail: 'Brass rods, export inquiry', status: 'Assigned To Sales', next: 'Assign sales person', value: 'High' },
    ],
    activity: [
      'Pioneer Infra entered LQT inbox for verification',
      'Vertex Components assigned to CRO queue',
      'Kavya Electricals customer validation updated',
      'Northline Works requested more information',
    ],
    priorities: ['Verify requirement', 'Validate customer', 'Assign priority', 'Route to sales person'],
  },
  sales: {
    title: 'Sales Inbox',
    eyebrow: 'Sales Team',
    route: '/cro',
    roleLabel: 'Sales',
    theme: roleThemes.sales,
    primaryColumn: 'Lead',
    detailColumn: 'Sales Work',
    stats: [
      { label: 'Sales Inbox', value: '29', helper: 'New and active leads', icon: Users, tone: 'blue' },
      { label: 'Leads', value: '24', helper: 'Qualified pipeline', icon: Target, tone: 'gold' },
      { label: 'Customers', value: '14', helper: 'Customer contact underway', icon: Briefcase, tone: 'green' },
      { label: 'Orders', value: '5', helper: 'Awaiting confirmation', icon: Package, tone: 'violet' },
    ],
    statuses: [
      { label: 'New', value: 29, tone: 'blue' },
      { label: 'Pricing', value: 14, tone: 'gold' },
      { label: 'Negotiation', value: 8, tone: 'violet' },
      { label: 'Follow-Up', value: 6, tone: 'green' },
      { label: 'Won', value: 5, tone: 'green' },
      { label: 'Lost', value: 2, tone: 'red' },
    ],
    modules: [
      { key: 'overview', label: 'Dashboard Overview', icon: BarChart3, metric: '74%', helper: 'Sales workflow health' },
      { key: 'sales-inbox', label: 'Sales Inbox', icon: UserCheck, metric: '29', helper: 'New qualified items' },
      { key: 'leads', label: 'Leads', icon: Users, metric: '29', helper: 'Active pipeline' },
      { key: 'customers', label: 'Customers', icon: Briefcase, metric: '46', helper: 'Contacted customers' },
      { key: 'orders', label: 'Orders', icon: Package, metric: '5', helper: 'Confirmation stage' },
      { key: 'tasks', label: 'Tasks', icon: CheckCircle2, metric: '21', helper: 'Follow-ups and actions' },
      { key: 'communication', label: 'Communication', icon: MessageSquare, metric: '32', helper: 'Calls and messages' },
      { key: 'quotation-management', label: 'Quotation', icon: FileText, metric: '9', helper: 'Pricing shared' },
      { key: 'negotiation-tracking', label: 'Negotiation', icon: TrendingUp, metric: '8', helper: 'Commercial negotiation' },
      { key: 'lead-conversion', label: 'Order Confirmation', icon: Target, metric: '18%', helper: 'Lead to order' },
    ],
    rows: [
      { account: 'Vertex Components', owner: 'Nikhil', detail: 'Quotation revision for brass rods', status: 'Negotiation', next: 'Customer contact today', value: 'Rs 18.4L' },
      { account: 'Pioneer Infra', owner: 'Ritu', detail: 'Customer contact for copper cathode', status: 'Pricing', next: 'Share quotation', value: 'Rs 42L' },
      { account: 'Apex Rail Systems', owner: 'Kabir', detail: 'Order confirmation for steel coils', status: 'Won', next: 'Send order confirmation', value: 'Rs 27L' },
      { account: 'Kavya Electricals', owner: 'Nikhil', detail: 'Pending follow-up and document review', status: 'Follow-Up', next: 'Call back today', value: 'Rs 9.8L' },
    ],
    activity: [
      'Vertex Components moved into negotiation',
      'Apex Rail Systems order confirmation recorded',
      'Pioneer Infra quotation sent after customer contact',
      'Kavya Electricals follow-up scheduled',
    ],
    priorities: ['Customer contact', 'Send quotation', 'Track negotiation', 'Confirm orders'],
  },
  procurement: {
    title: 'Procurement Queue',
    eyebrow: 'Procurement Team',
    route: '/procurement',
    roleLabel: 'Procurement',
    theme: roleThemes.procurement,
    primaryColumn: 'Supplier',
    detailColumn: 'Sourcing Work',
    stats: [
      { label: 'Sales Orders', value: '24', helper: 'Waiting for procurement pricing', icon: ClipboardList, tone: 'blue' },
      { label: 'Awaiting Price', value: '18', helper: 'RFQ response pending', icon: Clock, tone: 'gold' },
      { label: 'Supplier Quotations', value: '13', helper: 'Vendor offers received', icon: FileText, tone: 'violet' },
      { label: 'Purchase Orders', value: '11', helper: 'Ready for release', icon: Package, tone: 'green' },
    ],
    statuses: [
      { label: 'Sales Order', value: 24, tone: 'blue' },
      { label: 'Awaiting Price', value: 18, tone: 'gold' },
      { label: 'RFQ', value: 15, tone: 'blue' },
      { label: 'Supplier Quotation', value: 13, tone: 'violet' },
      { label: 'Final Cost', value: 8, tone: 'gold' },
      { label: 'Purchase Order', value: 11, tone: 'green' },
    ],
    modules: [
      { key: 'overview', label: 'Procurement Queue', icon: BarChart3, metric: '91%', helper: 'Sourcing coverage' },
      { key: 'procurement-queue', label: 'Procurement Queue', icon: ClipboardList, metric: '24', helper: 'Sales orders awaiting price' },
      { key: 'rfqs', label: 'RFQs', icon: Mail, metric: '18', helper: 'Vendor requests live' },
      { key: 'supplier-quotations', label: 'Supplier Quotations', icon: FileText, metric: '13', helper: 'Quotes received' },
      { key: 'approved-suppliers', label: 'Approved Suppliers', icon: Truck, metric: '54', helper: 'Vendor panel' },
      { key: 'pricing-intelligence', label: 'Pricing Intelligence', icon: TrendingUp, metric: '96%', helper: 'Cost trend insights' },
      { key: 'purchase-orders', label: 'Purchase Orders', icon: Package, metric: '11', helper: 'POs ready' },
    ],
    rows: [
      { account: 'Pioneer Infra', owner: 'Ananya', detail: 'Sales order awaiting procurement pricing', status: 'Sales Order', next: 'Create RFQ', value: '₹42L' },
      { account: 'Bharat Alloys', owner: 'Dev', detail: 'RFQ issued to approved suppliers', status: 'RFQ', next: 'Await vendor quotation', value: '3 vendors' },
      { account: 'Global Ferro', owner: 'Ananya', detail: 'Supplier quotations under review', status: 'Supplier Quotation', next: 'Lock final cost', value: '-4.6%' },
      { account: 'Metalink Exports', owner: 'Kabir', detail: 'Final cost ready for PO release', status: 'Final Cost', next: 'Generate purchase order', value: '+1.8%' },
    ],
    activity: [
      'Pioneer Infra sales order moved into procurement queue',
      'Bharat Alloys RFQ circulated to approved suppliers',
      'Global Ferro supplier quotation under review',
      'Metalink Exports purchase order pending release',
    ],
    priorities: ['Raise RFQs from sales orders', 'Track supplier quotations', 'Lock final cost before release', 'Issue purchase orders'],
    responsibilities: ['Product Pricing', 'Vendor Selection', 'RFQ Management', 'Supplier Negotiation'],
    workflow: ['Sales Order', 'Awaiting Price', 'RFQ', 'Supplier Quotation', 'Final Cost', 'Purchase Order'],
    playbook:
      'Sales order comes in first, the team checks approved suppliers and pricing intelligence, then issues RFQs, reviews quotations, locks the final cost, and releases the purchase order.',
  },
  cct: {
    title: 'CCT Control Room',
    eyebrow: 'Commercial Control Tower',
    route: '/cct',
    roleLabel: 'CCT',
    theme: roleThemes.cct,
    primaryColumn: 'Commercial Case',
    detailColumn: 'Decision Logic',
    stats: [
      { label: 'Margin Reviews', value: '16', helper: 'Profit gate checks', icon: TrendingUp, tone: 'gold' },
      { label: 'Target Price Reviews', value: '9', helper: 'Commercial ceiling checks', icon: Target, tone: 'red' },
      { label: 'Commercial Approvals', value: '11', helper: 'Approve or hold decisions', icon: ShieldCheck, tone: 'green' },
      { label: 'Sourcing Decisions', value: '4', helper: 'Route to procurement or hold', icon: Activity, tone: 'violet' },
    ],
    statuses: [
      { label: 'Pending', value: 16, tone: 'gold' },
      { label: 'Reviewed', value: 11, tone: 'green' },
      { label: 'On Hold', value: 5, tone: 'blue' },
      { label: 'Approved', value: 4, tone: 'green' },
    ],
    modules: [
      { key: 'overview', label: 'Commercial Control Tower', icon: BarChart3, metric: '83%', helper: 'Approval SLA' },
      { key: 'approval-queue', label: 'Approval Queue', icon: ClipboardList, metric: '16', helper: 'Pending commercial review' },
      { key: 'margin-review', label: 'Margin Review', icon: TrendingUp, metric: '9', helper: 'Protect profit before release' },
      { key: 'cost-review', label: 'Cost Review', icon: FileText, metric: '12', helper: 'Input cost validation' },
      { key: 'target-price-review', label: 'Target Price Review', icon: Target, metric: '8', helper: 'Target price governance' },
      { key: 'commercial-approval', label: 'Commercial Approval', icon: ShieldCheck, metric: '11', helper: 'Approve next process' },
      { key: 'pricing-approval', label: 'Pricing Approval', icon: CheckCircle2, metric: '14', helper: 'Price sign-off' },
      { key: 'sourcing-approval', label: 'Sourcing Decision', icon: Truck, metric: '6', helper: 'Release to procurement or hold' },
      { key: 'approval-history', label: 'Approval History', icon: History, metric: '41', helper: 'Decision history' },
    ],
    rows: [
      { account: 'Pioneer Infra', owner: 'Neha', detail: 'Sales price 10,000 vs procurement cost 8,500', status: 'Pending', next: 'Approve next process', value: 'Margin 1,500' },
      { account: 'Vertex Components', owner: 'Aarav', detail: 'Margin review on brass rods pricing', status: 'Reviewed', next: 'Release to procurement', value: '15.0%' },
      { account: 'Apex Rail Systems', owner: 'Isha', detail: 'Target price review for steel coils', status: 'On Hold', next: 'Request supplier support', value: '₹27L' },
      { account: 'Kavya Electricals', owner: 'Rohan', detail: 'Sourcing decision on payment-linked release', status: 'Approved', next: 'Pass to procurement', value: 'Approved' },
    ],
    activity: [
      'Pioneer Infra commercial case reviewed for margin and next process',
      'Vertex Components margin check completed and approved',
      'Apex Rail Systems target price escalated for review',
      'Kavya Electricals sourcing decision passed to procurement',
    ],
    priorities: ['Review margin first', 'Validate target price', 'Approve or hold sourcing', 'Document commercial decisions'],
    responsibilities: ['Margin Review', 'Target Price Review', 'Sourcing Decision', 'Commercial Approval'],
    workflow: ['Sales Price', 'Procurement Cost', 'Margin Check', 'Decision'],
    playbook:
      'The Control Tower sits between Sales and Procurement: compare sales price against procurement cost, confirm the margin, then approve the next process or hold it for review.',
    decisionExample: {
      salesPrice: '10,000',
      procurementCost: '8,500',
      margin: '1,500',
      decision: 'Approve next process',
    },
  },
  inventory: {
    title: 'Inventory Dashboard',
    eyebrow: 'Stock Control Team',
    route: '/inventory',
    roleLabel: 'Inventory',
    theme: roleThemes.inventory,
    primaryColumn: 'Warehouse',
    detailColumn: 'Inventory Work',
    stats: [
      { label: 'Stock on Hand', value: '1.8K', helper: 'Across all warehouses', icon: Package, tone: 'blue' },
      { label: 'GRNs', value: '22', helper: 'Goods receipts posted', icon: ClipboardList, tone: 'gold' },
      { label: 'Transfers', value: '9', helper: 'Warehouse movements', icon: ArrowRight, tone: 'green' },
      { label: 'Alerts', value: '5', helper: 'Stock or batch warnings', icon: Activity, tone: 'red' },
    ],
    statuses: [
      { label: 'In Stock', value: 34, tone: 'green' },
      { label: 'Low Stock', value: 8, tone: 'gold' },
      { label: 'In Transit', value: 9, tone: 'blue' },
      { label: 'Blocked', value: 5, tone: 'red' },
    ],
    modules: [
      { key: 'overview', label: 'Dashboard Overview', icon: BarChart3, metric: '96%', helper: 'Inventory accuracy' },
      { key: 'inventory-dashboard', label: 'Inventory Dashboard', icon: Package, metric: '1.8K', helper: 'Stock snapshot' },
      { key: 'warehouses', label: 'Warehouses', icon: Database, metric: '6', helper: 'Active warehouses' },
      { key: 'stock', label: 'Stock Control', icon: SlidersHorizontal, metric: '34', helper: 'Stock movements' },
      { key: 'grn', label: 'GRN', icon: ClipboardList, metric: '22', helper: 'Receipts posted' },
      { key: 'transfers', label: 'Transfers', icon: ArrowRight, metric: '9', helper: 'Warehouse transfers' },
      { key: 'alerts', label: 'Alerts', icon: Activity, metric: '5', helper: 'Warnings and holds' },
      { key: 'batch-tracking', label: 'Batch Tracking', icon: History, metric: '18', helper: 'Batch history' },
      { key: 'inventory-reports', label: 'Inventory Reports', icon: FileSpreadsheet, metric: '12', helper: 'Report exports' },
    ],
    rows: [
      { account: 'Warehouse A', owner: 'Anika', detail: 'Copper cathode batch received', status: 'In Stock', next: 'Post GRN', value: '320 MT' },
      { account: 'Warehouse B', owner: 'Kabir', detail: 'Steel coil transfer pending', status: 'In Transit', next: 'Confirm receipt', value: '48 MT' },
      { account: 'Central Yard', owner: 'Meera', detail: 'Brass rods low stock alert', status: 'Low Stock', next: 'Trigger reorder', value: '12 MT' },
      { account: 'Dispatch Hold', owner: 'Rohan', detail: 'Batch blocked for quality check', status: 'Blocked', next: 'Resolve hold', value: 'High' },
    ],
    activity: [
      'Warehouse A GRN posted for copper cathode',
      'Warehouse B transfer updated',
      'Brass rods low stock alert created',
      'Batch hold escalated to quality review',
    ],
    priorities: ['Post pending GRNs', 'Resolve low stock alerts', 'Complete warehouse transfers', 'Review blocked batches'],
  },
  dispatch: {
    title: 'Dispatch Team Control',
    eyebrow: 'Dispatch Team',
    route: '/dispatch',
    roleLabel: 'Dispatch',
    theme: roleThemes.dispatch,
    primaryColumn: 'Shipment',
    detailColumn: 'Dispatch Workflow',
    stats: [
      { label: 'Order Ready', value: '14', helper: 'Ready for packaging', icon: ClipboardList, tone: 'blue' },
      { label: 'Packaging', value: '11', helper: 'Packed and labeled', icon: Package, tone: 'gold' },
      { label: 'Dispatch', value: '7', helper: 'Courier or vehicle assigned', icon: Truck, tone: 'violet' },
      { label: 'Delivered', value: '26', helper: 'Completed deliveries', icon: CheckCircle2, tone: 'green' },
    ],
    statuses: [
      { label: 'Order Ready', value: 14, tone: 'blue' },
      { label: 'Packaging', value: 11, tone: 'gold' },
      { label: 'Dispatch', value: 9, tone: 'violet' },
      { label: 'Tracking', value: 8, tone: 'blue' },
      { label: 'Delivered', value: 26, tone: 'green' },
    ],
    modules: [
      { key: 'overview', label: 'Dispatch Team', icon: BarChart3, metric: '91%', helper: 'Dispatch readiness' },
      { key: 'dispatch-dashboard', label: 'Dispatch', icon: Truck, metric: '14', helper: 'Shipments ready' },
      { key: 'logistics', label: 'Logistics', icon: Activity, metric: '18', helper: 'Routing and lane control' },
      { key: 'courier-tracking', label: 'Courier Tracking', icon: Globe2, metric: '9', helper: 'Live shipment tracking' },
      { key: 'packaging', label: 'Packaging', icon: Package, metric: '11', helper: 'Packed orders' },
      { key: 'vehicle-assignment', label: 'Vehicle Assignment', icon: Users, metric: '7', helper: 'Routes assigned' },
      { key: 'tracking', label: 'Tracking', icon: Globe2, metric: '9', helper: 'Live transit updates' },
      { key: 'pod-upload', label: 'POD Upload', icon: FileText, metric: '6', helper: 'Pending proofs' },
      { key: 'delivery-reports', label: 'Delivery Reports', icon: FileSpreadsheet, metric: '10', helper: 'Completed shipments' },
    ],
    rows: [
      { account: 'Apex Rail Systems', owner: 'Rahul', detail: 'Steel coils ready for packaging', status: 'Order Ready', next: 'Start packaging', value: '2 pallets' },
      { account: 'Pioneer Infra', owner: 'Anita', detail: 'Copper cathode packaging in progress', status: 'Packaging', next: 'Assign courier', value: 'Truck A' },
      { account: 'Vertex Components', owner: 'Kabir', detail: 'Courier tracking active', status: 'Tracking', next: 'Confirm POD', value: 'Due today' },
      { account: 'Kavya Electricals', owner: 'Meera', detail: 'Delivered and awaiting closeout', status: 'Delivered', next: 'Share report', value: 'Complete' },
    ],
    activity: [
      'Apex Rail Systems moved from order ready to packaging',
      'Pioneer Infra courier assigned for dispatch',
      'Vertex Components tracking link shared',
      'Kavya Electricals delivery report generated',
    ],
    priorities: ['Move orders into packaging', 'Assign courier or vehicle', 'Track live shipment status', 'Close delivered orders'],
    responsibilities: ['Dispatch Coordination', 'Packaging Control', 'Courier Tracking', 'Logistics Oversight'],
    workflow: [...dispatchWorkflowStages],
    playbook:
      'Dispatch starts when the order is ready, moves into packaging, then goes out through dispatch and live courier tracking until delivery is confirmed.',
  },
  finance: {
    title: 'Finance Dashboard',
    eyebrow: 'Accounts & Collections',
    route: '/finance',
    roleLabel: 'Finance',
    theme: roleThemes.finance,
    primaryColumn: 'Invoice',
    detailColumn: 'Finance Work',
    stats: [
      { label: 'Invoices', value: '18', helper: 'Ready or issued', icon: FileText, tone: 'blue' },
      { label: 'Collections', value: '12', helper: 'Payments received', icon: ClipboardList, tone: 'green' },
      { label: 'Receivables', value: '7', helper: 'Outstanding balances', icon: Mail, tone: 'gold' },
      { label: 'Margin Review', value: '4', helper: 'Profit checks pending', icon: TrendingUp, tone: 'violet' },
    ],
    statuses: [
      { label: 'Pending', value: 18, tone: 'gold' },
      { label: 'Issued', value: 12, tone: 'blue' },
      { label: 'Part Paid', value: 7, tone: 'red' },
      { label: 'Cleared', value: 22, tone: 'green' },
    ],
    modules: [
      { key: 'overview', label: 'Dashboard Overview', icon: BarChart3, metric: '88%', helper: 'Collection health' },
      { key: 'invoice-queue', label: 'Invoice Queue', icon: FileText, metric: '18', helper: 'Pending invoices' },
      { key: 'payments', label: 'Payments', icon: ClipboardList, metric: '12', helper: 'Received / due' },
      { key: 'receivables', label: 'Receivables', icon: Mail, metric: '7', helper: 'Outstanding balances' },
      { key: 'accounts', label: 'Accounts', icon: Users, metric: '9', helper: 'Account closure' },
      { key: 'finance-reports', label: 'Finance Reports', icon: FileSpreadsheet, metric: '10', helper: 'Report exports' },
      { key: 'profit-analysis', label: 'Profit Analysis', icon: TrendingUp, metric: '4', helper: 'Margin insight' },
      { key: 'margin-analysis', label: 'Margin Analysis', icon: Target, metric: '6', helper: 'Margin review' },
    ],
    rows: [
      { account: 'Pioneer Infra', owner: 'Anika', detail: 'Invoice pending release', status: 'Pending', next: 'Issue invoice', value: '₹42L' },
      { account: 'Vertex Components', owner: 'Meera', detail: 'Payment received partially', status: 'Part Paid', next: 'Collect balance', value: '₹18L' },
      { account: 'Apex Rail Systems', owner: 'Rohan', detail: 'Receivable overdue by 4 days', status: 'Issued', next: 'Reminder call', value: '₹27L' },
      { account: 'Kavya Electricals', owner: 'Kabir', detail: 'Invoice closed and matched', status: 'Cleared', next: 'Update ledger', value: 'Done' },
    ],
    activity: [
      'Invoice queue updated for Pioneer Infra',
      'Vertex Components payment partially cleared',
      'Apex Rail Systems receivable reminder logged',
      'Kavya Electricals ledger update completed',
    ],
    priorities: ['Issue pending invoices', 'Collect receivables', 'Review margin analysis', 'Close cleared accounts'],
  },
};

function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border ${roleClass.border} ${roleClass.surface} p-4 shadow-glow ${className}`}>
      {children}
    </section>
  );
}

function StatCard({ stat }: { stat: Metric }) {
  const Icon = stat.icon;
  return (
    <article className={`relative min-h-[132px] overflow-hidden rounded-2xl border ${roleClass.borderSoft} ${roleClass.card} p-4 shadow-glow`}>
      <div className={`absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent ${roleClass.overlay}`} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">{stat.label}</p>
          <p className="mt-3 text-3xl font-extrabold text-white">{stat.value}</p>
          <p className="mt-1 text-xs font-medium text-zinc-300">{stat.helper}</p>
        </div>
        <span className={`rounded-2xl p-3 ring-1 ${toneClass[stat.tone].icon}`}>
          <Icon size={20} />
        </span>
      </div>
    </article>
  );
}

function StatusChip({ status }: { status: string }) {
  const tone: Tone =
    status === 'Hot' || status === 'At Risk' || status === 'Rejected' || status === 'Lost'
      ? 'red'
      : status === 'Warm' || status === 'RFQ' || status === 'Requested' || status === 'Awaiting Price' || status === 'Need More Information' || status === 'Pricing' || status === 'Final Cost' || status === 'Packaging'
        ? 'gold'
        : status === 'Approved' || status === 'Order' || status === 'Qualified' || status === 'Assigned To Sales' || status === 'New' || status === 'Follow-Up' || status === 'Won' || status === 'Purchase Order' || status === 'Sales Order' || status === 'Order Ready' || status === 'Delivered'
          ? 'green'
        : status === 'Negotiation' || status === 'Supplier Quotation' || status === 'Dispatch'
            ? 'violet'
            : 'blue';
  return <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClass[tone].chip}`}>{status}</span>;
}

function QueueModeControl({
  queueMode,
  setQueueMode,
}: {
  queueMode: 'open' | 'due' | 'closed';
  setQueueMode: (mode: 'open' | 'due' | 'closed') => void;
}) {
  return (
    <div className={`inline-flex rounded-xl border ${roleClass.borderSoft} ${roleClass.inner} p-1`}>
      {(['open', 'due', 'closed'] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => setQueueMode(mode)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${
            queueMode === mode ? `${roleClass.cta} text-black` : 'text-zinc-400 hover:text-white'
          }`}
        >
          {mode}
        </button>
      ))}
    </div>
  );
}

function WorkTable({
  config,
  rows,
  onOpenForm,
}: {
  config: DashboardConfig;
  rows: WorkRow[];
  onOpenForm?: (row: WorkRow) => void;
}) {
  const showSourceColumn = rows.some((row) => row.source || row.sourceLabel);
  return (
    <div className={`overflow-x-auto rounded-2xl border ${roleClass.borderSoft} ${roleClass.inner}`}>
      <table className="w-full min-w-[860px] text-sm">
        <thead className={`border-b ${roleClass.borderSoft} text-left text-xs uppercase tracking-[0.14em] text-zinc-400`}>
          <tr>
            <th className="px-4 py-3">{config.primaryColumn}</th>
            {showSourceColumn ? <th className="px-4 py-3">Source</th> : null}
            <th className="px-4 py-3">Owner</th>
            <th className="px-4 py-3">{config.detailColumn}</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Next Step</th>
            <th className="px-4 py-3">Value</th>
            {onOpenForm ? <th className="px-4 py-3">Action</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id || `${row.account}-${row.detail}`} className={`border-t ${roleClass.borderSoft}`}>
              <td className="px-4 py-3 font-semibold text-white">
                <span>{row.account}</span>
              </td>
              {showSourceColumn ? (
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-400/10 px-2.5 py-1 text-xs font-semibold text-sky-100">
                    <Globe2 size={13} />
                    {getSourceLabel(row)}
                  </span>
                </td>
              ) : null}
              <td className="px-4 py-3 text-zinc-300">{row.owner}</td>
              <td className="px-4 py-3 text-zinc-400">{row.detail}</td>
              <td className="px-4 py-3">
                <StatusChip status={row.status} />
              </td>
              <td className="px-4 py-3 text-zinc-300">{row.next}</td>
              <td className={`px-4 py-3 font-semibold ${roleClass.text}`}>{row.value}</td>
              {onOpenForm ? (
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onOpenForm(row)}
                    className={`inline-flex items-center gap-1.5 rounded-lg ${roleClass.cta} px-3 py-2 text-xs font-extrabold text-black shadow-glow hover:brightness-110`}
                  >
                    Open
                    <ArrowRight size={13} />
                  </button>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length ? (
        <div className="p-8 text-center">
          <p className="font-display text-xl text-white">No matching records</p>
          <p className="mt-2 text-sm text-zinc-500">Try a different customer, owner, status, or material.</p>
        </div>
      ) : null}
    </div>
  );
}

function SideRail({
  config,
  statusTotal,
}: {
  config: DashboardConfig;
  statusTotal: number;
}) {
  return (
    <aside className="space-y-5">
      {config.decisionExample ? (
        <Panel>
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Decision Example</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className={`rounded-2xl border ${roleClass.borderSoft} ${roleClass.inner} p-3`}>
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Sales Price</p>
              <p className="mt-2 font-display text-2xl text-white">{config.decisionExample.salesPrice}</p>
            </div>
            <div className={`rounded-2xl border ${roleClass.borderSoft} ${roleClass.inner} p-3`}>
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Procurement Cost</p>
              <p className="mt-2 font-display text-2xl text-white">{config.decisionExample.procurementCost}</p>
            </div>
            <div className={`rounded-2xl border ${roleClass.borderSoft} ${roleClass.inner} p-3`}>
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Margin</p>
              <p className={`mt-2 font-display text-2xl ${roleClass.text}`}>{config.decisionExample.margin}</p>
            </div>
            <div className={`rounded-2xl border ${roleClass.borderSoft} ${roleClass.bgSoft} p-3`}>
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Decision</p>
              <p className="mt-2 text-sm font-semibold text-white">{config.decisionExample.decision}</p>
            </div>
          </div>
        </Panel>
      ) : null}

      {config.responsibilities?.length ? (
        <Panel>
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Team Responsibilities</p>
          <div className="mt-4 grid gap-2">
            {config.responsibilities.map((item, index) => (
              <div key={item} className={`flex items-center gap-3 rounded-xl border ${roleClass.borderSoft} ${roleClass.inner} px-3 py-2`}>
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border ${roleClass.border} ${roleClass.bgSoft} text-xs font-bold ${roleClass.text}`}>
                  {index + 1}
                </span>
                <span className="text-sm text-zinc-300">{item}</span>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}

      {config.workflow?.length ? (
        <Panel>
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Workflow</p>
          <div className="mt-4 space-y-3">
            {config.workflow.map((step, index) => (
              <div key={step} className="relative pl-8">
                <span className={`absolute left-0 top-0 grid h-5 w-5 place-items-center rounded-full border ${roleClass.borderStrong} ${roleClass.bgSoft} text-[10px] font-bold ${roleClass.text}`}>
                  {index + 1}
                </span>
                <p className="font-semibold text-white">{step}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {index === 0
                    ? 'Start with the incoming sales order.'
                    : index === 1
                      ? 'Check target cost and approved supplier options.'
                      : index === 2
                        ? 'Send RFQ to selected vendors.'
                        : index === 3
                          ? 'Review commercial offers and terms.'
                          : index === 4
                            ? 'Lock the final landed cost.'
                            : 'Release purchase order and confirm supply.'}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}

      {config.playbook ? (
        <Panel>
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">How Work Moves</p>
          <p className="mt-3 text-sm leading-6 text-zinc-300">{config.playbook}</p>
        </Panel>
      ) : null}

      <Panel>
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Status Mix</p>
        <div className="mt-4 space-y-3">
          {config.statuses.map((status) => {
            const width = statusTotal ? Math.max((status.value / statusTotal) * 100, 6) : 0;
            return (
              <div key={status.label}>
                <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-zinc-300">{status.label}</span>
                  <span className="font-semibold text-white">{status.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                  <div className={`h-full rounded-full ${getStatusMixBar(status)}`} style={{ width: `${width}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel>
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Priority Stack</p>
        <div className="mt-4 space-y-2">
          {config.priorities.map((item, index) => (
            <div key={item} className={`flex items-center gap-3 rounded-xl border ${roleClass.borderSoft} ${roleClass.inner} px-3 py-2`}>
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border ${roleClass.border} ${roleClass.bgSoft} text-xs font-bold ${roleClass.text}`}>
                {index + 1}
              </span>
              <span className="text-sm text-zinc-300">{item}</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Recent Activity</p>
        <div className="mt-4 space-y-3">
          {config.activity.map((item) => (
            <div key={item} className={`flex gap-3 rounded-xl border ${roleClass.borderSoft} ${roleClass.inner} p-3`}>
              <Activity size={16} className={`mt-0.5 shrink-0 ${roleClass.text}`} />
              <p className="text-sm leading-5 text-zinc-300">{item}</p>
            </div>
          ))}
        </div>
      </Panel>
    </aside>
  );
}

function OverviewWorkspace({ config, filteredRows, queueMode, setQueueMode, selectedModule, statusTotal, onOpenForm }: WorkspaceProps) {
  const queueTitle = selectedModule.key === 'overview' ? 'Active Work Queue' : selectedModule.label;
  return (
    <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
      <Panel>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Work Queue</p>
            <h3 className="mt-1 font-display text-2xl text-white">{queueTitle}</h3>
            {config.playbook ? <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">{config.playbook}</p> : null}
            {config.decisionExample ? (
              <p className="mt-2 text-sm text-zinc-400">
                Example decision: sales price {config.decisionExample.salesPrice}, procurement cost {config.decisionExample.procurementCost}, margin {config.decisionExample.margin}, so the next process is {config.decisionExample.decision.toLowerCase()}.
              </p>
            ) : null}
          </div>
          <QueueModeControl queueMode={queueMode} setQueueMode={setQueueMode} />
        </div>
        <div className="mt-4">
          <WorkTable config={config} rows={filteredRows} onOpenForm={onOpenForm} />
        </div>
      </Panel>
      <SideRail config={config} statusTotal={statusTotal} />
    </div>
  );
}

function IntakeWorkspace({ kind, filteredRows, selectedModule, actionBusy, onOpenForm, onOpenNewForm }: WorkspaceProps) {
  const fields =
    kind === 'procurement'
      ? ['Sales order ref', 'Material category', 'Target cost', 'Preferred supplier']
      : kind === 'sales'
        ? ['Customer name', 'Industry', 'Buying cycle', 'Credit profile']
        : ['Lead source', 'Material need', 'Budget range', 'Decision maker'];

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <Panel>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{kind === 'procurement' ? 'Procurement Intake' : 'Intake Desk'}</p>
            <h3 className="mt-1 font-display text-2xl text-white">{selectedModule.label}</h3>
          </div>
          <span className={`rounded-full border ${roleClass.border} ${roleClass.bgSoft} px-3 py-1 text-xs ${roleClass.textSoft}`}>
            {kind === 'procurement' ? 'Sales order intake' : 'Fresh queue'}
          </span>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {filteredRows.map((row) => (
            <article key={row.account} className={`rounded-2xl border ${roleClass.borderSoft} ${roleClass.card} p-4`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{row.account}</p>
                  {row.sourceLabel ? (
                    <p className="mt-1 w-fit rounded-full border border-sky-400/30 bg-sky-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-200">
                      {row.sourceLabel}
                    </p>
                  ) : null}
                  <p className="mt-1 text-sm text-zinc-400">{row.detail}</p>
                </div>
                <StatusChip status={row.status} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <span className={`rounded-xl border ${roleClass.borderSoft} ${roleClass.inner} px-3 py-2 text-zinc-400`}>Owner: {row.owner}</span>
                <span className={`rounded-xl border ${roleClass.borderSoft} ${roleClass.inner} px-3 py-2 text-zinc-400`}>
                  {kind === 'procurement' ? 'Cost: ' : 'Priority: '}
                  {row.value}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={actionBusy}
                  onClick={() => onOpenForm(row)}
                  className={`inline-flex items-center gap-2 rounded-xl ${roleClass.cta} px-3 py-2 text-xs font-bold text-black disabled:opacity-60`}
                >
                  Open Lead
                  <ArrowRight size={14} />
                </button>
                {row.phone ? (
                  <a href={`tel:${row.phone}`} className={`inline-flex items-center gap-1 rounded-xl border ${roleClass.border} ${roleClass.bgSoft} px-3 py-2 text-xs ${roleClass.text}`}>
                    <Phone size={13} /> Call
                  </a>
                ) : null}
                {row.whatsappNumber || row.phone ? (
                  <a
                    href={`https://wa.me/${(row.whatsappNumber || row.phone || '').replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-1 rounded-xl border ${roleClass.border} ${roleClass.bgSoft} px-3 py-2 text-xs ${roleClass.text}`}
                  >
                    <MessageSquare size={13} /> WhatsApp
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </Panel>

      <Panel>
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Quick Capture</p>
        <div className="mt-4 space-y-3">
          {fields.map((field) => (
            <div key={field} className={`rounded-xl border ${roleClass.borderSoft} ${roleClass.inner} px-3 py-2 text-sm text-zinc-400`}>
              {field}
            </div>
          ))}
          <button
            type="button"
            disabled={actionBusy || kind === 'lqt'}
            onClick={onOpenNewForm}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border ${roleClass.border} ${roleClass.bgSoft} px-3 py-2 text-sm font-semibold ${roleClass.text} disabled:opacity-60`}
          >
            {kind === 'lqt' ? 'Open an assigned lead' : kind === 'procurement' ? 'Open procurement record' : 'Open Validated Form'}
            <CheckCircle2 size={15} />
          </button>
        </div>
      </Panel>
    </div>
  );
}

function AssignmentWorkspace({ config, filteredRows, selectedModule, onOpenForm }: WorkspaceProps) {
  const owners = Array.from(new Set(filteredRows.map((row) => row.owner)));
  return (
    <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
      <Panel>
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Team Load</p>
        <h3 className="mt-1 font-display text-2xl text-white">{selectedModule.label}</h3>
        <div className="mt-5 space-y-3">
          {owners.map((owner, index) => (
            <div key={owner} className={`rounded-2xl border ${roleClass.borderSoft} ${roleClass.inner} p-4`}>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-white">{owner}</p>
                <span className={`rounded-full border ${roleClass.border} ${roleClass.bgSoft} px-2 py-1 text-xs ${roleClass.text}`}>
                  {index + 4} active
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
                <div className={`h-full rounded-full bg-gradient-to-r ${roleClass.gradientBar}`} style={{ width: `${60 + index * 8}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel>
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Assignment Board</p>
        <div className="mt-4">
          <WorkTable config={config} rows={filteredRows} onOpenForm={onOpenForm} />
        </div>
      </Panel>
    </div>
  );
}

function ScorecardWorkspace({ filteredRows, selectedModule, actionBusy, onRowAction }: WorkspaceProps) {
  const checks =
    selectedModule.key === 'pricing-intelligence'
      ? ['Compare supplier rates', 'Check freight impact', 'Assess payment terms', 'Lock final cost']
      : selectedModule.key === 'cost-analysis'
      ? ['Base rate verified', 'Freight captured', 'Payment terms compared', 'Margin impact checked']
      : selectedModule.key === 'lead-conversion'
        ? ['Customer contacted', 'Quotation sent', 'Negotiation complete', 'Order confirmed']
        : ['Need verified', 'Authority confirmed', 'Budget discussed', 'Timeline captured'];

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
      <Panel>
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
          {selectedModule.key === 'lead-conversion' ? 'Order Confirmation Workspace' : selectedModule.key === 'pricing-intelligence' ? 'Pricing Intelligence Workspace' : 'Scoring Workspace'}
        </p>
        <h3 className="mt-1 font-display text-2xl text-white">{selectedModule.label}</h3>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {filteredRows.map((row, rowIndex) => (
            <article key={row.account} className={`rounded-2xl border ${roleClass.borderSoft} ${roleClass.card} p-4`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{row.account}</p>
                  <p className="mt-1 text-sm text-zinc-400">{row.detail}</p>
                </div>
                <span className={`text-2xl font-black ${roleClass.text}`}>{82 - rowIndex * 9}</span>
              </div>
              <div className="mt-4 space-y-2">
                {checks.map((check, index) => (
                  <div key={check} className="flex items-center gap-2 text-sm text-zinc-300">
                    <CheckCircle2 size={15} className={index <= rowIndex ? 'text-emerald-300' : 'text-zinc-600'} />
                    {check}
                  </div>
                ))}
              </div>
              <button
                type="button"
                disabled={actionBusy}
                onClick={() => onRowAction(row, 'score')}
                className={`mt-4 rounded-xl border ${roleClass.border} ${roleClass.bgSoft} px-3 py-2 text-xs font-semibold ${roleClass.text} disabled:opacity-60`}
              >
                Save Score
              </button>
            </article>
          ))}
        </div>
      </Panel>

      <Panel>
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Decision Rules</p>
        <div className="mt-4 space-y-3">
          {['80+ route forward', '60-79 needs follow-up', 'Below 60 hold or reject'].map((rule, index) => (
            <div key={rule} className={`rounded-2xl border ${roleClass.borderSoft} ${roleClass.inner} p-4`}>
              <p className="text-sm font-semibold text-white">{rule}</p>
              <p className="mt-1 text-xs text-zinc-500">Rule {index + 1} in the current workflow.</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function BoardWorkspace({ config, filteredRows, selectedModule, actionBusy, onRowAction }: WorkspaceProps) {
  return (
    <Panel>
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Pipeline Board</p>
      <h3 className="mt-1 font-display text-2xl text-white">{selectedModule.label}</h3>
      <div className="mt-5 grid gap-3 lg:grid-cols-4">
        {config.statuses.map((status) => {
          const cards = filteredRows.filter((row) => row.status === status.label);
          return (
            <div key={status.label} className={`min-h-[360px] rounded-2xl border ${roleClass.borderSoft} ${roleClass.card} p-3`}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <StatusChip status={status.label} />
                <span className="text-xs font-semibold text-zinc-400">{cards.length || status.value}</span>
              </div>
              <div className="space-y-3">
                {(cards.length ? cards : filteredRows.slice(0, 2)).map((row) => (
                  <article key={`${status.label}-${row.account}`} className={`rounded-xl border ${roleClass.borderSoft} ${roleClass.inner} p-3`}>
                    <p className="font-semibold text-white">{row.account}</p>
                    <p className="mt-1 text-xs leading-5 text-zinc-400">{row.detail}</p>
                    <p className={`mt-3 text-xs ${roleClass.text}`}>{row.next}</p>
                    <button
                      type="button"
                      disabled={actionBusy}
                      onClick={() => onRowAction(row, status.label)}
                      className={`mt-3 rounded-lg border ${roleClass.border} ${roleClass.bgSoft} px-2 py-1 text-[11px] font-semibold ${roleClass.text} disabled:opacity-60`}
                    >
                      Update
                    </button>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function FollowUpWorkspace({ filteredRows, selectedModule, actionBusy, onRowAction }: WorkspaceProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <Panel>
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Today</p>
        <h3 className="mt-1 font-display text-2xl text-white">{selectedModule.label}</h3>
        <div className="mt-5 space-y-3">
          {filteredRows.map((row, index) => (
            <div key={row.account} className={`flex gap-3 rounded-2xl border ${roleClass.borderSoft} ${roleClass.inner} p-3`}>
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${roleClass.border} ${roleClass.bgSoft} text-xs font-bold ${roleClass.text}`}>
                {index + 1}
              </span>
              <div>
                <p className="font-semibold text-white">{row.next}</p>
                <p className="mt-1 text-sm text-zinc-400">{row.account}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Communication Queue</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {filteredRows.map((row) => (
            <article key={row.account} className={`rounded-2xl border ${roleClass.borderSoft} ${roleClass.card} p-4`}>
              <p className="font-semibold text-white">{row.account}</p>
              <p className="mt-1 text-sm text-zinc-400">{row.detail}</p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  disabled={actionBusy}
                  onClick={() => onRowAction(row, 'call')}
                  className={`inline-flex items-center gap-2 rounded-xl border ${roleClass.border} ${roleClass.bgSoft} px-3 py-2 text-xs ${roleClass.text} disabled:opacity-60`}
                >
                  <Phone size={14} />
                  Call
                </button>
                <button
                  type="button"
                  disabled={actionBusy}
                  onClick={() => onRowAction(row, 'mail')}
                  className={`inline-flex items-center gap-2 rounded-xl border ${roleClass.border} ${roleClass.inner} px-3 py-2 text-xs ${roleClass.textSoft} disabled:opacity-60`}
                >
                  <Mail size={14} />
                  Mail
                </button>
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function NotesWorkspace({ filteredRows, selectedModule, actionBusy, onRowAction }: WorkspaceProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
      <Panel>
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Notes Log</p>
        <h3 className="mt-1 font-display text-2xl text-white">{selectedModule.label}</h3>
        <div className="mt-5 space-y-3">
          {filteredRows.map((row) => (
            <article key={row.account} className={`rounded-2xl border ${roleClass.borderSoft} ${roleClass.card} p-4`}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-white">{row.account}</p>
                <span className="text-xs text-zinc-500">{row.owner}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Discussed {row.detail.toLowerCase()}. Next action: {row.next.toLowerCase()}.
              </p>
            </article>
          ))}
        </div>
      </Panel>

      <Panel>
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Add Note</p>
        <textarea
          rows={9}
          className={`mt-4 w-full rounded-2xl border ${roleClass.border} ${roleClass.inner} p-3 text-sm text-zinc-200 outline-none ${roleClass.focus}`}
          placeholder="Write call notes, objections, decision maker details, or next action..."
        />
        <button
          type="button"
          disabled={actionBusy || !filteredRows[0]}
          onClick={() => filteredRows[0] && onRowAction(filteredRows[0], 'note')}
          className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl ${roleClass.cta} px-3 py-2 text-sm font-bold text-black disabled:opacity-60`}
        >
          Save Note
          <MessageSquare size={15} />
        </button>
      </Panel>
    </div>
  );
}

function ScheduleWorkspace({ filteredRows, selectedModule, actionBusy, onRowAction }: WorkspaceProps) {
  const slots = ['09:30', '11:00', '12:45', '15:00', '16:30', '18:00'];
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <Panel>
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Calendar</p>
        <h3 className="mt-1 font-display text-2xl text-white">{selectedModule.label}</h3>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {slots.map((slot, index) => (
            <div key={slot} className={`min-h-[116px] rounded-2xl border ${roleClass.borderSoft} ${roleClass.card} p-4`}>
              <p className="text-lg font-bold text-white">{slot}</p>
              <p className="mt-2 text-sm text-zinc-400">{filteredRows[index % filteredRows.length]?.account}</p>
              <p className={`mt-1 text-xs ${roleClass.text}`}>{filteredRows[index % filteredRows.length]?.next}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Booking Form</p>
        <div className="mt-4 space-y-3">
          {['Account', 'Date', 'Time', 'Owner'].map((field) => (
            <input
              key={field}
              className={`w-full rounded-xl border ${roleClass.border} ${roleClass.inner} px-3 py-2 text-sm text-zinc-200 outline-none ${roleClass.focus}`}
              placeholder={field}
            />
          ))}
          <button
            type="button"
            disabled={actionBusy || !filteredRows[0]}
            onClick={() => filteredRows[0] && onRowAction(filteredRows[0], 'schedule')}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl ${roleClass.cta} px-3 py-2 text-sm font-bold text-black disabled:opacity-60`}
          >
            Schedule
            <Calendar size={15} />
          </button>
        </div>
      </Panel>
    </div>
  );
}

function ProcessWorkspace({
  kind,
  config,
  filteredRows,
  selectedModule,
  queueMode,
  setQueueMode,
  actionBusy,
  onRowAction,
  onOpenForm,
  onOpenNewForm,
}: WorkspaceProps) {
  const formButtonLabel =
    kind === 'sales'
      ? 'Open Sales form'
      : kind === 'procurement'
        ? selectedModule.key === 'procurement-queue'
          ? 'Open queue form'
          : selectedModule.key === 'rfqs'
            ? 'Open RFQ form'
            : selectedModule.key === 'supplier-quotations'
              ? 'Open quotation form'
              : selectedModule.key === 'purchase-orders'
                ? 'Open PO form'
                : 'Open procurement form'
        : 'Open form';
  const processSteps =
    kind === 'procurement'
      ? procurementWorkflowStages.map((step) => step)
      : ['Prepare document', 'Internal approval', 'Customer/vendor update'];
  return (
    <Panel>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Process Control</p>
          <h3 className="mt-1 font-display text-2xl text-white">{selectedModule.label}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <QueueModeControl queueMode={queueMode} setQueueMode={setQueueMode} />
          {kind === 'sales' || kind === 'procurement' ? (
            <button
              type="button"
              onClick={onOpenNewForm}
              disabled={actionBusy}
              className={`inline-flex items-center gap-2 rounded-xl ${roleClass.cta} px-4 py-2 text-sm font-extrabold text-black shadow-glow disabled:opacity-60`}
            >
              {formButtonLabel}
              <ArrowRight size={15} />
            </button>
          ) : null}
        </div>
      </div>
      <div className="mt-5">
        <WorkTable config={config} rows={filteredRows} onOpenForm={onOpenForm} />
      </div>
      {kind === 'sales' || kind === 'procurement' ? (
        <div className={`mt-5 rounded-2xl border ${roleClass.borderSoft} ${roleClass.inner} p-4`}>
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            {kind === 'sales' ? 'Sales inbox form' : 'Procurement workflow form'}
          </p>
          <p className="mt-2 text-sm text-zinc-300">
            {kind === 'sales'
              ? 'Capture customer contact, quotation, negotiation, and the next order step in one place.'
              : 'Capture sales order, RFQ, supplier quotation, final cost, and purchase order updates in one place.'}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-zinc-500">
            {kind === 'procurement'
              ? 'Responsibilities: Product Pricing, Vendor Selection, RFQ Management, Supplier Negotiation'
              : 'Keep the handoff moving'}
          </p>
        </div>
      ) : null}
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {processSteps.map((step, index) => (
          <div key={step} className={`rounded-2xl border ${roleClass.borderSoft} ${roleClass.card} p-4`}>
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Step {index + 1}</p>
            <p className="mt-2 font-semibold text-white">{step}</p>
            <button
              type="button"
              disabled={actionBusy || !filteredRows[0]}
              onClick={() => filteredRows[0] && onRowAction(filteredRows[0], step)}
              className={`mt-3 rounded-lg border ${roleClass.border} ${roleClass.bgSoft} px-2 py-1 text-[11px] font-semibold ${roleClass.text} disabled:opacity-60`}
            >
              Mark Done
            </button>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function HistoryWorkspace({ config, filteredRows, selectedModule }: WorkspaceProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
      <Panel>
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Timeline</p>
        <h3 className="mt-1 font-display text-2xl text-white">{selectedModule.label}</h3>
        <div className="mt-5 space-y-4">
          {filteredRows.map((row, index) => (
            <div key={row.account} className="relative pl-8">
              <span className={`absolute left-0 top-1 grid h-5 w-5 place-items-center rounded-full border ${roleClass.borderStrong} ${roleClass.bgSoft} text-[10px] ${roleClass.text}`}>
                {index + 1}
              </span>
              <p className="font-semibold text-white">{row.account}</p>
              <p className="mt-1 text-sm text-zinc-400">{row.detail}</p>
              <p className={`mt-1 text-xs ${roleClass.text}`}>{row.next}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Report Snapshot</p>
        <div className="mt-5 space-y-4">
          {config.statuses.map((status) => (
            <div key={status.label} className={`rounded-2xl border ${roleClass.borderSoft} ${roleClass.card} p-4`}>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-white">{status.label}</p>
                <p className={`text-2xl font-black ${roleClass.text}`}>{status.value}</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
                <div className={`h-full rounded-full bg-gradient-to-r ${toneClass[status.tone].bar}`} style={{ width: `${status.value * 4}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

type OperationsFormModalProps = {
  kind: DashboardKind;
  row: WorkRow;
  members: OperationMember[];
  salesMembers: OperationMember[];
  activeModule: string;
  busy: boolean;
  onClose: () => void;
  onSave: (row: WorkRow, payload: Record<string, unknown>) => void;
};

function OperationsFormModal({ kind, row, members, salesMembers, activeModule, busy, onClose, onSave }: OperationsFormModalProps) {
  const isQuote = row.source === 'quote';
  const isLead = row.source === 'lead';
  const canHandoffToSales = kind === 'lqt' && ['sales-assignment', 'assigned-leads'].includes(activeModule);
  const [title, setTitle] = useState(row.account || '');
  const [assigneeId, setAssigneeId] = useState(
    row.assignedTo || members.find((member) => member.name === row.owner)?.id || ''
  );
  const [detail, setDetail] = useState(row.requirement || row.detail || '');
  const [status, setStatus] = useState(row.status || (kind === 'procurement' ? 'Sales Order' : 'in_review'));
  const [leadTemperature, setLeadTemperature] = useState(row.status?.toLowerCase() || 'warm');
  const [nextStep, setNextStep] = useState(row.next === 'Review requirement' ? '' : row.next || '');
  const [value, setValue] = useState(row.value || '');
  const [note, setNote] = useState('');
  const [followUpAt, setFollowUpAt] = useState('');
  const [quotationAmount, setQuotationAmount] = useState('');
  const [handoffToSales, setHandoffToSales] = useState(canHandoffToSales);
  const [leadStatus, setLeadStatus] = useState(
    row.leadStatus || (kind === 'lqt' ? (canHandoffToSales ? 'Sales Assigned' : 'Qualified') : 'New')
  );
  const [meetingAt, setMeetingAt] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const availableMembers = handoffToSales ? salesMembers : members;
  const memberById = new Map(availableMembers.map((member) => [member.id, member]));
  const inputClass = `w-full rounded-xl border ${roleClass.border} ${roleClass.inner} px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 ${roleClass.focus}`;
  const assignedLabel = handoffToSales ? 'Sales person' : 'Assigned employee';
  const assignedPlaceholder = handoffToSales ? 'Select sales person' : `Select ${kind} employee`;
  const nextStepLabel = kind === 'sales' ? 'Next sales step' : kind === 'procurement' ? 'Next procurement step' : 'Next step';
  const noteLabel = kind === 'sales' ? 'Customer contact / communication notes' : kind === 'procurement' ? 'Supplier negotiation / notes' : 'Work note';
  const statusLabel = kind === 'sales' ? 'Sales stage' : 'Status';
  const valueLabel =
    kind === 'sales'
      ? isQuote
        ? 'Quotation amount (INR)'
        : 'Quotation / order value'
      : kind === 'procurement'
        ? 'Final cost / PO value'
        : 'Value';

  const submit = () => {
    const nextErrors: Record<string, string> = {};
    if (!isQuote && !title.trim()) nextErrors.title = 'Name is required';
    if (!assigneeId) nextErrors.assignee = handoffToSales ? 'Select a sales employee' : 'Select an assigned employee';
    if (!detail.trim()) nextErrors.detail = 'Requirement details are required';
    if (!note.trim() || note.trim().length < 3) nextErrors.note = 'Add a note with at least 3 characters';
    if (kind === 'procurement' && !nextStep.trim()) nextErrors.nextStep = 'Next step is required';
    if (quotationAmount && (!Number.isFinite(Number(quotationAmount)) || Number(quotationAmount) <= 0)) {
      nextErrors.quotationAmount = 'Quotation amount must be greater than zero';
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    if (isLead && kind === 'lqt') {
      onSave(row, {
        status: handoffToSales ? 'Sales Assigned' : leadStatus,
        leadTemperature,
        assignedTeam: handoffToSales ? 'sales' : 'lqt',
        assignedTo: assigneeId,
        requirement: detail.trim(),
        note: note.trim(),
        ...(followUpAt
          ? { followUp: { note: nextStep.trim() || 'LQT follow-up', dueAt: new Date(followUpAt).toISOString() } }
          : {}),
        ...(meetingAt
          ? { meeting: { note: 'Buyer meeting scheduled from LQT dashboard', scheduledAt: new Date(meetingAt).toISOString() } }
          : {}),
      });
      return;
    }

    if (isLead && kind === 'sales') {
      onSave(row, {
        status: leadStatus,
        assignedTeam: 'sales',
        assignedTo: assigneeId,
        requirement: detail.trim(),
        note: note.trim(),
        ...(followUpAt
          ? { followUp: { note: nextStep.trim() || 'Sales follow-up', dueAt: new Date(followUpAt).toISOString() } }
          : {}),
        ...(quotationAmount
          ? { quotation: { amount: Number(quotationAmount), currency: 'INR', status: 'sent' } }
          : {}),
      });
      return;
    }

    if (isQuote && kind === 'lqt') {
      onSave(row, {
        module: activeModule,
        status: 'in_review',
        leadTemperature,
        assignedTeam: handoffToSales ? 'sales' : 'lqt',
        assignedTo: handoffToSales ? '' : assigneeId,
        requirement: detail.trim(),
        note: note.trim(),
        ...(followUpAt
          ? { followUp: { note: nextStep.trim() || 'LQT follow-up', dueAt: new Date(followUpAt).toISOString() } }
          : {}),
      });
      return;
    }

    if (isQuote && kind === 'sales') {
      onSave(row, {
        module: activeModule,
        status: status === 'closed' ? 'closed' : 'in_review',
        assignedTeam: 'sales',
        assignedTo: assigneeId,
        requirement: detail.trim(),
        note: note.trim(),
        ...(followUpAt
          ? { followUp: { note: nextStep.trim() || 'Sales follow-up', dueAt: new Date(followUpAt).toISOString() } }
          : {}),
        ...(quotationAmount
          ? { quotation: { amount: Number(quotationAmount), currency: 'INR', status: 'sent' } }
          : {}),
      });
      return;
    }

    onSave(row, {
      module: activeModule,
      title: title.trim(),
      owner: memberById.get(assigneeId)?.name || '',
      detail: detail.trim(),
      status: kind === 'procurement' ? status.trim() : status.trim(),
      nextStep: nextStep.trim(),
      value: value.trim(),
      note: note.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm">
      <section className={`max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border ${roleClass.borderStrong} ${roleClass.surface} p-5 shadow-glow`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={`text-xs uppercase tracking-[0.18em] ${roleClass.text}`}>{kind} operations form</p>
            <h3 className="mt-2 font-display text-2xl text-white">{row.id ? `Update ${row.account}` : 'Create New Record'}</h3>
            <p className="mt-1 text-sm text-zinc-400">Complete the required fields before saving this workflow update.</p>
          </div>
          <button type="button" onClick={onClose} className={`rounded-xl border ${roleClass.border} ${roleClass.inner} p-2 text-zinc-300`}>
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {isLead && canHandoffToSales ? (
            <div className={`md:col-span-2 rounded-xl border ${roleClass.borderSoft} ${roleClass.bgSoft} p-3 text-sm text-zinc-200`}>
              <p className="font-semibold text-white">Sales handoff form</p>
              <p className="mt-1 text-zinc-300">
                Use this form to route the enquiry from LQT to the right sales person and mark the lead as assigned.
              </p>
            </div>
          ) : null}

          <label>
            <span className="text-xs uppercase tracking-[0.14em] text-zinc-500">{isQuote ? 'Account' : kind === 'procurement' ? 'Supplier name' : 'Customer name'}</span>
            <input className={`${inputClass} mt-2`} value={title} onChange={(event) => setTitle(event.target.value)} disabled={isQuote} />
            {errors.title ? <span className="mt-1 block text-xs text-red-300">{errors.title}</span> : null}
          </label>

          <label>
            <span className="text-xs uppercase tracking-[0.14em] text-zinc-500">{assignedLabel}</span>
            <select
              className={`${inputClass} mt-2`}
              value={assigneeId}
              onChange={(event) => setAssigneeId(event.target.value)}
            >
              <option value="">{assignedPlaceholder}</option>
              {availableMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.email})
                </option>
              ))}
            </select>
            {errors.assignee ? <span className="mt-1 block text-xs text-red-300">{errors.assignee}</span> : null}
          </label>

          <label className="md:col-span-2">
            <span className="text-xs uppercase tracking-[0.14em] text-zinc-500">Requirement details</span>
            <textarea className={`${inputClass} mt-2`} rows={3} value={detail} onChange={(event) => setDetail(event.target.value)} />
            {errors.detail ? <span className="mt-1 block text-xs text-red-300">{errors.detail}</span> : null}
          </label>

          {isLead ? (
            <div className={`md:col-span-2 grid gap-2 rounded-xl border ${roleClass.border} ${roleClass.inner} p-3 text-xs text-zinc-400 sm:grid-cols-2 lg:grid-cols-4`}>
              <span><strong className="text-zinc-200">Lead ID:</strong> {row.leadId}</span>
              <span><strong className="text-zinc-200">Company:</strong> {row.companyName}</span>
              <span><strong className="text-zinc-200">Buyer type:</strong> {row.buyerType}</span>
              <span><strong className="text-zinc-200">Priority score:</strong> {row.priorityScore}</span>
              <span><strong className="text-zinc-200">Source:</strong> {row.sourceLabel}</span>
              <span><strong className="text-zinc-200">Product:</strong> {row.product}</span>
              <span><strong className="text-zinc-200">Quantity:</strong> {row.quantity}</span>
              <span><strong className="text-zinc-200">Last follow-up:</strong> {row.lastFollowUp || 'Not scheduled'}</span>
            </div>
          ) : null}

          {kind === 'lqt' ? (
            <>
              <label>
                <span className="text-xs uppercase tracking-[0.14em] text-zinc-500">Lead temperature</span>
                <select className={`${inputClass} mt-2`} value={leadTemperature} onChange={(event) => setLeadTemperature(event.target.value)}>
                  <option value="hot">Hot</option>
                  <option value="warm">Warm</option>
                  <option value="cold">Cold</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>
              <label className={`flex items-center gap-3 rounded-xl border ${roleClass.border} ${roleClass.inner} px-3 py-2.5`}>
                <input
                  type="checkbox"
                  checked={handoffToSales}
                  onChange={(event) => {
                    setHandoffToSales(event.target.checked);
                    setAssigneeId('');
                  }}
                />
                <span className="text-sm text-zinc-300">
                  {canHandoffToSales ? 'Assign directly to Sales queue' : 'Qualified: hand off to Sales queue'}
                </span>
              </label>
            </>
          ) : (
            <label>
              <span className="text-xs uppercase tracking-[0.14em] text-zinc-500">{statusLabel}</span>
              {isLead ? (
                <select className={`${inputClass} mt-2`} value={leadStatus} onChange={(event) => setLeadStatus(event.target.value)}>
                  {['New', 'Pricing', 'Negotiation', 'Follow-Up', 'Won', 'Lost'].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              ) : kind === 'procurement' ? (
                <select className={`${inputClass} mt-2`} value={status} onChange={(event) => setStatus(event.target.value)}>
                  {procurementWorkflowStages.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              ) : (
                <input className={`${inputClass} mt-2`} value={status} onChange={(event) => setStatus(event.target.value)} />
              )}
            </label>
          )}

          <label>
            <span className="text-xs uppercase tracking-[0.14em] text-zinc-500">{nextStepLabel}</span>
            <input className={`${inputClass} mt-2`} value={nextStep} onChange={(event) => setNextStep(event.target.value)} placeholder="Follow-up action" />
            {errors.nextStep ? <span className="mt-1 block text-xs text-red-300">{errors.nextStep}</span> : null}
          </label>

          {kind !== 'lqt' ? (
            <label>
              <span className="text-xs uppercase tracking-[0.14em] text-zinc-500">{valueLabel}</span>
              <input
                className={`${inputClass} mt-2`}
                value={kind === 'sales' && isQuote ? quotationAmount : value}
                onChange={(event) => (kind === 'sales' && isQuote ? setQuotationAmount(event.target.value) : setValue(event.target.value))}
                placeholder={kind === 'sales' && isQuote ? 'e.g. 750000' : 'Draft value'}
              />
              {errors.quotationAmount ? <span className="mt-1 block text-xs text-red-300">{errors.quotationAmount}</span> : null}
            </label>
          ) : null}

          {isQuote ? (
            <label>
              <span className="text-xs uppercase tracking-[0.14em] text-zinc-500">Follow-up date</span>
              <input className={`${inputClass} mt-2`} type="datetime-local" value={followUpAt} onChange={(event) => setFollowUpAt(event.target.value)} />
            </label>
          ) : null}

          {isLead ? (
            <>
              <label>
                <span className="text-xs uppercase tracking-[0.14em] text-zinc-500">Follow-up date</span>
                <input className={`${inputClass} mt-2`} type="datetime-local" value={followUpAt} onChange={(event) => setFollowUpAt(event.target.value)} />
              </label>
              {kind === 'lqt' ? (
                <label>
                  <span className="text-xs uppercase tracking-[0.14em] text-zinc-500">Schedule meeting</span>
                  <input className={`${inputClass} mt-2`} type="datetime-local" value={meetingAt} onChange={(event) => setMeetingAt(event.target.value)} />
                </label>
              ) : null}
            </>
          ) : null}

          <label className="md:col-span-2">
            <span className="text-xs uppercase tracking-[0.14em] text-zinc-500">{noteLabel}</span>
            <textarea className={`${inputClass} mt-2`} rows={3} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Record what was checked, discussed, or changed" />
            {errors.note ? <span className="mt-1 block text-xs text-red-300">{errors.note}</span> : null}
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className={`rounded-xl border ${roleClass.border} ${roleClass.inner} px-4 py-2 text-sm text-zinc-300`}>
            Cancel
          </button>
          <button type="button" disabled={busy} onClick={submit} className={`rounded-xl ${roleClass.cta} px-4 py-2 text-sm font-extrabold text-black disabled:opacity-60`}>
            {busy ? 'Saving...' : 'Save Form'}
          </button>
        </div>
      </section>
    </div>
  );
}

function ModuleWorkspace(props: WorkspaceProps) {
  const { activeModule } = props;
  if (activeModule === 'overview') return <OverviewWorkspace {...props} />;
  if (['new-leads', 'customer-management', 'supplier-management', 'procurement-queue'].includes(activeModule)) {
    return <IntakeWorkspace {...props} />;
  }
  if (['assigned-leads', 'leads', 'sales-inbox'].includes(activeModule)) return <AssignmentWorkspace {...props} />;
  if (activeModule === 'customers') return <IntakeWorkspace {...props} />;
  if (['qualification', 'cost-analysis', 'pricing-intelligence'].includes(activeModule)) {
    return <ScorecardWorkspace {...props} />;
  }
  if (['lead-status', 'negotiation-tracking', 'vendor-comparison', 'approval-queue', 'margin-review', 'cost-review', 'target-price-review', 'commercial-approval', 'pricing-approval', 'sourcing-approval', 'approval-history', 'inventory-dashboard', 'dispatch-dashboard', 'logistics', 'courier-tracking', 'invoice-queue', 'orders', 'approved-suppliers', 'supplier-quotations', 'rfqs'].includes(activeModule)) {
    return <BoardWorkspace {...props} />;
  }
  if (['follow-ups', 'supplier-communication', 'tasks'].includes(activeModule)) return <FollowUpWorkspace {...props} />;
  if (['call-notes', 'communication'].includes(activeModule)) return <NotesWorkspace {...props} />;
  if (['meeting-scheduling', 'availability-tracking'].includes(activeModule)) return <ScheduleWorkspace {...props} />;
  if (
    [
      'sales-assignment',
      'rfq-management',
      'quotation-management',
      'order-management',
      'lead-conversion',
      'price-requests',
      'procurement-queue',
      'rfqs',
      'supplier-quotations',
      'purchase-orders',
    ].includes(activeModule)
  ) {
    return <ProcessWorkspace {...props} />;
  }
  if (
    [
      'lead-history',
      'sales-reports',
      'procurement-reports',
      'approval-history',
      'inventory-reports',
      'delivery-reports',
      'finance-reports',
    ].includes(activeModule)
  )
    return <HistoryWorkspace {...props} />;
  return <OverviewWorkspace {...props} />;
}

export function OperationsDashboardPage({ kind }: { kind: DashboardKind }) {
  const navigate = useNavigate();
  const user = getAuthUser();
  const config = configs[kind];
  const dashboardStyle = {
    '--role-accent': config.theme.accentRgb,
    '--role-accent-strong': config.theme.accentStrongRgb,
    '--role-accent-light': config.theme.accentLightRgb,
    '--role-page': config.theme.pageRgb,
    '--role-surface': config.theme.surfaceRgb,
    '--role-surface-alt': config.theme.surfaceAltRgb,
    '--role-header': config.theme.headerRgb,
    '--role-sidebar': config.theme.sidebarRgb,
    '--role-card': config.theme.cardRgb,
    '--role-inner': config.theme.innerRgb,
  } as CSSProperties;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeModule, setActiveModule] = useState('overview');
  const [query, setQuery] = useState('');
  const [queueMode, setQueueMode] = useState<'open' | 'due' | 'closed'>('open');
  const [serverRows, setServerRows] = useState<WorkRow[]>([]);
  const [members, setMembers] = useState<OperationMember[]>([]);
  const [salesMembers, setSalesMembers] = useState<OperationMember[]>([]);
  const [formRow, setFormRow] = useState<WorkRow | null>(null);
  const [moduleCounts, setModuleCounts] = useState<Record<string, number>>({});
  const [websiteLeadStats, setWebsiteLeadStats] = useState<WebsiteLeadStats | null>(null);
  const [loadingOperations, setLoadingOperations] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);

  const selectedModuleBase = config.modules.find((item) => item.key === activeModule) || config.modules[0];
  const selectedModule = {
    ...selectedModuleBase,
    metric:
      moduleCounts[selectedModuleBase.key] !== undefined
        ? String(moduleCounts[selectedModuleBase.key])
        : selectedModuleBase.metric,
  };
  const SelectedIcon = selectedModule.icon;
  const statusTotal = config.statuses.reduce((sum, item) => sum + item.value, 0);
  const dashboardRows = serverRows.length ? serverRows : config.rows;

  const filteredRows = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return dashboardRows;
    return dashboardRows.filter((row) =>
      [row.account, row.owner, row.detail, row.status, row.next, row.value].some((value) =>
        value.toLowerCase().includes(search)
      )
    );
  }, [dashboardRows, query]);

  const loadOperations = async () => {
    setLoadingOperations(true);
    try {
      const [data, teamMembers, handoffMembers] = await Promise.all([
        operationsApi.getDashboard(kind),
        operationsApi.getMembers(kind),
        kind === 'lqt' ? operationsApi.getMembers('sales') : Promise.resolve([]),
      ]);
      setServerRows(data.rows.map((row: OperationRow) => ({ ...row, id: String(row.id) })));
      setMembers(teamMembers);
      setSalesMembers(kind === 'sales' ? teamMembers : handoffMembers);
      setModuleCounts(data.modules || {});
      setWebsiteLeadStats(data.websiteLeadStats || null);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoadingOperations(false);
    }
  };

  useEffect(() => {
    loadOperations();
  }, [kind]);

  const handleRowAction = async (row: WorkRow, action = activeModule) => {
    if (!row.id) {
      toast.error('This sample row is not connected to the API yet');
      return;
    }

    setActionBusy(true);
    try {
      if (row.source === 'lead' && (kind === 'lqt' || kind === 'sales')) {
        const leadPayload: Record<string, unknown> = {
          note: `${selectedModule.label}: ${action}`,
        };

        if (kind === 'lqt') {
          if (['new-leads', 'qualification'].includes(activeModule)) {
            leadPayload.status = 'Qualified';
            leadPayload.leadTemperature = 'hot';
          }
          if (activeModule === 'lead-status') leadPayload.leadTemperature = String(action).toLowerCase();
          if (activeModule === 'sales-assignment') leadPayload.status = 'Sales Assigned';
          if (activeModule === 'follow-ups') {
            leadPayload.status = 'Follow-up';
            leadPayload.followUp = { note: 'Follow-up logged from LQT dashboard', dueAt: new Date().toISOString() };
          }
          if (activeModule === 'meeting-scheduling') {
            leadPayload.meeting = { note: 'Meeting scheduled from LQT dashboard', scheduledAt: new Date().toISOString() };
          }
        }

        if (kind === 'sales') {
          if (['sales-inbox', 'leads'].includes(activeModule)) {
            leadPayload.status = 'Pricing';
            leadPayload.leadTemperature = 'warm';
          }
          if (activeModule === 'customers') {
            leadPayload.status = 'Follow-Up';
          }
          if (activeModule === 'quotation-management') {
            leadPayload.status = 'Negotiation';
            leadPayload.quotation = { amount: 100000, currency: 'INR', status: 'sent' };
          }
          if (activeModule === 'negotiation-tracking') {
            leadPayload.status = 'Negotiation';
          }
          if (['orders', 'lead-conversion'].includes(activeModule)) {
            leadPayload.status = 'Won';
            leadPayload.order = { status: 'confirmed', amount: 100000 };
          }
          if (activeModule === 'tasks') {
            leadPayload.status = 'Follow-Up';
            leadPayload.followUp = { note: 'Sales task logged', dueAt: new Date().toISOString() };
          }
          if (activeModule === 'communication') {
            leadPayload.note = 'Sales communication logged';
          }
        }

        await operationsApi.updateLead(row.id, leadPayload);
      } else if (row.source === 'quote' && (kind === 'lqt' || kind === 'sales')) {
        const quotePayload: Record<string, unknown> = {
          module: activeModule,
          note: `${selectedModule.label}: ${action}`,
          assignedToName: user?.name || row.owner,
        };

        if (kind === 'lqt') {
          if (['new-leads', 'qualification'].includes(activeModule)) {
            quotePayload.status = 'in_review';
            quotePayload.leadTemperature = 'hot';
          }
          if (activeModule === 'lead-status') quotePayload.leadTemperature = String(action).toLowerCase();
          if (activeModule === 'sales-assignment') quotePayload.assignedTeam = 'sales';
          if (activeModule === 'follow-ups') {
            quotePayload.followUp = { note: 'Follow-up logged from LQT dashboard', dueAt: new Date().toISOString() };
          }
          if (activeModule === 'meeting-scheduling') {
            quotePayload.meeting = { note: 'Meeting scheduled from LQT dashboard', scheduledAt: new Date().toISOString() };
          }
        }

        if (kind === 'sales') {
          if (['sales-inbox', 'leads'].includes(activeModule)) {
            quotePayload.status = 'new';
            quotePayload.leadTemperature = 'warm';
          }
          if (activeModule === 'customers') {
            quotePayload.followUp = { note: 'Customer contact logged', dueAt: new Date().toISOString() };
          }
          if (activeModule === 'quotation-management') {
            quotePayload.status = 'in_review';
            quotePayload.quotation = { amount: 100000, currency: 'INR', status: 'sent' };
          }
          if (activeModule === 'negotiation-tracking') {
            quotePayload.status = 'in_review';
            quotePayload.quotation = { amount: 100000, currency: 'INR', status: 'sent' };
          }
          if (['orders', 'lead-conversion'].includes(activeModule)) {
            quotePayload.order = { status: 'confirmed', amount: 100000 };
          }
          if (activeModule === 'tasks') {
            quotePayload.followUp = { note: 'Sales task logged', dueAt: new Date().toISOString() };
          }
          if (activeModule === 'communication') {
            quotePayload.note = 'Sales communication logged';
          }
        }

        await operationsApi.updateQuote(kind, row.id, quotePayload);
      } else if (row.source === 'operation' && isRecordTeamKind(kind)) {
        const isProcurementStage = procurementWorkflowStages.includes(action as (typeof procurementWorkflowStages)[number]);
        const payload: Record<string, unknown> = {
          note: `${selectedModule.label}: ${action}`,
        };
        if (kind === 'procurement') {
          if (isProcurementStage) payload.status = action;
        } else {
          payload.status = action === 'Requested' ? 'Requested' : action === 'At Risk' ? 'At Risk' : 'Updated';
        }
        await operationsApi.updateRecord(kind, row.id, payload);
      }

      toast.success(`${selectedModule.label} updated`);
      await loadOperations();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setActionBusy(false);
    }
  };

  const handleCreateRecord = async (module: string) => {
    if (!isRecordTeamKind(kind)) {
      toast.error('Create quote requests from the website or Flutter app');
      return;
    }

    setActionBusy(true);
    try {
      await operationsApi.createRecord(kind, {
        module,
        title: kind === 'procurement' ? 'New Procurement Draft' : kind === 'sales' ? 'New Sales Draft' : 'New Operational Draft',
        detail: selectedModule.helper,
        status: kind === 'procurement' ? 'Sales Order' : 'open',
        nextStep: 'Complete details',
        value: 'Draft',
      });
      toast.success('Draft saved');
      await loadOperations();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setActionBusy(false);
    }
  };

  const handleOpenNewForm = () => {
    if (kind === 'lqt') return;
    setFormRow({
      source: 'operation',
      account: '',
      owner: user?.name || '',
      detail: '',
      status: kind === 'procurement' ? 'Sales Order' : 'open',
      next: '',
      value: '',
    });
  };

  const handleSaveForm = async (row: WorkRow, payload: Record<string, unknown>) => {
    setActionBusy(true);
    try {
      if (row.source === 'lead' && row.id && (kind === 'lqt' || kind === 'sales')) {
        await operationsApi.updateLead(row.id, payload);
      } else if (row.source === 'quote' && row.id && (kind === 'lqt' || kind === 'sales')) {
        await operationsApi.updateQuote(kind, row.id, payload);
      } else if (row.source === 'operation' && row.id && isRecordTeamKind(kind)) {
        await operationsApi.updateRecord(kind, row.id, payload);
      } else if (row.source === 'operation' && isRecordTeamKind(kind)) {
        await operationsApi.createRecord(kind, payload);
      } else {
        throw new Error('This record cannot be updated from the current dashboard');
      }

      toast.success('Operations form saved');
      setFormRow(null);
      await loadOperations();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setActionBusy(false);
    }
  };

  const logout = () => {
    clearAuth();
    navigate('/auth', { replace: true });
  };

  const dashboardStats =
    kind === 'lqt' && websiteLeadStats
      ? [
          { ...config.stats[0], label: 'Total Inquiries', value: String(websiteLeadStats.totalInquiries), helper: 'Website lead capture' },
          { ...config.stats[1], label: 'Qualified', value: String(websiteLeadStats.qualifiedLeads), helper: 'Validated and ready' },
          { ...config.stats[2], label: 'Need More Info', value: String(websiteLeadStats.needMoreInformation), helper: 'Awaiting customer response' },
          { ...config.stats[3], label: 'Assigned To Sales', value: String(websiteLeadStats.assignedToSales), helper: 'Routed to CRO' },
        ]
      : config.stats;

  return (
    <div
      className={`relative min-h-screen overflow-hidden ${roleClass.shell} px-4 py-4 text-zinc-200 md:px-6 md:py-6`}
      style={dashboardStyle}
    >
      <SEO title={config.title} description={`${config.eyebrow} operations dashboard`} path={config.route} noIndex />

      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className={`absolute left-[-8rem] top-16 h-80 w-80 rounded-full ${config.theme.glowLeft} blur-3xl`} />
        <div className={`absolute right-[-8rem] top-8 h-96 w-96 rounded-full ${config.theme.glowRight} blur-3xl`} />
        <div className="absolute inset-0 bg-metal-grid bg-[length:72px_72px] opacity-[0.14]" />
      </div>

      <div className={`relative mx-auto flex max-w-[1500px] items-center justify-between rounded-2xl border ${roleClass.borderSoft} ${roleClass.surface} px-4 py-3 shadow-glow md:hidden`}>
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className={`rounded-xl border ${roleClass.border} ${roleClass.inner} p-2 ${roleClass.text}`}
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <BrandLogo className="h-8" />
        <ShieldCheck size={18} className={roleClass.text} />
      </div>

      <div className="relative mx-auto mt-4 grid max-w-[1500px] gap-5 md:mt-0 md:grid-cols-[292px_1fr]">
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          } fixed inset-y-0 left-0 z-40 flex w-[292px] flex-col border-r border-[rgb(var(--role-accent)_/_0.12)] ${roleClass.sidebar} p-4 shadow-glow transition-transform md:sticky md:top-6 md:h-[calc(100vh-3rem)] md:w-auto md:rounded-2xl md:border md:border-[rgb(var(--role-accent)_/_0.20)]`}
        >
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <BrandLogo className="h-11" />
              <p className="mt-1 text-xs text-zinc-400">{config.eyebrow}</p>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className={`rounded-xl border ${roleClass.border} ${roleClass.inner} p-2 text-zinc-300 md:hidden`}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
            {config.modules.map((item) => {
              const Icon = item.icon;
              const active = item.key === activeModule;
              const metric = moduleCounts[item.key] !== undefined ? String(moduleCounts[item.key]) : item.metric;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setActiveModule(item.key);
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm ${
                    active
                      ? `border ${roleClass.borderStrong} ${roleClass.bgSoft} text-white shadow-glow`
                      : 'border border-transparent text-zinc-400 hover:border-[rgb(var(--role-accent)_/_0.18)] hover:bg-[rgb(var(--role-inner)_/_0.95)] hover:text-zinc-100'
                  }`}
                  title={getModuleCountTooltip(item, metric)}
                  aria-label={`${item.label}: ${getModuleCountTooltip(item, metric)}`}
                >
                  <Icon size={17} className={active ? roleClass.text : 'text-zinc-500'} />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  <span className={`rounded-md border ${roleClass.borderSoft} bg-black/20 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-300`}>
                    {metric}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className={`mt-4 rounded-2xl border ${roleClass.borderSoft} ${roleClass.inner} p-3`}>
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Signed In</p>
            <p className="mt-2 truncate text-sm font-semibold text-white">{user?.name || config.roleLabel}</p>
            <p className="truncate text-xs text-zinc-500">{user?.email || 'team@graven.local'}</p>
            <button
              type="button"
              onClick={logout}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/25 bg-red-400/10 px-3 py-2 text-xs font-semibold text-red-200 hover:border-red-300/50"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </aside>

        <main className="min-w-0 space-y-5">
          <header className={`rounded-2xl border ${roleClass.border} ${roleClass.header} p-4 shadow-glow`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className={`text-xs uppercase tracking-[0.2em] ${roleClass.text}`}>{config.eyebrow}</p>
                <h2 className="mt-2 font-display text-3xl text-white md:text-4xl">{selectedModule.label}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">{selectedModule.helper}</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-[1fr_auto] lg:w-[430px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className={`w-full rounded-xl border ${roleClass.border} ${roleClass.inner} px-3 py-2.5 pl-10 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 ${roleClass.focus}`}
                    placeholder="Search work queue"
                  />
                </div>
                <button
                  type="button"
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold shadow-glow hover:brightness-110 ${getSlaClass(
                    selectedModule.metric,
                    selectedModule.helper
                  )}`}
                  title={selectedModule.helper}
                >
                  <SelectedIcon size={16} />
                  {loadingOperations ? 'Syncing' : getSlaLabel(selectedModule.metric, selectedModule.helper)}
                </button>
              </div>
            </div>
          </header>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardStats.map((stat) => (
              <StatCard key={stat.label} stat={stat} />
            ))}
          </section>

          {kind === 'lqt' && websiteLeadStats ? (
            <section className={`grid gap-3 rounded-2xl border ${roleClass.borderSoft} ${roleClass.card} p-4 sm:grid-cols-2 xl:grid-cols-4`}>
              {[
                { label: 'New Website Leads', value: websiteLeadStats.newWebsiteLeads, icon: UserCheck },
                { label: 'Quotations Sent', value: websiteLeadStats.quotationsSent, icon: FileText },
                { label: 'Converted Leads', value: websiteLeadStats.convertedLeads, icon: Target },
                { label: 'Lead Source Performance', value: `Website: ${websiteLeadStats.leadSourcePerformance.Website || 0}`, icon: Globe2 },
              ].map(({ label, value, icon: StatIcon }) => {
                return (
                  <div key={label} className={`relative overflow-hidden rounded-xl border ${roleClass.borderSoft} ${roleClass.inner} px-3 py-3`}>
                    <div className="absolute right-3 top-3 opacity-20">
                      <StatIcon size={28} className={roleClass.text} />
                    </div>
                    <p className="relative text-xs font-semibold uppercase tracking-[0.14em] text-zinc-300">{label}</p>
                    <p className={`relative mt-2 text-2xl font-black ${roleClass.text}`}>{value}</p>
                  </div>
                );
              })}
            </section>
          ) : null}

          <ModuleWorkspace
            kind={kind}
            activeModule={activeModule}
            config={config}
            filteredRows={filteredRows}
            queueMode={queueMode}
            selectedModule={selectedModule}
            setQueueMode={setQueueMode}
            statusTotal={statusTotal}
            actionBusy={actionBusy}
            onRowAction={handleRowAction}
            onCreateRecord={handleCreateRecord}
            onOpenForm={setFormRow}
            onOpenNewForm={handleOpenNewForm}
          />

          <section className="grid gap-4 lg:grid-cols-3">
            {config.modules
              .filter((module) => module.key !== 'overview')
              .slice(0, 6)
              .map((module) => {
                const Icon = module.icon;
                return (
                  <button
                    key={module.key}
                    type="button"
                    onClick={() => setActiveModule(module.key)}
                    className={`group flex min-h-[118px] items-start gap-3 rounded-2xl border ${roleClass.borderSoft} ${roleClass.card} p-4 text-left shadow-glow hover:border-[rgb(var(--role-accent)_/_0.35)]`}
                  >
                    <span className={`rounded-xl border ${roleClass.border} ${roleClass.bgSoft} p-2 ${roleClass.text}`}>
                      <Icon size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-white">{module.label}</span>
                      <span className="mt-1 block text-sm font-medium text-zinc-300">{module.helper}</span>
                      <span className={`mt-3 inline-flex items-center gap-1 text-xs font-semibold ${roleClass.text}`}>
                        {module.metric}
                        <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
                      </span>
                    </span>
                  </button>
                );
              })}
          </section>
        </main>
      </div>
      {formRow ? (
        <OperationsFormModal
          kind={kind}
          row={formRow}
          members={members}
          salesMembers={salesMembers}
          activeModule={activeModule}
          busy={actionBusy}
          onClose={() => setFormRow(null)}
          onSave={handleSaveForm}
        />
      ) : null}
    </div>
  );
}
