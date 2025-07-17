"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { verifyEmail } from '@/services';
import Breadcrumb from '@/components/Common/Breadcrumb';

interface VerificationState {
  status: 'loading' | 'success' | 'error';
  message: string;
}

const EmailVerification = () => {
  const params = useParams();
  const router = useRouter();
  const [verification, setVerification] = useState<VerificationState>({
    status: 'loading',
    message: 'E-posta adresiniz doğrulanıyor...'
  });
  const isVerificationCalled = useRef(false);

  const token = typeof params.token === 'string' ? params.token : '';

  useEffect(() => {
    const handleVerification = async () => {
      // Daha önce çağrıldıysa tekrar çağırma
      if (isVerificationCalled.current) {
        return;
      }
      
      // Params henüz yüklenmemişse bekle
      if (!params || !params.token) {
        return;
      }
      
      // Token boş veya geçersizse error göster
      if (!token || token.trim() === '') {
        setVerification({
          status: 'error',
          message: 'Geçersiz doğrulama linki. Token bulunamadı.'
        });
        return;
      }

      // Çağrı yapıldığını işaretle
      isVerificationCalled.current = true;
      
      const response = await verifyEmail(token);
      
      if (response.success) {
        setVerification({
          status: 'success',
          message: response.message || 'E-posta adresiniz başarıyla doğrulandı!'
        });
        
        // 3 saniye sonra giriş sayfasına yönlendir
        setTimeout(() => {
          router.push('/signin?verified=true');
        }, 3000);
      } else {
        setVerification({
          status: 'error',
          message: response.message || 'E-posta doğrulama başarısız oldu.'
        });
      }
    };

    handleVerification();
  }, [params, token, router]);

  const handleLoginRedirect = () => {
    router.push('/signin');
  };

  const handleHomeRedirect = () => {
    router.push('/');
  };

  return (
    <>
      <Breadcrumb
        title="E-posta Doğrulama"
        pages={["ana sayfa", "/", "e-posta doğrulama"]}
      />
      
      <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[540px] mx-auto">
            <div className="bg-white shadow-1 rounded-lg p-8 lg:p-11">
              <div className="text-center">
                {/* Loading State */}
                {verification.status === 'loading' && (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue mb-6"></div>
                    <h2 className="text-2xl font-bold text-dark mb-4">
                      Doğrulanıyor...
                    </h2>
                    <p className="text-gray-600">{verification.message}</p>
                  </div>
                )}

                {/* Success State */}
                {verification.status === 'success' && (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                      <svg 
                        className="w-8 h-8 text-green-600" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M5 13l4 4L19 7" 
                        />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-dark mb-4">
                      Başarılı!
                    </h2>
                    <p className="text-gray-600 mb-6">{verification.message}</p>
                    <p className="text-sm text-blue mb-6">
                      3 saniye içinde giriş sayfasına yönlendirileceksiniz...
                    </p>
                    <button
                      onClick={handleLoginRedirect}
                      className="bg-blue text-white font-medium py-3 px-8 rounded-lg hover:bg-blue-dark transition-colors"
                    >
                      Şimdi Giriş Yap
                    </button>
                  </div>
                )}

                {/* Error State */}
                {verification.status === 'error' && (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                      <svg 
                        className="w-8 h-8 text-red-600" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M6 18L18 6M6 6l12 12" 
                        />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-dark mb-4">
                      Doğrulama Başarısız
                    </h2>
                    <p className="text-gray-600 mb-8">{verification.message}</p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                      <button
                        onClick={handleLoginRedirect}
                        className="flex-1 bg-blue text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-dark transition-colors"
                      >
                        Giriş Sayfasına Git
                      </button>
                      <button
                        onClick={handleHomeRedirect}
                        className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Ana Sayfaya Dön
                      </button>
                    </div>
                    
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-dark mb-2">
                        Yardıma mı ihtiyacınız var?
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Eğer link süresi dolmuşsa veya çalışmıyorsa, giriş yaptıktan sonra 
                        hesap sayfanızdan yeni bir doğrulama e-postası talep edebilirsiniz.
                      </p>
                      <button
                        onClick={handleLoginRedirect}
                        className="text-sm text-blue hover:text-blue-dark transition-colors underline"
                      >
                        Giriş yapıp tekrar dene
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default EmailVerification; 