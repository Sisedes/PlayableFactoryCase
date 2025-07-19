"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { useAuth } from "@/store/authStore";
import { getFavoriteProducts, removeFromFavorites, FavoriteProduct } from "@/services/favoriteService";
import { Product } from "@/types";
import { getImageUrl } from "@/utils/apiUtils";
import Image from "next/image";
import Link from "next/link";
import { cartService } from "@/services/cartService";
import { addItemToCart } from "@/redux/features/cart-slice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import StarRating from "../Common/StarRating";

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
        alert('Ürün favorilerden çıkarıldı');
      } else {
        alert(response.message || 'Ürün favorilerden çıkarılamadı');
      }
    } catch (error) {
      console.error('Favorilerden çıkarma hatası:', error);
      alert('Ürün favorilerden çıkarılırken hata oluştu');
    }
  };

  const handleAddToCart = async (product: FavoriteProduct) => {
    try {
      await cartService.addToCart({
        productId: product._id,
        quantity: 1,
        variantId: undefined
      });
      
      alert("Ürün sepete eklendi!");
    } catch (error) {
      console.error("Sepete ekleme hatası:", error);
      alert("Ürün sepete eklenirken bir hata oluştu!");
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
        <Breadcrumb title={"Favoriler"} pages={[{ name: "Favoriler" }]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="mb-6">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Favorilerinizi Görüntülemek İçin Giriş Yapın</h2>
                <p className="text-gray-600 mb-6">Favori ürünlerinizi görmek ve yönetmek için hesabınıza giriş yapmanız gerekiyor.</p>
                <Link href="/signin" className="inline-flex items-center px-6 py-3 bg-blue text-white rounded-lg hover:bg-blue-dark transition-colors">
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
        <Breadcrumb title={"Favoriler"} pages={[{ name: "Favoriler" }]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue mx-auto mb-4"></div>
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
        <Breadcrumb title={"Favoriler"} pages={[{ name: "Favoriler" }]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button 
                onClick={loadFavoriteProducts}
                className="px-4 py-2 bg-blue text-white rounded hover:bg-blue-dark transition-colors"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title={"Favoriler"} pages={[{ name: "Favoriler" }]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-wrap items-center justify-between gap-5 mb-7.5">
            <h2 className="font-medium text-dark text-2xl">Favori Ürünleriniz</h2>
            <div className="text-sm text-gray-600">
              {favoriteProducts.length} ürün
            </div>
          </div>

          {favoriteProducts.length > 0 ? (
            <div className="bg-white rounded-[10px] shadow-1">
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    {/* Table header */}
                    <thead>
                      <tr className="border-b border-gray-3">
                        <th className="text-center py-5.5 px-6">
                          <p className="text-dark font-medium">Ürün</p>
                        </th>
                        <th className="text-center py-5.5 px-6">
                          <p className="text-dark font-medium">Fiyat</p>
                        </th>
                        <th className="text-center py-5.5 px-6">
                          <p className="text-dark font-medium">Stok Durumu</p>
                        </th>
                        <th className="text-center py-5.5 px-6">
                          <p className="text-dark font-medium">İşlem</p>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
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

              {/* Mobile Card View */}
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
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="mb-6">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Henüz Favori Ürününüz Yok</h2>
                <p className="text-gray-600 mb-6">Beğendiğiniz ürünleri favorilere ekleyerek daha sonra kolayca erişebilirsiniz.</p>
                <Link href="/products" className="inline-flex items-center px-6 py-3 bg-blue text-white rounded-lg hover:bg-blue-dark transition-colors">
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
  const discountPercentage = product.salePrice && product.price 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const handleAddToCartOnly = async () => {
    if (product.stock > 0) {
      await onAddToCart(product);
    }
  };

  return (
    <tr className="border-b border-gray-3 hover:bg-gray-50 transition-colors">
      <td className="py-5 px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center rounded-[5px] bg-gray-2 w-16 h-16 overflow-hidden flex-shrink-0">
            <Image 
              src={getImageUrl(product.images?.[0]?.url || "")} 
              alt={product.name} 
              width={64} 
              height={64}
              className="object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-dark ease-out duration-200 hover:text-blue mb-1 truncate">
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
      </td>

      <td className="py-5 px-6">
        <div className="flex flex-col">
          <p className="text-dark font-medium">
            {formatPrice(product.salePrice || product.price)}
          </p>
          {product.salePrice && product.price > product.salePrice && (
            <p className="text-sm text-gray-500 line-through">
              {formatPrice(product.price)}
            </p>
          )}
          {discountPercentage > 0 && (
            <span className="text-xs text-red-500 font-medium">
              %{discountPercentage} İndirim
            </span>
          )}
        </div>
      </td>

      <td className="py-5 px-6">
        <div className="flex items-center gap-1.5">
          {product.stock > 0 ? (
            <>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.6667 5L7.5 14.1667L3.33333 10"
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-green-600 text-sm">
                {product.stock <= 5 ? `Son ${product.stock} adet` : `Stokta (${product.stock} adet)`}
              </span>
            </>
          ) : (
            <>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.99935 14.7917C10.3445 14.7917 10.6243 14.5119 10.6243 14.1667V9.16669C10.6243 8.82151 10.3445 8.54169 9.99935 8.54169C9.65417 8.54169 9.37435 8.82151 9.37435 9.16669V14.1667C9.37435 14.5119 9.65417 14.7917 9.99935 14.7917Z"
                  fill="#F23030"
                />
                <path
                  d="M9.99935 5.83335C10.4596 5.83335 10.8327 6.20645 10.8327 6.66669C10.8327 7.12692 10.4596 7.50002 9.99935 7.50002C9.53911 7.50002 9.16602 7.12692 9.16602 6.66669C9.16602 6.20645 9.53911 5.83335 9.99935 5.83335Z"
                  fill="#F23030"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M1.04102 10C1.04102 5.05247 5.0518 1.04169 9.99935 1.04169C14.9469 1.04169 18.9577 5.05247 18.9577 10C18.9577 14.9476 14.9469 18.9584 9.99935 18.9584C5.0518 18.9584 1.04102 14.9476 1.04102 10ZM9.99935 2.29169C5.74215 2.29169 2.29102 5.74283 2.29102 10C2.29102 14.2572 5.74215 17.7084 9.99935 17.7084C14.2565 17.7084 17.7077 14.2572 17.7077 10C17.7077 5.74283 14.2565 2.29169 9.99935 2.29169Z"
                  fill="#F23030"
                />
              </svg>
              <span className="text-red text-sm">Stokta Yok</span>
            </>
          )}
        </div>
      </td>

      <td className="py-5 px-6 text-center">
        <div className="flex flex-col gap-2">
          <button
            onClick={handleAddToCartOnly}
            disabled={product.stock === 0}
            className={`inline-flex text-dark hover:text-white border border-gray-3 py-2 px-4 rounded-md ease-out duration-200 text-sm ${
              product.stock > 0 
                ? 'bg-gray-1 hover:bg-blue hover:border-gray-3' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {product.stock > 0 ? 'Sepete Ekle' : 'Stokta Yok'}
          </button>
          <button
            onClick={() => onRemove(product._id)}
            className="inline-flex text-red hover:text-white border border-red py-2 px-4 rounded-md ease-out duration-200 bg-white hover:bg-red text-sm"
          >
            Favorilerden Kaldır
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
  const discountPercentage = product.salePrice && product.price 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const handleAddToCartOnly = async () => {
    if (product.stock > 0) {
      await onAddToCart(product);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
            <Image 
              src={getImageUrl(product.images?.[0]?.url || "")} 
              alt={product.name} 
              width={80} 
              height={80}
              className="object-contain"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
            <Link href={`/product/${product._id}`} className="hover:text-blue">
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
          
          {/* Görüntüleme Sayısı */}
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            <span>{product.viewCount || 0} görüntüleme</span>
          </div>

          {/* Price */}
          <div className="mb-3">
            <p className="text-lg font-semibold text-blue">
              {formatPrice(product.salePrice || product.price)}
            </p>
            {product.salePrice && product.price > product.salePrice && (
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500 line-through">
                  {formatPrice(product.price)}
                </p>
                {discountPercentage > 0 && (
                  <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-1 rounded">
                    %{discountPercentage} İndirim
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2 mb-3">
            {product.stock > 0 ? (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16.6667 5L7.5 14.1667L3.33333 10"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-sm text-green-600">
                  {product.stock <= 5 ? `Son ${product.stock} adet` : `Stokta (${product.stock} adet)`}
                </span>
              </>
            ) : (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.99935 14.7917C10.3445 14.7917 10.6243 14.5119 10.6243 14.1667V9.16669C10.6243 8.82151 10.3445 8.54169 9.99935 8.54169C9.65417 8.54169 9.37435 8.82151 9.37435 9.16669V14.1667C9.37435 14.5119 9.65417 14.7917 9.99935 14.7917Z"
                    fill="#F23030"
                  />
                  <path
                    d="M9.99935 5.83335C10.4596 5.83335 10.8327 6.20645 10.8327 6.66669C10.8327 7.12692 10.4596 7.50002 9.99935 7.50002C9.53911 7.50002 9.16602 7.12692 9.16602 6.66669C9.16602 6.20645 9.53911 5.83335 9.99935 5.83335Z"
                    fill="#F23030"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M1.04102 10C1.04102 5.05247 5.0518 1.04169 9.99935 1.04169C14.9469 1.04169 18.9577 5.05247 18.9577 10C18.9577 14.9476 14.9469 18.9584 9.99935 18.9584C5.0518 18.9584 1.04102 14.9476 1.04102 10ZM9.99935 2.29169C5.74215 2.29169 2.29102 5.74283 2.29102 10C2.29102 14.2572 5.74215 17.7084 9.99935 17.7084C14.2565 17.7084 17.7077 14.2572 17.7077 10C17.7077 5.74283 14.2565 2.29169 9.99935 2.29169Z"
                    fill="#F23030"
                  />
                </svg>
                <span className="text-sm text-red">Stokta Yok</span>
              </>
            )}
          </div>

          {/* Action Button */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleAddToCartOnly}
              disabled={product.stock === 0}
              className={`w-full py-2 px-4 rounded-md font-medium transition-colors text-sm ${
                product.stock > 0 
                  ? 'bg-blue text-white hover:bg-blue-dark' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {product.stock > 0 ? 'Sepete Ekle' : 'Stokta Yok'}
            </button>
            <button
              onClick={() => onRemove(product._id)}
              className="w-full py-2 px-4 rounded-md font-medium transition-colors bg-white text-red border border-red hover:bg-red hover:text-white text-sm"
            >
              Favorilerden Kaldır
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
