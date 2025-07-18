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

export const getAllProducts = async (filters: ProductFilters = {}): Promise<ApiResponse<Product[]>> => {
  try {
    const queryParams = new URLSearchParams();
    
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

export const getAllProductsForAdmin = async (filters: ProductFilters & { status?: string } = {}, accessToken: string): Promise<ApiResponse<Product[]>> => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const url = queryString ? `${API_BASE}/products/admin/all?${queryString}` : `${API_BASE}/products/admin/all`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('getAllProductsForAdmin error:', error);
    throw new Error('Admin ürünleri getirilirken hata oluştu');
  }
};

/**
 * Admin: Ürün düzenle
 */
export const updateProductAdmin = async (productId: string, productData: FormData, accessToken: string): Promise<ApiResponse<Product>> => {
  try {
    const response = await fetch(`${API_BASE}/products/admin/${productId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: productData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('updateProductAdmin error:', error);
    throw new Error('Ürün güncellenirken hata oluştu');
  }
};

/**
 * Admin: Ürün sil
 */
export const deleteProductAdmin = async (productId: string, accessToken: string): Promise<ApiResponse<null>> => {
  try {
    const response = await fetch(`${API_BASE}/products/admin/${productId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('deleteProductAdmin error:', error);
    throw new Error('Ürün silinirken hata oluştu');
  }
};

/**
 * Admin: Toplu ürün işlemleri
 */
export const bulkUpdateProducts = async (productIds: string[], action: 'activate' | 'deactivate' | 'delete', accessToken: string): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE}/products/admin/bulk`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ productIds, action }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('bulkUpdateProducts error:', error);
    throw new Error('Toplu işlem sırasında hata oluştu');
  }
};

/**
 * Admin: Ürün resmi sil
 */
export const deleteProductImage = async (productId: string, imageId: string, accessToken: string): Promise<ApiResponse<Product>> => {
  try {
    const response = await fetch(`${API_BASE}/products/admin/${productId}/images/${imageId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Delete product image error:', error);
    throw new Error('Resim silinirken hata oluştu');
  }
};

// Stok Yönetimi Fonksiyonları

export const getStockHistory = async (
  productId: string,
  params: { page?: number; limit?: number },
  accessToken: string
): Promise<ApiResponse<any>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`${API_BASE}/products/admin/${productId}/stock-history?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get stock history error:', error);
    throw new Error('Stok geçmişi getirilirken hata oluştu');
  }
};

export const updateStock = async (
  productId: string,
  data: { newStock: number; reason?: string; notes?: string },
  accessToken: string
): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE}/products/admin/${productId}/stock`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Update stock error:', error);
    throw new Error('Stok güncellenirken hata oluştu');
  }
};

export const getLowStockAlerts = async (
  params: { page?: number; limit?: number },
  accessToken: string
): Promise<ApiResponse<any>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`${API_BASE}/products/admin/low-stock-alerts?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get low stock alerts error:', error);
    throw new Error('Düşük stok uyarıları getirilirken hata oluştu');
  }
};

export const getStockStatistics = async (
  params: { period?: number },
  accessToken: string
): Promise<ApiResponse<any>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.period) queryParams.append('period', params.period.toString());

    const response = await fetch(`${API_BASE}/products/admin/stock-statistics?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get stock statistics error:', error);
    throw new Error('Stok istatistikleri getirilirken hata oluştu');
  }
};

/**
 * Yeni ürün oluştur (Admin)
 */
export const createProduct = async (productData: any, accessToken: string): Promise<ApiResponse<Product>> => {
  try {
    const response = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ürün oluşturulurken hata oluştu');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('createProduct error:', error);
    throw error;
  }
};

/**
 * Ürün güncelle (Admin)
 */
export const updateProduct = async (id: string, productData: any, accessToken: string): Promise<ApiResponse<Product>> => {
  try {
    if (!id) {
      throw new Error('Ürün ID gereklidir');
    }

    const response = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ürün güncellenirken hata oluştu');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('updateProduct error:', error);
    throw error;
  }
};

/**
 * Ürün sil (Admin)
 */
export const deleteProduct = async (id: string, accessToken: string): Promise<ApiResponse<any>> => {
  try {
    if (!id) {
      throw new Error('Ürün ID gereklidir');
    }

    const response = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ürün silinirken hata oluştu');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('deleteProduct error:', error);
    throw error;
  }
};

export type { ProductFilters, ApiResponse }; 