import { Document, Types } from 'mongoose';

// ===== USER TYPES =====
export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  role: 'customer' | 'admin';
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
  addresses: IAddress[];
  preferences: {
    favoriteCategories: Types.ObjectId[];
    favoriteProducts: Types.ObjectId[];
    newsletter: boolean;
  };
  authentication: {
    isEmailVerified: boolean;
    emailVerificationToken?: string;
    emailVerificationExpires?: Date | null;
    passwordResetToken?: string | null;
    passwordResetExpires?: Date | null;
    lastLogin?: Date;
    loginAttempts: number;
    lockUntil?: Date | null;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  fullName: string;
  isLocked: boolean;
  defaultAddress?: IAddress;
  
  comparePassword(candidatePassword: string): Promise<boolean>;
  createEmailVerificationToken(): string;
  createPasswordResetToken(): string;
  increaseLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
}

// User Model 
export interface IUserModel {
  findByEmail(email: string): Promise<IUser | null>;
  findActiveUsers(): Promise<IUser[]>;
  findByRole(role: 'customer' | 'admin'): Promise<IUser[]>;
}

export interface IAddress {
  _id?: Types.ObjectId;
  type: 'home' | 'work' | 'other';
  title: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

// ===== CATEGORY TYPES =====
export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// ===== PRODUCT TYPES =====
export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  category: Types.ObjectId;
  price: number;
  salePrice?: number;
  currency: string;
  sku: string;
  stock: number;
  trackQuantity: boolean;
  lowStockThreshold: number;
  images: IProductImage[];
  variants: IProductVariant[];
  tags: string[];
  status: 'draft' | 'active' | 'inactive';
  isFeatured: boolean;
  averageRating: number;
  reviewCount: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductImage {
  _id?: Types.ObjectId;
  url: string;
  alt: string;
  isPrimary: boolean;
  isMain: boolean;
  sortOrder: number;
}

export interface IProductVariant {
  _id?: Types.ObjectId;
  name: string;
  options: IVariantOption[];
  sku: string;
  price?: number;
  salePrice?: number;
  stock: number;
  image?: string;
  isDefault: boolean;
}

export interface IVariantOption {
  name: string;
  value: string;
}

// ===== CART TYPES =====
export interface ICart extends Document {
  _id: Types.ObjectId;
  user?: Types.ObjectId;
  sessionId?: string;
  items: ICartItem[];
  totals: {
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
  };
  appliedCoupons: string[];
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Cart metodları
  addItem(productId: string, quantity: number, variantId?: string): Promise<ICart>;
  updateItem(itemId: string, quantity: number): Promise<ICart>;
  removeItem(itemId: string): Promise<ICart>;
  clearCart(): Promise<ICart>;
  mergeCarts(otherCart: ICart): Promise<ICart>;
}

export interface ICartItem {
  _id?: Types.ObjectId;
  product: Types.ObjectId;
  variant?: Types.ObjectId;
  quantity: number;
  price: number;
  total: number;
}

// ===== ORDER TYPES =====
export interface IOrder extends Document {
  _id: Types.ObjectId;
  orderNumber: string;
  user?: Types.ObjectId;
  customerInfo: {
    email: string;
    phone?: string;
    firstName: string;
    lastName: string;
  };
  items: IOrderItem[];
  pricing: {
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
  };
  addresses: {
    billing: IAddress;
    shipping: IAddress;
  };
  payment: {
    method: 'credit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery';
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    transactionId?: string;
    paidAt?: Date;
  };
  fulfillment: {
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    trackingNumber?: string;
    carrier?: string;
    shippedAt?: Date;
    deliveredAt?: Date;
    notes?: string;
  };
  appliedCoupons?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItem {
  _id?: Types.ObjectId;
  product: Types.ObjectId;
  variant?: Types.ObjectId;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  total: number;
  image?: string;
}

// ===== REVIEW TYPES =====
export interface IReview extends Document {
  _id: Types.ObjectId;
  product: Types.ObjectId;
  user: Types.ObjectId;
  order?: Types.ObjectId;
  rating: number; // 1-5
  title?: string;
  comment?: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
  moderationNote?: string;
  helpfulVotes: {
    helpful: number;
    notHelpful: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// ===== USER ACTIVITY TYPES =====
export interface IUserActivity extends Document {
  _id: Types.ObjectId;
  user?: Types.ObjectId;
  sessionId?: string;
  type: 'view' | 'add_to_cart' | 'purchase' | 'wishlist_add' | 'search';
  product?: Types.ObjectId;
  category?: Types.ObjectId;
  searchQuery?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// ===== API RESPONSE TYPES =====
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  errors?: string[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  tags?: string[];
  rating?: number;
}

// ===== JWT TYPES =====
export interface IJWTPayload {
  userId: string;
  email: string;
  role: 'customer' | 'admin';
  iat?: number;
  exp?: number;
}

// ===== EMAIL TYPES =====
export interface IEmailTemplate {
  to: string;
  subject: string;
  template: string;
  data: any;
}

export type EmailType = 
  | 'welcome'
  | 'email_verification' 
  | 'password_reset'
  | 'order_confirmation'
  | 'order_shipped'
  | 'review_request';

// ===== UTILITY TYPES =====
export type SortOrder = 'asc' | 'desc';
export type UserRole = 'customer' | 'admin';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type ProductStatus = 'draft' | 'active' | 'inactive';
export type ReviewStatus = 'pending' | 'approved' | 'rejected'; 