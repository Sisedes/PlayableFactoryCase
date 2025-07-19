import { useEffect, useState, useCallback } from 'react';
import { cartService, type Cart as CartType } from '@/services/cartService';
import { useAuth } from '@/store/authStore';

export const useCart = () => {
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isAuthenticated } = useAuth();

  const loadCart = useCallback(async () => {
    if (isRefreshing) return; 
    
    try {
      setIsRefreshing(true);
      setLoading(true);
      setError(null);
      const response = await cartService.getCart();
      
      if (response.success) {
        setCart(response.data);
      }
    } catch (err) {
      console.error('Cart load error:', err);
      setError('Sepet yüklenirken hata oluştu');
    } finally {
      setLoading(false);
      setTimeout(() => setIsRefreshing(false), 200);
    }
  }, [isRefreshing]);

  const refreshCart = () => {
    loadCart();
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setCart(null);
    } catch (err) {
      console.error('Clear cart error:', err);
      setError('Sepet temizlenirken hata oluştu');
    }
  };

  useEffect(() => {
    loadCart();
  }, [isAuthenticated]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pazarcik_cart' || e.key === 'pazarcik_session_id') {
        loadCart();
      }
    };

    const handleRefreshCart = () => {
      if (!isRefreshing) {
        loadCart();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('refreshCart', handleRefreshCart);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('refreshCart', handleRefreshCart);
    };
  }, [loadCart]);

  return {
    cart,
    loading,
    error,
    refreshCart,
    clearCart
  };
}; 