import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  newCustomersThisMonth: number;
  monthlySales: number;
  recentOrders: any[];
  popularProducts: any[];
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