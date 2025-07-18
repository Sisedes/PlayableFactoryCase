/**
 * Authentication Service
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
  profile?: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
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

    const result = await response.json();
    
    // Login başarılıysa sepetleri birleştir
    if (result.success && result.data?.accessToken) {
      try {
        // Session ID'yi al
        const sessionId = typeof window !== 'undefined' ? localStorage.getItem('pazarcik_session_id') : null;
        
        if (sessionId) {
          // Cart service'i import et
          const { cartService } = await import('./cartService');
          await cartService.mergeCarts(sessionId);
        }
      } catch (cartError) {
        console.error('Cart merge error:', cartError);
        // Sepet birleştirme hatası login'i etkilemesin
      }
    }

    return result;
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Giriş yapılırken hata oluştu'
    };
  }
};


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


export const getCurrentUser = async (accessToken: string): Promise<ApiResponse> => {
  return getProfile(accessToken);
};


export const resendVerificationEmail = async (accessToken: string): Promise<ApiResponse> => {
  return resendVerification(accessToken);
};

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


export const setStoredToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
    
    document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  }
};

export const getStoredToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) return token;
    
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
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  }
};


export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  } catch (error) {
    return false;
  }
};


export const validateTokenWithServer = async (token: string): Promise<{ valid: boolean; user?: User }> => {
  try {
    const response = await fetch(`${getBaseURL()}/api/auth/validate-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return { valid: false };
    }

    const data = await response.json();
    return { 
      valid: data.success, 
      user: data.data ? {
        id: data.data.id,
        email: data.data.email,
        firstName: data.data.firstName,
        lastName: data.data.lastName,
        phone: data.data.phone,
        emailVerified: data.data.isEmailVerified || false,
        avatar: data.data.avatar,
        role: data.data.role
      } : undefined
    };
  } catch (error) {
    console.error('Token validation error:', error);
    return { valid: false };
  }
};


export const checkAuthStatus = async (): Promise<{ isAuthenticated: boolean; user: User | null }> => {
  const token = getStoredToken();
  const user = getStoredUser();
  
  if (!token || !isTokenValid(token)) {
    clearStoredAuth();
    return { isAuthenticated: false, user: null };
  }
  
  return { isAuthenticated: true, user };
}; 