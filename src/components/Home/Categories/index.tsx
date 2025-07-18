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
        console.log('Categories API çağrısı başlatılıyor...');
        const response = await getAllCategories();
        console.log('Categories API response:', response);
        
        if (response.success) {
          const activeCategories = response.data.filter(cat => cat.isActive);
          console.log('Active categories:', activeCategories);
          setCategories(activeCategories);
        } else {
          console.error('Categories API error:', response.message);
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

  if (loading) {
  return (
    <section className="overflow-hidden pt-17.5">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 pb-15 border-b border-gray-3">
          <div className="mb-10 text-center">
            <span className="flex items-center justify-center gap-2.5 font-medium text-dark mb-1.5">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
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
              Kategoriler
              </span>
              <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
              Kategorilere Göz Atın
              </h2>
          </div>
          <div className="flex justify-center">
            <div className="animate-pulse">
              <div className="w-32 h-32 bg-gray-200 rounded-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="overflow-hidden pt-17.5">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 pb-15 border-b border-gray-3">
          <div className="text-center py-10">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue text-white rounded hover:bg-blue-dark"
            >
              Tekrar Dene
              </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden pt-17.5">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 pb-15 border-b border-gray-3">
        {/* <!-- section title --> */}
        <div className="mb-10 text-center">
          <span className="flex items-center justify-center gap-2.5 font-medium text-dark mb-1.5">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
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
            Kategoriler
          </span>
          <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
            Kategorilere Göz Atın
          </h2>
          </div>

        {/* Swiper Categories */}
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={2}
            navigation={{
              nextEl: '.swiper-button-next-categories',
              prevEl: '.swiper-button-prev-categories',
            }}
            pagination={{
              clickable: true,
              el: '.swiper-pagination-categories',
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              640: {
                slidesPerView: 3,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 4,
                spaceBetween: 30,
              },
              1024: {
                slidesPerView: 5,
                spaceBetween: 30,
              },
              1280: {
                slidesPerView: 6,
                spaceBetween: 30,
              },
            }}
            className="categories-swiper"
          >
            {categories.length > 0 ? (
              categories.map((category) => (
                <SwiperSlide key={category._id} className="flex justify-center">
                  <div className="w-[150px] flex justify-center">
                    <SingleItem item={category} />
                  </div>
                </SwiperSlide>
              ))
            ) : (
              <SwiperSlide>
                <div className="text-center py-10">
                  <p className="text-gray-500">Henüz kategori bulunmuyor</p>
                </div>
              </SwiperSlide>
            )}
          </Swiper>

          {/* Custom Navigation Buttons */}
          <button className="swiper-button-prev-categories absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button className="swiper-button-next-categories absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Custom Pagination */}
          <div className="swiper-pagination-categories flex justify-center mt-6 space-x-2"></div>
        </div>
      </div>
    </section>
  );
};

export default Categories;
