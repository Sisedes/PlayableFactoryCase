"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { updateproductDetails } from "@/redux/features/product-details";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { useAuth } from "@/store/authStore";
import { addToFavorites, removeFromFavorites, checkFavoriteStatus } from "@/services/favoriteService";
import { getImageUrl, sortProductImages } from "@/utils/apiUtils";
import { cartService } from "@/services/cartService";
import StarRating from '../Common/StarRating';
import toast from "react-hot-toast";

const SingleListItem = ({ item }: { item: Product }) => {
  const { openModal } = useModalContext();
  const { accessToken } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (accessToken && item._id) {
      checkFavoriteStatus(item._id, accessToken).then(response => {
        if (response.success) {
          setIsFavorite(response.data?.isFavorite || false);
        }
      });
    }
  }, [accessToken, item._id]);

  const handleQuickView = () => {
    openModal(item);
  };

  const handleAddToCart = async () => {
    if (item.stock === 0 || item.stock === undefined || item.stock === null) {
      toast.error("Bu ürün stokta bulunmamaktadır!");
      return;
    }
    
    setAddingToCart(true);
    try {
      const response = await cartService.addToCart({
        productId: item._id,
        quantity: 1,
        variantId: undefined
      });

      if (response.success) {
        dispatch(
          addItemToCart({
            id: item._id.toString(),
            title: item.name,
            price: item.price,
            discountedPrice: item.salePrice || item.price,
            imgs: { 
              thumbnails: item.images?.map(img => getImageUrl(img.url)) || [],
              previews: item.images?.map(img => getImageUrl(img.url)) || [] 
            },
            quantity: 1,
          })
        );
        
        toast.success("Ürün sepete eklendi!");
      } else {
        toast.error("Ürün sepete eklenirken hata oluştu!");
      }
    } catch (error: any) {
      console.error('Add to cart error:', error);
      if (error.message && error.message.includes('Yetersiz stok')) {
        toast.error('Stok yetersiz! Bu üründen daha fazla sipariş veremezsiniz.');
      } else {
        toast.error("Ürün sepete eklenirken hata oluştu!");
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const handleItemToWishList = () => {
    dispatch(
      addItemToWishlist({
        id: parseInt(item._id) || 0,
        title: item.name,
        price: item.price,
        discountedPrice: item.salePrice || item.price,
        imgs: { 
          thumbnails: item.images?.map(img => getImageUrl(img.url)) || [],
          previews: item.images?.map(img => getImageUrl(img.url)) || [] 
        },
        status: "available",
        quantity: 1,
      })
    );
  };

  const handleProductDetails = () => {
    dispatch(updateproductDetails({ ...item }));
  };

  const handleToggleFavorite = async () => {
    if (!accessToken) {
      toast('Favori eklemek için giriş yapmanız gerekiyor');
      return;
    }

    if (!item._id) return;

    setFavoriteLoading(true);
    try {
      let response;
      if (isFavorite) {
        response = await removeFromFavorites(item._id, accessToken);
      } else {
        response = await addToFavorites(item._id, accessToken);
      }

      if (response.success) {
        setIsFavorite(!isFavorite);
        window.dispatchEvent(new Event('favoriteUpdated'));
      } else {
        toast.error(response.message || 'İşlem başarısız');
      }
    } catch (error) {
      console.error('Favori işlemi hatası:', error);
      toast.error('İşlem sırasında hata oluştu');
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

  const isNewProduct = item.createdAt && new Date(item.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const hasDiscount = item.salePrice && item.salePrice < item.price;
  const isInStock = item.stock !== undefined && item.stock !== null && item.stock > 0;
  const mainImage = sortProductImages(item.images)[0]?.url || "/images/products/default.png";
  const discountPercentage = hasDiscount ? Math.round(((item.price - item.salePrice!) / item.price) * 100) : 0;

  return (
    <article className="group w-full bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="flex flex-col lg:flex-row">
        <div className="relative lg:w-80 lg:flex-shrink-0">
          <div className="relative overflow-hidden bg-gray-50 w-full h-48 lg:h-full">
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
              {hasDiscount && (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-md shadow-sm">
                  %{discountPercentage} İndirim
                </span>
              )}
              {isNewProduct && (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold text-white bg-green-500 rounded-md shadow-sm">
                  Yeni
                </span>
              )}
              {item.isFeatured && (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold text-white bg-blue-500 rounded-md shadow-sm">
                  Öne Çıkan
                </span>
              )}
            </div>

            <div className="absolute top-3 right-3 z-10">
              {isInStock ? (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold text-white bg-green-500 rounded-md shadow-sm">
                  Stokta
                </span>
              ) : (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-200 rounded-md shadow-sm">
                  Tükendi
                </span>
              )}
            </div>

            <img 
              src={getImageUrl(mainImage)} 
              alt={item.name || "Ürün görseli"} 
              className="object-contain w-full h-full p-4 transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/products/default.png';
              }}
            />

            <div className="absolute left-0 bottom-0 translate-y-full w-full flex items-center justify-center gap-2 pb-3 ease-linear duration-200 group-hover:translate-y-0">
              <button
                onClick={handleQuickView}
                aria-label="Hızlı görünüm"
                className="flex items-center justify-center w-9 h-9 rounded-lg shadow-lg ease-out duration-200 text-gray-700 bg-white hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>

              <button
                onClick={handleToggleFavorite}
                disabled={favoriteLoading}
                aria-label="Favorilere ekle"
                className={`flex items-center justify-center w-9 h-9 rounded-lg shadow-lg ease-out duration-200 transition-colors ${
                  isFavorite 
                    ? 'text-red-500 bg-white hover:bg-red-50' 
                    : 'text-gray-700 bg-white hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <svg className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className="flex flex-col h-full">
            <div className="flex-1">
              {item.category?.name && (
                <div className="mb-2">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full">
                    {item.category.name}
                  </span>
                </div>
              )}

              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                <Link href={`/product/${item._id}`} onClick={handleProductDetails}>
                  {item.name}
                </Link>
              </h3>

              {item.shortDescription && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {item.shortDescription}
                </p>
              )}

              <div className="flex items-center gap-2 mb-4">
                <StarRating rating={item.averageRating || 0} />
                <span className="text-sm text-gray-500">
                  ({item.reviewCount || 0} değerlendirme)
                </span>
                {item.viewCount && item.viewCount > 0 && (
                  <span className="text-sm text-gray-400">
                    • {item.viewCount} görüntülenme
                  </span>
                )}
              </div>

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {item.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
                      +{item.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-baseline gap-2">
                    {hasDiscount ? (
                      <>
                        <span className="text-2xl font-bold text-gray-900">
                          {formatPrice(item.salePrice!)}
                        </span>
                        <span className="text-lg text-gray-500 line-through">
                          {formatPrice(item.price)}
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-gray-900">
                        {formatPrice(item.price)}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Stok: {item.stock || 0} adet
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={!isInStock || addingToCart}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      isInStock 
                        ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
                        {isInStock ? 'Sepete Ekle' : 'Tükendi'}
                      </>
                    )}
                  </button>

                  <Link
                    href={`/product/${item._id}`}
                    onClick={handleProductDetails}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Detaylar
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default SingleListItem;
