import { create } from 'zustand';
import { 
  User, 
  AuthResponse,
  RegisterData,
  LoginData,
  login as loginService,
  register as registerService,
  logout as logoutService,
  getCurrentUser,
  verifyEmail as verifyEmailService,
  forgotPassword as forgotPasswordService,
  resetPassword as resetPasswordService,
  resendVerificationEmail as resendVerificationService,
  uploadProfileImage as uploadProfileImageService,
  checkAuthStatus,
  setStoredToken,
  setStoredUser,
  getStoredToken,
  getStoredUser,
  clearStoredAuth,
  isTokenValid,
  validateTokenWithServer
} from '@/services/authService';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  
  isLoading: boolean;
  isLoginLoading: boolean;
  isRegisterLoading: boolean;
  isLogoutLoading: boolean;
  isProfileLoading: boolean;
  
  error: string | null;
  validationErrors: Record<string, string> | null;
  
  lastValidation: number | null;
  validationTimer: NodeJS.Timeout | null;
  
  initialize: () => Promise<void>;
  login: (credentials: LoginData) => Promise<{ success: boolean; message?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  verifyEmail: (token: string) => Promise<{ success: boolean; message: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (token: string, passwordData: any) => Promise<{ success: boolean; message: string }>;
  resendVerificationEmail: () => Promise<{ success: boolean; message: string }>;
  uploadProfileImage: (file: File) => Promise<{ success: boolean; data?: any; message?: string }>;
  clearError: () => void;
  clearValidationErrors: () => void;
  
  validateCurrentToken: () => Promise<boolean>;
  startTokenValidation: () => void;
  stopTokenValidation: () => void;
  forceLogout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  isLoginLoading: false,
  isRegisterLoading: false,
  isLogoutLoading: false,
  isProfileLoading: false,
  error: null,
  validationErrors: null,
  lastValidation: null,
  validationTimer: null,

  initialize: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const storedToken = getStoredToken();
      const storedUser = getStoredUser();
      
      console.log('Auth initialization başladı:', { 
        hasToken: !!storedToken, 
        hasUser: !!storedUser 
      });
      
      if (storedToken && isTokenValid(storedToken) && storedUser) {
        set({
          accessToken: storedToken,
          user: storedUser,
          isAuthenticated: true
        });
        
        console.log("Local storage'dan auth restore edildi");
        
        try {
          const validation = await validateTokenWithServer(storedToken);
          if (validation.valid && validation.user) {
            set({ 
              user: validation.user,
              lastValidation: Date.now()
            });
            setStoredUser(validation.user);
            console.log("Token validated ve user verileri güncellendi");
            
            get().startTokenValidation();
          } else {
            console.warn("Token validation failed, clearing auth");
            clearStoredAuth();
            set({
              user: null,
              accessToken: null,
              isAuthenticated: false
            });
          }
        } catch (error) {
          console.warn('Token validation failed during initialization:', error);
          clearStoredAuth();
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false
          });
        }
      } else {
        console.log('Auth verileri bulunamadı veya geçersiz, temizleniyor');
        clearStoredAuth();
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      try {
        const fallbackToken = getStoredToken();
        const fallbackUser = getStoredUser();
        
        if (fallbackToken && fallbackUser) {
          console.log('Fallback auth restore yapılıyor');
          set({
            accessToken: fallbackToken,
            user: fallbackUser,
            isAuthenticated: true,
            error: null
          });
        } else {
          clearStoredAuth();
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            error: 'Kimlik doğrulama başlatılamadı'
          });
        }
      } catch (fallbackError) {
        console.error('Fallback auth restore failed:', fallbackError);
        clearStoredAuth();
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          error: 'Kimlik doğrulama başlatılamadı'
        });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (credentials: LoginData) => {
    set({ isLoginLoading: true, error: null, validationErrors: null });
    
    try {
      const response = await loginService(credentials);
      
      if (response.success && response.data) {
        const { user: backendUser, accessToken } = response.data;
        
        const user = {
          id: backendUser.id,
          email: backendUser.email,
          firstName: backendUser.firstName,
          lastName: backendUser.lastName,
          phone: (backendUser as any).phone || undefined,
          emailVerified: (backendUser as any).isEmailVerified || false,
          avatar: (backendUser as any).avatar || undefined,
          role: backendUser.role
        };
        
        setStoredToken(accessToken);
        setStoredUser(user);
        
        set({
          user,
          accessToken,
          isAuthenticated: true,
          error: null,
          lastValidation: Date.now()
        });
        
        get().startTokenValidation();
        
        return { success: true, message: response.message };
      } else {
        set({ error: response.message || 'Giriş başarısız' });
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Giriş sırasında hata oluştu';
      set({ error: errorMessage });
      
      if (error.errors && Array.isArray(error.errors)) {
        const validationErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          if (err.field) {
            validationErrors[err.field] = err.message;
          }
        });
        set({ validationErrors });
      }
      
      return { success: false, message: errorMessage };
    } finally {
      set({ isLoginLoading: false });
    }
  },

  register: async (userData: RegisterData) => {
    set({ isRegisterLoading: true, error: null, validationErrors: null });
    
    try {
      const response = await registerService(userData);
      
      if (response.success) {
        set({
          error: null
        });
        
        return { success: true, message: response.message };
      } else {
        set({ error: response.message || 'Kayıt başarısız' });
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Kayıt sırasında hata oluştu';
      set({ error: errorMessage });
      
      return { success: false, message: errorMessage };
    } finally {
      set({ isRegisterLoading: false });
    }
  },

  logout: async () => {
    set({ isLogoutLoading: true });
    
    try {
      get().stopTokenValidation();
      
      await logoutService();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearStoredAuth();
      
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLogoutLoading: false,
        lastValidation: null,
        validationTimer: null,
        error: null,
        validationErrors: null
      });
    }
  },

  refreshUserData: async () => {
    set({ isProfileLoading: true, error: null });
    
    try {
      const { accessToken } = get();
      if (!accessToken) {
        throw new Error('Access token not found');
      }
      
      const response = await getCurrentUser(accessToken);
      if (response.success && response.data) {
        const user = {
          id: response.data.id,
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          phone: response.data.phone || undefined,
          emailVerified: response.data.isEmailVerified || false,
          avatar: response.data.avatar || undefined,
          role: response.data.role
        };
        set({ user });
        setStoredUser(user);
      } else {
        get().logout();
      }
    } catch (error) {
      console.error('User data refresh error:', error);
      set({ error: 'Kullanıcı bilgileri güncellenemedi' });
    } finally {
      set({ isProfileLoading: false });
    }
  },

  verifyEmail: async (token: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await verifyEmailService(token);
      
      if (result.success) {
        await get().refreshUserData();
      }
      
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'E-posta doğrulama sırasında hata oluştu';
      set({ error: errorMessage });
      return { success: false, message: errorMessage };
    } finally {
      set({ isLoading: false });
    }
  },

  forgotPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await forgotPasswordService(email);
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Parola sıfırlama isteği gönderilirken hata oluştu';
      set({ error: errorMessage });
      return { success: false, message: errorMessage };
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (token: string, passwordData: any) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await resetPasswordService(token, passwordData);
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Parola sıfırlama sırasında hata oluştu';
      set({ error: errorMessage });
      return { success: false, message: errorMessage };
    } finally {
      set({ isLoading: false });
    }
  },

  resendVerificationEmail: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const { accessToken } = get();
      if (!accessToken) {
        throw new Error('Access token not found');
      }
      
      const result = await resendVerificationService(accessToken);
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Doğrulama e-postası gönderilirken hata oluştu';
      set({ error: errorMessage });
      return { success: false, message: errorMessage };
    } finally {
      set({ isLoading: false });
    }
  },

  uploadProfileImage: async (file: File) => {
    set({ isProfileLoading: true, error: null });
    
    try {
      const { accessToken } = get();
      if (!accessToken) {
        throw new Error('Access token not found');
      }
      
      const formData = new FormData();
      formData.append('avatar', file);
      
      const result = await uploadProfileImageService(accessToken, formData);
      
      if (result.success) {
        await get().refreshUserData();
      }
      
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Profil resmi yüklenirken hata oluştu';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isProfileLoading: false });
    }
  },

  clearError: () => set({ error: null }),
  
  clearValidationErrors: () => set({ validationErrors: null }),
  
  setUser: (user: User) => {
    set({ user });
    setStoredUser(user);
  },

  validateCurrentToken: async () => {
    const { accessToken } = get();
    if (!accessToken) return false;

    try {
      const validation = await validateTokenWithServer(accessToken);
      
      if (validation.valid && validation.user) {
        set({ 
          user: validation.user,
          lastValidation: Date.now(),
          error: null
        });
        setStoredUser(validation.user);
        return true;
      } else {
        console.warn('Token validation failed, logging out');
        get().forceLogout();
        return false;
      }
    } catch (error) {
      console.error('Token validation error:', error);
      get().forceLogout();
      return false;
    }
  },

  startTokenValidation: () => {
    const { validationTimer } = get();
    
    if (validationTimer) {
      clearInterval(validationTimer);
    }

    const timer = setInterval(async () => {
      const { isAuthenticated } = get();
      if (isAuthenticated) {
        await get().validateCurrentToken();
      }
    }, 5 * 60 * 1000); // 5 dakika

    set({ validationTimer: timer });
  },

  stopTokenValidation: () => {
    const { validationTimer } = get();
    if (validationTimer) {
      clearInterval(validationTimer);
      set({ validationTimer: null });
    }
  },

  forceLogout: () => {
    get().stopTokenValidation();
    clearStoredAuth();
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      lastValidation: null,
      validationTimer: null,
      error: 'Oturum süresi doldu. Lütfen tekrar giriş yapın.'
    });
  }
}));

