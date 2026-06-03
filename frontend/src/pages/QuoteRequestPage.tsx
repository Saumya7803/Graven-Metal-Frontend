import { ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { MotionReveal } from '../components/MotionReveal';
import { WebsiteLeadForm } from '../components/leads/WebsiteLeadForm';
import { SEO } from '../components/seo/SEO';

type QuoteRequestState = {
  productName?: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  totalPrice?: number;
  currency?: string;
  requirement?: string;
};

function formatMoney(currency: string | undefined, value: number) {
  void currency;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
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

  return (
    <MotionReveal>
      <SEO
        title="Request a Quote"
        description="Submit your industrial metal requirement to GRAVEN METAL and receive a sourcing response within 24 hours."
        path="/quote-request"
      />

      <section className="relative overflow-hidden border-b border-gold/15 bg-[#03070b] px-4 py-12 sm:px-6 lg:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(218,165,32,0.16),transparent_34%),linear-gradient(180deg,rgba(8,18,28,0.95),rgba(3,7,11,1))]" />
        <div className="relative mx-auto max-w-4xl">
          <div className="max-w-3xl">
            <p className="text-sm text-zinc-500">Home / Request a Quote</p>
            <h1 className="mt-4 font-display text-4xl text-white sm:text-5xl">
              Request a quote for industrial metal supply.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300">
              Tell us what you need and GRAVEN METAL will route your inquiry to the LQT team for qualification,
              pricing support, and sales follow-up.
            </p>

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
        </div>
      </section>

      <WebsiteLeadForm
        initialProduct={productName || undefined}
        initialQuantity={quantity || undefined}
        initialUnit={unitLabel}
        initialRequirement={state?.requirement}
      />
    </MotionReveal>
  );
}
