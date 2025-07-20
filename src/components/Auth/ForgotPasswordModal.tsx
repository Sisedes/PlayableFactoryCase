"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

const emailSchema = z.object({
  email: z
    .string()
    .min(1, "E-posta adresi gereklidir")
    .email("Geçerli bir e-posta adresi giriniz"),
});

const codeSchema = z.object({
  code: z
    .string()
    .min(1, "Doğrulama kodu gereklidir")
    .length(6, "Doğrulama kodu 6 haneli olmalıdır"),
});

const passwordSchema = z.object({
  password: z
    .string()
    .min(1, "Yeni parola gereklidir")
    .min(6, "Parola en az 6 karakter olmalıdır"),
  confirmPassword: z
    .string()
    .min(1, "Parola tekrarı gereklidir"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Parolalar eşleşmiyor",
  path: ["confirmPassword"],
});

type EmailFormData = z.infer<typeof emailSchema>;
type CodeFormData = z.infer<typeof codeSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    mode: "onChange",
  });

  const codeForm = useForm<CodeFormData>({
    resolver: zodResolver(codeSchema),
    mode: "onChange",
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    mode: "onChange",
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (!isOpen) {
      setStep('email');
      setEmail('');
      setCountdown(0);
      setIsLoading(false);
      emailForm.reset();
      codeForm.reset();
      passwordForm.reset();
    }
  }, [isOpen, emailForm, codeForm, passwordForm]);

  const handleEmailSubmit = async (data: EmailFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setEmail(data.email);
        setStep('code');
        setCountdown(300); 
        toast.success('Doğrulama kodu e-posta adresinize gönderildi!');
      } else {
        toast.error(result.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (data: CodeFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email,
          code: data.code 
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStep('password');
        toast.success('Doğrulama kodu doğrulandı!');
      } else {
        toast.error(result.message || 'Geçersiz doğrulama kodu.');
      }
    } catch (error) {
      console.error('Code verification error:', error);
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email,
          password: data.password 
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Parolanız başarıyla güncellendi!');
        onClose();
      } else {
        toast.error(result.message || 'Parola güncellenirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setCountdown(300); 
        toast.success('Yeni doğrulama kodu gönderildi!');
      } else {
        toast.error(result.message || 'Kod gönderilemedi. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('Resend code error:', error);
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-4 text-center">
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        <div className="inline-block w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl relative z-10 mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {step === 'email' && 'Parola Sıfırlama'}
              {step === 'code' && 'Doğrulama Kodu'}
              {step === 'password' && 'Yeni Parola'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {step === 'email' && (
            <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  E-posta adresinizi girin. Size parola sıfırlama kodu göndereceğiz.
                </p>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta Adresi
                </label>
                <input
                  {...emailForm.register("email")}
                  type="email"
                  id="email"
                  placeholder="E-posta adresinizi girin"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    emailForm.formState.errors.email 
                      ? 'border-red-300' 
                      : 'border-gray-300'
                  }`}
                />
                {emailForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !emailForm.formState.isValid}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue rounded-lg hover:bg-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Gönderiliyor...' : 'Kod Gönder'}
                </button>
              </div>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={codeForm.handleSubmit(handleCodeSubmit)} className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>{email}</strong> adresine gönderilen 6 haneli doğrulama kodunu girin.
                </p>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Doğrulama Kodu
                </label>
                <input
                  {...codeForm.register("code")}
                  type="text"
                  id="code"
                  placeholder="000000"
                  maxLength={6}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono ${
                    codeForm.formState.errors.code 
                      ? 'border-red-300' 
                      : 'border-gray-300'
                  }`}
                />
                {codeForm.formState.errors.code && (
                  <p className="mt-1 text-sm text-red-600">
                    {codeForm.formState.errors.code.message}
                  </p>
                )}
              </div>

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-gray-600">
                    Kalan süre: <span className="font-mono text-red-600">{formatTime(countdown)}</span>
                  </p>
                ) : (
                  <p className="text-sm text-red-600">
                    Kod süresi doldu. Yeni kod göndermek için aşağıdaki butona tıklayın.
                  </p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Geri
                </button>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading || countdown > 0}
                  className="flex-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Gönderiliyor...' : 'Yeni Kod Gönder'}
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !codeForm.formState.isValid || countdown === 0}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue rounded-lg hover:bg-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Doğrulanıyor...' : 'Doğrula'}
                </button>
              </div>
            </form>
          )}

          {/* Yeni parola adımı */}
          {step === 'password' && (
            <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Yeni parolanızı belirleyin.
                </p>
                
                <div className="space-y-3">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Yeni Parola
                    </label>
                    <div className="relative">
                      <input
                        {...passwordForm.register("password")}
                        type={showPassword ? "text" : "password"}
                        id="password"
                        placeholder="Yeni parolanızı girin"
                        className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          passwordForm.formState.errors.password 
                            ? 'border-red-300' 
                            : 'border-gray-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {passwordForm.formState.errors.password && (
                      <p className="mt-1 text-sm text-red-600">
                        {passwordForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Parola Tekrarı
                    </label>
                    <div className="relative">
                      <input
                        {...passwordForm.register("confirmPassword")}
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        placeholder="Parolanızı tekrar girin"
                        className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          passwordForm.formState.errors.confirmPassword 
                            ? 'border-red-300' 
                            : 'border-gray-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">
                        {passwordForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep('code')}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Geri
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !passwordForm.formState.isValid}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue rounded-lg hover:bg-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Güncelleniyor...' : 'Parolayı Güncelle'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal; 