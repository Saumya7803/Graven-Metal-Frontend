import { useEffect, useMemo, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ProductCard } from '../components/ProductCard';
import { SkeletonCard } from '../components/ui/Skeleton';
import { SEO } from '../components/seo/SEO';
import { getApiErrorMessage } from '../lib/apiUtils';
import { publicApi } from '../lib/publicApi';
import type { ApiProduct } from '../lib/publicApi';
import { getProductFallbackImage, resolveProductImageUrl } from '../lib/image';

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

function getWeightMultiplier(weightUnit?: string) {
  return weightUnit ? weightUnitToKg[weightUnit.toLowerCase()] || 1 : 1;
}

function getUnitPrice(product: ApiProduct) {
  return (
    product.unitPrice ??
    product.price * (product.weightPerUnit ?? 1) * getWeightMultiplier(product.weightUnit || product.unit)
  ) || 0;
}

function formatMoney(currency: string | undefined, value: number) {
  const normalized = (currency || 'USD').toUpperCase();
  const locale = normalized === 'INR' ? 'en-IN' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: normalized,
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

const specs = [
  ['Purity', '24K | 99.99%'],
  ['Weight', '10g, 20g, 50g, 100g, 1kg'],
  ['Form', 'Bar'],
  ['Certificate', 'Yes'],
];
const features = ['100% Purity Guaranteed', 'Certified & Hallmarked', 'Secure Global Delivery', 'Best Market Pricing'];

export function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [all, setAll] = useState<ApiProduct[]>([]);

  useEffect(() => {
    if (id) {
      publicApi
        .getProductById(id)
        .then(setProduct)
        .catch((error) => {
          setProduct(null);
          toast.error(getApiErrorMessage(error));
        });
    }

    publicApi
      .getProducts()
      .then(setAll)
      .catch((error) => {
        setAll([]);
        toast.error(getApiErrorMessage(error));
      });
  }, [id]);

  const related = useMemo(() => all.filter((x) => x._id !== id).slice(0, 5), [all, id]);
  const categoryName = typeof product?.category === 'string' ? product.category : product?.category?.name || '';
  const heroImage = resolveProductImageUrl(product?.image?.url, categoryName, 1280);
  const heroFallbackImage = getProductFallbackImage(categoryName);
  const unitLabel = product?.unitType || product?.unit || 'unit';
  const unitPrice = product ? getUnitPrice(product) : 0;
  const totalPrice = unitPrice * qty;

  const handleHeroImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    if (!heroFallbackImage || event.currentTarget.dataset.fallbackApplied === 'true') return;
    event.currentTarget.dataset.fallbackApplied = 'true';
    event.currentTarget.src = heroFallbackImage;
  };

  if (!product) {
    return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>;
  }

  return (
    <div className="space-y-6">
      <SEO
        title={product.name}
        description={product.description || `${product.name} details`}
        path={`/products/${product._id}`}
        type="article"
        keywords={['buy metal online', product.name.toLowerCase(), 'industrial metals']}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.description || `${product.name} details`,
          image: heroImage || '/imgs/brand-mark.png',
          sku: product.slug || product._id,
          offers: {
            '@type': 'Offer',
            priceCurrency: product.currency || 'USD',
            price: unitPrice,
            availability: 'https://schema.org/InStock',
          },
        }}
      />
      <p className="text-sm text-zinc-500">Home / Products / {product.name}</p>
      <section className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <div className="gm-shell p-3 sm:p-4 md:p-5">
          <div className="h-[240px] overflow-hidden rounded-xl border border-gold/20 bg-gradient-to-br from-amber-500/20 to-zinc-900/30 sm:h-[320px] md:h-[420px]">
            {heroImage ? (
              <img
                src={heroImage}
                alt={product.name}
                className="h-full w-full object-cover"
                decoding="async"
                fetchPriority="high"
                onError={handleHeroImageError}
              />
            ) : null}
          </div>
          <div className="mt-5 rounded-xl border border-gold/15 bg-black/35 p-4">
            <h3 className="text-lg font-semibold text-white">Product Specifications</h3>
            <div className="mt-3 space-y-2">
              {specs.map(([label, value]) => (
                <div key={label} className="grid grid-cols-[85px_1fr] gap-2 border-b border-gold/10 pb-2 text-xs sm:grid-cols-[110px_1fr] sm:text-sm">
                  <p className="text-zinc-400">{label}</p>
                  <p className="break-words text-zinc-200">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <aside className="gm-shell p-4 sm:p-5">
          <h1 className="font-display text-3xl text-white sm:text-4xl">{product.name}</h1>
          <p className="mt-1 text-sm text-zinc-400">{typeof product.category === 'string' ? product.category : product.category?.name || 'Premium Grade'}</p>

          <div className="mt-4 rounded-2xl border border-gold/15 bg-black/30 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Unit Price</p>
                <p className="mt-1 text-2xl font-semibold text-gold sm:text-3xl">
                  {formatMoney(product.currency, unitPrice)} / {unitLabel}
                </p>
              </div>
              <div className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
                {product.inStock === false ? 'Out of stock' : 'Available'}
              </div>
            </div>

            <div className="mt-5 grid gap-4 rounded-xl border border-white/5 bg-[#06090d] p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-zinc-300">Quantity</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQty((current) => Math.max(1, current - 1))}
                    className="grid h-9 w-9 place-items-center rounded-md border border-gold/20 bg-black/35 text-lg font-semibold text-white transition hover:border-gold/40 hover:bg-gold/10"
                  >
                    -
                  </button>
                  <span className="min-w-10 rounded-md border border-gold/15 bg-black/40 px-4 py-2 text-center text-base font-semibold text-white">
                    {qty}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQty((current) => current + 1)}
                    className="grid h-9 w-9 place-items-center rounded-md border border-gold/20 bg-black/35 text-lg font-semibold text-white transition hover:border-gold/40 hover:bg-gold/10"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-4">
                <span className="text-sm font-medium text-zinc-300">Total</span>
                <span className="text-2xl font-semibold text-white">{formatMoney(product.currency, totalPrice)}</span>
              </div>
            </div>
          </div>

          <p className={product.inStock === false ? 'mt-2 text-xs text-red-300' : 'mt-2 text-xs text-emerald-400'}>
            {product.inStock === false ? 'Out of Stock' : 'In Stock'}
          </p>
          <ul className="mt-4 space-y-2 text-sm text-zinc-300">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" />
                {feature}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-5 w-full rounded-md bg-gold-cta py-3 font-semibold text-black shadow-gold transition hover:brightness-110"
            onClick={() =>
              navigate('/quote-request', {
                state: {
                  productName: product.name,
                  quantity: qty,
                  unit: unitLabel,
                  unitPrice,
                  totalPrice,
                  currency: product.currency || 'USD',
                  requirement: `Need ${qty} ${unitLabel} of ${product.name} with certificates and delivery support.`,
                },
              })
            }
          >
            Add to Quote
          </button>
          <a
            href="https://wa.me/12125550148"
            target="_blank"
            rel="noreferrer"
            className="mt-3 block w-full rounded-md border border-emerald-500/40 bg-emerald-500/10 py-2.5 text-center text-sm font-medium text-emerald-300"
          >
            Chat on WhatsApp
          </a>
        </aside>
      </section>
      <section className="gm-shell p-5">
        <h2 className="font-display text-2xl text-white">Related Products</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {related.map((r) => (
            <ProductCard
              key={r._id}
              id={r._id}
              name={r.name}
              price={`${formatMoney(r.currency, getUnitPrice(r))} / ${r.unitType || r.unit || 'unit'}`}
              category={typeof r.category === 'string' ? r.category : r.category?.name || 'Metal'}
              tint="from-zinc-500/20 to-zinc-800/20"
              imageUrl={r.image?.url}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
