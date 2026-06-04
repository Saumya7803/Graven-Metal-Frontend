import { motion } from 'framer-motion';
import { ArrowRight, Award, Eye, ShieldCheck, Target, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MotionReveal } from '../components/MotionReveal';
import { SEO } from '../components/seo/SEO';

const heroStats = [
  { value: '10K+', label: 'Happy Clients', icon: Users },
  { value: '1000+', label: 'Trusted Suppliers', icon: Award },
  { value: '25+', label: 'Countries Delivered', icon: ShieldCheck },
  { value: '100%', label: 'Quality Assured', icon: Eye },
];

const pillars = [
  {
    title: 'Our Mission',
    icon: Target,
    text: 'To deliver premium quality metals with integrity, precision, and reliable service for every project.',
  },
  {
    title: 'Our Vision',
    icon: Eye,
    text: 'To become a trusted global supplier known for strength, consistency, and customer confidence.',
  },
  {
    title: 'Our Values',
    icon: ShieldCheck,
    text: 'Quality, trust, innovation, and customer satisfaction guide every order and every delivery.',
  },
];

export function AboutPage() {
  return (
    <div className="bg-[#03070b]">
      <SEO
        title="About Us"
        description="Learn about GRAVEN METAL, our mission, vision, values, and premium metal supply expertise."
        path="/about"
      />
      <MotionReveal>
        <section className="relative min-h-[calc(100svh-121px)] overflow-hidden bg-[#04070b]">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,7,11,0.14)_0%,rgba(3,7,11,0.68)_60%,rgba(3,7,11,0.96)_100%)]" />

          <div className="relative z-10 mx-auto flex min-h-[calc(100svh-121px)] max-w-[1600px] flex-col px-4 py-6 sm:px-6 lg:px-8">
            <div className="grid flex-1 gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
              <div className="flex min-h-[44vh] flex-col justify-center lg:min-h-[74vh]">
                <p className="text-sm text-zinc-500">Home / About Us</p>
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-gold">About Graven Metal</p>
                <h1 className="mt-4 max-w-[10ch] text-4xl font-extrabold leading-[1.03] text-white sm:text-5xl lg:text-6xl xl:text-[4.75rem]">
                  Building Strength.
                  <br />
                  Delivering Trust.
                </h1>
                <p className="mt-6 max-w-xl text-base leading-8 text-zinc-300 sm:text-lg">
                  Graven Metal is a leading global supplier of premium quality metals. We ensure 100% purity,
                  competitive pricing, and timely delivery.
                </p>
                <p className="mt-4 text-sm font-medium text-zinc-400">Trusted by industries worldwide.</p>

                <div className="mt-7 grid max-w-2xl gap-3 sm:grid-cols-2">
                  {heroStats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={stat.label}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/18 px-4 py-3"
                      >
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/25 bg-gold/10 text-gold">
                          <Icon size={17} />
                        </span>
                        <div>
                          <strong className="block text-lg font-semibold text-white">{stat.value}</strong>
                          <span className="text-xs text-zinc-400">{stat.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-7">
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-3 rounded-xl border border-gold/40 px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-gold transition hover:bg-gold/10"
                  >
                    Explore Products
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              <div className="relative min-h-[52vh] overflow-hidden lg:min-h-[74vh]">
                <img
                  src="/imgs/about-page-logo.jpeg"
                  alt="Molten metal pouring in a foundry"
                  className="absolute inset-0 h-full w-full object-cover object-right"
                  decoding="async"
                  fetchPriority="high"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,7,11,0.98)_0%,rgba(4,7,11,0.68)_38%,rgba(4,7,11,0.12)_68%,rgba(4,7,11,0)_100%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,11,0.08)_0%,rgba(4,7,11,0.3)_56%,rgba(4,7,11,0.82)_100%)]" />
              </div>
            </div>

            <div className="grid gap-4 pb-3 pt-8 sm:grid-cols-3">
              {pillars.map((pillar, index) => {
                const Icon = pillar.icon;
                return (
                  <motion.article
                    key={pillar.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.42, delay: index * 0.06 }}
                    whileHover={{ y: -4 }}
                    className="rounded-xl border border-white/10 bg-[#090d12]/95 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.24)]"
                  >
                    <div className="flex items-start gap-4">
                      <span className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/25 bg-gold/10 text-gold">
                        <Icon size={19} />
                      </span>
                      <div>
                        <h2 className="text-xl font-bold text-gold">{pillar.title}</h2>
                        <p className="mt-2 text-sm leading-6 text-zinc-400">{pillar.text}</p>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>
      </MotionReveal>
    </div>
  );
}
