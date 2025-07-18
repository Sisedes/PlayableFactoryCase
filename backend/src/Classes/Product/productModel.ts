import mongoose, { Schema, Model } from 'mongoose';
import { IProduct, IProductImage, IProductVariant, IVariantOption } from '../../types';

const productImageSchema = new Schema<IProductImage>({
  url: {
    type: String,
    required: [true, 'Resim URL gereklidir'],
    trim: true
  },
  alt: {
    type: String,
    required: [true, 'Alt text gereklidir'],
    trim: true,
    maxlength: 200
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0,
    min: 0
  }
});

const variantOptionSchema = new Schema<IVariantOption>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  value: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  }
});

const productVariantSchema = new Schema<IProductVariant>({
  name: {
    type: String,
    required: [true, 'Varyant adı gereklidir'],
    trim: true,
    maxlength: 100
  },
  options: {
    type: [variantOptionSchema],
    required: true,
    validate: {
      validator: function(v: IVariantOption[]) {
        return v && v.length > 0;
      },
      message: 'En az bir varyant seçeneği gereklidir'
    }
  },
  sku: {
    type: String,
    required: [true, 'SKU gereklidir'],
    trim: true,
    maxlength: 50
  },
  price: {
    type: Number,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  image: {
    type: String,
    trim: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
});

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: [true, 'Ürün adı gereklidir'],
    trim: true,
    maxlength: [200, 'Ürün adı 200 karakterden fazla olamaz']
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
    required: [true, 'Ürün açıklaması gereklidir'],
    trim: true,
    maxlength: [2000, 'Açıklama 2000 karakterden fazla olamaz']
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'Kısa açıklama 500 karakterden fazla olamaz']
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Kategori gereklidir']
  },
  price: {
    type: Number,
    required: [true, 'Fiyat gereklidir'],
    min: [0, 'Fiyat negatif olamaz']
  },
  salePrice: {
    type: Number,
    min: [0, 'İndirimli fiyat negatif olamaz'],
    validate: {
      validator: function(this: IProduct, value: number) {
        return !value || value < this.price;
      },
      message: 'İndirimli fiyat normal fiyattan düşük olmalıdır'
    }
  },
  currency: {
    type: String,
    default: 'TRY',
    enum: ['TRY', 'USD', 'EUR']
  },
  sku: {
    type: String,
    required: [true, 'SKU gereklidir'],
    unique: true,
    trim: true,
    maxlength: 50
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  trackQuantity: {
    type: Boolean,
    default: true
  },
  lowStockThreshold: {
    type: Number,
    default: 5,
    min: 0
  },
  images: {
    type: [productImageSchema],
    validate: {
      validator: function(v: IProductImage[]) {
        return v && v.length > 0;
      },
      message: 'En az bir ürün resmi gereklidir'
    }
  },
  variants: {
    type: [productVariantSchema],
    default: []
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive'],
    default: 'draft',
    required: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ salePrice: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

productSchema.index({ category: 1, status: 1, price: 1 });
productSchema.index({ status: 1, isFeatured: 1, averageRating: -1 });

productSchema.virtual('finalPrice').get(function(this: IProduct) {
  return this.salePrice || this.price;
});

productSchema.virtual('discountPercentage').get(function(this: IProduct) {
  if (this.salePrice && this.salePrice < this.price) {
    return Math.round(((this.price - this.salePrice) / this.price) * 100);
  }
  return 0;
});

productSchema.virtual('isInStock').get(function(this: IProduct) {
  if (!this.trackQuantity) return true;
  return this.stock > 0;
});

productSchema.virtual('isLowStock').get(function(this: IProduct) {
  if (!this.trackQuantity) return false;
  return this.stock <= this.lowStockThreshold && this.stock > 0;
});

productSchema.virtual('primaryImage').get(function(this: IProduct) {
  if (!this.images || this.images.length === 0) return null;
  return this.images.find(img => img.isPrimary) || this.images[0];
});

productSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }

  if (this.isModified('images')) {
    const primaryImages = this.images.filter(img => img.isPrimary);
    if (primaryImages.length > 1) {
      this.images.forEach((img, index) => {
        if (index > 0 && img.isPrimary) {
          img.isPrimary = false;
        }
      });
    } else if (primaryImages.length === 0 && this.images.length > 0) {
      this.images[0].isPrimary = true;
    }
  }

  if (this.isModified('variants') && this.variants.length > 0) {
    const defaultVariants = this.variants.filter(variant => variant.isDefault);
    if (defaultVariants.length > 1) {
      this.variants.forEach((variant, index) => {
        if (index > 0 && variant.isDefault) {
          variant.isDefault = false;
        }
      });
    } else if (defaultVariants.length === 0) {
      this.variants[0].isDefault = true;
    }
  }

  next();
});

productSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

productSchema.statics.findByCategory = function(categoryId: string) {
  return this.find({ category: categoryId, status: 'active' });
};

productSchema.statics.findFeatured = function() {
  return this.find({ status: 'active', isFeatured: true }).sort({ averageRating: -1 });
};

productSchema.statics.findBySlug = function(slug: string) {
  return this.findOne({ slug, status: 'active' }).populate('category');
};

productSchema.statics.findInStock = function() {
  return this.find({
    status: 'active',
    $or: [
      { trackQuantity: false },
      { stock: { $gt: 0 } }
    ]
  });
};

productSchema.methods.updateRating = function(newRating: number, oldRating?: number) {
  const updates: any = {};
  
  if (oldRating) {
    const totalRating = (this.averageRating * this.reviewCount) - oldRating + newRating;
    updates.averageRating = totalRating / this.reviewCount;
  } else {
    const totalRating = (this.averageRating * this.reviewCount) + newRating;
    updates.reviewCount = this.reviewCount + 1;
    updates.averageRating = totalRating / updates.reviewCount;
  }
  
  return this.updateOne(updates);
};

const Product: Model<IProduct> = mongoose.model<IProduct>('Product', productSchema);

export default Product; 