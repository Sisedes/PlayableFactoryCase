"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { addItemToCart } from "@/redux/features/cart-slice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { useAuth } from "@/store/authStore";
import { addToFavorites, removeFromFavorites, checkFavoriteStatus } from "@/services/favoriteService";
import { getImageUrl } from "@/utils/apiUtils";
import { cartService } from "@/services/cartService";
import StarRating from './StarRating';

const QuickViewModal = () => {
  const { isOpen, closeModal, product } = useModalContext();
  const { accessToken } = useAuth();
  const [activePreview, setActivePreview] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (accessToken && product?._id) {
      checkFavoriteStatus(product._id, accessToken).then(response => {
        if (response.success) {
          setIsFavorite(response.data?.isFavorite || false);
        }
      });
    }
  }, [accessToken, product?._id]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeModal]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      const response = await cartService.addToCart({
        productId: product._id,
        quantity: 1,
        variantId: undefined
      });

      if (response.success) {
        dispatch(
          addItemToCart({
            id: product._id,
            title: product.name,
            price: product.price,
            discountedPrice: product.salePrice || product.price,
            imgs: { 
              thumbnails: product.images?.map(img => getImageUrl(img.url)) || [],
              previews: product.images?.map(img => getImageUrl(img.url)) || [] 
            },
            quantity: 1,
          })
        );
        
        alert("Ürün sepete eklendi!");
      } else {
        alert("Ürün sepete eklenirken hata oluştu!");
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      alert("Ürün sepete eklenirken hata oluştu!");
    }
  };

  const handleToggleFavorite = async () => {
    if (!accessToken || !product?._id) {
      alert('Favori eklemek için giriş yapmanız gerekiyor');
      return;
    }

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

  const getImageUrl = (imageUrl: string) => {
    if (imageUrl.startsWith('/uploads/')) {
      return `http://localhost:5000${imageUrl}`;
    }
    return imageUrl;
  };

  const productImages = product?.images || [];
  const thumbnails = productImages.map(img => getImageUrl(img.url));
  const previews = productImages.map(img => getImageUrl(img.url));

  if (!isOpen || !product) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4">
    <div
        ref={modalRef}
        className="relative w-full max-w-4xl bg-white rounded-lg max-h-[90vh] overflow-y-auto"
    >
          <button
          onClick={closeModal}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          >
            <svg
            className="w-5 h-5"
              fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            >
              <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

        <div className="flex flex-col lg:flex-row gap-6 p-6">
          {/* Sol taraf - Resimler */}
          <div className="lg:w-1/2">
            <div className="flex gap-4">
              {/* Küçük resimler */}
              {thumbnails.length > 1 && (
                <div className="flex flex-col gap-2">
                  {thumbnails.map((img, key) => (
                    <button
                      key={key}
                      onClick={() => setActivePreview(key)}
                      className={`w-16 h-16 overflow-hidden rounded-lg border-2 transition-all ${
                        activePreview === key 
                          ? 'border-blue' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={img || "/images/products/placeholder.jpg"}
                        alt={`${product.name} - Resim ${key + 1}`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Ana resim */}
              <div className="flex-1 relative">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                    src={previews[activePreview] || '/images/products/placeholder.jpg'}
                    alt={product.name}
                      width={400}
                      height={400}
                    className="w-full h-full object-contain"
                  />
                </div>
                
                {/* Resim sayısı göstergesi */}
                {thumbnails.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {activePreview + 1} / {thumbnails.length}
                  </div>
                )}
              </div>
              </div>
            </div>

          {/* Sağ taraf - Ürün bilgileri */}
          <div className="lg:w-1/2 space-y-4">
            {/* İndirim etiketi */}
            {product.salePrice && (
              <span className="inline-block text-xs font-medium text-white py-1 px-3 bg-green rounded">
                İNDİRİM %{Math.round(((product.price - product.salePrice) / product.price) * 100)} OFF
              </span>
            )}

            {/* Ürün adı */}
            <h3 className="font-semibold text-xl text-dark">
              {product.name}
              </h3>

            {/* Yıldızlar ve stok */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <StarRating 
                  rating={product.averageRating || 0} 
                  reviewCount={product.reviewCount || 0}
                  size="sm"
                />
              </div>

              <div className="flex items-center gap-1 text-gray-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Stokta: {product.stock} adet</span>
              </div>

              <div className="flex items-center gap-1 text-gray-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                <span>{product.viewCount || 0} görüntüleme</span>
              </div>
                </div>

            {/* Fiyat */}
                  <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-dark">
                ₺{product.salePrice || product.price}
              </span>
              {product.salePrice && (
                <span className="text-lg text-gray-500 line-through">
                  ₺{product.price}
                    </span>
              )}
              </div>

            {/* Açıklama */}
            <p className="text-gray-600 text-sm leading-relaxed">
              {product.shortDescription || product.description}
            </p>

            {/* Butonlar */}
            <div className="flex flex-wrap gap-3 pt-4">
                <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                  product.stock > 0 
                    ? 'bg-blue text-white hover:bg-blue-dark' 
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                }`}
              >
                {product.stock > 0 ? 'Sepete Ekle' : 'Stokta Yok'}
                </button>

                <button
                onClick={handleToggleFavorite}
                disabled={favoriteLoading}
                className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all ${
                  isFavorite 
                    ? 'border-red-500 bg-red-50 text-red-500' 
                    : 'border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-500'
                } ${favoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {favoriteLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                ) : (
                  <svg
                    className="w-5 h-5"
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
            </div>

            {/* Özellikler */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 pt-4 border-t">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Ücretsiz Kargo</span>
              </div>
              
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>30 Gün İade</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
