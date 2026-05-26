import { Blog } from '../models/Blog.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { removeFromCloudinary, uploadBufferToCloudinary } from '../utils/cloudinaryUpload.js';

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

export const createBlog = asyncHandler(async (req, res) => {
  const payload = { ...req.body, author: req.user?._id };
  payload.published = String(payload.published ?? 'true') === 'true';
  payload.seo = {
    metaTitle: payload.metaTitle || '',
    metaDescription: payload.metaDescription || '',
    metaKeywords: payload.metaKeywords || '',
  };
  delete payload.metaTitle;
  delete payload.metaDescription;
  delete payload.metaKeywords;

  const exists = await Blog.findOne({ slug: payload.slug });
  if (exists) return res.status(400).json({ message: 'Blog slug already exists' });

  const uploaded = await uploadBufferToCloudinary(req.file, {
    folder: 'graven-metal/blogs',
    resourceType: 'image',
    allowedMime: imageMimeTypes,
  });

  if (uploaded) {
    payload.thumbnail = { url: uploaded.url, publicId: uploaded.publicId };
  } else if (payload.coverImage) {
    payload.thumbnail = { url: payload.coverImage, publicId: '' };
  }

  const blog = await Blog.create(payload);
  const created = await Blog.findById(blog._id).populate('author', 'name role');
  res.status(201).json(created);
});

export const getBlogs = asyncHandler(async (req, res) => {
  const { published = 'true', limit } = req.query;
  const filter = {};
  if (published !== 'all') filter.published = published === 'true';

  let query = Blog.find(filter).populate('author', 'name role').sort({ createdAt: -1 });
  if (limit) query = query.limit(Number(limit));

  const blogs = await query;
  res.json(blogs);
});

export const getLatestBlogs = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit || 6);
  const blogs = await Blog.find({ published: true })
    .populate('author', 'name role')
    .sort({ createdAt: -1 })
    .limit(limit);

  res.json(blogs);
});

export const getBlogById = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate('author', 'name role');
  if (!blog) return res.status(404).json({ message: 'Blog not found' });
  res.json(blog);
});

export const getBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug }).populate('author', 'name role');
  if (!blog) return res.status(404).json({ message: 'Blog not found' });
  res.json(blog);
});

export const updateBlog = asyncHandler(async (req, res) => {
  const existing = await Blog.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Blog not found' });

  const payload = { ...req.body };
  if (payload.published !== undefined) payload.published = String(payload.published) === 'true';
  if (payload.metaTitle || payload.metaDescription || payload.metaKeywords) {
    payload.seo = {
      metaTitle: payload.metaTitle || existing.seo?.metaTitle || '',
      metaDescription: payload.metaDescription || existing.seo?.metaDescription || '',
      metaKeywords: payload.metaKeywords || existing.seo?.metaKeywords || '',
    };
  }
  delete payload.metaTitle;
  delete payload.metaDescription;
  delete payload.metaKeywords;

  if (payload.slug && payload.slug !== existing.slug) {
    const duplicate = await Blog.findOne({ slug: payload.slug, _id: { $ne: existing._id } });
    if (duplicate) return res.status(400).json({ message: 'Blog slug already exists' });
  }

  if (req.file) {
    if (existing.thumbnail?.publicId) {
      await removeFromCloudinary(existing.thumbnail.publicId, 'image');
    }
    const uploaded = await uploadBufferToCloudinary(req.file, {
      folder: 'graven-metal/blogs',
      resourceType: 'image',
      allowedMime: imageMimeTypes,
    });
    if (uploaded) {
      payload.thumbnail = { url: uploaded.url, publicId: uploaded.publicId };
    }
  } else if (payload.coverImage) {
    payload.thumbnail = { url: payload.coverImage, publicId: existing.thumbnail?.publicId || '' };
  }

  const blog = await Blog.findByIdAndUpdate(req.params.id, payload, {
    returnDocument: 'after',
    runValidators: true,
  }).populate('author', 'name role');

  res.json(blog);
});

export const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).json({ message: 'Blog not found' });

  if (blog.thumbnail?.publicId) {
    await removeFromCloudinary(blog.thumbnail.publicId, 'image');
  }

  await blog.deleteOne();
  res.json({ message: 'Blog removed' });
});
