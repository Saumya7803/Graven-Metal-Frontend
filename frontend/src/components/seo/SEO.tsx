import { Helmet } from 'react-helmet-async';

type Props = {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
  keywords?: string[];
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
};

export function SEO({
  title,
  description,
  path = '/',
  image = '/favicon.svg',
  type = 'website',
  noIndex = false,
  keywords = [],
  structuredData,
}: Props) {
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://gravenmetal.com';
  const fullTitle = `${title} | GRAVEN METAL`;
  const desc = description || 'Premium luxury metal trading platform.';
  const canonical = new URL(path, siteUrl).toString();
  const imageUrl = image.startsWith('http') ? image : new URL(image, siteUrl).toString();

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {keywords.length ? <meta name="keywords" content={keywords.join(', ')} /> : null}
      <meta name="robots" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
      <meta name="googlebot" content={noIndex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large'} />
      <link rel="canonical" href={canonical} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:site_name" content="GRAVEN METAL" />
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:site" content="@gravenmetal" />

      <meta name="theme-color" content="#060606" />
      {structuredData ? (
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      ) : null}
    </Helmet>
  );
}
