"use client";
import React, { useState, useRef, useEffect } from "react";

interface PasswordResetModalProps {
  isOpen: boolean;
  closeModal: () => void;
  onSendCode: (email: string) => Promise<void>;
  onResetPassword: (code: string, newPassword: string) => Promise<void>;
  userEmail: string;
  isLoading?: boolean;
}

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({
  isOpen,
  closeModal,
  onSendCode,
  onResetPassword,
  userEmail,
  isLoading = false
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState(userEmail);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [codeSent, setCodeSent] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeModal]);

  useEffect(() => {
    if (isOpen) {
      setStep('email');
      setEmail(userEmail);
      setCode('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
      setCodeSent(false);
    }
  }, [isOpen, userEmail]);

  const validateEmail = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!email.trim()) {
      newErrors.email = 'E-posta adresi gereklidir';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCode = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!code.trim()) {
      newErrors.code = 'Kod gereklidir';
    } else if (!/^\d{6}$/.test(code)) {
      newErrors.code = 'Kod 6 haneli olmalıdır';
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = 'Yeni parola gereklidir';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Parola en az 6 karakter olmalıdır';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Parola tekrarı gereklidir';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Parolalar eşleşmiyor';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendCode = async () => {
    if (!validateEmail()) return;

    try {
      await onSendCode(email);
      setCodeSent(true);
      setStep('code');
      setErrors({});
    } catch (error) {
      console.error('Send code error:', error);
    }
  };

  const handleResetPassword = async () => {
    if (!validateCode()) return;

    try {
      await onResetPassword(code, newPassword);
      closeModal();
    } catch (error) {
      console.error('Reset password error:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    switch (name) {
      case 'email':
        setEmail(value);
        break;
      case 'code':
        setCode(value);
        break;
      case 'newPassword':
        setNewPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 overflow-y-auto no-scrollbar w-full h-screen sm:py-20 xl:py-25 2xl:py-[150px] bg-dark/70 sm:px-8 px-4 py-5 z-99999">
      <div className="flex items-center justify-center">
        <div
          ref={modalRef}
          className="w-full max-w-[500px] rounded-xl shadow-3 bg-white p-7.5 relative modal-content"
        >
          <button
            onClick={closeModal}
            disabled={isLoading}
            aria-label="button for close modal"
            className="absolute top-0 right-0 sm:top-3 sm:right-3 flex items-center justify-center w-10 h-10 rounded-full ease-in duration-150 bg-meta text-body hover:text-dark disabled:opacity-50"
          >
            <svg
              className="fill-current"
              width="26"
              height="26"
              viewBox="0 0 26 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.3108 13L19.2291 8.08167C19.5866 7.72417 19.5866 7.12833 19.2291 6.77083C19.0543 6.59895 18.8189 6.50262 18.5737 6.50262C18.3285 6.50262 18.0932 6.59895 17.9183 6.77083L13 11.6892L8.08164 6.77083C7.90679 6.59895 7.67142 6.50262 7.42623 6.50262C7.18104 6.50262 6.94566 6.59895 6.77081 6.77083C6.41331 7.12833 6.41331 7.72417 6.77081 8.08167L11.6891 13L6.77081 17.9183C6.41331 18.2758 6.41331 18.8717 6.77081 19.2292C7.12831 19.5867 7.72414 19.5867 8.08164 19.2292L13 14.3108L17.9183 19.2292C18.2758 19.5867 18.8716 19.5867 19.2291 19.2292C19.5866 18.8717 19.5866 18.2758 19.2291 17.9183L14.3108 13Z"
                fill=""
              />
            </svg>
          </button>

          <div>
            <h3 className="text-xl font-medium text-dark mb-6">
              Parola Sıfırlama
            </h3>

            {step === 'email' ? (
              <div className="space-y-5">
                <div>
                  <label htmlFor="email" className="block mb-2.5 text-dark font-medium">
                    E-posta Adresi <span className="text-red">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="E-posta adresinizi girin"
                    className={`rounded-md border ${errors.email ? 'border-red' : 'border-gray-3'} bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-50`}
                  />
                  {errors.email && <p className="text-red text-sm mt-1">{errors.email}</p>}
                </div>

                <p className="text-sm text-gray-600">
                  Parola sıfırlama kodu e-posta adresinize gönderilecektir.
                </p>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSendCode}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Gönderiliyor...
                      </>
                    ) : 'Kod Gönder'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isLoading}
                    className="inline-flex font-medium text-dark bg-gray-1 border border-gray-3 py-3 px-7 rounded-md ease-out duration-200 hover:bg-gray-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    İptal
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label htmlFor="code" className="block mb-2.5 text-dark font-medium">
                    Doğrulama Kodu <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={code}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="6 haneli kodu girin"
                    maxLength={6}
                    className={`rounded-md border ${errors.code ? 'border-red' : 'border-gray-3'} bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-50`}
                  />
                  {errors.code && <p className="text-red text-sm mt-1">{errors.code}</p>}
                </div>

                <div>
                  <label htmlFor="newPassword" className="block mb-2.5 text-dark font-medium">
                    Yeni Parola <span className="text-red">*</span>
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={newPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="Yeni parolanızı girin"
                    className={`rounded-md border ${errors.newPassword ? 'border-red' : 'border-gray-3'} bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-50`}
                  />
                  {errors.newPassword && <p className="text-red text-sm mt-1">{errors.newPassword}</p>}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block mb-2.5 text-dark font-medium">
                    Parola Tekrarı <span className="text-red">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="Parolanızı tekrar girin"
                    className={`rounded-md border ${errors.confirmPassword ? 'border-red' : 'border-gray-3'} bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-50`}
                  />
                  {errors.confirmPassword && <p className="text-red text-sm mt-1">{errors.confirmPassword}</p>}
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleResetPassword}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Güncelleniyor...
                      </>
                    ) : 'Parolayı Güncelle'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    disabled={isLoading}
                    className="inline-flex font-medium text-dark bg-gray-1 border border-gray-3 py-3 px-7 rounded-md ease-out duration-200 hover:bg-gray-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Geri
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetModal; 