import type { ApiBlog, ApiCategory, ApiProduct } from '../lib/publicApi';

export const companyDetails = {
  name: 'GRAVEN METAL PRIVATE LIMITED',
  tagline: "India's fastest growing industrial automation company.",
  founded: 2022,
  headquarters: '8/61, Sector-8, Jankipuram Extension, Lucknow-226021, India',
  indiaOffice: '8/61, Sector-8, Jankipuram Extension, Lucknow-226021, India',
  email: 'info@gravenautomation.com',
  phone: '+9179053 50134',
  supportPhone: '+9179053 50134',
  certifications: ['Industrial Automation Solutions', 'International Spare Parts Supply', 'Process Optimization', 'Quick Technical Support'],
  intro:
    'GRAVEN METAL delivers industrial automation solutions and international spare parts support for modern manufacturing and production businesses.',
  mission:
    'Empower businesses with reliable automation solutions that improve efficiency, precision, and operational performance.',
  vision:
    'Become the most trusted industrial automation partner for scalable, future-ready operations.',
  values:
    'Innovation, reliability, technical excellence, and long-term customer partnership.',
};

export const demoCategories: ApiCategory[] = [
  { _id: 'cat-gold', name: 'Gold', slug: 'gold', description: 'Investment-grade and industrial gold products.', productCount: 9 },
  { _id: 'cat-silver', name: 'Silver', slug: 'silver', description: 'High-purity silver bars and granules.', productCount: 8 },
  { _id: 'cat-iron', name: 'Iron', slug: 'iron', description: 'TMT rods, billets, and structural iron.', productCount: 11 },
  { _id: 'cat-copper', name: 'Copper', slug: 'copper', description: 'Conductive copper wire, rods, and cathodes.', productCount: 12 },
  { _id: 'cat-steel', name: 'Steel', slug: 'steel', description: 'Hot rolled coils and industrial steel forms.', productCount: 14 },
  { _id: 'cat-aluminium', name: 'Aluminium', slug: 'aluminium', description: 'Primary and secondary aluminium supply.', productCount: 10 },
  { _id: 'cat-brass', name: 'Brass', slug: 'brass', description: 'Precision brass rods, tubes, and sheets.', productCount: 6 },
  { _id: 'cat-lead', name: 'Lead', slug: 'lead', description: 'Battery-grade lead ingots and alloy stock.', productCount: 5 },
];

const categoryMap = Object.fromEntries(demoCategories.map((c) => [c.slug, c]));
const demoProductImageByCategory: Record<string, string> = {
  gold: '/imgs/gold.png',
  silver: '/imgs/silver.png',
  iron: '/imgs/iron.png',
  copper: '/imgs/coper.png',
  steel: '/imgs/steel.png',
  aluminium: '/imgs/alumunu.png',
  brass: '/imgs/Brass%20rods.png',
  lead: '/imgs/lead%20ingots.png',
};

