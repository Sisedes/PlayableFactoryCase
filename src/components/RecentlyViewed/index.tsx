"use client";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { clearRecentlyViewed, removeRecentlyViewed } from "@/redux/features/recentlyViewed-slice";
import ProductItem from "@/components/Common/ProductItem";
import { Product } from "@/types/index";

const RecentlyViewed = () => {
  const dispatch = useDispatch();
  const { products } = useSelector((state: RootState) => state.recentlyViewedReducer);

  const handleClearAll = () => {
    if (window.confirm('Tüm son görüntülenen ürünleri silmek istediğinizden emin misiniz?')) {
      dispatch(clearRecentlyViewed());
    }
  };

  const handleRemoveProduct = (productId: string) => {
    dispatch(removeRecentlyViewed(productId));
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-8 sm:py-12 lg:py-16">
      <div className="max-w-[1170px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-2 sm:mb-0">
              Son Görüntülenen Ürünler
            </h3>
            <button
              onClick={handleClearAll}
              className="text-sm sm:text-base text-red-600 hover:text-red-700 font-medium transition-colors duration-200"
            >
              Tümünü Temizle
            </button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {products.slice(0, 8).map((product: Product) => (
              <div key={product._id} className="relative group">
                <ProductItem item={product} />
                <button
                  onClick={() => handleRemoveProduct(product._id)}
                  className="absolute top-2 right-2 w-6 h-6 sm:w-7 sm:h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 shadow-sm"
                  title="Bu ürünü kaldır"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* View All Link */}
          {products.length > 8 && (
            <div className="mt-6 sm:mt-8 text-center">
              <a
                href="/recently-viewed"
                className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue text-white text-sm sm:text-base rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                Tümünü Gör ({products.length} ürün)
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed; 