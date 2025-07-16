import mongoose, { Schema, Model } from 'mongoose';
import { ICart, ICartItem } from '../../types';

const cartItemSchema = new Schema<ICartItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Ürün gereklidir']
  },
  variant: {
    type: Schema.Types.ObjectId,
    ref: 'Product.variants'
  },
  quantity: {
    type: Number,
    required: [true, 'Miktar gereklidir'],
    min: [1, 'Miktar en az 1 olmalıdır'],
    max: [999, 'Miktar 999\'dan fazla olamaz']
  },
  price: {
    type: Number,
    required: [true, 'Fiyat gereklidir'],
    min: [0, 'Fiyat negatif olamaz']
  },
  total: {
    type: Number,
    required: [true, 'Toplam gereklidir'],
    min: [0, 'Toplam negatif olamaz']
  }
});

const cartSchema = new Schema<ICart>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    sparse: true 
  },
  sessionId: {
    type: String,
    trim: true,
    sparse: true 
  },
  items: {
    type: [cartItemSchema],
    default: [],
    validate: {
      validator: function(v: ICartItem[]) {
        return v.length <= 50; 
      },
      message: 'Sepette en fazla 50 ürün olabilir'
    }
  },
  totals: {
    subtotal: {
      type: Number,
      default: 0,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    shipping: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  appliedCoupons: [{
    type: String,
    trim: true,
    uppercase: true
  }],
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

cartSchema.index({ user: 1 }, { sparse: true });
cartSchema.index({ sessionId: 1 }, { sparse: true });
cartSchema.index({ expiresAt: 1 });
cartSchema.index({ updatedAt: -1 });

cartSchema.index({ user: 1, sessionId: 1 }, { 
  partialFilterExpression: { 
    $or: [{ user: { $exists: true } }, { sessionId: { $exists: true } }] 
  } 
});

cartSchema.virtual('itemCount').get(function(this: ICart) {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

cartSchema.virtual('isEmpty').get(function(this: ICart) {
  return this.items.length === 0;
});

cartSchema.pre('save', function(next) {
  this.totals.subtotal = this.items.reduce((total, item) => total + item.total, 0);
  
  this.totals.tax = Math.round(this.totals.subtotal * 0.18 * 100) / 100;
  
  this.totals.shipping = this.totals.subtotal >= 500 ? 0 : 29.99;
  
  this.totals.total = this.totals.subtotal + this.totals.tax + this.totals.shipping - this.totals.discount;
  
  next();
});

cartSchema.pre('save', function(next) {
  for (const item of this.items) {
    const expectedTotal = Math.round(item.price * item.quantity * 100) / 100;
    if (Math.abs(item.total - expectedTotal) > 0.01) {
      item.total = expectedTotal;
    }
  }
  next();
});

cartSchema.statics.findByUser = function(userId: string) {
  return this.findOne({ user: userId }).populate('items.product');
};

cartSchema.statics.findBySession = function(sessionId: string) {
  return this.findOne({ sessionId }).populate('items.product');
};

cartSchema.statics.findActiveWithItems = function() {
  return this.find({
    'items.0': { $exists: true }, 
    expiresAt: { $gt: new Date() }
  });
};

cartSchema.methods.addItem = function(productId: string, quantity: number, price: number, variantId?: string) {
  const existingItemIndex = this.items.findIndex((item: ICartItem) => 
    item.product.toString() === productId && 
    (!variantId || item.variant?.toString() === variantId)
  );

  if (existingItemIndex > -1) {
    this.items[existingItemIndex].quantity += quantity;
    this.items[existingItemIndex].total = this.items[existingItemIndex].quantity * price;
  } else {
    this.items.push({
      product: productId as any,
      variant: variantId as any,
      quantity,
      price,
      total: quantity * price
    });
  }

  return this.save();
};

cartSchema.methods.updateItem = function(itemId: string, quantity: number) {
  const item = this.items.id(itemId);
  if (!item) {
    throw new Error('Ürün sepette bulunamadı');
  }

  if (quantity <= 0) {
    return this.removeItem(itemId);
  }

  item.quantity = quantity;
  item.total = item.quantity * item.price;
  
  return this.save();
};

cartSchema.methods.removeItem = function(itemId: string) {
  this.items.pull({ _id: itemId });
  return this.save();
};

cartSchema.methods.clearCart = function() {
  this.items = [];
  return this.save();
};

cartSchema.methods.mergeCarts = function(otherCart: ICart) {
  for (const otherItem of otherCart.items) {
    const existingItemIndex = this.items.findIndex((item: ICartItem) => 
      item.product.toString() === otherItem.product.toString() && 
      (!otherItem.variant || item.variant?.toString() === otherItem.variant?.toString())
    );

    if (existingItemIndex > -1) {
      this.items[existingItemIndex].quantity += otherItem.quantity;
      this.items[existingItemIndex].total = this.items[existingItemIndex].quantity * this.items[existingItemIndex].price;
    } else {
      this.items.push(otherItem);
    }
  }

  return this.save();
};

const Cart: Model<ICart> = mongoose.model<ICart>('Cart', cartSchema);

export default Cart; 