export const demoProducts: ApiProduct[] = [
  {
    _id: 'prd-gold-bars-24k',
    name: 'Gold Bars (24K)',
    slug: 'gold-bars-24k',
    description: '24K, 99.99% purity bars supplied with refinery and assay certification.',
    price: 6054,
    currency: 'USD',
    unit: '10g',
    stockQty: 380,
    inStock: true,
    image: { url: demoProductImageByCategory.gold },
    category: { _id: categoryMap.gold._id, name: categoryMap.gold.name, slug: categoryMap.gold.slug },
  },
  {
    _id: 'prd-silver-bars-999',
    name: 'Silver Bars (999)',
    slug: 'silver-bars-999',
    description: 'Industrial and investment-grade 999 silver bars with tamper-proof packaging.',
    price: 78050,
    currency: 'USD',
    unit: 'kg',
    stockQty: 950,
    inStock: true,
    image: { url: demoProductImageByCategory.silver },
    category: { _id: categoryMap.silver._id, name: categoryMap.silver.name, slug: categoryMap.silver.slug },
  },
  {
    _id: 'prd-iron-rods-tmt',
    name: 'Iron Rods (TMT Fe550D)',
    slug: 'iron-rods-tmt',
    description: 'High tensile rods for infrastructure and heavy civil projects.',
    price: 52100,
    currency: 'USD',
    unit: 'ton',
    stockQty: 1260,
    inStock: true,
    image: { url: demoProductImageByCategory.iron },
    category: { _id: categoryMap.iron._id, name: categoryMap.iron.name, slug: categoryMap.iron.slug },
  },
  {
    _id: 'prd-copper-wire-etp',
    name: 'Copper Wire (ETP Grade)',
    slug: 'copper-wire-etp',
    description: 'High conductivity ETP copper wire coils for cable and motor manufacturing.',
    price: 805,
    currency: 'USD',
    unit: 'kg',
    stockQty: 4200,
    inStock: true,
    image: { url: demoProductImageByCategory.copper },
    category: { _id: categoryMap.copper._id, name: categoryMap.copper.name, slug: categoryMap.copper.slug },
  },
  {
    _id: 'prd-steel-coils-hr',
    name: 'Steel Coils (HR)',
    slug: 'steel-coils-hr',
    description: 'Hot-rolled coils for fabrication, automotive components, and machinery.',
    price: 56900,
    currency: 'USD',
    unit: 'ton',
    stockQty: 770,
    inStock: true,
    image: { url: demoProductImageByCategory.steel },
    category: { _id: categoryMap.steel._id, name: categoryMap.steel.name, slug: categoryMap.steel.slug },
  },
  {
    _id: 'prd-aluminium-ingots-a7',
    name: 'Aluminium Ingots (A7)',
    slug: 'aluminium-ingots-a7',
    description: 'Primary A7 aluminium ingots with controlled composition and low impurity.',
    price: 225,
    currency: 'USD',
    unit: 'kg',
    stockQty: 10800,
    inStock: true,
    image: { url: demoProductImageByCategory.aluminium },
    category: { _id: categoryMap.aluminium._id, name: categoryMap.aluminium.name, slug: categoryMap.aluminium.slug },
  },
  {
    _id: 'prd-brass-rods-c360',
    name: 'Brass Rods (C360)',
    slug: 'brass-rods-c360',
    description: 'Free-cutting brass rods for precision machining and fittings.',
    price: 425,
    currency: 'USD',
    unit: 'kg',
    stockQty: 2100,
    inStock: true,
    image: { url: demoProductImageByCategory.brass },
    category: { _id: categoryMap.brass._id, name: categoryMap.brass.name, slug: categoryMap.brass.slug },
  },
  {
    _id: 'prd-lead-ingots-pb99',
    name: 'Lead Ingots (Pb 99.97%)',
    slug: 'lead-ingots-pb99',
    description: 'Battery and shielding-grade lead ingots with strict batch tracking.',
    price: 190,
    currency: 'USD',
    unit: 'kg',
    stockQty: 3900,
    inStock: true,
    image: { url: demoProductImageByCategory.lead },
    category: { _id: categoryMap.lead._id, name: categoryMap.lead.name, slug: categoryMap.lead.slug },
  },
];

