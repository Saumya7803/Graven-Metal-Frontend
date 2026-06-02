import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Database,
  Eye,
  FileText,
  Folder,
  Globe2,
  HardDriveDownload,
  KeyRound,
  History,
  LogOut,
  Mail,
  Menu,
  Package,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings as SettingsIcon,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  UserCog,
  UserPlus,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { superAdminApi } from '../lib/superAdminApi';
import { clearAuth, getAuthUser } from '../lib/auth';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { SEO } from '../components/seo/SEO';

const allPermissions = [
  'manage_leads',
  'qualify_leads',
  'assign_leads',
  'manage_customers',
  'manage_rfqs',
  'manage_quotations',
  'manage_negotiations',
  'manage_orders',
  'manage_suppliers',
  'manage_price_requests',
  'compare_vendors',
  'manage_purchase_orders',
  'view_platform_monitoring',
  'manage_products',
  'manage_categories',
  'manage_blogs',
  'manage_quotes',
  'manage_contacts',
  'manage_users',
  'manage_admins',
  'manage_settings',
  'manage_seo',
  'view_analytics',
  'backup_database',
];

const tabs = [
  { key: 'analytics', label: 'Dashboard Overview', icon: BarChart3 },
  { key: 'admins', label: 'Role & Permissions', icon: ShieldCheck },
  { key: 'users', label: 'User Management', icon: Users },
  { key: 'customers', label: 'Customers', icon: UserCog },
  { key: 'audit', label: 'Audit Logs', icon: History },
  { key: 'settings', label: 'System Settings', icon: SettingsIcon },
  { key: 'seo', label: 'SEO', icon: Globe2 },
  { key: 'backup', label: 'Platform Monitoring', icon: Database },
] as const;

type Tab = (typeof tabs)[number]['key'];

type UserRole = 'super_admin' | 'admin' | 'editor' | 'user' | string;

type UserRow = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
  createdAt?: string;
  lastLoginAt?: string;
  lastActiveAt?: string;
  twoFactorEnabled?: boolean;
};

type CustomerActivityRow = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  registered: boolean;
  joinedAt?: string;
  quoteCount: number;
  contactCount: number;
  openQuotes: number;
  unreadContacts: number;
  lastActivityAt?: string;
  lastActivityType?: string;
  lastActivityDetail?: string;
};

type Settings = {
  siteName: string;
  supportEmail: string;
  maintenanceMode: boolean;
};

type SeoSettings = {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  ogImage: string;
};

type Analytics = {
  totals?: {
    users?: number;
    products?: number;
    categories?: number;
    blogs?: number;
    quotes?: number;
    contacts?: number;
    admins?: number;
  };
  quoteByStatus?: Array<{ _id: string; count: number }>;
  contactByStatus?: Array<{ _id: string; count: number }>;
  usersByRole?: Array<{ _id: string; count: number }>;
  recentUsers?: Array<{ _id: string; name: string; email: string; role: string; createdAt?: string }>;
};

type AuditLogRow = {
  _id: string;
  action: string;
  actor?: { name?: string; email?: string; role?: string };
  target?: { type?: string; id?: string; label?: string };
  metadata?: Record<string, unknown>;
  createdAt?: string;
};

type Tone = 'gold' | 'green' | 'blue' | 'red';

