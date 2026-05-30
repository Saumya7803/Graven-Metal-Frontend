export function optimizeImageUrl(url?: string, width = 1200) {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width},c_limit/`);
}

const productFallbackImages: Record<string, string> = {
  gold: '/imgs/gold.png',
  silver: '/imgs/silver.png',
  copper: '/imgs/coper.png',
  steel: '/imgs/steel.png',
  aluminium: '/imgs/alumunu.png',
  aluminum: '/imgs/alumunu.png',
  brass: '/imgs/Brass%20rods.png',
  brassrods: '/imgs/Brass%20rods.png',
  iron: '/imgs/iron.png',
  lead: '/imgs/lead%20ingots.png',
  leadingots: '/imgs/lead%20ingots.png',
};

function normalizeKey(value?: string) {
  return (value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '');
}

export function getProductFallbackImage(category?: string) {
  const key = normalizeKey(category);
  return productFallbackImages[key] || '';
}

export function resolveProductImageUrl(imageUrl?: string, category?: string, width = 1200) {
  const trimmed = imageUrl?.trim();
  if (trimmed) return optimizeImageUrl(trimmed, width);
  return getProductFallbackImage(category);
}
