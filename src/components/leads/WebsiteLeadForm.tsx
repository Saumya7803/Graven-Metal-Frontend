import { useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowRight, CheckCircle2, FileUp, Mail, MessageCircle, Phone, Send } from 'lucide-react';
import { getApiErrorMessage } from '../../lib/apiUtils';
import { publicApi, type WebsiteLeadPayload } from '../../lib/publicApi';

type LeadForm = Omit<WebsiteLeadPayload, 'quantity'> & {
  quantity: string;
};

type LeadErrors = Partial<Record<keyof LeadForm, string>>;

const industryTypes = ['Manufacturing', 'Fabrication', 'Automobile', 'Electrical', 'Construction', 'Export', 'Other'];
const productCategories = [
  'Copper Cathodes',
  'Copper Rods',
  'Brass Rods',
  'Aluminium Ingots',
  'Lead Ingots',
  'Custom Requirement',
];
const timelines = ['Immediate', 'Within 7 Days', 'Within 30 Days', 'Future Requirement'];

const initialForm: LeadForm = {
  fullName: '',
  companyName: '',
  designation: '',
  phone: '',
  email: '',
  whatsappNumber: '',
  industryType: '',
  companyLocation: '',
  city: '',
  state: '',
  country: '',
  gstNumber: '',
  product: '',
  quantity: '',
  unit: 'MT',
  deliveryLocation: '',
  requirement: '',
  purchaseTimeline: '',
  preferredContactMethod: 'Phone',
  file: null,
};

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-xs text-red-300">{message}</p> : null;
}

