import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { ProductCard } from '../components/ProductCard';
import { MotionReveal } from '../components/MotionReveal';
import { SkeletonCard } from '../components/ui/Skeleton';
import { SEO } from '../components/seo/SEO';
import { getApiErrorMessage } from '../lib/apiUtils';
import { publicApi } from '../lib/publicApi';
import type { ApiProduct } from '../lib/publicApi';

function formatProductPrice(product: ApiProduct) {
  const currency = (product.currency || 'USD').toUpperCase();
  const formatted = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: product.price % 1 === 0 ? 0 : 2,
  }).format(product.price);
  return `${formatted} / ${product.unit || 'kg'}`;
}

export function ProductsPage() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const perPage = 8;
  const getCategoryName = (product: ApiProduct) =>
    typeof product.category === 'string' ? product.category : product.category?.name || '';

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
  const filtered = products.filter(
    (p) => (category === 'All' || getCategoryName(p) === category) && p.name.toLowerCase().includes(query.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    setPage(1);
  }, [query, category]);

  return (
    <MotionReveal>
      <SEO title="Products" description="Explore premium industrial metal products." path="/products" />
      <section className="gm-shell p-4 sm:p-5 md:p-7">
        <p className="text-sm text-zinc-500">Home / Products</p>
        <h1 className="font-display text-3xl text-white sm:text-4xl">Our Products</h1>
        <p className="mt-2 text-zinc-400">Explore our wide range of premium metals for industrial and commercial use.</p>
        {loading ? <p className="mt-2 text-xs text-gold animate-pulse">Loading live product catalog...</p> : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <input
            aria-label="Search products"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="gm-input w-full sm:w-72"
          />
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`gm-chip ${category === c ? 'border-transparent bg-gold-cta text-black shadow-gold' : ''}`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : paged.map((p) => (
                <ProductCard
                  key={p._id}
                  id={p._id}
                  name={p.name}
                  price={formatProductPrice(p)}
                  category={getCategoryName(p) || 'Metal'}
                  tint="from-amber-400/20 to-zinc-800/20"
                  imageUrl={p.image?.url}
                />
              ))}
        </div>
        {!loading && filtered.length === 0 ? (
          <p className="mt-6 rounded-md border border-gold/15 bg-black/25 p-5 text-center text-sm text-zinc-400">
            No products are available from the API catalog yet.
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
      </section>
    </MotionReveal>
  );
}
