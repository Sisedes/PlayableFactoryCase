"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import CustomSelect from "./CustomSelect";
import CategoryDropdown from "./CategoryDropdown";
import GenderDropdown from "./GenderDropdown";
import SizeDropdown from "./SizeDropdown";
import ColorsDropdwon from "./ColorsDropdwon";
import PriceDropdown from "./PriceDropdown";
import SingleGridItem from "../Shop/SingleGridItem";
import SingleListItem from "../Shop/SingleListItem";
import { useStore } from "@/store/useStore";
import { Product } from "@/types/product";
import { getImageUrl } from "@/utils/apiUtils";

const transformApiProductToComponent = (apiProduct: any): Product => {
  console.log('🔧 Transforming product:', {
    _id: apiProduct._id,
    name: apiProduct.name,
    price: apiProduct.price,
    salePrice: apiProduct.salePrice,
    pricing: apiProduct.pricing,
    images: apiProduct.images,
    fullProduct: apiProduct
  });

  const transformed: Product = {
    _id: apiProduct._id || apiProduct.id || Math.random().toString(),
    name: apiProduct.name || '',
    slug: apiProduct.slug || apiProduct.name?.toLowerCase().replace(/\s+/g, '-') || '',
    description: apiProduct.description || '',
    shortDescription: apiProduct.shortDescription || '',
    category: apiProduct.category || { _id: '', name: '', slug: '' },
    price: apiProduct.price || 0,
    salePrice: apiProduct.salePrice || 0,
    currency: apiProduct.currency || 'TRY',
    sku: apiProduct.sku || '',
    stock: apiProduct.stock || 0,
    trackQuantity: apiProduct.trackQuantity || false,
    lowStockThreshold: apiProduct.lowStockThreshold || 0,
    images: apiProduct.images?.map((img: any) => ({
      url: getImageUrl(img.url),
      alt: img.alt || apiProduct.name || '',
      isMain: img.isMain || false,
      isPrimary: img.isPrimary || false,
      sortOrder: img.sortOrder || 0
    })) || [],
    tags: apiProduct.tags || [],
    status: apiProduct.status || 'active',
    isFeatured: apiProduct.isFeatured || false,
    averageRating: apiProduct.averageRating || 0,
    reviewCount: apiProduct.reviewCount || 0,
    createdAt: apiProduct.createdAt || new Date().toISOString(),
    updatedAt: apiProduct.updatedAt || new Date().toISOString()
  };

  console.log('✨ Transformed result:', transformed);
  return transformed;
};

