"use client";
import React, { useState, useEffect } from "react";
import { Product, ProductVariant } from "@/types";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import { getImageUrl } from "@/utils/apiUtils";
import { useDispatch } from "react-redux";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addRecentlyViewed } from "@/redux/features/recentlyViewed-slice";
import { AppDispatch } from "@/redux/store";
import { cartService } from "@/services/cartService";
import StarRating from "../Common/StarRating";
import { getProductReviews } from "@/services/reviewService";
import { addToFavorites, removeFromFavorites, checkFavoriteStatus } from "@/services/favoriteService";
import { incrementProductView } from "@/services/productService";
import { useAuth } from "@/store/authStore";
import { sortProductImages } from "@/utils/apiUtils";
import ProductRecommendations from "./ProductRecommendations";
// import { toast } from "react-hot-toast";

interface ProductDetailsProps {
  product: Product;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [showVariantImage, setShowVariantImage] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [viewCount, setViewCount] = useState(product.viewCount || 0);
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, accessToken } = useAuth();

  const tabs = [
    { id: "description", title: "Açıklama" },
    { id: "specifications", title: "Özellikler" },
    { id: "reviews", title: "Yorumlar" },
  ];

  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      const defaultVariant = product.variants.find(v => v.isDefault) || product.variants[0];
      setSelectedVariant(defaultVariant);
      
      const defaultOptions: Record<string, string> = {};
      if (defaultVariant.options && defaultVariant.options.length > 0) {
        defaultVariant.options.forEach(option => {
          defaultOptions[option.name] = option.value;
        });
      }
      setSelectedOptions(defaultOptions);
      
      if (defaultVariant.image) {
        setShowVariantImage(true);
      }
    }
  }, [product.variants]);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      checkFavoriteStatus(product._id, accessToken).then(response => {
        if (response.success) {
          setIsFavorite(response.data?.isFavorite || false);
        }
      }).catch(error => {
        console.error('Favori durumu kontrol edilirken hata:', error);
      });
    }
  }, [isAuthenticated, accessToken, product._id]);

  useEffect(() => {
    const incrementView = async () => {
      try {
        setViewCount(prev => prev + 1);
        
        incrementProductView(product._id).catch(error => {
          console.error('View count artırılırken hata:', error);
          setViewCount(prev => prev - 1);
        });
      } catch (error) {
        console.error('View count artırılırken hata:', error);
      }
    };

    incrementView();
    
    dispatch(addRecentlyViewed(product));
  }, [product._id, dispatch, product]);

  const findVariantByOptions = (options: Record<string, string>): ProductVariant | null => {
    if (!product.variants) return null;
    
    return product.variants.find(variant => 
      variant.options && variant.options.every(option => 
        options[option.name] === option.value
      )
    ) || null;
  };

  const handleOptionChange = (optionName: string, optionValue: string) => {
    const newOptions = { ...selectedOptions, [optionName]: optionValue };
    setSelectedOptions(newOptions);
    
    const matchingVariant = findVariantByOptions(newOptions);
    setSelectedVariant(matchingVariant);
    
    if (matchingVariant && matchingVariant.image) {
      setShowVariantImage(true);
    } else {
      setShowVariantImage(false);
    }
  };

  const handleSelectOriginal = () => {
    setSelectedVariant(null);
    setSelectedOptions({});
    setShowVariantImage(false);
  };

  const handleShowProductImage = () => {
    setShowVariantImage(false);
    setSelectedImage(0);
  };

  const handleShowVariantImage = () => {
    if (selectedVariant && selectedVariant.image) {
      setShowVariantImage(true);
    }
  };

  const getVariantOptions = () => {
    if (!product.variants || product.variants.length === 0) return {};
    
    const options: Record<string, string[]> = {};
    product.variants.forEach(variant => {
      if (variant.options && variant.options.length > 0) {
        variant.options.forEach(option => {
          if (!options[option.name]) {
            options[option.name] = [];
          }
          if (!options[option.name].includes(option.value)) {
            options[option.name].push(option.value);
          }
        });
      }
    });
    
    return options;
  };

  const getCurrentStock = () => {
    if (selectedVariant && typeof selectedVariant.stock === 'number') {
      return selectedVariant.stock;
    }
    return product.stock || 0;
  };

  const getCurrentPrice = () => {
    if (selectedVariant) {
      return selectedVariant.salePrice || selectedVariant.price || product.price || 0;
    }
    return product.salePrice || product.price || 0;
  };

  const getCurrentOriginalPrice = () => {
    if (selectedVariant) {
      return selectedVariant.price || product.price || 0;
    }
    return product.price || 0;
  };

  const getCurrentImage = () => {
    if (showVariantImage && selectedVariant && selectedVariant.image) {
      return {
        url: selectedVariant.image,
        alt: `${product.name} - ${selectedVariant.name}`
      };
    }
    
    const sortedImages = sortProductImages(product.images);
    return sortedImages[selectedImage] || sortedImages[0];
  };

  const hasVariantImage = selectedVariant && selectedVariant.image;

  const getActiveOptionName = () => {
    if (!selectedVariant) return 'Orijinal';
    return selectedVariant.options?.[0]?.value || selectedVariant.name || 'Varyasyon';
  };

  const handleAddToCart = async () => {
    const currentStock = getCurrentStock();
    if (currentStock === 0) return;

    try {
      const response = await cartService.addToCart({
        productId: product._id,
        quantity: quantity,
        variantId: selectedVariant?._id
      });

      if (response.success) {
        // Redux store'a ekleme işlemi
        const productTitle = selectedVariant 
          ? `${product.name} - ${selectedVariant.name}`
          : product.name;

        dispatch(addItemToCart({
          id: product._id,
          title: productTitle,
          price: getCurrentPrice(),
          discountedPrice: getCurrentPrice(),
          quantity: quantity,
          imgs: {
            thumbnails: product.images?.map(img => getImageUrl(img.url)) || [],
            previews: product.images?.map(img => getImageUrl(img.url)) || []
          },
          variant: selectedVariant ? {
            id: selectedVariant._id || '',
            name: selectedVariant.name,
            sku: selectedVariant.sku,
            options: selectedVariant.options
          } : undefined
        }));

        alert("Ürün sepete eklendi!");
      } else {
        alert("Ürün sepete eklenirken hata oluştu!");
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      alert("Ürün sepete eklenirken hata oluştu!");
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= getCurrentStock()) {
      setQuantity(newQuantity);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated || !accessToken) {
      alert('Favoriye eklemek için giriş yapmanız gerekiyor!');
      return;
    }

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        const response = await removeFromFavorites(product._id, accessToken);
        if (response.success) {
          setIsFavorite(false);
          alert('Ürün favorilerden çıkarıldı');
          window.dispatchEvent(new Event('favoriteUpdated'));
        } else {
          alert(response.message || 'Ürün favorilerden çıkarılamadı');
        }
      } else {
        const response = await addToFavorites(product._id, accessToken);
        if (response.success) {
          setIsFavorite(true);
          alert('Ürün favorilere eklendi');
          window.dispatchEvent(new Event('favoriteUpdated'));
        } else {
          alert(response.message || 'Ürün favorilere eklenemedi');
        }
      }
    } catch (error) {
      console.error('Favori işlemi hatası:', error);
      alert('Favori işlemi sırasında hata oluştu');
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

  const fetchReviews = async () => {
    setReviewsLoading(true);
    setReviewsError(null);
    try {
      const response = await getProductReviews(product._id, 1, 20);
      if (response.success) {
        setReviews(response.data);
      }
    } catch (error: any) {
      setReviewsError(error.message || 'Yorumlar yüklenirken hata oluştu');
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchReviews();
    }
  }, [activeTab, product._id]);

  const currentPrice = getCurrentPrice();
  const currentOriginalPrice = getCurrentOriginalPrice();
  const currentStock = getCurrentStock();
  const currentImage = getCurrentImage();
  
  const discountPercentage = currentPrice && currentOriginalPrice && currentPrice < currentOriginalPrice
    ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
    : 0;

  const variantOptions = getVariantOptions();
  const hasVariants = product.variants && product.variants.length > 0;

  return (
    <>
      <Breadcrumb 
        title={product.name} 
        pages={[
          { name: "Ürünler", href: "/products" },
          { name: product.category.name, href: `/category/${product.category.slug}` },
          { name: product.name }
        ]} 
      />

      <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-17.5">
            {/* Ürün Görselleri */}
            <div className="lg:max-w-[570px] w-full">
              <div className="lg:min-h-[512px] rounded-lg shadow-1 bg-gray-50 p-4 sm:p-7.5 relative flex items-center justify-center">
                <div className="w-full h-full flex items-center justify-center">
                  <Image
                    src={getImageUrl(currentImage?.url || "")}
                    alt={currentImage?.alt || product.name}
                    width={400}
                    height={400}
                    className="w-full h-full object-contain max-w-full max-h-full p-4 transition-all duration-300 ease-in-out"
                    style={{ 
                      aspectRatio: '1/1'
                    }}
                  />
                </div>
              </div>

              {/* Küçük Görseller - Sadece ürün görselleri için göster */}
              {!showVariantImage && product.images.length > 1 && (
                <div className="flex flex-wrap sm:flex-nowrap gap-4.5 mt-6">
                  {sortProductImages(product.images).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex items-center justify-center w-15 sm:w-25 h-15 sm:h-25 overflow-hidden rounded-lg bg-gray-2 shadow-1 ease-out duration-200 border-2 hover:border-blue ${
                        index === selectedImage ? "border-blue" : "border-transparent"
                      }`}
                    >
                      <Image
                        width={50}
                        height={50}
                        src={getImageUrl(image.url)}
                        alt={image.alt || product.name}
                        className="w-full h-full object-contain rounded p-1"
                        style={{ objectFit: 'contain' }}
                      />
                    </button>
                  ))}
                </div>
              )}

            </div>

            {/* Ürün Bilgileri */}
            <div className="max-w-[539px] w-full">
              <div className="flex items-center justify-between mb-3">
                <h1 className="font-semibold text-xl sm:text-2xl xl:text-custom-3 text-dark">
                  {product.name}
                </h1>
                {discountPercentage > 0 && (
                  <div className="inline-flex font-medium text-custom-sm text-white bg-red-500 rounded py-0.5 px-2.5">
                    %{discountPercentage} İNDİRİM
                  </div>
                )}
              </div>

              {/* Yıldız Değerlendirmesi */}
              <div className="flex items-center gap-2 mb-4">
                <StarRating 
                  rating={product.averageRating || 0} 
                  reviewCount={product.reviewCount || 0}
                  size="md"
                />
              </div>

              {/* Fiyat */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-bold text-blue">
                  {formatPrice(currentPrice)}
                </span>
                {currentPrice < currentOriginalPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(currentOriginalPrice)}
                  </span>
                )}
              </div>

              {/* Varyasyon Seçenekleri */}
              {hasVariants && (
                <div className="mb-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Varyasyon Seçenekleri</h3>
                  
                  {/* Orijinal Seçeneği */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Seçenek:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={handleSelectOriginal}
                        className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                          !selectedVariant
                            ? 'bg-blue text-white border-blue'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue hover:text-blue'
                        }`}
                      >
                        Orijinal
                      </button>
                      {Object.entries(variantOptions).map(([optionName, optionValues]) => (
                        optionValues.map((value) => (
                          <button
                            key={`${optionName}-${value}`}
                            onClick={() => handleOptionChange(optionName, value)}
                            className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                              selectedOptions[optionName] === value
                                ? 'bg-blue text-white border-blue'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-blue hover:text-blue'
                            }`}
                          >
                            {value}
                          </button>
                        ))
                      ))}
                    </div>
                  </div>
                  
                  {/* Seçilen Varyasyon Bilgisi */}
                  {selectedVariant && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Seçilen:</span> {selectedVariant.name || 'Varyasyon'}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        SKU: {selectedVariant.sku || 'N/A'}
                      </div>
                    </div>
                  )}

                  {/* Orijinal Seçili Bilgisi */}
                  {!selectedVariant && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm text-blue-600">
                        <span className="font-medium">Seçilen:</span> Orijinal Ürün
                      </div>
                      <div className="text-sm text-blue-500 mt-1">
                        SKU: {product.sku}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Stok Durumu ve Görüntüleme Sayısı */}
              <div className="mb-4 flex items-center gap-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  currentStock > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {currentStock > 0 ? `Stokta ${currentStock} adet` : 'Stokta yok'}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  {viewCount} görüntüleme
                </span>
              </div>

              {/* Miktar Seçimi */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium text-gray-700">Miktar:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300 min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= currentStock}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Sepete Ekle Butonu */}
              <button
                onClick={handleAddToCart}
                disabled={currentStock === 0}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200 mb-4 ${
                  currentStock > 0 
                    ? 'bg-blue text-white hover:bg-blue-600' 
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                }`}
              >
                {currentStock > 0 ? 'Sepete Ekle' : 'Stokta Yok - Sepete Eklenemez'}
              </button>

              {/* Favori Butonu */}
              <button
                onClick={handleToggleFavorite}
                disabled={favoriteLoading}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200 mb-4 flex items-center justify-center gap-2 ${
                  isFavorite 
                    ? 'bg-red text-white hover:bg-red' 
                    : 'bg-white text-red border-2 border-red hover:bg-red'
                } disabled:bg-gray-400 disabled:text-gray disabled:border-gray disabled:cursor-not-allowed`}
              >
                {favoriteLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill={isFavorite ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M3.74949 2.94946C2.6435 3.45502 1.83325 4.65749 1.83325 6.0914C1.83325 7.55633 2.43273 8.68549 3.29211 9.65318C4.0004 10.4507 4.85781 11.1118 5.694 11.7564C5.89261 11.9095 6.09002 12.0617 6.28395 12.2146C6.63464 12.491 6.94747 12.7337 7.24899 12.9099C7.55068 13.0862 7.79352 13.1667 7.99992 13.1667C8.20632 13.1667 8.44916 13.0862 8.75085 12.9099C9.05237 12.7337 9.3652 12.491 9.71589 12.2146C9.90982 12.0617 10.1072 11.9095 10.3058 11.7564C11.142 11.1118 11.9994 10.4507 12.7077 9.65318C13.5671 8.68549 14.1666 7.55633 14.1666 6.0914C14.1666 4.65749 13.3563 3.45502 12.2503 2.94946C11.1759 2.45832 9.73214 2.58839 8.36016 4.01382C8.2659 4.11175 8.13584 4.16709 7.99992 4.16709C7.864 4.16709 7.73393 4.11175 7.63967 4.01382C6.26769 2.58839 4.82396 2.45832 3.74949 2.94946ZM7.99992 2.97255C6.45855 1.5935 4.73256 1.40058 3.33376 2.03998C1.85639 2.71528 0.833252 4.28336 0.833252 6.0914C0.833252 7.86842 1.57358 9.22404 2.5444 10.3172C3.32183 11.1926 4.2734 11.9253 5.1138 12.5724C5.30431 12.7191 5.48911 12.8614 5.66486 12.9999C6.00636 13.2691 6.37295 13.5562 6.74447 13.7733C7.11582 13.9903 7.53965 14.1667 7.99992 14.1667C8.46018 14.1667 8.88401 13.9903 9.25537 13.7733C9.62689 13.5562 9.99348 13.2691 10.335 12.9999C10.5107 12.8614 10.6955 12.7191 10.886 12.5724C11.7264 11.9253 12.678 11.1926 13.4554 10.3172C14.4263 9.22404 15.1666 7.86842 15.1666 6.0914C15.1666 4.28336 14.1434 2.71528 12.6661 2.03998C11.2673 1.40058 9.54129 1.5935 7.99992 2.97255Z"
                    />
                  </svg>
                )}
                {isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
              </button>

              {/* Ürün Açıklaması */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Ürün Açıklaması</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.shortDescription || product.description}
                </p>
              </div>

              {/* Ürün Bilgileri */}
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Kategori:</span>
                  <span className="font-medium">{product.category.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>SKU:</span>
                  <span className="font-medium">{selectedVariant?.sku || product.sku}</span>
                </div>
                {product.tags && product.tags.length > 0 && (
                  <div className="flex justify-between">
                    <span>Etiketler:</span>
                    <span className="font-medium">{product.tags.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sekmeler */}
          <div className="mt-12">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue text-blue'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.title}
                  </button>
                ))}
              </nav>
            </div>

            <div className="mt-6">
              {activeTab === "description" && (
                <div className="prose max-w-none">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              )}

              {activeTab === "specifications" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium">Kategori</span>
                      <span>{product.category.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium">SKU</span>
                      <span>{selectedVariant?.sku || product.sku}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium">Stok</span>
                      <span>{currentStock} adet</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium">Görüntüleme</span>
                      <span>{viewCount} kez</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium">Fiyat</span>
                      <span>{formatPrice(currentOriginalPrice)}</span>
                    </div>
                    {currentPrice < currentOriginalPrice && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium">İndirimli Fiyat</span>
                        <span className="text-red-600">{formatPrice(currentPrice)}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium">Durum</span>
                      <span className={`capitalize ${
                        product.status === 'active' ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {product.status === 'active' ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-6">
                  {reviewsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue mx-auto"></div>
                      <p className="text-gray-500 mt-2">Yorumlar yükleniyor...</p>
                    </div>
                  ) : reviewsError ? (
                    <div className="text-center py-8">
                      <p className="text-red-500">{reviewsError}</p>
                      <button 
                        onClick={fetchReviews}
                        className="mt-2 text-blue hover:text-blue-600"
                      >
                        Tekrar Dene
                      </button>
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Müşteri Yorumları ({reviews.length})
                        </h3>
                      </div>
                      
                      {reviews.map((review) => (
                        <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {review.user?.profile?.firstName?.charAt(0) || 'K'}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-medium text-dark">
                                  {review.user?.profile?.firstName || 'İsimsiz'} {review.user?.profile?.lastName || 'Kullanıcı'}
                                </h4>
                                <p className="text-sm text-gray-500">{review.user?.email}</p>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1 mb-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className="w-4 h-4"
                                style={{
                                  fill: star <= review.rating ? '#fbbf24' : '#d1d5db',
                                  color: star <= review.rating ? '#fbbf24' : '#d1d5db'
                                }}
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                            <span className="text-sm text-gray-600 ml-1">
                              {review.rating}/5
                            </span>
                          </div>

                          {review.title && (
                            <h5 className="font-medium text-dark mb-2">{review.title}</h5>
                          )}
                          
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {review.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Bu ürün için henüz onaylanmış yorum bulunmuyor.</p>
                      <p className="text-sm text-gray-400 mt-2">İlk yorumu siz yapın!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Ürün Önerileri */}
      <ProductRecommendations productId={product._id} />
    </>
  );
};

export default ProductDetails;