export const useAuth = () => {
  const authStore = useAuthStore();
  
  return {
    user: authStore.user,
    accessToken: authStore.accessToken,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading,
    isLoginLoading: authStore.isLoginLoading,
    isRegisterLoading: authStore.isRegisterLoading,
    isLogoutLoading: authStore.isLogoutLoading,
    isProfileLoading: authStore.isProfileLoading,
    error: authStore.error,
    validationErrors: authStore.validationErrors,
    
    initialize: authStore.initialize,
    login: authStore.login,
    register: authStore.register,
    logout: authStore.logout,
    refreshUserData: authStore.refreshUserData,
    verifyEmail: authStore.verifyEmail,
    forgotPassword: authStore.forgotPassword,
    resetPassword: authStore.resetPassword,
    resendVerificationEmail: authStore.resendVerificationEmail,
    uploadProfileImage: authStore.uploadProfileImage,
    clearError: authStore.clearError,
    clearValidationErrors: authStore.clearValidationErrors,
    setUser: authStore.setUser,
    
    // Token validation fonksiyonları
    validateCurrentToken: authStore.validateCurrentToken,
    startTokenValidation: authStore.startTokenValidation,
    stopTokenValidation: authStore.stopTokenValidation,
    forceLogout: authStore.forceLogout,
    
    isAdmin: authStore.user?.role === 'admin',
    isCustomer: authStore.user?.role === 'customer',
    isEmailVerified: authStore.user?.emailVerified || false,
    fullName: authStore.user ? `${authStore.user.firstName} ${authStore.user.lastName}` : '',
  };
}; 