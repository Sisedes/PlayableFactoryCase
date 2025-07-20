"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { useAuth } from "@/store/authStore";
import { getFavoriteProducts, removeFromFavorites, FavoriteProduct } from "@/services/favoriteService";
import { getImageUrl } from "@/utils/apiUtils";
import Image from "next/image";
import Link from "next/link";
import { cartService } from "@/services/cartService";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import StarRating from "../Common/StarRating";
import toast from "react-hot-toast";

export const Wishlist = () => {
  const { accessToken, isAuthenticated } = useAuth();
  const [favoriteProducts, setFavoriteProducts] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      loadFavoriteProducts();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, accessToken]);

  const loadFavoriteProducts = async () => {
    if (!accessToken) return;

    setLoading(true);
    setError(null);
    try {
      const response = await getFavoriteProducts(accessToken);
      if (response.success) {
        setFavoriteProducts(response.data || []);
      } else {
        setError(response.message || 'Favori ürünler yüklenemedi');
      }
    } catch (err) {
      console.error('Favori ürünler yüklenirken hata:', err);
      setError('Favori ürünler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromFavorites = async (productId: string) => {
    if (!accessToken || !confirm('Bu ürünü favorilerden çıkarmak istediğinizden emin misiniz?')) return;

    try {
      const response = await removeFromFavorites(productId, accessToken);
      if (response.success) {
        setFavoriteProducts(prev => prev.filter(product => product._id !== productId));
        window.dispatchEvent(new Event('favoriteUpdated'));
        toast.success('Ürün favorilerden çıkarıldı');
      } else {
        toast.error(response.message || 'Ürün favorilerden çıkarılamadı');
      }
    } catch (error) {
      console.error('Favorilerden çıkarma hatası:', error);
      toast.error('Ürün favorilerden çıkarılırken hata oluştu');
    }
  };

  const handleAddToCart = async (product: FavoriteProduct) => {
    if (product.stock === 0 || product.stock === undefined || product.stock === null) {
      toast.error("Bu ürün stokta bulunmamaktadır!");
      return;
    }
    
    try {
      await cartService.addToCart({
        productId: product._id,
        quantity: 1,
        variantId: undefined
      });
      
      toast.success("Ürün sepete eklendi!");
    } catch (error: any) {
      console.error("Sepete ekleme hatası:", error);
      if (error.message && error.message.includes('Yetersiz stok')) {
        toast.error('Stok yetersiz! Bu üründen daha fazla sipariş veremezsiniz.');
      } else {
        toast.error("Ürün sepete eklenirken bir hata oluştu!");
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  if (!isAuthenticated) {
    return (
      <>
        <Breadcrumb title="Favoriler" pages={[{ name: "Favoriler" }]} />
        <section className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Favorilerinizi Görüntülemek İçin Giriş Yapın</h2>
                <p className="text-gray-600 mb-8">Favori ürünlerinizi görmek ve yönetmek için hesabınıza giriş yapmanız gerekiyor.</p>
                <Link 
                  href="/signin" 
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Giriş Yap
                </Link>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Breadcrumb title="Favoriler" pages={[{ name: "Favoriler" }]} />
        <section className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Favori ürünleriniz yükleniyor...</p>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Breadcrumb title="Favoriler" pages={[{ name: "Favoriler" }]} />
        <section className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Hata Oluştu</h2>
                <p className="text-red-600 mb-6">{error}</p>
                <button 
                  onClick={loadFavoriteProducts}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Tekrar Dene
                </button>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <div className="sr-only">
        <h1>Favori Ürünlerim - Beğendiğiniz Ürünler</h1>
        <p>Favori ürünlerinizi görüntüleyin, sepete ekleyin ve yönetin.</p>
      </div>

      <Breadcrumb title="Favoriler" pages={[{ name: "Favoriler" }]} />
      
      <section className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Favori Ürünleriniz</h1>
              <p className="text-gray-600 mt-1">
                {favoriteProducts.length} ürün favorilerinizde
              </p>
            </div>
            {favoriteProducts.length > 0 && (
              <Link
                href="/shop-with-sidebar"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Daha Fazla Ürün Keşfet
              </Link>
            )}
          </div>

          {favoriteProducts.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="hidden lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-4 px-6">
                          <p className="text-sm font-semibold text-gray-900">Ürün</p>
                        </th>
                        <th className="text-center py-4 px-6">
                          <p className="text-sm font-semibold text-gray-900">Fiyat</p>
                        </th>
                        <th className="text-center py-4 px-6">
                          <p className="text-sm font-semibold text-gray-900">Stok Durumu</p>
                        </th>
                        <th className="text-center py-4 px-6">
                          <p className="text-sm font-semibold text-gray-900">İşlem</p>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {favoriteProducts.map((product) => (
                        <WishlistTableRow 
                          key={product._id} 
                          product={product} 
                          onRemove={handleRemoveFromFavorites}
                          onAddToCart={handleAddToCart}
                          formatPrice={formatPrice}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="lg:hidden">
                <div className="p-4 space-y-4">
                  {favoriteProducts.map((product) => (
                    <WishlistMobileCard 
                      key={product._id} 
                      product={product} 
                      onRemove={handleRemoveFromFavorites}
                      onAddToCart={handleAddToCart}
                      formatPrice={formatPrice}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Henüz Favori Ürününüz Yok</h2>
                <p className="text-gray-600 mb-8">Beğendiğiniz ürünleri favorilere ekleyerek daha sonra kolayca erişebilirsiniz.</p>
                <Link 
                  href="/shop-with-sidebar" 
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Ürünleri Keşfet
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

const WishlistTableRow = ({ 
  product, 
  onRemove, 
  onAddToCart, 
  formatPrice 
}: { 
  product: FavoriteProduct; 
  onRemove: (productId: string) => void; 
  onAddToCart: (product: FavoriteProduct) => void; 
  formatPrice: (price: number) => string;
}) => {
  const [addingToCart, setAddingToCart] = useState(false);
  const [removing, setRemoving] = useState(false);

  const discountPercentage = product.salePrice && product.price 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const handleAddToCartOnly = async () => {
    if (product.stock > 0) {
      setAddingToCart(true);
      try {
        await onAddToCart(product);
      } finally {
        setAddingToCart(false);
      }
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await onRemove(product._id);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="py-6 px-6">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            <Image 
              src={getImageUrl(product.images?.[0]?.url || "")} 
              alt={product.name} 
              fill
              className="object-contain p-2"
              sizes="64px"
              loading="lazy"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate hover:text-blue-600 transition-colors">
              <Link href={`/product/${product._id}`}>{product.name}</Link>
            </h3>
            <div className="flex items-center gap-2 mb-1">
              <StarRating 
                rating={product.averageRating || 0} 
                reviewCount={product.reviewCount || 0}
                size="sm"
              />
            </div>
            <p className="text-sm text-gray-600 truncate">{product.category?.name}</p>
            
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              <span>{product.viewCount || 0} görüntüleme</span>
            </div>
          </div>
        </div>
      </td>

      <td className="py-6 px-6 text-center">
        <div className="flex flex-col">
          <p className="text-lg font-semibold text-gray-900">
            {formatPrice(product.salePrice && product.salePrice > 0 ? product.salePrice : product.price)}
          </p>
          {product.salePrice && product.salePrice > 0 && product.price > product.salePrice && (
            <p className="text-sm text-gray-500 line-through">
              {formatPrice(product.price)}
            </p>
          )}
          {discountPercentage > 0 && (
            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full mt-1">
              %{discountPercentage} İndirim
            </span>
          )}
        </div>
      </td>

      <td className="py-6 px-6 text-center">
        <div className="flex items-center justify-center gap-2">
          {product.stock > 0 ? (
            <>
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-green-600 font-medium">
                {product.stock <= 5 ? `Son ${product.stock} adet` : `Stokta (${product.stock} adet)`}
              </span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-sm text-red-600 font-medium">Stokta Yok</span>
            </>
          )}
        </div>
      </td>

      <td className="py-6 px-6 text-center">
        <div className="flex flex-col gap-2">
          <button
            onClick={handleAddToCartOnly}
            disabled={product.stock === 0 || addingToCart}
            className={`inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors text-sm ${
              product.stock > 0 
                ? 'bg-blue text-white hover:bg-blue disabled:opacity-50' 
                : 'bg-gray text-gray cursor-not-allowed'
            }`}
          >
            {addingToCart ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Ekleniyor...
              </>
            ) : (
              <>
                {product.stock > 0 ? 'Sepete Ekle' : 'Stokta Yok'}
              </>
            )}
          </button>
          <button
            onClick={handleRemove}
            disabled={removing}
            className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors bg-white text-red-600 border border-red-600 hover:bg-red-600 hover:text-white text-sm disabled:opacity-50"
          >
            {removing ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Kaldırılıyor...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Favorilerden Kaldır
              </>
            )}
          </button>
        </div>
      </td>
    </tr>
  );
};

const WishlistMobileCard = ({ 
  product, 
  onRemove, 
  onAddToCart, 
  formatPrice 
}: { 
  product: FavoriteProduct; 
  onRemove: (productId: string) => void; 
  onAddToCart: (product: FavoriteProduct) => void; 
  formatPrice: (price: number) => string;
}) => {
  const [addingToCart, setAddingToCart] = useState(false);
  const [removing, setRemoving] = useState(false);

  const discountPercentage = product.salePrice && product.price 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const handleAddToCartOnly = async () => {
    if (product.stock > 0) {
      setAddingToCart(true);
      try {
        await onAddToCart(product);
      } finally {
        setAddingToCart(false);
      }
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await onRemove(product._id);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
            <Image 
              src={getImageUrl(product.images?.[0]?.url || "")} 
              alt={product.name} 
              fill
              className="object-contain p-2"
              sizes="80px"
              loading="lazy"
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
            <Link href={`/product/${product._id}`} className="hover:text-blue-600 transition-colors">
              {product.name}
            </Link>
          </h3>
          
          <div className="flex items-center gap-2 mb-2">
            <StarRating 
              rating={product.averageRating || 0} 
              reviewCount={product.reviewCount || 0}
              size="sm"
            />
          </div>
          
          <p className="text-sm text-gray-600 mb-2">{product.category?.name}</p>
          
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            <span>{product.viewCount || 0} görüntüleme</span>
          </div>

          <div className="mb-3">
            <p className="text-lg font-semibold text-gray-900">
              {formatPrice(product.salePrice && product.salePrice > 0 ? product.salePrice : product.price)}
            </p>
            {product.salePrice && product.salePrice > 0 && product.price > product.salePrice && (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-500 line-through">
                  {formatPrice(product.price)}
                </p>
                {discountPercentage > 0 && (
                  <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                    %{discountPercentage} İndirim
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-4">
            {product.stock > 0 ? (
              <>
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-green-600 font-medium">
                  {product.stock <= 5 ? `Son ${product.stock} adet` : `Stokta (${product.stock} adet)`}
                </span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-sm text-red-600 font-medium">Stokta Yok</span>
              </>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleAddToCartOnly}
              disabled={product.stock === 0 || addingToCart}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2 ${
                product.stock > 0 
                  ? 'bg-blue text-white hover:bg-blue disabled:opacity-50' 
                  : 'bg-gray text-gray cursor-not-allowed'
              }`}
            >
              {addingToCart ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Ekleniyor...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  {product.stock > 0 ? 'Sepete Ekle' : 'Stokta Yok'}
                </>
              )}
            </button>
            <button
              onClick={handleRemove}
              disabled={removing}
              className="w-full py-2 px-4 rounded-lg font-medium transition-colors bg-white text-red-600 border border-red-600 hover:bg-red-600 hover:text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {removing ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Kaldırılıyor...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Favorilerden Kaldır
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
