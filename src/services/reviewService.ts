const API_BASE = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
  total?: number;
  pages?: number;
  currentPage?: number;
}

export interface ReviewAdmin {
  _id: string;
  product: {
    _id: string;
    name: string;
    slug: string;
    images: any[];
  };
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  rating: number;
  title?: string;
  comment?: string;
  status: 'pending' | 'approved' | 'rejected';
  moderationNote?: string;
  createdAt: string;
  updatedAt: string;
}

export const getPendingReviews = async (
  accessToken: string,
  page: number = 1,
  limit: number = 10
): Promise<ApiResponse<ReviewAdmin[]>> => {
  try {
    const response = await fetch(`${API_BASE}/reviews/pending?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Bekleyen yorumlar getirilirken hata oluştu');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('getPendingReviews error:', error);
    throw error;
  }
};

export const getAllReviewsAdmin = async (
  accessToken: string,
  page: number = 1,
  limit: number = 10,
  status?: string,
  productId?: string
): Promise<ApiResponse<ReviewAdmin[]>> => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status && status !== 'all') {
      queryParams.append('status', status);
    }
    if (productId) {
      queryParams.append('productId', productId);
    }

    const response = await fetch(`${API_BASE}/reviews/admin/all?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Yorumlar getirilirken hata oluştu');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('getAllReviewsAdmin error:', error);
    throw error;
  }
};

export const approveReview = async (
  reviewId: string,
  accessToken: string,
  moderationNote?: string
): Promise<ApiResponse<ReviewAdmin>> => {
  try {
    if (!reviewId) {
      throw new Error('Yorum ID gereklidir');
    }

    const response = await fetch(`${API_BASE}/reviews/${encodeURIComponent(reviewId)}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ moderationNote }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Yorum onaylanırken hata oluştu');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('approveReview error:', error);
    throw error;
  }
};


export const rejectReview = async (
  reviewId: string,
  accessToken: string,
  moderationNote?: string
): Promise<ApiResponse<ReviewAdmin>> => {
  try {
    if (!reviewId) {
      throw new Error('Yorum ID gereklidir');
    }

    const response = await fetch(`${API_BASE}/reviews/${encodeURIComponent(reviewId)}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ moderationNote }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Yorum reddedilirken hata oluştu');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('rejectReview error:', error);
    throw error;
  }
};


export const deleteReview = async (
  reviewId: string,
  accessToken: string
): Promise<ApiResponse<any>> => {
  try {
    if (!reviewId) {
      throw new Error('Yorum ID gereklidir');
    }

    const response = await fetch(`${API_BASE}/reviews/${encodeURIComponent(reviewId)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Yorum silinirken hata oluştu');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('deleteReview error:', error);
    throw error;
  }
};


export const getReviewById = async (
  reviewId: string,
  accessToken: string
): Promise<ApiResponse<ReviewAdmin>> => {
  try {
    if (!reviewId) {
      throw new Error('Yorum ID gereklidir');
    }

    const response = await fetch(`${API_BASE}/reviews/${encodeURIComponent(reviewId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Yorum detayı getirilirken hata oluştu');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('getReviewById error:', error);
    throw error;
  }
};

export type { ApiResponse }; 