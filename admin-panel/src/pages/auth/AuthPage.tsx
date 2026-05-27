import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { BrandLogo } from '../../components/BrandLogo';
import { SEO } from '../../components/seo/SEO';
import { setAuth } from '../../lib/auth';
import { getApiErrorMessage } from '../../lib/apiUtils';
import { publicApi } from '../../lib/publicApi';

export function AuthPage() {
  const [portal, setPortal] = useState<'admin' | 'super_admin'>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res =
        portal === 'super_admin'
          ? await publicApi.loginSuperAdmin({ email, password })
          : await publicApi.loginAdmin({ email, password });
      setAuth(res.token, res.user);
      if (res.user.role === 'super_admin') navigate('/super-admin');
      else if (res.user.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Admin Login" description="Secure GRAVEN METAL admin authentication portal." path="/auth" noIndex />
      <section className="relative min-h-[calc(100svh-121px)] overflow-hidden bg-[#03070b]">
        <div className="absolute inset-0">
          <img
            src="/imgs/background.png"
            alt="Molten metal background"
            className="h-full w-full object-cover object-[74%_center] opacity-55"
            decoding="async"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#03070b_0%,rgba(3,7,11,0.92)_44%,rgba(3,7,11,0.7)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(217,182,106,0.12),transparent_34%)]" />
        </div>

        <div className="relative z-10 mx-auto grid min-h-[calc(100svh-121px)] max-w-6xl items-center gap-8 px-5 py-10 sm:px-7 md:px-10 lg:grid-cols-[0.9fr_1fr]">
          <div className="hidden max-w-lg lg:block">
            <BrandLogo className="h-14" />
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-gold">Secure Admin Portal</p>
            <h1 className="mt-4 text-5xl font-extrabold leading-tight text-white">
              Manage metals,
              <br />
              content, and quotes.
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-zinc-300">
              Sign in to update products, review quote requests, and keep the GRAVEN catalog moving.
            </p>
            <div className="mt-6 flex items-center gap-3 rounded-lg border border-gold/15 bg-black/35 p-4 text-sm text-zinc-300 backdrop-blur-md">
              <ShieldCheck className="shrink-0 text-gold" size={22} />
              Role-based access is enabled for admin and super admin accounts.
            </div>
          </div>

          <div className="mx-auto w-full max-w-md rounded-2xl border border-gold/20 bg-[#080d12]/94 p-5 shadow-halo backdrop-blur-xl sm:p-6">
            <div className="lg:hidden">
              <BrandLogo className="h-12" />
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-gold lg:mt-0">Authentication</p>
            <h2 className="mt-2 font-display text-3xl text-white">
              {portal === 'super_admin' ? 'Super Admin Login' : 'Admin Login'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Enter your credentials to access the dashboard.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2 rounded-lg border border-gold/20 bg-[#0d1218] p-1">
              <button
                type="button"
                onClick={() => setPortal('admin')}
                className={`rounded-md px-3 py-2.5 text-sm font-semibold ${
                  portal === 'admin' ? 'bg-gold-cta text-black shadow-gold' : 'text-zinc-300 hover:text-gold'
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setPortal('super_admin')}
                className={`rounded-md px-3 py-2.5 text-sm font-semibold ${
                  portal === 'super_admin' ? 'bg-gold-cta text-black shadow-gold' : 'text-zinc-300 hover:text-gold'
                }`}
              >
                Super Admin
              </button>
            </div>

            <form className="mt-5 space-y-4" onSubmit={submit}>
              <label className="block">
                <span className="mb-1.5 block text-sm text-zinc-300">Email</span>
                <span className="relative block">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    type="email"
                    autoComplete="email"
                    className="gm-input pl-10"
                    placeholder={portal === 'super_admin' ? 'super@graven.local' : 'admin@graven.local'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm text-zinc-300">Password</span>
                <span className="relative block">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    type="password"
                    autoComplete="current-password"
                    className="gm-input pl-10"
                    placeholder="Password123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </span>
              </label>

              {error ? (
                <p aria-live="assertive" className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {error}
                </p>
              ) : null}

              <button
                disabled={loading}
                className="w-full rounded-md bg-gold-cta px-4 py-3 font-semibold text-black shadow-gold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/35 border-t-black" />
                    Logging in...
                  </span>
                ) : (
                  'Login'
                )}
              </button>
            </form>

            <div className="mt-5 rounded-lg border border-gold/15 bg-black/30 p-3 text-xs leading-5 text-zinc-400">
              Local admin: <span className="text-zinc-200">admin@graven.local</span> /{' '}
              <span className="text-zinc-200">Password123</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
