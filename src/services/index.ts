/**
 * Services Index 
 */

// Authentication Services
export * from './authService';

// Product Services
export * from './productService';

// Category Services  
export * from './categoryService';

// Address Services
export * from './addressService';

// User Services
export * from './userService';

// Newsletter Service
export const subscribeToNewsletter = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    throw new Error('Bülten aboneliği sırasında hata oluştu');
  }
};

// Service Types - Genel kullanım için tipleri export et
export type { ApiResponse, ProductFilters } from './productService';
export type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse 
} from './authService'; 