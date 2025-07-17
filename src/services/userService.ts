import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface SendResetCodeData {
  email: string;
}

export interface ResetPasswordData {
  code: string;
  newPassword: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * Kullanıcı profilini güncelle
 */
export const updateProfile = async (profileData: ProfileUpdateData, token: string): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.put(`${API_URL}/api/users/profile`, profileData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      message: response.data.message,
      data: response.data.data
    };
  } catch (error: any) {
    console.error('Update profile error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Profil güncellenirken hata oluştu'
    };
  }
};

/**
 * Parola sıfırlama kodu gönder
 */
export const sendPasswordResetCode = async (emailData: SendResetCodeData, token: string): Promise<ApiResponse<null>> => {
  try {
    const response = await axios.post(`${API_URL}/api/users/send-password-reset-code`, emailData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      message: response.data.message
    };
  } catch (error: any) {
    console.error('Send password reset code error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Kod gönderilirken hata oluştu'
    };
  }
};

/**
 * Parola sıfırlama kodunu doğrula ve parolayı güncelle
 */
export const resetPasswordWithCode = async (resetData: ResetPasswordData, token: string): Promise<ApiResponse<null>> => {
  try {
    const response = await axios.post(`${API_URL}/api/users/reset-password-with-code`, resetData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      message: response.data.message
    };
  } catch (error: any) {
    console.error('Reset password with code error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Parola güncellenirken hata oluştu'
    };
  }
}; 