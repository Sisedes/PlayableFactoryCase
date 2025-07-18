"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { addItemToCart } from "@/redux/features/cart-slice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { useAuth } from "@/store/authStore";
import { addToFavorites, removeFromFavorites, checkFavoriteStatus } from "@/services/favoriteService";

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

  const handleAddToCart = () => {
    if (!product) return;
    
    dispatch(
      addItemToCart({
        id: parseInt(product._id) || 0,
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
                {[...Array(5)].map((_, index) => (
                  <svg
                    key={index}
                    className={`w-4 h-4 ${index < 4 ? 'fill-yellow-400' : 'fill-gray-300'}`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-gray-600">4.7 (5 değerlendirme)</span>
              </div>

              <div className="flex items-center gap-1 text-gray-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Stokta: {product.stock} adet</span>
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
                className="flex-1 bg-blue text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-dark transition-colors"
              >
                Sepete Ekle
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
