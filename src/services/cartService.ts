import { getApiBaseUrl } from '../utils/apiUtils';

export interface CartItem {
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
    stock: number;
    sku: string;
    variants?: Array<{
      _id: string;
      name: string;
      options: Array<{
        name: string;
        value: string;
      }>;
      sku: string;
      price?: number;
      salePrice?: number;
      stock: number;
      image?: string;
      isDefault: boolean;
    }>;
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
}

export interface Cart {
  _id: string;
  user?: string;
  sessionId?: string;
  items: CartItem[];
  totals: {
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
  };
  appliedCoupons?: string[];
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
  variantId?: string;
}

export interface UpdateCartItemRequest {
  itemId: string;
  quantity: number;
}

const API_BASE_URL = getApiBaseUrl();

const CART_STORAGE_KEY = 'pazarcik_cart';
const SESSION_ID_KEY = 'pazarcik_session_id';

const generateSessionId = (): string => {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
};

const getLocalCart = (): Cart | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    if (cartData) {
      const cart = JSON.parse(cartData);
      const cartDate = new Date(cart.updatedAt || cart.createdAt);
      const now = new Date();
      const daysDiff = (now.getTime() - cartDate.getTime()) / (1000 * 3600 * 24);
      
      if (daysDiff > 7) {
        localStorage.removeItem(CART_STORAGE_KEY);
        return null;
      }
      return cart;
    }
  } catch (error) {
    console.error('Local cart parse error:', error);
    localStorage.removeItem(CART_STORAGE_KEY);
  }
  return null;
};

const saveLocalCart = (cart: Cart, triggerEvent: boolean = true): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    if (triggerEvent) {
      window.dispatchEvent(new CustomEvent('refreshCart'));
    }
  } catch (error) {
    console.error('Local cart save error:', error);
  }
};

const removeLocalCart = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(CART_STORAGE_KEY);
  localStorage.removeItem(SESSION_ID_KEY);
};

const calculateCartTotals = (items: CartItem[], discount: number = 0) => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.18;
  const shipping = items.length === 0 ? 0 : (subtotal >= 1000 ? 0 : 200);
  const total = subtotal + tax + shipping - discount;
  
  return {
    subtotal,
    discount,
    tax,
    shipping,
    total
  };
};

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const sessionId = getSessionId();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(sessionId && { 'X-Session-ID': sessionId }),
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

