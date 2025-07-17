import { Category } from '@/types';

const API_BASE = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
  total?: number;
}


export const getAllCategories = async (): Promise<ApiResponse<Category[]>> => {
  try {
    const response = await fetch(`${API_BASE}/categories`, {
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
    console.error('getAllCategories error:', error);
    throw new Error('Kategoriler getirilirken hata oluştu');
  }
};


export const getCategoryBySlug = async (slug: string): Promise<ApiResponse<Category>> => {
  try {
    if (!slug) {
      throw new Error('Kategori slug gereklidir');
    }

    const response = await fetch(`${API_BASE}/categories/${encodeURIComponent(slug)}`, {
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
    console.error('getCategoryBySlug error:', error);
    throw error;
  }
};


export const getCategoryStats = async (): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE}/categories/stats`, {
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
    console.error('getCategoryStats error:', error);
    throw new Error('Kategori istatistikleri getirilirken hata oluştu');
  }
};


export const getActiveCategories = async (): Promise<ApiResponse<Category[]>> => {
  try {
    const allCategories = await getAllCategories();
    
    const activeCategories = allCategories.data.filter(category => category.active);
    
    return {
      ...allCategories,
      data: activeCategories,
      count: activeCategories.length
    };
  } catch (error) {
    console.error('getActiveCategories error:', error);
    throw new Error('Aktif kategoriler getirilirken hata oluştu');
  }
};

export type { ApiResponse }; 