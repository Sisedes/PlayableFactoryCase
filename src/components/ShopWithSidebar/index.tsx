"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Breadcrumb from "../Common/Breadcrumb";
import CustomSelect from "./CustomSelect";
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
    viewCount: apiProduct.viewCount,
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
    salePrice: apiProduct.salePrice && apiProduct.salePrice > 0 ? apiProduct.salePrice : undefined,
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
    viewCount: apiProduct.viewCount || 0,
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
  const [searchTerm, setSearchTerm] = useState("");
  const searchParams = useSearchParams();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 100000 });
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("createdAt-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; 

  const [shouldUpdateUrl, setShouldUpdateUrl] = useState(false);
  const [urlUpdateData, setUrlUpdateData] = useState<{ categories: string[]; search?: string } | null>(null);

  // Zustand store'dan veri ve fonksiyonları al
  const { 
    products, 
    categories,
    productsLoading, 
    categoriesLoading,
    error, 
    totalProducts,
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
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    
    if (search) {
      setSearchTerm(search);
      updateFilters({ search: search, page: 1 });
    } else {
      setSearchTerm("");
      fetchProducts();
    }
    
    if (category) {
      setSelectedCategories([category]);
    } else {
      setSelectedCategories([]);
    }
    
    fetchCategories();
  }, [searchParams, fetchProducts, fetchCategories, updateFilters]);

  useEffect(() => {
    if (products && products.length > 0) {
      const transformed = products.map(transformApiProductToComponent);
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

  useEffect(() => {
    if (shouldUpdateUrl && urlUpdateData && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      
      if (urlUpdateData.categories.length === 0) {
        url.searchParams.delete('category');
      } else {
        url.searchParams.set('category', urlUpdateData.categories[0]);
      }
      
      if (urlUpdateData.search) {
        url.searchParams.set('search', urlUpdateData.search);
      } else {
        url.searchParams.delete('search');
      }
      
      window.history.pushState({}, '', url.toString());
      
      setShouldUpdateUrl(false);
      setUrlUpdateData(null);
    }
  }, [shouldUpdateUrl, urlUpdateData]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...transformedProducts];

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => 
        selectedCategories.includes(product.category?.name || '')
      );
    }

    filtered = filtered.filter(product => {
      const price = product.salePrice > 0 ? product.salePrice : product.price;
      return price >= priceRange.min && price <= priceRange.max;
    });

    if (ratingFilter > 0) {
      filtered = filtered.filter(product => 
        product.averageRating >= ratingFilter
      );
    }

    filtered.sort((a, b) => {
      const [sortField, sortOrder] = sortBy.split('-');
      const isDesc = sortOrder === 'desc';

      switch (sortField) {
        case 'price':
          const priceA = a.salePrice > 0 ? a.salePrice : a.price;
          const priceB = b.salePrice > 0 ? b.salePrice : b.price;
          return isDesc ? priceB - priceA : priceA - priceB;
        
        case 'rating':
          return isDesc ? b.averageRating - a.averageRating : a.averageRating - b.averageRating;
        
        case 'createdAt':
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return isDesc ? dateB - dateA : dateA - dateB;
        
        case 'popular':
          return isDesc ? (b.reviewCount || 0) - (a.reviewCount || 0) : (a.reviewCount || 0) - (b.reviewCount || 0);
        
        default:
          return 0;
      }
    });

    return filtered;
  }, [transformedProducts, selectedCategories, priceRange, ratingFilter, sortBy]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedProducts, currentPage]);

  const totalFilteredPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);

  const sortOptions = [
    { label: "En Yeni Ürünler", value: "createdAt-desc" },
    { label: "En Çok Satan", value: "popular-desc" },
    { label: "Fiyat (Düşük-Yüksek)", value: "price-asc" },
    { label: "Fiyat (Yüksek-Düşük)", value: "price-desc" },
    { label: "Puan (Yüksek-Düşük)", value: "rating-desc" },
    { label: "Puan (Düşük-Yüksek)", value: "rating-asc" },
  ];

  const categoryOptions = categories.map(category => ({
    name: category.name,
    products: transformedProducts.filter(p => p.category?.name === category.name).length,
    isRefined: selectedCategories.includes(category.name),
  }));

  const ratingOptions = [
    { label: "Tüm Puanlar", value: 0 },
    { label: "4+ Yıldız", value: 4 },
    { label: "3+ Yıldız", value: 3 },
    { label: "2+ Yıldız", value: 2 },
    { label: "1+ Yıldız", value: 1 },
  ];

  const priceRanges = [
    { label: "Tüm Fiyatlar", min: 0, max: 100000 },
    { label: "0₺ - 100₺", min: 0, max: 100 },
    { label: "100₺ - 500₺", min: 100, max: 500 },
    { label: "500₺ - 1000₺", min: 500, max: 1000 },
    { label: "1000₺ - 5000₺", min: 1000, max: 5000 },
    { label: "5000₺ - 10000₺", min: 5000, max: 10000 },
    { label: "10000₺ - 50000₺", min: 10000, max: 50000 },
    { label: "50000₺+", min: 50000, max: 100000 },
  ];

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1); 
  };

  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategories(prev => {
      const newCategories = prev.includes(categoryName) 
        ? prev.filter(cat => cat !== categoryName)
        : [...prev, categoryName];
      
      setUrlUpdateData({ categories: newCategories });
      setShouldUpdateUrl(true);
      
      return newCategories;
    });
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (range: { min: number; max: number }) => {
    setPriceRange(range);
    setCurrentPage(1);
  };

  const handleRatingChange = (rating: number) => {
    setRatingFilter(rating);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setPriceRange({ min: 0, max: 100000 });
    setRatingFilter(0);
    setCurrentPage(1);
    setUrlUpdateData({ categories: [] });
    setShouldUpdateUrl(true);
  };

  if (productsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Ürünler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-lg font-semibold">Hata: {error}</p>
          </div>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => fetchProducts()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Tekrar Dene
            </button>
            <button 
              onClick={clearError}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
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
        title={
          searchTerm 
            ? `"${searchTerm}" için arama sonuçları` 
            : selectedCategories.length > 0 
              ? `${selectedCategories[0]} Kategorisi` 
              : "Ürün Mağazası"
        }
        pages={[
          { name: "Ürünler", href: "/products" },
          ...(searchTerm ? [{ name: `"${searchTerm}" araması`, href: `/shop-with-sidebar?search=${encodeURIComponent(searchTerm)}` }] : []),
          ...(selectedCategories.length > 0 && !searchTerm ? [{ name: selectedCategories[0], href: `/shop-with-sidebar?category=${encodeURIComponent(selectedCategories[0])}` }] : [])
        ]}
      />
      
      <section className="overflow-hidden relative pb-12 lg:pb-20 pt-8 lg:pt-16 xl:pt-20 bg-gray-50">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-0">
          <div className="flex gap-6 lg:gap-8">
            {/* <!-- Sidebar Start --> */}
            <div
              className={`sidebar-content fixed xl:z-1 z-9999 left-0 top-0 xl:translate-x-0 xl:static max-w-[310px] xl:max-w-[280px] w-full ease-out duration-200 ${
                productSidebar
                  ? "translate-x-0 bg-white p-6 h-screen overflow-y-auto shadow-xl"
                  : "-translate-x-full"
              }`}
            >
              <button
                onClick={() => setProductSidebar(!productSidebar)}
                aria-label="ürün sidebar toggle butonu"
                className={`xl:hidden absolute -right-12 flex items-center justify-center w-10 h-10 rounded-lg bg-white shadow-lg border border-gray-200 ${
                  stickyMenu
                    ? "lg:top-20 sm:top-16 top-16"
                    : "lg:top-24 sm:top-20 top-20"
                }`}
              >
                <svg
                  className="fill-current text-gray-600"
                  width="20"
                  height="20"
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
                  {/* <!-- Filtreler Başlığı --> */}
                  <div className="bg-white rounded-xl shadow-lg py-5 px-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold text-gray-900 text-lg">Filtreler</h2>
                      <button 
                        type="button"
                        onClick={clearAllFilters}
                        className="text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium"
                      >
                        Tümünü Temizle
                      </button>
                    </div>
                  </div>

                  {/* <!-- Kategori Filtresi --> */}
                  <div className="bg-white rounded-xl shadow-lg py-5 px-6 border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Kategoriler</h3>
                    
                    {/* Seçili Kategoriler */}
                    {selectedCategories.length > 0 && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800 font-medium mb-2">Seçili Kategoriler:</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedCategories.map((categoryName, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full border border-blue-200"
                            >
                              {categoryName}
                              <button
                                onClick={() => handleCategoryChange(categoryName)}
                                className="ml-2 text-blue-500 hover:text-blue-700 font-bold"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      {categoryOptions.map((category, index) => (
                        <label key={index} className="flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category.name)}
                            onChange={() => handleCategoryChange(category.name)}
                            className="mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                            {category.name} 
                            <span className="text-gray-500 ml-1">({category.products})</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* <!-- Fiyat Aralığı Filtresi --> */}
                  <div className="bg-white rounded-xl shadow-lg py-5 px-6 border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Fiyat Aralığı</h3>
                    <div className="space-y-3">
                      {priceRanges.map((range, index) => (
                        <label key={index} className="flex items-center cursor-pointer group">
                          <input
                            type="radio"
                            name="priceRange"
                            checked={priceRange.min === range.min && priceRange.max === range.max}
                            onChange={() => handlePriceRangeChange(range)}
                            className="mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{range.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* <!-- Puan Filtresi --> */}
                  <div className="bg-white rounded-xl shadow-lg py-5 px-6 border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Puan</h3>
                    <div className="space-y-3">
                      {ratingOptions.map((option, index) => (
                        <label key={index} className="flex items-center cursor-pointer group">
                          <input
                            type="radio"
                            name="rating"
                            checked={ratingFilter === option.value}
                            onChange={() => handleRatingChange(option.value)}
                            className="mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </form>
            </div>
            {/* <!-- Sidebar End --> */}

            {/* <!-- Content Start --> */}
            <div className="xl:max-w-[870px] w-full">
              {/* <!-- Arama Sonuçları ve Kategori Başlığı --> */}
              {(searchTerm || selectedCategories.length > 0) && (
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {searchTerm 
                          ? `"${searchTerm}" için arama sonuçları`
                          : `${selectedCategories[0]} kategorisindeki ürünler`
                        }
                      </h2>
                      <p className="text-gray-600">
                        {filteredAndSortedProducts.length} ürün bulundu
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategories([]);
                        clearFilters();
                        setUrlUpdateData({ categories: [] });
                        setShouldUpdateUrl(true);
                      }}
                      className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
                    >
                      {searchTerm ? 'Aramayı Temizle' : 'Kategoriyi Temizle'}
                    </button>
                  </div>
                </div>
              )}

              {/* <!-- Üst Bar --> */}
              <div className="rounded-xl bg-white shadow-lg pl-4 pr-4 py-4 mb-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  {/* <!-- Sol Taraf --> */}
                  <div className="flex flex-wrap items-center gap-4">
                    <CustomSelect 
                      options={sortOptions} 
                      onChange={handleSortChange}
                      value={sortBy}
                    />

                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-gray-600">
                        Gösterilen <span className="text-gray-900 font-semibold">{paginatedProducts.length}</span>{" "}
                        / <span className="text-gray-900 font-semibold">{filteredAndSortedProducts.length}</span> Ürün
                        {totalFilteredPages > 1 && (
                          <span className="text-gray-500 ml-2">
                            (Sayfa {currentPage}/{totalFilteredPages})
                          </span>
                        )}
                      </p>
                      
                      {/* Seçili Kategoriler */}
                      {selectedCategories.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Kategoriler:</span>
                          <div className="flex flex-wrap gap-1">
                            {selectedCategories.map((categoryName, index) => (
                              <span 
                                key={index}
                                className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full border border-blue-200"
                              >
                                {categoryName}
                                <button
                                  onClick={() => handleCategoryChange(categoryName)}
                                  className="ml-1 text-blue-500 hover:text-blue-700 font-bold"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* <!-- Sağ Taraf - Görünüm Seçenekleri --> */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setProductStyle("grid")}
                      aria-label="ızgara görünümü butonu"
                      className={`${
                        productStyle === "grid"
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "text-gray-600 bg-white border-gray-300 hover:border-blue-500 hover:text-blue-600"
                      } flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-all duration-200 hover:shadow-md`}
                    >
                      {/* Grid SVG */}
                      <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M2 2h5v5H2V2zM11 2h5v5h-5V2zM2 11h5v5H2v-5zM11 11h5v5h-5v-5z" fill="currentColor"/>
                      </svg>
                    </button>

                    <button
                      onClick={() => setProductStyle("list")}
                      aria-label="liste görünümü butonu"
                      className={`${
                        productStyle === "list"
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "text-gray-600 bg-white border-gray-300 hover:border-blue-500 hover:text-blue-600"
                      } flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-all duration-200 hover:shadow-md`}
                    >
                      {/* List SVG */}
                      <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M2 2h14v2H2V2zM2 7h14v2H2V7zM2 12h14v2H2v-2zM2 17h14v2H2v-2z" fill="currentColor"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* <!-- Ürünler Grid/Liste İçeriği --> */}
              {paginatedProducts.length > 0 ? (
                <div
                  className={`${
                    productStyle === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                      : "flex flex-col gap-6"
                  }`}
                >
                  {paginatedProducts.map((item, key) =>
                    productStyle === "grid" ? (
                      <SingleGridItem item={item} key={key} />
                    ) : (
                      <SingleListItem item={item} key={key} />
                    )
                  )}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-xl shadow-lg border border-gray-100">
                  {searchTerm ? (
                    <>
                      <div className="text-gray-400 mb-6">
                        <svg className="w-20 h-20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="text-xl text-gray-500 mb-2">
                          "{searchTerm}" için ürün bulunamadı.
                        </p>
                        <p className="text-gray-400">
                          Farklı anahtar kelimeler deneyebilir veya kategorileri keşfedebilirsiniz.
                        </p>
                      </div>
                      <div className="flex gap-4 justify-center">
                        <button 
                          onClick={() => {
                            setSearchTerm("");
                            clearFilters();
                            setUrlUpdateData({ categories: [] });
                            setShouldUpdateUrl(true);
                          }}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Tüm Ürünleri Gör
                        </button>
                        <button 
                          onClick={() => fetchProducts()}
                          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                        >
                          Tekrar Dene
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-gray-400 mb-6">
                        <svg className="w-20 h-20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <p className="text-xl text-gray-500">Henüz ürün bulunamadı.</p>
                      </div>
                      <button 
                        onClick={() => fetchProducts()}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Ürünleri Yenile
                      </button>
                    </>
                  )}
                </div>
              )}
              {/* <!-- Ürünler İçeriği Sonu --> */}

              {/* <!-- Sayfalama --> */}
              {paginatedProducts.length > 0 && totalFilteredPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="bg-white shadow-lg rounded-xl p-3 border border-gray-100">
                    <ul className="flex items-center gap-2">
                      <li>
                        <button
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          aria-label="önceki sayfa butonu"
                          className="flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-blue-600 hover:text-white disabled:hover:bg-transparent"
                        >
                          <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M12.1782 16.1156C12.0095 16.1156 11.8407 16.0594 11.7282 15.9187L5.37197 9.45C5.11885 9.19687 5.11885 8.80312 5.37197 8.55L11.7282 2.08125C11.9813 1.82812 12.3751 1.82812 12.6282 2.08125C12.8813 2.33437 12.8813 2.72812 12.6282 2.98125L6.72197 9L12.6563 15.0187C12.9095 15.2719 12.9095 15.6656 12.6563 15.9187C12.4876 16.0312 12.347 16.1156 12.1782 16.1156Z" fill=""/>
                          </svg>
                        </button>
                      </li>

                      <li>
                        <span className="flex py-2 px-4 duration-200 rounded-lg bg-blue-600 text-white font-medium">
                          {currentPage} / {totalFilteredPages}
                        </span>
                      </li>

                      <li>
                        <button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalFilteredPages}
                          aria-label="sonraki sayfa butonu"
                          className="flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-blue-600 hover:text-white disabled:hover:bg-transparent"
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
              {/* <!-- Sayfalama Sonu --> */}
            </div>
            {/* <!-- Content End --> */}
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopWithSidebar;
