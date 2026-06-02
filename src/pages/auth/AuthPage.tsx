import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { BrandLogo } from '../../components/BrandLogo';
import { SEO } from '../../components/seo/SEO';
import { getDefaultRouteForRole, setAuth } from '../../lib/auth';
import { getApiErrorMessage, getRequestDebugInfo } from '../../lib/apiUtils';
import { publicApi } from '../../lib/publicApi';

const MIN_PASSWORD_LENGTH = 8;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [requestDebugInfo, setRequestDebugInfo] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const normalizedEmail = email.trim();
  const emailError =
    touched.email && !emailPattern.test(normalizedEmail)
      ? 'Enter a valid email address.'
      : '';
  const passwordError =
    touched.password && password.length < MIN_PASSWORD_LENGTH
      ? `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
      : '';
  const formValid =
    emailPattern.test(normalizedEmail) &&
    password.length >= MIN_PASSWORD_LENGTH;

  const submit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setError('');
    setRequestDebugInfo('');
    if (!formValid) return;

    setLoading(true);
    try {
      const res = await publicApi.login({ email: normalizedEmail, password });
      setAuth(res.token, res.user);
      navigate(getDefaultRouteForRole(res.user.role), { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
      setRequestDebugInfo(getRequestDebugInfo(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Admin Login" description="Secure GRAVEN METAL admin authentication portal." path="/auth" noIndex />
      <section className="relative min-h-screen overflow-hidden bg-[#03070b]">
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

        <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl items-center gap-8 px-5 py-10 sm:px-7 md:px-10 lg:grid-cols-[0.9fr_1fr]">
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
            <h2 className="mt-2 font-display text-3xl text-white">Admin Login</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Enter your credentials. Your role will be detected automatically.
            </p>

            <form className="mt-6 space-y-4" onSubmit={submit} noValidate>
              <label className="block">
                <span className="mb-1.5 block text-sm text-zinc-300">Email</span>
                <span className="relative block">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    type="email"
                    autoComplete="email"
                    aria-describedby="admin-email-error"
                    aria-invalid={!!emailError}
                    className={`gm-input gm-input-with-icon ${emailError ? 'border-red-500/60 focus:border-red-400' : ''}`}
                    placeholder="admin@graven.local"
                    value={email}
                    onBlur={() => setTouched((state) => ({ ...state, email: true }))}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                      setRequestDebugInfo('');
                    }}
                  />
                </span>
                {emailError ? (
                  <span id="admin-email-error" className="mt-1.5 block text-xs text-red-300">
                    {emailError}
                  </span>
                ) : null}
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm text-zinc-300">Password</span>
                <span className="relative block">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    type="password"
                    autoComplete="current-password"
                    aria-describedby="admin-password-error"
                    aria-invalid={!!passwordError}
                    className={`gm-input gm-input-with-icon ${passwordError ? 'border-red-500/60 focus:border-red-400' : ''}`}
                    placeholder="Password123"
                    value={password}
                    onBlur={() => setTouched((state) => ({ ...state, password: true }))}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                      setRequestDebugInfo('');
                    }}
                  />
                </span>
                {passwordError ? (
                  <span id="admin-password-error" className="mt-1.5 block text-xs text-red-300">
                    {passwordError}
                  </span>
                ) : null}
              </label>

              {error ? (
                <p aria-live="assertive" className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  <span className="block">{error}</span>
                  {requestDebugInfo ? (
                    <span className="mt-1 block text-xs text-red-200/80">
                      {requestDebugInfo}
                    </span>
                  ) : null}
                </p>
              ) : null}

              <button
                disabled={loading || !formValid}
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
              Use your assigned admin or super admin credentials. We will route you to the right dashboard.
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
