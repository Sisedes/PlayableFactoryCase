"use client";
import React, { useEffect, useState } from "react";
import { Product } from "@/types";
import ProductItem from "@/components/Common/ProductItem";
import { getPopularProducts, getPersonalizedRecommendations } from "@/services/recommendationService";
import { useAuth } from "@/store/authStore";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Recommendations = () => {
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [personalizedProducts, setPersonalizedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user, accessToken } = useAuth();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        const popularResponse = await getPopularProducts(8);
        if (popularResponse.success) {
          setPopularProducts(popularResponse.data);
        }

        if (isAuthenticated && user?.id && accessToken) {
          try {
            const personalizedResponse = await getPersonalizedRecommendations(user.id, 8, accessToken);
            if (personalizedResponse.success) {
              setPersonalizedProducts(personalizedResponse.data);
            }
          } catch (error) {
            console.error('Personalized recommendations error:', error);
          }
        }
      } catch (err) {
        console.error('Recommendations fetch error:', err);
        setError('Öneriler yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [isAuthenticated, user?.id, accessToken]);

  const RecommendationsIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      <g clipPath="url(#clip0_834_7356)">
        <path
          d="M3.94024 13.4474C2.6523 12.1595 2.00832 11.5155 1.7687 10.68C1.52908 9.84449 1.73387 8.9571 2.14343 7.18231L2.37962 6.15883C2.72419 4.66569 2.89648 3.91912 3.40771 3.40789C3.91894 2.89666 4.66551 2.72437 6.15865 2.3798L7.18213 2.14361C8.95692 1.73405 9.84431 1.52927 10.6798 1.76889C11.5153 2.00851 12.1593 2.65248 13.4472 3.94042L14.9719 5.46512C17.2128 7.70594 18.3332 8.82635 18.3332 10.2186C18.3332 11.6109 17.2128 12.7313 14.9719 14.9721C12.7311 17.2129 11.6107 18.3334 10.2184 18.3334C8.82617 18.3334 7.70576 17.2129 5.46494 14.9721L3.94024 13.4474Z"
          stroke="#3C50E0"
          strokeWidth="1.5"
        />
        <circle
          cx="7.17245"
          cy="7.39917"
          r="1.66667"
          transform="rotate(-45 7.17245 7.39917)"
          stroke="#3C50E0"
          strokeWidth="1.5"
        />
        <path
          d="M9.61837 15.4164L15.4342 9.6004"
          stroke="#3C50E0"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_834_7356">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );

  if (loading) {
    return (
      <section className="overflow-hidden pt-12 lg:pt-16">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-0 pb-12 lg:pb-15">
          {/* Section Title Skeleton */}
          <div className="mb-8 lg:mb-10 text-center">
            <div className="flex items-center justify-center gap-2.5 mb-3 animate-pulse">
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="h-6 lg:h-8 bg-gray-200 rounded w-48 lg:w-64 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
          </div>
          
          {/* Products Swiper Skeleton */}
          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-48 lg:h-56 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="overflow-hidden pt-12 lg:pt-16">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-0 pb-12 lg:pb-15">
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-gray-600">{error}</p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </section>
    );
  }

  const displayProducts = personalizedProducts.length > 0 ? personalizedProducts : popularProducts;
  const sectionTitle = personalizedProducts.length > 0 ? 'Sizin İçin Öneriler' : 'En Çok Satanlar';
  const sectionSubtitle = personalizedProducts.length > 0 ? 'Size özel seçilmiş ürünler' : 'En Popüler Ürünlerimiz';

  return (
    <section className="overflow-hidden pt-12 lg:pt-16">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-0 pb-12 lg:pb-15">
        {/* Section Title */}
        <div className="mb-8 lg:mb-10 text-center">
          <span className="flex items-center justify-center gap-2.5 font-medium text-blue-600 mb-3">
            <RecommendationsIcon />
            <span className="text-sm lg:text-base">Öneriler</span>
          </span>
          <h2 className="font-bold text-xl lg:text-2xl xl:text-3xl text-gray-900 mb-2">
            {sectionTitle}
          </h2>
          <p className="text-gray-600 text-sm lg:text-base">
            {sectionSubtitle}
          </p>
        </div>

        {/* Products Swiper */}
        {displayProducts.length > 0 ? (
          <div className="relative">
            <Swiper
              spaceBetween={16}
              slidesPerView={1}
              navigation={{
                nextEl: '.swiper-button-next-recommendations',
                prevEl: '.swiper-button-prev-recommendations',
              }}
              pagination={{
                clickable: true,
                el: '.swiper-pagination-recommendations',
                dynamicBullets: true,
              }}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              loop={displayProducts.length > 4}
              breakpoints={{
                480: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                640: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 3,
                  spaceBetween: 24,
                },
                1024: {
                  slidesPerView: 4,
                  spaceBetween: 24,
                },
              }}
              modules={[Navigation, Pagination, Autoplay]}
              className="recommendations-swiper"
            >
              {displayProducts.map((product) => (
                <SwiperSlide key={product._id}>
                  <div className="h-full flex justify-center">
                    <ProductItem item={product} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom Navigation Buttons */}
            <button className="swiper-button-prev-recommendations absolute left-2 lg:left-4 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200">
              <svg className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button className="swiper-button-next-recommendations absolute right-2 lg:right-4 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200">
              <svg className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Custom Pagination */}
            <div className="swiper-pagination-recommendations flex justify-center mt-6 space-x-1"></div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <p className="text-lg">Henüz öneri bulunmuyor</p>
              <p className="text-sm mt-2">Yakında size özel öneriler eklenecek</p>
            </div>
          </div>
        )}

        {/* Popüler ürünler varsa ve kişiselleştirilmiş öneriler gösteriliyorsa, popüler ürünleri de göster */}
        {personalizedProducts.length > 0 && popularProducts.length > 0 && (
          <div className="mt-12 lg:mt-16">
            <div className="text-center mb-8 lg:mb-10">
              <h3 className="font-bold text-lg lg:text-xl text-gray-900 mb-2">
                En Popüler Ürünler
              </h3>
              <p className="text-gray-600 text-sm lg:text-base">
                En çok tercih edilen ürünlerimiz
              </p>
            </div>
            <div className="relative">
              <Swiper
                spaceBetween={16}
                slidesPerView={1}
                navigation={{
                  nextEl: '.swiper-button-next-popular',
                  prevEl: '.swiper-button-prev-popular',
                }}
                pagination={{
                  clickable: true,
                  el: '.swiper-pagination-popular',
                  dynamicBullets: true,
                }}
                autoplay={{
                  delay: 4500,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                loop={popularProducts.length > 4}
                breakpoints={{
                  480: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                  },
                  640: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                  },
                  768: {
                    slidesPerView: 3,
                    spaceBetween: 24,
                  },
                  1024: {
                    slidesPerView: 4,
                    spaceBetween: 24,
                  },
                }}
                modules={[Navigation, Pagination, Autoplay]}
                className="popular-swiper"
              >
                {popularProducts.slice(0, 4).map((product) => (
                  <SwiperSlide key={product._id}>
                    <div className="h-full flex justify-center">
                      <ProductItem item={product} />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Custom Navigation Buttons */}
              <button className="swiper-button-prev-popular absolute left-2 lg:left-4 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200">
                <svg className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button className="swiper-button-next-popular absolute right-2 lg:right-4 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200">
                <svg className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Custom Pagination */}
              <div className="swiper-pagination-popular flex justify-center mt-6 space-x-1"></div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Recommendations; 