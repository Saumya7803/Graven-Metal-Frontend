import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';

const DEV_SUPER_ADMIN_EMAIL = process.env.DEV_SUPER_ADMIN_EMAIL || 'super@graven.local';
const DEV_SUPER_ADMIN_PASSWORD = process.env.DEV_SUPER_ADMIN_PASSWORD || 'Password123';
const DEV_ADMIN_EMAIL = process.env.DEV_ADMIN_EMAIL || 'admin@graven.local';
const DEV_ADMIN_PASSWORD = process.env.DEV_ADMIN_PASSWORD || 'Password123';

const demoCategories = [
  { name: 'Gold', slug: 'gold', description: 'Certified bars and industrial-grade supply.', sortOrder: 10 },
  { name: 'Silver', slug: 'silver', description: 'High-purity bars, granules, and bulk lots.', sortOrder: 20 },
  { name: 'Copper', slug: 'copper', description: 'Wire, rods, cathodes, and conductive stock.', sortOrder: 30 },
  { name: 'Steel', slug: 'steel', description: 'Coils and industrial fabrication grades.', sortOrder: 40 },
  { name: 'Aluminium', slug: 'aluminium', description: 'Primary ingots and lightweight stock.', sortOrder: 50 },
  { name: 'Brass', slug: 'brass', description: 'Rods, sheets, and machined brass material.', sortOrder: 60 },
  { name: 'Iron', slug: 'iron', description: 'TMT rods, billets, and structural material.', sortOrder: 70 },
  { name: 'Lead', slug: 'lead', description: 'Lead ingots and industrial bulk supply.', sortOrder: 80 },
];

const demoProducts = [
  {
    name: '24K Gold Bar',
    slug: '24k-gold-bar',
    description: 'Investment-grade 24K gold bars for certified bulk procurement.',
    categorySlug: 'gold',
    price: 6054,
    currency: 'USD',
    unit: '10g',
    stockQty: 25,
  },
  {
    name: 'Silver Industrial Granules',
    slug: 'silver-industrial-granules',
    description: 'High-purity silver granules for industrial and commercial use.',
    categorySlug: 'silver',
    price: 78050,
    currency: 'INR',
    unit: 'kg',
    stockQty: 80,
  },
  {
    name: 'Copper Cathode Sheets',
    slug: 'copper-cathode-sheets',
    description: 'Premium copper cathode sheets with dependable conductivity.',
    categorySlug: 'copper',
    price: 805,
    currency: 'INR',
    unit: 'kg',
    stockQty: 140,
  },
  {
    name: 'Mild Steel Coils',
    slug: 'mild-steel-coils',
    description: 'Fabrication-ready mild steel coils for manufacturing lines.',
    categorySlug: 'steel',
    price: 62,
    currency: 'INR',
    unit: 'kg',
    stockQty: 400,
  },
  {
    name: 'Aluminium Ingots',
    slug: 'aluminium-ingots',
    description: 'Primary aluminium ingots for casting and lightweight assemblies.',
    categorySlug: 'aluminium',
    price: 245,
    currency: 'INR',
    unit: 'kg',
    stockQty: 220,
  },
  {
    name: 'Brass Rods',
    slug: 'brass-rods',
    description: 'Precision brass rods for machining, fittings, and components.',
    categorySlug: 'brass',
    price: 540,
    currency: 'INR',
    unit: 'kg',
    stockQty: 95,
  },
  {
    name: 'Iron TMT Bars',
    slug: 'iron-tmt-bars',
    description: 'Construction-grade iron TMT bars for structural projects.',
    categorySlug: 'iron',
    price: 58,
    currency: 'INR',
    unit: 'kg',
    stockQty: 500,
  },
  {
    name: 'Lead Ingots',
    slug: 'lead-ingots',
    description: 'Industrial lead ingots for shielding, batteries, and alloys.',
    categorySlug: 'lead',
    price: 185,
    currency: 'INR',
    unit: 'kg',
    stockQty: 160,
  },
];

async function ensureDevCatalog() {
  if (process.env.DEV_BOOTSTRAP_CATALOG === 'false') return;

  const categoryBySlug = new Map();
  for (const item of demoCategories) {
    const category = await Category.findOneAndUpdate(
      { slug: item.slug },
      { $setOnInsert: item },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    );
    categoryBySlug.set(category.slug, category);
  }

  const productCount = await Product.countDocuments();
  if (productCount > 0) return;

  const products = demoProducts
    .map(({ categorySlug, ...product }) => {
      const category = categoryBySlug.get(categorySlug);
      return category ? { ...product, category: category._id } : null;
    })
    .filter(Boolean);

  if (products.length > 0) {
    await Product.insertMany(products);
    console.log(`Seeded local product catalog: ${products.length} products`);
  }
}

export const ensureDevUsers = async () => {
  if (process.env.NODE_ENV === 'production') return;
  if (process.env.DEV_BOOTSTRAP_USERS === 'false') return;

  const superExists = await User.findOne({ email: DEV_SUPER_ADMIN_EMAIL });
  if (!superExists) {
    await User.create({
      name: 'Local Super Admin',
      email: DEV_SUPER_ADMIN_EMAIL,
      password: DEV_SUPER_ADMIN_PASSWORD,
      role: 'super_admin',
    });
    console.log(`Created local super admin: ${DEV_SUPER_ADMIN_EMAIL}`);
  }

  const adminExists = await User.findOne({ email: DEV_ADMIN_EMAIL });
  if (!adminExists) {
    await User.create({
      name: 'Local Admin',
      email: DEV_ADMIN_EMAIL,
      password: DEV_ADMIN_PASSWORD,
      role: 'admin',
    });
    console.log(`Created local admin: ${DEV_ADMIN_EMAIL}`);
  }

  await ensureDevCatalog();
};
