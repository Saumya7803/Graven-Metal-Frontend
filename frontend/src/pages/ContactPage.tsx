import { useState } from 'react';
import toast from 'react-hot-toast';
import { MotionReveal } from '../components/MotionReveal';
import { SEO } from '../components/seo/SEO';
import { getApiErrorMessage } from '../lib/apiUtils';
import { publicApi } from '../lib/publicApi';
import { companyDetails } from '../data/demoContent';

type ContactForm = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

type ContactErrors = Partial<Record<keyof ContactForm, string>>;

export function ContactPage() {
  const [form, setForm] = useState<ContactForm>({ name: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const [sending, setSending] = useState(false);

  const validate = () => {
    const next: ContactErrors = {};
    if (!form.name.trim()) next.name = 'Full name is required.';
    if (!/\S+@\S+\.\S+/.test(form.email)) next.email = 'Valid email is required.';
    if (!/^[0-9+\-\s]{8,}$/.test(form.phone)) next.phone = 'Valid phone number is required.';
    if (!form.message.trim()) next.message = 'Message is required.';
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
      await publicApi.submitContact({
        fullName: form.name,
        email: form.email,
        phone: form.phone,
        subject: '',
        message: form.message,
      });
      setSubmitted(true);
      toast.success('Message sent successfully');
      setForm({ name: '', email: '', phone: '', message: '' });
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
    <div className="bg-[#03070b]">
      <SEO
        title="Contact"
        description="Contact GRAVEN METAL for premium metal requirements, quotes, and support."
        path="/contact"
      />
      <MotionReveal>
        <section className="relative min-h-[calc(100svh-121px)] overflow-hidden border-b border-gold/15 bg-[#050a0f]">
          <div className="absolute inset-0">
            <img
              src="/imgs/background.png"
              alt="Molten metal"
              className="h-full w-full object-cover object-[72%_center] opacity-70"
              decoding="async"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#03070b_0%,rgba(3,7,11,0.96)_42%,rgba(3,7,11,0.72)_68%,rgba(3,7,11,0.34)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,7,11,0.18)_0%,rgba(3,7,11,0.58)_62%,rgba(3,7,11,0.94)_100%)]" />
          </div>

          <div className="relative z-10 mx-auto grid min-h-[calc(100svh-121px)] max-w-7xl items-center gap-6 px-5 py-8 sm:px-7 md:px-10 lg:grid-cols-[0.86fr_1.14fr]">
            <div className="max-w-[520px]">
              <p className="text-sm text-zinc-500">Home / Contact Us</p>
              <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-gold">Contact Graven Metal</p>
              <h1 className="mt-4 text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl">
                Get In Touch
              </h1>
              <p className="mt-5 max-w-md text-base leading-7 text-zinc-300 sm:text-lg">
                We are here to help with premium metal requirements, bulk procurement, and fast quotes.
              </p>

              <div className="mt-6 grid gap-3 text-sm">
                <p className="rounded-lg border border-gold/15 bg-black/35 px-4 py-3 text-zinc-300 backdrop-blur-md">
                  <span className="text-gold">Phone:</span> {companyDetails.phone}
                </p>
                <p className="rounded-lg border border-gold/15 bg-black/35 px-4 py-3 text-zinc-300 backdrop-blur-md">
                  <span className="text-gold">Support:</span> {companyDetails.supportPhone}
                </p>
                <p className="rounded-lg border border-gold/15 bg-black/35 px-4 py-3 text-zinc-300 backdrop-blur-md">
                  <span className="text-gold">Email:</span> {companyDetails.email}
                </p>
                <p className="rounded-lg border border-gold/15 bg-black/35 px-4 py-3 text-zinc-300 backdrop-blur-md">
                  <span className="text-gold">Address:</span> {companyDetails.indiaOffice}
                </p>
              </div>

              <a
                href="https://wa.me/917905350134"
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/20"
              >
                WhatsApp Chat
              </a>
            </div>

            <form onSubmit={onSubmit} className="rounded-xl border border-gold/20 bg-[#0b0f13]/94 p-4 shadow-panel backdrop-blur-md md:p-6">
              <h2 className="font-display text-2xl text-white">Send Us a Message</h2>
              <div className="mt-4 space-y-3">
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
                  <label className="mb-1 block text-sm text-zinc-300">Email</label>
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
                  <label className="mb-1 block text-sm text-zinc-300">Your Message</label>
                  <textarea
                    className={fieldClass}
                    value={form.message}
                    onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    placeholder="Write your message..."
                    rows={5}
                  />
                  {errors.message ? <p className="mt-1 text-xs text-red-400">{errors.message}</p> : null}
                </div>
                <button
                  disabled={sending}
                  className="w-full rounded-md bg-gold-cta px-5 py-2.5 font-semibold text-black shadow-gold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sending ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/35 border-t-black" />
                      Sending...
                    </span>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </div>
              {submitted ? (
                <p aria-live="polite" className="mt-4 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                  Message sent successfully. We will respond soon.
                </p>
              ) : null}
              {serverError ? (
                <p aria-live="assertive" className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {serverError}
                </p>
              ) : null}
            </form>
          </div>
        </section>
      </MotionReveal>

      <MotionReveal delay={0.08}>
        <section className="border-b border-gold/20 bg-[#070b10] px-4 py-6 shadow-panel md:px-8 md:py-8">
          <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2">
            <article className="overflow-hidden rounded-xl border border-gold/20 bg-[#0b0f13]">
              <p className="border-b border-gold/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-gold">
                Lucknow Office
              </p>
              <iframe
                title="Graven Metal Lucknow Office Location"
                src="https://maps.google.com/maps?q=8/61%20Sector-8%20Jankipuram%20Extension%20Lucknow-226021%20India&t=&z=15&ie=UTF8&iwloc=&output=embed"
                className="h-72 w-full border-0 md:h-80"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </article>
            <article className="overflow-hidden rounded-xl border border-gold/20 bg-[#0b0f13]">
              <p className="border-b border-gold/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-gold">
                Delhi Office
              </p>
              <iframe
                title="Graven Metal Delhi Office Location"
                src="https://maps.google.com/maps?q=7/25%20Tower%20F%202nd%20Floor%20Kirti%20Nagar%20New%20Delhi-110015%20India&t=&z=15&ie=UTF8&iwloc=&output=embed"
                className="h-72 w-full border-0 md:h-80"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </article>
          </div>
        </section>
      </MotionReveal>
    </div>
  );
}