export function WebsiteLeadForm() {
  const [form, setForm] = useState<LeadForm>(initialForm);
  const [errors, setErrors] = useState<LeadErrors>({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState<{ leadId: string } | null>(null);
  const [sending, setSending] = useState(false);

  const update = <K extends keyof LeadForm>(field: K, value: LeadForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const next: LeadErrors = {};
    if (!form.fullName.trim()) next.fullName = 'Full name is required.';
    if (!form.companyName.trim()) next.companyName = 'Company name is required.';
    if (!/^[0-9+\-\s()]{8,}$/.test(form.phone.trim())) next.phone = 'Enter a valid mobile number.';
    if (!/\S+@\S+\.\S+/.test(form.email.trim())) next.email = 'Enter a valid email address.';
    if (!form.industryType) next.industryType = 'Select an industry type.';
    if (!form.companyLocation.trim()) next.companyLocation = 'Company location is required.';
    if (!form.product) next.product = 'Select the required product.';
    if (!Number.isFinite(Number(form.quantity)) || Number(form.quantity) <= 0) {
      next.quantity = 'Required quantity must be greater than zero.';
    }
    if (!form.deliveryLocation.trim()) next.deliveryLocation = 'Delivery location is required.';
    if (!form.requirement.trim()) next.requirement = 'Requirement description is required.';
    if (!form.purchaseTimeline) next.purchaseTimeline = 'Select an expected purchase timeline.';
    return next;
  };

  const submit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSending(true);
    setServerError('');
    setSuccess(null);
    try {
      const lead = await publicApi.submitWebsiteLead({
        ...form,
        quantity: Number(form.quantity),
      });
      setSuccess({ leadId: lead.leadId });
      setForm(initialForm);
      toast.success('Inquiry submitted successfully');
    } catch (error) {
      const message = getApiErrorMessage(error);
      setServerError(message);
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  const fieldClass = 'gm-input mt-1.5';
  const labelClass = 'text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400';

  return (
    <section id="industrial-inquiry" className="scroll-mt-24 border-y border-gold/15 bg-[#050b11] px-4 py-12 sm:px-6 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="rounded-md border border-gold/20 bg-luxury-linear p-5 shadow-halo sm:p-6">
          <p className="text-[11px] uppercase tracking-[0.24em] text-gold">Industrial procurement desk</p>
          <h2 className="mt-3 font-display text-3xl text-white sm:text-4xl">Talk to a metal expert.</h2>
          <p className="mt-4 text-sm leading-7 text-zinc-400">
            Share your material requirement and our sourcing team will review quantity, timeline, and delivery
            location before connecting you with the right specialist.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {[
              ['Request a Quote', 'Share a bulk procurement requirement.', Send],
              ['Get Latest Price', 'Ask for a current sourcing price.', Mail],
              ['Talk to a Metal Expert', 'Discuss grade, volume, and delivery.', Phone],
              ['Submit Your Requirement', 'Create a CRM inquiry for follow-up.', MessageCircle],
            ].map(([title, text, Icon]) => (
              <a
                key={String(title)}
                href="#lead-capture-form"
                className="group flex items-start gap-3 rounded-md border border-white/10 bg-black/20 p-3 transition hover:border-gold/35 hover:bg-gold/5"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded border border-gold/25 bg-gold/10 text-gold">
                  <Icon size={16} />
                </span>
                <span>
                  <strong className="block text-sm text-white">{String(title)}</strong>
                  <span className="mt-1 block text-xs leading-5 text-zinc-500">{String(text)}</span>
                </span>
                <ArrowRight size={14} className="ml-auto mt-2 text-gold transition group-hover:translate-x-0.5" />
              </a>
            ))}
          </div>

          <div className="mt-6 rounded-md border border-emerald-400/20 bg-emerald-400/5 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
              <CheckCircle2 size={16} />
              Direct CRM routing
            </div>
            <p className="mt-2 text-xs leading-5 text-zinc-400">
              Every website inquiry receives a Lead ID and enters the LQT qualification queue automatically.
            </p>
          </div>
        </div>

        <div id="lead-capture-form" className="gm-shell p-4 sm:p-6">
          <div className="relative">
            <p className="text-[11px] uppercase tracking-[0.24em] text-gold">Request a quote</p>
            <h3 className="mt-2 font-display text-3xl text-white">Submit your requirement.</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Fields marked with * are required.</p>

            <form onSubmit={submit} className="mt-6 space-y-6">
              <fieldset>
                <legend className="text-sm font-semibold text-champagne">Contact Information</legend>
                <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <label>
                    <span className={labelClass}>Full Name *</span>
                    <input className={fieldClass} value={form.fullName} onChange={(e) => update('fullName', e.target.value)} autoComplete="name" />
                    <FieldError message={errors.fullName} />
                  </label>
                  <label>
                    <span className={labelClass}>Company Name *</span>
                    <input className={fieldClass} value={form.companyName} onChange={(e) => update('companyName', e.target.value)} autoComplete="organization" />
                    <FieldError message={errors.companyName} />
                  </label>
                  <label>
                    <span className={labelClass}>Designation</span>
                    <input className={fieldClass} value={form.designation} onChange={(e) => update('designation', e.target.value)} />
                  </label>
                  <label>
                    <span className={labelClass}>Mobile Number *</span>
                    <input className={fieldClass} value={form.phone} onChange={(e) => update('phone', e.target.value)} type="tel" autoComplete="tel" />
                    <FieldError message={errors.phone} />
                  </label>
                  <label>
                    <span className={labelClass}>Email Address *</span>
                    <input className={fieldClass} value={form.email} onChange={(e) => update('email', e.target.value)} type="email" autoComplete="email" />
                    <FieldError message={errors.email} />
                  </label>
                  <label>
                    <span className={labelClass}>WhatsApp Number</span>
                    <input className={fieldClass} value={form.whatsappNumber} onChange={(e) => update('whatsappNumber', e.target.value)} type="tel" />
                  </label>
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-semibold text-champagne">Business Information</legend>
                <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <label>
                    <span className={labelClass}>Industry Type *</span>
                    <select className={fieldClass} value={form.industryType} onChange={(e) => update('industryType', e.target.value)}>
                      <option value="">Select industry</option>
                      {industryTypes.map((item) => <option key={item}>{item}</option>)}
                    </select>
                    <FieldError message={errors.industryType} />
                  </label>
                  <label className="lg:col-span-2">
                    <span className={labelClass}>Company Location *</span>
                    <input className={fieldClass} value={form.companyLocation} onChange={(e) => update('companyLocation', e.target.value)} />
                    <FieldError message={errors.companyLocation} />
                  </label>
                  <label>
                    <span className={labelClass}>City</span>
                    <input className={fieldClass} value={form.city} onChange={(e) => update('city', e.target.value)} />
                  </label>
                  <label>
                    <span className={labelClass}>State</span>
                    <input className={fieldClass} value={form.state} onChange={(e) => update('state', e.target.value)} />
                  </label>
                  <label>
                    <span className={labelClass}>Country</span>
                    <input className={fieldClass} value={form.country} onChange={(e) => update('country', e.target.value)} />
                  </label>
                  <label>
                    <span className={labelClass}>GST Number</span>
                    <input className={fieldClass} value={form.gstNumber} onChange={(e) => update('gstNumber', e.target.value)} />
                  </label>
                  <label>
                    <span className={labelClass}>Preferred Contact</span>
                    <select className={fieldClass} value={form.preferredContactMethod} onChange={(e) => update('preferredContactMethod', e.target.value)}>
                      {['Phone', 'Email', 'WhatsApp'].map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-semibold text-champagne">Requirement Information</legend>
                <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <label>
                    <span className={labelClass}>Product Category *</span>
                    <select className={fieldClass} value={form.product} onChange={(e) => update('product', e.target.value)}>
                      <option value="">Select product</option>
                      {productCategories.map((item) => <option key={item}>{item}</option>)}
                    </select>
                    <FieldError message={errors.product} />
                  </label>
                  <label>
                    <span className={labelClass}>Required Quantity *</span>
                    <input className={fieldClass} value={form.quantity} onChange={(e) => update('quantity', e.target.value)} type="number" min="0.01" step="0.01" />
                    <FieldError message={errors.quantity} />
                  </label>
                  <label>
                    <span className={labelClass}>Unit *</span>
                    <select className={fieldClass} value={form.unit} onChange={(e) => update('unit', e.target.value)}>
                      {['Kg', 'MT', 'Ton'].map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                  <label className="sm:col-span-2">
                    <span className={labelClass}>Required Delivery Location *</span>
                    <input className={fieldClass} value={form.deliveryLocation} onChange={(e) => update('deliveryLocation', e.target.value)} />
                    <FieldError message={errors.deliveryLocation} />
                  </label>
                  <label>
                    <span className={labelClass}>Expected Purchase Timeline *</span>
                    <select className={fieldClass} value={form.purchaseTimeline} onChange={(e) => update('purchaseTimeline', e.target.value)}>
                      <option value="">Select timeline</option>
                      {timelines.map((item) => <option key={item}>{item}</option>)}
                    </select>
                    <FieldError message={errors.purchaseTimeline} />
                  </label>
                  <label className="sm:col-span-2 lg:col-span-3">
                    <span className={labelClass}>Requirement Description *</span>
                    <textarea className={fieldClass} rows={4} value={form.requirement} onChange={(e) => update('requirement', e.target.value)} />
                    <FieldError message={errors.requirement} />
                  </label>
                  <label className="sm:col-span-2 lg:col-span-3">
                    <span className={labelClass}>Upload RFQ / Specification Document</span>
                    <input
                      className={`${fieldClass} file:mr-3 file:rounded file:border-0 file:bg-gold file:px-2 file:py-1 file:text-xs file:font-semibold file:text-black`}
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.webp"
                      onChange={(e) => update('file', e.target.files?.[0] || null)}
                    />
                    <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500"><FileUp size={13} /> Maximum file size: 10 MB</p>
                  </label>
                </div>
              </fieldset>

              <button disabled={sending} className="inline-flex w-full items-center justify-center gap-2 rounded bg-gold-cta px-5 py-3 text-sm font-bold text-black shadow-gold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
                {sending ? 'Submitting Inquiry...' : 'Submit Your Requirement'}
                <ArrowRight size={15} />
              </button>
            </form>

            {success ? (
              <div aria-live="polite" className="mt-5 rounded-md border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-200">
                <p className="font-semibold">Thank you for your inquiry. Our metal sourcing team will review your requirement and contact you within 24 hours.</p>
                <p className="mt-1 text-xs text-emerald-300">Lead reference: {success.leadId}</p>
              </div>
            ) : null}
            {serverError ? (
              <p aria-live="assertive" className="mt-5 rounded-md border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{serverError}</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
