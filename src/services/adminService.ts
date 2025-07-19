import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  newCustomersThisMonth: number;
  monthlySales: number;
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    customerInfo: {
      firstName: string;
      lastName: string;
    };
    pricing: {
      total: number;
    };
    fulfillment: {
      status: string;
    };
    createdAt: string;
  }>;
  popularProducts: Array<{
    _id: string;
    name: string;
    price: number;
    salePrice?: number;
    images: Array<{
      url: string;
      alt: string;
    }>;
    category: string;
    totalSold: number;
    averageRating?: number;
  }>;
  salesChart: Array<{
    _id: string;
    total: number;
    count: number;
  }>;
  orderStatusDistribution: Array<{
    status: string;
    count: number;
  }>;
}

export interface AdminOrder {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  customerInfo: {
    email: string;
    phone?: string;
    firstName: string;
    lastName: string;
  };
  items: Array<{
    product: {
      _id: string;
      name: string;
      images: Array<{ url: string; alt: string }>;
      price: number;
      salePrice?: number;
    };
    quantity: number;
    price: number;
  }>;
  pricing: {
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
  };
  payment: {
    method: string;
    status: string;
    transactionId?: string;
    paidAt?: string;
  };
  fulfillment: {
    status: string;
    trackingNumber?: string;
    carrier?: string;
    shippedAt?: string;
    deliveredAt?: string;
    notes?: string;
  };
  addresses?: {
    shipping: {
      firstName: string;
      lastName: string;
      address1: string;
      address2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  data: AdminOrder[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface AdvancedReportData {
  total: number;
  change: number;
  data: Array<{
    date: string;
    value: number;
  }>;
}

export interface Notification {
  id: string;
  type: 'new_order' | 'low_stock' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface NotificationSettings {
  newOrders: boolean;
  lowStock: boolean;
  systemAlerts: boolean;
  emailNotifications: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export const getDashboardStats = async (accessToken: string): Promise<ApiResponse<DashboardStats>> => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      data: response.data.data
    };
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Dashboard istatistikleri getirilemedi'
    };
  }
};

export const getAllOrdersForAdmin = async (
  params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  },
  accessToken: string
): Promise<ApiResponse<OrdersResponse>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await axios.get(`${API_URL}/api/orders/admin/all?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Get admin orders error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response,
      request: error.request,
      config: error.config,
      url: `${API_URL}/api/orders/admin/all`
    });
    return {
      success: false,
      message: error.response?.data?.message || `Siparişler getirilemedi: ${error.message}`
    };
  }
};

export const updateOrderStatus = async (
  orderId: string,
  status: string,
  accessToken: string,
  trackingNumber?: string,
  carrier?: string,
  notes?: string
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.put(`${API_URL}/api/orders/admin/${orderId}/status`, {
      status,
      trackingNumber,
      carrier,
      notes
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Update order status error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Sipariş durumu güncellenemedi'
    };
  }
};

export const getOrderDetails = async (orderId: string, accessToken: string): Promise<ApiResponse<AdminOrder>> => {
  try {
    const response = await axios.get(`${API_URL}/api/orders/admin/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      data: response.data.data
    };
  } catch (error: any) {
    console.error('Get order details error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Sipariş detayları getirilemedi'
    };
  }
};

export const getAdvancedReports = async (
  params: {
    type: 'sales' | 'customers' | 'products';
    period: '7days' | '30days' | '90days' | 'custom';
    startDate?: string;
    endDate?: string;
  },
  accessToken: string
): Promise<ApiResponse<AdvancedReportData>> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('type', params.type);
    queryParams.append('period', params.period);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const response = await axios.get(`${API_URL}/api/admin/reports?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      data: response.data.data
    };
  } catch (error: any) {
    console.error('Get advanced reports error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Raporlar getirilemedi'
    };
  }
};

export const bulkCategoryAssignment = async (
  productIds: string[],
  categoryIds: string[],
  accessToken: string
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.post(`${API_URL}/api/admin/bulk/category`, {
      productIds,
      categoryIds
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Bulk category assignment error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Toplu kategori atama başarısız'
    };
  }
};

export const bulkPriceUpdate = async (
  productIds: string[],
  changeType: 'percentage' | 'fixed',
  changeValue: string,
  accessToken: string
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.post(`${API_URL}/api/admin/bulk/price`, {
      productIds,
      changeType,
      changeValue
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Bulk price update error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Toplu fiyat güncelleme başarısız'
    };
  }
};

export const getNotifications = async (accessToken: string): Promise<ApiResponse<Notification[]>> => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/notifications`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      data: response.data.data
    };
  } catch (error: any) {
    console.error('Get notifications error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Bildirimler getirilemedi'
    };
  }
};

export const updateNotificationSettings = async (
  settings: NotificationSettings,
  accessToken: string
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.put(`${API_URL}/api/admin/notifications/settings`, settings, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Update notification settings error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Bildirim ayarları güncellenemedi'
    };
  }
}; 