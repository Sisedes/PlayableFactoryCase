// User Management Types
export interface User {
  id: string;
  email: string;
  password?: string;
  role: 'admin' | 'customer';
  profile: UserProfile;
  addresses: Address[];
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
}

export interface Address {
  id: string;
  userId: string;
  type: 'shipping' | 'billing';
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

export interface UserPreferences {
  favoriteCategories: string[];
  newsletter: boolean;
  language: string;
  currency: string;
}

// Product Catalog Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  category: Category;
  subcategory?: string;
  stock: number;
  sku: string;
  images: ProductImage[];
  attributes: ProductAttribute[];
  tags: string[];
  featured: boolean;
  active: boolean;
  variants?: ProductVariant[];
  seo: SEOData;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  order: number;
  type: 'thumbnail' | 'gallery' | 'hero';
}

export interface ProductAttribute {
  name: string;
  value: string;
  type: 'text' | 'number' | 'boolean' | 'select';
}

export interface ProductVariant {
  id: string;
  name: string;
  type: 'size' | 'color' | 'material';
  value: string;
  priceModifier?: number;
  stockModifier?: number;
}

// Category Management Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  parentId?: string;
  children?: Category[];
  order: number;
  active: boolean;
  productCount?: number;
  seo: SEOData;
}

// Cart and Orders Types
export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedVariants?: { [key: string]: string };
  price: number;
  discountedPrice?: number;
  subtotal: number;
}

export interface Cart {
  id: string;
  userId?: string;
  sessionId?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  appliedCoupons?: Coupon[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  shippingAddress: Address;
  billingAddress: Address;
  tracking?: TrackingInfo;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem extends Omit<CartItem, 'id'> {
  orderItemId: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface TrackingInfo {
  trackingNumber: string;
  carrier: string;
  url?: string;
  estimatedDelivery?: Date;
}

// Review System Types
export interface Review {
  id: string;
  productId: string;
  userId: string;
  user: Pick<User, 'profile'>;
  rating: 1 | 2 | 3 | 4 | 5;
  title?: string;
  comment: string;
  approved: boolean;
  helpful: number;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key in 1 | 2 | 3 | 4 | 5]: number;
  };
}

// Coupon and Discount Types
export interface Coupon {
  id: string;
  code: string;
  name: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minimumAmount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  active: boolean;
}

// Recommendation System Types
export interface UserActivity {
  id: string;
  userId?: string;
  sessionId?: string;
  type: 'view' | 'add_to_cart' | 'purchase' | 'search';
  productId?: string;
  categoryId?: string;
  searchQuery?: string;
  timestamp: Date;
}

export interface ProductRecommendation {
  productId: string;
  score: number;
  reason: 'popular' | 'similar' | 'frequently_bought_together' | 'viewed_together' | 'user_history';
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
  pagination?: PaginationInfo;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  categoryId?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  inStock?: boolean;
  featured?: boolean;
  tags?: string[];
  sortBy?: 'name' | 'price' | 'rating' | 'created' | 'popular';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  products: Product[];
  filters: AvailableFilters;
  pagination: PaginationInfo;
}

export interface AvailableFilters {
  categories: Category[];
  priceRange: {
    min: number;
    max: number;
  };
  brands: string[];
  ratings: number[];
}

// SEO Types
export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

// Form Types (for React Hook Form + Zod)
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  acceptTerms: boolean;
  newsletter?: boolean;
}

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface CheckoutFormData {
  shippingAddress: Omit<Address, 'id' | 'userId'>;
  billingAddress?: Omit<Address, 'id' | 'userId'>;
  sameAsShipping: boolean;
  paymentMethod: string;
  notes?: string;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

// Component Props Types
export interface LoadingState {
  loading: boolean;
  error?: string | null;
}

export interface ModalState {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

// Admin Dashboard Types
export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  recentOrders: Order[];
  popularProducts: Product[];
  salesChart: ChartData[];
  orderStatusDistribution: StatusDistribution[];
}

export interface ChartData {
  date: string;
  value: number;
  label?: string;
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

// Utility Types
export type WithId<T> = T & { id: string };
export type WithTimestamps<T> = T & {
  createdAt: Date;
  updatedAt: Date;
};
export type CreateInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateInput<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>; 