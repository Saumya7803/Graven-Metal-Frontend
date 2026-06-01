import { ArrowRight, CheckCircle2, ClipboardCheck, ShieldCheck, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MotionReveal } from '../components/MotionReveal';
import { WebsiteLeadForm } from '../components/leads/WebsiteLeadForm';
import { SEO } from '../components/seo/SEO';

const steps = [
  ['Submit Requirement', 'Share product, quantity, delivery location, and timeline.', ClipboardCheck],
  ['LQT Qualification', 'Our team verifies buyer details and requirement readiness.', ShieldCheck],
  ['Sales Follow-up', 'The right sales executive follows up with quotation and dispatch support.', Truck],
] as const;

export function QuoteRequestPage() {
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
              Lead workflow
            </div>
            <div className="mt-5 grid gap-3">
              {steps.map(([title, text, Icon], index) => (
                <div key={title} className="grid grid-cols-[auto_1fr] gap-4 border border-white/10 bg-black/20 p-4">
                  <span className="grid h-10 w-10 place-items-center rounded border border-gold/25 bg-gold/10 text-gold">
                    <Icon size={18} />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Step {index + 1}</p>
                    <h2 className="mt-1 font-semibold text-white">{title}</h2>
                    <p className="mt-1 text-sm leading-6 text-zinc-400">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <WebsiteLeadForm />
    </MotionReveal>
  );
}
