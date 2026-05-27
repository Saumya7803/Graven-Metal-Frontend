import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ProductCard } from '../components/ProductCard';
import { SkeletonCard } from '../components/ui/Skeleton';
import { SEO } from '../components/seo/SEO';
import { getApiErrorMessage } from '../lib/apiUtils';
import { publicApi } from '../lib/publicApi';
import type { ApiProduct } from '../lib/publicApi';
import { demoProducts } from '../data/demoContent';
import { optimizeImageUrl } from '../lib/image';

const specs = [
  ['Purity', '24K | 99.99%'],
  ['Weight', '10g, 20g, 50g, 100g, 1kg'],
  ['Form', 'Bar'],
  ['Certificate', 'Yes'],
];
const features = ['100% Purity Guaranteed', 'Certified & Hallmarked', 'Secure Global Delivery', 'Best Market Pricing'];

export function ProductDetailsPage() {
  const { id } = useParams();
  const [qty, setQty] = useState(1);
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [all, setAll] = useState<ApiProduct[]>([]);

  useEffect(() => {
    if (id) {
      publicApi
        .getProductById(id)
        .then(setProduct)
        .catch((error) => {
          const fallback = demoProducts.find((p) => p._id === id || p.slug === id);
          setProduct(fallback || demoProducts[0]);
          toast.error(getApiErrorMessage(error));
        });
    }

    publicApi
      .getProducts()
      .then((data) => setAll(data.length ? data : demoProducts))
      .catch((error) => {
        setAll(demoProducts);
        toast.error(getApiErrorMessage(error));
      });
  }, [id]);

  const related = useMemo(() => all.filter((x) => x._id !== id).slice(0, 5), [all, id]);
  const heroImage = optimizeImageUrl(product?.image?.url, 1280);
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
          image: heroImage || 'https://gravenmetal.com/favicon.svg',
          sku: product.slug || product._id,
          offers: {
            '@type': 'Offer',
            priceCurrency: product.currency || 'USD',
            price: product.price,
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
              />
            ) : null}
          </div>
          <div className="mt-5 rounded-xl border border-gold/15 bg-black/35 p-4">
            <h3 className="text-lg font-semibold text-white">Product Specifications</h3>
            <div className="mt-3 space-y-2">{specs.map(([l,v]) => <div key={l} className="grid grid-cols-[85px_1fr] gap-2 border-b border-gold/10 pb-2 text-xs sm:grid-cols-[110px_1fr] sm:text-sm"><p className="text-zinc-400">{l}</p><p className="break-words text-zinc-200">{v}</p></div>)}</div>
          </div>
        </div>
        <aside className="gm-shell p-4 sm:p-5">
          <h1 className="font-display text-3xl text-white sm:text-4xl">{product.name}</h1>
          <p className="mt-1 text-sm text-zinc-400">{typeof product.category === 'string' ? product.category : product.category?.name || 'Premium Grade'}</p>
          <p className="mt-4 text-3xl font-semibold text-gold sm:text-4xl">
            ${product.price} / {product.unit || 'kg'}
          </p>
          <p className="mt-2 text-xs text-emerald-400">In Stock</p>
          <ul className="mt-4 space-y-2 text-sm text-zinc-300">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" />
                {feature}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex w-40 items-center justify-between rounded-md border border-gold/25 bg-[#090d11] px-3 py-2"><button onClick={() => setQty((p)=>Math.max(1,p-1))}>-</button><span>{qty}</span><button onClick={() => setQty((p)=>p+1)}>+</button></div>
          <button className="mt-5 w-full rounded-md bg-gold-cta py-2.5 font-semibold text-black shadow-gold">Request Quote</button>
          <a href="https://wa.me/12125550148" target="_blank" rel="noreferrer" className="mt-3 block w-full rounded-md border border-emerald-500/40 bg-emerald-500/10 py-2.5 text-center text-sm font-medium text-emerald-300">Chat on WhatsApp</a>
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
              price={`$${r.price}/${r.unit || 'kg'}`}
              category={typeof r.category === 'string' ? '-' : r.category?.name || '-'}
              tint="from-zinc-500/20 to-zinc-800/20"
              imageUrl={r.image?.url}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
