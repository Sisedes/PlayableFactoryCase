"use client";
import React, { useState, useEffect } from "react";
import { Product } from "@/types";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import { getImageUrl } from "@/utils/apiUtils";
import { useDispatch } from "react-redux";
import { addItemToCart } from "@/redux/features/cart-slice";
import { AppDispatch } from "@/redux/store";
// import { toast } from "react-hot-toast";

interface ProductDetailsProps {
  product: Product;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const dispatch = useDispatch<AppDispatch>();

  const tabs = [
    { id: "description", title: "Açıklama" },
    { id: "specifications", title: "Özellikler" },
    { id: "reviews", title: "Yorumlar" },
  ];

  const handleAddToCart = () => {
    dispatch(addItemToCart({
      id: parseInt(product._id) || 0,
      title: product.name,
      price: product.price,
      discountedPrice: product.salePrice || product.price,
      quantity: quantity,
      imgs: {
        thumbnails: product.images?.map(img => getImageUrl(img.url)) || [],
        previews: product.images?.map(img => getImageUrl(img.url)) || []
      }
    }));
    alert("Ürün sepete eklendi!");
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
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
                        src={getImageUrl(product.images[selectedImage]?.url || "")}
                        alt={product.images[selectedImage]?.alt || product.name}
                        width={400}
                        height={400}
                        className="w-full h-full object-contain max-w-full max-h-full p-4"
                        style={{ 
                          aspectRatio: '1/1',
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                  </div>

              {/* Küçük Görseller */}
              {product.images.length > 1 && (
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
                  {formatPrice(product.salePrice || product.price)}
                </span>
                {product.salePrice && product.price > product.salePrice && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              {/* Stok Durumu */}
              <div className="mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  product.stock > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.stock > 0 ? `Stokta ${product.stock} adet` : 'Stokta yok'}
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
                    disabled={quantity >= product.stock}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Sepete Ekle Butonu */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full bg-blue text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 mb-4"
              >
                {product.stock > 0 ? 'Sepete Ekle' : 'Stokta Yok'}
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
                  <span className="font-medium">{product.sku}</span>
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
                      <span>{product.sku}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium">Stok</span>
                      <span>{product.stock} adet</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium">Fiyat</span>
                      <span>{formatPrice(product.price)}</span>
                    </div>
                    {product.salePrice && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium">İndirimli Fiyat</span>
                        <span className="text-red-600">{formatPrice(product.salePrice)}</span>
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