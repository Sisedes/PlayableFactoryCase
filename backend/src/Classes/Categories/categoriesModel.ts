import mongoose, { Schema, Model } from 'mongoose';
import { ICategory } from '../../types';

const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: [true, 'Kategori adı gereklidir'],
    trim: true,
    maxlength: [100, 'Kategori adı 100 karakterden fazla olamaz'],
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9-]+$/, 'Slug sadece küçük harf, rakam ve tire içerebilir']
  },
  description: {
    type: String,
    required: [true, 'Kategori açıklaması gereklidir'],
    trim: true,
    maxlength: [500, 'Açıklama 500 karakterden fazla olamaz']
  },
  image: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true,
    required: true
  },
  sortOrder: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ sortOrder: 1 });
categorySchema.index({ name: 'text', description: 'text' });

categorySchema.virtual('productCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true
});

categorySchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') 
      .replace(/\s+/g, '-') 
      .trim();
  }
  next();
});

categorySchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
};

categorySchema.statics.findBySlug = function(slug: string) {
  return this.findOne({ slug, isActive: true });
};

const Category: Model<ICategory> = mongoose.model<ICategory>('Category', categorySchema);

export default Category; 