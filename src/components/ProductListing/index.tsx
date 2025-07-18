"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { useStore } from "@/store/useStore";
import { Product } from "@/types";
import { getImageUrl, sortProductImages } from "@/utils/apiUtils";
import Link from "next/link";
import Image from "next/image";
import { ProductFilters } from "@/services";
import StarRating from "../Common/StarRating";
import { useAuth } from "@/store/authStore";
import { addToFavorites, removeFromFavorites, checkFavoriteStatus } from "@/services/favoriteService";

interface ProductListingProps {
  categorySlug?: string;
}

const ProductListing: React.FC<ProductListingProps> = ({ categorySlug }) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("createdAt-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    category: "",
    search: "",
    minPrice: "",
    maxPrice: "",
    inStock: false,
  });

  // Zustand store'dan fonksiyonlar
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

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  useEffect(() => {
    const [sortField, sortOrder] = sortBy.split('-');
    const filterData: Partial<ProductFilters> = {
      sortBy: sortField,
      sortOrder: sortOrder as 'asc' | 'desc',
      page: currentPage,
    } as ProductFilters;

    if (categorySlug) {
      const category = categories.find(cat => cat.slug === categorySlug);
      if (category) {
        (filterData as any).category = category._id;
      }
    } else if (filters.category) {
      (filterData as any).category = filters.category;
    }

    // diğer filtreler
    if (filters.search) (filterData as any).search = filters.search;
    if (filters.minPrice) (filterData as any).minPrice = Number(filters.minPrice);
    if (filters.maxPrice) (filterData as any).maxPrice = Number(filters.maxPrice);
    if (filters.inStock) (filterData as any).inStock = filters.inStock;

    updateFilters(filterData);
  }, [filters, sortBy, currentPage, categorySlug, categories, updateFilters]);

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      category: "",
      search: "",
      minPrice: "",
      maxPrice: "",
      inStock: false,
    });
    setSortBy("createdAt-desc");
    setCurrentPage(1);
    clearFilters();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const sortOptions = [
    { label: "En Yeni Ürünler", value: "createdAt-desc" },
    { label: "En Eski Ürünler", value: "createdAt-asc" },
    { label: "Fiyat (Düşük-Yüksek)", value: "price-asc" },
    { label: "Fiyat (Yüksek-Düşük)", value: "price-desc" },
    { label: "İsim (A-Z)", value: "name-asc" },
    { label: "İsim (Z-A)", value: "name-desc" },
  ];

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
              className="px-4 py-2 bg-blue text-white rounded hover:bg-blue-600 transition-colors"
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
        title={categorySlug ? categories.find(cat => cat.slug === categorySlug)?.name || "Kategori" : "Tüm Ürünler"}
        pages={[
          { name: "Ürünler", href: "/products" },
          ...(categorySlug ? [
            { 
              name: categories.find(cat => cat.slug === categorySlug)?.name || "Kategori"
            }
          ] : [])
        ]}
      />
      
      <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28 bg-gray-50">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          {/* Filtreler ve Kontroller */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              {/* Sol Taraf - Filtreler */}
              <div className="flex flex-wrap gap-4 items-center">
                {/* Kategori Filtresi */}
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-transparent"
                >
                  <option value="">Tüm Kategoriler</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {/* Fiyat Filtreleri */}
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder="Min Fiyat"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-transparent"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max Fiyat"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-transparent"
                  />
                </div>

                {/* Stok Filtresi */}
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => handleFilterChange("inStock", e.target.checked)}
                    className="rounded border-gray-300 text-blue focus:ring-blue"
                  />
                  <span className="text-sm">Sadece Stokta Olanlar</span>
                </label>

                {/* Filtreleri Temizle */}
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Filtreleri Temizle
                </button>
              </div>

              {/* Sağ Taraf - Sıralama ve Görünüm */}
              <div className="flex gap-4 items-center">
                {/* Sıralama */}
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* Görünüm Seçenekleri */}
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${viewMode === "grid" ? "bg-blue text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${viewMode === "list" ? "bg-blue text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Ürün Sayısı */}
          <div className="mb-6">
            <p className="text-gray-600">
              {totalProducts} ürün bulundu
            </p>
          </div>

          {/* Ürün Listesi */}
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Ürün bulunamadı.</p>
            </div>
          ) : (
            <>
              {/* Izgara Görünümü */}
              {viewMode === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductGridCard key={product._id} product={product} />
                  ))}
                </div>
              )}

              {/* Liste Görünümü */}
              {viewMode === "list" && (
                <div className="space-y-4">
                  {products.map((product) => (
                    <ProductListCard key={product._id} product={product} />
                  ))}
                </div>
              )}

              {/* Sayfalama */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Önceki
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 border rounded-lg ${
                            currentPage === page
                              ? "bg-blue text-white border-blue"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Sonraki
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
};

const ProductGridCard: React.FC<{ product: Product }> = ({ product }) => {
  const { accessToken } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    if (accessToken && product._id) {
      checkFavoriteStatus(product._id, accessToken).then(response => {
        if (response.success) {
          setIsFavorite(response.data?.isFavorite || false);
        }
      });
    }
  }, [accessToken, product._id]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!accessToken) {
      alert('Favori eklemek için giriş yapmanız gerekiyor');
      return;
    }

    if (!product._id) return;

    setFavoriteLoading(true);
    try {
      let response;
      if (isFavorite) {
        response = await removeFromFavorites(product._id, accessToken);
      } else {
        response = await addToFavorites(product._id, accessToken);
      }

      if (response.success) {
        setIsFavorite(!isFavorite);
        window.dispatchEvent(new Event('favoriteUpdated'));
      } else {
        alert(response.message || 'İşlem başarısız');
      }
    } catch (error) {
      console.error('Favori işlemi hatası:', error);
      alert('İşlem sırasında hata oluştu');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const discountPercentage = product.salePrice && product.price 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  return (
    <Link href={`/product/${product._id}`} className="group">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
        {/* Ürün Görseli */}
        <div className="relative aspect-square overflow-hidden bg-gray-50 flex items-center justify-center">
          <Image
            src={getImageUrl(sortProductImages(product.images)[0]?.url || "")}
            alt={sortProductImages(product.images)[0]?.alt || product.name}
            fill
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%',
              objectFit: 'contain'
            }}
            onLoad={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.opacity = '1';
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/products/default.png';
            }}
          />
          {/* Loading placeholder */}
          <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue rounded-full animate-spin"></div>
          </div>
          
          {/* Favori Butonu */}
          <button
            onClick={handleToggleFavorite}
            disabled={favoriteLoading}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-all duration-200 ${
              isFavorite 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-white text-gray-600 hover:text-red-500 hover:bg-red-50'
            } ${favoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {favoriteLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : (
              <svg
                className="w-4 h-4"
                fill={isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            )}
          </button>
          
          {discountPercentage > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded z-10">
              %{discountPercentage} İndirim
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="text-white font-bold text-lg mb-1">Stokta Yok</div>
                <div className="text-white text-sm opacity-90">Bu ürün şu anda satışta değil</div>
              </div>
            </div>
          )}
        </div>

        {/* Ürün Bilgileri */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <StarRating 
              rating={product.averageRating || 0} 
              reviewCount={product.reviewCount || 0}
              size="sm"
            />
          </div>
          
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-blue transition-colors">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-bold text-blue">
              {formatPrice(product.salePrice || product.price)}
            </span>
            {product.salePrice && product.price > product.salePrice && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{product.category.name}</span>
            <span className={product.stock > 0 ? "text-green-600" : "text-red-600"}>
              {product.stock > 0 ? "Stokta" : "Stokta yok"}
            </span>
          </div>

          {/* Görüntüleme Sayısı */}
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            <span>{product.viewCount || 0} görüntüleme</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const ProductListCard: React.FC<{ product: Product }> = ({ product }) => {
  const { accessToken } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    if (accessToken && product._id) {
      checkFavoriteStatus(product._id, accessToken).then(response => {
        if (response.success) {
          setIsFavorite(response.data?.isFavorite || false);
        }
      });
    }
  }, [accessToken, product._id]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!accessToken) {
      alert('Favori eklemek için giriş yapmanız gerekiyor');
      return;
    }

    if (!product._id) return;

    setFavoriteLoading(true);
    try {
      let response;
      if (isFavorite) {
        response = await removeFromFavorites(product._id, accessToken);
      } else {
        response = await addToFavorites(product._id, accessToken);
      }

      if (response.success) {
        setIsFavorite(!isFavorite);
      } else {
        alert(response.message || 'İşlem başarısız');
      }
    } catch (error) {
      console.error('Favori işlemi hatası:', error);
      alert('İşlem sırasında hata oluştu');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const discountPercentage = product.salePrice && product.price 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  return (
    <Link href={`/product/${product._id}`} className="group">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
        <div className="flex">
          {/* Ürün Görseli */}
          <div className="relative w-32 h-32 flex-shrink-0 bg-gray-50 rounded-l-lg overflow-hidden flex items-center justify-center">
            <Image
              src={getImageUrl(sortProductImages(product.images)[0]?.url || "")}
              alt={sortProductImages(product.images)[0]?.alt || product.name}
              fill
              className="object-contain p-1"
              sizes="128px"
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100%',
                objectFit: 'contain'
              }}
            />
            
            {/* Favori Butonu */}
            <button
              onClick={handleToggleFavorite}
              disabled={favoriteLoading}
              className={`absolute top-1 right-1 w-6 h-6 rounded-full shadow-sm flex items-center justify-center transition-all duration-200 ${
                isFavorite 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-white text-gray-600 hover:text-red-500 hover:bg-red-50'
              } ${favoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {favoriteLoading ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
              ) : (
                <svg
                  className="w-3 h-3"
                  fill={isFavorite ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              )}
            </button>
            
            {discountPercentage > 0 && (
              <div className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded">
                %{discountPercentage}
              </div>
            )}
          </div>

          {/* Ürün Bilgileri */}
          <div className="flex-1 p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <StarRating 
                    rating={product.averageRating || 0} 
                    reviewCount={product.reviewCount || 0}
                    size="sm"
                  />
                </div>
                
                <h3 className="font-medium text-gray-900 mb-2 group-hover:text-blue transition-colors">
                  {product.name}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.shortDescription || product.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Kategori: {product.category.name}</span>
                  <span>SKU: {product.sku}</span>
                  <span className={product.stock > 0 ? "text-green-600 font-medium" : "text-red-600 font-bold"}>
                    {product.stock > 0 ? `Stokta ${product.stock} adet` : "⚠️ Stokta yok - Satışta değil"}
                  </span>
                  <span className="flex items-center gap-1 text-gray-500">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    {product.viewCount || 0} görüntüleme
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl font-bold text-blue">
                    {formatPrice(product.salePrice || product.price)}
                  </span>
                  {product.salePrice && product.price > product.salePrice && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductListing; 