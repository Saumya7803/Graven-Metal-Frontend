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
    currency: { type: String, default: 'USD', trim: true },
    unit: { type: String, default: 'kg', trim: true },
    unitType: { type: String, default: 'kg', trim: true },
    weightPerUnit: { type: Number, default: 1, min: 0.01 },
    weightUnit: { type: String, default: 'kg', trim: true },
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
  const weightUnit = String(this.weightUnit || this.unit || 'kg').toLowerCase();
  const conversion = {
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
  const multiplier = conversion[weightUnit] ?? 1;
  return Number(this.price || 0) * Number(this.weightPerUnit || 1) * multiplier;
});

export const Product = mongoose.model('Product', productSchema);
