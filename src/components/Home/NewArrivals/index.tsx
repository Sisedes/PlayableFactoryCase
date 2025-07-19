"use client";
import { useEffect, useState } from "react";
import { getLatestProducts } from "@/services/productService";
import { Product } from "@/types";
import ProductItem from "@/components/Common/ProductItem";

const NewArrivals = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log('NewArrivals API çağrısı başlatılıyor...');
        const response = await getLatestProducts(4);
        console.log('NewArrivals API response:', response);
        
        if (response.success) {
          setProducts(response.data);
        } else {
          console.error('NewArrivals API error:', response.message);
          setError(response.message || 'Ürünler yüklenirken hata oluştu');
        }
      } catch (err) {
        console.error('NewArrivals fetch error:', err);
        setError('Ürünler yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="overflow-hidden pt-17.5">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 pb-15">
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
              Yeni Gelenler
            </span>
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
              En Yeni Ürünlerimizi Keşfedin
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="overflow-hidden pt-17.5">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 pb-15">
          <div className="text-center py-10">
            <p className="text-red">{error}</p>
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
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 pb-15">
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
            Yeni Gelenler
          </span>
          <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
            En Yeni Ürünlerimizi Keşfedin
          </h2>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product._id}>
                <ProductItem item={product} />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500">Henüz ürün bulunmuyor</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
