import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ClipboardList, LockKeyhole, LogOut, Mail, Phone, RefreshCw, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { MotionReveal } from '../components/MotionReveal';
import { SEO } from '../components/seo/SEO';
import { useCustomerAuth } from '../components/auth/AuthProvider';
import { clearCustomerAuth } from '../lib/auth';
import { getApiErrorMessage } from '../lib/apiUtils';
import { publicApi, type ApiQuote } from '../lib/publicApi';

function formatDate(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function statusLabel(status: ApiQuote['status']) {
  return status.replace(/_/g, ' ');
}

export function AccountPage() {
  const { user } = useCustomerAuth();
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<ApiQuote[]>([]);
  const [loading, setLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);

  const loadQuotes = async () => {
    setLoading(true);
    try {
      setQuotes(await publicApi.getMyQuotes());
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, []);

  const openQuotes = useMemo(
    () => quotes.filter((quote) => quote.status === 'new' || quote.status === 'in_review' || quote.status === 'quoted').length,
    [quotes],
  );

  const changePassword: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await publicApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password updated');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    clearCustomerAuth();
    navigate('/login', { replace: true });
  };

  return (
    <MotionReveal>
      <SEO title="My Account" description="GRAVEN AUTOMATION customer account and quote history." path="/account" noIndex />
      <section className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="space-y-5">
          <div className="gm-shell p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Customer Account</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-xl border border-gold/25 bg-gold/10 text-gold">
                <UserRound size={22} />
              </span>
              <div className="min-w-0">
                <h1 className="truncate font-display text-2xl text-white">{user?.name || 'Customer'}</h1>
                <p className="truncate text-sm text-zinc-500">{user?.company || 'GRAVEN customer'}</p>
              </div>
            </div>

            <div className="mt-5 space-y-2 text-sm text-zinc-300">
              <p className="flex items-center gap-2">
                <Mail size={15} className="text-gold" />
                {user?.email}
              </p>
              {user?.phone ? (
                <p className="flex items-center gap-2">
                  <Phone size={15} className="text-gold" />
                  {user.phone}
                </p>
              ) : null}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-gold/15 bg-[#0d1218] p-3">
                <p className="text-xs text-zinc-500">Total Quotes</p>
                <p className="mt-1 text-2xl font-bold text-gold">{quotes.length}</p>
              </div>
              <div className="rounded-xl border border-gold/15 bg-[#0d1218] p-3">
                <p className="text-xs text-zinc-500">Open</p>
                <p className="mt-1 text-2xl font-bold text-gold">{openQuotes}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 hover:border-red-400/60"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>

          <form onSubmit={changePassword} className="gm-shell p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Security</p>
            <h2 className="mt-1 font-display text-2xl text-white">Change Password</h2>
            <div className="mt-4 space-y-3">
              <input
                type="password"
                className="gm-input"
                placeholder="Current password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                required
              />
              <input
                type="password"
                className="gm-input"
                placeholder="New password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                required
              />
              <input
                type="password"
                className="gm-input"
                placeholder="Confirm new password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                required
              />
            </div>
            <button
              disabled={saving}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-gold-cta px-4 py-2.5 text-sm font-semibold text-black shadow-gold disabled:opacity-60"
            >
              <LockKeyhole size={15} />
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </aside>

        <section className="gm-shell p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Quote History</p>
              <h2 className="mt-1 font-display text-3xl text-white">My Requests</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={loadQuotes}
                className="inline-flex items-center gap-2 rounded-md border border-gold/25 bg-[#0d1218] px-3 py-2 text-sm text-zinc-200 hover:border-gold/50 hover:text-gold"
              >
                <RefreshCw size={15} />
                Refresh
              </button>
              <Link to="/quote-request" className="inline-flex items-center gap-2 rounded-md bg-gold-cta px-3 py-2 text-sm font-semibold text-black shadow-gold">
                <ClipboardList size={15} />
                New Quote
              </Link>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto rounded-xl border border-gold/15 bg-[#0a1119]">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b border-gold/10 text-left text-xs uppercase tracking-[0.14em] text-zinc-500">
                <tr>
                  <th className="px-3 py-3">Metal</th>
                  <th className="px-3 py-3">Quantity</th>
                  <th className="px-3 py-3">Requirement</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => (
                  <tr key={quote._id} className="border-t border-gold/10">
                    <td className="px-3 py-3 text-zinc-100">{quote.metal}</td>
                    <td className="px-3 py-3 text-zinc-300">{quote.quantity}</td>
                    <td className="max-w-[280px] truncate px-3 py-3 text-zinc-400">{quote.requirement || '-'}</td>
                    <td className="px-3 py-3">
                      <span className="rounded-full border border-gold/25 bg-gold/10 px-2.5 py-1 text-xs capitalize text-gold">
                        {statusLabel(quote.status)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-zinc-500">{formatDate(quote.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!quotes.length ? (
              <div className="p-8 text-center">
                <p className="font-display text-xl text-white">{loading ? 'Loading quotes...' : 'No quote requests yet'}</p>
                <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
                  Submit a quote request while signed in and it will appear here automatically.
                </p>
              </div>
            ) : null}
          </div>
        </section>
      </section>
    </MotionReveal>
  );
}
