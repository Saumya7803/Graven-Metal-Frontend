import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Edit3,
  ImagePlus,
  Package,
  Search,
  Sparkles,
  ShieldAlert,
  Trash2,
  Upload,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import { SEO } from '../components/seo/SEO';
import { adminApi } from '../lib/adminApi';
import { getAuthUser } from '../lib/auth';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import type { ApiCategory } from '../lib/publicApi';
import type { ApiProduct } from '../lib/publicApi';

type ViewMode = 'list' | 'add';
type ModerationFilter = 'all' | 'approved' | 'pending' | 'rejected' | 'removal';

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

const defaultForm: ProductForm = {
  name: '',
  slug: '',
  description: '',
  category: '',
  price: 0,
  currency: 'USD',
  unit: 'kg',
  unitType: 'unit',
  weightPerUnit: 1,
  weightUnit: 'kg',
  moq: 1,
  stockQty: 0,
  file: null,
};

function formatCurrency(currency: string | undefined, value: number) {
  const normalized = (currency || 'USD').toUpperCase();
  const locale = normalized === 'INR' ? 'en-IN' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: normalized,
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

function getCategoryName(product: ApiProduct) {
  return typeof product.category === 'string' ? product.category : product.category?.name || '';
}

function getModerationLabel(product: ApiProduct) {
  if (product.removalRequested) {
    return { label: 'Removal Requested', tone: 'gold' as const, icon: Clock3 };
  }
  if (product.approvalStatus === 'pending') {
    return { label: 'Pending Approval', tone: 'gold' as const, icon: Clock3 };
  }
  if (product.approvalStatus === 'rejected') {
    return { label: 'Rejected', tone: 'red' as const, icon: ShieldAlert };
  }
  return { label: 'Approved', tone: 'green' as const, icon: CheckCircle2 };
}

function getUnitLabel(product: ApiProduct) {
  return product.unitType || product.unit || 'unit';
}

export function ProductManagementPage() {
  const navigate = useNavigate();
  const user = getAuthUser();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const canRequestRemoval = ['data_entry', 'editor', 'admin', 'super_admin'].includes(user?.role || '');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<ModerationFilter>('all');
  const [productForm, setProductForm] = useState<ProductForm>(defaultForm);

  const load = async () => {
    setLoading(true);
    try {
      const [items, cats] = await Promise.all([adminApi.getProducts(), adminApi.getCategories()]);
      setProducts(Array.isArray(items) ? items : []);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (error) {
      toast.error((error as Error).message);
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const categoryOptions = useMemo(
    () => [{ _id: 'all', name: 'All Categories' }, ...categories],
    [categories]
  );

  const filteredProducts = useMemo(() => {
    const search = query.trim().toLowerCase();
    return products.filter((product) => {
      const categoryName = getCategoryName(product);
      const matchesSearch = !search || `${product.name} ${product.slug} ${categoryName}`.toLowerCase().includes(search);
      const matchesCategory = categoryFilter === 'all' || categoryName === categoryFilter;
      const moderation = getModerationLabel(product).label;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'approved' && moderation === 'Approved') ||
        (statusFilter === 'pending' && moderation === 'Pending Approval') ||
        (statusFilter === 'rejected' && moderation === 'Rejected') ||
        (statusFilter === 'removal' && moderation === 'Removal Requested');
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [categoryFilter, products, query, statusFilter]);

  const resetForm = () => {
    setProductForm(defaultForm);
  };

  const openCreate = () => {
    resetForm();
    setViewMode('add');
  };

  const openEdit = (product: ApiProduct) => {
    setProductForm({
      _id: product._id,
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      category: typeof product.category === 'string' ? product.category : product.category?._id || '',
      price: product.price,
      currency: product.currency || 'USD',
      unit: product.unit || 'kg',
      unitType: product.unitType || product.unit || 'unit',
      weightPerUnit: product.weightPerUnit || 1,
      weightUnit: product.weightUnit || product.unit || 'kg',
      moq: product.moq || 1,
      stockQty: product.stockQty || 0,
      file: null,
    });
    setViewMode('add');
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setProductForm((prev) => ({ ...prev, file }));
  };

  const submitProduct = async (event: FormEvent) => {
    event.preventDefault();
    if (!productForm.name.trim() || !productForm.slug.trim() || !productForm.category) {
      toast.error('Please fill product name, slug, and category');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: productForm.name.trim(),
        slug: productForm.slug.trim(),
        description: productForm.description.trim(),
        category: productForm.category,
        price: Number(productForm.price) || 0,
        currency: productForm.currency || 'USD',
        unit: productForm.unit || 'kg',
        unitType: productForm.unitType || 'unit',
        weightPerUnit: Number(productForm.weightPerUnit) || 1,
        weightUnit: productForm.weightUnit || productForm.unit || 'kg',
        moq: Number(productForm.moq) || 1,
        stockQty: Number(productForm.stockQty) || 0,
        file: productForm.file,
      };

      if (productForm._id) {
        await adminApi.updateProduct(productForm._id, payload);
        toast.success('Product updated');
      } else {
        await adminApi.createProduct(payload);
        toast.success('Product created');
      }

      resetForm();
      setViewMode('list');
      await load();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (product: ApiProduct) => {
    if (!window.confirm(`Delete product "${product.name}"? This cannot be undone.`)) return;
    setSaving(true);
    try {
      await adminApi.deleteProduct(product._id);
      toast.success('Product deleted');
      await load();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const approvedCount = products.filter((item) => getModerationLabel(item).label === 'Approved').length;
  const pendingCount = products.filter((item) => getModerationLabel(item).label === 'Pending Approval').length;
  const removalCount = products.filter((item) => getModerationLabel(item).label === 'Removal Requested').length;

  const approveProduct = async (product: ApiProduct) => {
    setSaving(true);
    try {
      await adminApi.approveProduct(product._id);
      toast.success(`Approved "${product.name}"`);
      await load();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const rejectProduct = async (product: ApiProduct) => {
    if (!window.confirm(`Reject product "${product.name}"?`)) return;
    setSaving(true);
    try {
      await adminApi.rejectProduct(product._id);
      toast.success(`Rejected "${product.name}"`);
      await load();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const requestRemoval = async (product: ApiProduct) => {
    setSaving(true);
    try {
      await adminApi.requestProductRemoval(product._id);
      toast.success('Removal request sent to admin');
      await load();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#03070b] px-4 py-4 text-zinc-200 md:px-6 md:py-6">
      <SEO
        title="Product Management"
        description="Manage products, prices, stock, and new inventory entries from the admin panel."
        path="/admin/products"
        noIndex
      />
      {loading ? <LoadingOverlay /> : null}

      <div className="mx-auto max-w-[1560px]">
        <div className="relative overflow-hidden rounded-[2rem] border border-gold/15 bg-[#0a0f14]/95 shadow-glow">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(214,182,118,0.12),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]" />
          <div className="relative grid min-h-[calc(100vh-2rem)] md:grid-cols-[240px_1fr]">
            <aside className="border-b border-gold/10 bg-[#080d13] p-4 md:border-b-0 md:border-r md:border-gold/10">
              <div className="flex items-start justify-between gap-3">
                <BrandLogo className="h-10" />
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="rounded-xl border border-gold/20 bg-[#0d1218] p-2 text-gold"
                  aria-label="Back to admin dashboard"
                >
                  <ArrowLeft size={16} />
                </button>
              </div>

              <div className="mt-6 space-y-2">
                {[
                  { key: 'list' as const, label: 'All Products', icon: Package },
                  { key: 'add' as const, label: 'Add Product', icon: ImagePlus },
                ].map((item) => {
                  const Icon = item.icon;
                  const selected = viewMode === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setViewMode(item.key)}
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

              <div className="mt-6 rounded-2xl border border-gold/15 bg-[#0d1218] p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Signed in as</p>
                <p className="mt-2 truncate text-sm font-semibold text-white">{user?.name || 'Admin User'}</p>
                <p className="truncate text-xs text-zinc-400">{user?.email || 'admin@graven.local'}</p>
              </div>
            </aside>

            <main className="min-w-0 p-4 md:p-6">
              <section className="rounded-[1.75rem] border border-gold/15 bg-[#0a0f14]/95 p-5 shadow-halo">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-gold">Admin Panel</p>
                    <h1 className="mt-2 font-display text-3xl text-white sm:text-4xl">Product Management</h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
                      Manage the product catalog shown on the website and add new inventory records from one place.
                      {user?.role === 'data_entry' ? ' Products you submit will wait for admin approval.' : ''}
                    </p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 xl:min-w-[520px]">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search products..."
                        className="w-full rounded-xl border border-gold/20 bg-[#0d1218] px-3 py-2.5 pl-10 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-gold/60"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={openCreate}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold-cta px-4 py-2.5 text-sm font-extrabold text-black shadow-gold hover:brightness-110"
                    >
                      <Sparkles size={16} />
                      Add Product
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    { label: 'Total Products', value: products.length, helper: 'Catalog entries' },
                    { label: 'Approved', value: approvedCount, helper: 'Visible on website' },
                    { label: 'Pending / Removal', value: pendingCount + removalCount, helper: 'Needs admin review' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-gold/15 bg-[#0d1218] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{item.label}</p>
                      <p className="mt-2 text-3xl font-extrabold text-white">{item.value}</p>
                      <p className="mt-1 text-xs text-zinc-500">{item.helper}</p>
                    </div>
                  ))}
                </div>
              </section>

              <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.95fr]">
                <section className="rounded-[1.75rem] border border-gold/15 bg-[#070c12] p-4 shadow-halo sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-gold">All Products</p>
                      <h2 className="mt-1 font-display text-2xl text-white">Manage your website products</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="rounded-xl border border-gold/20 bg-[#0d1218] px-3 py-2 text-sm text-zinc-100 outline-none"
                      >
                        {categoryOptions.map((category) => (
                          <option key={category._id} value={category._id === 'all' ? 'all' : category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                        className="rounded-xl border border-gold/20 bg-[#0d1218] px-3 py-2 text-sm text-zinc-100 outline-none"
                      >
                        <option value="all">All Moderation</option>
                        <option value="approved">Approved</option>
                        <option value="pending">Pending Approval</option>
                        <option value="rejected">Rejected</option>
                        <option value="removal">Removal Requested</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-5 overflow-hidden rounded-2xl border border-gold/10">
                    <table className="w-full min-w-[920px] text-sm">
                      <thead className="border-b border-gold/10 bg-[#0d1218]">
                        <tr className="text-left text-xs uppercase tracking-[0.16em] text-zinc-500">
                          <th className="px-4 py-3">Image</th>
                          <th className="px-4 py-3">Product Name</th>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3">Price</th>
                          <th className="px-4 py-3">Stock</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product) => {
                          const moderation = getModerationLabel(product);
                          const StatusIcon = moderation.icon;
                          return (
                            <tr key={product._id} className="border-t border-gold/10 align-top">
                              <td className="px-4 py-3">
                                <div className="h-14 w-14 overflow-hidden rounded-xl border border-gold/15 bg-[#0d1218]">
                                  <img
                                    src={product.image?.url || '/imgs/brand-mark.png'}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <p className="font-semibold text-white">{product.name}</p>
                                <p className="mt-1 max-w-[220px] truncate text-xs text-zinc-500">{product.slug}</p>
                              </td>
                              <td className="px-4 py-3 text-zinc-300">{getCategoryName(product) || 'Uncategorized'}</td>
                              <td className="px-4 py-3 text-gold">
                                {formatCurrency(product.currency, product.unitPrice || product.price)} / {getUnitLabel(product)}
                              </td>
                              <td className="px-4 py-3 text-zinc-300">{product.stockQty ?? 0}</td>
                              <td className="px-4 py-3">
                                <span
                                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                                    moderation.tone === 'green'
                                      ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                                      : moderation.tone === 'gold'
                                        ? 'border-gold/30 bg-gold/10 text-gold'
                                        : 'border-red-400/30 bg-red-400/10 text-red-200'
                                  }`}
                                >
                                  <span className="inline-flex items-center gap-1.5">
                                    <StatusIcon size={12} />
                                    {moderation.label}
                                  </span>
                                </span>
                                {product.removalRequested ? (
                                  <p className="mt-2 text-xs text-gold/80">Removal requested by {product.removalRequestedBy || 'data entry'}</p>
                                ) : null}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openEdit(product)}
                                    className="inline-flex items-center gap-2 rounded-xl border border-gold/20 bg-gold/10 px-3 py-2 text-xs font-semibold text-gold hover:border-gold/50"
                                  >
                                    <Edit3 size={14} />
                                    Edit
                                  </button>
                                  {isAdmin && moderation.label === 'Pending Approval' ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => approveProduct(product)}
                                        className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-200 hover:border-emerald-300/60"
                                      >
                                        <CheckCircle2 size={14} />
                                        Approve
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => rejectProduct(product)}
                                        className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 hover:border-red-400/60"
                                      >
                                        <ShieldAlert size={14} />
                                        Reject
                                      </button>
                                    </>
                                  ) : null}
                                  {isAdmin && product.removalRequested ? (
                                    <button
                                      type="button"
                                      onClick={() => deleteProduct(product)}
                                      className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 hover:border-red-400/60"
                                    >
                                      <Trash2 size={14} />
                                      Approve Removal
                                    </button>
                                  ) : null}
                                  {!isAdmin && canRequestRemoval && !product.removalRequested ? (
                                    <button
                                      type="button"
                                      onClick={() => requestRemoval(product)}
                                      className="inline-flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/10 px-3 py-2 text-xs font-semibold text-gold hover:border-gold/60"
                                    >
                                      <Clock3 size={14} />
                                      Request Removal
                                    </button>
                                  ) : null}
                                  {isAdmin && !product.removalRequested && product.approvalStatus !== 'pending' ? (
                                    <button
                                      type="button"
                                      onClick={() => deleteProduct(product)}
                                      className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 hover:border-red-400/60"
                                    >
                                      <Trash2 size={14} />
                                      Delete
                                    </button>
                                  ) : null}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {!loading && filteredProducts.length === 0 ? (
                      <div className="p-8 text-center">
                        <p className="font-display text-xl text-white">No products found</p>
                        <p className="mt-2 text-sm text-zinc-500">Try a different search or add a new product.</p>
                      </div>
                    ) : null}
                  </div>
                </section>

                <section className="rounded-[1.75rem] border border-gold/15 bg-[#070c12] p-4 shadow-halo sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-gold">{productForm._id ? 'Edit Product' : 'Add Product'}</p>
                      <h2 className="mt-1 font-display text-2xl text-white">
                        {productForm._id ? 'Update catalog entry' : 'Add new product'}
                      </h2>
                      {!isAdmin ? (
                        <p className="mt-1 text-xs text-zinc-500">New or edited products will be queued for admin approval.</p>
                      ) : null}
                    </div>
                    <Package className="text-gold" size={20} />
                  </div>

                  <form className="mt-5 space-y-4" onSubmit={submitProduct}>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label>
                        <span className="text-xs uppercase tracking-[0.16em] text-zinc-500">Product Name</span>
                        <input
                          value={productForm.name}
                          onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
                          className="mt-2 w-full rounded-xl border border-gold/20 bg-[#0d1218] px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-gold/60"
                          placeholder="Enter product name"
                        />
                      </label>
                      <label>
                        <span className="text-xs uppercase tracking-[0.16em] text-zinc-500">Slug</span>
                        <input
                          value={productForm.slug}
                          onChange={(e) => setProductForm((prev) => ({ ...prev, slug: e.target.value }))}
                          className="mt-2 w-full rounded-xl border border-gold/20 bg-[#0d1218] px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-gold/60"
                          placeholder="product-slug"
                        />
                      </label>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label>
                        <span className="text-xs uppercase tracking-[0.16em] text-zinc-500">Category</span>
                        <select
                          value={productForm.category}
                          onChange={(e) => setProductForm((prev) => ({ ...prev, category: e.target.value }))}
                          className="mt-2 w-full rounded-xl border border-gold/20 bg-[#0d1218] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-gold/60"
                        >
                          <option value="">Select category</option>
                          {categories.map((category) => (
                            <option key={category._id} value={category._id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span className="text-xs uppercase tracking-[0.16em] text-zinc-500">Product Type</span>
                        <input
                          value={productForm.unitType}
                          onChange={(e) => setProductForm((prev) => ({ ...prev, unitType: e.target.value }))}
                          className="mt-2 w-full rounded-xl border border-gold/20 bg-[#0d1218] px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-gold/60"
                          placeholder="Rod, Sheet, Pipe..."
                        />
                      </label>
                    </div>

                    <label>
                      <span className="text-xs uppercase tracking-[0.16em] text-zinc-500">Description</span>
                      <textarea
                        value={productForm.description}
                        onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
                        className="mt-2 min-h-[100px] w-full rounded-xl border border-gold/20 bg-[#0d1218] px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-gold/60"
                        placeholder="Enter product description"
                      />
                    </label>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label>
                        <span className="text-xs uppercase tracking-[0.16em] text-zinc-500">Price</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={productForm.price}
                          onChange={(e) => setProductForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                          className="mt-2 w-full rounded-xl border border-gold/20 bg-[#0d1218] px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-gold/60"
                        />
                      </label>
                      <label>
                        <span className="text-xs uppercase tracking-[0.16em] text-zinc-500">Currency</span>
                        <select
                          value={productForm.currency}
                          onChange={(e) => setProductForm((prev) => ({ ...prev, currency: e.target.value }))}
                          className="mt-2 w-full rounded-xl border border-gold/20 bg-[#0d1218] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-gold/60"
                        >
                          <option value="USD">USD</option>
                          <option value="INR">INR</option>
                        </select>
                      </label>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <label>
                        <span className="text-xs uppercase tracking-[0.16em] text-zinc-500">Unit</span>
                        <input
                          value={productForm.unit}
                          onChange={(e) => setProductForm((prev) => ({ ...prev, unit: e.target.value }))}
                          className="mt-2 w-full rounded-xl border border-gold/20 bg-[#0d1218] px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-gold/60"
                          placeholder="kg, ton, m..."
                        />
                      </label>
                      <label>
                        <span className="text-xs uppercase tracking-[0.16em] text-zinc-500">Weight / Unit</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={productForm.weightPerUnit}
                          onChange={(e) => setProductForm((prev) => ({ ...prev, weightPerUnit: Number(e.target.value) }))}
                          className="mt-2 w-full rounded-xl border border-gold/20 bg-[#0d1218] px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-gold/60"
                        />
                      </label>
                      <label>
                        <span className="text-xs uppercase tracking-[0.16em] text-zinc-500">Weight Unit</span>
                        <input
                          value={productForm.weightUnit}
                          onChange={(e) => setProductForm((prev) => ({ ...prev, weightUnit: e.target.value }))}
                          className="mt-2 w-full rounded-xl border border-gold/20 bg-[#0d1218] px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-gold/60"
                          placeholder="kg"
                        />
                      </label>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label>
                        <span className="text-xs uppercase tracking-[0.16em] text-zinc-500">MOQ</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={productForm.moq}
                          onChange={(e) => setProductForm((prev) => ({ ...prev, moq: Number(e.target.value) }))}
                          className="mt-2 w-full rounded-xl border border-gold/20 bg-[#0d1218] px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-gold/60"
                        />
                      </label>
                      <label>
                        <span className="text-xs uppercase tracking-[0.16em] text-zinc-500">Stock Quantity</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={productForm.stockQty}
                          onChange={(e) => setProductForm((prev) => ({ ...prev, stockQty: Number(e.target.value) }))}
                          className="mt-2 w-full rounded-xl border border-gold/20 bg-[#0d1218] px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-gold/60"
                        />
                      </label>
                    </div>

                    <div className="block">
                      <span className="text-xs uppercase tracking-[0.16em] text-zinc-500">Product Image</span>
                      <label className="mt-2 flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-gold/25 bg-[#0d1218] px-4 py-8 text-center">
                        <Upload className="text-gold" size={18} />
                        <span className="text-sm text-zinc-300">{productForm.file ? productForm.file.name : 'Upload image or replace the current one'}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
                      </label>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-xl bg-gold-cta px-5 py-3 text-sm font-extrabold text-black shadow-gold hover:brightness-110 disabled:opacity-60"
                      >
                        <CheckCircle2 size={16} />
                        {saving ? 'Saving...' : productForm._id ? 'Update Product' : 'Save Product'}
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="rounded-xl border border-gold/20 bg-[#0d1218] px-5 py-3 text-sm font-semibold text-zinc-300 hover:border-gold/45 hover:text-gold"
                      >
                        Reset Form
                      </button>
                    </div>
                  </form>
                </section>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
