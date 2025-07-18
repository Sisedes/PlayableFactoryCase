"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter, useSearchParams } from "next/navigation";
import { resendVerificationByEmail } from "@/services";

const Signin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [emailNotVerified, setEmailNotVerified] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);

  const { login, isLoading, error, clearError, resendVerificationEmail, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Giriş yapmış kullanıcıyı ana sayfaya yönlendir
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const verified = searchParams.get('verified');
    if (verified === 'true') {
      setVerificationMessage('E-posta adresiniz başarıyla doğrulandı! Artık giriş yapabilirsiniz.');
      
      setTimeout(() => {
        setVerificationMessage(null);
      }, 5000);
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      return;
    }

    setEmailNotVerified(null);
    clearError();

    const result = await login(formData);
    
    if (result && result.success) {
      router.push('/');
    } else if (result && result.message && result.message.includes('E-posta adresinizi doğrulamanız')) {
      setEmailNotVerified(formData.email);
    }
  };

  const handleResendVerification = async () => {
    if (!emailNotVerified) return;
    
    setResendLoading(true);
    
    try {
      const result = await resendVerificationByEmail(emailNotVerified);
      
      if (result.success) {
        setVerificationMessage('Doğrulama e-postası başarıyla gönderildi! E-posta kutunuzu kontrol edin.');
        setEmailNotVerified(null);
        
        // Başarı mesajını 5 saniye sonra temizle
        setTimeout(() => {
          setVerificationMessage(null);
        }, 5000);
      } else {
        alert(result.message || 'E-posta gönderilemedi. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
  };

  // Eğer kullanıcı giriş yapmışsa loading göster
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Yönlendiriliyorsunuz...</p>
        </div>
      </div>
    );
  }

  return (
    <>
              <Breadcrumb title={"Giriş Yap"} pages={[
          { name: "Giriş Yap" }
        ]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Hesabınıza Giriş Yapın
              </h2>
              <p>Bilgilerinizi aşağıya girin</p>
            </div>

            {verificationMessage && (
              <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-green-600 text-sm">{verificationMessage}</p>
                </div>
              </div>
            )}

            {emailNotVerified && (
              <div className="mb-6 p-6 rounded-lg bg-yellow-50 border border-yellow-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-lg font-medium text-yellow-800 mb-2">
                      E-posta Doğrulaması Gerekli
                    </h3>
                    <p className="text-yellow-700 mb-4">
                      <strong>{emailNotVerified}</strong> adresine gönderilen doğrulama e-postasındaki linke tıklayarak hesabınızı aktifleştirin.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleResendVerification}
                        disabled={resendLoading}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {resendLoading ? 'Gönderiliyor...' : 'Doğrulama E-postası Tekrar Gönder'}
                      </button>
                      <button
                        onClick={() => setEmailNotVerified(null)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Farklı E-posta ile Giriş Yap
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div>
              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <label htmlFor="email" className="block mb-2.5 text-dark font-medium">
                    E-posta Adresi <span className="text-red">*</span>
                  </label>

                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="E-posta adresinizi girin"
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="password" className="block mb-2.5 text-dark font-medium">
                    Parola <span className="text-red">*</span>
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Parolanızı girin"
                      autoComplete="current-password"
                      className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 pr-12 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-5 hover:text-dark transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !formData.email || !formData.password}
                  className="w-full flex justify-center items-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Giriş yapılıyor...
                    </>
                  ) : (
                    "Hesaba Giriş Yap"
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="block text-center text-dark-4 mt-4.5 ease-out duration-200 hover:text-dark"
                >
                  Parolanızı mı unuttunuz?
                </button>

                <span className="relative z-1 block font-medium text-center mt-4.5">
                  <span className="block absolute -z-1 left-0 top-1/2 h-px w-full bg-gray-3"></span>
                  <span className="inline-block px-3 bg-white">Veya</span>
                </span>

                <div className="flex flex-col gap-4.5 mt-4.5">
                  <button 
                    type="button"
                    className="flex justify-center items-center gap-3.5 rounded-lg border border-gray-3 bg-gray-1 p-3 ease-out duration-200 hover:bg-gray-2"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clipPath="url(#clip0_98_7461)">
                        <mask
                          id="mask0_98_7461"
                          maskUnits="userSpaceOnUse"
                          x="0"
                          y="0"
                          width="20"
                          height="20"
                        >
                          <path d="M20 0H0V20H20V0Z" fill="white" />
                        </mask>
                        <g mask="url(#mask0_98_7461)">
                          <path
                            d="M19.999 10.2218C20.0111 9.53429 19.9387 8.84791 19.7834 8.17737H10.2031V11.8884H15.8267C15.7201 12.5391 15.4804 13.162 15.1219 13.7195C14.7634 14.2771 14.2935 14.7578 13.7405 15.1328L13.7209 15.2571L16.7502 17.5568L16.96 17.5774C18.8873 15.8329 19.999 13.2661 19.999 10.2218Z"
                            fill="#4285F4"
                          />
                          <path
                            d="M10.2036 20C12.9586 20 15.2715 19.1111 16.9609 17.5777L13.7409 15.1332C12.8793 15.7223 11.7229 16.1333 10.2036 16.1333C8.91317 16.126 7.65795 15.7206 6.61596 14.9746C5.57397 14.2287 4.79811 13.1802 4.39848 11.9777L4.2789 11.9877L1.12906 14.3766L1.08789 14.4888C1.93622 16.1457 3.23812 17.5386 4.84801 18.512C6.45791 19.4852 8.31194 20.0005 10.2036 20Z"
                            fill="#34A853"
                          />
                          <path
                            d="M4.39899 11.9776C4.1758 11.3411 4.06063 10.673 4.05807 9.9999C4.06218 9.3279 4.1731 8.66067 4.38684 8.02221L4.38115 7.88959L1.1927 5.46234L1.0884 5.51095C0.372762 6.90337 0 8.44075 0 9.99983C0 11.5589 0.372762 13.0962 1.0884 14.4887L4.39899 11.9776Z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M10.2039 3.86663C11.6661 3.84438 13.0802 4.37803 14.1495 5.35558L17.0294 2.59997C15.1823 0.90185 12.7364 -0.0298855 10.2039 -3.67839e-05C8.31239 -0.000477835 6.45795 0.514733 4.84805 1.48799C3.23816 2.46123 1.93624 3.85417 1.08789 5.51101L4.38751 8.02225C4.79107 6.82005 5.5695 5.77231 6.61303 5.02675C7.65655 4.28119 8.91254 3.87541 10.2039 3.86663Z"
                            fill="#EB4335"
                          />
                        </g>
                      </g>
                      <defs>
                        <clipPath id="clip0_98_7461">
                          <rect width="20" height="20" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                    Google ile Giriş Yap
                  </button>

                  <button 
                    type="button"
                    className="flex justify-center items-center gap-3.5 rounded-lg border border-gray-3 bg-gray-1 p-3 ease-out duration-200 hover:bg-gray-2"
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 22 22"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10.9997 1.83331C5.93773 1.83331 1.83301 6.04119 1.83301 11.232C1.83301 15.3847 4.45954 18.9077 8.10178 20.1505C8.55988 20.2375 8.72811 19.9466 8.72811 19.6983C8.72811 19.4743 8.71956 18.7338 8.71567 17.9485C6.16541 18.517 5.6273 16.8395 5.6273 16.8395C5.21032 15.7532 4.60951 15.4644 4.60951 15.4644C3.77785 14.8811 4.6722 14.893 4.6722 14.893C5.59272 14.9593 6.07742 15.8615 6.07742 15.8615C6.89499 17.2984 8.22184 16.883 8.74493 16.6429C8.82718 16.0353 9.06478 15.6208 9.32694 15.3861C7.2909 15.1484 5.15051 14.3425 5.15051 10.7412C5.15051 9.71509 5.5086 8.87661 6.09503 8.21844C5.99984 7.98167 5.68611 7.02577 6.18382 5.73115C6.18382 5.73115 6.95358 5.47855 8.70532 6.69458C9.43648 6.48627 10.2207 6.3819 10.9997 6.37836C11.7787 6.3819 12.5635 6.48627 13.2961 6.69458C15.0457 5.47855 15.8145 5.73115 15.8145 5.73115C16.3134 7.02577 15.9995 7.98167 15.9043 8.21844C16.4921 8.87661 16.8477 9.715 16.8477 10.7412C16.8477 14.351 14.7033 15.146 12.662 15.3786C12.9909 15.6702 13.2838 16.2423 13.2838 17.1191C13.2838 18.3766 13.2732 19.3888 13.2732 19.6983C13.2732 19.9485 13.4382 20.2415 13.9028 20.1492C17.5431 18.905 20.1663 15.3833 20.1663 11.232C20.1663 6.04119 16.0621 1.83331 10.9997 1.83331Z"
                        fill="#15171A"
                      />
                    </svg>
                    GitHub ile Giriş Yap
                  </button>
                </div>

                <p className="text-center mt-6">
                  Hesabınız yok mu?
                  <Link
                    href="/signup"
                    className="text-dark ease-out duration-200 hover:text-blue pl-2"
                  >
                    Şimdi Kayıt Olun!
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signin;
