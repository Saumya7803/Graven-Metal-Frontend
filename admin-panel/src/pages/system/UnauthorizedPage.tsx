import { Link } from 'react-router-dom';
import { SEO } from '../../components/seo/SEO';

export function UnauthorizedPage() {
  return (
    <>
      <SEO title="Unauthorized" description="You do not have permission to access this page." noIndex />
      <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-gold/20 bg-[#0a0f14] p-6 text-center shadow-glow sm:mt-16 sm:p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-gold">403</p>
        <h1 className="mt-3 font-display text-3xl text-white sm:text-4xl">Unauthorized Access</h1>
        <p className="mt-3 text-zinc-400">
          You do not have permission to access this area.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-md bg-gradient-to-r from-brass to-gold px-5 py-2.5 font-semibold text-black"
        >
          Back to Home
        </Link>
      </div>
    </>
  );
}
