import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MotionReveal } from '../components/MotionReveal';
import { SkeletonCard } from '../components/ui/Skeleton';
import { SEO } from '../components/seo/SEO';
import { getApiErrorMessage } from '../lib/apiUtils';
import { publicApi } from '../lib/publicApi';
import type { ApiBlog } from '../lib/publicApi';
import { demoBlogs } from '../data/demoContent';
import { optimizeImageUrl } from '../lib/image';

export function BlogPage() {
  const [posts, setPosts] = useState<ApiBlog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi
      .getBlogs({ published: 'true' })
      .then((data) => setPosts(data.length ? data : demoBlogs))
      .catch((error) => {
        setPosts(demoBlogs);
        toast.error(getApiErrorMessage(error));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <MotionReveal>
      <SEO
        title="Metal Market Blog"
        description="Read GRAVEN AUTOMATION insights on metal pricing trends, sourcing, and industrial market updates."
        path="/blog"
        type="article"
        keywords={['metal market news', 'metal pricing trends', 'industrial insights']}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: 'GRAVEN AUTOMATION Blog',
          url: 'https://gravenautomation.com/blog',
        }}
      />
      <section className="gm-shell p-4 sm:p-5 md:p-7">
        <p className="text-sm text-zinc-500">Home / Blog</p>
        <h1 className="font-display text-3xl text-white sm:text-4xl">Latest News & Insights</h1>
        <p className="mt-2 text-zinc-400">Stay updated with the latest trends and insights in the metal industry.</p>
        {loading ? <p className="mt-2 text-xs text-gold animate-pulse">Loading newsroom updates...</p> : null}
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            : posts.map((post) => (
                <motion.article
                  key={post._id}
                  whileHover={{ y: -5 }}
                  className="rounded-xl border border-gold/20 bg-[#0b0f13] p-3 shadow-panel"
                >
                  <div className="h-36 overflow-hidden rounded-lg border border-gold/15 bg-gradient-to-br from-zinc-600/30 to-zinc-900/30">
                    {post.thumbnail?.url ? (
                      <img
                        src={optimizeImageUrl(post.thumbnail.url, 800)}
                        alt={post.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <p className="mt-3 text-xs text-zinc-500">
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Latest update'}
                  </p>
                  <h2 className="mt-3 text-xl font-semibold text-white">{post.title}</h2>
                  <p className="mt-2 text-sm text-zinc-400">{post.excerpt}</p>
                  <button className="mt-3 text-sm text-gold">Read More +</button>
                </motion.article>
              ))}
        </div>
      </section>
    </MotionReveal>
  );
}
