import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MotionReveal } from '../components/MotionReveal';
import { SEO } from '../components/seo/SEO';
import { getApiErrorMessage } from '../lib/apiUtils';
import { publicApi } from '../lib/publicApi';
import { demoCategories } from '../data/demoContent';
import { useCustomerAuth } from '../components/auth/AuthProvider';

type QuoteForm = {
  name: string;
  email: string;
  phone: string;
  quantity: string;
  requirement: string;
  metal: string;
  file: File | null;
};

type QuoteErrors = Partial<Record<keyof QuoteForm, string>>;

const metals = demoCategories.map((c) => c.name);

export function QuoteRequestPage() {
  const { user, isAuthenticated } = useCustomerAuth();
  const [form, setForm] = useState<QuoteForm>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    quantity: '',
    requirement: '',
    metal: '',
    file: null,
  });
  const [errors, setErrors] = useState<QuoteErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      name: prev.name || user.name || '',
      email: prev.email || user.email || '',
      phone: prev.phone || user.phone || '',
    }));
  }, [user]);

  const validate = () => {
    const next: QuoteErrors = {};
    if (!form.name.trim()) next.name = 'Full name is required.';
    if (!/\S+@\S+\.\S+/.test(form.email)) next.email = 'Valid email is required.';
    if (!/^[0-9+\-\s]{8,}$/.test(form.phone)) next.phone = 'Valid phone number is required.';
    if (!form.quantity.trim()) next.quantity = 'Quantity is required.';
    if (!form.requirement.trim()) next.requirement = 'Requirement is required.';
    if (!form.metal.trim()) next.metal = 'Please select a metal.';
    return next;
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setSubmitted(false);
      return;
    }
    setServerError('');
    setSending(true);
    try {
      await publicApi.submitQuote({
        fullName: form.name,
        email: form.email,
        phone: form.phone,
        quantity: form.quantity,
        metal: form.metal,
        requirement: form.requirement,
        file: form.file,
      });
      setSubmitted(true);
      toast.success('Quote request submitted');
      setForm({
        name: '',
        email: '',
        phone: '',
        quantity: '',
        requirement: '',
        metal: '',
        file: null,
      });
    } catch (error) {
      setSubmitted(false);
      const message = getApiErrorMessage(error);
      setServerError(message);
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  const fieldClass = 'gm-input';

  return (
    <MotionReveal>
      <SEO
        title="Quote Request"
        description="Submit bulk metal requirements and receive a custom GRAVEN AUTOMATION quote."
        path="/quote-request"
      />
      <section className="gm-shell p-4 sm:p-5 md:p-7">
        <p className="text-sm text-zinc-500">Home / Request Quote</p>
        <h1 className="mt-3 font-display text-3xl text-white sm:text-4xl">Request a Quote</h1>
        <p className="mt-2 max-w-2xl text-zinc-400">
          We provide custom offers based on your exact business requirements.
          {isAuthenticated ? ' This request will be saved to your account.' : ''}
        </p>

        <form onSubmit={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-zinc-300">Full Name</label>
            <input
              type="text"
              autoComplete="name"
              className={fieldClass}
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Enter your name"
            />
            {errors.name ? <p className="mt-1 text-xs text-red-400">{errors.name}</p> : null}
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-300">Quantity</label>
            <input
              className={fieldClass}
              value={form.quantity}
              onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
              placeholder="e.g. 10 Kg"
            />
            {errors.quantity ? <p className="mt-1 text-xs text-red-400">{errors.quantity}</p> : null}
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-300">Email Address</label>
            <input
              type="email"
              autoComplete="email"
              className={fieldClass}
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="Enter your email"
            />
            {errors.email ? <p className="mt-1 text-xs text-red-400">{errors.email}</p> : null}
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-300">Phone Number</label>
            <input
              type="tel"
              autoComplete="tel"
              className={fieldClass}
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              placeholder="Enter your phone number"
            />
            {errors.phone ? <p className="mt-1 text-xs text-red-400">{errors.phone}</p> : null}
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-300">Select Metal</label>
            <select
              className={fieldClass}
              value={form.metal}
              onChange={(e) => setForm((p) => ({ ...p, metal: e.target.value }))}
            >
              <option value="">Select metal</option>
              {metals.map((metal) => (
                <option key={metal} value={metal}>
                  {metal}
                </option>
              ))}
            </select>
            {errors.metal ? <p className="mt-1 text-xs text-red-400">{errors.metal}</p> : null}
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-300">Upload File (Optional)</label>
            <input
              type="file"
              onChange={(e) => setForm((p) => ({ ...p, file: e.target.files?.[0] || null }))}
              className={`${fieldClass} file:mr-3 file:rounded file:border-0 file:bg-gold file:px-2 file:py-1 file:text-xs file:font-semibold file:text-black`}
            />
            <p className="mt-1 text-xs text-zinc-500">{form.file ? form.file.name : 'No file chosen'}</p>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-zinc-300">Your Requirement</label>
            <textarea
              className={fieldClass}
              value={form.requirement}
              onChange={(e) => setForm((p) => ({ ...p, requirement: e.target.value }))}
              placeholder="Write your requirement..."
              rows={5}
            />
            {errors.requirement ? (
              <p className="mt-1 text-xs text-red-400">{errors.requirement}</p>
            ) : null}
          </div>
          <div className="md:col-span-2 flex flex-wrap gap-3">
            <button
              disabled={sending}
              className="rounded-md bg-gold-cta px-5 py-2.5 font-semibold text-black shadow-gold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/35 border-t-black" />
                  Submitting...
                </span>
              ) : (
                'Submit Quote Request'
              )}
            </button>
            <a
              href="https://wa.me/12125550148"
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-5 py-2.5 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/20"
            >
              Chat on WhatsApp
            </a>
          </div>
        </form>
        {submitted ? (
          <p aria-live="polite" className="mt-4 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            Quote request submitted successfully. Our team will contact you shortly.
          </p>
        ) : null}
        {serverError ? (
          <p aria-live="assertive" className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {serverError}
          </p>
        ) : null}
      </section>
    </MotionReveal>
  );
}
