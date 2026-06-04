import { motion } from 'framer-motion';
import { ArrowRight, Award, Eye, ShieldCheck, Target, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MotionReveal } from '../components/MotionReveal';
import { BrandLogo } from '../components/BrandLogo';
import { SEO } from '../components/seo/SEO';
import { companyDetails } from '../data/demoContent';

const heroStats = [
  { value: '20,000+', label: 'Products Sold', icon: Users },
  { value: '8,000+', label: 'Happy Clients', icon: Award },
  { value: '490+', label: 'Skilled Experts', icon: ShieldCheck },
  { value: '500+', label: 'Scalable Solutions', icon: Eye },
];

const pillars = [
  {
    title: 'Our Mission',
    icon: Target,
    text: 'To empower industries with premium metal products and industrial materials that drive growth, precision, and reliable performance.',
  },
  {
    title: 'Our Vision',
    icon: Eye,
    text: 'To be a trusted leader in industrial supply, known for quality, innovation, and customer confidence across every project.',
  },
  {
    title: 'Our Values',
    icon: ShieldCheck,
    text: 'Integrity, reliability, quality, and customer-first service guide every material we source and every shipment we deliver.',
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
        <section className="relative overflow-hidden border-b border-gold/15 bg-[#04070b]">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_24%,rgba(222,177,96,0.14),transparent_30%),radial-gradient(circle_at_18%_38%,rgba(222,177,96,0.09),transparent_28%),linear-gradient(180deg,rgba(3,7,11,0.2)_0%,rgba(3,7,11,0.82)_55%,rgba(3,7,11,0.96)_100%)]" />
            <div className="absolute left-[2%] top-[11%] h-[86%] w-px rotate-[22deg] bg-gradient-to-b from-transparent via-gold/75 to-transparent" />
            <div className="absolute left-[6%] top-[9%] h-[88%] w-px rotate-[22deg] bg-gradient-to-b from-transparent via-gold/55 to-transparent" />
            <div className="absolute left-[10%] top-[7%] h-[90%] w-px rotate-[22deg] bg-gradient-to-b from-transparent via-gold/40 to-transparent" />
            <div className="absolute left-[14%] top-[5%] h-[92%] w-px rotate-[22deg] bg-gradient-to-b from-transparent via-gold/25 to-transparent" />
          </div>

          <div className="relative mx-auto max-w-[1600px] px-4 pb-10 pt-4 sm:px-6 lg:px-8">
            <div className="rounded-[1.8rem] border border-white/10 bg-black/18 backdrop-blur-md">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.22em] text-zinc-400 sm:px-6">
                <p className="hidden sm:block">India&apos;s fastest growing industrial supply company.</p>
                <p className="sm:hidden">Industrial supply company.</p>
                <div className="flex items-center gap-4 text-zinc-300 normal-case tracking-normal">
                  <a href="tel:+917905350134" className="transition hover:text-gold">
                    +91 79053 50134
                  </a>
                  <a href="mailto:info@gravenmetal.com" className="transition hover:text-gold">
                    info@gravenmetal.com
                  </a>
                </div>
              </div>

              <div className="flex flex-col border-b border-white/10 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <BrandLogo className="h-10 sm:h-11" />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 lg:mt-0">
                  <Link
                    to="/quote-request"
                    className="inline-flex items-center justify-center rounded-xl bg-gold-cta px-7 py-3 text-sm font-bold uppercase tracking-[0.16em] text-black shadow-gold transition hover:brightness-110"
                  >
                    Request Quote
                  </Link>
                  <Link
                    to="/auth"
                    className="inline-flex items-center justify-center rounded-xl border border-gold/35 px-7 py-3 text-sm font-bold uppercase tracking-[0.16em] text-gold transition hover:bg-gold/10"
                  >
                    Login
                  </Link>
                </div>
              </div>

              <div className="grid gap-8 px-4 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-6 lg:py-12">
                <div className="relative overflow-hidden rounded-[2rem] border border-gold/15 bg-[#070b10] p-8 shadow-[0_0_0_1px_rgba(214,176,92,0.05),0_20px_60px_rgba(0,0,0,0.35)] sm:p-10">
                  <div className="absolute inset-0">
                    <div className="absolute left-[-8%] top-[-8%] h-[120%] w-px rotate-[24deg] bg-gradient-to-b from-transparent via-gold/80 to-transparent" />
                    <div className="absolute left-[4%] top-[-8%] h-[120%] w-px rotate-[24deg] bg-gradient-to-b from-transparent via-gold/60 to-transparent" />
                    <div className="absolute left-[16%] top-[-8%] h-[120%] w-px rotate-[24deg] bg-gradient-to-b from-transparent via-gold/45 to-transparent" />
                    <div className="absolute right-[8%] top-[-8%] h-[120%] w-px rotate-[24deg] bg-gradient-to-b from-transparent via-gold/75 to-transparent" />
                  </div>

                  <div className="relative flex min-h-[430px] flex-col items-center justify-center text-center sm:min-h-[520px]">
                    <div className="rounded-full border border-gold/15 bg-black/35 p-6 shadow-[0_0_40px_rgba(214,176,92,0.08)]">
                      <img src="/imgs/brand-mark.png" alt="Graven Metal logo" className="h-36 w-36 object-contain sm:h-44 sm:w-44" />
                    </div>
                    <div className="mt-7">
                      <h2 className="text-4xl font-black tracking-[0.18em] text-white sm:text-5xl">GRAVEN</h2>
                      <p className="mt-2 text-xl font-medium tracking-[0.34em] text-zinc-200 sm:text-2xl">METAL</p>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-gold">About Graven Metal</p>
                  <h1 className="mt-5 max-w-[13ch] font-display text-5xl leading-[1.02] text-white sm:text-6xl xl:text-[5rem]">
                    Forging Strength.
                    <br />
                    Delivering Excellence.
                  </h1>
                  <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
                    {companyDetails.intro}
                  </p>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {heroStats.map((stat) => {
                      const Icon = stat.icon;
                      return (
                        <div
                          key={stat.label}
                          className="rounded-2xl border border-white/10 bg-black/25 px-4 py-4 backdrop-blur-sm"
                        >
                          <div className="flex items-center gap-3">
                            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/25 bg-gold/10 text-gold">
                              <Icon size={18} />
                            </span>
                            <div>
                              <strong className="block text-xl font-semibold text-white">{stat.value}</strong>
                              <span className="text-sm text-zinc-400">{stat.label}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Link
                      to="/products"
                      className="inline-flex items-center gap-3 rounded-xl border border-gold/40 bg-transparent px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-gold transition hover:bg-gold/10"
                    >
                      Explore Products
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 px-4 pb-5 sm:grid-cols-3 sm:px-6">
                {pillars.map((pillar, index) => {
                  const Icon = pillar.icon;
                  return (
                    <motion.article
                      key={pillar.title}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.25 }}
                      transition={{ duration: 0.42, delay: index * 0.06 }}
                      whileHover={{ y: -5 }}
                      className="rounded-2xl border border-white/10 bg-[#090d12]/95 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.24)]"
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
          </div>
        </section>
      </MotionReveal>
    </div>
  );
}
