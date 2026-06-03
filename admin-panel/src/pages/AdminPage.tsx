import { type DragEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart3,
  Bell,
  AlertTriangle,
  Boxes,
  CheckCircle2,
  ClipboardList,
  Contact,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  ImagePlus,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Mail,
  Menu,
  Package,
  PencilLine,
  Plus,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Table2,
  Trash2,
  Upload,
  UserCircle2,
  X,
  type LucideIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { adminApi, type ApiContact, type ApiQuote, type SiteSettingsPayload } from '../lib/adminApi';
import { clearAuth, getAuthUser } from '../lib/auth';
import { BrandLogo } from '../components/BrandLogo';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { SEO } from '../components/seo/SEO';
import type { ApiBlog, ApiCategory, ApiProduct } from '../lib/publicApi';

type Section =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'blogs'
  | 'quotes'
  | 'contacts'
  | 'customers'
  | 'settings'
  | 'media'
  | 'security';

type ModalType = 'product' | 'category' | 'blog' | null;
type Mode = 'create' | 'edit';

type ActivityItem = {
  id: string;
  type: 'product' | 'category' | 'blog' | 'quote' | 'contact';
  title: string;
  subtitle: string;
  createdAt: string;
};

type CustomerActivityRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  quoteCount: number;
  contactCount: number;
  openQuotes: number;
  unreadContacts: number;
  lastActivityAt: string;
  lastActivityType: 'quote' | 'contact';
  lastActivityDetail: string;
};

type SidebarItem = { key: Section; label: string; icon: LucideIcon };

type ProductForm = {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  unit: string;
  unitType: string;
  weightPerUnit: number;
  weightUnit: string;
  moq: number;
  stockQty: number;
  file: File | null;
};

type CategoryForm = {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  metaTitle: string;
  metaDescription: string;
  file: File | null;
};

type BlogForm = {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published: boolean;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  file: File | null;
};

type SettingsForm = {
  siteName: string;
  supportEmail: string;
  logoUrl: string;
  footerText: string;
  maintenanceMode: boolean;
  contactPhone: string;
  contactEmail: string;
  contactWhatsapp: string;
  socialFacebook: string;
  socialLinkedIn: string;
  socialInstagram: string;
  socialYouTube: string;
  lucknowAddress: string;
  delhiAddress: string;
  officePhone: string;
  officeEmail: string;
  seoMetaTitle: string;
  seoMetaDescription: string;
  seoKeywords: string;
  seoOgImage: string;
  payVisa: boolean;
  payMastercard: boolean;
  payUpi: boolean;
  payAmex: boolean;
  payRupay: boolean;
};

const defaultProductForm: ProductForm = {
  name: '',
  slug: '',
  description: '',
  category: '',
  price: 0,
  currency: 'USD',
  unit: 'kg',
  unitType: 'Rod',
  weightPerUnit: 1,
  weightUnit: 'kg',
  moq: 1,
  stockQty: 0,
  file: null,
};

const defaultCategoryForm: CategoryForm = {
  name: '',
  slug: '',
  description: '',
  sortOrder: 0,
  metaTitle: '',
  metaDescription: '',
  file: null,
};

const defaultBlogForm: BlogForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  published: true,
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
  file: null,
};

const defaultSettingsForm: SettingsForm = {
  siteName: 'GRAVEN METAL',
  supportEmail: 'trade@gravenmetal.com',
  logoUrl: '',
  footerText:
    'Graven Metals delivers premium industrial metals with trusted sourcing, superior quality, and innovative solutions powering industries worldwide.',
  maintenanceMode: false,
  contactPhone: '+91 79053 50134',
  contactEmail: 'trade@gravenmetal.com',
  contactWhatsapp: '+91 79053 50134',
  socialFacebook: '',
  socialLinkedIn: '',
  socialInstagram: '',
  socialYouTube: '',
  lucknowAddress: '8/61, Sector-8\nJankipuram Extension\nLucknow - 226021, India',
  delhiAddress: '7/25, Tower F, 2nd Floor\nKirti Nagar\nNew Delhi - 110015, India',
  officePhone: '+91 79053 50134',
  officeEmail: 'trade@gravenmetal.com',
  seoMetaTitle: 'GRAVEN METAL',
  seoMetaDescription: 'Premium dark luxury metal trading platform.',
  seoKeywords: 'metal,industrial,graven,steel,copper,aluminium',
  seoOgImage: '',
  payVisa: true,
  payMastercard: true,
  payUpi: true,
  payAmex: true,
  payRupay: true,
};

function normalizeDate(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString();
}