const ShopWithSidebar = () => {
  const [productStyle, setProductStyle] = useState("grid");
  const [productSidebar, setProductSidebar] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const [transformedProducts, setTransformedProducts] = useState<Product[]>([]);

  // Zustand store'dan veri ve fonksiyonları al
  const { 
    products, 
    categories,
    productsLoading, 
    categoriesLoading,
    error, 
    totalProducts,
    currentPage,
    totalPages,
    fetchProducts,
    fetchCategories,
    updateFilters,
    clearFilters,
    clearError
  } = useStore();

  const handleStickyMenu = () => {
    if (window.scrollY >= 80) {
      setStickyMenu(true);
    } else {
      setStickyMenu(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  useEffect(() => {
    console.log('🔍 API Products:', products);
    if (products && products.length > 0) {
      const transformed = products.map(transformApiProductToComponent);
      console.log('✅ Transformed Products:', transformed);
      setTransformedProducts(transformed);
    } else {
      setTransformedProducts([]);
    }
  }, [products]);

  useEffect(() => {
    window.addEventListener("scroll", handleStickyMenu);

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Element;
      if (!target.closest(".sidebar-content")) {
        setProductSidebar(false);
      }
    }

    if (productSidebar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("scroll", handleStickyMenu);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [productSidebar]);

  const sortOptions = [
    { label: "En Yeni Ürünler", value: "createdAt-desc" },
    { label: "En Çok Satan", value: "popular" },
    { label: "Fiyat (Düşük-Yüksek)", value: "price-asc" },
    { label: "Fiyat (Yüksek-Düşük)", value: "price-desc" },
  ];

  const categoryOptions = categories.map(category => ({
    name: category.name,
    products: 0, 
    isRefined: false,
  }));

  const genderOptions = [
    { name: "Erkek", products: 0 },
    { name: "Kadın", products: 0 },
    { name: "Unisex", products: 0 },
  ];

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-');
    if (sortOrder === "asc" || sortOrder === "desc") {
      updateFilters({ sortBy, sortOrder });
    } else {
      console.error("Invalid sort order:", sortOrder);
    }
  };

  if (productsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue"></div>
          <p className="mt-4 text-gray-600">Ürünler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">Hata: {error}</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => fetchProducts()}
              className="px-4 py-2 bg-blue text-white rounded hover:bg-blue-dark transition-colors"
            >
              Tekrar Dene
            </button>
            <button 
              onClick={clearError}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Hatayı Temizle
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb
        title={"Tüm Ürünleri Keşfet"}
        pages={[
          { name: "Ürünler", href: "/products" }
        ]}
      />
      <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28 bg-[#f3f4f6]">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex gap-7.5">
            {/* <!-- Sidebar Start --> */}
            <div
              className={`sidebar-content fixed xl:z-1 z-9999 left-0 top-0 xl:translate-x-0 xl:static max-w-[310px] xl:max-w-[270px] w-full ease-out duration-200 ${
                productSidebar
                  ? "translate-x-0 bg-white p-5 h-screen overflow-y-auto"
                  : "-translate-x-full"
              }`}
            >
              <button
                onClick={() => setProductSidebar(!productSidebar)}
                aria-label="ürün sidebar toggle butonu"
                className={`xl:hidden absolute -right-12.5 sm:-right-8 flex items-center justify-center w-8 h-8 rounded-md bg-white shadow-1 ${
                  stickyMenu
                    ? "lg:top-20 sm:top-34.5 top-35"
                    : "lg:top-24 sm:top-39 top-37"
                }`}
              >
                <svg
                  className="fill-current"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10.0068 3.44714C10.3121 3.72703 10.3328 4.20146 10.0529 4.5068L5.70494 9.25H20C20.4142 9.25 20.75 9.58579 20.75 10C20.75 10.4142 20.4142 10.75 20 10.75H4.00002C3.70259 10.75 3.43327 10.5742 3.3135 10.302C3.19374 10.0298 3.24617 9.71246 3.44715 9.49321L8.94715 3.49321C9.22704 3.18787 9.70147 3.16724 10.0068 3.44714Z"
                    fill=""
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M20.6865 13.698C20.5668 13.4258 20.2974 13.25 20 13.25L4.00001 13.25C3.5858 13.25 3.25001 13.5858 3.25001 14C3.25001 14.4142 3.5858 14.75 4.00001 14.75L18.2951 14.75L13.9472 19.4932C13.6673 19.7985 13.6879 20.273 13.9932 20.5529C14.2986 20.8328 14.773 20.8121 15.0529 20.5068L20.5529 14.5068C20.7539 14.2876 20.8063 13.9703 20.6865 13.698Z"
                    fill=""
                  />
                </svg>
              </button>

              <form onSubmit={(e) => e.preventDefault()}>
                <div className="flex flex-col gap-6">
                  {/* <!-- filter box --> */}
                  <div className="bg-white shadow-1 rounded-lg py-4 px-5">
                    <div className="flex items-center justify-between">
                      <p>Filtreler:</p>
                      <button 
                        type="button"
                        onClick={clearFilters}
                        className="text-blue hover:text-blue-dark transition-colors"
                      >
                        Tümünü Temizle
                      </button>
                    </div>
                  </div>

                  {/* <!-- category box --> */}
                  <CategoryDropdown categories={categoryOptions} />

                  {/* <!-- gender box --> */}
                  <GenderDropdown genders={genderOptions} />

                  {/* <!-- size box --> */}
                  <SizeDropdown />

                  {/* <!-- color box --> */}
                  <ColorsDropdwon />

                  {/* <!-- price range box --> */}
                  <PriceDropdown />
                </div>
              </form>
            </div>
            {/* <!-- Sidebar End --> */}

            {/* <!-- Content Start --> */}
            <div className="xl:max-w-[870px] w-full">
              <div className="rounded-lg bg-white shadow-1 pl-3 pr-2.5 py-2.5 mb-6">
                <div className="flex items-center justify-between">
                  {/* <!-- top bar left --> */}
                  <div className="flex flex-wrap items-center gap-4">
                    <CustomSelect 
                      options={sortOptions} 
                      onChange={handleSortChange}
                    />

                    <p>
                      Gösterilen <span className="text-dark">{transformedProducts.length}</span>{" "}
                      / <span className="text-dark">{totalProducts}</span> Ürün
                      {totalPages > 1 && (
                        <span className="text-gray-500 ml-2">
                          (Sayfa {currentPage}/{totalPages})
                        </span>
                      )}
                    </p>
                  </div>

                  {/* <!-- top bar right --> */}
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setProductStyle("grid")}
                      aria-label="grid görünümü butonu"
                      className={`${
                        productStyle === "grid"
                          ? "bg-blue border-blue text-white"
                          : "text-dark bg-gray-1 border-gray-3"
                      } flex items-center justify-center w-10.5 h-9 rounded-[5px] border ease-out duration-200 hover:bg-blue hover:border-blue hover:text-white`}
                    >
                      {/* Grid SVG */}
                      <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path fillRule="evenodd" clipRule="evenodd" d="M4.836 1.3125C4.16215 1.31248 3.60022 1.31246 3.15414 1.37244C2.6833 1.43574 2.2582 1.57499 1.91659 1.91659C1.57499 2.2582 1.43574 2.6833 1.37244 3.15414C1.31246 3.60022 1.31248 4.16213 1.3125 4.83598V4.914C1.31248 5.58785 1.31246 6.14978 1.37244 6.59586C1.43574 7.06671 1.57499 7.49181 1.91659 7.83341C2.2582 8.17501 2.6833 8.31427 3.15414 8.37757C3.60022 8.43754 4.16213 8.43752 4.83598 8.4375H4.914C5.58785 8.43752 6.14978 8.43754 6.59586 8.37757C7.06671 8.31427 7.49181 8.17501 7.83341 7.83341C8.17501 7.49181 8.31427 7.06671 8.37757 6.59586C8.43754 6.14978 8.43752 5.58787 8.4375 4.91402V4.83601C8.43752 4.16216 8.43754 3.60022 8.37757 3.15414C8.31427 2.6833 8.17501 2.2582 7.83341 1.91659C7.49181 1.57499 7.06671 1.43574 6.59586 1.37244C6.14978 1.31246 5.58787 1.31248 4.91402 1.3125H4.836ZM2.71209 2.71209C2.80983 2.61435 2.95795 2.53394 3.30405 2.4874C3.66632 2.4387 4.15199 2.4375 4.875 2.4375C5.59801 2.4375 6.08368 2.4387 6.44596 2.4874C6.79205 2.53394 6.94018 2.61435 7.03791 2.71209C7.13565 2.80983 7.21607 2.95795 7.2626 3.30405C7.31131 3.66632 7.3125 4.15199 7.3125 4.875C7.3125 5.59801 7.31131 6.08368 7.2626 6.44596C7.21607 6.79205 7.13565 6.94018 7.03791 7.03791C6.94018 7.13565 6.79205 7.21607 6.44596 7.2626C6.08368 7.31131 5.59801 7.3125 4.875 7.3125C4.15199 7.3125 3.66632 7.31131 3.30405 7.2626C2.95795 7.21607 2.80983 7.13565 2.71209 7.03791C2.61435 6.94018 2.53394 6.79205 2.4874 6.44596C2.4387 6.08368 2.4375 5.59801 2.4375 4.875C2.4375 4.15199 2.4387 3.66632 2.4874 3.30405C2.53394 2.95795 2.61435 2.80983 2.71209 2.71209Z" fill=""/>
                      </svg>
                    </button>

                    <button
                      onClick={() => setProductStyle("list")}
                      aria-label="liste görünümü butonu"
                      className={`${
                        productStyle === "list"
                          ? "bg-blue border-blue text-white"
                          : "text-dark bg-gray-1 border-gray-3"
                      } flex items-center justify-center w-10.5 h-9 rounded-[5px] border ease-out duration-200 hover:bg-blue hover:border-blue hover:text-white`}
                    >
                      {/* List SVG */}
                      <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path fillRule="evenodd" clipRule="evenodd" d="M4.4234 0.899903C3.74955 0.899882 3.18763 0.899864 2.74155 0.959838C2.2707 1.02314 1.8456 1.16239 1.504 1.504C1.16239 1.8456 1.02314 2.2707 0.959838 2.74155C0.899864 3.18763 0.899882 3.74953 0.899903 4.42338V4.5014C0.899882 5.17525 0.899864 5.73718 0.959838 6.18326C1.02314 6.65411 1.16239 7.07921 1.504 7.42081C1.8456 7.76241 2.2707 7.90167 2.74155 7.96497C3.18763 8.02495 3.74953 8.02493 4.42339 8.02491H4.5014C5.17525 8.02493 14.7372 8.02495 15.1833 7.96497C15.6541 7.90167 16.0792 7.76241 16.4208 7.42081C16.7624 7.07921 16.9017 6.65411 16.965 6.18326C17.0249 5.73718 17.0249 5.17527 17.0249 4.50142V4.42341C17.0249 3.74956 17.0249 3.18763 16.965 2.74155C16.9017 2.2707 16.7624 1.8456 16.4208 1.504C16.0792 1.16239 15.6541 1.02314 15.1833 0.959838C14.7372 0.899864 5.17528 0.899882 4.50142 0.899903H4.4234ZM2.29949 2.29949C2.39723 2.20175 2.54535 2.12134 2.89145 2.07481C3.25373 2.0261 3.7394 2.0249 4.4624 2.0249C5.18541 2.0249 14.6711 2.0261 15.0334 2.07481C15.3795 2.12134 15.5276 2.20175 15.6253 2.29949C15.7231 2.39723 15.8035 2.54535 15.85 2.89145C15.8987 3.25373 15.8999 3.7394 15.8999 4.4624C15.8999 5.18541 15.8987 5.67108 15.85 6.03336C15.8035 6.37946 15.7231 6.52758 15.6253 6.62532C15.5276 6.72305 15.3795 6.80347 15.0334 6.85C14.6711 6.89871 5.18541 6.8999 4.4624 6.8999C3.7394 6.8999 3.25373 6.89871 2.89145 6.85C2.54535 6.80347 2.39723 6.72305 2.29949 6.62532C2.20175 6.52758 2.12134 6.37946 2.07481 6.03336C2.0261 5.67108 2.0249 5.18541 2.0249 4.4624C2.0249 3.7394 2.0261 3.25373 2.07481 2.89145C2.12134 2.54535 2.20175 2.39723 2.29949 2.29949Z" fill=""/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* <!-- Products Grid/List Content Start --> */}
              {transformedProducts.length > 0 ? (
              <div
                className={`${
                  productStyle === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-7.5 gap-y-9"
                    : "flex flex-col gap-7.5"
                }`}
              >
                  {transformedProducts.map((item, key) =>
                  productStyle === "grid" ? (
                    <SingleGridItem item={item} key={key} />
                  ) : (
                    <SingleListItem item={item} key={key} />
                  )
                )}
              </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-gray-500 text-lg">Henüz ürün bulunamadı.</p>
                  <button 
                    onClick={() => fetchProducts()}
                    className="mt-4 px-6 py-3 bg-blue text-white rounded-lg hover:bg-blue-dark transition-colors"
                  >
                    Ürünleri Yenile
                  </button>
                </div>
              )}
              {/* <!-- Products Content End --> */}

              {/* <!-- Products Pagination Start --> */}
              {transformedProducts.length > 0 && totalPages > 1 && (
              <div className="flex justify-center mt-15">
                <div className="bg-white shadow-1 rounded-md p-2">
                  <ul className="flex items-center">
                    <li>
                      <button
                          onClick={() => updateFilters({ page: currentPage - 1 })}
                          disabled={currentPage === 1}
                          aria-label="önceki sayfa butonu"
                          className="flex items-center justify-center w-8 h-9 ease-out duration-200 rounded-[3px] disabled:text-gray-4 hover:bg-blue hover:text-white disabled:hover:bg-transparent disabled:hover:text-gray-4"
                        >
                          <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M12.1782 16.1156C12.0095 16.1156 11.8407 16.0594 11.7282 15.9187L5.37197 9.45C5.11885 9.19687 5.11885 8.80312 5.37197 8.55L11.7282 2.08125C11.9813 1.82812 12.3751 1.82812 12.6282 2.08125C12.8813 2.33437 12.8813 2.72812 12.6282 2.98125L6.72197 9L12.6563 15.0187C12.9095 15.2719 12.9095 15.6656 12.6563 15.9187C12.4876 16.0312 12.347 16.1156 12.1782 16.1156Z" fill=""/>
                        </svg>
                      </button>
                    </li>

                    <li>
                        <span className="flex py-1.5 px-3.5 duration-200 rounded-[3px] bg-blue text-white">
                          {currentPage}
                        </span>
                    </li>

                    <li>
                      <button
                          onClick={() => updateFilters({ page: currentPage + 1 })}
                          disabled={currentPage === totalPages}
                          aria-label="sonraki sayfa butonu"
                          className="flex items-center justify-center w-8 h-9 ease-out duration-200 rounded-[3px] hover:text-white hover:bg-blue disabled:text-gray-4 disabled:hover:bg-transparent disabled:hover:text-gray-4"
                        >
                          <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M5.82197 16.1156C5.65322 16.1156 5.5126 16.0594 5.37197 15.9469C5.11885 15.6937 5.11885 15.3 5.37197 15.0469L11.2782 9L5.37197 2.98125C5.11885 2.72812 5.11885 2.33437 5.37197 2.08125C5.6251 1.82812 6.01885 1.82812 6.27197 2.08125L12.6282 8.55C12.8813 8.80312 12.8813 9.19687 12.6282 9.45L6.27197 15.9187C6.15947 16.0312 5.99072 16.1156 5.82197 16.1156Z" fill=""/>
                        </svg>
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
              )}
              {/* <!-- Products Pagination End --> */}
            </div>
            {/* <!-- Content End --> */}
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopWithSidebar;
