/**
 * Product Service - Ürün ile ilgili tüm API çağırılarını yönetir
 * Bu service frontend ile backend arasında temiz bir arayüz sağlar
 */

import { Product } from '@/types';

// API Base URL
const API_BASE = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
  total?: number;
  pages?: number;
  currentPage?: number;
  filters?: any;
}

interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

/**
 * Tüm ürünleri getirir (filtreleme, sayfalama, arama ile)
 */
export const getAllProducts = async (filters: ProductFilters = {}): Promise<ApiResponse<Product[]>> => {
  try {
    const queryParams = new URLSearchParams();
    
    // Filtreleri query parametrelerine dönüştür
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const url = queryString ? `${API_BASE}/products?${queryString}` : `${API_BASE}/products`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('getAllProducts error:', error);
    throw new Error('Ürünler getirilirken hata oluştu');
  }
};

/**
 * ID'ye göre tekil ürün getirir
 */
export const getProductById = async (id: string): Promise<ApiResponse<{ product: Product; relatedProducts: Product[] }>> => {
  try {
    if (!id) {
      throw new Error('Ürün ID gereklidir');
    }

    const response = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Ürün bulunamadı');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('getProductById error:', error);
    throw error;
  }
};

/**
 * Popüler ürünleri getirir
 */
export const getPopularProducts = async (limit: number = 8): Promise<ApiResponse<Product[]>> => {
  try {
    const response = await fetch(`${API_BASE}/products/popular?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('getPopularProducts error:', error);
    throw new Error('Popüler ürünler getirilirken hata oluştu');
  }
};

/**
 * En yeni ürünleri getirir
 */
export const getLatestProducts = async (limit: number = 8): Promise<ApiResponse<Product[]>> => {
  try {
    const response = await fetch(`${API_BASE}/products/latest?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('getLatestProducts error:', error);
    throw new Error('En yeni ürünler getirilirken hata oluştu');
  }
};

/**
 * Kategoriye göre ürünleri getirir
 */
export const getProductsByCategory = async (
  categoryId: string, 
  filters: Omit<ProductFilters, 'category'> = {}
): Promise<ApiResponse<Product[]>> => {
  try {
    if (!categoryId) {
      throw new Error('Kategori ID gereklidir');
    }

    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const url = queryString 
      ? `${API_BASE}/products/category/${encodeURIComponent(categoryId)}?${queryString}`
      : `${API_BASE}/products/category/${encodeURIComponent(categoryId)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Kategori bulunamadı');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('getProductsByCategory error:', error);
    throw error;
  }
};

/**
 * Ürün arama işlemi
 */
export const searchProducts = async (
  searchTerm: string, 
  filters: Omit<ProductFilters, 'search'> = {}
): Promise<ApiResponse<Product[]>> => {
  try {
    if (!searchTerm.trim()) {
      throw new Error('Arama terimi gereklidir');
    }

    const searchFilters = { ...filters, search: searchTerm.trim() };
    return await getAllProducts(searchFilters);
  } catch (error) {
    console.error('searchProducts error:', error);
    throw new Error('Ürün arama sırasında hata oluştu');
  }
};

/**
 * Fiyat aralığına göre ürünleri getirir
 */
export const getProductsByPriceRange = async (
  minPrice: number,
  maxPrice: number,
  filters: Omit<ProductFilters, 'minPrice' | 'maxPrice'> = {}
): Promise<ApiResponse<Product[]>> => {
  try {
    if (minPrice < 0 || maxPrice < 0 || minPrice > maxPrice) {
      throw new Error('Geçersiz fiyat aralığı');
    }

    const priceFilters = { ...filters, minPrice, maxPrice };
    return await getAllProducts(priceFilters);
  } catch (error) {
    console.error('getProductsByPriceRange error:', error);
    throw new Error('Fiyat aralığına göre ürünler getirilirken hata oluştu');
  }
};

/**
 * Stokta olan ürünleri getirir
 */
export const getInStockProducts = async (
  filters: Omit<ProductFilters, 'inStock'> = {}
): Promise<ApiResponse<Product[]>> => {
  try {
    const stockFilters = { ...filters, inStock: true };
    return await getAllProducts(stockFilters);
  } catch (error) {
    console.error('getInStockProducts error:', error);
    throw new Error('Stokta olan ürünler getirilirken hata oluştu');
  }
};

// Export types for use in other files
export type { ProductFilters, ApiResponse }; 