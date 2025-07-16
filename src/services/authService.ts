/**
 * Auth Service - Kimlik doğrulama ile ilgili tüm API çağrılarını yönetir
 */

// API Base URL
const API_BASE = process.env.NODE_ENV === 'production' 
  ? '/api/auth' 
  : 'http://localhost:5000/api/auth';

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin';
  isEmailVerified: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
    accessToken: string;
  };
  error?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ResetPasswordData {
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

/**
 * Kullanıcı kaydı
 */
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Kayıt sırasında hata oluştu');
    }

    return data;
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

/**
 * Kullanıcı girişi
 */
export const login = async (credentials: LoginData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Giriş sırasında hata oluştu');
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Kullanıcı çıkışı
 */
export const logout = async (): Promise<void> => {
  try {
    const token = getStoredToken();
    
    const response = await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      // Logout işlemi başarısız olsa bile local storage'ı temizle
      console.warn('Logout API çağrısı başarısız, ancak local storage temizlendi');
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Her durumda local storage'ı temizle
    clearStoredAuth();
  }
};

/**
 * Token yenileme
 */
export const refreshToken = async (): Promise<string | null> => {
  try {
    const response = await fetch(`${API_BASE}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Token yenileme başarısız');
    }

    const data = await response.json();
    
    if (data.success && data.data?.accessToken) {
      setStoredToken(data.data.accessToken);
      return data.data.accessToken;
    }

    return null;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
};

/**
 * Mevcut kullanıcı bilgilerini getir
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const token = getStoredToken();
    
    if (!token) {
      return null;
    }

    const response = await fetch(`${API_BASE}/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token geçersiz, yenilemeyi dene
        const newToken = await refreshToken();
        if (newToken) {
          return getCurrentUser(); // Yeni token ile tekrar dene
        }
      }
      throw new Error('Kullanıcı bilgileri alınamadı');
    }

    const data = await response.json();
    return data.data?.user || null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

/**
 * E-posta doğrulama
 */
export const verifyEmail = async (token: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE}/verify-email/${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Email verification error:', error);
    return {
      success: false,
      message: 'E-posta doğrulama sırasında hata oluştu'
    };
  }
};

/**
 * Parola sıfırlama isteği
 */
export const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Forgot password error:', error);
    return {
      success: false,
      message: 'Parola sıfırlama isteği gönderilirken hata oluştu'
    };
  }
};

/**
 * Parola sıfırlama
 */
export const resetPassword = async (
  token: string, 
  passwordData: ResetPasswordData
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE}/reset-password/${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(passwordData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Reset password error:', error);
    return {
      success: false,
      message: 'Parola sıfırlama sırasında hata oluştu'
    };
  }
};

/**
 * E-posta doğrulama linkini yeniden gönder
 */
export const resendVerificationEmail = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const token = getStoredToken();
    
    const response = await fetch(`${API_BASE}/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      credentials: 'include',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Resend verification error:', error);
    return {
      success: false,
      message: 'Doğrulama e-postası gönderilirken hata oluştu'
    };
  }
};

/**
 * Profil resmi yükleme
 */
export const uploadProfileImage = async (file: File): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    const token = getStoredToken();
    
    if (!token) {
      throw new Error('Giriş yapmanız gereklidir');
    }

    const formData = new FormData();
    formData.append('profileImage', file);

    const response = await fetch(`${API_BASE}/upload-profile-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Dosya yükleme hatası');
    }

    return data;
  } catch (error) {
    console.error('Upload profile image error:', error);
    throw error;
  }
};

/**
 * Authentication durumunu kontrol et
 */
export const checkAuthStatus = async (): Promise<{ isAuthenticated: boolean; user?: User }> => {
  try {
    const token = getStoredToken();
    
    const response = await fetch(`${API_BASE}/check-auth`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return { isAuthenticated: false };
    }

    const data = await response.json();
    return {
      isAuthenticated: data.isAuthenticated,
      user: data.user
    };
  } catch (error) {
    console.error('Check auth status error:', error);
    return { isAuthenticated: false };
  }
};

// Local Storage Helpers
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/**
 * Token'ı local storage'a kaydet
 */
export const setStoredToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

/**
 * Local storage'dan token'ı al
 */
export const getStoredToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

/**
 * Kullanıcı bilgilerini local storage'a kaydet
 */
export const setStoredUser = (user: User): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

/**
 * Local storage'dan kullanıcı bilgilerini al
 */
export const getStoredUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem(USER_KEY);
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  }
  return null;
};

/**
 * Auth bilgilerini local storage'dan temizle
 */
export const clearStoredAuth = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

/**
 * Token'ın geçerli olup olmadığını kontrol et
 */
export const isTokenValid = (token: string): boolean => {
  if (!token) return false;
  
  try {
    // JWT token'ın payload kısmını decode et
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    // Token'ın süresi dolmuş mu kontrol et
    return payload.exp > currentTime;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}; 