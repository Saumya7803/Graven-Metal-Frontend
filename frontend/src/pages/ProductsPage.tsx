import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { ProductCard } from '../components/ProductCard';
import { MotionReveal } from '../components/MotionReveal';
import { SkeletonCard } from '../components/ui/Skeleton';
import { SEO } from '../components/seo/SEO';
import { getApiErrorMessage } from '../lib/apiUtils';
import { publicApi } from '../lib/publicApi';
import type { ApiProduct } from '../lib/publicApi';

export function ProductsPage() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'out-of-stock'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-high' | 'price-low' | 'name' | 'stock'>('featured');
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 8;

  const getCategoryName = (product: ApiProduct) =>
    typeof product.category === 'string' ? product.category : product.category?.name || '';

  const getWeightMultiplier = (weightUnit?: string) => {
    const weightUnitToKg: Record<string, number> = {
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
    return weightUnit ? weightUnitToKg[weightUnit.toLowerCase()] || 1 : 1;
  };

  const getUnitPrice = (product: ApiProduct) =>
    (
      product.unitPrice ??
      product.price * (product.weightPerUnit ?? 1) * getWeightMultiplier(product.weightUnit || product.unit)
    ) || 0;

  const formatAmount = (value: number) =>
    new Intl.NumberFormat('en-US', {
      maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value);

  useEffect(() => {
    publicApi
      .getProducts()
      .then(setProducts)
      .catch((error) => {
        setProducts([]);
        toast.error(getApiErrorMessage(error));
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => ['All', ...new Set(products.map((p) => getCategoryName(p)).filter(Boolean))],
    [products]
  );
  const priceStats = useMemo(() => {
    const prices = products.map((product) => getUnitPrice(product)).filter((price) => Number.isFinite(price));
    const min = prices.length ? Math.floor(Math.min(...prices)) : 0;
    const max = prices.length ? Math.ceil(Math.max(...prices)) : 0;
    return { min, max };
  }, [products]);

  useEffect(() => {
    if (maxPrice == null && priceStats.max) setMaxPrice(priceStats.max);
    if (maxPrice != null && maxPrice > priceStats.max) setMaxPrice(priceStats.max);
  }, [maxPrice, priceStats.max]);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    const selectedMaxPrice = maxPrice ?? priceStats.max;

    return products
      .filter((product) => {
        const name = product.name.toLowerCase();
        const matchesQuery = !search || name.includes(search) || getCategoryName(product).toLowerCase().includes(search);
        const matchesCategory = category === 'All' || getCategoryName(product) === category;
        const matchesStock =
          stockFilter === 'all' ||
          (stockFilter === 'in-stock' && product.inStock !== false) ||
          (stockFilter === 'out-of-stock' && product.inStock === false);
        const matchesPrice = selectedMaxPrice == null || getUnitPrice(product) <= selectedMaxPrice;
        return matchesQuery && matchesCategory && matchesStock && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'price-high') return getUnitPrice(b) - getUnitPrice(a);
        if (sortBy === 'price-low') return getUnitPrice(a) - getUnitPrice(b);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'stock') return Number(b.inStock !== false) - Number(a.inStock !== false);
        return Number((b.createdAt || '').localeCompare(a.createdAt || ''));
      });
  }, [category, maxPrice, priceStats.max, products, query, sortBy, stockFilter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    setPage(1);
  }, [query, category, stockFilter, sortBy, maxPrice]);

  const clearFilters = () => {
    setQuery('');
    setCategory('All');
    setStockFilter('all');
    setSortBy('featured');
    setMaxPrice(priceStats.max || null);
  };

  return (
    <MotionReveal>
      <SEO title="Products" description="Explore premium industrial metal products." path="/products" />
      <section className="gm-shell p-4 sm:p-5 md:p-7">
        <p className="text-sm text-zinc-500">Home / Products</p>
        <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-3xl text-white sm:text-4xl">Our Products</h1>
            <p className="mt-2 max-w-3xl text-zinc-400">
              Explore our wide range of premium metals for industrial and commercial use. Narrow the catalog with
              filters, stock status, and price range controls.
            </p>
            {loading ? <p className="mt-2 text-xs text-gold animate-pulse">Loading live product catalog...</p> : null}
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[420px]">
            <input
              aria-label="Search products"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search product, category..."
              className="gm-input w-full"
            />
            <select
              aria-label="Sort products"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="gm-input w-full"
            >
              <option value="featured">Sort by featured</option>
              <option value="price-high">Price high</option>
              <option value="price-low">Price low</option>
              <option value="name">Name A-Z</option>
              <option value="stock">Stock available</option>
            </select>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-gold/15 bg-[#070c12] p-4 shadow-halo">
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Filters</p>
                <h2 className="mt-1 text-lg font-semibold text-white">Refine products</h2>
              </div>
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-gold hover:text-amberlux"
              >
                Clear All
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">Product Type</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="gm-input mt-2 w-full"
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item === 'All' ? 'All Types' : item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">Stock Availability</span>
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value as typeof stockFilter)}
                  className="gm-input mt-2 w-full"
                >
                  <option value="all">All Stock</option>
                  <option value="in-stock">In Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </label>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">Price Range / Unit</span>
                  <span className="text-xs text-zinc-400">
                    {maxPrice != null ? formatAmount(maxPrice) : 'All'}
                  </span>
                </div>
                <input
                  type="range"
                  min={priceStats.min}
                  max={priceStats.max}
                  value={maxPrice ?? priceStats.max}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="mt-3 w-full accent-[#d6b676]"
                />
                <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
                  <span>{formatAmount(priceStats.min)}</span>
                  <span>{formatAmount(priceStats.max)}</span>
                </div>
              </div>

              <div className="rounded-xl border border-white/5 bg-black/20 p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Results</p>
                <p className="mt-2 text-2xl font-semibold text-gold">{filtered.length}</p>
                <p className="mt-1 text-sm text-zinc-400">Products matched by your current filters.</p>
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-zinc-400">
                Showing <span className="text-white">{paged.length}</span> of <span className="text-white">{filtered.length}</span> products
              </p>
              <div className="flex flex-wrap gap-2">
                {[ 
                  category !== 'All' ? category : null,
                  stockFilter !== 'all' ? stockFilter.replace('-', ' ') : null,
                  maxPrice != null && priceStats.max ? `Up to ${formatAmount(maxPrice)}` : null,
                ]
                  .filter(Boolean)
                  .map((item) => (
                    <span key={item as string} className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-xs text-gold">
                      {item}
                    </span>
                  ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
                : paged.map((p) => (
                    <ProductCard
                      key={p._id}
                      id={p._id}
                      name={p.name}
                      category={getCategoryName(p) || 'Metal'}
                      tint="from-amber-400/20 to-zinc-800/20"
                      imageUrl={p.image?.url}
                    />
                  ))}
            </div>

            {!loading && filtered.length === 0 ? (
              <p className="mt-6 rounded-md border border-gold/15 bg-black/25 p-5 text-center text-sm text-zinc-400">
                No products match the current filters.
              </p>
            ) : null}

            {!loading ? (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const n = i + 1;
                  return (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`h-9 w-9 rounded-md text-sm ${
                        page === n ? 'bg-gold-cta font-semibold text-black shadow-gold' : 'bg-[#0d1218] text-zinc-300'
                      }`}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </MotionReveal>
  );
}
