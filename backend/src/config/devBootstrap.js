import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';

const DEV_SUPER_ADMIN_EMAIL = process.env.DEV_SUPER_ADMIN_EMAIL || 'super@graven.local';
const DEV_SUPER_ADMIN_PASSWORD = process.env.DEV_SUPER_ADMIN_PASSWORD || 'Password123';
const DEV_ADMIN_EMAIL = process.env.DEV_ADMIN_EMAIL || 'admin@graven.local';
const DEV_ADMIN_PASSWORD = process.env.DEV_ADMIN_PASSWORD || 'Password123';
const DEV_CUSTOMER_EMAIL = process.env.DEV_CUSTOMER_EMAIL || 'customer@graven.local';
const DEV_CUSTOMER_PASSWORD = process.env.DEV_CUSTOMER_PASSWORD || 'Password123';
const DEV_LQT_EMAIL = process.env.DEV_LQT_EMAIL || 'lqt@graven.local';
const DEV_SALES_EMAIL = process.env.DEV_SALES_EMAIL || 'sales@graven.local';
const DEV_PROCUREMENT_EMAIL = process.env.DEV_PROCUREMENT_EMAIL || 'procurement@graven.local';
const DEV_DEVELOPER_EMAIL = process.env.DEV_DEVELOPER_EMAIL || 'developer@graven.local';

const removedCatalogCategorySlugs = ['gold', 'silver', 'lead'];

const demoCategories = [
  {
    name: 'Copper',
    slug: 'copper',
    description: 'Wire rods, cathodes, bus bars, round bars, and flats.',
    sortOrder: 10,
  },
  { name: 'Steel', slug: 'steel', description: 'Coils and industrial fabrication grades.', sortOrder: 20 },
  { name: 'Aluminium', slug: 'aluminium', description: 'Primary ingots and lightweight stock.', sortOrder: 30 },
  { name: 'Brass', slug: 'brass', description: 'Rods, sheets, and machined brass material.', sortOrder: 40 },
  { name: 'Iron', slug: 'iron', description: 'TMT rods, billets, and structural material.', sortOrder: 50 },
];

const demoProducts = [
  {
    name: 'Copper Cathode Sheets',
    slug: 'copper-cathode-sheets',
    description: 'Premium copper cathode sheets with dependable conductivity.',
    categorySlug: 'copper',
    price: 805,
    currency: 'USD',
    unit: 'kg',
    unitType: 'Sheet',
    weightPerUnit: 10,
    weightUnit: 'kg',
    moq: 5,
    stockQty: 140,
  },
  {
    name: 'Copper Wire Rods',
    slug: 'copper-wire-rods',
    description: 'High-conductivity copper wire rods for electrical and fabrication work.',
    categorySlug: 'copper',
    price: 825,
    currency: 'INR',
    unit: 'kg',
    unitType: 'Rod',
    weightPerUnit: 10,
    moq: 5,
    stockQty: 180,
  },
  {
    name: 'Copper Bus Bars',
    slug: 'copper-bus-bars',
    description: 'Precision copper bus bars for power distribution assemblies.',
    categorySlug: 'copper',
    price: 845,
    currency: 'INR',
    unit: 'kg',
    unitType: 'Bar',
    weightPerUnit: 8,
    moq: 5,
    stockQty: 120,
  },
  {
    name: 'Copper Round Bars',
    slug: 'copper-round-bars',
    description: 'Machining-grade copper round bars for industrial components.',
    categorySlug: 'copper',
    price: 832,
    currency: 'INR',
    unit: 'kg',
    unitType: 'Bar',
    weightPerUnit: 12,
    moq: 5,
    stockQty: 150,
  },
  {
    name: 'Copper Flats',
    slug: 'copper-flats',
    description: 'Copper flats for fabrication, earthing, and connector systems.',
    categorySlug: 'copper',
    price: 818,
    currency: 'INR',
    unit: 'kg',
    unitType: 'Flat',
    weightPerUnit: 10,
    moq: 5,
    stockQty: 160,
  },
  {
    name: 'Copper Pipes',
    slug: 'copper-pipes',
    description: 'Copper pipes for plumbing, HVAC, and industrial fluid systems.',
    categorySlug: 'copper',
    price: 812,
    currency: 'INR',
    unit: 'kg',
    unitType: 'Pipe',
    weightPerUnit: 10,
    moq: 5,
    stockQty: 130,
  },
  {
    name: 'Copper Tubes',
    slug: 'copper-tubes',
    description: 'Copper tubes for heat exchange, cooling, and precision assemblies.',
    categorySlug: 'copper',
    price: 820,
    currency: 'INR',
    unit: 'kg',
    unitType: 'Tube',
    weightPerUnit: 10,
    moq: 5,
    stockQty: 145,
  },
  {
    name: 'Mild Steel Coils',
    slug: 'mild-steel-coils',
    description: 'Fabrication-ready mild steel coils for manufacturing lines.',
    categorySlug: 'steel',
    price: 62,
    currency: 'USD',
    unit: 'kg',
    unitType: 'Coil',
    weightPerUnit: 15,
    weightUnit: 'kg',
    moq: 2,
    stockQty: 400,
  },
  {
    name: 'Aluminium Ingots',
    slug: 'aluminium-ingots',
    description: 'Primary aluminium ingots for casting and lightweight assemblies.',
    categorySlug: 'aluminium',
    price: 245,
    currency: 'USD',
    unit: 'g',
    unitType: 'Ingot',
    weightPerUnit: 20,
    weightUnit: 'g',
    moq: 10,
    stockQty: 220,
  },
  {
    name: 'Brass Rods',
    slug: 'brass-rods',
    description: 'Precision brass rods for machining, fittings, and components.',
    categorySlug: 'brass',
    price: 540,
    currency: 'USD',
    unit: 'kg',
    unitType: 'Rod',
    weightPerUnit: 18,
    weightUnit: 'kg',
    moq: 5,
    stockQty: 95,
  },
  {
    name: 'Iron TMT Bars',
    slug: 'iron-tmt-bars',
    description: 'Construction-grade iron TMT bars for structural projects.',
    categorySlug: 'iron',
    price: 58,
    currency: 'USD',
    unit: 'kg',
    unitType: 'Bar',
    weightPerUnit: 12,
    weightUnit: 'kg',
    moq: 25,
    stockQty: 500,
  },
];

