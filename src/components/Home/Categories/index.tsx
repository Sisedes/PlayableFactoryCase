"use client";
import { useEffect, useState } from "react";
import { getAllCategories } from "@/services/categoryService";
import { Category } from "@/types";
import SingleItem from "./SingleItem";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Swiper CSS
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAllCategories();
        
        if (response.success) {
          const activeCategories = response.data.filter(cat => cat.isActive);
          setCategories(activeCategories);
        } else {
          setError(response.message || 'Kategoriler yüklenirken hata oluştu');
        }
      } catch (err) {
        console.error('Categories fetch error:', err);
        setError('Kategoriler yüklenirken hata oluştu');
      } finally {
        setLoading(false);
    }
    };

    fetchCategories();
  }, []);

  const CategoryIcon = () => (
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
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-0 pb-12 lg:pb-15 border-b border-gray-200">
          {/* Section Title Skeleton */}
          <div className="mb-8 lg:mb-10 text-center">
            <div className="flex items-center justify-center gap-2.5 mb-3 animate-pulse">
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="h-6 lg:h-8 bg-gray-200 rounded w-48 lg:w-64 mx-auto"></div>
          </div>
          
          {/* Categories Grid Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="flex flex-col items-center animate-pulse">
                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gray-200 rounded-full mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-16 lg:w-20"></div>
            </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="overflow-hidden pt-12 lg:pt-16">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-0 pb-12 lg:pb-15 border-b border-gray-200">
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

  return (
    <section className="overflow-hidden pt-12 lg:pt-16">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-0 pb-12 lg:pb-15 border-b border-gray-200">
        {/* Section Title */}
        <div className="mb-8 lg:mb-10 text-center">
          <span className="flex items-center justify-center gap-2.5 font-medium text-gray-700 mb-3">
            <CategoryIcon />
            <span className="text-sm lg:text-base">Kategoriler</span>
          </span>
          <h2 className="font-bold text-xl lg:text-2xl xl:text-3xl text-gray-900">
            Kategorilere Göz Atın
          </h2>
          </div>

        {/* Categories Swiper */}
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={16}
            slidesPerView={2}
            navigation={{
              nextEl: '.swiper-button-next-categories',
              prevEl: '.swiper-button-prev-categories',
            }}
            pagination={{
              clickable: true,
              el: '.swiper-pagination-categories',
              dynamicBullets: true,
            }}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={categories.length > 6}
            breakpoints={{
              480: {
                slidesPerView: 3,
                spaceBetween: 20,
              },
              640: {
                slidesPerView: 4,
                spaceBetween: 24,
              },
              768: {
                slidesPerView: 5,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 6,
                spaceBetween: 24,
              },
            }}
            className="categories-swiper"
          >
            {categories.length > 0 ? (
              categories.map((category) => (
                <SwiperSlide key={category._id} className="flex justify-center">
                  <div className="w-full max-w-[150px] flex justify-center">
                    <SingleItem item={category} />
                  </div>
                </SwiperSlide>
              ))
            ) : (
              <SwiperSlide>
                <div className="text-center py-8">
                  <p className="text-gray-500">Henüz kategori bulunmuyor</p>
                </div>
              </SwiperSlide>
            )}
          </Swiper>

          {/* Custom Navigation Buttons */}
          <button className="swiper-button-prev-categories absolute left-2 lg:left-4 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200">
            <svg className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button className="swiper-button-next-categories absolute right-2 lg:right-4 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200">
            <svg className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Custom Pagination */}
          <div className="swiper-pagination-categories flex justify-center mt-6 space-x-1"></div>
        </div>
      </div>
    </section>
  );
};

export default Categories;
