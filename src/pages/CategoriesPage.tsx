import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MotionReveal } from '../components/MotionReveal';
import { SkeletonCard } from '../components/ui/Skeleton';
import { SEO } from '../components/seo/SEO';
import { publicApi } from '../lib/publicApi';
import type { ApiCategory } from '../lib/publicApi';
import { demoCategories } from '../data/demoContent';

const categoryImageBySlug: Record<string, string> = {
  copper: '/imgs/coper.png',
  steel: '/imgs/steel.png',
  aluminium: '/imgs/alumunu.png',
  brass: '/imgs/Brass%20rods.png',
  iron: '/imgs/iron.png',
};

const getCategoryImage = (category: ApiCategory) => {
  const slugKey = (category.slug || '').toLowerCase().trim();
  if (slugKey && categoryImageBySlug[slugKey]) return categoryImageBySlug[slugKey];

  const nameKey = (category.name || '').toLowerCase().trim().replace(/\s+/g, '-');
  if (nameKey && categoryImageBySlug[nameKey]) return categoryImageBySlug[nameKey];
  return '';
};

export function CategoriesPage() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi
      .getCategories()
      .then((data) => setCategories(data.length ? data : demoCategories))
      .catch(() => {
        setCategories(demoCategories);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <MotionReveal>
        <SEO title="Categories" description="Browse metal categories for industrial needs." path="/categories" />
        <section className="gm-shell p-4 sm:p-5 md:p-7">
          <p className="text-sm text-zinc-500">Home / Categories</p>
          <h1 className="mt-2 font-display text-3xl text-white sm:text-4xl">Our Categories</h1>
          <p className="mt-2 text-zinc-400">Explore our wide range of metal categories tailored for diverse industrial needs.</p>
          {loading ? <p className="mt-2 text-xs text-gold animate-pulse">Fetching category inventory...</p> : null}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : categories.map((category) => {
                  const imageUrl = getCategoryImage(category);
                  return (
                    <motion.article
                      key={category._id}
                      whileHover={{ y: -5 }}
                      className="rounded-xl border border-gold/20 bg-[#0b0f13] p-3 shadow-panel"
                    >
                      <div className="h-28 overflow-hidden rounded-lg border border-gold/15 bg-gradient-to-br from-zinc-700/30 to-zinc-900/30">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={category.name}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <h3 className="mt-3 text-lg font-semibold text-white">{category.name}</h3>
                      <p className="mt-1 text-xs text-zinc-500">{category.productCount || 0} products</p>
                      <Link to="/products" className="mt-2 inline-flex text-sm text-gold">
                        Explore +
                      </Link>
                    </motion.article>
                  );
                })}
          </div>
        </section>
      </MotionReveal>

      <MotionReveal delay={0.08}>
        <section className="gm-shell grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {['100% Pure Quality', 'Global Supply', 'Best Pricing', 'Timely Delivery'].map((item) => (
            <div key={item} className="rounded-xl border border-gold/15 bg-black/35 p-4 text-center text-sm text-zinc-300">
              {item}
            </div>
          ))}
        </section>
      </MotionReveal>

      <MotionReveal delay={0.12}>
        <section className="rounded-2xl border border-gold/20 bg-gradient-to-r from-[#221709] via-[#10131a] to-[#0a0d11] p-5 shadow-panel sm:p-6">
          <h2 className="font-display text-2xl text-white">Looking for bulk order?</h2>
          <p className="mt-2 text-zinc-300">Get in touch with us for the best rates and quotes.</p>
          <Link to="/quote-request" className="mt-4 inline-flex rounded-md bg-gold-cta px-4 py-2 text-sm font-semibold text-black shadow-gold">
            Request a Quote
          </Link>
        </section>
      </MotionReveal>
    </div>
  );
}
