import { Link } from 'react-router-dom';
import { MotionReveal } from '../../components/MotionReveal';
import { SEO } from '../../components/seo/SEO';

const sections = [
  {
    title: 'Dispatch and Coverage',
    points: [
      'Graven Automations coordinates domestic and cross-border shipment for qualified industrial metal orders based on stock availability and trade compliance.',
      'Dispatch schedules vary by material type, volume, test certification requirements, and customer-approved delivery terms.',
      'Large-volume or custom-grade consignments may require staged dispatch for quality and logistics control.'
    ]
  },
  {
    title: 'Freight, Documentation, and Timelines',
    points: [
      'Shipping charges, insurance scope, and handling terms are finalized within the approved order commercial sheet.',
      'Required documents may include invoices, packing lists, test certificates, transport waybills, and export/import compliance records.',
      'Transit timelines are estimates and may be affected by customs examination, port congestion, weather, and carrier dependencies.'
    ]
  },
  {
    title: 'Receiving and Risk Transfer',
    points: [
      'Customers must ensure unloading readiness, storage infrastructure, and authorized receiving personnel at the delivery point.',
      'Risk transfer follows the mutually agreed delivery term (for example ex-works, FOB, CIF, or delivered basis where contracted).',
      'Any discrepancy must be documented at receipt and shared with Graven Automations support within the contract claim period.'
    ]
  },
  {
    title: 'Failed Delivery and Rescheduling',
    points: [
      'Failed receiving attempts due to customer-side unavailability may incur redelivery, warehousing, or handling charges.',
      'Delivery re-routing or destination changes after dispatch are subject to operational feasibility and incremental cost approval.',
      'Graven Automations reserves the right to revise dispatch plans to maintain safety, legality, and material integrity.'
    ]
  }
];

export function ShippingPolicyPage() {
  return (
    <div className="space-y-6">
      <SEO
        title="Shipping Policy"
        description="Shipping policy for Graven Automations covering industrial metal dispatch, freight terms, global delivery, and receiving responsibilities."
        path="/shipping-policy"
      />

      <MotionReveal>
        <section className="gm-shell p-5 sm:p-6 md:p-8">
          <p className="text-sm text-zinc-500">Home / Policies / Shipping Policy</p>
          <h1 className="mt-3 font-display text-3xl text-white sm:text-4xl">Shipping Policy</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base">
            This Shipping Policy defines how Graven Automations handles logistics planning, dispatch, transit coordination,
            and delivery support for industrial metal transactions.
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
          <h2 className="font-display text-2xl text-white">Shipment Support</h2>
          <p className="mt-2 text-zinc-300">Coordinate delivery schedules and logistics queries directly with our operations team.</p>
          <Link
            to="/contact"
            className="mt-4 inline-flex rounded-md bg-gold-cta px-4 py-2 text-sm font-semibold text-black shadow-gold transition hover:brightness-110"
          >
            Contact Logistics Desk
          </Link>
        </section>
      </MotionReveal>
    </div>
  );
}
