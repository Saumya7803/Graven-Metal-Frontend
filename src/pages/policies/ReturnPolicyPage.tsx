import { Link } from 'react-router-dom';
import { MotionReveal } from '../../components/MotionReveal';
import { SEO } from '../../components/seo/SEO';

const sections = [
  {
    title: 'Eligible Return Scenarios',
    points: [
      'Returns are considered only for verified supply variance, quantity mismatch, or transit-documented damage against approved order specifications.',
      'Custom-cut, made-to-order, processed, or specially sourced metal lots are generally non-returnable unless quality non-conformance is established.',
      'Return eligibility requires complete traceability, including lot details, delivery proof, and handling records.'
    ]
  },
  {
    title: 'Claim Window and Evidence',
    points: [
      'Customers must raise return claims within the period communicated in the relevant order documents, along with supporting photographs and inspection notes.',
      'Material must remain in original received condition and not be consumed, modified, or mixed with third-party stock before evaluation.',
      'GRAVEN METALs may request independent test reports where technical grade disputes arise.'
    ]
  },
  {
    title: 'Resolution and Commercial Treatment',
    points: [
      'Approved claims may be resolved through replacement supply, credit note, corrective commercial adjustment, or refund as contractually appropriate.',
      'Any reverse logistics arrangement will be communicated by GRAVEN METALs after claim acceptance and verification.',
      'Refund timelines depend on banking cycles, document closure, and reconciliation of related trade invoices.'
    ]
  },
  {
    title: 'Customer Obligations and Exclusions',
    points: [
      'Improper storage, corrosion due to handling conditions, unauthorized processing, or delayed reporting can invalidate return requests.',
      'Normal manufacturing tolerances and agreed grade variations do not qualify as return defects unless outside documented limits.',
      'GRAVEN METALs reserves final determination rights based on objective inspection and contractual commitments.'
    ]
  }
];

export function ReturnPolicyPage() {
  return (
    <div className="space-y-6">
      <SEO
        title="Return Policy"
        description="Return policy for GRAVEN METALs detailing claim eligibility, industrial metal inspection, refunds, and replacement terms."
        path="/return-policy"
      />

      <MotionReveal>
        <section className="gm-shell p-5 sm:p-6 md:p-8">
          <p className="text-sm text-zinc-500">Home / Policies / Return Policy</p>
          <h1 className="mt-3 font-display text-3xl text-white sm:text-4xl">Return Policy</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base">
            This Return Policy outlines the process for reporting and resolving approved return matters for industrial
            metal orders supplied by GRAVEN METALs.
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
          <h2 className="font-display text-2xl text-white">Returns Assistance</h2>
          <p className="mt-2 text-zinc-300">Submit your claim with dispatch references for faster validation and resolution.</p>
          <Link
            to="/contact"
            className="mt-4 inline-flex rounded-md bg-gold-cta px-4 py-2 text-sm font-semibold text-black shadow-gold transition hover:brightness-110"
          >
            Raise a Support Request
          </Link>
        </section>
      </MotionReveal>
    </div>
  );
}
