import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  BadgeDollarSign,
  CheckCircle2,
  ClipboardCheck,
  Factory,
  Gauge,
  Globe2,
  PackageCheck,
  ShieldCheck,
  TrendingUp,
  Truck,
  UserRound,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import { SEO } from '../components/seo/SEO';
import { useCustomerAuth } from '../components/auth/AuthProvider';
import { publicApi } from '../lib/publicApi';
import type { ApiProduct } from '../lib/publicApi';

const categories = [
  { name: 'Copper', image: '/imgs/coper.png', note: 'Wire, rods, cathodes, and conductive stock' },
  { name: 'Steel', image: '/imgs/steel.png', note: 'Coils and industrial fabrication grades' },
  { name: 'Aluminium', image: '/imgs/alumunu.png', note: 'Primary ingots and lightweight stock' },
  { name: 'Brass', image: '/imgs/Brass%20rods.png', note: 'Precision rods, tubes, and sheet stock' },
  { name: 'Iron', image: '/imgs/iron.png', note: 'TMT rods, billets, and structural material' },
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

const fallbackMarketRows = [
  { metal: 'Copper 1Kg', price: '$805', move: '+1.10%', positive: true },
  { metal: 'Steel Coil', price: '$56,900', move: '+0.43%', positive: true },
  { metal: 'Aluminium 1Kg', price: '$225', move: '-0.10%', positive: false },
];

const weightUnitToKg: Record<string, number> = {
  g: 0.001,
  gram: 0.001,
  grams: 0.001,
  kg: 1,
  kilogram: 1,
  kilograms: 1,
  lb: 0.45359237,
  lbs: 0.45359237,
  pound: 0.45359237,
  pounds: 0.45359237,
  oz: 0.028349523125,
  ounce: 0.028349523125,
  ounces: 0.028349523125,
  ton: 1000,
  tonne: 1000,
  t: 1000,
};

function getWeightMultiplier(weightUnit?: string) {
  return weightUnit ? weightUnitToKg[weightUnit.toLowerCase()] || 1 : 1;
}

function getUnitLabel(product: ApiProduct) {
  return product.unitType || product.unit || 'unit';
}

function getUnitPrice(product: ApiProduct) {
  return (product.unitPrice ?? product.price * (product.weightPerUnit ?? 1) * getWeightMultiplier(product.weightUnit || product.unit)) || 0;
}

function toMarketRow(product: ApiProduct) {
  const price = getUnitPrice(product);
  const hash = Math.abs([...product.name].reduce((acc, char) => acc + char.charCodeAt(0), 0));
  const move = Number((((hash % 240) / 100) - 1.2).toFixed(2));
  return {
    metal: `${product.name} ${getUnitLabel(product)}`,
    price: `$${price.toLocaleString(undefined, { maximumFractionDigits: price > 1000 ? 0 : 2 })}`,
    move: `${move >= 0 ? '+' : ''}${move.toFixed(2)}%`,
    positive: move >= 0,
  };
}

const capabilities = [
  {
    title: 'Verified sourcing',
    text: 'Mill, refinery, and supplier documentation is reviewed before material moves into an active order.',
    icon: ClipboardCheck,
  },
  {
    title: 'Bulk procurement',
    text: 'Spot purchases, recurring supply, and project-volume requirements are handled with clear pricing windows.',
    icon: Factory,
  },
  {
    title: 'Dispatch control',
    text: 'Orders are packed, tracked, and coordinated across warehouse, freight, and customer handoff points.',
    icon: PackageCheck,
  },
];

const processSteps = [
  { title: 'Share Requirement', text: 'Grade, volume, delivery city, and target timeline.', icon: ClipboardCheck },
  { title: 'Confirm Quote', text: 'Transparent pricing with product and logistics details.', icon: CheckCircle2 },
  { title: 'Track Dispatch', text: 'Shipment coordination from confirmation to delivery.', icon: Truck },
];

export function HomePage() {
  const { isAuthenticated, user } = useCustomerAuth();
  const [showQuotePrompt, setShowQuotePrompt] = useState(false);
  const [quotePromptDismissed, setQuotePromptDismissed] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [marketRows, setMarketRows] = useState(fallbackMarketRows);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  useEffect(() => {
    let active = true;
    publicApi
      .getProducts()
      .then((products) => {
        if (!active || products.length === 0) return;
        setMarketRows(products.slice(0, 3).map(toMarketRow));
      })
      .catch(() => {
        if (active) setMarketRows(fallbackMarketRows);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (quotePromptDismissed || showQuotePrompt) return;

    const openPrompt = () => setShowQuotePrompt(true);
    const timer = window.setTimeout(openPrompt, 4500);
    const onScroll = () => {
      const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (pageHeight <= 0) return;
      const scrollProgress = window.scrollY / pageHeight;
      if (scrollProgress >= 0.28) openPrompt();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [quotePromptDismissed, showQuotePrompt]);

  useEffect(() => {
    if (!showQuotePrompt) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeQuotePrompt();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showQuotePrompt]);

  const closeQuotePrompt = () => {
    setQuotePromptDismissed(true);
    setShowQuotePrompt(false);
  };

  return (
    <div className="bg-[#03070b]">
      <SEO
        title="Industrial Metal & Automation Supply"
        description="GRAVEN METAL supplies industrial metals, automation support, and procurement follow-up for manufacturing businesses."
        path="/"
        keywords={['industrial metal supply', 'metal procurement', 'automation spare parts', 'copper supply', 'aluminium supply']}
      />

      {showQuotePrompt && portalTarget
        ? createPortal(
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/68 px-4 py-6 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="quote-prompt-title"
            aria-describedby="quote-prompt-description"
            className="relative w-full max-w-lg overflow-hidden rounded-md border border-gold/25 bg-[#071018] p-5 shadow-halo sm:p-6"
          >
            <button
              type="button"
              onClick={closeQuotePrompt}
              aria-label="Close request quote popup"
              className="absolute right-3 top-3 grid min-h-11 min-w-11 place-items-center rounded border border-white/10 bg-black/25 text-zinc-200 transition hover:border-gold/40 hover:text-gold"
            >
              <X size={16} />
            </button>
            <p className="pr-10 text-[11px] uppercase tracking-[0.24em] text-gold">Buying metal?</p>
            <h2 id="quote-prompt-title" className="mt-3 pr-8 font-display text-3xl text-white">
              Request price and availability.
            </h2>
            <p id="quote-prompt-description" className="mt-3 text-sm leading-6 text-zinc-300">
              Submit your product, quantity, and delivery details. Our metal sourcing team will review it and contact
              you within 24 hours.
            </p>
            <div className="mt-5 grid gap-2 text-sm font-semibold text-zinc-100 sm:grid-cols-2">
              <span className="rounded border border-white/15 bg-white/[0.04] px-3 py-2.5">Bulk purchase support</span>
              <span className="rounded border border-white/15 bg-white/[0.04] px-3 py-2.5">Quality-assured follow-up</span>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/quote-request"
                onClick={closeQuotePrompt}
                className="inline-flex items-center gap-2 rounded bg-gold-cta px-5 py-3 text-sm font-bold text-black shadow-gold hover:brightness-110"
              >
                Go to Request Quote <ArrowRight size={15} />
              </Link>
              <button
                type="button"
                onClick={closeQuotePrompt}
                className="rounded border border-gold/30 px-5 py-3 text-sm font-semibold text-gold transition hover:bg-gold/10"
              >
                Not Interested
              </button>
            </div>
          </div>
        </div>,
          portalTarget,
        )
        : null}

      <>
          <section className="relative min-h-[600px] overflow-hidden bg-[#050b11] sm:min-h-[660px] lg:min-h-[calc(100svh-72px)]">
            <img
              src="/imgs/background.png"
              alt="Molten metal pouring"
              className="absolute inset-0 h-full w-full object-cover object-[70%_center]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#03070b_0%,rgba(3,7,11,0.97)_32%,rgba(3,7,11,0.72)_56%,rgba(3,7,11,0.14)_86%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.36)_0%,transparent_34%,rgba(0,0,0,0.48)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#03070b] to-transparent" />

            <div className="relative z-10 mx-auto flex min-h-[600px] w-full max-w-7xl flex-col px-5 py-5 sm:min-h-[660px] sm:px-7 md:px-10 lg:min-h-[calc(100svh-72px)]">
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

                <div className="flex items-center gap-2">
                  <Link
                    to={isAuthenticated ? '/account' : '/login'}
                    className="hidden items-center gap-2 rounded border border-gold/25 bg-black/25 px-3 py-2 text-xs font-bold text-gold hover:border-gold/50 hover:text-champagne sm:inline-flex"
                  >
                    <UserRound size={14} />
                    {isAuthenticated ? user?.name || 'Account' : 'Login'}
                  </Link>
                  <Link
                    to="/quote-request"
                    className="inline-flex items-center gap-2 rounded bg-gold-cta px-4 py-2.5 text-xs font-bold text-black shadow-gold hover:brightness-110 sm:px-5"
                  >
                    Request Quote <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              <div className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-12">
                <div className="w-full max-w-[700px]">
                  <p className="inline-flex items-center gap-2 border-l-2 border-gold pl-3 text-xs font-semibold uppercase tracking-[0.2em] text-champagne">
                    Industrial metal and automation supply
                  </p>
                  <h1 className="mt-5 font-display text-[2.75rem] font-semibold leading-[1.04] text-white sm:text-[4rem] lg:text-[5.15rem]">
                    GRAVEN METAL
                    <span className="block text-gold">powers procurement.</span>
                  </h1>
                  <p className="mt-5 max-w-[560px] text-base leading-7 text-zinc-300 sm:text-lg">
                    Industrial metals, automation support, and sourcing follow-up for teams that need dependable
                    supply, responsive pricing, and reliable delivery.
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
                      className="inline-flex items-center gap-2 rounded bg-gold-cta px-6 py-3.5 text-sm font-bold text-black shadow-gold hover:brightness-110"
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

                <div className="hidden lg:block">
                  <div className="rounded-md border border-gold/20 bg-[#061018]/88 p-4 shadow-halo backdrop-blur">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Market desk</p>
                        <h2 className="mt-1 text-lg font-semibold text-white">Live snapshot</h2>
                      </div>
                      <span className="grid h-9 w-9 place-items-center rounded border border-gold/30 bg-gold/10 text-gold">
                        <TrendingUp size={17} />
                      </span>
                    </div>

                    <div className="mt-2 divide-y divide-white/10">
                      {marketRows.map((row) => (
                        <div key={row.metal} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-3 text-sm">
                          <span className="font-semibold text-zinc-200">{row.metal}</span>
                          <span className="text-zinc-300">{row.price}</span>
                          <span className={row.positive ? 'text-emerald-400' : 'text-red-400'}>{row.move}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="border border-white/10 bg-black/20 p-3">
                        <p className="text-xl font-bold text-gold">25+</p>
                        <p className="mt-1 text-xs text-zinc-400">delivery countries</p>
                      </div>
                      <div className="border border-white/10 bg-black/20 p-3">
                        <p className="text-xl font-bold text-gold">500+</p>
                        <p className="mt-1 text-xs text-zinc-400">supplier network</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="border-y border-[#172533] bg-[#050b11] px-4 py-9 sm:px-6 lg:px-10">
            <div className="mx-auto grid max-w-7xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((item) => (
                <div key={item.label} className="border border-[#172533] bg-[#060d13] px-5 py-5">
                  <p className="text-3xl font-extrabold text-gold">{item.value}</p>
                  <p className="mt-2 text-sm font-medium text-zinc-300">{item.label}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-[#03070b] px-4 py-12 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-7xl">
              <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-gold">Metal catalogue</p>
                  <h2 className="mt-2 font-display text-3xl text-white sm:text-4xl">Top Metal Categories</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                    Core materials for manufacturing, infrastructure, electrical, and investment-grade requirements.
                  </p>
                </div>
                <Link to="/categories" className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:text-amberlux">
                  View All <ArrowRight size={14} />
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                  <motion.article
                    key={category.name}
                    whileHover={{ y: -4 }}
                    className="group overflow-hidden rounded-md border border-[#223243] bg-[#08121b]"
                  >
                    <div className="aspect-[16/9] overflow-hidden border-b border-[#1e2f3f] bg-[#050b11]">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-zinc-100">{category.name}</h3>
                      <p className="mt-2 min-h-[44px] text-sm leading-6 text-zinc-400">{category.note}</p>
                      <Link to="/products" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-gold">
                        Explore <ArrowRight size={13} />
                      </Link>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>

          <section className="border-y border-gold/10 bg-[#060c12] px-4 py-12 sm:px-6 lg:px-10">
            <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-gold">Why buyers choose us</p>
                <h2 className="mt-2 font-display text-3xl text-white sm:text-4xl">Built for repeat procurement.</h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-400">
                  GRAVEN METAL keeps the buying experience practical: verified supply, responsive pricing, and
                  delivery coordination that stays visible from quotation to dispatch.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link to="/about" className="inline-flex items-center gap-2 rounded border border-gold/35 px-5 py-3 text-sm font-semibold text-gold hover:bg-gold/10">
                    Company Profile <ArrowRight size={14} />
                  </Link>
                  <Link to="/contact" className="inline-flex items-center gap-2 rounded bg-gold-cta px-5 py-3 text-sm font-semibold text-black shadow-gold hover:brightness-110">
                    Contact Desk <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {capabilities.map((item) => {
                  const Icon = item.icon;
                  return (
                    <article key={item.title} className="rounded-md border border-gold/15 bg-[#0a1118] p-4 shadow-panel">
                      <span className="grid h-10 w-10 place-items-center rounded border border-gold/25 bg-gold/10 text-gold">
                        <Icon size={18} />
                      </span>
                      <h3 className="mt-4 text-base font-semibold text-white">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-zinc-400">{item.text}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="bg-[#03070b] px-4 py-12 sm:px-6 lg:px-10">
            <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_0.9fr]">
              <div className="overflow-hidden rounded-md border border-gold/15 bg-[#070d12]">
                <img
                  src="/imgs/steel.png"
                  alt="Industrial metal stock"
                  className="h-full min-h-[340px] w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="rounded-md border border-gold/20 bg-luxury-linear p-5 shadow-halo sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-gold">Order flow</p>
                    <h2 className="mt-2 font-display text-3xl text-white">From inquiry to dispatch.</h2>
                  </div>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded border border-gold/25 bg-black/20 text-gold">
                    <Gauge size={19} />
                  </span>
                </div>

                <div className="mt-6 grid gap-3">
                  {processSteps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.title} className="grid grid-cols-[auto_1fr] gap-4 border border-white/10 bg-black/20 p-4">
                        <span className="grid h-10 w-10 place-items-center rounded border border-gold/25 bg-gold/10 text-gold">
                          <Icon size={18} />
                        </span>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                            Step {index + 1}
                          </p>
                          <h3 className="mt-1 font-semibold text-white">{step.title}</h3>
                          <p className="mt-1 text-sm leading-6 text-zinc-400">{step.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Link
                  to="/quote-request"
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded bg-gold-cta px-5 py-3 text-sm font-bold text-black shadow-gold hover:brightness-110 sm:w-auto"
                >
                  Start a Quote <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </section>
      </>
    </div>
  );
}
