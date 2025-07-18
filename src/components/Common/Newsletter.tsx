"use client";
import React, { useState } from "react";
import Image from "next/image";
import { subscribeToNewsletter } from "@/services";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Lütfen e-posta adresinizi girin' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ type: 'error', text: 'Geçerli bir e-posta adresi girin' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await subscribeToNewsletter(email);
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Bülten aboneliğiniz başarıyla tamamlandı!' });
        setEmail("");
      } else {
        setMessage({ type: 'error', text: response.message || 'Bir hata oluştu' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Bülten aboneliği sırasında hata oluştu' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="overflow-hidden py-15">
      <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
        <div className="relative z-1 overflow-hidden rounded-xl">
          {/* <!-- bg shapes --> */}
          <Image
            src="/images/shapes/newsletter-bg.jpg"
            alt="background illustration"
            className="absolute -z-1 w-full h-full left-0 top-0 rounded-xl"
            width={1170}
            height={200}
          />
          <div className="absolute -z-1 max-w-[523px] max-h-[243px] w-full h-full right-0 top-0 bg-gradient-1"></div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 px-4 sm:px-7.5 xl:pl-12.5 xl:pr-14 py-11">
            <div className="max-w-[491px] w-full">
              <h2 className="max-w-[399px] text-white font-bold text-lg sm:text-xl xl:text-heading-4 mb-3">
                En Son Trendler ve Fırsatları Kaçırmayın
              </h2>
              <p className="text-white">
                En son fırsatlar ve indirim kodları hakkında haber almak için kayıt olun
              </p>
            </div>

            <div className="max-w-[477px] w-full">
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-posta adresinizi girin"
                    className="w-full bg-gray-1 border border-gray-3 outline-none rounded-md placeholder:text-dark-4 py-3 px-5"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-3 px-7 text-white bg-blue font-medium rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      'Abone Ol'
                    )}
                  </button>
                </div>
                
                {message && (
                  <div className={`mt-3 text-sm ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                    {message.text}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
