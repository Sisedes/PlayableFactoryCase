"use client";
import React, { useEffect, useState } from "react";
import { Product } from "@/types";
import ProductItem from "@/components/Common/ProductItem";
import { getProductRecommendations, getPopularProducts } from "@/services/recommendationService";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Swiper CSS
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ProductRecommendationsProps {
  productId: string;
}

const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({ productId }) => {
  const [recommendations, setRecommendations] = useState<{
    similar: Product[];
    frequentlyBought: Product[];
    viewedTogether: Product[];
  }>({
    similar: [],
    frequentlyBought: [],
    viewedTogether: []
  });
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        // Ürün önerilerini getir
        const response = await getProductRecommendations(productId);
        if (response.success) {
          setRecommendations(response.data);
        }

        // Popüler ürünleri de getir (fallback için)
        const popularResponse = await getPopularProducts(8);
        if (popularResponse.success) {
          setPopularProducts(popularResponse.data);
        }
      } catch (err) {
        console.error('Product recommendations fetch error:', err);
        setError('Öneriler yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [productId]);

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

  const hasAnyRecommendations = recommendations.similar.length > 0 || 
                               recommendations.frequentlyBought.length > 0 || 
                               recommendations.viewedTogether.length > 0;

  if (!hasAnyRecommendations && popularProducts.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden py-20">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* Benzer Ürünler */}
        {recommendations.similar.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-10">
              <h3 className="font-semibold text-xl text-dark mb-2">
                Benzer Ürünler
              </h3>
              <p className="text-gray-600">
                Bu ürüne benzer özelliklere sahip ürünler
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recommendations.similar.map((product) => (
                <div key={product._id}>
                  <ProductItem item={product} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sıkça Birlikte Alınanlar - Slider */}
        {recommendations.frequentlyBought.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-10">
              <h3 className="font-semibold text-xl text-dark mb-2">
                Sıkça Birlikte Alınanlar
              </h3>
              <p className="text-gray-600">
                Bu ürünle birlikte sıkça satın alınan ürünler
              </p>
            </div>
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
                {recommendations.frequentlyBought.map((product) => (
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

        {/* Birlikte Görüntülenenler */}
        {recommendations.viewedTogether.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-10">
              <h3 className="font-semibold text-xl text-dark mb-2">
                Bunu Görüntüleyenler Şunları Da Görüntüledi
              </h3>
              <p className="text-gray-600">
                Bu ürünü görüntüleyen kullanıcıların baktığı diğer ürünler
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recommendations.viewedTogether.map((product) => (
                <div key={product._id}>
                  <ProductItem item={product} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* En Popüler Ürünler - Sıkça birlikte alınanlar yoksa veya azsa göster */}
        {(recommendations.frequentlyBought.length === 0 || recommendations.frequentlyBought.length < 4) && popularProducts.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-10">
              <h3 className="font-semibold text-xl text-dark mb-2">
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
                {popularProducts.slice(0, 8).map((product) => (
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

export default ProductRecommendations; 