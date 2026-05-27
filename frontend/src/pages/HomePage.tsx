import { motion } from 'framer-motion';
import { ArrowRight, Award, BadgeDollarSign, Globe2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import { MotionReveal } from '../components/MotionReveal';
import { SEO } from '../components/seo/SEO';

const categories = [
  { name: 'Gold', image: '/imgs/gold.png' },
  { name: 'Silver', image: '/imgs/silver.png' },
  { name: 'Iron', image: '/imgs/iron.png' },
  { name: 'Copper', image: '/imgs/coper.png' },
  { name: 'Steel', image: '/imgs/steel.png' },
  { name: 'Aluminium', image: '/imgs/alumunu.png' },
];

const assurances = [
  { title: '100%', subtitle: 'Pure Quality', icon: ShieldCheck },
  { title: 'Global', subtitle: 'Supply', icon: Globe2 },
  { title: 'Best', subtitle: 'Pricing', icon: BadgeDollarSign },
  { title: 'Timely', subtitle: 'Delivery', icon: Award },
];

const stats = [
  { value: '10K+', label: 'Industry Clients' },
  { value: '500+', label: 'Worldwide Suppliers' },
  { value: '25+', label: 'Global Deliveries' },
  { value: '100%', label: 'Quality Certified' },
];

const navLinks = [
  ['Home', '/'],
  ['Products', '/products'],
  ['Categories', '/categories'],
  ['Live Prices', '/live-prices'],
  ['About Us', '/about'],
  ['Contact Us', '/contact'],
] as const;

export function HomePage() {
  return (
    <div className="bg-[#03070b]">
      <SEO
        title="Premium Metal Trading Platform"
        description="GRAVEN METAL supplies premium gold, silver, steel, copper, and industrial metals with trusted global delivery and competitive pricing."
        path="/"
        keywords={['metal trading', 'industrial metals', 'gold supplier', 'silver supplier', 'bulk metal order']}
      />

      <MotionReveal>
        <>
          <section className="relative min-h-[620px] overflow-hidden bg-[#050b11] sm:min-h-[680px] lg:min-h-[calc(100svh-24px)]">
            <img
              src="/imgs/background.png"
              alt="Molten metal pouring"
              className="absolute inset-0 h-full w-full object-cover object-[74%_center]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#03070b_0%,rgba(3,7,11,0.98)_30%,rgba(3,7,11,0.7)_54%,rgba(3,7,11,0.12)_82%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.28)_0%,transparent_38%,rgba(0,0,0,0.4)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#03070b] to-transparent" />

            <div className="relative z-10 mx-auto flex min-h-[620px] w-full max-w-7xl flex-col px-5 py-5 sm:min-h-[680px] sm:px-7 md:px-10 lg:min-h-[calc(100svh-24px)]">
              <div className="flex items-center justify-between gap-5">
                <Link to="/" className="inline-flex items-center text-white">
                  <BrandLogo className="h-10 sm:h-11" />
                </Link>

                <nav className="hidden items-center gap-7 lg:flex">
                  {navLinks.map(([label, href]) => (
                    <Link key={href} to={href} className="text-xs font-semibold text-zinc-200 hover:text-gold">
                      {label}
                    </Link>
                  ))}
                </nav>

                <Link
                  to="/quote-request"
                  className="inline-flex items-center rounded bg-gold-cta px-4 py-2.5 text-xs font-bold text-black shadow-gold sm:px-5"
                >
                  Request Quote
                </Link>
              </div>

              <div className="flex flex-1 items-center py-10 sm:py-14">
                <div className="w-full max-w-[660px]">
                  <h1 className="font-body text-[2.9rem] font-extrabold leading-[1.05] text-white sm:text-[4rem] lg:text-[5rem]">
                    Premium Metals.
                    <span className="block text-gold">Trusted Globally.</span>
                  </h1>
                  <p className="mt-5 max-w-[470px] text-base leading-7 text-zinc-300 sm:text-lg">
                    We supply high-quality metals with purity, precision &amp; performance.
                  </p>

                  <div className="mt-8 grid max-w-[610px] grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-4">
                    {assurances.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.title} className="flex items-center gap-2 text-left">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded border border-gold/30 bg-[#071018]/85 text-gold">
                            <Icon size={15} />
                          </span>
                          <span className="leading-tight">
                            <strong className="block text-[11px] font-bold text-white">{item.title}</strong>
                            <span className="text-[11px] text-zinc-400">{item.subtitle}</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <Link
                      to="/products"
                      className="inline-flex items-center gap-2 rounded bg-gold-cta px-6 py-3.5 text-sm font-bold text-black shadow-gold"
                    >
                      Explore Metals <ArrowRight size={15} />
                    </Link>
                    <Link
                      to="/live-prices"
                      className="inline-flex items-center rounded border border-gold/45 bg-black/20 px-6 py-3.5 text-sm font-bold text-white hover:border-gold"
                    >
                      View Live Prices
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="border-y border-[#172533] bg-[#050b11] px-4 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-7xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-zinc-100">Top Metal Categories</h2>
                <Link to="/categories" className="text-sm font-semibold text-gold hover:text-amberlux">
                  View All
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {categories.map((category) => (
                  <motion.article
                    key={category.name}
                    whileHover={{ y: -4 }}
                    className="group rounded-md border border-[#223243] bg-[#08121b] p-3"
                  >
                    <div className="aspect-[4/3] overflow-hidden rounded border border-[#1e2f3f] bg-[#050b11]">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-zinc-100">{category.name}</h3>
                    <p className="inline-flex items-center gap-1 text-sm font-medium text-gold">
                      Explore <ArrowRight size={13} />
                    </p>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-[#03070b] px-4 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto grid max-w-7xl gap-6 text-center sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((item) => (
                <div key={item.label} className="rounded-md border border-[#172533] bg-[#060d13] px-5 py-7">
                  <p className="text-4xl font-extrabold text-gold">{item.value}</p>
                  <p className="mt-2 text-sm font-medium text-zinc-300">{item.label}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      </MotionReveal>
    </div>
  );
}
