import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Briefcase,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileSpreadsheet,
  FileText,
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
import { SEO } from '../components/seo/SEO';
import { clearAuth, getAuthUser } from '../lib/auth';
import { operationsApi, type OperationMember, type OperationRow } from '../lib/operationsApi';

type DashboardKind = 'lqt' | 'sales' | 'procurement';
type Tone = 'gold' | 'green' | 'blue' | 'red' | 'violet';

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
  source?: 'quote' | 'operation';
  account: string;
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
};

const configs: Record<DashboardKind, DashboardConfig> = {
  lqt: {
    title: 'LQT Dashboard',
    eyebrow: 'Lead Qualification Team',
    route: '/lqt',
    roleLabel: 'LQT',
    theme: roleThemes.lqt,
    primaryColumn: 'Lead',
    detailColumn: 'Requirement',
    stats: [
      { label: 'New Leads', value: '38', helper: 'Awaiting first touch', icon: UserCheck, tone: 'blue' },
      { label: 'Hot Leads', value: '12', helper: 'Ready for sales handoff', icon: Target, tone: 'red' },
      { label: 'Follow-Ups', value: '17', helper: 'Scheduled this week', icon: Phone, tone: 'gold' },
      { label: 'Meetings', value: '6', helper: 'Buyer calls booked', icon: Calendar, tone: 'green' },
    ],
    statuses: [
      { label: 'Hot', value: 12, tone: 'red' },
      { label: 'Warm', value: 18, tone: 'gold' },
      { label: 'Cold', value: 9, tone: 'blue' },
      { label: 'Rejected', value: 4, tone: 'violet' },
    ],
    modules: [
      { key: 'overview', label: 'Dashboard Overview', icon: BarChart3, metric: '82%', helper: 'Qualification SLA' },
      { key: 'new-leads', label: 'New Leads', icon: UserCheck, metric: '38', helper: 'Unqualified inquiries' },
      { key: 'assigned-leads', label: 'Assigned Leads', icon: Users, metric: '24', helper: 'Owned by LQT agents' },
      { key: 'qualification', label: 'Lead Qualification', icon: CheckCircle2, metric: '31', helper: 'Profile checks' },
      { key: 'lead-status', label: 'Lead Status', icon: SlidersHorizontal, metric: '4', helper: 'Hot/Warm/Cold/Rejected' },
      { key: 'follow-ups', label: 'Follow-Ups', icon: Phone, metric: '17', helper: 'Pending calls' },
      { key: 'call-notes', label: 'Call Notes', icon: MessageSquare, metric: '64', helper: 'Logged conversations' },
      { key: 'meeting-scheduling', label: 'Meeting Scheduling', icon: Calendar, metric: '6', helper: 'Booked meetings' },
      { key: 'sales-assignment', label: 'Lead Assignment to Sales', icon: ArrowRight, metric: '12', helper: 'Sales handoffs' },
      { key: 'lead-history', label: 'Lead History', icon: History, metric: '120', helper: 'Timeline records' },
    ],
    rows: [
      { account: 'Pioneer Infra', owner: 'Aarav', detail: 'Copper cathode, 12 MT', status: 'Hot', next: 'Call today 4:30 PM', value: 'High' },
      { account: 'Kavya Electricals', owner: 'Meera', detail: 'Aluminium ingots, monthly supply', status: 'Warm', next: 'Send buyer profile', value: 'Medium' },
      { account: 'Northline Works', owner: 'Rohan', detail: 'Steel coils for fabrication', status: 'Cold', next: 'Follow-up Friday', value: 'Low' },
      { account: 'Vertex Components', owner: 'Isha', detail: 'Brass rods, export inquiry', status: 'Hot', next: 'Schedule sales meeting', value: 'High' },
    ],
    activity: [
      'Pioneer Infra marked Hot after budget confirmation',
      'Vertex Components assigned to Sales queue',
      'Kavya Electricals call notes updated',
      'Northline Works follow-up moved to Friday',
    ],
    priorities: ['Call back Hot leads', 'Complete qualification checklist', 'Assign sales-ready leads', 'Update lead history'],
  },
  sales: {
    title: 'Sales Dashboard',
    eyebrow: 'Commercial Team',
    route: '/sales',
    roleLabel: 'Sales',
    theme: roleThemes.sales,
    primaryColumn: 'Customer',
    detailColumn: 'Commercial Work',
    stats: [
      { label: 'Assigned Leads', value: '29', helper: 'Active opportunities', icon: Users, tone: 'blue' },
      { label: 'Open RFQs', value: '14', helper: 'Awaiting pricing', icon: ClipboardList, tone: 'gold' },
      { label: 'Quotations', value: '9', helper: 'Sent this week', icon: FileText, tone: 'green' },
      { label: 'Orders', value: '5', helper: 'In confirmation', icon: Package, tone: 'violet' },
    ],
    statuses: [
      { label: 'Assigned', value: 29, tone: 'blue' },
      { label: 'RFQ', value: 14, tone: 'gold' },
      { label: 'Negotiation', value: 8, tone: 'violet' },
      { label: 'Converted', value: 5, tone: 'green' },
    ],
    modules: [
      { key: 'overview', label: 'Dashboard Overview', icon: BarChart3, metric: '74%', helper: 'Conversion health' },
      { key: 'assigned-leads', label: 'Assigned Leads', icon: Users, metric: '29', helper: 'Sales-owned leads' },
      { key: 'customer-management', label: 'Customer Management', icon: Briefcase, metric: '46', helper: 'Managed accounts' },
      { key: 'rfq-management', label: 'RFQ Management', icon: ClipboardList, metric: '14', helper: 'Open RFQs' },
      { key: 'quotation-management', label: 'Quotation Management', icon: FileText, metric: '9', helper: 'Live quotes' },
      { key: 'negotiation-tracking', label: 'Negotiation Tracking', icon: TrendingUp, metric: '8', helper: 'In negotiation' },
      { key: 'order-management', label: 'Order Management', icon: Package, metric: '5', helper: 'Pending orders' },
      { key: 'follow-ups', label: 'Follow-Ups', icon: Phone, metric: '21', helper: 'Buyer touchpoints' },
      { key: 'sales-reports', label: 'Sales Reports', icon: FileSpreadsheet, metric: '12', helper: 'Report views' },
      { key: 'lead-conversion', label: 'Lead Conversion Tracking', icon: Target, metric: '18%', helper: 'Lead to order' },
    ],
    rows: [
      { account: 'Vertex Components', owner: 'Nikhil', detail: 'Quotation revision for brass rods', status: 'Negotiation', next: 'Price approval today', value: 'Rs 18.4L' },
      { account: 'Pioneer Infra', owner: 'Ritu', detail: 'RFQ for copper cathode', status: 'RFQ', next: 'Procurement price check', value: 'Rs 42L' },
      { account: 'Apex Rail Systems', owner: 'Kabir', detail: 'Order confirmation for steel coils', status: 'Order', next: 'Send PI', value: 'Rs 27L' },
      { account: 'Kavya Electricals', owner: 'Nikhil', detail: 'Customer profile and credit terms', status: 'Assigned', next: 'Discovery call', value: 'Rs 9.8L' },
    ],
    activity: [
      'Vertex Components quote moved to negotiation',
      'Apex Rail Systems purchase intent logged',
      'Pioneer Infra RFQ sent for supplier pricing',
      'Kavya Electricals follow-up scheduled',
    ],
    priorities: ['Update negotiation notes', 'Send pending quotations', 'Confirm order terms', 'Review conversion report'],
  },
  procurement: {
    title: 'Procurement Dashboard',
    eyebrow: 'Sourcing Team',
    route: '/procurement',
    roleLabel: 'Procurement',
    theme: roleThemes.procurement,
    primaryColumn: 'Supplier',
    detailColumn: 'Procurement Work',
    stats: [
      { label: 'Suppliers', value: '54', helper: 'Approved vendors', icon: Truck, tone: 'blue' },
      { label: 'Price Requests', value: '18', helper: 'Awaiting vendor response', icon: ClipboardList, tone: 'gold' },
      { label: 'Comparisons', value: '7', helper: 'Ready for decision', icon: BarChart3, tone: 'green' },
      { label: 'Purchase Orders', value: '11', helper: 'In progress', icon: FileText, tone: 'violet' },
    ],
    statuses: [
      { label: 'Requested', value: 18, tone: 'gold' },
      { label: 'Quoted', value: 15, tone: 'blue' },
      { label: 'Approved', value: 11, tone: 'green' },
      { label: 'At Risk', value: 3, tone: 'red' },
    ],
    modules: [
      { key: 'overview', label: 'Dashboard Overview', icon: BarChart3, metric: '91%', helper: 'Sourcing coverage' },
      { key: 'supplier-management', label: 'Supplier Management', icon: Truck, metric: '54', helper: 'Vendor accounts' },
      { key: 'price-requests', label: 'Price Requests', icon: ClipboardList, metric: '18', helper: 'Open requests' },
      { key: 'vendor-comparison', label: 'Vendor Comparison', icon: BarChart3, metric: '7', helper: 'Shortlists' },
      { key: 'cost-analysis', label: 'Cost Analysis', icon: TrendingUp, metric: '4.6%', helper: 'Savings tracked' },
      { key: 'purchase-orders', label: 'Purchase Orders', icon: FileText, metric: '11', helper: 'POs active' },
      { key: 'availability-tracking', label: 'Availability Tracking', icon: Clock, metric: '23', helper: 'Stock checks' },
      { key: 'procurement-reports', label: 'Procurement Reports', icon: FileSpreadsheet, metric: '8', helper: 'Reports generated' },
      { key: 'supplier-communication', label: 'Supplier Communication', icon: Mail, metric: '32', helper: 'Vendor threads' },
    ],
    rows: [
      { account: 'Shakti Metals', owner: 'Ananya', detail: 'Copper cathode price request', status: 'Quoted', next: 'Compare landed cost', value: '-2.1%' },
      { account: 'Bharat Alloys', owner: 'Dev', detail: 'Steel coil availability', status: 'Requested', next: 'Vendor reminder', value: '3 days' },
      { account: 'Global Ferro', owner: 'Ananya', detail: 'Brass rods supplier comparison', status: 'Approved', next: 'Raise PO', value: '-4.6%' },
      { account: 'Metalink Exports', owner: 'Kabir', detail: 'Aluminium ingot delivery risk', status: 'At Risk', next: 'Escalate alternate', value: '+1.8%' },
    ],
    activity: [
      'Global Ferro selected for brass rods purchase order',
      'Metalink Exports flagged for delivery risk',
      'Shakti Metals quotation added to comparison',
      'Bharat Alloys reminder queued',
    ],
    priorities: ['Close pending price requests', 'Compare top vendor offers', 'Raise approved POs', 'Escalate availability risks'],
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
          <p className="mt-1 text-xs text-zinc-500">{stat.helper}</p>
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
    status === 'Hot' || status === 'At Risk'
      ? 'red'
      : status === 'Warm' || status === 'RFQ' || status === 'Requested'
        ? 'gold'
        : status === 'Approved' || status === 'Order'
          ? 'green'
          : status === 'Negotiation'
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
  return (
    <div className={`overflow-x-auto rounded-2xl border ${roleClass.borderSoft} ${roleClass.inner}`}>
      <table className="w-full min-w-[760px] text-sm">
        <thead className={`border-b ${roleClass.borderSoft} text-left text-xs uppercase tracking-[0.14em] text-zinc-500`}>
          <tr>
            <th className="px-4 py-3">{config.primaryColumn}</th>
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
              <td className="px-4 py-3 font-semibold text-white">{row.account}</td>
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
                    className={`rounded-lg border ${roleClass.border} ${roleClass.bgSoft} px-2.5 py-1.5 text-xs font-semibold ${roleClass.text}`}
                  >
                    Open Form
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
                  <div className={`h-full rounded-full bg-gradient-to-r ${toneClass[status.tone].bar}`} style={{ width: `${width}%` }} />
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
  return (
    <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
      <Panel>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Work Queue</p>
            <h3 className="mt-1 font-display text-2xl text-white">{selectedModule.label}</h3>
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
      ? ['Supplier name', 'Material category', 'GST / compliance', 'Preferred lane']
      : kind === 'sales'
        ? ['Customer name', 'Industry', 'Buying cycle', 'Credit profile']
        : ['Lead source', 'Material need', 'Budget range', 'Decision maker'];

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <Panel>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Intake Desk</p>
            <h3 className="mt-1 font-display text-2xl text-white">{selectedModule.label}</h3>
          </div>
          <span className={`rounded-full border ${roleClass.border} ${roleClass.bgSoft} px-3 py-1 text-xs ${roleClass.textSoft}`}>
            Fresh queue
          </span>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {filteredRows.map((row) => (
            <article key={row.account} className={`rounded-2xl border ${roleClass.borderSoft} ${roleClass.card} p-4`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{row.account}</p>
                  <p className="mt-1 text-sm text-zinc-400">{row.detail}</p>
                </div>
                <StatusChip status={row.status} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <span className={`rounded-xl border ${roleClass.borderSoft} ${roleClass.inner} px-3 py-2 text-zinc-400`}>Owner: {row.owner}</span>
                <span className={`rounded-xl border ${roleClass.borderSoft} ${roleClass.inner} px-3 py-2 text-zinc-400`}>Priority: {row.value}</span>
              </div>
              <button
                type="button"
                disabled={actionBusy}
                onClick={() => onOpenForm(row)}
                className={`mt-4 inline-flex items-center gap-2 rounded-xl ${roleClass.cta} px-3 py-2 text-xs font-bold text-black disabled:opacity-60`}
              >
                Open Intake
                <ArrowRight size={14} />
              </button>
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
            {kind === 'lqt' ? 'Open an assigned lead' : 'Open Validated Form'}
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
    selectedModule.key === 'cost-analysis'
      ? ['Base rate verified', 'Freight captured', 'Payment terms compared', 'Margin impact checked']
      : selectedModule.key === 'lead-conversion'
        ? ['Source tracked', 'RFQ created', 'Quote sent', 'Order won']
        : ['Need verified', 'Authority confirmed', 'Budget discussed', 'Timeline captured'];

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
      <Panel>
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Scoring Workspace</p>
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

function ProcessWorkspace({ config, filteredRows, selectedModule, queueMode, setQueueMode, actionBusy, onRowAction, onOpenForm }: WorkspaceProps) {
  return (
    <Panel>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Process Control</p>
          <h3 className="mt-1 font-display text-2xl text-white">{selectedModule.label}</h3>
        </div>
        <QueueModeControl queueMode={queueMode} setQueueMode={setQueueMode} />
      </div>
      <div className="mt-5">
        <WorkTable config={config} rows={filteredRows} onOpenForm={onOpenForm} />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {['Prepare document', 'Internal approval', 'Customer/vendor update'].map((step, index) => (
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
  activeModule: string;
  busy: boolean;
  onClose: () => void;
  onSave: (row: WorkRow, payload: Record<string, unknown>) => void;
};

function OperationsFormModal({ kind, row, members, activeModule, busy, onClose, onSave }: OperationsFormModalProps) {
  const isQuote = row.source === 'quote';
  const [title, setTitle] = useState(row.account || '');
  const [assigneeId, setAssigneeId] = useState(
    row.assignedTo || members.find((member) => member.name === row.owner)?.id || ''
  );
  const [detail, setDetail] = useState(row.requirement || row.detail || '');
  const [status, setStatus] = useState(row.status || (kind === 'procurement' ? 'Requested' : 'in_review'));
  const [leadTemperature, setLeadTemperature] = useState(row.status?.toLowerCase() || 'warm');
  const [nextStep, setNextStep] = useState(row.next === 'Review requirement' ? '' : row.next || '');
  const [value, setValue] = useState(row.value || '');
  const [note, setNote] = useState('');
  const [followUpAt, setFollowUpAt] = useState('');
  const [quotationAmount, setQuotationAmount] = useState('');
  const [handoffToSales, setHandoffToSales] = useState(kind === 'lqt' && activeModule === 'sales-assignment');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const memberById = new Map(members.map((member) => [member.id, member]));
  const inputClass = `w-full rounded-xl border ${roleClass.border} ${roleClass.inner} px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 ${roleClass.focus}`;

  const submit = () => {
    const nextErrors: Record<string, string> = {};
    if (!isQuote && !title.trim()) nextErrors.title = 'Name is required';
    if (!handoffToSales && !assigneeId) nextErrors.assignee = 'Select an assigned employee';
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
      status: status.trim(),
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
          <label>
            <span className="text-xs uppercase tracking-[0.14em] text-zinc-500">{isQuote ? 'Account' : kind === 'procurement' ? 'Supplier name' : 'Customer name'}</span>
            <input className={`${inputClass} mt-2`} value={title} onChange={(event) => setTitle(event.target.value)} disabled={isQuote} />
            {errors.title ? <span className="mt-1 block text-xs text-red-300">{errors.title}</span> : null}
          </label>

          <label>
            <span className="text-xs uppercase tracking-[0.14em] text-zinc-500">Assigned employee</span>
            <select
              className={`${inputClass} mt-2`}
              value={assigneeId}
              onChange={(event) => setAssigneeId(event.target.value)}
              disabled={handoffToSales}
            >
              <option value="">Select {kind} employee</option>
              {members.map((member) => (
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
                <input type="checkbox" checked={handoffToSales} onChange={(event) => setHandoffToSales(event.target.checked)} />
                <span className="text-sm text-zinc-300">Qualified: hand off to Sales queue</span>
              </label>
            </>
          ) : (
            <label>
              <span className="text-xs uppercase tracking-[0.14em] text-zinc-500">Status</span>
              <input className={`${inputClass} mt-2`} value={status} onChange={(event) => setStatus(event.target.value)} />
            </label>
          )}

          <label>
            <span className="text-xs uppercase tracking-[0.14em] text-zinc-500">Next step</span>
            <input className={`${inputClass} mt-2`} value={nextStep} onChange={(event) => setNextStep(event.target.value)} placeholder="Follow-up action" />
            {errors.nextStep ? <span className="mt-1 block text-xs text-red-300">{errors.nextStep}</span> : null}
          </label>

          {kind !== 'lqt' ? (
            <label>
              <span className="text-xs uppercase tracking-[0.14em] text-zinc-500">{kind === 'sales' && isQuote ? 'Quotation amount (INR)' : 'Value'}</span>
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

          <label className="md:col-span-2">
            <span className="text-xs uppercase tracking-[0.14em] text-zinc-500">Work note</span>
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
  if (['new-leads', 'customer-management', 'supplier-management'].includes(activeModule)) {
    return <IntakeWorkspace {...props} />;
  }
  if (activeModule === 'assigned-leads') return <AssignmentWorkspace {...props} />;
  if (['qualification', 'lead-conversion', 'cost-analysis'].includes(activeModule)) {
    return <ScorecardWorkspace {...props} />;
  }
  if (['lead-status', 'negotiation-tracking', 'vendor-comparison'].includes(activeModule)) {
    return <BoardWorkspace {...props} />;
  }
  if (['follow-ups', 'supplier-communication'].includes(activeModule)) return <FollowUpWorkspace {...props} />;
  if (activeModule === 'call-notes') return <NotesWorkspace {...props} />;
  if (['meeting-scheduling', 'availability-tracking'].includes(activeModule)) return <ScheduleWorkspace {...props} />;
  if (
    [
      'sales-assignment',
      'rfq-management',
      'quotation-management',
      'order-management',
      'price-requests',
      'purchase-orders',
    ].includes(activeModule)
  ) {
    return <ProcessWorkspace {...props} />;
  }
  if (['lead-history', 'sales-reports', 'procurement-reports'].includes(activeModule)) return <HistoryWorkspace {...props} />;
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
  const [formRow, setFormRow] = useState<WorkRow | null>(null);
  const [moduleCounts, setModuleCounts] = useState<Record<string, number>>({});
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
      const [data, teamMembers] = await Promise.all([operationsApi.getDashboard(kind), operationsApi.getMembers(kind)]);
      setServerRows(data.rows.map((row: OperationRow) => ({ ...row, id: String(row.id) })));
      setMembers(teamMembers);
      setModuleCounts(data.modules || {});
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
      if (row.source === 'quote' && (kind === 'lqt' || kind === 'sales')) {
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
          if (activeModule === 'quotation-management') {
            quotePayload.quotation = { amount: 100000, currency: 'INR', status: 'sent' };
          }
          if (activeModule === 'order-management') {
            quotePayload.order = { status: 'pending', amount: 100000 };
          }
          if (activeModule === 'follow-ups') {
            quotePayload.followUp = { note: 'Sales follow-up logged', dueAt: new Date().toISOString() };
          }
          if (activeModule === 'assigned-leads') quotePayload.status = 'in_review';
        }

        await operationsApi.updateQuote(kind, row.id, quotePayload);
      } else if (row.source === 'operation' && (kind === 'sales' || kind === 'procurement')) {
        await operationsApi.updateRecord(kind, row.id, {
          status: action === 'Requested' ? 'Requested' : action === 'At Risk' ? 'At Risk' : 'Updated',
          note: `${selectedModule.label}: ${action}`,
        });
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
    if (kind !== 'sales' && kind !== 'procurement') {
      toast.error('Create quote requests from the website or Flutter app');
      return;
    }

    setActionBusy(true);
    try {
      await operationsApi.createRecord(kind, {
        module,
        title: kind === 'procurement' ? 'New Supplier Draft' : 'New Customer Draft',
        detail: selectedModule.helper,
        status: 'open',
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
      status: kind === 'procurement' ? 'Requested' : 'open',
      next: '',
      value: '',
    });
  };

  const handleSaveForm = async (row: WorkRow, payload: Record<string, unknown>) => {
    setActionBusy(true);
    try {
      if (row.source === 'quote' && row.id && (kind === 'lqt' || kind === 'sales')) {
        await operationsApi.updateQuote(kind, row.id, payload);
      } else if (row.source === 'operation' && row.id && (kind === 'sales' || kind === 'procurement')) {
        await operationsApi.updateRecord(kind, row.id, payload);
      } else if (row.source === 'operation' && (kind === 'sales' || kind === 'procurement')) {
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
        <p className="font-display text-lg text-white">{config.roleLabel}</p>
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
              <div className={`mb-3 inline-flex rounded-2xl border ${roleClass.border} ${roleClass.bgSoft} p-3 ${roleClass.text}`}>
                <ShieldCheck size={24} />
              </div>
              <h1 className="font-display text-2xl text-white">{config.title}</h1>
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
                >
                  <Icon size={17} className={active ? roleClass.text : 'text-zinc-500'} />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  <span className={`rounded-md border ${roleClass.borderSoft} bg-black/20 px-1.5 py-0.5 text-[10px] text-zinc-500`}>
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
                  className={`inline-flex items-center justify-center gap-2 rounded-xl ${roleClass.cta} px-4 py-2.5 text-sm font-extrabold text-black shadow-glow hover:brightness-110`}
                >
                  <SelectedIcon size={16} />
                  {loadingOperations ? 'Syncing' : selectedModule.metric}
                </button>
              </div>
            </div>
          </header>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {config.stats.map((stat) => (
              <StatCard key={stat.label} stat={stat} />
            ))}
          </section>

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
                      <span className="mt-1 block text-sm text-zinc-500">{module.helper}</span>
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
          activeModule={activeModule}
          busy={actionBusy}
          onClose={() => setFormRow(null)}
          onSave={handleSaveForm}
        />
      ) : null}
    </div>
  );
}
