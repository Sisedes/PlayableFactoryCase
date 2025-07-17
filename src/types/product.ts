export type ProductImage = {
  _id?: string;
  url: string;
  alt: string;
  isMain?: boolean;
  isPrimary?: boolean;
  sortOrder?: number;
};

export type Product = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  price: number;
  salePrice?: number;
  currency?: string;
  sku: string;
  stock: number;
  trackQuantity?: boolean;
  lowStockThreshold?: number;
  images: ProductImage[];
  tags?: string[];
  status: 'draft' | 'active' | 'inactive';
  isFeatured?: boolean;
  averageRating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
};
