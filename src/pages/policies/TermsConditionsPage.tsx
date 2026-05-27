import { Link } from 'react-router-dom';
import { MotionReveal } from '../../components/MotionReveal';
import { SEO } from '../../components/seo/SEO';

const sections = [
  {
    title: 'Acceptance and Contract Scope',
    points: [
      'By placing an order or accepting a quotation from GRAVEN METALs, you agree to these Terms & Conditions for industrial metal trading transactions.',
      'All purchase terms are governed by the approved quotation, proforma invoice, technical specification sheet, and confirmed delivery terms.',
      'Any conflicting buyer terms apply only when expressly accepted in writing by GRAVEN METALs.'
    ]
  },
  {
    title: 'Orders, Pricing, and Payment',
    points: [
      'Prices are subject to metal-market movement, currency variation, and freight adjustments until order confirmation.',
      'Payment timelines, advance requirements, and credit terms are defined per order and must be fulfilled before dispatch where applicable.',
      'Late payments may result in shipment hold, cancellation rights, and applicable recovery charges.'
    ]
  },
  {
    title: 'Quality, Inspection, and Customer Responsibility',
    points: [
      'GRAVEN METALs supplies materials according to declared grade, dimensions, and certification parameters agreed at booking.',
      'Customers must inspect deliveries promptly and report shortages, transit damage, or quality concerns within the specified claim window.',
      'Improper handling, storage, fabrication variance, or misuse after delivery remains the buyer\'s responsibility.'
    ]
  },
  {
    title: 'Liability and Legal Terms',
    points: [
      'GRAVEN METALs is not liable for indirect, incidental, or consequential losses arising from delayed projects, downstream operations, or market fluctuation.',
      'Force majeure events, including regulatory disruptions, port delays, and transport interruptions, may impact schedules without penalty.',
      'Any dispute will be handled under applicable law and competent jurisdiction as communicated in the governing contract documents.'
    ]
  }
];

export function TermsConditionsPage() {
  return (
    <div className="space-y-6">
      <SEO
        title="Terms & Conditions"
        description="Terms and conditions for GRAVEN METALs industrial metal supply, orders, payments, and legal responsibilities."
        path="/terms-conditions"
      />

      <MotionReveal>
        <section className="gm-shell p-5 sm:p-6 md:p-8">
          <p className="text-sm text-zinc-500">Home / Policies / Terms & Conditions</p>
          <h1 className="mt-3 font-display text-3xl text-white sm:text-4xl">Terms & Conditions</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base">
            These Terms & Conditions govern commercial engagements with GRAVEN METALs for sourcing, procurement,
            processing, and delivery of industrial metals.
          </p>

          <div className="mt-7 grid gap-4">
            {sections.map((section) => (
              <article key={section.title} className="rounded-xl border border-gold/15 bg-[#090f14] p-4 sm:p-5">
                <h2 className="font-display text-xl text-white">{section.title}</h2>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-zinc-300 sm:text-[0.95rem]">
                  {section.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </MotionReveal>

      <MotionReveal delay={0.08}>
        <section className="rounded-2xl border border-gold/20 bg-gradient-to-r from-[#1a1308] via-[#0f1319] to-[#090d12] p-5 shadow-panel sm:p-6">
          <h2 className="font-display text-2xl text-white">Commercial Assistance</h2>
          <p className="mt-2 text-zinc-300">Need clarification on clauses before confirming your order? Our team can help.</p>
          <Link
            to="/contact"
            className="mt-4 inline-flex rounded-md bg-gold-cta px-4 py-2 text-sm font-semibold text-black shadow-gold transition hover:brightness-110"
          >
            Speak With Sales
          </Link>
        </section>
      </MotionReveal>
    </div>
  );
}
