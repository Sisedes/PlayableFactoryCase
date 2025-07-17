/**
 * Authentication Service
 * Kullanıcı kimlik doğrulama ve hesap yönetimi işlemleri
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export type RegisterData = RegisterRequest;
export type LoginData = LoginRequest;

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  emailVerified: boolean;
  avatar?: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      isEmailVerified: boolean;
    };
    accessToken: string;
  };
  error?: any;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    return process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000' 
      : process.env.NEXT_PUBLIC_API_URL || '';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
};

const BASE_URL = getBaseURL();

/**
 * Kullanıcı girişi
 */
export const login = async (formData: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Giriş yapılırken hata oluştu'
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Giriş yapılırken hata oluştu'
    };
  }
};

/**
 * Kullanıcı kayıt
 */
export const register = async (formData: RegisterRequest): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Kayıt olurken hata oluştu'
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Register error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Kayıt olurken hata oluştu'
    };
  }
};

/**
 * Kullanıcı çıkışı
 */
export const logout = async (): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Çıkış yapılırken hata oluştu'
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Çıkış yapılırken hata oluştu'
    };
  }
};

/**
 * E-posta doğrulama
 */
export const verifyEmail = async (token: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/verify-email/${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'E-posta doğrulama sırasında hata oluştu'
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Email verification error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'E-posta doğrulama sırasında hata oluştu'
    };
  }
};

/**
 * E-posta doğrulama tekrar gönderme
 */
export const resendVerification = async (accessToken: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'E-posta tekrar gönderilirken hata oluştu'
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Resend verification error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'E-posta tekrar gönderilirken hata oluştu'
    };
  }
};

/**
 * Kullanıcı profili getirme  
 */
export const getProfile = async (accessToken: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Profil getirilirken hata oluştu'
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Get profile error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Profil getirilirken hata oluştu'
    };
  }
};

/**
 * Token yenileme
 */
export const refreshToken = async (): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Token yenilenirken hata oluştu'
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Refresh token error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Token yenilenirken hata oluştu'
    };
  }
};

/**
 * Parola sıfırlama isteği
 */
export const forgotPassword = async (email: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Parola sıfırlama isteği sırasında hata oluştu'
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Forgot password error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Parola sıfırlama isteği sırasında hata oluştu'
    };
  }
};

/**
 * Parola sıfırlama
 */
export const resetPassword = async (token: string, newPassword: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/reset-password/${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Parola sıfırlanırken hata oluştu'
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Reset password error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Parola sıfırlanırken hata oluştu'
    };
  }
};

/**
 * Kullanıcı profili getirme (getCurrentUser alias)
 */
export const getCurrentUser = async (accessToken: string): Promise<ApiResponse> => {
  return getProfile(accessToken);
};

/**
 * E-posta doğrulama tekrar gönderme (resendVerificationEmail alias)
 */
export const resendVerificationEmail = async (accessToken: string): Promise<ApiResponse> => {
  return resendVerification(accessToken);
};

/**
 * E-posta ile doğrulama e-postası tekrar gönderme (giriş yapmadan)
 */
export const resendVerificationByEmail = async (email: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/resend-verification-by-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'E-posta doğrulama tekrar gönderilirken hata oluştu'
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Resend verification by email error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'E-posta doğrulama tekrar gönderilirken hata oluştu'
    };
  }
};

/**
 * Profil resmi yükleme (placeholder)
 */
export const uploadProfileImage = async (accessToken: string, formData: FormData): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/upload-avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Profil resmi yüklenirken hata oluştu'
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Upload profile image error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Profil resmi yüklenirken hata oluştu'
    };
  }
};

/**
 * Local Storage ve Cookie Utility Functions
 */
export const setStoredToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    // LocalStorage'a kaydet
    localStorage.setItem('auth_token', token);
    
    // Cookie'ye kaydet (7 gün geçerli)
    document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  }
};

export const getStoredToken = (): string | null => {
  if (typeof window !== 'undefined') {
    // Önce localStorage'dan dene
    const token = localStorage.getItem('auth_token');
    if (token) return token;
    
    // Yoksa cookie'den dene
    const tokenCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
  }
  return null;
};

export const setStoredUser = (user: User): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_user', JSON.stringify(user));
  }
};

export const getStoredUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
  }
  return null;
};

export const clearStoredAuth = (): void => {
  if (typeof window !== 'undefined') {
    // LocalStorage'ı temizle
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    // Cookie'yi temizle
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  }
};

/**
 * Token geçerliliğini kontrol et
 */
export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  
  try {
    // JWT token'ı decode et (basit kontrol)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  } catch (error) {
    return false;
  }
};

/**
 * Auth durumunu kontrol et
 */
export const checkAuthStatus = async (): Promise<{ isAuthenticated: boolean; user: User | null }> => {
  const token = getStoredToken();
  const user = getStoredUser();
  
  if (!token || !isTokenValid(token)) {
    clearStoredAuth();
    return { isAuthenticated: false, user: null };
  }
  
  return { isAuthenticated: true, user };
}; 