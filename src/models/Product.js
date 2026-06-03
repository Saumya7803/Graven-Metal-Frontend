import mongoose from 'mongoose';

const productImageSchema = new mongoose.Schema(
  {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    unit: { type: String, default: 'kg' },
    unitType: { type: String, default: 'kg', trim: true },
    weightPerUnit: { type: Number, default: 1, min: 0.01 },
    moq: { type: Number, default: 1, min: 1 },
    image: { type: productImageSchema, default: () => ({}) },
    stockQty: { type: Number, default: 0, min: 0 },
    inStock: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.pre('save', function syncStock() {
  this.inStock = this.stockQty > 0;
});

productSchema.virtual('unitPrice').get(function unitPrice() {
  return Number(this.price || 0) * Number(this.weightPerUnit || 1);
});

export const Product = mongoose.model('Product', productSchema);