export const demoBlogs: ApiBlog[] = [
  {
    _id: 'blog-gold-demand-2026',
    title: 'Global Gold Demand in 2026: Industrial and Reserve Flows',
    slug: 'global-gold-demand-2026',
    excerpt:
      'How central bank buying and electronics demand are shaping gold procurement strategy for Q3 and Q4 contracts.',
    content:
      'Institutional demand remains firm as central banks diversify reserve portfolios. Electronics and precision manufacturing are also driving stable offtake in refined gold. Procurement teams are balancing spot exposure with quarterly fixed-volume contracts to manage volatility.',
    createdAt: '2026-04-21T10:00:00.000Z',
  },
  {
    _id: 'blog-steel-logistics-risks',
    title: 'Steel Supply Chain Risk Playbook for EPC Buyers',
    slug: 'steel-supply-chain-risk-playbook',
    excerpt:
      'A practical framework for mitigating freight, energy, and billet-index risk in long-horizon infrastructure projects.',
    content:
      'Large EPC programs face multi-factor volatility in steel markets. Buyers are increasingly adopting dual-origin procurement and index-linked hedging to stabilize landed costs. Vendor scorecards now prioritize mill consistency, vessel reliability, and claim resolution speed.',
    createdAt: '2026-05-04T08:30:00.000Z',
  },
  {
    _id: 'blog-copper-grid-upgrade',
    title: 'Copper Procurement Trends as Grid Expansion Accelerates',
    slug: 'copper-procurement-grid-expansion',
    excerpt:
      'Why utility contractors are moving to longer contract cycles for copper wire, strip, and cathodes.',
    content:
      'Grid and renewable expansion is tightening copper conversion capacity in key corridors. Buyers are securing rolling supply windows and quality clauses to avoid production disruptions. Premiums are increasingly tied to delivery reliability, not just spot LME movement.',
    createdAt: '2026-05-12T12:15:00.000Z',
  },
];

export const demoFaq = [
  {
    q: 'What types of metals does GRAVEN METAL supply?',
    a: 'We supply gold, silver, iron, copper, steel, aluminium, brass, and lead products for industrial and bulk commercial requirements.',
  },
  {
    q: 'Are your metals certified and traceable?',
    a: 'Yes. Every shipment is accompanied by batch documentation, mill/refinery certificates, and inspection data when required.',
  },
  {
    q: 'Do you support bulk and contract-based procurement?',
    a: 'Yes. We support spot purchases, monthly call-off contracts, and quarterly volume agreements for EPC and manufacturing buyers.',
  },
  {
    q: 'What is your standard delivery timeline?',
    a: 'Typical lead time is 4-14 business days depending on product, volume, and destination port or warehouse location.',
  },
  {
    q: 'Can I request custom dimensions or grades?',
    a: 'Yes. We support custom grades, dimensions, and packing configurations subject to MOQs and production windows.',
  },
  {
    q: 'How are live prices updated on your platform?',
    a: 'Our demo UI updates prices at short intervals to reflect market movement behavior, similar to real trading dashboards.',
  },
];

export const demoTestimonials = [
  {
    name: 'Rajat Kulkarni',
    role: 'Procurement Head, Nova Infrastructure',
    quote:
      'GRAVEN helped us lock steel and copper supply during peak volatility. Their delivery accuracy and documentation quality are exceptional.',
  },
  {
    name: 'Nadia Al-Farsi',
    role: 'Supply Manager, Gulf Electro Systems',
    quote:
      'We shifted critical copper and aluminium sourcing to GRAVEN last year. Turnaround and material consistency have been excellent.',
  },
  {
    name: 'Daniel Richter',
    role: 'Director, Rhein Alloy Works',
    quote:
      'Transparent pricing, reliable timelines, and fast response from their team. GRAVEN operates like a true long-term procurement partner.',
  },
];

export const demoCompanyStats = [
  { value: '20000+', label: 'Products Sold' },
  { value: '8000+', label: 'Happy Clients' },
  { value: '490+', label: 'Skilled Experts' },
  { value: '500+', label: 'Scalable Solutions' },
];

export const demoLiveRows = [
  { metal: 'Gold (24K)', unit: '/ 10g', price: 6054, change: 1.25 },
  { metal: 'Silver (1Kg)', unit: '/ Kg', price: 78050, change: 0.85 },
  { metal: 'Iron (TMT)', unit: '/ Ton', price: 52100, change: -0.35 },
  { metal: 'Copper (1Kg)', unit: '/ Kg', price: 805, change: 1.1 },
  { metal: 'Aluminium (1Kg)', unit: '/ Kg', price: 225, change: -0.1 },
  { metal: 'Steel Coil', unit: '/ Ton', price: 56900, change: 0.43 },
];
