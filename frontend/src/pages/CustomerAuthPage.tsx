import { useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Building2, LockKeyhole, Mail, Phone, ShieldCheck, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { BrandLogo } from '../components/BrandLogo';
import { SEO } from '../components/seo/SEO';
import { useCustomerAuth } from '../components/auth/AuthProvider';
import { getApiErrorMessage } from '../lib/apiUtils';
import { setCustomerAuth } from '../lib/auth';
import { publicApi } from '../lib/publicApi';

type Mode = 'login' | 'register';

const DEV_CUSTOMER_EMAIL = import.meta.env.DEV ? 'customer@graven.local' : '';
const DEV_CUSTOMER_PASSWORD = import.meta.env.DEV ? 'Password123' : '';

export function CustomerAuthPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useCustomerAuth();

  const redirectTo = useMemo(() => {
    const state = location.state as { from?: { pathname?: string } } | null;
    return state?.from?.pathname || '/account';
  }, [location.state]);

  const update = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response =
        mode === 'register'
          ? await publicApi.registerCustomer(form)
          : await publicApi.loginCustomer({ email: form.email, password: form.password });
      setCustomerAuth(response.token, response.user);
      toast.success(mode === 'register' ? 'Account created' : 'Welcome back');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/account" replace />;
  }

  return (
    <>
      <SEO title="Customer Login" description="Login or create a GRAVEN METAL customer account." path="/login" noIndex />
      <section className="relative min-h-[calc(100svh-121px)] overflow-hidden bg-[#03070b]">
        <div className="absolute inset-0">
          <img
            src="/imgs/background.png"
            alt="Industrial molten metal"
            className="h-full w-full object-cover object-[72%_center] opacity-55"
            decoding="async"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#03070b_0%,rgba(3,7,11,0.92)_48%,rgba(3,7,11,0.72)_100%)]" />
        </div>

        <div className="relative z-10 mx-auto grid min-h-[calc(100svh-121px)] max-w-6xl items-center gap-8 px-5 py-10 sm:px-7 md:px-10 lg:grid-cols-[0.9fr_1fr]">
          <div className="hidden max-w-lg lg:block">
            <BrandLogo className="h-14" />
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-gold">Customer Portal</p>
            <h1 className="mt-4 text-5xl font-extrabold leading-tight text-white">Track quotes and manage requests.</h1>
            <p className="mt-5 max-w-md text-base leading-7 text-zinc-300">
              Sign in to view your quote history, submit new requirements faster, and keep your contact details ready for the GRAVEN team.
            </p>
            <div className="mt-6 flex items-center gap-3 rounded-lg border border-gold/15 bg-black/35 p-4 text-sm text-zinc-300 backdrop-blur-md">
              <ShieldCheck className="shrink-0 text-gold" size={22} />
              Passwords are hashed on the server and customer accounts are separated from admin access.
            </div>
          </div>

          <div className="mx-auto w-full max-w-md rounded-2xl border border-gold/20 bg-[#080d12]/94 p-5 shadow-halo backdrop-blur-xl sm:p-6">
            <div className="lg:hidden">
              <BrandLogo className="h-12" />
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-gold lg:mt-0">Authentication</p>
            <h2 className="mt-2 font-display text-3xl text-white">
              {mode === 'register' ? 'Create Account' : 'Customer Login'}
            </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {mode === 'register' ? 'Create a customer account for quote tracking.' : 'Enter your credentials to open your account.'}
              </p>
              {mode === 'login' && DEV_CUSTOMER_EMAIL ? (
                <p className="mt-3 rounded-md border border-gold/15 bg-black/25 px-3 py-2 text-xs leading-5 text-zinc-400">
                  Demo login: <span className="text-zinc-200">{DEV_CUSTOMER_EMAIL}</span> /{' '}
                  <span className="text-zinc-200">{DEV_CUSTOMER_PASSWORD}</span>
                </p>
              ) : null}

            <div className="mt-5 grid grid-cols-2 gap-2 rounded-lg border border-gold/20 bg-[#0d1218] p-1">
              {(['login', 'register'] as Mode[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setMode(item);
                    setError('');
                  }}
                  className={`rounded-md px-3 py-2.5 text-sm font-semibold ${
                    mode === item ? 'bg-gold-cta text-black shadow-gold' : 'text-zinc-300 hover:text-gold'
                  }`}
                >
                  {item === 'login' ? 'Login' : 'Register'}
                </button>
              ))}
            </div>

            <form className="mt-5 space-y-4" onSubmit={submit}>
              {mode === 'register' ? (
                <>
                  <label className="block">
                    <span className="mb-1.5 block text-sm text-zinc-300">Full Name</span>
                    <span className="relative block">
                      <UserRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                      <input
                        className="gm-input pl-10"
                        value={form.name}
                        onChange={(e) => update('name', e.target.value)}
                        autoComplete="name"
                        required
                      />
                    </span>
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-sm text-zinc-300">Phone</span>
                      <span className="relative block">
                        <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <input
                          className="gm-input pl-10"
                          value={form.phone}
                          onChange={(e) => update('phone', e.target.value)}
                          autoComplete="tel"
                        />
                      </span>
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-sm text-zinc-300">Company</span>
                      <span className="relative block">
                        <Building2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <input className="gm-input pl-10" value={form.company} onChange={(e) => update('company', e.target.value)} />
                      </span>
                    </label>
                  </div>
                </>
              ) : null}

              <label className="block">
                <span className="mb-1.5 block text-sm text-zinc-300">Email</span>
                <span className="relative block">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    type="email"
                    autoComplete="email"
                    className="gm-input pl-10"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    required
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm text-zinc-300">Password</span>
                <span className="relative block">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    type="password"
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                    className="gm-input pl-10"
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    minLength={8}
                    required
                  />
                </span>
              </label>

              {mode === 'register' ? (
                <p className="text-xs text-zinc-500">Use at least 8 characters with uppercase, lowercase, and a number.</p>
              ) : null}

              {error ? (
                <p aria-live="assertive" className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {error}
                </p>
              ) : null}

              <button
                disabled={loading}
                className="w-full rounded-md bg-gold-cta px-4 py-3 font-semibold text-black shadow-gold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Please wait...' : mode === 'register' ? 'Create Account' : 'Login'}
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-zinc-500">
              <Link to="/" className="text-gold hover:text-champagne">
                Return to website
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
