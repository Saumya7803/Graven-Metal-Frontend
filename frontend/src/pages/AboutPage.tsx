import { motion } from 'framer-motion';
import { Award, Globe2, ShieldCheck, Users } from 'lucide-react';
import { MotionReveal } from '../components/MotionReveal';
import { SEO } from '../components/seo/SEO';
import { companyDetails, demoCompanyStats } from '../data/demoContent';

const stats = demoCompanyStats;

const pillars = [
  {
    title: 'Our Mission',
    text: companyDetails.mission,
  },
  {
    title: 'Our Vision',
    text: companyDetails.vision,
  },
  {
    title: 'Our Values',
    text: companyDetails.values,
  },
];

const statIcons = [Users, Globe2, Award, ShieldCheck];

export function AboutPage() {
  return (
    <div className="bg-[#03070b]">
      <SEO
        title="About Us"
        description="Learn about GRAVEN AUTOMATION mission, vision, values, and industrial automation expertise."
        path="/about"
      />
      <MotionReveal>
        <section className="relative min-h-[calc(100svh-121px)] overflow-hidden border-b border-gold/15 bg-[#050a0f]">
          <div className="absolute inset-0">
            <img
              src="/imgs/about%20page.png"
              alt="Molten metal foundry"
              className="h-full w-full object-cover object-[72%_center] opacity-95"
              decoding="async"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#03070b_0%,rgba(3,7,11,0.98)_33%,rgba(3,7,11,0.76)_53%,rgba(3,7,11,0.2)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,7,11,0.18)_0%,rgba(3,7,11,0.48)_55%,rgba(3,7,11,0.92)_100%)]" />
          </div>

          <div className="relative z-10 mx-auto flex min-h-[calc(100svh-121px)] max-w-7xl flex-col justify-between px-5 py-8 sm:px-7 md:px-10 md:py-10">
            <div className="grid flex-1 items-center gap-8 py-4 lg:grid-cols-[0.82fr_1.18fr]">
              <div className="max-w-[540px]">
                <p className="text-sm text-zinc-500">Home / About Us</p>
                <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-gold">
                  About Graven Automation
                </p>
                <h1 className="mt-4 text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl">
                  Forging Strength.
                  <br />
                  Delivering Excellence.
                </h1>
                <p className="mt-5 max-w-md text-base leading-7 text-zinc-300 sm:text-lg">
                  Graven Automation delivers industrial automation solutions tailored for modern manufacturing,
                  helping businesses improve efficiency, precision, and reliability at scale.
                </p>
                <p className="mt-4 text-sm font-medium text-zinc-300">
                  Trusted by global industries and manufacturing leaders.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  {stats.map((stat, index) => {
                    const Icon = statIcons[index] || ShieldCheck;
                    return (
                      <div key={stat.label} className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold/30 bg-black/40 text-gold shadow-insetgold">
                          <Icon size={17} />
                        </span>
                        <span>
                          <strong className="block text-lg leading-none text-white">{stat.value}</strong>
                          <span className="text-xs text-zinc-400">{stat.label}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="hidden lg:block" />
            </div>

            <section className="grid gap-3 pb-1 md:grid-cols-3">
              {pillars.map((pillar, index) => (
                <motion.article
                  key={pillar.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="rounded-lg border border-gold/15 bg-[#0a1016]/92 p-5 shadow-panel backdrop-blur-md"
                >
                  <h2 className="text-lg font-bold text-gold">{pillar.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{pillar.text}</p>
                </motion.article>
              ))}
            </section>
          </div>
        </section>
      </MotionReveal>
    </div>
  );
}
