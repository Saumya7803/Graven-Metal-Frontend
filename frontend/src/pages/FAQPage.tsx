import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { demoFaq } from '../data/demoContent';
import { MotionReveal } from '../components/MotionReveal';
import { SEO } from '../components/seo/SEO';

export function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <div className="space-y-6">
      <SEO
        title="FAQ"
        description="Answers to common questions about GRAVEN AUTOMATION products, purity, and delivery."
        path="/faq"
      />

      <MotionReveal>
        <section className="gm-shell p-4 sm:p-5 md:p-7">
          <p className="text-sm text-zinc-500">Home / FAQ</p>
          <h1 className="mt-3 font-display text-3xl text-white sm:text-4xl">Frequently Asked Questions</h1>
          <p className="mt-2 text-zinc-400">
            Find answers to common questions about our products and services.
          </p>

          <div className="mt-6 space-y-3">
            {demoFaq.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <article key={item.q} className="rounded-lg border border-gold/20 bg-[#0b0f13] shadow-panel">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${index}`}
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  >
                    <span className="font-medium text-zinc-100">{item.q}</span>
                    <span className="text-gold">{isOpen ? '-' : '+'}</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        id={`faq-panel-${index}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p className="border-t border-gold/10 px-4 py-3 text-sm text-zinc-400">{item.a}</p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </article>
              );
            })}
          </div>
        </section>
      </MotionReveal>

      <MotionReveal delay={0.08}>
        <section className="rounded-2xl border border-gold/20 bg-gradient-to-r from-[#221709] via-[#10131a] to-[#0a0d11] p-5 shadow-panel sm:p-6">
          <h2 className="font-display text-2xl text-white">Still have questions?</h2>
          <p className="mt-2 text-zinc-300">Our team is here to guide you.</p>
          <Link
            to="/contact"
            className="mt-4 inline-flex rounded-md bg-gold-cta px-4 py-2 text-sm font-semibold text-black shadow-gold transition hover:brightness-110"
          >
            Contact Us
          </Link>
        </section>
      </MotionReveal>
    </div>
  );
}
