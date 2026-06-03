import { ArrowRight, CheckCircle2 } from 'lucide-react';
<<<<<<< HEAD
import { Link } from 'react-router-dom';
=======
import { Link, useLocation } from 'react-router-dom';
>>>>>>> frontend-live/main
import { MotionReveal } from '../components/MotionReveal';
import { WebsiteLeadForm } from '../components/leads/WebsiteLeadForm';
import { SEO } from '../components/seo/SEO';

<<<<<<< HEAD
=======
type QuoteRequestState = {
  productName?: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  totalPrice?: number;
  currency?: string;
  requirement?: string;
};

>>>>>>> frontend-live/main
const steps = [
  { role: 'ADMIN', step: 'Uploads Products' },
  { role: 'BUYER', step: 'Requests Quote' },
  { role: 'SALES', step: 'Receives RFQ' },
  { role: 'PROCUREMENT', step: 'Gets Supplier Cost' },
  { role: 'SALES', step: 'Creates Quotation' },
  { role: 'BUYER', step: 'Accepts' },
  { role: 'SUPPLIER', step: 'Supplies Material' },
  { role: '', step: 'Order Completed' },
] as const;

const nqtSteps = [
  'Qualified Lead',
  'Sales Executive',
  'RFQ',
  'Procurement',
  'Quotation',
  'Negotiation',
  'Order',
  'Payment',
  'Delivery',
] as const;

<<<<<<< HEAD
export function QuoteRequestPage() {
=======
function formatMoney(currency: string | undefined, value: number) {
  void currency;
  const normalized = 'USD';
  const locale = 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: normalized,
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function QuoteRequestPage() {
  const location = useLocation();
  const state = (location.state as QuoteRequestState | null | undefined) || undefined;
  const productName = state?.productName || '';
  const quantity = state?.quantity || 0;
  const unitLabel = state?.unit || 'Kg';
  const unitPrice = state?.unitPrice || 0;
  const totalPrice = state?.totalPrice || (quantity && unitPrice ? quantity * unitPrice : 0);
  const currency = 'USD';

>>>>>>> frontend-live/main
  return (
    <MotionReveal>
      <SEO
        title="Request a Quote"
        description="Submit your industrial metal requirement to GRAVEN METAL and receive a sourcing response within 24 hours."
        path="/quote-request"
      />

      <section className="relative overflow-hidden border-b border-gold/15 bg-[#03070b] px-4 py-12 sm:px-6 lg:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(218,165,32,0.16),transparent_34%),linear-gradient(180deg,rgba(8,18,28,0.95),rgba(3,7,11,1))]" />
        <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm text-zinc-500">Home / Request a Quote</p>
            <h1 className="mt-4 font-display text-4xl text-white sm:text-5xl">
              Request a quote for industrial metal supply.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300">
              Tell us what you need and GRAVEN METAL will route your inquiry to the LQT team for qualification,
              pricing support, and sales follow-up.
            </p>
<<<<<<< HEAD
=======
            {productName ? (
              <div className="mt-6 max-w-2xl rounded-2xl border border-gold/20 bg-black/25 p-4 shadow-halo">
                <p className="text-[11px] uppercase tracking-[0.24em] text-gold">Selected from product page</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-[#05080d] px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Product</p>
                    <p className="mt-1 text-sm font-semibold text-white">{productName}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#05080d] px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Quantity</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {quantity} {unitLabel}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#05080d] px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Total</p>
                    <p className="mt-1 text-sm font-semibold text-white">{formatMoney(currency, totalPrice)}</p>
                  </div>
                </div>
                {state?.requirement ? <p className="mt-3 text-sm leading-6 text-zinc-300">{state.requirement}</p> : null}
              </div>
            ) : null}
>>>>>>> frontend-live/main
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#lead-capture-form"
                className="inline-flex items-center gap-2 rounded bg-gold-cta px-5 py-3 text-sm font-bold text-black shadow-gold hover:brightness-110"
              >
                Submit Your Requirement <ArrowRight size={15} />
              </a>
              <Link
                to="/products"
                className="inline-flex items-center rounded border border-gold/35 bg-black/20 px-5 py-3 text-sm font-semibold text-gold hover:border-gold"
              >
                View Products
              </Link>
            </div>
          </div>

          <div className="rounded-md border border-gold/20 bg-[#071018]/90 p-5 shadow-halo backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
              <CheckCircle2 size={17} />
              Lead Processing
            </div>
            <div className="mt-5 space-y-6">
              <div className="rounded-2xl border border-gold/15 bg-black/20 p-4">
                <div className="grid gap-3">
                  {steps.map((item, index) => (
                    <div key={`${item.role}-${item.step}`} className="grid gap-3 sm:grid-cols-[120px_24px_1fr] sm:items-center">
                      <div className="rounded-xl border border-gold/20 bg-gold/10 px-3 py-2 text-center text-xs font-bold tracking-[0.18em] text-gold">
                        {item.role || 'FINAL'}
                      </div>
                      <div className="grid place-items-center text-gold/70">
                        {index === steps.length - 1 ? (
                          <span className="h-2 w-2 rounded-full bg-gold/70" />
                        ) : (
                          <span className="text-lg leading-none">↓</span>
                        )}
                      </div>
                      <div className="rounded-xl border border-white/10 bg-[#05080d] px-4 py-3">
                        <p className="text-sm font-semibold text-white">{item.step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gold/15 bg-black/20 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Lead Management (NQT)</p>
                <div className="mt-4 grid gap-3">
                  {nqtSteps.map((step, index) => (
                    <div key={step} className="grid gap-3 sm:grid-cols-[1fr_24px] sm:items-center">
                      <div className="rounded-xl border border-white/10 bg-[#05080d] px-4 py-3">
                        <p className="text-sm font-semibold text-white">{step}</p>
                      </div>
                      <div className="grid place-items-center text-gold/70">
                        {index === nqtSteps.length - 1 ? (
                          <span className="h-2 w-2 rounded-full bg-gold/70" />
                        ) : (
                          <span className="text-lg leading-none">↓</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

<<<<<<< HEAD
      <WebsiteLeadForm />
=======
      <WebsiteLeadForm
        initialProduct={productName || undefined}
        initialQuantity={quantity || undefined}
        initialUnit={unitLabel}
        initialRequirement={state?.requirement}
      />
>>>>>>> frontend-live/main
    </MotionReveal>
  );
}