function formatDate(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatDateTime(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatCurrency(currency: string, value: number) {
  const normalized = currency.toUpperCase();
  const locale = normalized === 'INR' ? 'en-IN' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: normalized,
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

function getUnitType(product: Pick<ApiProduct, 'unitType' | 'unit'>) {
  return product.unitType || product.unit || 'unit';
}

function getWeightMultiplier(weightUnit?: string) {
  const unit = (weightUnit || '').trim().toLowerCase();
  const lookup: Record<string, number> = {
    g: 0.001,
    gram: 0.001,
    grams: 0.001,
    kg: 1,
    kilogram: 1,
    kilograms: 1,
    lb: 0.45359237,
    lbs: 0.45359237,
    pound: 0.45359237,
    pounds: 0.45359237,
    oz: 0.028349523125,
    ounce: 0.028349523125,
    ounces: 0.028349523125,
    ton: 1000,
    tonne: 1000,
    t: 1000,
  };
  return lookup[unit] ?? 1;
}

function getUnitPrice(product: Pick<ApiProduct, 'price' | 'weightPerUnit' | 'weightUnit' | 'unit'>) {
  return (product.price || 0) * (product.weightPerUnit || 1) * getWeightMultiplier(product.weightUnit || product.unit);
}

function sectionTitle(section: Section) {
  return section.charAt(0).toUpperCase() + section.slice(1);
}

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-gold/20 bg-[#0a0f14] shadow-halo">
        <div className="flex items-center justify-between border-b border-gold/10 bg-steel-sheen px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">{subtitle}</p>
            <h3 className="mt-1 font-display text-2xl text-white">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gold/20 bg-[#0d1218] p-2 text-zinc-300 transition hover:border-gold/50 hover:text-gold"
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
  title,
  value,
  helper,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  helper: string;
  icon: LucideIcon;
}) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-gold/20 bg-[#0a0f14]/95 p-4 shadow-glow">
      <div className="absolute inset-0 bg-gradient-to-br from-gold/[0.08] via-transparent to-white/[0.03]" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{title}</p>
          <p className="mt-3 text-3xl font-bold text-white">{value}</p>
          <p className="mt-1 text-xs text-zinc-500">{helper}</p>
        </div>
        <span className="rounded-xl border border-gold/20 bg-gold/10 p-2 text-gold">
          <Icon size={18} />
        </span>
      </div>
    </article>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gold/20 bg-[#0b1119] px-5 py-10 text-center">
      <h4 className="font-display text-xl text-white">{title}</h4>
      <p className="mx-auto mt-2 max-w-lg text-sm text-zinc-500">{message}</p>
    </div>
  );
}

const sidebarItems: SidebarItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'products', label: 'Products', icon: Package },
  { key: 'categories', label: 'Categories', icon: FolderOpen },
  { key: 'blogs', label: 'Blogs', icon: FileText },
  { key: 'quotes', label: 'Quotes', icon: ClipboardList },
  { key: 'contacts', label: 'Contacts', icon: Contact },
  { key: 'customers', label: 'Customers', icon: UserCircle2 },
  { key: 'settings', label: 'Website Settings', icon: Settings },
  { key: 'media', label: 'Media Manager', icon: ImagePlus },
  { key: 'security', label: 'Security', icon: ShieldCheck },
];

export function AdminPage() {
  const navigate = useNavigate();
  const user = getAuthUser();

  const [section, setSection] = useState<Section>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalMode, setModalMode] = useState<Mode>('create');
  const [globalSearch, setGlobalSearch] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [blogs, setBlogs] = useState<ApiBlog[]>([]);
  const [quotes, setQuotes] = useState<ApiQuote[]>([]);
  const [contacts, setContacts] = useState<ApiContact[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<ApiQuote | null>(null);
  const [selectedContact, setSelectedContact] = useState<ApiContact | null>(null);
  const [quoteAdminNote, setQuoteAdminNote] = useState('');
  const [contactAdminNote, setContactAdminNote] = useState('');

  const [productForm, setProductForm] = useState<ProductForm>(defaultProductForm);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(defaultCategoryForm);
  const [blogForm, setBlogForm] = useState<BlogForm>(defaultBlogForm);
  const [settingsForm, setSettingsForm] = useState<SettingsForm>(defaultSettingsForm);

  const [productQuery, setProductQuery] = useState('');
  const [productStatusFilter, setProductStatusFilter] = useState<'all' | 'in_stock' | 'out_stock'>('all');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [quoteStatusFilter, setQuoteStatusFilter] = useState<'all' | ApiQuote['status']>('all');
  const [contactStatusFilter, setContactStatusFilter] = useState<'all' | ApiContact['status']>('all');
  const [customerQuery, setCustomerQuery] = useState('');
  const [blogStateFilter, setBlogStateFilter] = useState<'all' | 'published' | 'draft'>('all');

  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const [mediaDropActive, setMediaDropActive] = useState(false);
  const [localMedia, setLocalMedia] = useState<File[]>([]);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const editorRef = useRef<HTMLDivElement>(null);

  const inputClass =
    'w-full rounded-lg border border-gold/20 bg-[#0d1218] px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-gold/60';
  const labelClass = 'text-xs uppercase tracking-[0.15em] text-zinc-500';
  const panelClass = 'rounded-2xl border border-gold/20 bg-[#0a0f14]/95 p-4 shadow-glow';

  const hydrateSettingsForm = (raw: any) => {
    const next: SettingsForm = {
      ...defaultSettingsForm,
      siteName: raw?.siteName || defaultSettingsForm.siteName,
      supportEmail: raw?.supportEmail || defaultSettingsForm.supportEmail,
      logoUrl: raw?.logoUrl || '',
      footerText: raw?.footerText || defaultSettingsForm.footerText,
      maintenanceMode: Boolean(raw?.maintenanceMode),
      contactPhone: raw?.contactDetails?.phone || defaultSettingsForm.contactPhone,
      contactEmail: raw?.contactDetails?.email || defaultSettingsForm.contactEmail,
      contactWhatsapp: raw?.contactDetails?.whatsapp || defaultSettingsForm.contactWhatsapp,
      socialFacebook: raw?.socialLinks?.facebook || '',
      socialLinkedIn: raw?.socialLinks?.linkedin || '',
      socialInstagram: raw?.socialLinks?.instagram || '',
      socialYouTube: raw?.socialLinks?.youtube || '',
      lucknowAddress: raw?.officeAddresses?.[0]?.address || defaultSettingsForm.lucknowAddress,
      delhiAddress: raw?.officeAddresses?.[1]?.address || defaultSettingsForm.delhiAddress,
      officePhone: raw?.officeAddresses?.[0]?.phone || defaultSettingsForm.officePhone,
      officeEmail: raw?.officeAddresses?.[0]?.email || defaultSettingsForm.officeEmail,
      seoMetaTitle: raw?.seo?.metaTitle || defaultSettingsForm.seoMetaTitle,
      seoMetaDescription: raw?.seo?.metaDescription || defaultSettingsForm.seoMetaDescription,
      seoKeywords: Array.isArray(raw?.seo?.keywords) ? raw.seo.keywords.join(', ') : defaultSettingsForm.seoKeywords,
      seoOgImage: raw?.seo?.ogImage || '',
      payVisa: raw?.paymentMethods?.some((x: any) => x.name === 'Visa' && x.enabled) ?? true,
      payMastercard: raw?.paymentMethods?.some((x: any) => x.name === 'MasterCard' && x.enabled) ?? true,
      payUpi: raw?.paymentMethods?.some((x: any) => x.name === 'UPI' && x.enabled) ?? true,
      payAmex: raw?.paymentMethods?.some((x: any) => x.name === 'American Express' && x.enabled) ?? true,
      payRupay: raw?.paymentMethods?.some((x: any) => x.name === 'RuPay' && x.enabled) ?? true,
    };
    setSettingsForm(next);
  };

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [ps, cs, bs, qs, ct, st] = await Promise.all([
        adminApi.getProducts(),
        adminApi.getCategories(),
        adminApi.getBlogs(),
        adminApi.getQuotes(),
        adminApi.getContacts(),
        adminApi.getSettings(),
      ]);
      setProducts(ps);
      setCategories(cs);
      setBlogs(bs);
      setQuotes(qs);
      setContacts(ct);
      hydrateSettingsForm(st);
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (modalType === 'blog' && editorRef.current && editorRef.current.innerHTML !== blogForm.content) {
      editorRef.current.innerHTML = blogForm.content;
    }
  }, [modalType, blogForm.content]);

  const activities = useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = [
      ...products.map((p) => ({
        id: `p-${p._id}`,
        type: 'product' as const,
        title: `Product: ${p.name}`,
        subtitle: p.category && typeof p.category !== 'string' ? p.category.name : 'Product updated',
        createdAt: normalizeDate(p.createdAt),
      })),
      ...categories.map((c) => ({
        id: `c-${c._id}`,
        type: 'category' as const,
        title: `Category: ${c.name}`,
        subtitle: c.slug,
        createdAt: normalizeDate(c.createdAt),
      })),
      ...blogs.map((b) => ({
        id: `b-${b._id}`,
        type: 'blog' as const,
        title: `Blog: ${b.title}`,
        subtitle: b.published === false ? 'Draft' : 'Published',
        createdAt: normalizeDate(b.createdAt),
      })),
      ...quotes.map((q) => ({
        id: `q-${q._id}`,
        type: 'quote' as const,
        title: `Quote: ${q.fullName}`,
        subtitle: `${q.metal} · ${q.status}`,
        createdAt: normalizeDate(q.createdAt),
      })),
      ...contacts.map((c) => ({
        id: `ct-${c._id}`,
        type: 'contact' as const,
        title: `Contact: ${c.fullName}`,
        subtitle: c.status,
        createdAt: normalizeDate(c.createdAt),
      })),
    ];

    return items
      .filter((item) => item.createdAt)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  }, [products, categories, blogs, quotes, contacts]);

  const dashboardStats = useMemo(
    () => [
      { title: 'Total Products', value: products.length, helper: 'Catalog inventory units', icon: Package },
      { title: 'Total Categories', value: categories.length, helper: 'Organized metal groups', icon: FolderOpen },
      { title: 'Total Blogs', value: blogs.length, helper: 'Insights published/draft', icon: FileText },
      { title: 'Total Quotes', value: quotes.length, helper: 'Client RFQ requests', icon: ClipboardList },
      { title: 'Total Contacts', value: contacts.length, helper: 'Inbound leads/support', icon: Contact },
      {
        title: 'Recent Activities',
        value: activities.length,
        helper: 'Latest operations tracked',
        icon: Sparkles,
      },
    ],
    [products.length, categories.length, blogs.length, quotes.length, contacts.length, activities.length]
  );

  const quickAnalytics = useMemo(
    () => [
      {
        label: 'Open Quotes',
        value: quotes.filter((q) => q.status === 'new' || q.status === 'in_review').length,
      },
      { label: 'Unread Contacts', value: contacts.filter((c) => c.status === 'unread').length },
      { label: 'Published Blogs', value: blogs.filter((b) => b.published !== false).length },
      { label: 'Out of Stock Products', value: products.filter((p) => !p.inStock).length },
    ],
    [quotes, contacts, blogs, products]
  );

  const actionItems = useMemo(
    () => [
      {
        label: 'New quote requests',
        value: quotes.filter((q) => q.status === 'new').length,
        section: 'quotes' as Section,
        helper: 'Review and move into pricing',
        urgent: quotes.some((q) => q.status === 'new'),
      },
      {
        label: 'Unread contacts',
        value: contacts.filter((c) => c.status === 'unread').length,
        section: 'contacts' as Section,
        helper: 'Reply before they go cold',
        urgent: contacts.some((c) => c.status === 'unread'),
      },
      {
        label: 'Out of stock products',
        value: products.filter((p) => !p.inStock).length,
        section: 'products' as Section,
        helper: 'Update stock or hide unavailable items',
        urgent: products.some((p) => !p.inStock),
      },
      {
        label: 'Draft blogs',
        value: blogs.filter((b) => b.published === false).length,
        section: 'blogs' as Section,
        helper: 'Finish content or publish updates',
        urgent: false,
      },
    ],
    [blogs, contacts, products, quotes]
  );

  const contentReadiness = useMemo(
    () => [
      { label: 'Products loaded', done: products.length > 0 },
      { label: 'Categories loaded', done: categories.length > 0 },
      { label: 'Support email set', done: Boolean(settingsForm.supportEmail || settingsForm.contactEmail) },
      { label: 'SEO title set', done: Boolean(settingsForm.seoMetaTitle) },
      { label: 'Payment methods visible', done: [settingsForm.payVisa, settingsForm.payMastercard, settingsForm.payUpi].some(Boolean) },
    ],
    [categories.length, products.length, settingsForm]
  );

  const monthlySeries = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, idx) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = d.toLocaleString('en-IN', { month: 'short' });
      return { key, label, quotes: 0, contacts: 0 };
    });
    const map = new Map(months.map((m) => [m.key, m]));

    quotes.forEach((item) => {
      if (!item.createdAt) return;
      const d = new Date(item.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const row = map.get(key);
      if (row) row.quotes += 1;
    });
    contacts.forEach((item) => {
      if (!item.createdAt) return;
      const d = new Date(item.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const row = map.get(key);
      if (row) row.contacts += 1;
    });
    return months;
  }, [quotes, contacts]);

  const topProducts = useMemo(() => {
    return [...products].sort((a, b) => getUnitPrice(b) - getUnitPrice(a)).slice(0, 6);
  }, [products]);

  const recentInquiries = useMemo(() => {
    const inquiryRows = [
      ...quotes.map((q) => ({
        id: `q-${q._id}`,
        type: 'Quote',
        name: q.fullName,
        email: q.email,
        detail: `${q.metal} · ${q.quantity}`,
        status: q.status,
        createdAt: q.createdAt || '',
      })),
      ...contacts.map((c) => ({
        id: `c-${c._id}`,
        type: 'Contact',
        name: c.fullName,
        email: c.email,
        detail: c.subject || c.message || '-',
        status: c.status,
        createdAt: c.createdAt || '',
      })),
    ];

    return inquiryRows
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);
  }, [quotes, contacts]);

  const customerActivity = useMemo<CustomerActivityRow[]>(() => {
    const rows = new Map<string, CustomerActivityRow>();

    const ensureRow = (email: string, name: string, phone: string) => {
      const normalizedEmail = email.toLowerCase();
      if (!rows.has(normalizedEmail)) {
        rows.set(normalizedEmail, {
          id: normalizedEmail,
          name,
          email: normalizedEmail,
          phone,
          quoteCount: 0,
          contactCount: 0,
          openQuotes: 0,
          unreadContacts: 0,
          lastActivityAt: '',
          lastActivityType: 'quote',
          lastActivityDetail: '',
        });
      }

      const row = rows.get(normalizedEmail)!;
      row.name = row.name || name;
      row.phone = row.phone || phone;
      return row;
    };

    const touch = (row: CustomerActivityRow, createdAt: string | undefined, type: CustomerActivityRow['lastActivityType'], detail: string) => {
      if (!createdAt) return;
      const current = row.lastActivityAt ? new Date(row.lastActivityAt).getTime() : 0;
      const next = new Date(createdAt).getTime();
      if (!current || next >= current) {
        row.lastActivityAt = createdAt;
        row.lastActivityType = type;
        row.lastActivityDetail = detail;
      }
    };

    quotes.forEach((quote) => {
      const row = ensureRow(quote.email, quote.fullName, quote.phone);
      row.quoteCount += 1;
      if (quote.status === 'new' || quote.status === 'in_review' || quote.status === 'quoted') row.openQuotes += 1;
      touch(row, quote.createdAt, 'quote', `${quote.metal} - ${quote.status}`);
    });

    contacts.forEach((contact) => {
      const row = ensureRow(contact.email, contact.fullName, contact.phone);
      row.contactCount += 1;
      if (contact.status === 'unread') row.unreadContacts += 1;
      touch(row, contact.createdAt, 'contact', contact.subject || contact.message || 'Contact message');
    });

    const query = customerQuery.trim().toLowerCase();
    return Array.from(rows.values())
      .filter((row) => {
        if (!query) return true;
        return `${row.name} ${row.email} ${row.phone} ${row.lastActivityDetail}`.toLowerCase().includes(query);
      })
      .sort((a, b) => new Date(b.lastActivityAt || 0).getTime() - new Date(a.lastActivityAt || 0).getTime());
  }, [contacts, customerQuery, quotes]);

  const normalizedSearch = globalSearch.trim().toLowerCase();

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const categoryName = typeof p.category === 'string' ? p.category : p.category?.name || '';
      const text = `${p.name} ${p.slug} ${p.description || ''} ${categoryName}`.toLowerCase();
      const searchMatch = !normalizedSearch && !productQuery ? true : text.includes((productQuery || normalizedSearch).toLowerCase());
      const statusMatch =
        productStatusFilter === 'all' ? true : productStatusFilter === 'in_stock' ? Boolean(p.inStock) : !p.inStock;
      const categoryMatch =
        productCategoryFilter === 'all'
          ? true
          : (typeof p.category === 'string' ? p.category : p.category?._id) === productCategoryFilter;
      return searchMatch && statusMatch && categoryMatch;
    });
  }, [products, normalizedSearch, productQuery, productStatusFilter, productCategoryFilter]);

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => `${c.name} ${c.slug}`.toLowerCase().includes(normalizedSearch));
  }, [categories, normalizedSearch]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const searchMatch = `${b.title} ${b.slug} ${b.excerpt}`.toLowerCase().includes(normalizedSearch);
      const stateMatch =
        blogStateFilter === 'all'
          ? true
          : blogStateFilter === 'published'
          ? b.published !== false
          : b.published === false;
      return searchMatch && stateMatch;
    });
  }, [blogs, normalizedSearch, blogStateFilter]);

  const filteredQuotes = useMemo(() => {
    return quotes.filter((q) => {
      const searchMatch = `${q.fullName} ${q.email} ${q.metal} ${q.phone}`.toLowerCase().includes(normalizedSearch);
      const statusMatch = quoteStatusFilter === 'all' ? true : q.status === quoteStatusFilter;
      return searchMatch && statusMatch;
    });
  }, [quotes, normalizedSearch, quoteStatusFilter]);

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const searchMatch = `${c.fullName} ${c.email} ${c.phone} ${c.subject || ''}`.toLowerCase().includes(normalizedSearch);
      const statusMatch = contactStatusFilter === 'all' ? true : c.status === contactStatusFilter;
      return searchMatch && statusMatch;
    });
  }, [contacts, normalizedSearch, contactStatusFilter]);

  const existingMedia = useMemo(() => {
    const media = [
      ...products
        .filter((p) => p.image?.url)
        .map((p) => ({ id: `p-${p._id}`, type: 'Product', name: p.name, url: p.image?.url || '', kind: 'image' })),
      ...categories
        .filter((c) => c.image?.url)
        .map((c) => ({ id: `c-${c._id}`, type: 'Category', name: c.name, url: c.image?.url || '', kind: 'image' })),
      ...blogs
        .filter((b) => b.thumbnail?.url)
        .map((b) => ({ id: `b-${b._id}`, type: 'Blog', name: b.title, url: b.thumbnail?.url || '', kind: 'image' })),
    ];
    return media;
  }, [products, categories, blogs]);

  const openCreateModal = (type: ModalType) => {
    setModalType(type);
    setModalMode('create');
    if (type === 'product') setProductForm(defaultProductForm);
    if (type === 'category') setCategoryForm(defaultCategoryForm);
    if (type === 'blog') setBlogForm(defaultBlogForm);
  };

  const openEditProduct = (item: ApiProduct) => {
    setModalType('product');
    setModalMode('edit');
    setProductForm({
      _id: item._id,
      name: item.name,
      slug: item.slug,
      description: item.description || '',
      category: typeof item.category === 'string' ? item.category : item.category?._id || '',
      price: item.price,
      currency: 'USD',
      unit: item.unit || 'kg',
      unitType: item.unitType || item.unit || 'kg',
      weightPerUnit: item.weightPerUnit || 1,
      weightUnit: item.weightUnit || item.unit || 'kg',
      moq: item.moq || 1,
      stockQty: item.stockQty || 0,
      file: null,
    });
  };

  const openEditCategory = (item: ApiCategory) => {
    setModalType('category');
    setModalMode('edit');
    setCategoryForm({
      _id: item._id,
      name: item.name,
      slug: item.slug,
      description: item.description || '',
      sortOrder: item.sortOrder || 0,
      metaTitle: item.metaTitle || '',
      metaDescription: item.metaDescription || '',
      file: null,
    });
  };

  const openEditBlog = (item: ApiBlog) => {
    setModalType('blog');
    setModalMode('edit');
    setBlogForm({
      _id: item._id,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      content: item.content,
      published: item.published !== false,
      metaTitle: item.seo?.metaTitle || '',
      metaDescription: item.seo?.metaDescription || '',
      metaKeywords: item.seo?.metaKeywords || '',
      file: null,
    });
  };

  const submitProduct: React.FormEventHandler = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (modalMode === 'create') {
        await adminApi.createProduct(productForm);
        toast.success('Product added');
      } else {
        await adminApi.updateProduct(productForm._id || '', productForm);
        toast.success('Product updated');
      }
      setModalType(null);
      await loadAll();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const submitCategory: React.FormEventHandler = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (modalMode === 'create') {
        await adminApi.createCategory(categoryForm);
        toast.success('Category added');
      } else {
        await adminApi.updateCategory(categoryForm._id || '', categoryForm);
        toast.success('Category updated');
      }
      setModalType(null);
      await loadAll();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const submitBlog: React.FormEventHandler = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (modalMode === 'create') {
        await adminApi.createBlog(blogForm);
        toast.success('Blog added');
      } else {
        await adminApi.updateBlog(blogForm._id || '', blogForm);
        toast.success('Blog updated');
      }
      setModalType(null);
      await loadAll();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const runBulkProductUpload = async () => {
    if (!bulkFile) {
      toast.error('Please select a CSV file');
      return;
    }
    setBulkProcessing(true);
    try {
      const csv = await bulkFile.text();
      const rows = csv
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
      if (rows.length < 2) throw new Error('CSV should include header and at least one row');

      const headers = rows[0].split(',').map((x) => x.trim().toLowerCase());
      const index = (name: string) => headers.indexOf(name);
      const iName = index('name');
      const iSlug = index('slug');
      const iPrice = index('price');
      const iStock = index('stockqty');
      const iCategory = index('category');
      const iDescription = index('description');
      const iCurrency = index('currency');
      const iUnit = index('unit');
      const iUnitType = index('unittype');
      const iWeightPerUnit = index('weightperunit');
      const iWeightUnit = index('weightunit');
      const iMoq = index('moq');

      if (iName < 0 || iSlug < 0 || iPrice < 0) {
        throw new Error('CSV headers must include: name, slug, price');
      }

      let created = 0;
      for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
        const columns = rows[rowIndex].split(',').map((x) => x.trim());
        const categoryCell = iCategory >= 0 ? columns[iCategory] : '';
        const categoryId = categoryCell || bulkCategory || categories[0]?._id;
        if (!categoryId) continue;

        const payload: ProductForm = {
          name: columns[iName] || '',
          slug: columns[iSlug] || '',
          description: iDescription >= 0 ? columns[iDescription] || '' : '',
          category: categoryId,
          price: Number(columns[iPrice] || 0),
          currency: iCurrency >= 0 ? columns[iCurrency] || 'USD' : 'USD',
          unit: iUnit >= 0 ? columns[iUnit] || 'kg' : 'kg',
          unitType: iUnitType >= 0 ? columns[iUnitType] || columns[iUnit] || 'kg' : columns[iUnit] || 'kg',
          weightPerUnit: iWeightPerUnit >= 0 ? Number(columns[iWeightPerUnit] || 1) : 1,
          weightUnit: iWeightUnit >= 0 ? columns[iWeightUnit] || columns[iUnit] || 'kg' : columns[iUnit] || 'kg',
          moq: iMoq >= 0 ? Number(columns[iMoq] || 1) : 1,
          stockQty: iStock >= 0 ? Number(columns[iStock] || 0) : 0,
          file: null,
        };

        if (!payload.name || !payload.slug || payload.price <= 0) continue;
        await adminApi.createProduct(payload);
        created += 1;
      }

      toast.success(`${created} products uploaded`);
      setBulkFile(null);
      await loadAll();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBulkProcessing(false);
    }
  };

  const updateQuoteStatus = async (quote: ApiQuote, status: ApiQuote['status']) => {
    try {
      await adminApi.updateQuoteStatus(quote._id, status);
      toast.success('Quote status updated');
      await loadAll();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const saveQuoteNote = async () => {
    if (!selectedQuote) return;
    try {
      await adminApi.updateQuote(selectedQuote._id, { adminNotes: quoteAdminNote } as Partial<ApiQuote>);
      toast.success('Quote note updated');
      await loadAll();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const saveContactUpdate = async (status: ApiContact['status']) => {
    if (!selectedContact) return;
    try {
      await adminApi.updateContactStatus(selectedContact._id, status, contactAdminNote);
      toast.success('Contact updated');
      await loadAll();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const removeContact = async (id: string) => {
    try {
      await adminApi.deleteContact(id);
      toast.success('Contact removed');
      await loadAll();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const saveSettings = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload: SiteSettingsPayload = {
        siteName: settingsForm.siteName,
        supportEmail: settingsForm.supportEmail,
        logoUrl: settingsForm.logoUrl,
        footerText: settingsForm.footerText,
        maintenanceMode: settingsForm.maintenanceMode,
        contactDetails: {
          phone: settingsForm.contactPhone,
          email: settingsForm.contactEmail,
          whatsapp: settingsForm.contactWhatsapp,
        },
        socialLinks: {
          facebook: settingsForm.socialFacebook,
          linkedin: settingsForm.socialLinkedIn,
          instagram: settingsForm.socialInstagram,
          youtube: settingsForm.socialYouTube,
        },
        officeAddresses: [
          {
            label: 'OFFICE ADDRESS: LUCKNOW',
            address: settingsForm.lucknowAddress,
            email: settingsForm.officeEmail,
            phone: settingsForm.officePhone,
          },
          {
            label: 'OFFICE ADDRESS: DELHI',
            address: settingsForm.delhiAddress,
            email: settingsForm.officeEmail,
            phone: settingsForm.officePhone,
          },
        ],
        paymentMethods: [
          { name: 'Visa', enabled: settingsForm.payVisa },
          { name: 'MasterCard', enabled: settingsForm.payMastercard },
          { name: 'UPI', enabled: settingsForm.payUpi },
          { name: 'American Express', enabled: settingsForm.payAmex },
          { name: 'RuPay', enabled: settingsForm.payRupay },
        ],
        seo: {
          metaTitle: settingsForm.seoMetaTitle,
          metaDescription: settingsForm.seoMetaDescription,
          keywords: settingsForm.seoKeywords
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean),
          ogImage: settingsForm.seoOgImage,
        },
      };

      await adminApi.updateSettings(payload);
      toast.success('Website settings saved');
      await loadAll();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleMediaDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setMediaDropActive(false);
    const files = Array.from(event.dataTransfer.files || []).filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/'));
    if (files.length === 0) {
      toast.error('Please drop image/video files only');
      return;
    }
    setLocalMedia((prev) => [...files, ...prev]);
    toast.success(`${files.length} media files added`);
  };

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }
    setSaving(true);
    try {
      await adminApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const exportQuotePdf = (quote: ApiQuote) => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>Quote ${quote._id}</title></head>
      <body style="font-family: Arial, sans-serif; padding: 24px">
        <h2>Graven Metals Quote Request</h2>
        <p><strong>Client:</strong> ${quote.fullName}</p>
        <p><strong>Email:</strong> ${quote.email}</p>
        <p><strong>Phone:</strong> ${quote.phone}</p>
        <p><strong>Metal:</strong> ${quote.metal}</p>
        <p><strong>Quantity:</strong> ${quote.quantity}</p>
        <p><strong>Status:</strong> ${quote.status}</p>
        <p><strong>Requirement:</strong> ${quote.requirement || '-'}</p>
      </body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  const logout = () => {
    clearAuth();
    navigate('/auth', { replace: true });
  };

  const blogCommand = (command: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command);
    setBlogForm((prev) => ({ ...prev, content: editorRef.current?.innerHTML || '' }));
  };

  const notifications = useMemo(() => activities.slice(0, 5), [activities]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(214,182,118,0.08),transparent_38%)] px-4 py-4 md:px-6">
      <SEO title="Admin Dashboard" description="Enterprise admin control center for Graven Metal." path="/admin" noIndex />
      {loading ? <LoadingOverlay /> : null}

      <div className="mx-auto grid max-w-[1540px] gap-4 md:grid-cols-[260px_1fr]">
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          } fixed inset-y-0 left-0 z-40 w-[280px] border-r border-gold/15 bg-[#070c11] p-4 shadow-halo transition-transform md:sticky md:top-4 md:h-[calc(100vh-2rem)] md:w-auto md:rounded-2xl md:border md:border-gold/20 md:bg-[#0a0f14]`}
        >
          <div className="flex items-center justify-between">
            <BrandLogo className="h-11" />
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg border border-gold/20 bg-[#0d1218] p-2 text-zinc-300 md:hidden"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mt-6 space-y-1.5">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = section === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setSection(item.key);
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm ${
                    active
                      ? 'bg-gradient-to-r from-brass to-gold font-semibold text-black shadow-gold'
                      : 'border border-gold/10 bg-[#0d1218] text-zinc-300 hover:border-gold/30 hover:text-zinc-100'
                  }`}
                >
                  <Icon size={17} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-xl border border-gold/15 bg-[#0b1016] p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Signed In</p>
            <p className="mt-1 text-sm font-semibold text-zinc-100">{user?.name || 'Admin User'}</p>
            <p className="text-xs text-zinc-500">{user?.email}</p>
            <p className="mt-2 inline-flex rounded-md border border-gold/20 bg-gold/10 px-2 py-1 text-[11px] uppercase tracking-[0.15em] text-gold">
              {user?.role || 'admin'}
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300 hover:bg-red-500/20"
          >
            <LogOut size={16} />
            Logout
          </button>
        </aside>

        {sidebarOpen ? (
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
          />
        ) : null}

        <main className="space-y-4">
          <section className="sticky top-2 z-20 rounded-2xl border border-gold/20 bg-[#090e14]/95 p-3 shadow-glow backdrop-blur-xl">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg border border-gold/20 bg-[#0d1218] p-2 text-gold md:hidden"
                aria-label="Open sidebar"
              >
                <Menu size={18} />
              </button>

              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Enterprise Control Center</p>
                <h1 className="font-display text-2xl text-white">{sectionTitle(section)}</h1>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <div className="relative hidden sm:block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                  <input
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    placeholder="Search dashboard..."
                    className="w-64 rounded-lg border border-gold/20 bg-[#0d1218] py-2 pl-9 pr-3 text-sm text-zinc-100 outline-none focus:border-gold/60"
                  />
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowNotifications((s) => !s)}
                    className="rounded-lg border border-gold/20 bg-[#0d1218] p-2 text-zinc-200 hover:text-gold"
                    aria-label="Notifications"
                  >
                    <Bell size={17} />
                  </button>
                  {showNotifications ? (
                    <div className="absolute right-0 mt-2 w-80 rounded-xl border border-gold/20 bg-[#0b1016] p-3 shadow-halo">
                      <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Recent Activities</p>
                      <div className="mt-2 space-y-2">
                        {notifications.length ? (
                          notifications.map((item) => (
                            <div key={item.id} className="rounded-lg border border-gold/10 bg-[#0f151d] p-2">
                              <p className="text-sm text-zinc-100">{item.title}</p>
                              <p className="text-xs text-zinc-500">{item.subtitle}</p>
                              <p className="text-[11px] text-zinc-600">{formatDateTime(item.createdAt)}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-zinc-500">No activities yet.</p>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowProfile((s) => !s)}
                    className="rounded-lg border border-gold/20 bg-[#0d1218] p-2 text-zinc-200 hover:text-gold"
                    aria-label="Profile menu"
                  >
                    <UserCircle2 size={17} />
                  </button>
                  {showProfile ? (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gold/20 bg-[#0b1016] p-2 shadow-halo">
                      <p className="rounded-lg px-2 py-1.5 text-xs uppercase tracking-[0.14em] text-zinc-500">Profile</p>
                      <p className="px-2 pt-1 text-sm text-zinc-100">{user?.name || 'Admin User'}</p>
                      <p className="px-2 text-xs text-zinc-500">{user?.email}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setSection('security');
                          setShowProfile(false);
                        }}
                        className="mt-2 flex w-full items-center gap-2 rounded-lg border border-gold/10 bg-[#101722] px-2 py-2 text-sm text-zinc-200 hover:border-gold/40"
                      >
                        <LockKeyhole size={15} />
                        Security
                      </button>
                      <button
                        type="button"
                        onClick={logout}
                        className="mt-1 flex w-full items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-2 text-sm text-red-300"
                      >
                        <LogOut size={15} />
                        Logout
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          {error ? (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
          ) : null}

          {section === 'dashboard' ? (
            <>
              <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {dashboardStats.map((stat) => (
                  <StatCard key={stat.title} {...stat} />
                ))}
              </section>

              <section className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
                <article className={panelClass}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Monthly Overview Graph</p>
                      <h3 className="mt-1 font-display text-2xl text-white">Inquiries Trend</h3>
                    </div>
                    <BarChart3 size={18} className="text-gold" />
                  </div>

                  <div className="mt-5 grid grid-cols-6 gap-2">
                    {monthlySeries.map((m) => {
                      const max = Math.max(...monthlySeries.map((x) => x.quotes + x.contacts), 1);
                      const percent = Math.max(8, ((m.quotes + m.contacts) / max) * 100);
                      return (
                        <div key={m.key} className="flex flex-col items-center gap-2">
                          <div className="flex h-36 w-full items-end justify-center rounded-lg border border-gold/10 bg-[#0d131c] p-2">
                            <div className="w-5 rounded-md bg-gradient-to-t from-brass to-gold" style={{ height: `${percent}%` }} />
                          </div>
                          <p className="text-xs text-zinc-400">{m.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </article>

                <article className={panelClass}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Quick Analytics Cards</p>
                      <h3 className="mt-1 font-display text-2xl text-white">Snapshot</h3>
                    </div>
                    <Sparkles size={18} className="text-gold" />
                  </div>
                  <div className="mt-4 space-y-2">
                    {quickAnalytics.map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-lg border border-gold/10 bg-[#0f151e] px-3 py-2">
                        <p className="text-sm text-zinc-300">{item.label}</p>
                        <p className="text-lg font-semibold text-gold">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </article>
              </section>

              <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                <article className={panelClass}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Action Center</p>
                      <h3 className="mt-1 font-display text-2xl text-white">Needs Attention</h3>
                    </div>
                    <AlertTriangle size={18} className="text-gold" />
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {actionItems.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setSection(item.section)}
                        className={`rounded-xl border px-3 py-3 text-left ${
                          item.urgent
                            ? 'border-gold/30 bg-gold/10 hover:border-gold/60'
                            : 'border-gold/10 bg-[#101722] hover:border-gold/35'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-zinc-100">{item.label}</p>
                          <span className="text-2xl font-bold text-gold">{item.value}</span>
                        </div>
                        <p className="mt-1 text-xs text-zinc-500">{item.helper}</p>
                      </button>
                    ))}
                  </div>
                </article>

                <article className={panelClass}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Storefront Readiness</p>
                      <h3 className="mt-1 font-display text-2xl text-white">Launch Checks</h3>
                    </div>
                    <CheckCircle2 size={18} className="text-gold" />
                  </div>
                  <div className="mt-4 space-y-2">
                    {contentReadiness.map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-lg border border-gold/10 bg-[#101722] px-3 py-2">
                        <span className="text-sm text-zinc-300">{item.label}</span>
                        <span className={item.done ? 'text-sm font-semibold text-emerald-300' : 'text-sm font-semibold text-zinc-600'}>
                          {item.done ? 'Ready' : 'Missing'}
                        </span>
                      </div>
                    ))}
                  </div>
                </article>
              </section>

              <section className="grid gap-4 lg:grid-cols-2">
                <article className={panelClass}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Top Products Section</p>
                      <h3 className="mt-1 font-display text-2xl text-white">Premium Catalog Leaders</h3>
                    </div>
                    <Boxes size={18} className="text-gold" />
                  </div>

                  <div className="mt-4 space-y-2">
                    {topProducts.length ? (
                      topProducts.map((item) => (
                        <div key={item._id} className="flex items-center justify-between rounded-lg border border-gold/10 bg-[#101722] px-3 py-2">
                          <div>
                            <p className="text-sm text-zinc-100">{item.name}</p>
                            <p className="text-xs text-zinc-500">
                              {(typeof item.category === 'string' ? item.category : item.category?.name) || 'Category'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gold">
                              {formatCurrency('USD', getUnitPrice(item))} / {getUnitType(item)}
                            </p>
                            <p className="text-xs text-zinc-500">Stock {item.stockQty || 0}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <EmptyState title="No products yet" message="Add products to populate top products ranking." />
                    )}
                  </div>
                </article>

                <article className={panelClass}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Recent Activities</p>
                      <h3 className="mt-1 font-display text-2xl text-white">Latest Operations</h3>
                    </div>
                    <Sparkles size={18} className="text-gold" />
                  </div>
                  <div className="mt-4 space-y-2">
                    {activities.length ? (
                      activities.map((item) => (
                        <div key={item.id} className="rounded-lg border border-gold/10 bg-[#101722] px-3 py-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-zinc-100">{item.title}</p>
                            <span className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">{item.type}</span>
                          </div>
                          <p className="text-xs text-zinc-500">{item.subtitle}</p>
                          <p className="text-[11px] text-zinc-600">{formatDateTime(item.createdAt)}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-zinc-500">No recent activities.</p>
                    )}
                  </div>
                </article>
              </section>

              <section className={panelClass}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Recent Orders/Inquiry Table</p>
                    <h3 className="mt-1 font-display text-2xl text-white">Latest Quote Requests</h3>
                  </div>
                  <Table2 size={18} className="text-gold" />
                </div>
                <div className="mt-4 overflow-x-auto rounded-xl border border-gold/15 bg-[#0a1119]">
                  <table className="w-full min-w-[860px] text-sm">
                    <thead className="border-b border-gold/10 text-left text-xs uppercase tracking-[0.14em] text-zinc-500">
                      <tr>
                        <th className="px-3 py-3">Type</th>
                        <th className="px-3 py-3">Client</th>
                        <th className="px-3 py-3">Email</th>
                        <th className="px-3 py-3">Inquiry</th>
                        <th className="px-3 py-3">Status</th>
                        <th className="px-3 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentInquiries.map((row) => (
                        <tr key={row.id} className="border-t border-gold/10">
                          <td className="px-3 py-3 text-zinc-400">{row.type}</td>
                          <td className="px-3 py-3 text-zinc-100">{row.name}</td>
                          <td className="px-3 py-3 text-zinc-300">{row.email}</td>
                          <td className="max-w-[300px] truncate px-3 py-3 text-zinc-400">{row.detail}</td>
                          <td className="px-3 py-3 text-gold">{row.status}</td>
                          <td className="px-3 py-3 text-zinc-500">{formatDate(row.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          ) : null}

          {section === 'products' ? (
            <section className={panelClass}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Product Management</p>
                  <h3 className="mt-1 font-display text-2xl text-white">Industrial Product Registry</h3>
                </div>
                <button
                  type="button"
                  onClick={() => openCreateModal('product')}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-brass to-gold px-4 py-2 text-sm font-semibold text-black shadow-gold"
                >
                  <Plus size={15} />
                  Add Product
                </button>
              </div>

              <div className="mt-4 grid gap-2 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
                <input
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                  placeholder="Search by name, slug or category"
                  className={inputClass}
                />
                <select
                  value={productStatusFilter}
                  onChange={(e) => setProductStatusFilter(e.target.value as 'all' | 'in_stock' | 'out_stock')}
                  className={inputClass}
                >
                  <option value="all">All Stock Status</option>
                  <option value="in_stock">In Stock</option>
                  <option value="out_stock">Out of Stock</option>
                </select>
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className={inputClass}
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 overflow-x-auto rounded-xl border border-gold/15 bg-[#0b1119]">
                <table className="w-full min-w-[980px] text-sm">
                  <thead className="border-b border-gold/10 text-left text-xs uppercase tracking-[0.14em] text-zinc-500">
                    <tr>
                      <th className="px-3 py-3">Product</th>
                      <th className="px-3 py-3">Category</th>
                      <th className="px-3 py-3">Unit Price</th>
                      <th className="px-3 py-3">Stock</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((item) => (
                      <tr key={item._id} className="border-t border-gold/10">
                        <td className="px-3 py-3">
                          <p className="text-zinc-100">{item.name}</p>
                          <p className="text-xs text-zinc-500">{item.slug}</p>
                        </td>
                        <td className="px-3 py-3 text-zinc-300">
                          {typeof item.category === 'string' ? item.category : item.category?.name || '-'}
                        </td>
                        <td className="px-3 py-3 text-zinc-100">
                          {formatCurrency('USD', getUnitPrice(item))} / {getUnitType(item)}
                        </td>
                        <td className="px-3 py-3 text-zinc-300">{item.stockQty || 0}</td>
                        <td className="px-3 py-3">
                          <button
                            type="button"
                            onClick={async () => {
                              const nextQty = item.inStock ? 0 : Math.max(item.stockQty || 0, 1);
                              try {
                                await adminApi.updateProduct(item._id, { stockQty: nextQty });
                                toast.success(item.inStock ? 'Marked out of stock' : 'Marked in stock');
                                await loadAll();
                              } catch (err) {
                                toast.error((err as Error).message);
                              }
                            }}
                            className={`rounded-md px-2 py-1 text-xs ${
                              item.inStock
                                ? 'border border-emerald-500/35 bg-emerald-500/10 text-emerald-300'
                                : 'border border-red-500/35 bg-red-500/10 text-red-300'
                            }`}
                          >
                            {item.inStock ? 'In Stock' : 'Out Stock'}
                          </button>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditProduct(item)}
                              className="rounded-md border border-gold/20 bg-[#0f151e] p-1.5 text-zinc-200 hover:border-gold/50 hover:text-gold"
                            >
                              <PencilLine size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await adminApi.deleteProduct(item._id);
                                  toast.success('Product deleted');
                                  await loadAll();
                                } catch (err) {
                                  toast.error((err as Error).message);
                                }
                              }}
                              className="rounded-md border border-red-500/30 bg-red-500/10 p-1.5 text-red-300"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 rounded-xl border border-gold/15 bg-[#0d131b] p-4">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet size={16} className="text-gold" />
                  <p className="text-sm font-semibold text-zinc-100">Bulk Upload Support (CSV)</p>
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  Headers: `name,slug,price,stockQty,category,description,currency,unit,unitType,weightPerUnit,weightUnit,moq`
                </p>
                <div className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className={`${inputClass} file:mr-2 file:rounded-md file:border-0 file:bg-gold file:px-2 file:py-1 file:text-black`}
                    onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
                  />
                  <select value={bulkCategory} onChange={(e) => setBulkCategory(e.target.value)} className={inputClass}>
                    <option value="">Use category from CSV or first category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={runBulkProductUpload}
                    disabled={bulkProcessing}
                    className="rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-sm font-semibold text-gold hover:bg-gold/20 disabled:opacity-50"
                  >
                    {bulkProcessing ? 'Uploading...' : 'Run Bulk Upload'}
                  </button>
                </div>
              </div>
            </section>
          ) : null}

          {section === 'categories' ? (
            <section className={panelClass}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Category Management</p>
                  <h3 className="mt-1 font-display text-2xl text-white">Taxonomy & SEO Slugs</h3>
                </div>
                <button
                  type="button"
                  onClick={() => openCreateModal('category')}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-brass to-gold px-4 py-2 text-sm font-semibold text-black shadow-gold"
                >
                  <Plus size={15} />
                  Add Category
                </button>
              </div>

              <div className="mt-4 overflow-x-auto rounded-xl border border-gold/15 bg-[#0b1119]">
                <table className="w-full min-w-[820px] text-sm">
                  <thead className="border-b border-gold/10 text-left text-xs uppercase tracking-[0.14em] text-zinc-500">
                    <tr>
                      <th className="px-3 py-3">Category</th>
                      <th className="px-3 py-3">Slug</th>
                      <th className="px-3 py-3">Sort</th>
                      <th className="px-3 py-3">Products</th>
                      <th className="px-3 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.map((item) => (
                      <tr key={item._id} className="border-t border-gold/10">
                        <td className="px-3 py-3 text-zinc-100">{item.name}</td>
                        <td className="px-3 py-3 text-zinc-400">{item.slug}</td>
                        <td className="px-3 py-3 text-zinc-300">{item.sortOrder || 0}</td>
                        <td className="px-3 py-3 text-zinc-300">{item.productCount || 0}</td>
                        <td className="px-3 py-3">
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditCategory(item)}
                              className="rounded-md border border-gold/20 bg-[#0f151e] p-1.5 text-zinc-200 hover:border-gold/50 hover:text-gold"
                            >
                              <PencilLine size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await adminApi.deleteCategory(item._id);
                                  toast.success('Category deleted');
                                  await loadAll();
                                } catch (err) {
                                  toast.error((err as Error).message);
                                }
                              }}
                              className="rounded-md border border-red-500/30 bg-red-500/10 p-1.5 text-red-300"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {section === 'blogs' ? (
            <section className={panelClass}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Blog Management</p>
                  <h3 className="mt-1 font-display text-2xl text-white">Content & SEO Publishing</h3>
                </div>
                <div className="flex gap-2">
                  <select
                    value={blogStateFilter}
                    onChange={(e) => setBlogStateFilter(e.target.value as 'all' | 'published' | 'draft')}
                    className={`${inputClass} w-40`}
                  >
                    <option value="all">All States</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => openCreateModal('blog')}
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-brass to-gold px-4 py-2 text-sm font-semibold text-black shadow-gold"
                  >
                    <Plus size={15} />
                    Add Blog
                  </button>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto rounded-xl border border-gold/15 bg-[#0b1119]">
                <table className="w-full min-w-[860px] text-sm">
                  <thead className="border-b border-gold/10 text-left text-xs uppercase tracking-[0.14em] text-zinc-500">
                    <tr>
                      <th className="px-3 py-3">Title</th>
                      <th className="px-3 py-3">Slug</th>
                      <th className="px-3 py-3">State</th>
                      <th className="px-3 py-3">Updated</th>
                      <th className="px-3 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBlogs.map((item) => (
                      <tr key={item._id} className="border-t border-gold/10">
                        <td className="px-3 py-3 text-zinc-100">{item.title}</td>
                        <td className="px-3 py-3 text-zinc-400">{item.slug}</td>
                        <td className="px-3 py-3">
                          <span
                            className={`rounded-md px-2 py-1 text-xs ${
                              item.published === false
                                ? 'border border-zinc-600 bg-zinc-800/70 text-zinc-300'
                                : 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                            }`}
                          >
                            {item.published === false ? 'Draft' : 'Published'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-zinc-500">{formatDate(item.createdAt)}</td>
                        <td className="px-3 py-3">
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditBlog(item)}
                              className="rounded-md border border-gold/20 bg-[#0f151e] p-1.5 text-zinc-200 hover:border-gold/50 hover:text-gold"
                            >
                              <PencilLine size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await adminApi.updateBlog(item._id, { published: item.published === false });
                                  toast.success(item.published === false ? 'Published' : 'Moved to draft');
                                  await loadAll();
                                } catch (err) {
                                  toast.error((err as Error).message);
                                }
                              }}
                              className="rounded-md border border-gold/20 bg-gold/10 p-1.5 text-gold"
                              title="Toggle publish/draft"
                            >
                              <Save size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await adminApi.deleteBlog(item._id);
                                  toast.success('Blog deleted');
                                  await loadAll();
                                } catch (err) {
                                  toast.error((err as Error).message);
                                }
                              }}
                              className="rounded-md border border-red-500/30 bg-red-500/10 p-1.5 text-red-300"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {section === 'quotes' ? (
            <section className={panelClass}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Quote Management</p>
                  <h3 className="mt-1 font-display text-2xl text-white">Client Quote Requests</h3>
                </div>
                <select
                  value={quoteStatusFilter}
                  onChange={(e) => setQuoteStatusFilter(e.target.value as 'all' | ApiQuote['status'])}
                  className={`${inputClass} w-48`}
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="in_review">In Review</option>
                  <option value="quoted">Quoted</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="mt-4 overflow-x-auto rounded-xl border border-gold/15 bg-[#0b1119]">
                <table className="w-full min-w-[1080px] text-sm">
                  <thead className="border-b border-gold/10 text-left text-xs uppercase tracking-[0.14em] text-zinc-500">
                    <tr>
                      <th className="px-3 py-3">Customer</th>
                      <th className="px-3 py-3">Inquiry</th>
                      <th className="px-3 py-3">Email</th>
                      <th className="px-3 py-3">Phone</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuotes.map((item) => (
                      <tr key={item._id} className="border-t border-gold/10">
                        <td className="px-3 py-3 text-zinc-100">{item.fullName}</td>
                        <td className="px-3 py-3 text-zinc-300">
                          {item.metal} · {item.quantity}
                        </td>
                        <td className="px-3 py-3 text-zinc-300">{item.email}</td>
                        <td className="px-3 py-3 text-zinc-300">{item.phone}</td>
                        <td className="px-3 py-3">
                          <select
                            value={item.status}
                            onChange={(e) => updateQuoteStatus(item, e.target.value as ApiQuote['status'])}
                            className={inputClass}
                          >
                            <option value="new">new</option>
                            <option value="in_review">in_review</option>
                            <option value="quoted">quoted</option>
                            <option value="closed">closed</option>
                          </select>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedQuote(item);
                                setQuoteAdminNote(item.adminNotes || '');
                              }}
                              className="rounded-md border border-gold/20 bg-[#0f151e] p-1.5 text-zinc-200 hover:border-gold/50 hover:text-gold"
                              title="Open details"
                            >
                              <Search size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => exportQuotePdf(item)}
                              className="rounded-md border border-gold/20 bg-gold/10 p-1.5 text-gold"
                              title="Export PDF"
                            >
                              <FileText size={14} />
                            </button>
                            <a
                              href={`mailto:${item.email}?subject=Regarding your Graven Metals quote`}
                              className="rounded-md border border-gold/20 bg-[#0f151e] p-1.5 text-zinc-200 hover:border-gold/50 hover:text-gold"
                              title="Contact customer"
                            >
                              <Mail size={14} />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {section === 'contacts' ? (
            <section className={panelClass}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Contact Management</p>
                  <h3 className="mt-1 font-display text-2xl text-white">Lead & Support Inbox</h3>
                </div>
                <select
                  value={contactStatusFilter}
                  onChange={(e) => setContactStatusFilter(e.target.value as 'all' | ApiContact['status'])}
                  className={`${inputClass} w-48`}
                >
                  <option value="all">All Status</option>
                  <option value="unread">unread</option>
                  <option value="read">read</option>
                  <option value="replied">replied</option>
                  <option value="archived">archived</option>
                </select>
              </div>

              <div className="mt-4 overflow-x-auto rounded-xl border border-gold/15 bg-[#0b1119]">
                <table className="w-full min-w-[1060px] text-sm">
                  <thead className="border-b border-gold/10 text-left text-xs uppercase tracking-[0.14em] text-zinc-500">
                    <tr>
                      <th className="px-3 py-3">Name</th>
                      <th className="px-3 py-3">Email</th>
                      <th className="px-3 py-3">Phone</th>
                      <th className="px-3 py-3">Subject</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.map((item) => (
                      <tr key={item._id} className="border-t border-gold/10">
                        <td className="px-3 py-3 text-zinc-100">{item.fullName}</td>
                        <td className="px-3 py-3 text-zinc-300">{item.email}</td>
                        <td className="px-3 py-3 text-zinc-300">{item.phone}</td>
                        <td className="max-w-[260px] truncate px-3 py-3 text-zinc-400">{item.subject || '-'}</td>
                        <td className="px-3 py-3 text-gold">{item.status}</td>
                        <td className="px-3 py-3">
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedContact(item);
                                setContactAdminNote(item.adminNotes || '');
                              }}
                              className="rounded-md border border-gold/20 bg-[#0f151e] p-1.5 text-zinc-200 hover:border-gold/50 hover:text-gold"
                              title="Open details"
                            >
                              <Search size={14} />
                            </button>
                            <a
                              href={`mailto:${item.email}?subject=Reply from Graven Metals`}
                              className="rounded-md border border-gold/20 bg-gold/10 p-1.5 text-gold"
                              title="Reply"
                            >
                              <Mail size={14} />
                            </a>
                            <button
                              type="button"
                              onClick={() => removeContact(item._id)}
                              className="rounded-md border border-red-500/30 bg-red-500/10 p-1.5 text-red-300"
                              title="Delete spam"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {section === 'customers' ? (
            <section className={panelClass}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Customer Monitoring</p>
                  <h3 className="mt-1 font-display text-2xl text-white">Customer Activity</h3>
                  <p className="mt-1 max-w-2xl text-sm text-zinc-500">
                    Monitor customer quote requests, contact messages, open follow-ups, and latest activity from one place.
                  </p>
                </div>
                <div className="relative w-full lg:max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                  <input
                    value={customerQuery}
                    onChange={(e) => setCustomerQuery(e.target.value)}
                    placeholder="Search customers"
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ['Tracked Customers', customerActivity.length],
                  ['Open Quotes', customerActivity.reduce((sum, row) => sum + row.openQuotes, 0)],
                  ['Unread Messages', customerActivity.reduce((sum, row) => sum + row.unreadContacts, 0)],
                  ['Total Interactions', customerActivity.reduce((sum, row) => sum + row.quoteCount + row.contactCount, 0)],
                ].map(([labelText, value]) => (
                  <div key={labelText} className="rounded-xl border border-gold/15 bg-[#101722] p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{labelText}</p>
                    <p className="mt-2 text-3xl font-bold text-gold">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 overflow-x-auto rounded-xl border border-gold/15 bg-[#0b1119]">
                <table className="w-full min-w-[1080px] text-sm">
                  <thead className="border-b border-gold/10 text-left text-xs uppercase tracking-[0.14em] text-zinc-500">
                    <tr>
                      <th className="px-3 py-3">Customer</th>
                      <th className="px-3 py-3">Contact</th>
                      <th className="px-3 py-3">Quotes</th>
                      <th className="px-3 py-3">Messages</th>
                      <th className="px-3 py-3">Last Activity</th>
                      <th className="px-3 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerActivity.map((row) => (
                      <tr key={row.id} className="border-t border-gold/10 align-top">
                        <td className="px-3 py-3">
                          <p className="font-semibold text-white">{row.name || 'Unknown customer'}</p>
                          <p className="text-xs capitalize text-zinc-500">{row.lastActivityType || 'activity'} watcher</p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="text-zinc-300">{row.email}</p>
                          <p className="text-xs text-zinc-500">{row.phone || '-'}</p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="font-semibold text-gold">{row.quoteCount}</p>
                          <p className="text-xs text-zinc-500">{row.openQuotes} open</p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="font-semibold text-gold">{row.contactCount}</p>
                          <p className="text-xs text-zinc-500">{row.unreadContacts} unread</p>
                        </td>
                        <td className="max-w-[280px] px-3 py-3">
                          <p className="truncate text-zinc-300">{row.lastActivityDetail || '-'}</p>
                          <p className="text-xs text-zinc-500">{formatDateTime(row.lastActivityAt)}</p>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setSection('quotes')}
                              className="rounded-md border border-gold/20 bg-[#0f151e] px-3 py-1.5 text-xs text-zinc-200 hover:border-gold/50 hover:text-gold"
                            >
                              Quotes
                            </button>
                            <button
                              type="button"
                              onClick={() => setSection('contacts')}
                              className="rounded-md border border-gold/20 bg-[#0f151e] px-3 py-1.5 text-xs text-zinc-200 hover:border-gold/50 hover:text-gold"
                            >
                              Messages
                            </button>
                            <a
                              href={`mailto:${row.email}?subject=Follow-up from Graven Metals`}
                              className="rounded-md border border-gold/20 bg-gold/10 px-3 py-1.5 text-xs text-gold"
                            >
                              Email
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!customerActivity.length ? (
                  <div className="p-5">
                    <EmptyState title="No customer activity yet" message="Quote requests and contact messages will appear here once customers interact with the website." />
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {section === 'settings' ? (
            <form className={`${panelClass} space-y-4`} onSubmit={saveSettings}>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Website Settings</p>
                <h3 className="mt-1 font-display text-2xl text-white">Brand, Footer, SEO, Payment Methods</h3>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1">
                  <span className={labelClass}>Site Name</span>
                  <input
                    className={inputClass}
                    value={settingsForm.siteName}
                    onChange={(e) => setSettingsForm((s) => ({ ...s, siteName: e.target.value }))}
                  />
                </label>
                <label className="space-y-1">
                  <span className={labelClass}>Support Email</span>
                  <input
                    className={inputClass}
                    value={settingsForm.supportEmail}
                    onChange={(e) => setSettingsForm((s) => ({ ...s, supportEmail: e.target.value }))}
                  />
                </label>
                <label className="space-y-1 md:col-span-2">
                  <span className={labelClass}>Logo URL</span>
                  <input
                    className={inputClass}
                    value={settingsForm.logoUrl}
                    onChange={(e) => setSettingsForm((s) => ({ ...s, logoUrl: e.target.value }))}
                  />
                </label>
                <label className="space-y-1 md:col-span-2">
                  <span className={labelClass}>Footer Description</span>
                  <textarea
                    rows={3}
                    className={inputClass}
                    value={settingsForm.footerText}
                    onChange={(e) => setSettingsForm((s) => ({ ...s, footerText: e.target.value }))}
                  />
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <label className="space-y-1">
                  <span className={labelClass}>Contact Phone</span>
                  <input
                    className={inputClass}
                    value={settingsForm.contactPhone}
                    onChange={(e) => setSettingsForm((s) => ({ ...s, contactPhone: e.target.value }))}
                  />
                </label>
                <label className="space-y-1">
                  <span className={labelClass}>Contact Email</span>
                  <input
                    className={inputClass}
                    value={settingsForm.contactEmail}
                    onChange={(e) => setSettingsForm((s) => ({ ...s, contactEmail: e.target.value }))}
                  />
                </label>
                <label className="space-y-1">
                  <span className={labelClass}>WhatsApp</span>
                  <input
                    className={inputClass}
                    value={settingsForm.contactWhatsapp}
                    onChange={(e) => setSettingsForm((s) => ({ ...s, contactWhatsapp: e.target.value }))}
                  />
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1">
                  <span className={labelClass}>Lucknow Office Address</span>
                  <textarea
                    rows={4}
                    className={inputClass}
                    value={settingsForm.lucknowAddress}
                    onChange={(e) => setSettingsForm((s) => ({ ...s, lucknowAddress: e.target.value }))}
                  />
                </label>
                <label className="space-y-1">
                  <span className={labelClass}>Delhi Office Address</span>
                  <textarea
                    rows={4}
                    className={inputClass}
                    value={settingsForm.delhiAddress}
                    onChange={(e) => setSettingsForm((s) => ({ ...s, delhiAddress: e.target.value }))}
                  />
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                <label className="space-y-1">
                  <span className={labelClass}>Facebook URL</span>
                  <input
                    className={inputClass}
                    value={settingsForm.socialFacebook}
                    onChange={(e) => setSettingsForm((s) => ({ ...s, socialFacebook: e.target.value }))}
                  />
                </label>
                <label className="space-y-1">
                  <span className={labelClass}>LinkedIn URL</span>
                  <input
                    className={inputClass}
                    value={settingsForm.socialLinkedIn}
                    onChange={(e) => setSettingsForm((s) => ({ ...s, socialLinkedIn: e.target.value }))}
                  />
                </label>
                <label className="space-y-1">
                  <span className={labelClass}>Instagram URL</span>
                  <input
                    className={inputClass}
                    value={settingsForm.socialInstagram}
                    onChange={(e) => setSettingsForm((s) => ({ ...s, socialInstagram: e.target.value }))}
                  />
                </label>
                <label className="space-y-1">
                  <span className={labelClass}>YouTube URL</span>
                  <input
                    className={inputClass}
                    value={settingsForm.socialYouTube}
                    onChange={(e) => setSettingsForm((s) => ({ ...s, socialYouTube: e.target.value }))}
                  />
                </label>
              </div>

              <div className="rounded-xl border border-gold/15 bg-[#0b1119] p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">SEO Settings</p>
                <div className="mt-2 grid gap-3 md:grid-cols-2">
                  <label className="space-y-1">
                    <span className={labelClass}>Meta Title</span>
                    <input
                      className={inputClass}
                      value={settingsForm.seoMetaTitle}
                      onChange={(e) => setSettingsForm((s) => ({ ...s, seoMetaTitle: e.target.value }))}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className={labelClass}>OG Image URL</span>
                    <input
                      className={inputClass}
                      value={settingsForm.seoOgImage}
                      onChange={(e) => setSettingsForm((s) => ({ ...s, seoOgImage: e.target.value }))}
                    />
                  </label>
                  <label className="space-y-1 md:col-span-2">
                    <span className={labelClass}>Meta Description</span>
                    <textarea
                      rows={3}
                      className={inputClass}
                      value={settingsForm.seoMetaDescription}
                      onChange={(e) => setSettingsForm((s) => ({ ...s, seoMetaDescription: e.target.value }))}
                    />
                  </label>
                  <label className="space-y-1 md:col-span-2">
                    <span className={labelClass}>Keywords (comma separated)</span>
                    <input
                      className={inputClass}
                      value={settingsForm.seoKeywords}
                      onChange={(e) => setSettingsForm((s) => ({ ...s, seoKeywords: e.target.value }))}
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-xl border border-gold/15 bg-[#0b1119] p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Payment Methods Management</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    ['payVisa', 'Visa'],
                    ['payMastercard', 'MasterCard'],
                    ['payUpi', 'UPI'],
                    ['payAmex', 'American Express'],
                    ['payRupay', 'RuPay'],
                  ].map(([key, label]) => (
                    <label key={key} className="inline-flex items-center gap-2 rounded-lg border border-gold/20 bg-[#0d1218] px-3 py-2 text-sm text-zinc-200">
                      <input
                        type="checkbox"
                        checked={Boolean(settingsForm[key as keyof SettingsForm])}
                        onChange={(e) =>
                          setSettingsForm((s) => ({
                            ...s,
                            [key]: e.target.checked,
                          }))
                        }
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={settingsForm.maintenanceMode}
                  onChange={(e) => setSettingsForm((s) => ({ ...s, maintenanceMode: e.target.checked }))}
                />
                Enable maintenance mode
              </label>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-brass to-gold px-4 py-2 text-sm font-semibold text-black shadow-gold disabled:opacity-50"
              >
                <Save size={15} />
                {saving ? 'Saving...' : 'Save Website Settings'}
              </button>
            </form>
          ) : null}

          {section === 'media' ? (
            <section className={panelClass}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Media Manager</p>
                  <h3 className="mt-1 font-display text-2xl text-white">Upload Images/Videos & Preview Library</h3>
                </div>
              </div>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setMediaDropActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setMediaDropActive(false);
                }}
                onDrop={handleMediaDrop}
                className={`mt-4 rounded-xl border-2 border-dashed p-6 text-center ${
                  mediaDropActive ? 'border-gold bg-gold/10' : 'border-gold/30 bg-[#0b1119]'
                }`}
              >
                <Upload size={20} className="mx-auto text-gold" />
                <p className="mt-2 text-sm text-zinc-200">Drag & Drop Upload Zone</p>
                <p className="text-xs text-zinc-500">or use file picker to add images/videos</p>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="mt-3 text-sm text-zinc-300 file:mr-2 file:rounded-md file:border-0 file:bg-gold file:px-3 file:py-1.5 file:text-black"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setLocalMedia((prev) => [...files, ...prev]);
                  }}
                />
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-100">New Upload Queue</h4>
                  <div className="mt-2 space-y-2">
                    {localMedia.length ? (
                      localMedia.map((file, idx) => (
                        <div key={`${file.name}-${idx}`} className="flex items-center justify-between rounded-lg border border-gold/10 bg-[#0f151e] px-3 py-2">
                          <div>
                            <p className="text-sm text-zinc-100">{file.name}</p>
                            <p className="text-xs text-zinc-500">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setLocalMedia((prev) => prev.filter((_, i) => i !== idx))}
                            className="rounded-md border border-red-500/30 bg-red-500/10 p-1.5 text-red-300"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-zinc-500">No pending media uploads.</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-zinc-100">Existing Media Library</h4>
                  <div className="mt-2 grid max-h-[360px] grid-cols-2 gap-2 overflow-y-auto rounded-lg border border-gold/10 bg-[#0f151e] p-2">
                    {existingMedia.length ? (
                      existingMedia.map((item) => (
                        <div key={item.id} className="rounded-md border border-gold/10 bg-[#0b1119] p-2">
                          <img src={item.url} alt={item.name} className="h-24 w-full rounded object-cover" />
                          <p className="mt-1 truncate text-xs text-zinc-300">{item.name}</p>
                          <p className="text-[11px] text-zinc-500">{item.type}</p>
                        </div>
                      ))
                    ) : (
                      <p className="col-span-2 text-sm text-zinc-500">No media assets found.</p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {section === 'security' ? (
            <section className={panelClass}>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Security</p>
                <h3 className="mt-1 font-display text-2xl text-white">Protected Session & Password Management</h3>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <article className="rounded-xl border border-gold/15 bg-[#0b1119] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Session Handling</p>
                  <p className="mt-2 text-sm text-zinc-300">Logged in as {user?.email}</p>
                  <p className="text-xs text-zinc-500">Role: {user?.role || 'admin'}</p>
                  <p className="mt-2 text-xs text-zinc-500">
                    Token stored: {localStorage.getItem('auth_token') ? 'Yes' : 'No'}
                  </p>
                  <button
                    type="button"
                    onClick={logout}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
                  >
                    <LogOut size={15} />
                    Logout Securely
                  </button>
                </article>

                <form className="rounded-xl border border-gold/15 bg-[#0b1119] p-4" onSubmit={handleChangePassword}>
                  <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Password Change</p>
                  <div className="mt-3 space-y-2">
                    <input
                      type="password"
                      placeholder="Current password"
                      className={inputClass}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm((s) => ({ ...s, currentPassword: e.target.value }))}
                    />
                    <input
                      type="password"
                      placeholder="New password"
                      className={inputClass}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm((s) => ({ ...s, newPassword: e.target.value }))}
                    />
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className={inputClass}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm((s) => ({ ...s, confirmPassword: e.target.value }))}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-brass to-gold px-4 py-2 text-sm font-semibold text-black shadow-gold disabled:opacity-50"
                  >
                    <LockKeyhole size={15} />
                    Update Password
                  </button>
                </form>
              </div>
            </section>
          ) : null}
        </main>
      </div>

      {modalType === 'product' ? (
        <ModalShell
          title={modalMode === 'create' ? 'Add Product' : 'Edit Product'}
          subtitle="Product Management"
          onClose={() => setModalType(null)}
        >
          <form className="grid gap-3 md:grid-cols-2" onSubmit={submitProduct}>
            <label className="space-y-1">
              <span className={labelClass}>Product Name</span>
              <input
                className={inputClass}
                value={productForm.name}
                onChange={(e) => setProductForm((s) => ({ ...s, name: e.target.value }))}
                required
              />
            </label>
            <label className="space-y-1">
              <span className={labelClass}>Slug</span>
              <input
                className={inputClass}
                value={productForm.slug}
                onChange={(e) => setProductForm((s) => ({ ...s, slug: e.target.value }))}
                required
              />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className={labelClass}>Description</span>
              <textarea
                rows={3}
                className={inputClass}
                value={productForm.description}
                onChange={(e) => setProductForm((s) => ({ ...s, description: e.target.value }))}
              />
            </label>
            <label className="space-y-1">
              <span className={labelClass}>Category</span>
              <select
                className={inputClass}
                value={productForm.category}
                onChange={(e) => setProductForm((s) => ({ ...s, category: e.target.value }))}
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className={labelClass}>Price Per Kg</span>
              <input
                className={inputClass}
                type="number"
                min={0}
                step="0.01"
                value={productForm.price}
                onChange={(e) => setProductForm((s) => ({ ...s, price: Number(e.target.value) }))}
                required
              />
              <p className="mt-1 text-xs text-zinc-500">
                Unit price: {formatCurrency('USD', getUnitPrice(productForm))} /{' '}
                {productForm.unitType || productForm.unit || 'unit'}
              </p>
            </label>
            <label className="space-y-1">
              <span className={labelClass}>Currency</span>
              <input
                className={inputClass}
                value={productForm.currency}
                onChange={(e) => setProductForm((s) => ({ ...s, currency: e.target.value }))}
              />
            </label>
            <label className="space-y-1">
              <span className={labelClass}>Unit Type</span>
              <input
                className={inputClass}
                value={productForm.unitType}
                onChange={(e) => setProductForm((s) => ({ ...s, unitType: e.target.value }))}
              />
            </label>
            <label className="space-y-1">
              <span className={labelClass}>Weight Per Unit</span>
              <input
                className={inputClass}
                type="number"
                min={0.01}
                step="0.01"
                value={productForm.weightPerUnit}
                onChange={(e) => setProductForm((s) => ({ ...s, weightPerUnit: Number(e.target.value) }))}
              />
            </label>
            <label className="space-y-1">
              <span className={labelClass}>Weight Unit</span>
              <select
                className={inputClass}
                value={productForm.weightUnit}
                onChange={(e) =>
                  setProductForm((s) => ({
                    ...s,
                    weightUnit: e.target.value,
                    unit: e.target.value,
                  }))
                }
              >
                <option value="kg">Kilogram (kg)</option>
                <option value="g">Gram (g)</option>
                <option value="lb">Pound (lb)</option>
                <option value="oz">Ounce (oz)</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className={labelClass}>MOQ</span>
              <input
                className={inputClass}
                type="number"
                min={1}
                value={productForm.moq}
                onChange={(e) => setProductForm((s) => ({ ...s, moq: Number(e.target.value) }))}
              />
            </label>
            <label className="space-y-1">
              <span className={labelClass}>Stock Quantity</span>
              <input
                className={inputClass}
                type="number"
                min={0}
                value={productForm.stockQty}
                onChange={(e) => setProductForm((s) => ({ ...s, stockQty: Number(e.target.value) }))}
              />
            </label>
            <label className="space-y-1">
              <span className={labelClass}>Upload Image</span>
              <input
                type="file"
                accept="image/*"
                className={`${inputClass} file:mr-2 file:rounded-md file:border-0 file:bg-gold file:px-2 file:py-1 file:text-black`}
                onChange={(e) => setProductForm((s) => ({ ...s, file: e.target.files?.[0] || null }))}
              />
            </label>

            <button
              type="submit"
              disabled={saving}
              className="md:col-span-2 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brass to-gold px-4 py-2.5 text-sm font-semibold text-black shadow-gold disabled:opacity-50"
            >
              <Save size={15} />
              {saving ? 'Saving...' : modalMode === 'create' ? 'Add Product' : 'Save Product'}
            </button>
          </form>
        </ModalShell>
      ) : null}

      {modalType === 'category' ? (
        <ModalShell
          title={modalMode === 'create' ? 'Add Category' : 'Edit Category'}
          subtitle="Category Management"
          onClose={() => setModalType(null)}
        >
          <form className="grid gap-3 md:grid-cols-2" onSubmit={submitCategory}>
            <label className="space-y-1">
              <span className={labelClass}>Category Name</span>
              <input
                className={inputClass}
                value={categoryForm.name}
                onChange={(e) => setCategoryForm((s) => ({ ...s, name: e.target.value }))}
                required
              />
            </label>
            <label className="space-y-1">
              <span className={labelClass}>SEO Slug</span>
              <input
                className={inputClass}
                value={categoryForm.slug}
                onChange={(e) => setCategoryForm((s) => ({ ...s, slug: e.target.value }))}
                required
              />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className={labelClass}>Description</span>
              <textarea
                rows={3}
                className={inputClass}
                value={categoryForm.description}
                onChange={(e) => setCategoryForm((s) => ({ ...s, description: e.target.value }))}
              />
            </label>
            <label className="space-y-1">
              <span className={labelClass}>Sort Order</span>
              <input
                type="number"
                className={inputClass}
                value={categoryForm.sortOrder}
                onChange={(e) => setCategoryForm((s) => ({ ...s, sortOrder: Number(e.target.value) }))}
              />
            </label>
            <label className="space-y-1">
              <span className={labelClass}>Category Image</span>
              <input
                type="file"
                accept="image/*"
                className={`${inputClass} file:mr-2 file:rounded-md file:border-0 file:bg-gold file:px-2 file:py-1 file:text-black`}
                onChange={(e) => setCategoryForm((s) => ({ ...s, file: e.target.files?.[0] || null }))}
              />
            </label>
            <label className="space-y-1">
              <span className={labelClass}>Meta Title</span>
              <input
                className={inputClass}
                value={categoryForm.metaTitle}
                onChange={(e) => setCategoryForm((s) => ({ ...s, metaTitle: e.target.value }))}
              />
            </label>
            <label className="space-y-1">
              <span className={labelClass}>Meta Description</span>
              <input
                className={inputClass}
                value={categoryForm.metaDescription}
                onChange={(e) => setCategoryForm((s) => ({ ...s, metaDescription: e.target.value }))}
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="md:col-span-2 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brass to-gold px-4 py-2.5 text-sm font-semibold text-black shadow-gold disabled:opacity-50"
            >
              <Save size={15} />
              {saving ? 'Saving...' : modalMode === 'create' ? 'Add Category' : 'Save Category'}
            </button>
          </form>
        </ModalShell>
      ) : null}

      {modalType === 'blog' ? (
        <ModalShell
          title={modalMode === 'create' ? 'Add Blog' : 'Edit Blog'}
          subtitle="Blog Management"
          onClose={() => setModalType(null)}
        >
          <form className="space-y-3" onSubmit={submitBlog}>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className={labelClass}>Title</span>
                <input
                  className={inputClass}
                  value={blogForm.title}
                  onChange={(e) => setBlogForm((s) => ({ ...s, title: e.target.value }))}
                  required
                />
              </label>
              <label className="space-y-1">
                <span className={labelClass}>Slug</span>
                <input
                  className={inputClass}
                  value={blogForm.slug}
                  onChange={(e) => setBlogForm((s) => ({ ...s, slug: e.target.value }))}
                  required
                />
              </label>
              <label className="space-y-1 md:col-span-2">
                <span className={labelClass}>Excerpt</span>
                <textarea
                  rows={2}
                  className={inputClass}
                  value={blogForm.excerpt}
                  onChange={(e) => setBlogForm((s) => ({ ...s, excerpt: e.target.value }))}
                  required
                />
              </label>
            </div>

            <div className="rounded-xl border border-gold/15 bg-[#0d131b] p-3">
              <p className={labelClass}>Rich Text Editor</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <button type="button" className="gm-chip" onClick={() => blogCommand('bold')}>
                  Bold
                </button>
                <button type="button" className="gm-chip" onClick={() => blogCommand('italic')}>
                  Italic
                </button>
                <button type="button" className="gm-chip" onClick={() => blogCommand('insertUnorderedList')}>
                  List
                </button>
                <button type="button" className="gm-chip" onClick={() => blogCommand('formatBlock')}>
                  Heading
                </button>
              </div>
              <div
                ref={editorRef}
                contentEditable
                onInput={() => setBlogForm((s) => ({ ...s, content: editorRef.current?.innerHTML || '' }))}
                className="mt-2 min-h-[180px] rounded-lg border border-gold/20 bg-[#0b1016] p-3 text-sm text-zinc-100 outline-none"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className={labelClass}>Meta Title</span>
                <input
                  className={inputClass}
                  value={blogForm.metaTitle}
                  onChange={(e) => setBlogForm((s) => ({ ...s, metaTitle: e.target.value }))}
                />
              </label>
              <label className="space-y-1">
                <span className={labelClass}>Meta Keywords</span>
                <input
                  className={inputClass}
                  value={blogForm.metaKeywords}
                  onChange={(e) => setBlogForm((s) => ({ ...s, metaKeywords: e.target.value }))}
                />
              </label>
              <label className="space-y-1 md:col-span-2">
                <span className={labelClass}>Meta Description</span>
                <textarea
                  rows={2}
                  className={inputClass}
                  value={blogForm.metaDescription}
                  onChange={(e) => setBlogForm((s) => ({ ...s, metaDescription: e.target.value }))}
                />
              </label>
              <label className="space-y-1">
                <span className={labelClass}>Thumbnail Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  className={`${inputClass} file:mr-2 file:rounded-md file:border-0 file:bg-gold file:px-2 file:py-1 file:text-black`}
                  onChange={(e) => setBlogForm((s) => ({ ...s, file: e.target.files?.[0] || null }))}
                />
              </label>
              <label className="inline-flex items-center gap-2 self-end rounded-lg border border-gold/20 bg-[#0d1218] px-3 py-2 text-sm text-zinc-200">
                <input
                  type="checkbox"
                  checked={blogForm.published}
                  onChange={(e) => setBlogForm((s) => ({ ...s, published: e.target.checked }))}
                />
                Publish now
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brass to-gold px-4 py-2.5 text-sm font-semibold text-black shadow-gold disabled:opacity-50"
            >
              <Save size={15} />
              {saving ? 'Saving...' : modalMode === 'create' ? 'Add Blog' : 'Save Blog'}
            </button>
          </form>
        </ModalShell>
      ) : null}

      {selectedQuote ? (
        <ModalShell
          title="Quote Details"
          subtitle="Quote Management"
          onClose={() => {
            setSelectedQuote(null);
            setQuoteAdminNote('');
          }}
        >
          <div className="space-y-3">
            <div className="grid gap-2 text-sm text-zinc-300 md:grid-cols-2">
              <p>
                <span className="text-zinc-500">Customer:</span> {selectedQuote.fullName}
              </p>
              <p>
                <span className="text-zinc-500">Email:</span> {selectedQuote.email}
              </p>
              <p>
                <span className="text-zinc-500">Phone:</span> {selectedQuote.phone}
              </p>
              <p>
                <span className="text-zinc-500">Status:</span> {selectedQuote.status}
              </p>
              <p>
                <span className="text-zinc-500">Metal:</span> {selectedQuote.metal}
              </p>
              <p>
                <span className="text-zinc-500">Quantity:</span> {selectedQuote.quantity}
              </p>
            </div>
            <div className="rounded-xl border border-gold/15 bg-[#0b1119] p-3 text-sm text-zinc-300">
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Requirement</p>
              <p className="mt-1">{selectedQuote.requirement || '-'}</p>
            </div>
            <label className="space-y-1">
              <span className={labelClass}>Admin Notes</span>
              <textarea rows={4} className={inputClass} value={quoteAdminNote} onChange={(e) => setQuoteAdminNote(e.target.value)} />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={saveQuoteNote}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-brass to-gold px-4 py-2 text-sm font-semibold text-black"
              >
                <Save size={15} />
                Save Notes
              </button>
              <a
                href={`mailto:${selectedQuote.email}?subject=Quote follow-up from Graven Metals`}
                className="inline-flex items-center gap-2 rounded-lg border border-gold/20 bg-[#0d1218] px-4 py-2 text-sm text-zinc-200"
              >
                <Mail size={15} />
                Contact Customer
              </a>
            </div>
          </div>
        </ModalShell>
      ) : null}

      {selectedContact ? (
        <ModalShell
          title="Contact Details"
          subtitle="Contact Management"
          onClose={() => {
            setSelectedContact(null);
            setContactAdminNote('');
          }}
        >
          <div className="space-y-3">
            <div className="grid gap-2 text-sm text-zinc-300 md:grid-cols-2">
              <p>
                <span className="text-zinc-500">Name:</span> {selectedContact.fullName}
              </p>
              <p>
                <span className="text-zinc-500">Email:</span> {selectedContact.email}
              </p>
              <p>
                <span className="text-zinc-500">Phone:</span> {selectedContact.phone}
              </p>
              <p>
                <span className="text-zinc-500">Status:</span> {selectedContact.status}
              </p>
            </div>
            <div className="rounded-xl border border-gold/15 bg-[#0b1119] p-3 text-sm text-zinc-300">
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Message</p>
              <p className="mt-1">{selectedContact.message || '-'}</p>
            </div>
            <label className="space-y-1">
              <span className={labelClass}>Reply/Admin Notes</span>
              <textarea rows={4} className={inputClass} value={contactAdminNote} onChange={(e) => setContactAdminNote(e.target.value)} />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => saveContactUpdate('replied')}
                className="rounded-lg bg-gradient-to-r from-brass to-gold px-3 py-2 text-sm font-semibold text-black"
              >
                Mark Replied
              </button>
              <button
                type="button"
                onClick={() => saveContactUpdate('archived')}
                className="rounded-lg border border-gold/20 bg-[#0d1218] px-3 py-2 text-sm text-zinc-200"
              >
                Mark Resolved
              </button>
              <a
                href={`mailto:${selectedContact.email}?subject=Response from Graven Metals`}
                className="inline-flex items-center gap-2 rounded-lg border border-gold/20 bg-[#0d1218] px-3 py-2 text-sm text-zinc-200"
              >
                <Mail size={15} />
                Reply
              </a>
            </div>
          </div>
        </ModalShell>
      ) : null}
    </div>
  );
}
