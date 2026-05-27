import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { SEO } from '../../components/seo/SEO';

export function RouteErrorPage() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'Something went wrong.';

  return (
    <>
      <SEO title="Application Error" description="An unexpected application error occurred." noIndex />
      <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-red-500/30 bg-[#120b0b] p-6 text-center shadow-glow sm:mt-16 sm:p-8">
        <h1 className="font-display text-3xl text-white sm:text-4xl">Unexpected Error</h1>
        <p className="mt-3 text-red-300">{message}</p>
        <Link to="/" className="mt-6 inline-flex rounded-md bg-gradient-to-r from-brass to-gold px-5 py-2.5 font-semibold text-black">Back to Home</Link>
      </div>
    </>
  );
}
