import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { removeFromCloudinary, uploadBufferToCloudinary } from '../utils/cloudinaryUpload.js';

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

export const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, description, sortOrder, metaTitle, metaDescription } = req.body;

  const exists = await Category.findOne({ $or: [{ name }, { slug }] });
  if (exists) return res.status(400).json({ message: 'Category name or slug already exists' });

  const payload = { name, slug, description, sortOrder, metaTitle, metaDescription };
  const uploaded = await uploadBufferToCloudinary(req.file, {
    folder: 'graven-metal/categories',
    resourceType: 'image',
    allowedMime: imageMimeTypes,
  });

  if (uploaded) payload.image = { url: uploaded.url, publicId: uploaded.publicId };

  const category = await Category.create(payload);
  res.status(201).json(category);
});

export const getCategories = asyncHandler(async (req, res) => {
  const { includeProducts } = req.query;

  const categories = await Category.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
  const ids = categories.map((c) => c._id);

  const counts = await Product.aggregate([
    { $match: { category: { $in: ids } } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  const countMap = new Map(counts.map((x) => [String(x._id), x.count]));

  let productsByCategory = new Map();
  if (includeProducts === 'true') {
    const products = await Product.find({ category: { $in: ids } })
      .select('name slug price currency unit image inStock stockQty category')
      .sort({ createdAt: -1 })
      .lean();

    productsByCategory = products.reduce((acc, p) => {
      const key = String(p.category);
      if (!acc.has(key)) acc.set(key, []);
      acc.get(key).push(p);
      return acc;
    }, new Map());
  }

  const payload = categories.map((cat) => ({
    ...cat,
    productCount: countMap.get(String(cat._id)) || 0,
    products: includeProducts === 'true' ? productsByCategory.get(String(cat._id)) || [] : undefined,
  }));

  res.json(payload);
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id).lean();
  if (!category) return res.status(404).json({ message: 'Category not found' });

  const products = await Product.find({ category: category._id })
    .select('name slug price currency unit image inStock stockQty')
    .sort({ createdAt: -1 });

  res.json({
    ...category,
    productCount: products.length,
    products,
  });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { name, slug, description, sortOrder, metaTitle, metaDescription } = req.body;

  if (name || slug) {
    const dup = await Category.findOne({
      _id: { $ne: req.params.id },
      $or: [
        ...(name ? [{ name }] : []),
        ...(slug ? [{ slug }] : []),
      ],
    });

    if (dup) return res.status(400).json({ message: 'Category name or slug already exists' });
  }

  const existing = await Category.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Category not found' });

  const payload = { name, slug, description, sortOrder, metaTitle, metaDescription };
  Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

  if (req.file) {
    if (existing.image?.publicId) {
      await removeFromCloudinary(existing.image.publicId, 'image');
    }
    const uploaded = await uploadBufferToCloudinary(req.file, {
      folder: 'graven-metal/categories',
      resourceType: 'image',
      allowedMime: imageMimeTypes,
    });
    if (uploaded) payload.image = { url: uploaded.url, publicId: uploaded.publicId };
  }

  const category = await Category.findByIdAndUpdate(req.params.id, payload, {
    returnDocument: 'after',
    runValidators: true,
  });

  res.json(category);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ message: 'Category not found' });

  const linked = await Product.countDocuments({ category: category._id });
  if (linked > 0) {
    return res.status(400).json({
      message: 'Cannot delete category with linked products',
      linkedProducts: linked,
    });
  }

  if (category.image?.publicId) {
    await removeFromCloudinary(category.image.publicId, 'image');
  }

  await category.deleteOne();
  res.json({ message: 'Category removed' });
});
