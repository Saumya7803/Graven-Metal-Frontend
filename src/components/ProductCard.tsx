import type { SyntheticEvent } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getProductFallbackImage, resolveProductImageUrl } from '../lib/image';

type Props = {
  id: string;
  name: string;
  price: string;
  category: string;
  tint: string;
  imageUrl?: string;
};

export function ProductCard({ id, name, price, category, tint, imageUrl }: Props) {
  const optimizedImage = resolveProductImageUrl(imageUrl, category, 640);
  const fallbackImage = getProductFallbackImage(category);
  const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    if (!fallbackImage || event.currentTarget.dataset.fallbackApplied === 'true') return;
    event.currentTarget.dataset.fallbackApplied = 'true';
    event.currentTarget.src = fallbackImage;
  };

  return (
    <motion.article
      whileHover={{ y: -6, scale: 1.006 }}
      transition={{ duration: 0.28 }}
      className="group rounded-xl border border-gold/20 bg-luxury-linear p-3 shadow-halo sm:p-3.5"
    >
      <div className={`relative h-24 overflow-hidden rounded-lg border border-gold/15 bg-gradient-to-br ${tint} shadow-[inset_0_0_28px_rgba(255,193,84,0.12)] sm:h-28`}>
        {optimizedImage ? (
          <img
            src={optimizedImage}
            alt={name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
            onError={handleImageError}
          />
        ) : null}
      </div>
      <h3 className="mt-3 text-base font-semibold text-white sm:text-lg">{name}</h3>
      <p className="mt-1 text-xs text-zinc-400 sm:text-sm">{category}</p>
      <p className="mt-2 text-xl font-semibold text-amberlux">{price}</p>
      <Link
        to={`/products/${id}`}
        className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-gold-cta px-4 py-2 text-sm font-semibold text-black shadow-gold transition group-hover:brightness-110"
      >
        View Details
      </Link>
    </motion.article>
  );
}
