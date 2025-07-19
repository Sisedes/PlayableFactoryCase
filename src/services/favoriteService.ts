import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface FavoriteProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  stock: number;
  sku: string;
  status: 'draft' | 'active' | 'inactive';
  images: Array<{
    _id?: string;
    url: string;
    alt: string;
    isMain?: boolean;
  }>;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  averageRating?: number;
  reviewCount?: number;
  viewCount?: number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export const getFavoriteProducts = async (token: string): Promise<ApiResponse<FavoriteProduct[]>> => {
  try {
    const response = await axios.get(`${API_URL}/api/users/favorites`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      data: response.data.data
    };
  } catch (error: any) {
    console.error('Get favorite products error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Favori ürünler getirilemedi'
    };
  }
};

export const addToFavorites = async (productId: string, token: string): Promise<ApiResponse<null>> => {
  try {
    const response = await axios.post(`${API_URL}/api/users/favorites`, 
      { productId }, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      message: response.data.message
    };
  } catch (error: any) {
    console.error('Add to favorites error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Ürün favorilere eklenirken hata oluştu'
    };
  }
};

export const removeFromFavorites = async (productId: string, token: string): Promise<ApiResponse<null>> => {
  try {
    const response = await axios.delete(`${API_URL}/api/users/favorites/${productId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      message: response.data.message
    };
  } catch (error: any) {
    console.error('Remove from favorites error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Ürün favorilerden çıkarılırken hata oluştu'
    };
  }
};

export const checkFavoriteStatus = async (productId: string, token: string): Promise<ApiResponse<{ isFavorite: boolean }>> => {
  try {
    const response = await axios.get(`${API_URL}/api/users/favorites/${productId}/check`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      data: response.data.data
    };
  } catch (error: any) {
    console.error('Check favorite status error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Favori durumu kontrol edilemedi'
    };
  }
}; 