function ModalShell({
  title,
  eyebrow,
  onClose,
  children,
}: {
  title: string;
  eyebrow?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-md">
      <div className="relative max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-[1.7rem] border border-gold/25 bg-[#080d13] shadow-halo">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
        <div className="flex items-start justify-between gap-4 border-b border-gold/10 bg-steel-sheen px-5 py-4">
          <div>
            {eyebrow ? <p className="text-xs uppercase tracking-[0.24em] text-gold/70">{eyebrow}</p> : null}
            <h3 className="font-display text-2xl text-white">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gold/20 bg-[#0d1218] p-2 text-zinc-300 hover:border-gold/50 hover:text-gold"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[76vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = 'gold',
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: LucideIcon;
  tone?: Tone;
}) {
  const tones: Record<Tone, string> = {
    gold: 'from-gold/20 text-gold ring-gold/30',
    green: 'from-emerald-400/18 text-emerald-300 ring-emerald-400/25',
    blue: 'from-sky-400/18 text-sky-300 ring-sky-400/25',
    red: 'from-red-400/18 text-red-300 ring-red-400/25',
  };

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-gold/15 bg-[#0a0f14]/95 p-4 shadow-glow">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-gold/[0.04] opacity-70" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">{label}</p>
          <p className="mt-3 text-3xl font-extrabold text-white">{value}</p>
          <p className="mt-1 text-xs text-zinc-400">{helper}</p>
        </div>
        <div className={`rounded-2xl bg-gradient-to-br to-transparent p-3 ring-1 ${tones[tone]}`}>
          <Icon size={20} />
        </div>
      </div>
    </article>
  );
}

function EmptyState({
  title,
  message,
  action,
  onAction,
}: {
  title: string;
  message: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-gold/20 bg-[#0b1119] p-8 text-center">
      <p className="font-display text-xl text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">{message}</p>
      {action && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-gold/20 bg-gold/10 px-3 py-2 text-xs font-semibold text-gold hover:border-gold/50 hover:bg-gold/15"
        >
          {action}
          <ArrowRight size={14} />
        </button>
      ) : null}
    </div>
  );
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function formatPermission(permission: string) {
  return permission.replace(/_/g, ' ');
}

function formatAuditAction(action: string) {
  return action
    .split('.')
    .map((part) => formatPermission(part))
    .join(' · ');
}

function formatAuditValue(value: unknown): string {
  if (value == null) return '—';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (!value.length) return '—';
    return value.map((item) => formatAuditValue(item)).join(', ');
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (typeof record.label === 'string' && record.label.trim()) return record.label;
    if (typeof record.name === 'string' && record.name.trim()) return record.name;
    if (typeof record.email === 'string' && record.email.trim()) return record.email;

    const pairs = Object.entries(record)
      .filter(([, entry]) => entry != null && entry !== '')
      .slice(0, 2)
      .map(([key, entry]) => `${formatPermission(key)}: ${formatAuditValue(entry)}`);

    return pairs.length ? pairs.join(' · ') : '—';
  }

  return String(value);
}

function getAuditMetadataSummary(metadata?: Record<string, unknown>) {
  if (!metadata) return [];

  return Object.entries(metadata)
    .filter(([, value]) => value != null && value !== '' && !(Array.isArray(value) && value.length === 0))
    .map(([key, value]) => ({
      label: formatPermission(key),
      value: formatAuditValue(value),
    }));
}

function formatDate(date?: string) {
  if (!date) return 'Recently';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

function formatDateTime(date?: string) {
  if (!date) return 'Never';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

function getRoleTone(role: string) {
  if (role === 'super_admin') return 'border-gold/35 bg-gold/10 text-gold';
  if (role === 'lqt') return 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200';
  if (role === 'sales') return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200';
  if (role === 'procurement') return 'border-violet-400/30 bg-violet-400/10 text-violet-200';
  if (role === 'admin') return 'border-sky-400/30 bg-sky-400/10 text-sky-200';
  if (role === 'editor') return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200';
  return 'border-zinc-600/60 bg-zinc-800/70 text-zinc-300';
}

function matchesUser(row: UserRow, query: string) {
  const search = query.trim().toLowerCase();
  if (!search) return true;
  return [row.name, row.email, row.role, ...(row.permissions || [])].some((value) =>
    String(value).toLowerCase().includes(search)
  );
}

export function SuperAdminPage() {
  const navigate = useNavigate();
  const currentUser = getAuthUser();

  const [tab, setTab] = useState<Tab>('analytics');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createAdminOpen, setCreateAdminOpen] = useState(false);
  const [adminSearch, setAdminSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [lastBackup, setLastBackup] = useState<{ fileName?: string; generatedAt: string } | null>(null);

  const [admins, setAdmins] = useState<UserRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [customerActivity, setCustomerActivity] = useState<CustomerActivityRow[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRow[]>([]);
  const [settings, setSettings] = useState<Settings>({
    siteName: '',
    supportEmail: '',
    maintenanceMode: false,
  });
  const [seo, setSeo] = useState<SeoSettings>({ metaTitle: '', metaDescription: '', keywords: [], ogImage: '' });
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    role: 'lqt',
    permissions: [] as string[],
  });

  const panel = 'rounded-3xl border border-gold/20 bg-[#0a0f14]/95 p-5 shadow-glow';
  const input =
    'w-full rounded-xl border border-gold/20 bg-[#0d1218] px-3.5 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-gold/60';
  const label = 'text-xs uppercase tracking-[0.18em] text-zinc-400';
  const tableWrap = 'overflow-x-auto rounded-2xl border border-gold/15 bg-[#070c12]';
  const tableHead = 'text-left text-xs uppercase tracking-[0.15em] text-zinc-400';

  const load = async () => {
    setLoading(true);
    try {
      const [adminRows, userRows, customerRows, siteSettings, analyticsData, seoData, auditRows] = await Promise.all([
        superAdminApi.getAdmins(),
        superAdminApi.getUsers(),
        superAdminApi.getCustomerActivity(),
        superAdminApi.getSettings(),
        superAdminApi.getAnalytics(),
        superAdminApi.getSEO(),
        superAdminApi.getAuditLogs(),
      ]);

      setAdmins(Array.isArray(adminRows) ? adminRows : []);
      setUsers(Array.isArray(userRows) ? userRows : []);
      setCustomerActivity(Array.isArray(customerRows) ? customerRows : []);
      setAuditLogs(Array.isArray(auditRows) ? auditRows : []);
      setSettings({
        siteName: siteSettings?.siteName || '',
        supportEmail: siteSettings?.supportEmail || '',
        maintenanceMode: !!siteSettings?.maintenanceMode,
      });
      setAnalytics(analyticsData || null);
      setSeo({
        metaTitle: seoData?.metaTitle || '',
        metaDescription: seoData?.metaDescription || '',
        keywords: Array.isArray(seoData?.keywords) ? seoData.keywords : [],
        ogImage: seoData?.ogImage || '',
      });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totals = analytics?.totals || {};
  const totalUsers = totals.users ?? users.length;
  const totalAdmins = admins.length;
  const totalContent = (totals.products || 0) + (totals.categories || 0) + (totals.blogs || 0);
  const totalRequests = (totals.quotes || 0) + (totals.contacts || 0);
  const quoteStatuses = analytics?.quoteByStatus || [];
  const contactStatuses = analytics?.contactByStatus || [];
  const usersByRole = analytics?.usersByRole || [];
  const recentUsers = analytics?.recentUsers || [];
  const quoteTotal = quoteStatuses.reduce((sum, item) => sum + item.count, 0);
  const contactTotal = contactStatuses.reduce((sum, item) => sum + item.count, 0);
  const closedQuotes = quoteStatuses.find((item) => item._id === 'closed')?.count || 0;
  const openQuotes = Math.max(quoteTotal - closedQuotes, 0);
  const unreadContacts = contactStatuses.find((item) => item._id === 'unread')?.count || 0;
  const seoCompleteness = [seo.metaTitle, seo.metaDescription, seo.ogImage, seo.keywords.length ? 'keywords' : ''].filter(
    Boolean
  ).length;

  const filteredAdmins = useMemo(
    () => admins.filter((admin) => matchesUser(admin, adminSearch)),
    [admins, adminSearch]
  );

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesRole && matchesUser(user, userSearch);
      }),
    [roleFilter, userSearch, users]
  );

  const filteredCustomerActivity = useMemo(() => {
    const query = customerSearch.trim().toLowerCase();
    return customerActivity.filter((row) => {
      if (!query) return true;
      return `${row.name} ${row.email} ${row.phone || ''} ${row.company || ''} ${row.lastActivityDetail || ''}`
        .toLowerCase()
        .includes(query);
    });
  }, [customerActivity, customerSearch]);

  const customerTotals = useMemo(
    () => ({
      tracked: customerActivity.length,
      registered: customerActivity.filter((row) => row.registered).length,
      openQuotes: customerActivity.reduce((sum, row) => sum + row.openQuotes, 0),
      unreadContacts: customerActivity.reduce((sum, row) => sum + row.unreadContacts, 0),
    }),
    [customerActivity]
  );

  const teamManagementCards = [
    {
      label: 'LQT Team Management',
      role: 'lqt',
      count: admins.filter((row) => row.role === 'lqt').length,
      helper: 'Lead qualification ownership',
      route: '/lqt',
      icon: ClipboardList,
    },
    {
      label: 'Sales Team Management',
      role: 'sales',
      count: admins.filter((row) => row.role === 'sales').length,
      helper: 'Commercial pipeline ownership',
      route: '/sales',
      icon: UserCog,
    },
    {
      label: 'Procurement Team Management',
      role: 'procurement',
      count: admins.filter((row) => row.role === 'procurement').length,
      helper: 'Supplier and sourcing ownership',
      route: '/procurement',
      icon: Package,
    },
  ];

  const quickStats = [
    {
      label: 'Total Users',
      value: totalUsers,
      helper: pluralize(totalAdmins, 'privileged account'),
      icon: Users,
      tone: 'blue' as Tone,
    },
    {
      label: 'System State',
      value: settings.maintenanceMode ? 'Paused' : 'Live',
      helper: settings.maintenanceMode ? 'Maintenance mode is active' : 'Public site is operational',
      icon: Activity,
      tone: settings.maintenanceMode ? ('red' as Tone) : ('green' as Tone),
    },
    {
      label: 'Content Assets',
      value: totalContent,
      helper: `${totals.products || 0} products, ${totals.blogs || 0} blogs`,
      icon: FileText,
      tone: 'gold' as Tone,
    },
    {
      label: 'Requests',
      value: totalRequests,
      helper: `${openQuotes} open quote requests`,
      icon: ClipboardList,
      tone: openQuotes > 0 ? ('gold' as Tone) : ('green' as Tone),
    },
  ];

  const snapshotItems = [
    { name: 'Products', value: totals.products || 0, icon: Package },
    { name: 'Categories', value: totals.categories || 0, icon: Folder },
    { name: 'Blogs', value: totals.blogs || 0, icon: FileText },
    { name: 'Quotes', value: totals.quotes || 0, icon: ClipboardList },
    { name: 'Contacts', value: totals.contacts || 0, icon: Mail },
    { name: 'SEO Keywords', value: seo.keywords.length, icon: Globe2 },
  ];

  const checklistItems = [
    {
      text: settings.supportEmail ? 'Support email configured' : 'Add support email',
      done: !!settings.supportEmail,
      target: 'settings' as Tab,
    },
    {
      text: seoCompleteness >= 3 ? 'SEO foundation looks healthy' : 'Complete SEO metadata',
      done: seoCompleteness >= 3,
      target: 'seo' as Tab,
    },
    {
      text: totalAdmins > 0 ? 'Team coverage available' : 'Create one team account',
      done: totalAdmins > 0,
      target: 'admins' as Tab,
    },
    {
      text: lastBackup ? 'Backup created this session' : 'Create a fresh backup',
      done: !!lastBackup,
      target: 'backup' as Tab,
    },
  ];

  const saveAdminPermissions = async (admin: UserRow) => {
    setSaving(true);
    try {
      await superAdminApi.assignPermissions(admin._id, admin.permissions || [], admin.role);
      toast.success('Admin permissions saved');
      await load();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const saveUserRole = async (user: UserRow) => {
    setSaving(true);
    try {
      await superAdminApi.updateUser(user._id, { role: user.role, permissions: user.permissions || [] });
      toast.success('User role updated');
      await load();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const deleteAdmin = async (admin: UserRow) => {
    if (!window.confirm(`Delete team member "${admin.name}"? This cannot be undone.`)) return;
    try {
      await superAdminApi.deleteAdmin(admin._id);
      toast.success('Admin deleted');
      await load();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const deleteUser = async (user: UserRow) => {
    if (!window.confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
    try {
      await superAdminApi.deleteUser(user._id);
      toast.success('User deleted');
      await load();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const revokeSessions = async (user: UserRow) => {
    if (!window.confirm(`Revoke all active sessions for "${user.email}"? They will need to log in again.`)) return;
    setSaving(true);
    try {
      await superAdminApi.revokeUserSessions(user._id);
      toast.success('Active sessions revoked');
      await load();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const activeTab = tabs.find((item) => item.key === tab) || tabs[0];
  const ActiveIcon = activeTab.icon;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#03070b] px-4 py-4 text-zinc-200 md:px-6 md:py-6">
      <SEO title="Super Admin Dashboard" description="Super admin panel" path="/super-admin" noIndex />
      {loading ? <LoadingOverlay /> : null}

      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -left-28 top-10 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-[28rem] w-[28rem] rounded-full bg-sky-400/5 blur-3xl" />
        <div className="absolute inset-0 bg-metal-grid bg-[length:72px_72px] opacity-[0.16]" />
      </div>

      <div className="relative mx-auto flex max-w-[1500px] items-center justify-between rounded-2xl border border-gold/15 bg-[#0a0f14]/95 px-4 py-3 shadow-glow md:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="rounded-xl border border-gold/20 bg-[#0d1218] p-2 text-gold"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <p className="font-display text-lg text-white">Super Admin</p>
        <Shield size={18} className="text-gold" />
      </div>

      <div className="relative mx-auto mt-4 grid max-w-[1500px] gap-5 md:mt-0 md:grid-cols-[290px_1fr]">
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          } fixed inset-y-0 left-0 z-40 flex w-[285px] flex-col border-r border-gold/15 bg-[#070b10] p-4 shadow-glow transition-transform md:sticky md:top-6 md:h-[calc(100vh-3rem)] md:w-auto md:rounded-[1.7rem] md:border md:border-gold/20 md:bg-[#0a0f14]/95`}
        >
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <div className="mb-3 inline-flex rounded-2xl border border-gold/25 bg-gold/10 p-3 text-gold">
                <ShieldCheck size={24} />
              </div>
              <h1 className="font-display text-2xl text-white">GRAVEN Control</h1>
              <p className="mt-1 text-xs text-zinc-400">Super admin command panel</p>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-xl border border-gold/20 bg-[#0d1218] p-2 text-zinc-300 md:hidden"
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-2">
            {tabs.map((item) => {
              const Icon = item.icon;
              const selected = tab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setTab(item.key);
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm ${
                    selected
                      ? 'bg-gradient-to-r from-brass to-gold font-bold text-black shadow-gold'
                      : 'border border-gold/10 bg-[#0d1218] text-zinc-300 hover:border-gold/35 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="mt-auto rounded-2xl border border-gold/15 bg-[#0d1218] p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Signed in as</p>
            <p className="mt-2 truncate text-sm font-semibold text-white">{currentUser?.name || 'Super Admin'}</p>
            <p className="truncate text-xs text-zinc-400">{currentUser?.email || 'Privileged session'}</p>
            <button
              type="button"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gold/20 bg-[#090d13] px-3 py-2 text-sm text-zinc-200 hover:border-gold/45 hover:text-gold"
              onClick={() => {
                clearAuth();
                navigate('/auth', { replace: true });
              }}
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </aside>

        {sidebarOpen ? (
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/60 md:hidden"
          />
        ) : null}

        <main className="space-y-5">
          <section className="relative overflow-hidden rounded-[2rem] border border-gold/20 bg-[#0a0f14] p-5 shadow-halo md:p-6">
            <div className="absolute inset-0 bg-gold-veil opacity-70" />
            <div className="absolute right-6 top-6 hidden h-28 w-28 rounded-full border border-gold/20 bg-gold/5 md:block" />
            <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-black/25 px-3 py-1 text-xs uppercase tracking-[0.22em] text-gold/80">
                  <ActiveIcon size={14} />
                  Privilege Zone
                </div>
                <h2 className="font-display text-3xl text-white md:text-4xl">{activeTab.label}</h2>
                <p className="mt-2 max-w-2xl text-base leading-7 text-zinc-300">
                  Monitor access, configure the storefront, tune SEO, and keep recoveries one click away.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={load}
                  className="inline-flex items-center gap-2 rounded-xl border border-gold/20 bg-[#0d1218] px-4 py-2 text-sm font-semibold text-zinc-200 hover:border-gold/45 hover:text-gold"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={() => setCreateAdminOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gold-cta px-4 py-2 text-sm font-extrabold text-black shadow-gold hover:brightness-110"
                >
                  <UserPlus size={16} />
                  Create Team Account
                </button>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {quickStats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </section>

          {tab === 'analytics' ? (
            <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
              <section className={panel}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className={label}>Live Overview</p>
                    <h3 className="mt-1 font-display text-3xl text-white">Operational Snapshot</h3>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      settings.maintenanceMode
                        ? 'border-red-400/30 bg-red-400/10 text-red-200'
                        : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                    }`}
                  >
                    {settings.maintenanceMode ? 'Maintenance Enabled' : 'Site Live'}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {snapshotItems.map(({ name, value, icon: Icon }) => (
                    <div key={name} className="group relative overflow-hidden rounded-2xl border border-gold/15 bg-[#0d1218] p-4">
                      <Icon
                        size={54}
                        className="pointer-events-none absolute right-3 top-3 text-gold/10 transition group-hover:text-gold/15"
                      />
                      <p className="relative text-xs uppercase tracking-[0.16em] text-zinc-400">{name}</p>
                      <p className="relative mt-2 text-3xl font-bold text-gold">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid gap-3 lg:grid-cols-3">
                  {teamManagementCards.map(({ label: teamLabel, role, count, helper, route, icon: Icon }) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => navigate(route)}
                      className="group flex min-h-[120px] items-start gap-3 rounded-2xl border border-gold/15 bg-[#070c12] p-4 text-left hover:border-gold/40 hover:bg-[#0d1218]"
                    >
                      <span className={`rounded-xl border p-2 ${getRoleTone(role)}`}>
                        <Icon size={18} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-white">{teamLabel}</span>
                        <span className="mt-1 block text-sm text-zinc-400">{helper}</span>
                        <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-gold">
                          {count} members
                          <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
                        </span>
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-gold/15 bg-[#070c12] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className={label}>Quote Pipeline</p>
                      <p className="mt-1 text-sm text-zinc-400">{openQuotes} active quotes need commercial follow-up.</p>
                    </div>
                    <ClipboardList className="text-gold" size={22} />
                  </div>
                  <div className="mt-4 space-y-3">
                    {quoteStatuses.length ? (
                      quoteStatuses.map((status) => {
                        const width = quoteTotal ? Math.max((status.count / quoteTotal) * 100, 6) : 0;
                        return (
                          <div key={status._id}>
                            <div className="mb-1 flex items-center justify-between text-sm">
                              <span className="capitalize text-zinc-300">{formatPermission(status._id)}</span>
                              <span className="font-semibold text-gold">{status.count}</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-brass via-gold to-amberlux"
                                style={{ width: `${width}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <EmptyState
                        title="No quote activity yet"
                        message="Quote status data will appear here after requests arrive."
                        action="Review customers"
                        onAction={() => setTab('customers')}
                      />
                    )}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-gold/15 bg-[#070c12] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className={label}>Contact Queue</p>
                        <p className="mt-1 text-sm text-zinc-400">{unreadContacts} unread customer messages.</p>
                      </div>
                      <Mail className="text-gold" size={22} />
                    </div>
                    <div className="mt-4 space-y-3">
                      {contactStatuses.length ? (
                        contactStatuses.map((status) => {
                          const width = contactTotal ? Math.max((status.count / contactTotal) * 100, 6) : 0;
                          return (
                            <div key={status._id}>
                              <div className="mb-1 flex items-center justify-between text-sm">
                                <span className="capitalize text-zinc-300">{formatPermission(status._id)}</span>
                                <span className="font-semibold text-gold">{status.count}</span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                                <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-gold" style={{ width: `${width}%` }} />
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <EmptyState
                          title="No contact activity yet"
                          message="Customer messages will appear here when the queue receives new contacts."
                          action="Open customer activity"
                          onAction={() => setTab('customers')}
                        />
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gold/15 bg-[#070c12] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className={label}>Access Mix</p>
                        <p className="mt-1 text-sm text-zinc-400">Role spread across all accounts.</p>
                      </div>
                      <UserCog className="text-gold" size={22} />
                    </div>
                    <div className="mt-4 grid gap-2">
                      {usersByRole.map((role) => (
                        <div key={role._id} className="flex items-center justify-between rounded-xl border border-gold/10 bg-[#0d1218] px-3 py-2">
                          <span className={`rounded-full border px-2.5 py-1 text-xs capitalize ${getRoleTone(role._id)}`}>
                            {formatPermission(role._id)}
                          </span>
                          <span className="font-semibold text-gold">{role.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <aside className="space-y-5">
                <section className={panel}>
                  <p className={label}>Readiness</p>
                  <h3 className="mt-1 font-display text-2xl text-white">Launch Checklist</h3>
                  <div className="mt-4 space-y-3">
                    {checklistItems.map((item) => (
                      <button
                        key={item.text}
                        type="button"
                        onClick={() => setTab(item.target)}
                        className="group flex w-full items-center gap-3 rounded-2xl border border-gold/10 bg-[#0d1218] p-3 text-left hover:border-gold/35 hover:bg-[#101822]"
                      >
                        {item.done ? (
                          <CheckCircle2 size={18} className="shrink-0 text-emerald-300" />
                        ) : (
                          <span
                            aria-hidden="true"
                            className="h-[18px] w-[18px] shrink-0 rounded-full border border-zinc-400/80"
                          />
                        )}
                        <span className="min-w-0 flex-1 text-sm text-zinc-300">{item.text}</span>
                        <ArrowRight
                          size={15}
                          className="shrink-0 text-zinc-400 opacity-0 transition group-hover:translate-x-0.5 group-hover:text-gold group-hover:opacity-100"
                        />
                      </button>
                    ))}
                  </div>
                </section>

                <section className={panel}>
                  <p className={label}>Quick Actions</p>
                  <div className="mt-4 grid gap-2">
                    <button
                      type="button"
                      onClick={() => setTab('settings')}
                      className="inline-flex items-center justify-between rounded-2xl border border-gold/15 bg-[#0d1218] px-4 py-3 text-left text-sm text-zinc-300 hover:border-gold/40 hover:text-white"
                    >
                      Toggle maintenance
                      <SlidersHorizontal size={16} className="text-gold" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setTab('seo')}
                      className="inline-flex items-center justify-between rounded-2xl border border-gold/15 bg-[#0d1218] px-4 py-3 text-left text-sm text-zinc-300 hover:border-gold/40 hover:text-white"
                    >
                      Improve SEO preview
                      <Eye size={16} className="text-gold" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setTab('backup')}
                      className="inline-flex items-center justify-between rounded-2xl border border-gold/15 bg-[#0d1218] px-4 py-3 text-left text-sm text-zinc-300 hover:border-gold/40 hover:text-white"
                    >
                      Create database backup
                      <HardDriveDownload size={16} className="text-gold" />
                    </button>
                  </div>
                </section>

                <section className={panel}>
                  <p className={label}>Recent Accounts</p>
                  <div className="mt-4 space-y-2">
                    {recentUsers.length ? (
                      recentUsers.map((row) => (
                        <div key={row._id} className="rounded-2xl border border-gold/10 bg-[#0d1218] p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="truncate text-sm font-semibold text-white">{row.name}</p>
                            <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] capitalize ${getRoleTone(row.role)}`}>
                              {formatPermission(row.role)}
                            </span>
                          </div>
                          <p className="truncate text-xs text-zinc-400">{row.email}</p>
                          <p className="mt-1 text-[11px] text-zinc-500">{formatDate(row.createdAt)}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-zinc-400">No account activity yet.</p>
                    )}
                  </div>
                </section>
              </aside>
            </div>
          ) : null}

          {tab === 'admins' ? (
            <section className={panel}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className={label}>Access Control</p>
                  <h3 className="mt-1 font-display text-3xl text-white">Role & Permission Management</h3>
                </div>
                <div className="relative w-full lg:max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                  <input
                    className={`${input} pl-10`}
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    placeholder="Search team members or permissions"
                  />
                </div>
              </div>

              <div className={`mt-5 ${tableWrap}`}>
                <table className="w-full min-w-[980px] text-sm">
                  <thead className="border-b border-gold/10">
                    <tr className={tableHead}>
                      <th className="px-4 py-3">Team Member</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Permissions</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdmins.map((admin) => (
                      <tr key={admin._id} className="border-t border-gold/10 align-top">
                        <td className="px-4 py-4">
                          <p className="font-semibold text-white">{admin.name}</p>
                          <p className="mt-1 text-xs text-zinc-400">{admin.email}</p>
                          <p className="mt-2 text-xs text-zinc-500">Added {formatDate(admin.createdAt)}</p>
                          <div className="mt-3 space-y-1 rounded-xl border border-gold/10 bg-[#0d1218] p-2">
                            <p className="text-xs text-zinc-400">Last login: {formatDateTime(admin.lastLoginAt)}</p>
                            <p className="text-xs text-zinc-400">Last active: {formatDateTime(admin.lastActiveAt)}</p>
                            <span
                              className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] ${
                                admin.twoFactorEnabled
                                  ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                                  : 'border-amber-400/30 bg-amber-400/10 text-amber-200'
                              }`}
                            >
                              2FA {admin.twoFactorEnabled ? 'Enabled' : 'Not enabled'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <select
                            className={input}
                            value={admin.role}
                            onChange={(e) =>
                              setAdmins((prev) =>
                                prev.map((row) => (row._id === admin._id ? { ...row, role: e.target.value } : row))
                              )
                            }
                          >
                            <option value="lqt">lqt</option>
                            <option value="sales">sales</option>
                            <option value="procurement">procurement</option>
                            <option value="admin">admin</option>
                            <option value="editor">editor</option>
                          </select>
                        </td>
                        <td className="px-4 py-4">
                          <div className="mb-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-xs text-gold hover:border-gold/50"
                              onClick={() =>
                                setAdmins((prev) =>
                                  prev.map((row) => (row._id === admin._id ? { ...row, permissions: allPermissions } : row))
                                )
                              }
                            >
                              Select all
                            </button>
                            <button
                              type="button"
                              className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-300 hover:border-zinc-500"
                              onClick={() =>
                                setAdmins((prev) =>
                                  prev.map((row) => (row._id === admin._id ? { ...row, permissions: [] } : row))
                                )
                              }
                            >
                              Clear
                            </button>
                          </div>
                          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                            {allPermissions.map((permission) => (
                              <label
                                key={permission}
                                className="inline-flex items-center gap-2 rounded-xl border border-gold/10 bg-[#0d1218] px-3 py-2 text-xs text-zinc-300 hover:border-gold/30"
                              >
                                <input
                                  type="checkbox"
                                  className="accent-[#d6b676]"
                                  checked={admin.permissions?.includes(permission)}
                                  onChange={(e) => {
                                    setAdmins((prev) =>
                                      prev.map((row) =>
                                        row._id === admin._id
                                          ? {
                                              ...row,
                                              permissions: e.target.checked
                                                ? Array.from(new Set([...(row.permissions || []), permission]))
                                                : (row.permissions || []).filter((item) => item !== permission),
                                            }
                                          : row
                                      )
                                    );
                                  }}
                                />
                                {formatPermission(permission)}
                              </label>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              disabled={saving}
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gold/25 bg-gold/10 px-3 py-2 text-xs font-semibold text-gold hover:border-gold/50 disabled:opacity-60"
                              onClick={() => saveAdminPermissions(admin)}
                            >
                              <Save size={14} />
                              Save
                            </button>
                            <button
                              type="button"
                              disabled={saving}
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-200 hover:border-amber-300/60 disabled:opacity-60"
                              onClick={() => revokeSessions(admin)}
                            >
                              <KeyRound size={14} />
                              Revoke Sessions
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-400/25 bg-sky-400/10 px-3 py-2 text-xs font-semibold text-sky-200 hover:border-sky-300/60"
                              onClick={() => setTab('audit')}
                            >
                              <History size={14} />
                              Audit Logs
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 hover:border-red-400/60"
                              onClick={() => deleteAdmin(admin)}
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!filteredAdmins.length ? (
                  <div className="p-5">
                    <EmptyState title="No team members found" message="Try a different search or create a new team account." />
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {tab === 'audit' ? (
            <section className={panel}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className={label}>Security Trail</p>
                  <h3 className="mt-1 font-display text-3xl text-white">Audit Logs</h3>
                  <p className="mt-2 max-w-2xl text-sm text-zinc-400">
                    Review privileged changes, session revocations, settings updates, backups, and admin account events.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={load}
                  className="inline-flex items-center gap-2 rounded-xl border border-gold/20 bg-[#0d1218] px-4 py-2 text-sm font-semibold text-zinc-200 hover:border-gold/45 hover:text-gold"
                >
                  <RefreshCw size={16} />
                  Refresh Logs
                </button>
              </div>

              <div className={`mt-5 ${tableWrap}`}>
                <table className="w-full min-w-[920px] text-sm">
                  <thead className="border-b border-gold/10">
                    <tr className={tableHead}>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Actor</th>
                      <th className="px-4 py-3">Target</th>
                      <th className="px-4 py-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log._id} className="border-t border-gold/10 align-top">
                        <td className="px-4 py-4">
                          <span className="rounded-full border border-gold/20 bg-gold/10 px-2.5 py-1 text-xs font-semibold text-gold">
                            {formatAuditAction(log.action)}
                          </span>
                          {getAuditMetadataSummary(log.metadata).length ? (
                            <div className="mt-2 max-w-md rounded-xl border border-gold/10 bg-[#05080d] p-3 text-xs text-zinc-400">
                              <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">Details</p>
                              <div className="mt-2 space-y-1.5">
                                {getAuditMetadataSummary(log.metadata).map((item) => (
                                  <div key={`${log._id}-${item.label}`} className="flex flex-wrap gap-x-2 gap-y-1">
                                    <span className="font-medium text-zinc-300">{item.label}:</span>
                                    <span className="text-zinc-400">{item.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-white">{log.actor?.name || 'System'}</p>
                          <p className="mt-1 text-xs text-zinc-400">{log.actor?.email || 'No actor email'}</p>
                          <p className="mt-1 text-xs capitalize text-zinc-500">{formatPermission(log.actor?.role || 'unknown')}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-white">{log.target?.label || 'Unknown target'}</p>
                          <p className="mt-1 text-xs text-zinc-400">{log.target?.type || 'resource'}</p>
                        </td>
                        <td className="px-4 py-4 text-zinc-300">{formatDateTime(log.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!auditLogs.length ? (
                  <div className="p-5">
                    <EmptyState
                      title="No audit logs yet"
                      message="Privileged actions will appear here as admins change settings, permissions, sessions, and backups."
                    />
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {tab === 'users' ? (
            <section className={panel}>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className={label}>Identity Directory</p>
                  <h3 className="mt-1 font-display text-3xl text-white">Users & Roles</h3>
                </div>
                <div className="grid gap-2 sm:grid-cols-[1fr_170px] xl:w-[560px]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input
                      className={`${input} pl-10`}
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search users"
                    />
                  </div>
                  <select className={input} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                    <option value="all">All roles</option>
                    <option value="super_admin">super_admin</option>
                    <option value="lqt">lqt</option>
                    <option value="sales">sales</option>
                    <option value="procurement">procurement</option>
                    <option value="admin">admin</option>
                    <option value="editor">editor</option>
                    <option value="user">user</option>
                  </select>
                </div>
              </div>

              <div className={`mt-5 ${tableWrap}`}>
                <table className="w-full min-w-[820px] text-sm">
                  <thead className="border-b border-gold/10">
                    <tr className={tableHead}>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Permissions</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => {
                      const locked = user.role === 'super_admin';
                      return (
                        <tr key={user._id} className="border-t border-gold/10">
                          <td className="px-4 py-4">
                            <p className="font-semibold text-white">{user.name}</p>
                            <p className="mt-1 text-xs text-zinc-500">Joined {formatDate(user.createdAt)}</p>
                          </td>
                          <td className="px-4 py-4 text-zinc-300">{user.email}</td>
                          <td className="px-4 py-4">
                            {locked ? (
                              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getRoleTone(user.role)}`}>
                                {user.role}
                              </span>
                            ) : (
                              <select
                                className={input}
                                value={user.role}
                                onChange={(e) =>
                                  setUsers((prev) =>
                                    prev.map((row) => (row._id === user._id ? { ...row, role: e.target.value } : row))
                                  )
                                }
                              >
                                <option value="user">user</option>
                                <option value="lqt">lqt</option>
                                <option value="sales">sales</option>
                                <option value="procurement">procurement</option>
                                <option value="editor">editor</option>
                                <option value="admin">admin</option>
                              </select>
                            )}
                          </td>
                          <td className="px-4 py-4 text-zinc-400">
                            {user.permissions?.length ? `${user.permissions.length} permissions` : 'Default access'}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                disabled={locked || saving}
                                className="inline-flex items-center gap-2 rounded-xl border border-gold/25 bg-gold/10 px-3 py-2 text-xs font-semibold text-gold hover:border-gold/50 disabled:cursor-not-allowed disabled:opacity-40"
                                onClick={() => saveUserRole(user)}
                              >
                                <UserCog size={14} />
                                Save
                              </button>
                              <button
                                type="button"
                                disabled={locked}
                                className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 hover:border-red-400/60 disabled:cursor-not-allowed disabled:opacity-40"
                                onClick={() => deleteUser(user)}
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {!filteredUsers.length ? (
                  <div className="p-5">
                    <EmptyState title="No users found" message="Adjust the role filter or search text to broaden the results." />
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {tab === 'customers' ? (
            <section className={panel}>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className={label}>Customer Monitoring</p>
                  <h3 className="mt-1 font-display text-3xl text-white">Customer Activity</h3>
                  <p className="mt-2 max-w-2xl text-sm text-zinc-400">
                    See what customers are doing across account creation, quote requests, and contact messages.
                  </p>
                </div>
                <div className="relative w-full xl:max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                  <input
                    className={`${input} pl-10`}
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search customer activity"
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ['Tracked Customers', customerTotals.tracked],
                  ['Registered Accounts', customerTotals.registered],
                  ['Open Quotes', customerTotals.openQuotes],
                  ['Unread Messages', customerTotals.unreadContacts],
                ].map(([name, value]) => (
                  <div key={name} className="rounded-2xl border border-gold/15 bg-[#0d1218] p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">{name}</p>
                    <p className="mt-2 text-3xl font-bold text-gold">{value}</p>
                  </div>
                ))}
              </div>

              <div className={`mt-5 ${tableWrap}`}>
                <table className="w-full min-w-[1100px] text-sm">
                  <thead className="border-b border-gold/10">
                    <tr className={tableHead}>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Account</th>
                      <th className="px-4 py-3">Quotes</th>
                      <th className="px-4 py-3">Messages</th>
                      <th className="px-4 py-3">Last Activity</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomerActivity.map((row) => (
                      <tr key={row.id} className="border-t border-gold/10 align-top">
                        <td className="px-4 py-4">
                          <p className="font-semibold text-white">{row.name || 'Unknown customer'}</p>
                          <p className="mt-1 text-xs text-zinc-400">{row.company || 'No company added'}</p>
                          <p className="mt-1 text-xs text-zinc-500">{row.phone || 'No phone'}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs ${
                              row.registered
                                ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                                : 'border-zinc-600/60 bg-zinc-800/70 text-zinc-300'
                            }`}
                          >
                            {row.registered ? 'Registered' : 'Guest lead'}
                          </span>
                          <p className="mt-2 text-xs text-zinc-400">Joined {formatDate(row.joinedAt)}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-2xl font-bold text-gold">{row.quoteCount}</p>
                          <p className="text-xs text-zinc-400">{row.openQuotes} open</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-2xl font-bold text-gold">{row.contactCount}</p>
                          <p className="text-xs text-zinc-400">{row.unreadContacts} unread</p>
                        </td>
                        <td className="max-w-[280px] px-4 py-4">
                          <p className="truncate text-zinc-300">{row.lastActivityDetail || '-'}</p>
                          <p className="mt-1 text-xs capitalize text-zinc-400">
                            {row.lastActivityType || 'activity'} - {formatDate(row.lastActivityAt)}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-2">
                            <a
                              href={`mailto:${row.email}?subject=Follow-up from Graven Metals`}
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gold/25 bg-gold/10 px-3 py-2 text-xs font-semibold text-gold hover:border-gold/50"
                            >
                              <Mail size={14} />
                              Email
                            </a>
                            <button
                              type="button"
                              onClick={() => setTab('users')}
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gold/15 bg-[#0d1218] px-3 py-2 text-xs text-zinc-300 hover:border-gold/40"
                            >
                              <Users size={14} />
                              Directory
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!filteredCustomerActivity.length ? (
                  <div className="p-5">
                    <EmptyState title="No customer activity found" message="Customer accounts, quote requests, and contact messages will appear here." />
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {tab === 'settings' ? (
            <section className={panel}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className={label}>Storefront Controls</p>
                  <h3 className="mt-1 font-display text-3xl text-white">Website Settings</h3>
                  <p className="mt-2 max-w-2xl text-sm text-zinc-400">
                    Keep the public-facing basics in one place. Maintenance mode should stay off unless you are actively deploying or fixing content.
                  </p>
                </div>
                <div
                  className={`rounded-2xl border px-4 py-3 ${
                    settings.maintenanceMode
                      ? 'border-red-400/30 bg-red-400/10 text-red-200'
                      : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.18em]">Current State</p>
                  <p className="mt-1 text-lg font-bold">{settings.maintenanceMode ? 'Maintenance' : 'Operational'}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label>
                  <span className={label}>Site Name</span>
                  <input
                    className="mt-2 w-full rounded-xl border border-gold/20 bg-[#0d1218] px-3.5 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-gold/60"
                    value={settings.siteName}
                    onChange={(e) => setSettings((prev) => ({ ...prev, siteName: e.target.value }))}
                    placeholder="GRAVEN Metals"
                  />
                </label>
                <label>
                  <span className={label}>Support Email</span>
                  <div className="relative mt-2">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input
                      className={`${input} pl-10`}
                      value={settings.supportEmail}
                      onChange={(e) => setSettings((prev) => ({ ...prev, supportEmail: e.target.value }))}
                      placeholder="support@example.com"
                    />
                  </div>
                </label>
              </div>

              <div className="mt-5 rounded-2xl border border-gold/15 bg-[#0d1218] p-4">
                <label className="flex cursor-pointer flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    <span className="block font-semibold text-white">Maintenance Mode</span>
                    <span className="mt-1 block text-sm text-zinc-400">
                      Temporarily hide the public experience while admins work behind the curtain.
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    className="h-6 w-12 accent-[#d6b676]"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings((prev) => ({ ...prev, maintenanceMode: e.target.checked }))}
                  />
                </label>
              </div>

              <button
                type="button"
                disabled={saving}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gold-cta px-5 py-2.5 font-extrabold text-black shadow-gold hover:brightness-110 disabled:opacity-60"
                onClick={async () => {
                  setSaving(true);
                  try {
                    await superAdminApi.updateSettings(settings);
                    toast.success('Settings saved');
                    await load();
                  } catch (error) {
                    toast.error((error as Error).message);
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </section>
          ) : null}

          {tab === 'seo' ? (
            <section className="grid gap-5 xl:grid-cols-[1fr_420px]">
              <div className={panel}>
                <p className={label}>Search Appearance</p>
                <h3 className="mt-1 font-display text-3xl text-white">SEO Management</h3>

                <div className="mt-5 space-y-4">
                  <label>
                    <span className={label}>Meta Title</span>
                    <input
                      className="mt-2 w-full rounded-xl border border-gold/20 bg-[#0d1218] px-3.5 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-gold/60"
                      value={seo.metaTitle}
                      onChange={(e) => setSeo((prev) => ({ ...prev, metaTitle: e.target.value }))}
                      placeholder="Premium Metal Trading Platform"
                    />
                    <span className="mt-1 block text-xs text-zinc-500">{seo.metaTitle.length}/60 recommended characters</span>
                  </label>
                  <label>
                    <span className={label}>Meta Description</span>
                    <textarea
                      className="mt-2 w-full rounded-xl border border-gold/20 bg-[#0d1218] px-3.5 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-gold/60"
                      value={seo.metaDescription}
                      onChange={(e) => setSeo((prev) => ({ ...prev, metaDescription: e.target.value }))}
                      placeholder="Describe your metals, services, and market promise clearly."
                      rows={4}
                    />
                    <span className="mt-1 block text-xs text-zinc-500">
                      {seo.metaDescription.length}/160 recommended characters
                    </span>
                  </label>
                  <label>
                    <span className={label}>OG Image URL</span>
                    <input
                      className="mt-2 w-full rounded-xl border border-gold/20 bg-[#0d1218] px-3.5 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-gold/60"
                      value={seo.ogImage}
                      onChange={(e) => setSeo((prev) => ({ ...prev, ogImage: e.target.value }))}
                      placeholder="https://example.com/social-card.jpg"
                    />
                  </label>
                  <label>
                    <span className={label}>Keywords</span>
                    <input
                      className="mt-2 w-full rounded-xl border border-gold/20 bg-[#0d1218] px-3.5 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-gold/60"
                      value={seo.keywords.join(', ')}
                      onChange={(e) =>
                        setSeo((prev) => ({
                          ...prev,
                          keywords: e.target.value
                            .split(',')
                            .map((item) => item.trim())
                            .filter(Boolean),
                        }))
                      }
                      placeholder="gold, copper, aluminium, metal trading"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  disabled={saving}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gold-cta px-5 py-2.5 font-extrabold text-black shadow-gold hover:brightness-110 disabled:opacity-60"
                  onClick={async () => {
                    setSaving(true);
                    try {
                      await superAdminApi.updateSEO(seo);
                      toast.success('SEO updated');
                      await load();
                    } catch (error) {
                      toast.error((error as Error).message);
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  <Globe2 size={16} />
                  {saving ? 'Saving...' : 'Save SEO'}
                </button>
              </div>

              <aside className={panel}>
                <p className={label}>Preview</p>
                <h3 className="mt-1 font-display text-2xl text-white">Search Result Card</h3>
                <div className="mt-5 rounded-2xl border border-gold/15 bg-[#0d1218] p-4">
                  <p className="text-xs text-emerald-300">gravenmetals.com</p>
                  <p className="mt-2 text-lg font-semibold text-sky-300">
                    {seo.metaTitle || settings.siteName || 'GRAVEN Metals'}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {seo.metaDescription || 'Add a concise description to control how the homepage appears in search.'}
                  </p>
                </div>
                <div className="mt-5">
                  <p className={label}>Keyword Chips</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {seo.keywords.length ? (
                      seo.keywords.map((keyword) => (
                        <span key={keyword} className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-xs text-gold">
                          {keyword}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-zinc-400">No keywords yet.</p>
                    )}
                  </div>
                </div>
              </aside>
            </section>
          ) : null}

          {tab === 'backup' ? (
            <section className="grid gap-5 xl:grid-cols-[1fr_420px]">
              <div className={panel}>
                <p className={label}>Disaster Recovery</p>
                <h3 className="mt-1 font-display text-3xl text-white">Database Backup</h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                  Generate a server-side JSON snapshot of users, products, categories, blogs, quotes, contacts, and settings.
                  This is especially useful before role changes, SEO edits, or maintenance work.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    ['Collections', '7'],
                    ['Protected', 'Passwords omitted'],
                    ['Mode', 'Server-side'],
                  ].map(([name, value]) => (
                    <div key={name} className="rounded-2xl border border-gold/15 bg-[#0d1218] p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">{name}</p>
                      <p className="mt-2 font-semibold text-white">{value}</p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={saving}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gold-cta px-5 py-2.5 font-extrabold text-black shadow-gold hover:brightness-110 disabled:opacity-60"
                  onClick={async () => {
                    setSaving(true);
                    try {
                      const data = await superAdminApi.backupDatabase();
                      setLastBackup({ fileName: data.fileName, generatedAt: new Date().toISOString() });
                      toast.success(data.message ? `${data.message}: ${data.fileName}` : 'Backup triggered');
                    } catch (error) {
                      toast.error((error as Error).message);
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  <Database size={16} />
                  {saving ? 'Creating...' : 'Create Backup'}
                </button>
              </div>

              <aside className={panel}>
                <p className={label}>Latest Backup</p>
                {lastBackup ? (
                  <div className="mt-4 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-4">
                    <CheckCircle2 className="text-emerald-300" size={24} />
                    <p className="mt-3 font-semibold text-white">{lastBackup.fileName}</p>
                    <p className="mt-1 text-sm text-emerald-100/70">Created {formatDate(lastBackup.generatedAt)}</p>
                  </div>
                ) : (
                  <EmptyState
                    title="No backup this session"
                    message="Create one before making major admin, SEO, or maintenance changes."
                  />
                )}
                <div className="mt-5 rounded-2xl border border-gold/15 bg-[#0d1218] p-4">
                  <p className="font-semibold text-white">Good backup rhythm</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Make a backup before deployments, bulk content changes, and permission changes. Tiny ritual, huge future relief.
                  </p>
                </div>
              </aside>
            </section>
          ) : null}
        </main>
      </div>

      {createAdminOpen ? (
        <ModalShell title="Create Team Account" eyebrow="Access Provisioning" onClose={() => setCreateAdminOpen(false)}>
          <div className="grid gap-3 md:grid-cols-2">
            <label>
              <span className={label}>Name</span>
              <input
                className="mt-2 w-full rounded-xl border border-gold/20 bg-[#0d1218] px-3.5 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-gold/60"
                placeholder="Team member name"
                value={newAdmin.name}
                onChange={(e) => setNewAdmin((prev) => ({ ...prev, name: e.target.value }))}
              />
            </label>
            <label>
              <span className={label}>Email</span>
              <input
                className="mt-2 w-full rounded-xl border border-gold/20 bg-[#0d1218] px-3.5 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-gold/60"
                placeholder="member@example.com"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin((prev) => ({ ...prev, email: e.target.value }))}
              />
            </label>
            <label>
              <span className={label}>Password</span>
              <div className="relative mt-2">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input
                  className={`${input} pl-10`}
                  placeholder="8+ chars, uppercase, lowercase, number"
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin((prev) => ({ ...prev, password: e.target.value }))}
                />
              </div>
            </label>
            <label>
              <span className={label}>Role</span>
              <select
                className="mt-2 w-full rounded-xl border border-gold/20 bg-[#0d1218] px-3.5 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-gold/60"
                value={newAdmin.role}
                onChange={(e) => setNewAdmin((prev) => ({ ...prev, role: e.target.value }))}
              >
                <option value="lqt">lqt</option>
                <option value="sales">sales</option>
                <option value="procurement">procurement</option>
                <option value="admin">admin</option>
                <option value="editor">editor</option>
              </select>
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-xs text-gold hover:border-gold/50"
              onClick={() => setNewAdmin((prev) => ({ ...prev, permissions: allPermissions }))}
            >
              Select all permissions
            </button>
            <button
              type="button"
              className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-300 hover:border-zinc-500"
              onClick={() => setNewAdmin((prev) => ({ ...prev, permissions: [] }))}
            >
              Use role defaults
            </button>
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-3">
            {allPermissions.map((permission) => (
              <label
                key={permission}
                className="inline-flex items-center gap-2 rounded-xl border border-gold/10 bg-[#0d1218] px-3 py-2 text-xs text-zinc-300 hover:border-gold/30"
              >
                <input
                  type="checkbox"
                  className="accent-[#d6b676]"
                  checked={newAdmin.permissions.includes(permission)}
                  onChange={(e) =>
                    setNewAdmin((prev) => ({
                      ...prev,
                      permissions: e.target.checked
                        ? Array.from(new Set([...prev.permissions, permission]))
                        : prev.permissions.filter((item) => item !== permission),
                    }))
                  }
                />
                {formatPermission(permission)}
              </label>
            ))}
          </div>

          <button
            type="button"
            disabled={saving}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gold-cta px-5 py-2.5 font-extrabold text-black shadow-gold hover:brightness-110 disabled:opacity-60"
            onClick={async () => {
              setSaving(true);
              try {
                await superAdminApi.createAdmin(newAdmin);
                toast.success('Team account created');
                setNewAdmin({ name: '', email: '', password: '', role: 'lqt', permissions: [] });
                setCreateAdminOpen(false);
                await load();
              } catch (e) {
                toast.error((e as Error).message);
              } finally {
                setSaving(false);
              }
            }}
          >
            <Plus size={16} />
            {saving ? 'Creating...' : 'Create Account'}
          </button>
        </ModalShell>
      ) : null}
    </div>
  );
}
