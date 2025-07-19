import { Product } from '@/types';
import { handleApiError } from '@/utils/apiUtils';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export interface RecommendationResponse {
  success: boolean;
  data: Product[];
  message: string;
}

export interface ProductRecommendationsResponse {
  success: boolean;
  data: {
    similar: Product[];
    frequentlyBought: Product[];
    viewedTogether: Product[];
  };
  message: string;
}

export const getPopularProducts = async (limit: number = 8): Promise<RecommendationResponse> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/recommendations/popular?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: 300, 
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    const errorMessage = handleApiError(error, 'Popüler ürünler yüklenirken hata oluştu');
    throw new Error(errorMessage);
  }
};

export const getSimilarProducts = async (productId: string, limit: number = 4): Promise<RecommendationResponse> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/recommendations/similar/${productId}?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: 600, 
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    const errorMessage = handleApiError(error, 'Benzer ürünler yüklenirken hata oluştu');
    throw new Error(errorMessage);
  }
};

export const getFrequentlyBoughtTogether = async (productId: string, limit: number = 4): Promise<RecommendationResponse> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/recommendations/frequently-bought/${productId}?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: 1800, 
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    const errorMessage = handleApiError(error, 'Sıkça birlikte alınan ürünler yüklenirken hata oluştu');
    throw new Error(errorMessage);
  }
};

export const getViewedTogether = async (productId: string, limit: number = 4): Promise<RecommendationResponse> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/recommendations/viewed-together/${productId}?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: 300, 
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    const errorMessage = handleApiError(error, 'Birlikte görüntülenen ürünler yüklenirken hata oluştu');
    throw new Error(errorMessage);
  }
};

export const getPersonalizedRecommendations = async (userId: string, limit: number = 8, token?: string): Promise<RecommendationResponse> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BACKEND_URL}/api/recommendations/personalized/${userId}?limit=${limit}`, {
      method: 'GET',
      headers,
      next: {
        revalidate: 600, 
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    const errorMessage = handleApiError(error, 'Kişiselleştirilmiş öneriler yüklenirken hata oluştu');
    throw new Error(errorMessage);
  }
};

export const getProductRecommendations = async (productId: string): Promise<ProductRecommendationsResponse> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/recommendations/product/${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: 600, 
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    const errorMessage = handleApiError(error, 'Ürün önerileri yüklenirken hata oluştu');
    throw new Error(errorMessage);
  }
}; 