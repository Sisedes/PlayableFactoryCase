"use client";
import React, { useEffect, useState } from "react";
import HeroCarousel from "./HeroCarousel";
import HeroFeature from "./HeroFeature";
import Image from "next/image";
import { getPopularProducts } from "@/services/productService";
import { Product } from "@/types";
import { getImageUrl } from "@/utils/apiUtils";

const Hero = () => {
  const [promoProducts, setPromoProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPromoProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getPopularProducts(2);
        if (response.success) {
          setPromoProducts(response.data);
        } else {
          setError(response.message || 'Ürünler yüklenirken hata oluştu');
        }
      } catch (error) {
        console.error('Promo products fetch error:', error);
        setError('Ürünler yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchPromoProducts();
  }, []);

  return (
    <section className="overflow-hidden pb-6 lg:pb-8 xl:pb-10 pt-32 sm:pt-36 lg:pt-40 xl:pt-44 bg-gradient-to-br from-[#E5EAF4] to-[#F0F4F8]">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-0">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 xl:gap-8">
          {/* Ana Hero Carousel */}
          <div className="w-full lg:w-2/3 xl:w-[757px]">
            <div className="relative z-10 rounded-xl lg:rounded-2xl bg-white overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              {/* Background shapes */}
              <div className="absolute right-0 bottom-0 -z-10 opacity-60">
                <Image
                  src="/images/hero/hero-bg.png"
                  alt="Hero background shapes"
                  width={534}
                  height={520}
                  className="w-auto h-auto max-w-full"
                  priority
                  quality={85}
                />
              </div>

              <HeroCarousel />
            </div>
          </div>

          {/* Promo Products Sidebar */}
          <div className="w-full lg:w-1/3 xl:w-[393px]">
            <div className="flex flex-col gap-4 lg:gap-5">
              {loading ? (
                // Loading skeleton
                <>
                  {[1, 2].map((index) => (
                    <div key={index} className="w-full relative rounded-xl bg-white p-4 sm:p-6 shadow-md animate-pulse">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-6 bg-gray-200 rounded w-20"></div>
                        </div>
                        <div className="w-24 h-32 sm:w-28 sm:h-36 bg-gray-200 rounded-lg flex-shrink-0"></div>
                      </div>
                    </div>
                  ))}
                </>
              ) : error ? (
                // Error state
                <div className="w-full rounded-xl bg-white p-6 shadow-md">
                  <div className="text-center">
                    <div className="text-red-500 mb-3">
                      <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <p className="text-sm">{error}</p>
                    </div>
                    <button 
                      onClick={() => window.location.reload()} 
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Tekrar Dene
                    </button>
                  </div>
                </div>
              ) : (
                // Real products
                promoProducts.map((product, index) => (
                  <div key={product._id} className="w-full relative rounded-xl bg-white p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 group">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          <a href={`/product/${product._id}`} className="hover:underline"> 
                            {product.name} 
                          </a>
                        </h3>

                        <div className="space-y-2">
                          <p className="font-medium text-gray-600 text-sm">
                            Sınırlı süre teklifi
                          </p>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-bold text-lg text-red-600">
                              ₺{product.salePrice || product.price}
                            </span>
                            {product.salePrice && (
                              <span className="font-medium text-base text-gray-400 line-through">
                                ₺{product.price}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="w-24 h-32 sm:w-28 sm:h-36 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 group-hover:bg-gray-100 transition-colors">
                        <Image
                          src={getImageUrl(product.images?.[0]?.url || "/images/products/default.png")}
                          alt={product.name}
                          width={112}
                          height={144}
                          className="object-contain w-full h-full"
                          style={{ objectPosition: 'center' }}
                          loading="lazy"
                          quality={80}
                          sizes="(max-width: 640px) 96px, 112px"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero features */}
      <HeroFeature />
    </section>
  );
};

export default Hero;
