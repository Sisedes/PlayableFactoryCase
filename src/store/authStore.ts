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
  isTokenValid
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

  initialize: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const storedToken = getStoredToken();
      const storedUser = getStoredUser();
      
      if (storedToken && isTokenValid(storedToken) && storedUser) {
        set({
          accessToken: storedToken,
          user: storedUser,
          isAuthenticated: true
        });
        
        try {
          const response = await getCurrentUser(storedToken);
          if (response.success && response.data) {
            const user = {
              id: response.data.id,
              email: response.data.email,
              firstName: response.data.firstName,
              lastName: response.data.lastName,
              phone: response.data.phone,
              emailVerified: response.data.isEmailVerified || false,
              avatar: response.data.avatar,
              role: response.data.role
            };
            set({ user });
            setStoredUser(user);
          }
        } catch (error) {
          console.warn('User data refresh failed during initialization');
        }
      } else {
        clearStoredAuth();
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      clearStoredAuth();
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        error: 'Kimlik doğrulama başlatılamadı'
      });
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
          error: null
        });
        
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
      await logoutService();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLogoutLoading: false,
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
    
    isAdmin: authStore.user?.role === 'admin',
    isCustomer: authStore.user?.role === 'customer',
    isEmailVerified: authStore.user?.emailVerified || false,
    fullName: authStore.user ? `${authStore.user.firstName} ${authStore.user.lastName}` : '',
  };
}; 