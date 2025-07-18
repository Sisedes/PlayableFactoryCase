const API_BASE = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  authentication: {
    isEmailVerified: boolean;
  };
  createdAt: string;
  orderCount: number;
}

interface CustomerDetails {
  customer: any;
  orders: any[];
  stats: {
    totalOrders: number;
    totalSpent: number;
    orderStatusStats: any[];
  };
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCustomers: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface CustomersResponse {
  data: Customer[];
  pagination: PaginationInfo;
}

export const updateProfile = async (data: ProfileUpdateData, accessToken: string): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE}/users/profile`, {
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
    console.error('Update profile error:', error);
    throw new Error('Profil güncellenirken hata oluştu');
  }
};

export const sendPasswordResetCode = async (data: { email: string }, accessToken: string): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE}/users/send-password-reset-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Send password reset code error:', error);
    throw new Error('Kod gönderilirken hata oluştu');
  }
};

export const resetPasswordWithCode = async (data: { code: string; newPassword: string }, accessToken: string): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE}/users/reset-password-with-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Reset password error:', error);
    throw new Error('Parola güncellenirken hata oluştu');
  }
};

export const getAllCustomersForAdmin = async (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  },
  accessToken: string
): Promise<ApiResponse<CustomersResponse>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await fetch(`${API_BASE}/users/admin/customers?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('getAllCustomersForAdmin error:', error);
    throw new Error('Müşteriler getirilirken hata oluştu');
  }
};

export const getCustomerDetails = async (customerId: string, accessToken: string): Promise<ApiResponse<CustomerDetails>> => {
  try {
    const response = await fetch(`${API_BASE}/users/admin/customers/${customerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('getCustomerDetails error:', error);
    throw new Error('Müşteri detayları getirilirken hata oluştu');
  }
};

export const updateCustomerStatus = async (customerId: string, isActive: boolean, accessToken: string): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE}/users/admin/customers/${customerId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ isActive })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('updateCustomerStatus error:', error);
    throw new Error('Müşteri durumu güncellenirken hata oluştu');
  }
};

export interface ProfileUpdateData {
  firstName: string;
  lastName: string;
  phone?: string;
}

export type { Customer, CustomerDetails, PaginationInfo, CustomersResponse }; 