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

  useEffect(() => {
    const fetchPromoProducts = async () => {
      try {
        setLoading(true);
        const response = await getPopularProducts(2);
        if (response.success) {
          setPromoProducts(response.data);
        }
      } catch (error) {
        console.error('Promo products fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromoProducts();
  }, []);

  return (
    <section className="overflow-hidden pb-10 lg:pb-12.5 xl:pb-15 pt-57.5 sm:pt-45 lg:pt-30 xl:pt-51.5 bg-[#E5EAF4]">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex flex-wrap gap-5">
          <div className="xl:max-w-[757px] w-full">
            <div className="relative z-1 rounded-[10px] bg-white overflow-hidden">
              {/* <!-- bg shapes --> */}
              <Image
                src="/images/hero/hero-bg.png"
                alt="hero bg shapes"
                className="absolute right-0 bottom-0 -z-1"
                width={534}
                height={520}
              />

              <HeroCarousel />
            </div>
          </div>

          <div className="xl:max-w-[393px] w-full">
            <div className="flex flex-col sm:flex-row xl:flex-col gap-5">
              {loading ? (
                <>
                  <div className="w-full relative rounded-[10px] bg-white p-4 sm:p-7.5 animate-pulse">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="h-6 bg-gray-200 rounded mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                      </div>
                      <div className="w-[123px] h-[161px] bg-gray-200 rounded flex-shrink-0"></div>
                    </div>
                  </div>
                  <div className="w-full relative rounded-[10px] bg-white p-4 sm:p-7.5 animate-pulse">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="h-6 bg-gray-200 rounded mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                      </div>
                      <div className="w-[123px] h-[161px] bg-gray-200 rounded flex-shrink-0"></div>
                    </div>
                  </div>
                </>
              ) : (
                // Real products
                promoProducts.map((product, index) => (
                  <div key={product._id} className="w-full relative rounded-[10px] bg-white p-4 sm:p-7.5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-dark text-lg mb-4 line-clamp-2">
                          <a href={`/shop-details?id=${product._id}`} className="hover:text-blue transition-colors"> 
                            {product.name} 
                          </a>
                        </h2>

                        <div>
                          <p className="font-medium text-dark-4 text-custom-sm mb-1.5">
                            Sınırlı süre teklifi
                          </p>
                          <span className="flex items-center gap-3">
                            <span className="font-medium text-heading-5 text-red">
                              ₺{product.salePrice || product.price}
                            </span>
                            {product.salePrice && (
                              <span className="font-medium text-lg text-dark-4 line-through">
                                ₺{product.price}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="w-[123px] h-[161px] flex items-center justify-center bg-[#F6F7FB] rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={getImageUrl(product.images?.[0]?.url || "/images/products/default.png")}
                          alt={product.name}
                          width={123}
                          height={161}
                          className="object-contain w-full h-full"
                          style={{ objectPosition: 'center' }}
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

      {/* <!-- Hero features --> */}
      <HeroFeature />
    </section>
  );
};

export default Hero;
