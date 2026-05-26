import mongoose from 'mongoose';

const thumbnailSchema = new mongoose.Schema(
  {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
  { _id: false }
);

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    thumbnail: { type: thumbnailSchema, default: () => ({}) },
    published: { type: Boolean, default: true, index: true },
    seo: {
      metaTitle: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
      metaKeywords: { type: String, default: '' },
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

blogSchema.virtual('coverImage').get(function getCoverImage() {
  return this.thumbnail?.url || '';
});

blogSchema.set('toJSON', { virtuals: true });
blogSchema.set('toObject', { virtuals: true });

export const Blog = mongoose.model('Blog', blogSchema);
