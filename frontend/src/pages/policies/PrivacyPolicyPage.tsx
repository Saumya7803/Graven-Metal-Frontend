import { Link } from 'react-router-dom';
import { MotionReveal } from '../../components/MotionReveal';
import { SEO } from '../../components/seo/SEO';

const sections = [
  {
    title: 'Information We Collect',
    points: [
      'Graven Metals collects business contact data, company registration details, tax information, and procurement preferences when you request quotes or place orders for industrial metals.',
      'Technical data such as device type, browser activity, and inquiry timestamps may be processed to secure our platform and improve response quality.',
      'Payment and shipping records are retained for invoicing, customs documentation, compliance audits, and contractual fulfillment.'
    ]
  },
  {
    title: 'How We Use Data',
    points: [
      'To issue quotations, confirm product specifications, arrange supply schedules, and manage order execution for metal trading operations.',
      'To process payments, verify transactions, and maintain lawful accounting records across domestic and international trade channels.',
      'To provide shipment updates, support escalation, quality documentation, and post-delivery commercial communication.'
    ]
  },
  {
    title: 'Data Sharing and Security',
    points: [
      'Data may be shared only with logistics partners, payment processors, customs agents, and regulatory authorities involved in legitimate order processing.',
      'Graven Metals applies controlled access, secure storage practices, and operational safeguards to protect business information from unauthorized use.',
      'We do not sell customer data to unrelated third parties.'
    ]
  },
  {
    title: 'Retention and Your Rights',
    points: [
      'Commercial records are retained for legal, tax, quality, and dispute-management obligations under applicable trade laws.',
      'You may request access, correction, or deletion of eligible personal data by contacting our compliance team.',
      'Where deletion is restricted by law or ongoing contractual obligations, Graven Metals will retain only what is required.'
    ]
  }
];

export function PrivacyPolicyPage() {
  return (
    <div className="space-y-6">
      <SEO
        title="Privacy Policy"
        description="Privacy policy for Graven Metals covering industrial metal trade inquiries, orders, payments, and shipment operations."
        path="/privacy-policy"
      />

      <MotionReveal>
        <section className="gm-shell p-5 sm:p-6 md:p-8">
          <p className="text-sm text-zinc-500">Home / Policies / Privacy Policy</p>
          <h1 className="mt-3 font-display text-3xl text-white sm:text-4xl">Privacy Policy</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base">
            This Privacy Policy explains how Graven Metals manages information in connection with industrial metal sourcing,
            quotations, orders, logistics, payments, and customer support operations.
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
          <h2 className="font-display text-2xl text-white">Need Clarification?</h2>
          <p className="mt-2 text-zinc-300">For privacy, compliance, or document requests, contact Graven Metals support.</p>
          <Link
            to="/contact"
            className="mt-4 inline-flex rounded-md bg-gold-cta px-4 py-2 text-sm font-semibold text-black shadow-gold transition hover:brightness-110"
          >
            Contact Graven Metals
          </Link>
        </section>
      </MotionReveal>
    </div>
  );
}
