import { getApiBaseUrl } from '../utils/apiUtils';
import axios from 'axios';

export interface OrderItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    images: Array<{
      url: string;
      alt: string;
    }>;
    price: number;
    salePrice?: number;
    sku: string;
  };
  variant?: {
    _id: string;
    name: string;
    sku: string;
    options: Array<{
      name: string;
      value: string;
    }>;
  };
  quantity: number;
  price: number;
  total: number;
  name: string;
  sku: string;
  image?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user?: string;
  customerInfo: {
    email: string;
    phone?: string;
    firstName: string;
    lastName: string;
  };
  items: OrderItem[];
  pricing: {
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
  };
  addresses: {
    billing: Address;
    shipping: Address;
  };
  payment: {
    method: 'credit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery';
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    transactionId?: string;
    paidAt?: string;
  };
  fulfillment: {
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    trackingNumber?: string;
    carrier?: string;
    shippedAt?: string;
    deliveredAt?: string;
    notes?: string;
  };
  appliedCoupons?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface CreateOrderFromCartRequest {
  customerInfo: {
    email: string;
    phone?: string;
    firstName: string;
    lastName: string;
  };
  addresses: {
    billing: Address;
    shipping: Address;
  };
  paymentMethod: 'credit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery';
  notes?: string;
  sameAsShipping?: boolean;
}

export interface CreateGuestOrderRequest {
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
  }>;
  customerInfo: {
    email: string;
    phone?: string;
    firstName: string;
    lastName: string;
  };
  addresses: {
    billing: Address;
    shipping: Address;
  };
  paymentMethod: 'credit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery';
  notes?: string;
  sameAsShipping?: boolean;
}

export interface ProcessPaymentRequest {
  paymentDetails: {
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    cardholderName?: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

const API_BASE_URL = getApiBaseUrl();

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Bir hata oluştu');
  }

  return response.json();
};

export const orderService = {
  async createGuestOrder(orderData: {
    customerInfo: {
      email: string;
      phone?: string;
      firstName: string;
      lastName: string;
    };
    items: Array<{
      productId: string;
      variantId?: string;
      quantity: number;
    }>;
    addresses: {
      shipping: Address;
      billing: Address;
    };
    paymentMethod: string;
    notes?: string;
    sameAsShipping: boolean;
  }): Promise<ApiResponse<{ order: Order; orderNumber: string }>> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/orders/create-guest`, orderData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        message: response.data.message,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Create guest order error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Sipariş oluşturulurken hata oluştu'
      };
    }
  },

  async createOrderFromCart(orderData: {
    customerInfo: {
      email: string;
      phone?: string;
      firstName: string;
      lastName: string;
    };
    addresses: {
      shipping: Address;
      billing: Address;
    };
    paymentMethod: string;
    notes?: string;
    sameAsShipping: boolean;
  }): Promise<ApiResponse<{ order: Order; orderNumber: string }>> {
    try {
      console.log('createOrderFromCart çağrıldı');
      console.log('Order data:', orderData);
      
      let token = null;
      if (typeof window !== 'undefined') {
        try {
          const { useAuthStore } = await import('@/store/authStore');
          token = useAuthStore.getState().accessToken;
        } catch (error) {
          console.log('Store token alınamadı, localStorage deneniyor');
        }
        
        if (!token) {
          token = localStorage.getItem('accessToken');
        }
      }
      
      console.log('Token:', token ? 'Mevcut' : 'Yok');
      console.log('Token length:', token ? token.length : 0);
      console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'Yok');
      
      const sessionId = localStorage.getItem('pazarcik_session_id');
      
      const response = await axios.post(`${API_BASE_URL}/api/orders/create-from-cart`, orderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-session-id': sessionId || ''
        }
      });

      console.log('API response:', response.data);
      return {
        success: true,
        message: response.data.message,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Create order from cart error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Sipariş oluşturulurken hata oluştu'
      };
    }
  },

  async processPayment(orderId: string, data: ProcessPaymentRequest): Promise<{ success: boolean; data: { order: Order; transactionId: string } }> {
    return apiRequest(`/orders/${orderId}/process-payment`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMyOrders(): Promise<{ success: boolean; data: Order[] }> {
    return apiRequest('/orders/my-orders');
  },

  async getOrderById(orderId: string): Promise<{ success: boolean; data: Order }> {
    return apiRequest(`/orders/${orderId}`);
  },

  async getOrderByNumber(orderNumber: string): Promise<ApiResponse<Order>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/orders/by-number/${orderNumber}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        message: response.data.message,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Get order by number error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Sipariş bulunamadı'
      };
    }
  }
}; 