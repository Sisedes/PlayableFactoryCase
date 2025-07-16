import mongoose, { Schema, Model } from 'mongoose';
import { IOrder, IOrderItem, IAddress } from '../../types';

const addressSchema = new Schema<IAddress>({
  type: { type: String, enum: ['home', 'work', 'other'], default: 'home' },
  title: { type: String, required: true, trim: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  company: { type: String, trim: true },
  address1: { type: String, required: true, trim: true },
  address2: { type: String, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  postalCode: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true, default: 'Türkiye' },
  phone: { type: String, trim: true },
  isDefault: { type: Boolean, default: false }
}, { _id: false });

const orderItemSchema = new Schema<IOrderItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variant: {
    type: Schema.Types.ObjectId,
    ref: 'Product.variants'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    trim: true
  }
});

const orderSchema = new Schema<IOrder>({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    sparse: true
  },
  customerInfo: {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    }
  },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: function(v: IOrderItem[]) {
        return v && v.length > 0;
      },
      message: 'Sipariş en az bir ürün içermelidir'
    }
  },
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    tax: {
      type: Number,
      required: true,
      min: 0
    },
    shipping: {
      type: Number,
      required: true,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  },
  addresses: {
    billing: {
      type: addressSchema,
      required: true
    },
    shipping: {
      type: addressSchema,
      required: true
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['credit_card', 'paypal', 'bank_transfer', 'cash_on_delivery'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      required: true
    },
    transactionId: {
      type: String,
      trim: true
    },
    paidAt: {
      type: Date
    }
  },
  fulfillment: {
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      required: true
    },
    trackingNumber: {
      type: String,
      trim: true
    },
    carrier: {
      type: String,
      trim: true
    },
    shippedAt: {
      type: Date
    },
    deliveredAt: {
      type: Date
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000
    }
  },
  appliedCoupons: [{
    type: String,
    trim: true,
    uppercase: true
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: 2000
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ 'customerInfo.email': 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ 'fulfillment.status': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'payment.paidAt': -1 });

orderSchema.virtual('customerName').get(function(this: IOrder) {
  return `${this.customerInfo.firstName} ${this.customerInfo.lastName}`;
});

orderSchema.virtual('itemCount').get(function(this: IOrder) {
  return this.items.reduce((total: number, item: IOrderItem) => total + item.quantity, 0);
});

orderSchema.virtual('isCompleted').get(function(this: IOrder) {
  return this.fulfillment.status === 'delivered';
});

orderSchema.virtual('isCancelled').get(function(this: IOrder) {
  return this.fulfillment.status === 'cancelled';
});

orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});

orderSchema.statics.findByOrderNumber = function(orderNumber: string) {
  return this.findOne({ orderNumber }).populate('items.product');
};

orderSchema.statics.findByUser = function(userId: string) {
  return this.find({ user: userId }).sort({ createdAt: -1 });
};

orderSchema.statics.findByStatus = function(status: string) {
  return this.find({ 'fulfillment.status': status }).sort({ createdAt: -1 });
};

orderSchema.statics.findPending = function() {
  return this.find({ 'fulfillment.status': 'pending' }).sort({ createdAt: 1 });
};

orderSchema.methods.updatePaymentStatus = function(status: 'pending' | 'paid' | 'failed' | 'refunded', transactionId?: string) {
  this.payment.status = status;
  if (transactionId) {
    this.payment.transactionId = transactionId;
  }
  if (status === 'paid') {
    this.payment.paidAt = new Date();
    if (this.fulfillment.status === 'pending') {
      this.fulfillment.status = 'confirmed';
    }
  }
  return this.save();
};

orderSchema.methods.updateFulfillmentStatus = function(status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled', trackingNumber?: string, carrier?: string) {
  this.fulfillment.status = status;
  
  if (trackingNumber) {
    this.fulfillment.trackingNumber = trackingNumber;
  }
  
  if (carrier) {
    this.fulfillment.carrier = carrier;
  }
  
  if (status === 'shipped') {
    this.fulfillment.shippedAt = new Date();
  } else if (status === 'delivered') {
    this.fulfillment.deliveredAt = new Date();
  }
  
  return this.save();
};

const Order: Model<IOrder> = mongoose.model<IOrder>('Order', orderSchema);

export default Order; 