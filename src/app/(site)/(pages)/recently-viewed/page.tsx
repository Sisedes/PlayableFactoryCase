"use client";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Breadcrumb from "@/components/Common/Breadcrumb";
import ProductItem from "@/components/Common/ProductItem";
import { Product } from "@/types/index";

const RecentlyViewedPage = () => {
  const { products } = useSelector((state: RootState) => state.recentlyViewedReducer);

  return (
    <>
      <Breadcrumb 
        title="Son Görüntülenen Ürünler" 
        pages={[
          { name: "Ana Sayfa", href: "/" },
          { name: "Son Görüntülenen Ürünler" }
        ]} 
      />

      <section className="overflow-hidden relative pb-8 sm:pb-12 lg:pb-20 pt-4 sm:pt-8 lg:pt-16 xl:pt-20">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-0">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8 lg:mb-10">
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
                Son Görüntülenen Ürünler
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {products.length > 0 
                  ? `${products.length} ürün bulundu` 
                  : "Henüz ürün görüntülemediniz"
                }
              </p>
            </div>
          </div>

          {/* Empty State */}
          {products.length === 0 ? (
            <div className="text-center py-12 sm:py-16 lg:py-20">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-4 sm:mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-medium text-gray-900 mb-2 sm:mb-3">
                Henüz ürün görüntülemediniz
              </h3>
              <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 max-w-md mx-auto">
                Ürünleri görüntülediğinizde burada listelenecekler
              </p>
              <a 
                href="/products" 
                className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue text-white text-sm sm:text-base rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Ürünleri Keşfet
              </a>
            </div>
          ) : (
            /* Products Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {products.map((product: Product) => (
                <div key={product._id} className="group">
                  <ProductItem item={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default RecentlyViewedPage; 