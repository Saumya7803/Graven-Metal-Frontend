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
import { CheckCircle2, FileText, MessageSquareMore, Package2, ShieldCheck, Star, Truck } from 'lucide-react';

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

const features = ['100% Purity Guaranteed', 'Certified & Hallmarked', 'Secure Global Delivery', 'Best Market Pricing'];

export function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'composition' | 'mechanical' | 'documents'>('description');
  const [activeImage, setActiveImage] = useState(0);
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

  useEffect(() => {
    setQty(1);
    setActiveTab('description');
    setActiveImage(0);
  }, [id]);

  const related = useMemo(() => all.filter((x) => x._id !== id).slice(0, 5), [all, id]);
  const categoryName = typeof product?.category === 'string' ? product.category : product?.category?.name || '';
  const heroImage = resolveProductImageUrl(product?.image?.url, categoryName, 1280);
  const unitLabel = product?.unitType || product?.unit || 'unit';
  const unitPrice = product ? getUnitPrice(product) : 0;
  const totalPrice = unitPrice * qty;
  const galleryImages = useMemo(() => {
    const urls = [product?.image?.url, ...related.map((item) => item.image?.url)].filter(Boolean) as string[];
    const resolved = urls
      .map((url, index) => resolveProductImageUrl(url, index === 0 ? categoryName : '', index === 0 ? 1280 : 360))
      .filter(Boolean) as string[];
    return Array.from(new Set([heroImage, ...resolved].filter(Boolean) as string[])).slice(0, 5);
  }, [categoryName, heroImage, product?.image?.url, related]);
  const selectedImage = galleryImages[activeImage] || heroImage;
  const selectedFallbackImage = getProductFallbackImage(categoryName);
  const stockLabel =
    product?.inStock === false ? 'Out of stock' : product?.stockQty ? `In stock (${product.stockQty}+ units)` : 'In stock';
  const detailRows = [
    ['Category', categoryName || 'Metal'],
    ['Grade', product?.unitType || 'Standard'],
    ['Size', product?.weightPerUnit ? 'As per requirement' : 'As per requirement'],
    ['Length', product?.unit || 'As per size'],
    ['Weight', 'As per order'],
    ['Stock Availability', stockLabel],
    ['MOQ', 'On request'],
  ];
  const productTabs = [
    { key: 'description', label: 'Description', icon: MessageSquareMore },
    { key: 'specs', label: 'Specifications', icon: FileText },
    { key: 'composition', label: 'Chemical Composition', icon: ShieldCheck },
    { key: 'mechanical', label: 'Mechanical Properties', icon: Package2 },
    { key: 'documents', label: 'Documents', icon: Truck },
  ] as const;

  const handleHeroImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    if (!selectedFallbackImage || event.currentTarget.dataset.fallbackApplied === 'true') return;
    event.currentTarget.dataset.fallbackApplied = 'true';
    event.currentTarget.src = selectedFallbackImage;
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
            availability: 'https://schema.org/InStock',
            price: 0,
            description: 'Request for quote only',
          },
        }}
      />
      <p className="text-sm text-zinc-500">Home / Products / {categoryName || 'Product'} / {product.name}</p>
      <section className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[1.75rem] border border-gold/15 bg-[#070c12] p-3 shadow-halo sm:p-4">
          <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-zinc-900 via-black to-zinc-900">
            <div className="relative aspect-[1.05/1] w-full">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  decoding="async"
                  fetchPriority="high"
                  onError={handleHeroImageError}
                />
              ) : null}
              <div className="absolute left-4 top-4 rounded-full border border-gold/25 bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
                Quote Only
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-5 gap-2">
            {galleryImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActiveImage(index)}
                className={`overflow-hidden rounded-xl border transition ${
                  activeImage === index ? 'border-gold shadow-gold' : 'border-white/10 opacity-80 hover:opacity-100'
                }`}
              >
                <img src={image} alt={`${product.name} gallery ${index + 1}`} className="h-20 w-full object-cover" />
              </button>
            ))}
          </div>

          <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#0a1017]">
            <div className="flex flex-wrap gap-2 border-b border-white/10 px-3 pt-3">
              {productTabs.map((tab) => {
                const Icon = tab.icon;
                const selected = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`inline-flex items-center gap-2 rounded-t-xl border px-4 py-2 text-sm font-semibold transition ${
                      selected
                        ? 'border-gold/30 bg-gold/10 text-gold'
                        : 'border-transparent bg-transparent text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="p-4 sm:p-5">
              {activeTab === 'description' ? (
                <p className="text-sm leading-7 text-zinc-300">
                  {product.description ||
                    `${product.name} is available for industrial procurement with responsive sourcing support, packaging coordination, and quotation follow-up.`}
                </p>
              ) : null}

              {activeTab === 'specs' ? (
                <div className="space-y-2">
                  {detailRows.map(([label, value]) => (
                    <div key={label} className="grid grid-cols-[120px_1fr] gap-3 border-b border-white/8 pb-2 text-sm">
                      <p className="text-zinc-500">{label}</p>
                      <p className="text-zinc-200">{value}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              {activeTab === 'composition' ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ['Copper', '99.99%'],
                    ['Iron', '0.01%'],
                    ['Carbon', 'Trace'],
                    ['Other Elements', 'As per order specification'],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{label}</p>
                      <p className="mt-1 text-sm font-semibold text-zinc-100">{value}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              {activeTab === 'mechanical' ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ['Tensile Strength', 'High'],
                    ['Hardness', 'Industrial Grade'],
                    ['Conductivity', 'Premium'],
                    ['Finish', 'Mill / Polished / As required'],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{label}</p>
                      <p className="mt-1 text-sm font-semibold text-zinc-100">{value}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              {activeTab === 'documents' ? (
                <div className="space-y-3">
                  {[
                    'Mill Test Certificate',
                    'Quality Inspection Report',
                    'Packing List',
                    'Commercial Invoice',
                  ].map((item) => (
                    <div key={item} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-emerald-300" />
                        <p className="text-sm text-zinc-100">{item}</p>
                      </div>
                      <span className="text-xs uppercase tracking-[0.14em] text-zinc-500">Available on request</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <aside className="rounded-[1.75rem] border border-gold/15 bg-[#070c12] p-4 shadow-halo sm:p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-gold">Home / Products / {categoryName || 'Metal'}</p>
          <h1 className="mt-2 font-display text-3xl text-white sm:text-4xl">{product.name}</h1>
          <p className="mt-2 text-sm text-zinc-400">{categoryName || 'Premium Grade'}</p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
              <Star size={12} fill="currentColor" />
              Request for Quote
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              {product.inStock === false ? 'Out of Stock' : 'In Stock'}
            </span>
          </div>

          <div className="mt-5 border-y border-white/10 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Quote Status</p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-3xl font-extrabold text-gold sm:text-4xl">Request for Quote</p>
                <p className="mt-1 text-xs text-zinc-500">Email us for pricing and availability. We reply with a custom quote.</p>
              </div>
              <div className="rounded-full border border-gold/15 bg-black/20 px-3 py-1 text-xs font-semibold text-zinc-300">MOQ On request</div>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            {detailRows.slice(0, 7).map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 border-b border-white/8 pb-2 text-sm">
                <span className="text-zinc-500">{label}</span>
                <span className="max-w-[58%] text-right text-zinc-100">{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold-cta px-4 py-3 text-sm font-bold text-black shadow-gold transition hover:brightness-110 sm:col-span-1"
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
              Request Quote
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gold/25 bg-black/20 px-4 py-3 text-sm font-semibold text-gold transition hover:border-gold/45 hover:bg-gold/10"
              onClick={() =>
                navigate('/quote-request', {
                  state: {
                    productName: product.name,
                    quantity: qty,
                    unit: unitLabel,
                    unitPrice,
                    totalPrice,
                    currency: product.currency || 'USD',
                    requirement: `Add ${qty} ${unitLabel} of ${product.name} to enquiry queue.`,
                  },
                })
              }
            >
              Add to Enquiry
            </button>
            <a
              href="https://wa.me/917905350134"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300 transition hover:border-emerald-400/60 hover:bg-emerald-500/15"
            >
              WhatsApp
            </a>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-white">Quantity</span>
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
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/5 pt-4">
              <span className="text-sm font-medium text-zinc-300">Pricing</span>
              <span className="text-2xl font-semibold text-white">Request for Quote</span>
            </div>
          </div>

          <div className="mt-5 grid gap-2">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gold/10 text-gold">
                  <CheckCircle2 size={13} />
                </span>
                {feature}
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="rounded-[1.75rem] border border-gold/15 bg-[#070c12] p-4 shadow-halo sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-gold">Related Metals</p>
            <h2 className="mt-2 font-display text-2xl text-white">Similar products</h2>
          </div>
          <span className="text-sm text-zinc-500">Recommended from the current catalog</span>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {related.map((r) => (
            <ProductCard
              key={r._id}
              id={r._id}
              name={r.name}
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
