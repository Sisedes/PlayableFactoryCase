"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const signupSchema = z.object({
  firstName: z
    .string()
    .min(1, "Ad gereklidir")
    .min(2, "Ad en az 2 karakter olmalıdır"),
  lastName: z
    .string()
    .min(1, "Soyad gereklidir")
    .min(2, "Soyad en az 2 karakter olmalıdır"),
  email: z
    .string()
    .min(1, "E-posta adresi gereklidir")
    .email("Geçerli bir e-posta adresi giriniz"),
  password: z
    .string()
    .min(1, "Parola gereklidir")
    .min(6, "Parola en az 6 karakter olmalıdır"),
  confirmPassword: z
    .string()
    .min(1, "Parola tekrarı gereklidir"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Parolalar eşleşmiyor",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const { register: registerUser, isLoading, isRegisterLoading, error, clearError, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
  });

  const watchedEmail = watch("email");

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: SignupFormData) => {
    clearError();

    const registerData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
    };

    const result = await registerUser(registerData);
    
    if (result && result.success) {
      setRegistrationSuccess(true);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Yönlendiriliyorsunuz...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb title={"Kayıt Ol"} pages={[
        { name: "Kayıt Ol" }
      ]} />
      
      <section className="overflow-hidden py-12 lg:py-16 xl:py-20 bg-gray-50">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-0">
          <div className="max-w-[600px] w-full mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10 border border-gray-100">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h2 className="font-bold text-2xl sm:text-3xl text-gray-900 mb-2">
                  {registrationSuccess ? "Kayıt Başarılı!" : "Hesap Oluşturun"}
                </h2>
                <p className="text-gray-600">
                  {registrationSuccess ? "Hesabınız başarıyla oluşturuldu" : "Bilgilerinizi aşağıya girin"}
                </p>
              </div>

              {registrationSuccess && (
                <div className="mb-8 p-6 rounded-lg bg-green-50 border border-green-200 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
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
                  </div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    Hesabınız Oluşturuldu!
                  </h3>
                  <p className="text-green-700 mb-4">
                    <strong>{watchedEmail}</strong> adresine bir doğrulama e-postası gönderildi.
                  </p>
                  <p className="text-green-600 text-sm mb-6">
                    Hesabınızı aktifleştirmek için e-posta kutunuzu kontrol edin ve doğrulama linkine tıklayın.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => router.push('/signin')}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Giriş Sayfasına Git
                    </button>
                    <button
                      onClick={() => {
                        setRegistrationSuccess(false);
                        setValue("firstName", "");
                        setValue("lastName", "");
                        setValue("email", "");
                        setValue("password", "");
                        setValue("confirmPassword", "");
                        clearError();
                      }}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Yeni Kayıt
                    </button>
                  </div>
                </div>
              )}

              {error && !registrationSuccess && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-red-800 text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              {!registrationSuccess && (
                <>
                  <div className="space-y-4 mb-6">
                    <button 
                      type="button"
                      className="w-full flex justify-center items-center gap-3 rounded-lg border border-gray-300 bg-white p-3 transition-all duration-200 hover:bg-gray-50 hover:border-gray-400 shadow-sm"
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
                      <span className="font-medium text-gray-700">Google ile Kayıt Ol</span>
                    </button>

                  </div>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500 font-medium">Veya</span>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block mb-2 text-sm font-semibold text-gray-900">
                          Ad <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register("firstName")}
                          type="text"
                          id="firstName"
                          placeholder="Adınızı girin"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white placeholder-gray-500 ${
                            errors.firstName 
                              ? 'border-red-300 focus:ring-red-500' 
                              : 'border-gray-300'
                          }`}
                          disabled={isRegisterLoading}
                        />
                        {errors.firstName && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block mb-2 text-sm font-semibold text-gray-900">
                          Soyad <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register("lastName")}
                          type="text"
                          id="lastName"
                          placeholder="Soyadınızı girin"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white placeholder-gray-500 ${
                            errors.lastName 
                              ? 'border-red-300 focus:ring-red-500' 
                              : 'border-gray-300'
                          }`}
                          disabled={isRegisterLoading}
                        />
                        {errors.lastName && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block mb-2 text-sm font-semibold text-gray-900">
                        E-posta <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("email")}
                        type="email"
                        id="email"
                        placeholder="E-posta adresinizi girin"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white placeholder-gray-500 ${
                          errors.email 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-gray-300'
                        }`}
                        disabled={isRegisterLoading}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="password" className="block mb-2 text-sm font-semibold text-gray-900">
                        Parola <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          {...register("password")}
                          type={showPassword ? "text" : "password"}
                          id="password"
                          placeholder="Parolanızı girin"
                          className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white placeholder-gray-500 ${
                            errors.password 
                              ? 'border-red-300 focus:ring-red-500' 
                              : 'border-gray-300'
                          }`}
                          disabled={isRegisterLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1"
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
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block mb-2 text-sm font-semibold text-gray-900">
                        Parola Tekrar <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          {...register("confirmPassword")}
                          type={showConfirmPassword ? "text" : "password"}
                          id="confirmPassword"
                          placeholder="Parolanızı tekrar girin"
                          className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white placeholder-gray-500 ${
                            errors.confirmPassword 
                              ? 'border-red-300 focus:ring-red-500' 
                              : 'border-gray-300'
                          }`}
                          disabled={isRegisterLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1"
                        >
                          {showConfirmPassword ? (
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
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={!isValid || isRegisterLoading}
                      className="w-full flex justify-center items-center font-semibold text-white bg-green py-3 px-6 rounded-lg transition-all duration-200 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      {isRegisterLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Kayıt olunuyor...
                        </div>
                      ) : (
                        "Hesap Oluştur"
                      )}
                    </button>

                    <div className="text-center pt-4 border-t border-gray-200">
                      <p className="text-gray-600">
                        Zaten hesabınız var mı?{" "}
                        <Link
                          href="/signin"
                          className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                        >
                          Şimdi Giriş Yapın
                        </Link>
                      </p>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signup; 