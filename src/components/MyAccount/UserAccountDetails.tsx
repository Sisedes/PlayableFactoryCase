"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/store/authStore";
import PasswordResetModal from "./PasswordResetModal";
import { 
  updateProfile, 
  sendPasswordResetCode, 
  resetPasswordWithCode 
} from "@/services/userService";
import { resendVerification } from "@/services";
import toast from "react-hot-toast";

const UserAccountDetails = () => {
  const { user, accessToken, updateUserProfile } = useAuth();
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordResetModal, setPasswordResetModal] = useState(false);
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleProfileFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    setProfileLoading(true);
    setProfileMessage(null);

    try {
      const response = await updateProfile(profileForm, accessToken);
      if (response.success) {
        setProfileMessage('Profil başarıyla güncellendi');
        updateUserProfile(profileForm);
        toast.success('Profil başarıyla güncellendi');
      } else {
        setProfileMessage(response.message || 'Profil güncellenirken hata oluştu');
        toast.error(response.message || 'Profil güncellenirken hata oluştu');
      }
    } catch (error) {
      setProfileMessage('Profil güncellenirken hata oluştu');
      toast.error('Profil güncellenirken hata oluştu');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSendResetCode = async (email: string) => {
    if (!accessToken) return;

    setPasswordResetLoading(true);
    try {
      const response = await sendPasswordResetCode({ email }, accessToken);
      if (response.success) {
        toast.success(response.message || 'Kod gönderildi');
      } else {
        toast.error(response.message || 'Kod gönderilirken hata oluştu');
      }
    } catch (error) {
      toast.error('Kod gönderilirken hata oluştu');
    } finally {
      setPasswordResetLoading(false);
    }
  };

  const handleResetPassword = async (code: string, newPassword: string) => {
    if (!accessToken) return;

    setPasswordResetLoading(true);
    try {
      const response = await resetPasswordWithCode({ code, newPassword }, accessToken);
      if (response.success) {
        toast.success(response.message || 'Parola başarıyla güncellendi');
        setPasswordResetModal(false);
      } else {
        toast.error(response.message || 'Parola güncellenirken hata oluştu');
      }
    } catch (error) {
      toast.error('Parola güncellenirken hata oluştu');
    } finally {
      setPasswordResetLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!accessToken) {
      setResendMessage('Giriş yapmanız gereklidir.');
      return;
    }

    setResendLoading(true);
    setResendMessage(null);

    const response = await resendVerification(accessToken);
    if (response.success) {
      setResendMessage('Doğrulama e-postası başarıyla gönderildi! E-posta kutunuzu kontrol edin.');
      toast.success('Doğrulama e-postası başarıyla gönderildi!');
    } else {
      setResendMessage(response.message || 'E-posta gönderilirken hata oluştu.');
      toast.error(response.message || 'E-posta gönderilirken hata oluştu.');
    }
    
    setResendLoading(false);
    
    setTimeout(() => {
      setResendMessage(null);
    }, 5000);
  };

  return (
    <>
      <div className="xl:max-w-[770px] w-full">
        {user && !user.emailVerified && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 sm:p-6 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-yellow-800">
                  E-posta Adresinizi Doğrulayın
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Hesabınızın güvenliği için e-posta adresinizi doğrulamanız gerekmektedir.
                </p>
                <div className="mt-3 flex items-center space-x-3">
                  <button
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    className="text-sm font-medium text-yellow-800 hover:text-yellow-900 disabled:opacity-50"
                  >
                    {resendLoading ? 'Gönderiliyor...' : 'Doğrulama E-postası Gönder'}
                  </button>
                </div>
                {resendMessage && (
                  <p className="mt-2 text-sm text-yellow-700">{resendMessage}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5 mb-8">
          <h3 className="font-medium text-xl sm:text-2xl text-dark mb-7">
            Profil Bilgileri
          </h3>

          <form onSubmit={handleProfileSubmit}>
            <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
              <div className="w-full">
                <label htmlFor="firstName" className="block mb-2.5">
                  Ad <span className="text-red">*</span>
                </label>

                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={profileForm.firstName}
                  onChange={handleProfileFormChange}
                  placeholder={user?.firstName || "Adınızı girin"}
                  disabled={profileLoading}
                  className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-50"
                />
              </div>

              <div className="w-full">
                <label htmlFor="lastName" className="block mb-2.5">
                  Soyad <span className="text-red">*</span>
                </label>

                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  value={profileForm.lastName}
                  onChange={handleProfileFormChange}
                  placeholder={user?.lastName || "Soyadınızı girin"}
                  disabled={profileLoading}
                  className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="mb-5">
              <label htmlFor="email" className="block mb-2.5">
                E-posta Adresi
              </label>

              <input
                type="email"
                name="email"
                id="email"
                value={user?.email || ''}
                disabled
                className="rounded-md border border-gray-3 bg-gray-2 text-gray-600 w-full py-2.5 px-5 outline-none cursor-not-allowed"
              />
              <p className="text-sm text-gray-500 mt-1">
                E-posta adresi değiştirilemez
              </p>
            </div>

            <div className="mb-7">
              <label htmlFor="phone" className="block mb-2.5">
                Telefon
              </label>

              <input
                type="tel"
                name="phone"
                id="phone"
                value={profileForm.phone}
                onChange={handleProfileFormChange}
                placeholder="Telefon numaranızı girin"
                disabled={profileLoading}
                className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-50"
              />
            </div>

            {profileMessage && (
              <div className="mb-5">
                <p className={`text-sm ${profileMessage.includes('başarıyla') ? 'text-green-600' : 'text-red-600'}`}>
                  {profileMessage}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={profileLoading}
              className="inline-flex items-center font-medium text-white bg-blue py-2.5 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {profileLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Güncelleniyor...
                </>
              ) : (
                'Profili Güncelle'
              )}
            </button>
          </form>
        </div>

        <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
          <h3 className="font-medium text-xl sm:text-2xl text-dark mb-7">
            Şifre Güvenliği
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-dark">Şifre Değiştir</h4>
                <p className="text-sm text-gray-600">
                  Hesabınızın güvenliği için düzenli olarak şifrenizi değiştirin
                </p>
              </div>
              <button
                onClick={() => setPasswordResetModal(true)}
                className="inline-flex items-center font-medium text-white bg-blue py-2 px-4 rounded-md ease-out duration-200 hover:bg-blue-dark"
              >
                Şifre Değiştir
              </button>
            </div>
            
          </div>
        </div>
      </div>

      <PasswordResetModal
        isOpen={passwordResetModal}
        closeModal={() => setPasswordResetModal(false)}
        onSendCode={handleSendResetCode}
        onResetPassword={handleResetPassword}
        isLoading={passwordResetLoading}
        userEmail={user?.email || ''}
      />
    </>
  );
};

export default UserAccountDetails; 