async function ensureDevCatalog() {
  if (process.env.DEV_BOOTSTRAP_CATALOG === 'false') return;

  const removedCategories = await Category.find({ slug: { $in: removedCatalogCategorySlugs } }).select('_id');
  if (removedCategories.length > 0) {
    await Product.deleteMany({ category: { $in: removedCategories.map((category) => category._id) } });
  }
  await Category.deleteMany({ slug: { $in: removedCatalogCategorySlugs } });

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
  if (process.env.SUPER_ADMIN_EMAIL && process.env.SUPER_ADMIN_PASSWORD) {
    const email = process.env.SUPER_ADMIN_EMAIL;
    const existing = await User.findOne({ email });

    if (existing) {
      existing.name = process.env.SUPER_ADMIN_NAME || existing.name || 'Super Admin';
      existing.role = 'super_admin';
      existing.password = process.env.SUPER_ADMIN_PASSWORD;
      await existing.save();
      console.log(`Updated configured super admin: ${email}`);
    } else {
      await User.create({
        name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
        email,
        password: process.env.SUPER_ADMIN_PASSWORD,
        role: 'super_admin',
      });
      console.log(`Created configured super admin: ${email}`);
    }
  }

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

  const customerExists = await User.findOne({ email: DEV_CUSTOMER_EMAIL });
  if (!customerExists) {
    await User.create({
      name: 'Local Customer',
      email: DEV_CUSTOMER_EMAIL,
      password: DEV_CUSTOMER_PASSWORD,
      role: 'user',
    });
    console.log(`Created local customer: ${DEV_CUSTOMER_EMAIL}`);
  }

  const teamAccounts = [
    { name: 'Local LQT Lead', email: DEV_LQT_EMAIL, role: 'lqt' },
    { name: 'Local Sales Lead', email: DEV_SALES_EMAIL, role: 'sales' },
    { name: 'Local Procurement Lead', email: DEV_PROCUREMENT_EMAIL, role: 'procurement' },
    { name: 'Local Developer', email: DEV_DEVELOPER_EMAIL, role: 'developer' },
  ];

  for (const account of teamAccounts) {
    const exists = await User.findOne({ email: account.email });
    if (!exists) {
      await User.create({
        ...account,
        password: DEV_ADMIN_PASSWORD,
      });
      console.log(`Created local ${account.role} account: ${account.email}`);
    }
  }

  await ensureDevCatalog();
};