export const cartService = {
  async getCart(): Promise<{ success: boolean; data: Cart }> {
    try {
      const response = await apiRequest('/cart');
      
      if (response.success && response.data) {
        saveLocalCart(response.data, false);
        return response;
      }
    } catch (error) {
      console.log('API cart error, trying local storage:', error);
    }

    const localCart = getLocalCart();
    if (localCart) {
      return {
        success: true,
        data: localCart
      };
    }

    const emptyCart: Cart = {
      _id: 'local_cart',
      sessionId: getSessionId(),
      items: [],
      totals: calculateCartTotals([], 0),
      appliedCoupons: [],
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveLocalCart(emptyCart, false);
    return {
      success: true,
      data: emptyCart
    };
  },

  async addToCart(data: AddToCartRequest): Promise<{ success: boolean; data: Cart }> {
    try {
      const response = await apiRequest('/cart/add', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (response.success) {
        if (response.data) {
          saveLocalCart(response.data);
        } else {
          const emptyCart: Cart = {
            _id: 'local_cart',
            sessionId: getSessionId(),
            items: [],
            totals: calculateCartTotals([], 0),
            appliedCoupons: [],
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          saveLocalCart(emptyCart, false);
          response.data = emptyCart;
        }
      }

      return response;
    } catch (error) {
      const localCart = getLocalCart() || {
        _id: 'local_cart',
        sessionId: getSessionId(),
        items: [],
        totals: calculateCartTotals([], 0),
        appliedCoupons: [],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const existingItemIndex = localCart.items.findIndex(item => 
        item.product._id === data.productId && 
        (!data.variantId || item.variant?._id === data.variantId)
      );

      if (existingItemIndex > -1) {
        localCart.items[existingItemIndex].quantity += data.quantity;
        localCart.items[existingItemIndex].total = localCart.items[existingItemIndex].quantity * localCart.items[existingItemIndex].price;
      } else {
        try {
          const productResponse = await fetch(`${API_BASE_URL}/api/products/${data.productId}`);
          if (productResponse.ok) {
            const product = await productResponse.json();
            localCart.items.push({
              _id: `local_${Date.now()}`,
              product: {
                _id: product._id,
                name: product.name,
                images: product.images || [],
                price: product.price,
                salePrice: product.salePrice,
                stock: product.stock,
                sku: product.sku
              },
              variant: data.variantId ? {
                _id: data.variantId,
                name: 'Varyant',
                sku: 'SKU',
                options: []
              } : undefined,
              quantity: data.quantity,
              price: product.salePrice || product.price,
              total: (product.salePrice || product.price) * data.quantity
            });
          }
        } catch (productError) {
          console.error('Product fetch error:', productError);
        }
      }

      localCart.totals = calculateCartTotals(localCart.items, localCart.totals.discount);
      localCart.updatedAt = new Date().toISOString();

      saveLocalCart(localCart);

      return {
        success: true,
        data: localCart
      };
    }
  },

  async updateCartItem(itemId: string, quantity: number): Promise<{ success: boolean; data: Cart }> {
    try {
      const response = await apiRequest(`/cart/update/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      });

      if (response.success) {
        if (response.data) {
          saveLocalCart(response.data);
        } else {
          const emptyCart: Cart = {
            _id: 'local_cart',
            sessionId: getSessionId(),
            items: [],
            totals: calculateCartTotals([], 0),
            appliedCoupons: [],
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          saveLocalCart(emptyCart, false);
          response.data = emptyCart;
        }
      }

      return response;
    } catch (error) {
      const localCart = getLocalCart();
      if (localCart) {
        const item = localCart.items.find(item => item._id === itemId);
        if (item) {
          if (quantity <= 0) {
            localCart.items = localCart.items.filter(item => item._id !== itemId);
          } else {
            item.quantity = quantity;
            item.total = item.price * quantity;
          }

          localCart.totals = calculateCartTotals(localCart.items, localCart.totals.discount);
          localCart.updatedAt = new Date().toISOString();

          saveLocalCart(localCart);
        }
      }

      return {
        success: true,
        data: localCart || { items: [], totals: calculateCartTotals([], 0) } as Cart
      };
    }
  },

  async removeFromCart(itemId: string): Promise<{ success: boolean; data: Cart }> {
    try {
      const response = await apiRequest(`/cart/remove/${itemId}`, {
        method: 'DELETE',
      });

      if (response.success) {
        if (response.data) {
          saveLocalCart(response.data);
        } else {
          const emptyCart: Cart = {
            _id: 'local_cart',
            sessionId: getSessionId(),
            items: [],
            totals: calculateCartTotals([], 0),
            appliedCoupons: [],
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          saveLocalCart(emptyCart, false);
          response.data = emptyCart;
        }
      }

      return response;
    } catch (error) {
      const localCart = getLocalCart();
      if (localCart) {
        localCart.items = localCart.items.filter(item => item._id !== itemId);

        localCart.totals = calculateCartTotals(localCart.items, localCart.totals.discount);
        localCart.updatedAt = new Date().toISOString();

        saveLocalCart(localCart);
      }

      return {
        success: true,
        data: localCart || { items: [], totals: calculateCartTotals([], 0) } as Cart
      };
    }
  },

  async clearCart(): Promise<{ success: boolean; data: Cart }> {
    try {
      const response = await apiRequest('/cart/clear', {
        method: 'DELETE',
      });

      if (response.success) {
        if (response.data) {
          saveLocalCart(response.data);
        } else {
          const emptyCart: Cart = {
            _id: 'local_cart',
            sessionId: getSessionId(),
            items: [],
            totals: calculateCartTotals([], 0),
            appliedCoupons: [],
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          saveLocalCart(emptyCart, false);
          response.data = emptyCart;
        }
      }

      return response;
    } catch (error) {
      removeLocalCart();
      
      const emptyCart: Cart = {
        _id: 'local_cart',
        sessionId: getSessionId(),
        items: [],
        totals: calculateCartTotals([], 0),
        appliedCoupons: [],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      saveLocalCart(emptyCart);

      return {
        success: true,
        data: emptyCart
      };
    }
  },

  async mergeCarts(sessionId: string): Promise<{ success: boolean; data: Cart }> {
    try {
      const backendCart = await apiRequest('/cart');
      
      if (backendCart.success && backendCart.data && backendCart.data.items.length > 0) {
        console.log('🔄 Backend sepeti bulundu, local sepeti temizle');
        saveLocalCart(backendCart.data);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(SESSION_ID_KEY);
        }
        return backendCart;
      }
      
      const localCart = getLocalCart();
      if (localCart && localCart.items.length > 0) {
        console.log('🔄 Local sepet bulundu, backend\'e aktarılıyor');
        
        const response = await apiRequest('/cart/merge', {
          method: 'POST',
          body: JSON.stringify({ sessionId }),
        });

        if (response.success) {
          saveLocalCart(response.data);
          if (typeof window !== 'undefined') {
            localStorage.removeItem(SESSION_ID_KEY);
          }
          return response;
        }
      }
      
      return {
        success: true,
        data: {
          _id: 'empty_cart',
          items: [],
          totals: calculateCartTotals([], 0),
          appliedCoupons: [],
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.warn('Sepet senkronizasyonu başarısız:', error);
      
      const localCart = getLocalCart();
      if (localCart) {
        return {
          success: true,
          data: localCart
        };
      }
      
      throw new Error('Sepetler birleştirilemedi');
    }
  },

  async applyCoupon(couponCode: string): Promise<{ 
    success: boolean; 
    data: { 
      cart: Cart; 
      discountAmount: number; 
      discountType: string; 
    } 
  }> {
    try {
      const response = await apiRequest('/cart/apply-coupon', {
        method: 'POST',
        body: JSON.stringify({ couponCode }),
      });

      if (response.success) {
        saveLocalCart(response.data.cart);
      }

      return response;
    } catch (error) {
      const localCart = getLocalCart();
      if (localCart) {
        let discountAmount = 0;
        let discountType = '';

        switch (couponCode.toLowerCase()) {
          case 'indirim10':
            discountAmount = localCart.totals.subtotal * 0.10;
            discountType = 'percentage';
            break;
          case 'indirim50tl':
            discountAmount = Math.min(50, localCart.totals.subtotal);
            discountType = 'fixed';
            break;
          default:
            throw new Error('Geçersiz kupon kodu');
        }

        localCart.totals.discount = Math.round(discountAmount * 100) / 100;
        localCart.totals = calculateCartTotals(localCart.items, localCart.totals.discount);
        localCart.updatedAt = new Date().toISOString();

        if (!localCart.appliedCoupons) {
          localCart.appliedCoupons = [];
        }
        if (!localCart.appliedCoupons.includes(couponCode.toUpperCase())) {
          localCart.appliedCoupons.push(couponCode.toUpperCase());
        }

        saveLocalCart(localCart);

        return {
          success: true,
          data: {
            cart: localCart,
            discountAmount: localCart.totals.discount,
            discountType
          }
        };
      }

      throw new Error('Sepet bulunamadı');
    }
  },

  async removeCoupon(): Promise<{ success: boolean; data: Cart }> {
    try {
      const response = await apiRequest('/cart/remove-coupon', {
        method: 'DELETE',
      });

      if (response.success) {
        if (response.data) {
          saveLocalCart(response.data);
        } else {
          const emptyCart: Cart = {
            _id: 'local_cart',
            sessionId: getSessionId(),
            items: [],
            totals: calculateCartTotals([], 0),
            appliedCoupons: [],
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          saveLocalCart(emptyCart, false);
          response.data = emptyCart;
        }
      }

      return response;
    } catch (error) {
      const localCart = getLocalCart();
      if (localCart) {
        localCart.totals.discount = 0;
        localCart.appliedCoupons = [];
        localCart.totals = calculateCartTotals(localCart.items, localCart.totals.discount);
        localCart.updatedAt = new Date().toISOString();

        saveLocalCart(localCart);
      }

      return {
        success: true,
        data: localCart || { items: [], totals: calculateCartTotals([], 0) } as Cart
      };
    }
  },

  clearLocalStorage(): void {
    removeLocalCart();
  }
}; 