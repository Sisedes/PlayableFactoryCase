"use client";
import React, { useState, useEffect } from "react";
import { Product, ProductVariant } from "@/types";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import { getImageUrl } from "@/utils/apiUtils";
import { useDispatch } from "react-redux";
import { addItemToCart } from "@/redux/features/cart-slice";
import { AppDispatch } from "@/redux/store";
import { cartService } from "@/services/cartService";
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
  const dispatch = useDispatch<AppDispatch>();

  const tabs = [
    { id: "description", title: "Açıklama" },
    { id: "specifications", title: "Özellikler" },
    { id: "reviews", title: "Yorumlar" },
  ];

  // Varyasyonları varsa varsayılan varyasyonu seç
  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      const defaultVariant = product.variants.find(v => v.isDefault) || product.variants[0];
      setSelectedVariant(defaultVariant);
      
      // Varsayılan seçenekleri ayarla
      const defaultOptions: Record<string, string> = {};
      defaultVariant.options.forEach(option => {
        defaultOptions[option.name] = option.value;
      });
      setSelectedOptions(defaultOptions);
      
      // Varsayılan varyasyonun görseli varsa onu göster
      if (defaultVariant.image) {
        setShowVariantImage(true);
      }
    }
  }, [product.variants]);

  // Seçilen seçeneklere göre varyasyon bul
  const findVariantByOptions = (options: Record<string, string>): ProductVariant | null => {
    if (!product.variants) return null;
    
    return product.variants.find(variant => 
      variant.options.every(option => 
        options[option.name] === option.value
      )
    ) || null;
  };

  // Seçenek değiştiğinde varyasyonu güncelle
  const handleOptionChange = (optionName: string, optionValue: string) => {
    const newOptions = { ...selectedOptions, [optionName]: optionValue };
    setSelectedOptions(newOptions);
    
    const matchingVariant = findVariantByOptions(newOptions);
    setSelectedVariant(matchingVariant);
    
    // Eğer varyasyonun kendi görseli varsa onu göster
    if (matchingVariant && matchingVariant.image) {
      setShowVariantImage(true);
    } else {
      setShowVariantImage(false);
    }
  };

  // Orijinal ürünü seç
  const handleSelectOriginal = () => {
    setSelectedVariant(null);
    setSelectedOptions({});
    setShowVariantImage(false);
  };

  // Normal ürün görseline dön
  const handleShowProductImage = () => {
    setShowVariantImage(false);
    setSelectedImage(0);
  };

  // Varyasyon görselini göster
  const handleShowVariantImage = () => {
    if (selectedVariant && selectedVariant.image) {
      setShowVariantImage(true);
    }
  };

  // Varyasyon seçeneklerini grupla
  const getVariantOptions = () => {
    if (!product.variants || product.variants.length === 0) return {};
    
    const options: Record<string, string[]> = {};
    product.variants.forEach(variant => {
      variant.options.forEach(option => {
        if (!options[option.name]) {
          options[option.name] = [];
        }
        if (!options[option.name].includes(option.value)) {
          options[option.name].push(option.value);
        }
      });
    });
    
    return options;
  };

  // Seçilen varyasyonun stok durumunu kontrol et
  const getCurrentStock = () => {
    if (selectedVariant) {
      return selectedVariant.stock;
    }
    return product.stock;
  };

  // Seçilen varyasyonun fiyatını al
  const getCurrentPrice = () => {
    if (selectedVariant) {
      return selectedVariant.salePrice || selectedVariant.price || product.price;
    }
    return product.salePrice || product.price;
  };

  // Seçilen varyasyonun normal fiyatını al
  const getCurrentOriginalPrice = () => {
    if (selectedVariant) {
      return selectedVariant.price || product.price;
    }
    return product.price;
  };

  // Görüntülenecek görseli al
  const getCurrentImage = () => {
    if (showVariantImage && selectedVariant && selectedVariant.image) {
      return {
        url: selectedVariant.image,
        alt: `${product.name} - ${selectedVariant.name}`
      };
    }
    return product.images[selectedImage] || product.images[0];
  };

  // Varyasyonun görseli var mı kontrol et
  const hasVariantImage = selectedVariant && selectedVariant.image;

  // Aktif seçenek adını al
  const getActiveOptionName = () => {
    if (!selectedVariant) return 'Orijinal';
    return selectedVariant.options[0]?.value || selectedVariant.name;
  };

  const handleAddToCart = async () => {
    const currentStock = getCurrentStock();
    if (currentStock === 0) return;

    try {
      // Backend API'sine ekle
      const response = await cartService.addToCart({
        productId: product._id,
        quantity: quantity,
        variantId: selectedVariant?._id
      });

      if (response.success) {
        // Redux store'a da ekle (geriye uyumluluk için)
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
    const currentStock = getCurrentStock();
    if (newQuantity >= 1 && newQuantity <= currentStock) {
      setQuantity(newQuantity);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

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
                  {product.images.map((image, index) => (
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
                            key={value}
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
                        <span className="font-medium">Seçilen:</span> {selectedVariant.name}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        SKU: {selectedVariant.sku}
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

              {/* Stok Durumu */}
              <div className="mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  currentStock > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {currentStock > 0 ? `Stokta ${currentStock} adet` : 'Stokta yok'}
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
                className="w-full bg-blue text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 mb-4"
              >
                {currentStock > 0 ? 'Sepete Ekle' : 'Stokta Yok'}
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
                <div className="text-center py-8">
                  <p className="text-gray-500">Bu ürün için henüz yorum bulunmuyor.</p>
                  <p className="text-sm text-gray-400 mt-2">İlk yorumu siz yapın!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductDetails; 