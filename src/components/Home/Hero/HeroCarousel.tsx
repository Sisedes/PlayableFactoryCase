"use client";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css/pagination";
import "swiper/css";

import Image from "next/image";
import { getPopularProducts } from "@/services/productService";
import { Product } from "@/types";
import { getImageUrl } from "@/utils/apiUtils";

const HeroCarousal = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await getPopularProducts(2);
        if (response.success) {
          setFeaturedProducts(response.data);
        }
      } catch (error) {
        console.error('Featured products fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      modules={[Autoplay, Pagination]}
      className="hero-carousel"
    >
      <SwiperSlide>
        <div className="flex items-center pt-6 sm:pt-0 flex-col-reverse sm:flex-row">
          <div className="max-w-[394px] py-10 sm:py-15 lg:py-24.5 pl-4 sm:pl-7.5 lg:pl-12.5">
            {loading ? (
              <>
                <div className="flex items-center gap-4 mb-7.5 sm:mb-10">
                  <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded mb-3 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded w-32 mt-10 animate-pulse"></div>
              </>
            ) : featuredProducts.length > 0 ? (
              <>
                <div className="flex items-center gap-4 mb-7.5 sm:mb-10">
                  <span className="block font-semibold text-heading-3 sm:text-heading-1 text-blue">
                    {featuredProducts[0].salePrice ? 
                      `%${Math.round(((featuredProducts[0].price - featuredProducts[0].salePrice) / featuredProducts[0].price) * 100)}` : 
                      '%30'
                    }
                  </span>
                  <span className="block text-dark text-sm sm:text-custom-1 sm:leading-[24px]">
                    İndirim
                    <br />
                    Fırsatı
                  </span>
                </div>

                <h1 className="font-semibold text-dark text-xl sm:text-3xl mb-3">
                  <a href={`/shop-details?id=${featuredProducts[0]._id}`}>
                    {featuredProducts[0].name}
                  </a>
                </h1>

                <p>
                  {featuredProducts[0].shortDescription || 'Premium kalite ve uygun fiyat garantisi'}
                </p>

                <a
                  href={`/shop-details?id=${featuredProducts[0]._id}`}
                  className="inline-flex font-medium text-white text-custom-sm rounded-md bg-dark py-3 px-9 ease-out duration-200 hover:bg-blue mt-10"
                >
                  Şimdi Alışveriş Yap
                </a>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-7.5 sm:mb-10">
                  <span className="block font-semibold text-heading-3 sm:text-heading-1 text-blue">
                    %30
                  </span>
                  <span className="block text-dark text-sm sm:text-custom-1 sm:leading-[24px]">
                    İndirim
                    <br />
                    Fırsatı
                  </span>
                </div>

                <h1 className="font-semibold text-dark text-xl sm:text-3xl mb-3">
                  <a href="#">En Popüler Ürünlerimiz</a>
                </h1>

                <p>
                  Premium kalite ve uygun fiyat garantisi
                </p>

                <a
                  href="/shop-with-sidebar"
                  className="inline-flex font-medium text-white text-custom-sm rounded-md bg-dark py-3 px-9 ease-out duration-200 hover:bg-blue mt-10"
                >
                  Şimdi Alışveriş Yap
                </a>
              </>
            )}
          </div>

          <div className="w-[351px] h-[358px] flex items-center justify-center bg-[#F6F7FB] rounded-lg overflow-hidden flex-shrink-0">
            {loading ? (
              <div className="w-full h-full bg-gray-200 animate-pulse"></div>
            ) : featuredProducts.length > 0 ? (
              <Image
                src={getImageUrl(featuredProducts[0].images?.[0]?.url || "/images/products/default.png")}
                alt={featuredProducts[0].name}
                width={351}
                height={358}
                className="object-contain w-full h-full"
                style={{ objectPosition: 'center' }}
              />
            ) : (
              <Image
                src="/images/hero/hero-01.png"
                alt="default product"
                width={351}
                height={358}
                className="object-contain w-full h-full"
                style={{ objectPosition: 'center' }}
              />
            )}
          </div>
        </div>
      </SwiperSlide>
      {featuredProducts.length > 1 && (
        <SwiperSlide>
          <div className="flex items-center pt-6 sm:pt-0 flex-col-reverse sm:flex-row">
            <div className="max-w-[394px] py-10 sm:py-15 lg:py-26 pl-4 sm:pl-7.5 lg:pl-12.5">
              {loading ? (
                <>
                  <div className="flex items-center gap-4 mb-7.5 sm:mb-10">
                    <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded mb-3 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded w-32 mt-10 animate-pulse"></div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-7.5 sm:mb-10">
                    <span className="block font-semibold text-heading-3 sm:text-heading-1 text-blue">
                      {featuredProducts[1].salePrice ? 
                        `%${Math.round(((featuredProducts[1].price - featuredProducts[1].salePrice) / featuredProducts[1].price) * 100)}` : 
                        '%25'
                      }
                    </span>
                    <span className="block text-dark text-sm sm:text-custom-1 sm:leading-[24px]">
                      İndirim
                      <br />
                      Fırsatı
                    </span>
                  </div>

                  <h1 className="font-semibold text-dark text-xl sm:text-3xl mb-3">
                    <a href={`/shop-details?id=${featuredProducts[1]._id}`}>
                      {featuredProducts[1].name}
                    </a>
                  </h1>

                  <p>
                    {featuredProducts[1].shortDescription || 'En son teknoloji ürünleri uygun fiyatlarla sizleri bekliyor'}
                  </p>

                  <a
                    href={`/shop-details?id=${featuredProducts[1]._id}`}
                    className="inline-flex font-medium text-white text-custom-sm rounded-md bg-dark py-3 px-9 ease-out duration-200 hover:bg-blue mt-10"
                  >
                    Şimdi Alışveriş Yap
                  </a>
                </>
              )}
            </div>

            <div className="w-[351px] h-[358px] flex items-center justify-center bg-[#F6F7FB] rounded-lg overflow-hidden flex-shrink-0">
              {loading ? (
                <div className="w-full h-full bg-gray-200 animate-pulse"></div>
              ) : (
                <Image
                  src={getImageUrl(featuredProducts[1].images?.[0]?.url || "/images/products/default.png")}
                  alt={featuredProducts[1].name}
                  width={351}
                  height={358}
                  className="object-contain w-full h-full"
                  style={{ objectPosition: 'center' }}
                />
              )}
            </div>
          </div>
        </SwiperSlide>
      )}
    </Swiper>
  );
};

export default HeroCarousal;
