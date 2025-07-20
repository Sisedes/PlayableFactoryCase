"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { cartService } from "@/services/cartService";
import { getSimilarProducts } from "@/services/productService";
import { Product } from "@/types";
import { getImageUrl } from "@/utils/apiUtils";
import toast from "react-hot-toast";
import Discount from "./Discount";
import OrderSummary from "./OrderSummary";
import Breadcrumb from "../Common/Breadcrumb";

const Cart = () => {
  const { cart: serverCart, loading, error, refreshCart, clearCart } = useCart();
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [similarProductsLoading, setSimilarProductsLoading] = useState(false);

  const handleClearCart = async () => {
    if (!confirm('Sepetinizdeki tüm ürünleri silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await clearCart();
      toast.success('Sepet başarıyla temizlendi');
    } catch (err) {
      console.error('Sepet temizlenirken hata:', err);
      toast.error('Sepet temizlenirken hata oluştu');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      if (!serverCart?.items || serverCart.items.length === 0) {
        setSimilarProducts([]);
        return;
      }

      try {
        setSimilarProductsLoading(true);
        
        const categoryIds: string[] = [];
        const tags: string[] = [];
        const excludeProductIds: string[] = [];

        serverCart.items.forEach((item: any) => {
          if (item.product?.category?._id) {
            categoryIds.push(item.product.category._id);
          }
          if (item.product?.tags && Array.isArray(item.product.tags)) {
            tags.push(...item.product.tags);
          }
          if (item.product?._id) {
            excludeProductIds.push(item.product._id);
          }
        });

        const uniqueCategoryIds = Array.from(new Set(categoryIds));
        const uniqueTags = Array.from(new Set(tags));

        const response = await getSimilarProducts(
          uniqueCategoryIds,
          uniqueTags,
          excludeProductIds.join(','),
          4
        );

        if (response.success && response.data) {
          setSimilarProducts(response.data);
        } else {
          console.error('Benzer ürünler getirilemedi:', response.message);
          setSimilarProducts([]);
        }
      } catch (err) {
        console.error('Benzer ürünler getirilirken hata:', err);
        setSimilarProducts([]);
      } finally {
        setSimilarProductsLoading(false);
      }
    };

    fetchSimilarProducts();
  }, [serverCart?.items]);

  if (loading) {
    return (
      <>
        <Breadcrumb title="Sepet" pages={[{ name: "Sepet" }]} />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Breadcrumb title="Sepet" pages={[{ name: "Sepet" }]} />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mt-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={refreshCart}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Tekrar Dene
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const hasOutOfStockItems = serverCart?.items?.some((item: any) => (item.product?.stock || 0) === 0);
  const hasItems = serverCart?.items.length > 0;

  return (
    <>
      {/* SEO Meta */}
      <div className="sr-only">
        <h1>Sepetim - Alışveriş Sepetiniz</h1>
        <p>Sepetinizdeki ürünleri görüntüleyin, miktarlarını güncelleyin ve ödemeye geçin.</p>
      </div>

      {/* Breadcrumb */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb title="Sepet" pages={[{ name: "Sepet" }]} />
        </div>
      </section>
      
      {hasItems ? (
        <section className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Sepetim</h1>
                <p className="text-gray-600 mt-1">
                  {serverCart?.items.length} ürün • {formatPrice(serverCart?.totals?.total || 0)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    toast('Sepet kaydetme özelliği yakında eklenecek!');
                  }}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  aria-label="Sepeti kaydet"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Kaydet
                </button>
                <button 
                  onClick={handleClearCart}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  aria-label="Sepeti temizle"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Temizle
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Desktop Header */}
                  <div className="hidden md:grid grid-cols-12 gap-4 p-6 bg-gray-50 border-b border-gray-200">
                    <div className="col-span-6">
                      <h3 className="font-semibold text-gray-900">Ürün</h3>
                    </div>
                    <div className="col-span-2 text-center">
                      <h3 className="font-semibold text-gray-900">Fiyat</h3>
                    </div>
                    <div className="col-span-2 text-center">
                      <h3 className="font-semibold text-gray-900">Miktar</h3>
                    </div>
                    <div className="col-span-2 text-right">
                      <h3 className="font-semibold text-gray-900">Toplam</h3>
                    </div>
                  </div>

                  {/* Cart Items */}
                  <div className="divide-y divide-gray-200">
                    {serverCart?.items.map((item) => (
                      <ServerCartItem 
                        key={item._id} 
                        item={item} 
                        onUpdate={refreshCart}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="space-y-6">
                  <OrderSummary />
                  <Discount />
                </div>
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="mt-8 text-center">
              <Link
                href="/shop-with-sidebar"
                className="inline-flex items-center px-6 py-3 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Alışverişe Devam Et
              </Link>
            </div>

            {/* Similar Products */}
            {serverCart?.items.length > 0 && (
              <div className="mt-16">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Benzer Ürünler</h2>
                  <p className="text-gray-600">Sepetinizdeki ürünlere benzer önerilerimiz</p>
                </div>
                
                {similarProductsLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((index) => (
                      <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="animate-pulse">
                          <div className="w-full h-32 bg-gray-200 rounded-lg mb-3"></div>
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                          <div className="h-8 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : similarProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {similarProducts.map((product) => (
                      <SimilarProductCard key={product._id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Şu anda benzer ürün önerisi bulunmuyor.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Sepetiniz Boş</h2>
                <p className="text-gray-600 mb-8">Alışverişe başlamak için ürünlerimizi keşfedin.</p>
                <Link
                  href="/shop-with-sidebar"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Alışverişe Başla
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

const ServerCartItem = ({ item, onUpdate }: { 
  item: any; 
  onUpdate: () => void;
}) => {
  const [quantity, setQuantity] = useState(item.quantity);
  const [updating, setUpdating] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '/images/products/default.jpg';
    if (imageUrl.startsWith('/uploads/')) {
      return `http://localhost:5000${imageUrl}`;
    }
    return imageUrl;
  };

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    let maxStock = item.product?.stock || 0;
    if (item.variant && item.product?.variants) {
      const variant = item.product.variants.find((v: any) => v._id === item.variant);
      if (variant) {
        maxStock = variant.stock || 0;
      }
    }
    
    if (newQuantity > maxStock) {
      toast.error(`Bu üründen maksimum ${maxStock} adet sipariş verebilirsiniz. Stok yetersiz!`);
      return;
    }
    
    try {
      setUpdating(true);
      const response = await cartService.updateCartItem(itemId, newQuantity);
      
      if (response.success) {
        setQuantity(newQuantity);
        setTimeout(() => onUpdate(), 100);
      } else {
        toast.error('Miktar güncellenirken hata oluştu. Lütfen tekrar deneyin.');
      }
    } catch (err: any) {
      console.error('Miktar güncellenirken hata:', err);
      if (err.message && err.message.includes('Yetersiz stok')) {
        toast.error('Stok yetersiz! Bu üründen daha fazla sipariş veremezsiniz.');
      } else {
        toast.error('Miktar güncellenirken hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Bu ürünü sepetinizden kaldırmak istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await cartService.removeFromCart(item._id);
      setTimeout(() => onUpdate(), 100);
      toast.success('Ürün sepetten kaldırıldı');
    } catch (err) {
      console.error('Ürün kaldırılırken hata:', err);
      toast.error('Ürün kaldırılırken hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const getVariantInfo = () => {
    if (!item.variant || !item.product?.variants) return null;
    const variant = item.product.variants.find((v: any) => v._id === item.variant);
    return variant;
  };

  const getStockInfo = () => {
    let stock = 0;
    if (item.variant && item.product?.variants) {
      const variant = item.product.variants.find((v: any) => v._id === item.variant);
      stock = variant?.stock || 0;
    } else {
      stock = item.product?.stock || 0;
    }
    return stock;
  };

  const getPriceInfo = () => {
    let displayPrice = item.price;
    let originalPrice = item.product?.price;
    let isDiscounted = false;
    
    if (item.variant && item.product?.variants) {
      const variant = item.product.variants.find((v: any) => v._id === item.variant);
      if (variant) {
        if (variant.price) {
          originalPrice = variant.price;
        }
        if (variant.salePrice && variant.salePrice < originalPrice) {
          displayPrice = variant.salePrice;
          isDiscounted = true;
        }
      }
    } else {
      if (item.product?.salePrice && item.product.salePrice > 0 && item.product.salePrice < item.product.price) {
        displayPrice = item.product.salePrice;
        isDiscounted = true;
      }
    }
    
    return { displayPrice, originalPrice, isDiscounted };
  };

  const variant = getVariantInfo();
  const stock = getStockInfo();
  const { displayPrice, originalPrice, isDiscounted } = getPriceInfo();
  const imageUrl = (() => {
    let url = item.product?.images?.[0]?.url;
    if (variant?.image) {
      url = variant.image;
    }
    return getImageUrl(url);
  })();

  return (
    <div className="p-4 md:p-6">
      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={imageUrl}
                alt={item.product?.name || 'Ürün'}
                fill
                className="object-cover"
                sizes="80px"
                priority={false}
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  <Link href={`/product/${item.product?._id}`} className="hover:text-blue-600">
                    {item.product?.name || 'Ürün Adı'}
                  </Link>
                </h3>
                {variant && (
                  <p className="text-xs text-gray-500 mt-1">
                    {variant.name}
                    {variant.options && Array.isArray(variant.options) && (
                      <span className="block">
                        {variant.options.map((option: any, index: number) => (
                          <span key={index}>
                            {option.name}: {option.value}
                            {index < variant.options.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </span>
                    )}
                  </p>
                )}
                <div className={`text-xs mt-1 ${
                  stock <= 5 ? 'text-red-600' : 'text-green-600'
                }`}>
                  Stok: {stock} adet
                  {stock <= 5 && stock > 0 && ' (Az kaldı!)'}
                  {stock === 0 && ' (Tükendi)'}
                </div>
              </div>
              <button
                onClick={handleRemove}
                disabled={updating}
                className="text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Ürünü kaldır"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Fiyat:</span>
                <div className="text-right">
                  {isDiscounted ? (
                    <div>
                      <p className="text-sm font-medium text-gray-900">{formatPrice(displayPrice)}</p>
                      <p className="text-xs text-gray-500 line-through">{formatPrice(originalPrice)}</p>
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-gray-900">{formatPrice(displayPrice)}</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Miktar:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuantityChange(item._id, quantity - 1)}
                    disabled={quantity <= 1 || stock === 0 || updating}
                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item._id, quantity + 1)}
                    disabled={quantity >= stock || stock === 0 || updating}
                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-900">Toplam:</span>
                <span className="text-sm font-bold text-gray-900">{formatPrice(item.total || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:grid grid-cols-12 gap-4 items-center">
        <div className="col-span-6">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={imageUrl}
                alt={item.product?.name || 'Ürün'}
                fill
                className="object-cover"
                sizes="64px"
                priority={false}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900">
                <Link href={`/product/${item.product?._id}`} className="hover:text-blue-600">
                  {item.product?.name || 'Ürün Adı'}
                </Link>
              </h3>
              {variant && (
                <p className="text-xs text-gray-500 mt-1">
                  {variant.name}
                  {variant.options && Array.isArray(variant.options) && (
                    <span className="block">
                      {variant.options.map((option: any, index: number) => (
                        <span key={index}>
                          {option.name}: {option.value}
                          {index < variant.options.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </span>
                  )}
                </p>
              )}
              <div className={`text-xs mt-1 ${
                stock <= 5 ? 'text-red-600' : 'text-green-600'
              }`}>
                Stok: {stock} adet
                {stock <= 5 && stock > 0 && ' (Az kaldı!)'}
                {stock === 0 && ' (Tükendi)'}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-2 text-center">
          {isDiscounted ? (
            <div>
              <p className="text-sm font-medium text-gray-900">{formatPrice(displayPrice)}</p>
              <p className="text-xs text-gray-500 line-through">{formatPrice(originalPrice)}</p>
              <p className="text-xs text-green-600 font-medium">
                %{Math.round(((originalPrice - displayPrice) / originalPrice) * 100)} İndirim
              </p>
            </div>
          ) : (
            <p className="text-sm font-medium text-gray-900">{formatPrice(displayPrice)}</p>
          )}
        </div>

        <div className="col-span-2 flex items-center justify-center gap-2">
          <button
            onClick={() => handleQuantityChange(item._id, quantity - 1)}
            disabled={quantity <= 1 || stock === 0 || updating}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="w-12 text-center text-sm font-medium">{quantity}</span>
          <button
            onClick={() => handleQuantityChange(item._id, quantity + 1)}
            disabled={quantity >= stock || stock === 0 || updating}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <div className="col-span-2 text-right">
          <p className="text-sm font-bold text-gray-900">{formatPrice(item.total || 0)}</p>
        </div>
      </div>

      {/* Remove button for desktop */}
      <div className="hidden md:block absolute top-4 right-4">
        <button
          onClick={handleRemove}
          disabled={updating}
          className="text-gray-400 hover:text-red-500 transition-colors"
          aria-label="Ürünü kaldır"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const SimilarProductCard = ({ product }: { product: Product }) => {
  const [addingToCart, setAddingToCart] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const getDisplayPrice = () => {
    if (product.salePrice && product.salePrice > 0 && product.salePrice < product.price) {
      return {
        displayPrice: product.salePrice,
        originalPrice: product.price,
        isDiscounted: true
      };
    }
    return {
      displayPrice: product.price,
      originalPrice: product.price,
      isDiscounted: false
    };
  };

  const handleAddToCart = async () => {
    if (addingToCart) return;

    try {
      setAddingToCart(true);
      const response = await cartService.addToCart({
        productId: product._id,
        quantity: 1
      });

      if (response.success) {
        toast.success('Ürün sepete eklendi!');
      } else {
        toast.error('Ürün sepete eklenirken hata oluştu');
      }
    } catch (err: any) {
      console.error('Ürün sepete eklenirken hata:', err);
      toast.error(err.message || 'Ürün sepete eklenirken hata oluştu');
    } finally {
      setAddingToCart(false);
    }
  };

  const { displayPrice, originalPrice, isDiscounted } = getDisplayPrice();
  const imageUrl = product.images && product.images.length > 0 ? getImageUrl(product.images[0].url) : '/images/products/default.jpg';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden mb-3">
        <Image 
          src={imageUrl} 
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={false}
        />
      </div>
      
      <h4 className="font-medium text-gray-900 mb-2 text-sm line-clamp-2" title={product.name}>
        {product.name}
      </h4>
      
      <div className="mb-3">
        {isDiscounted ? (
          <div>
            <p className="text-blue-600 font-medium text-sm">{formatPrice(displayPrice)}</p>
            <p className="text-gray-500 line-through text-xs">{formatPrice(originalPrice)}</p>
            <p className="text-green-600 text-xs font-medium">
              %{Math.round(((originalPrice - displayPrice) / originalPrice) * 100)} İndirim
            </p>
          </div>
        ) : (
          <p className="text-blue-600 font-medium text-sm">{formatPrice(displayPrice)}</p>
        )}
      </div>
      
      <button 
        onClick={handleAddToCart}
        disabled={addingToCart || (product.stock || 0) === 0}
        className={`w-full py-2 px-4 rounded-md transition-colors text-sm font-medium ${
          (product.stock || 0) === 0
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {addingToCart ? 'Ekleniyor...' : (product.stock || 0) === 0 ? 'Tükendi' : 'Sepete Ekle'}
      </button>
    </div>
  );
};

export default Cart;
