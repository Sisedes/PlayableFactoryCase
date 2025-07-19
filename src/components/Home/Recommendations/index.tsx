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

  if (loading) {
    return (
      <section className="overflow-hidden py-20">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="text-center mb-10">
            <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto animate-pulse"></div>
          </div>
          <div className="flex gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse flex-shrink-0 w-64">
                <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="overflow-hidden py-20">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue text-white px-6 py-2 rounded-md hover:bg-blue-dark transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </section>
    );
  }

  const displayProducts = personalizedProducts.length > 0 ? personalizedProducts : popularProducts;

  return (
    <section className="overflow-hidden py-20">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* Başlık */}
        <div className="text-center mb-10">
          <span className="block font-medium text-custom-1 text-blue mb-2.5">
            Öneriler
          </span>
          <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
            En Çok Satanlar
          </h2>
          <p className="text-gray-600 mt-2">
            En Popüler Ürünlerimiz
          </p>
        </div>

        {/* Ürünler Slider */}
        {displayProducts.length > 0 ? (
          <div className="relative">
            <Swiper
              spaceBetween={24}
              slidesPerView={1}
              navigation={true}
              pagination={{ clickable: true }}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              breakpoints={{
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
                  <div className="h-full">
                    <ProductItem item={product} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">Henüz öneri bulunmuyor</p>
          </div>
        )}

        {/* Popüler ürünler varsa ve kişiselleştirilmiş öneriler gösteriliyorsa, popüler ürünleri de göster */}
        {personalizedProducts.length > 0 && popularProducts.length > 0 && (
          <div className="mt-16">
            <div className="text-center mb-10">
              <h3 className="font-semibold text-lg text-dark mb-2">
                En Popüler Ürünler
              </h3>
              <p className="text-gray-600">
                En çok tercih edilen ürünlerimiz
              </p>
            </div>
            <div className="relative">
              <Swiper
                spaceBetween={24}
                slidesPerView={1}
                navigation={true}
                pagination={{ clickable: true }}
                autoplay={{
                  delay: 3500,
                  disableOnInteraction: false,
                }}
                breakpoints={{
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
                {popularProducts.slice(0, 4).map((product) => (
                  <SwiperSlide key={product._id}>
                    <div className="h-full">
                      <ProductItem item={product} />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Recommendations; 