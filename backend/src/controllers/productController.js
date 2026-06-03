import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { removeFromCloudinary, uploadBufferToCloudinary } from '../utils/cloudinaryUpload.js';

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

function normalizeProductPayload(payload) {
  if (payload.price !== undefined) payload.price = Number(payload.price);
  if (payload.stockQty !== undefined) payload.stockQty = Number(payload.stockQty);
  if (payload.weightPerUnit !== undefined) payload.weightPerUnit = Number(payload.weightPerUnit);
  if (payload.moq !== undefined) payload.moq = Number(payload.moq);
  if (payload.weightUnit === undefined && payload.unit !== undefined) payload.weightUnit = String(payload.unit);
  if (payload.unitType !== undefined) payload.unitType = String(payload.unitType).trim();
  if (payload.unit !== undefined) payload.unit = String(payload.unit).trim();
  if (payload.weightUnit !== undefined) payload.weightUnit = String(payload.weightUnit).trim().toLowerCase();
  if (payload.weightUnit !== undefined && !payload.unit) payload.unit = payload.weightUnit;
  if (payload.unit && !payload.weightUnit) payload.weightUnit = payload.unit;
  return payload;
}

export const createProduct = asyncHandler(async (req, res) => {
  const payload = normalizeProductPayload({ ...req.body });
  const role = req.user?.role || 'user';

  const category = await Category.findById(payload.category);
  if (!category) return res.status(400).json({ message: 'Invalid category' });

  const uploaded = await uploadBufferToCloudinary(req.file, {
    folder: 'graven-metal/products',
    resourceType: 'image',
    allowedMime: imageMimeTypes,
  });

  if (uploaded) {
    payload.image = { url: uploaded.url, publicId: uploaded.publicId };
  }
  if (payload.stockQty !== undefined) payload.inStock = payload.stockQty > 0;
  payload.approvalStatus = role === 'data_entry' ? 'pending' : 'approved';
  payload.removalRequested = false;
  payload.removalRequestedAt = undefined;
  payload.removalRequestedBy = '';
  payload.reviewedBy = role === 'data_entry' ? '' : req.user?.email || '';
  payload.reviewedAt = role === 'data_entry' ? undefined : new Date();

  const product = await Product.create(payload);
  const created = await Product.findById(product._id).populate('category');
  res.status(201).json(created);
});

export const getProducts = asyncHandler(async (req, res) => {
  const { category, q, inStock } = req.query;
  const filter = {};

  if (category) filter.category = category;
  if (q) filter.name = { $regex: q, $options: 'i' };
  if (inStock !== undefined) filter.inStock = inStock === 'true';
  filter.$or = [{ approvalStatus: 'approved' }, { approvalStatus: { $exists: false } }];

  const products = await Product.find(filter).populate('category').sort({ createdAt: -1 });
  res.json(products);
});

export const getManagedProducts = asyncHandler(async (req, res) => {
  const { category, q, inStock } = req.query;
  const filter = {};

  if (category) filter.category = category;
  if (q) filter.name = { $regex: q, $options: 'i' };
  if (inStock !== undefined) filter.inStock = inStock === 'true';

  const products = await Product.find(filter).populate('category').sort({ createdAt: -1 });
  res.json(products);
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category');
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const existing = await Product.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Product not found' });

  const payload = normalizeProductPayload({ ...req.body });
  const role = req.user?.role || 'user';

  if (payload.category) {
    const category = await Category.findById(payload.category);
    if (!category) return res.status(400).json({ message: 'Invalid category' });
  }

  if (payload.stockQty !== undefined) payload.inStock = payload.stockQty > 0;
  if (role === 'data_entry') {
    payload.approvalStatus = 'pending';
    payload.reviewedBy = '';
    payload.reviewedAt = undefined;
  }

  if (req.file) {
    if (existing.image?.publicId) {
      await removeFromCloudinary(existing.image.publicId, 'image');
    }
    const uploaded = await uploadBufferToCloudinary(req.file, {
      folder: 'graven-metal/products',
      resourceType: 'image',
      allowedMime: imageMimeTypes,
    });
    if (uploaded) {
      payload.image = { url: uploaded.url, publicId: uploaded.publicId };
    }
  }

  const product = await Product.findByIdAndUpdate(req.params.id, payload, {
    returnDocument: 'after',
    runValidators: true,
  }).populate('category');

  res.json(product);
});

export const approveProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  product.approvalStatus = 'approved';
  product.reviewedBy = req.user?.email || '';
  product.reviewedAt = new Date();
  product.removalRequested = false;
  product.removalRequestedAt = undefined;
  product.removalRequestedBy = '';
  await product.save();

  const updated = await Product.findById(product._id).populate('category');
  res.json(updated);
});

export const rejectProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  product.approvalStatus = 'rejected';
  product.reviewedBy = req.user?.email || '';
  product.reviewedAt = new Date();
  await product.save();

  const updated = await Product.findById(product._id).populate('category');
  res.json(updated);
});

export const requestProductRemoval = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  product.removalRequested = true;
  product.removalRequestedAt = new Date();
  product.removalRequestedBy = req.user?.role || '';
  await product.save();

  const updated = await Product.findById(product._id).populate('category');
  res.json(updated);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  if (product.image?.publicId) {
    await removeFromCloudinary(product.image.publicId, 'image');
  }

  await product.deleteOne();
  res.json({ message: 'Product removed' });
});
