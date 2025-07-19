"use client";
import React, { useState } from "react";
import Discount from "./Discount";
import OrderSummary from "./OrderSummary";
import Breadcrumb from "../Common/Breadcrumb";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { cartService } from "@/services/cartService";

const Cart = () => {
  const { cart: serverCart, loading, error, refreshCart, clearCart } = useCart();

  const handleClearCart = async () => {
    if (!confirm('Sepetinizdeki tüm ürünleri silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await clearCart();
    } catch (err) {
      console.error('Sepet temizlenirken hata:', err);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  if (loading) {
    return (
      <>
        <Breadcrumb title={"Sepet"} pages={[{ name: "Sepet" }]} />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Breadcrumb title={"Sepet"} pages={[{ name: "Sepet" }]} />
        <div className="text-center mt-8">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={refreshCart}
            className="text-blue hover:underline"
          >
            Tekrar Dene
          </button>
        </div>
      </>
    );
  }

  const hasOutOfStockItems = serverCart?.items?.some((item: any) => (item.product?.stock || 0) === 0);
  const hasItems = serverCart?.items.length > 0;

  return (
    <>
      {/* <!-- ===== Breadcrumb Section Start ===== --> */}
      <section>
        <Breadcrumb title={"Sepet"} pages={[
          { name: "Sepet" }
        ]} />
      </section>
      {/* <!-- ===== Breadcrumb Section End ===== --> */}
      
      {hasItems ? (
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="flex flex-wrap items-center justify-between gap-5 mb-7.5">
              <h2 className="font-medium text-dark text-2xl">Sepetim</h2>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    alert('Sepet kaydetme özelliği yakında eklenecek!');
                  }}
                  className="text-gray-600 hover:text-blue ease-out duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
                <button 
                  onClick={handleClearCart}
                  className="text-red-500 hover:text-red-700 ease-out duration-200"
                >
                  Sepeti Temizle
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[10px] shadow-1">
              <div className="w-full overflow-x-auto">
                <div className="min-w-[1170px]">
                  {/* <!-- table header --> */}
                  <div className="flex items-center py-5.5 px-7.5">
                    <div className="min-w-[400px]">
                      <p className="text-dark">Ürün</p>
                    </div>

                    <div className="min-w-[180px]">
                      <p className="text-dark">Fiyat</p>
                    </div>

                    <div className="min-w-[275px]">
                      <p className="text-dark">Miktar</p>
                    </div>

                    <div className="min-w-[200px]">
                      <p className="text-dark">Ara Toplam</p>
                    </div>

                    <div className="min-w-[50px]">
                      <p className="text-dark text-right">İşlem</p>
                    </div>
                  </div>

                  {/* <!-- cart items from server --> */}
                  {serverCart?.items.map((item, key) => (
                    <ServerCartItem 
                      key={item._id} 
                      item={item} 
                      onUpdate={refreshCart}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11 mt-9">
              <Discount />
              <OrderSummary />
            </div>

            {/* Alışverişe devam et butonu */}
            <div className="mt-8 text-center">
              <Link
                href="/products"
                className="inline-flex items-center font-medium text-blue hover:text-blue-dark ease-out duration-200"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
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

            {/* Benzer Ürünler Bölümü */}
            {serverCart?.items.length > 0 && (
              <div className="mt-16">
                <div className="text-center mb-8">
                  <h3 className="text-xl font-medium text-dark mb-2">Benzer Ürünler</h3>
                  <p className="text-gray-600">Sepetinizdeki ürünlere benzer önerilerimiz</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Burada benzer ürünler gösterilecek */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                    <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">Ürün Resmi</span>
                    </div>
                    <h4 className="font-medium text-dark mb-2">Benzer Ürün 1</h4>
                    <p className="text-blue font-medium mb-3">₺99.99</p>
                    <button className="w-full bg-blue text-white py-2 px-4 rounded-md hover:bg-blue-dark transition-colors">
                      Sepete Ekle
                    </button>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                    <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">Ürün Resmi</span>
                    </div>
                    <h4 className="font-medium text-dark mb-2">Benzer Ürün 2</h4>
                    <p className="text-blue font-medium mb-3">₺149.99</p>
                    <button className="w-full bg-blue text-white py-2 px-4 rounded-md hover:bg-blue-dark transition-colors">
                      Sepete Ekle
                    </button>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                    <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">Ürün Resmi</span>
                    </div>
                    <h4 className="font-medium text-dark mb-2">Benzer Ürün 3</h4>
                    <p className="text-blue font-medium mb-3">₺79.99</p>
                    <button className="w-full bg-blue text-white py-2 px-4 rounded-md hover:bg-blue-dark transition-colors">
                      Sepete Ekle
                    </button>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                    <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">Ürün Resmi</span>
                    </div>
                    <h4 className="font-medium text-dark mb-2">Benzer Ürün 4</h4>
                    <p className="text-blue font-medium mb-3">₺199.99</p>
                    <button className="w-full bg-blue text-white py-2 px-4 rounded-md hover:bg-blue-dark transition-colors">
                      Sepete Ekle
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      ) : (
        <>
          <section className="overflow-hidden py-20 bg-gray-2">
            <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
              <div className="text-center">
                <div className="mx-auto pb-7.5 max-w-[200px]">
                  <svg
                    className="mx-auto w-full h-auto"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="50" cy="50" r="50" fill="#F3F4F6" />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M36.1693 36.2421C35.6126 36.0565 35.0109 36.3574 34.8253 36.9141C34.6398 37.4707 34.9406 38.0725 35.4973 38.258L35.8726 38.3831C36.8308 38.7025 37.4644 38.9154 37.9311 39.1325C38.373 39.3381 38.5641 39.5036 38.6865 39.6734C38.809 39.8433 38.9055 40.0769 38.9608 40.5612C39.0192 41.0726 39.0208 41.7409 39.0208 42.751L39.0208 46.5361C39.0208 48.4735 39.0207 50.0352 39.1859 51.2634C39.3573 52.5385 39.7241 53.6122 40.5768 54.4649C41.4295 55.3176 42.5032 55.6844 43.7783 55.8558C45.0065 56.0209 46.5681 56.0209 48.5055 56.0209H59.9166C60.5034 56.0209 60.9791 55.5452 60.9791 54.9584C60.9791 54.3716 60.5034 53.8959 59.9166 53.8959H48.5833C46.5498 53.8959 45.1315 53.8936 44.0615 53.7498C43.022 53.61 42.4715 53.3544 42.0794 52.9623C41.9424 52.8253 41.8221 52.669 41.7175 52.4792H55.7495C56.3846 52.4792 56.9433 52.4793 57.4072 52.4292C57.9093 52.375 58.3957 52.2546 58.8534 51.9528C59.3111 51.651 59.6135 51.2513 59.8611 50.8111C60.0898 50.4045 60.3099 49.891 60.56 49.3072L61.2214 47.7641C61.766 46.4933 62.2217 45.4302 62.4498 44.5655C62.6878 43.6634 62.7497 42.7216 62.1884 41.8704C61.627 41.0191 60.737 40.705 59.8141 40.5684C58.9295 40.4374 57.7729 40.4375 56.3903 40.4375L41.0845 40.4375C41.0806 40.3979 41.0765 40.3588 41.0721 40.3201C40.9937 39.6333 40.8228 39.0031 40.4104 38.4309C39.998 37.8588 39.4542 37.4974 38.8274 37.2058C38.2377 36.9315 37.4879 36.6816 36.6005 36.3858L36.1693 36.2421ZM41.1458 42.5625C41.1458 42.6054 41.1458 42.6485 41.1458 42.692L41.1458 46.4584C41.1458 48.1187 41.1473 49.3688 41.2262 50.3542H55.6975C56.4 50.3542 56.8429 50.3528 57.1791 50.3165C57.4896 50.2829 57.6091 50.2279 57.6836 50.1787C57.7582 50.1296 57.8559 50.0415 58.009 49.7692C58.1748 49.4745 58.3506 49.068 58.6273 48.4223L59.2344 47.0057C59.8217 45.6355 60.2119 44.7177 60.3951 44.0235C60.5731 43.3488 60.4829 43.1441 60.4143 43.0401C60.3458 42.9362 60.1931 42.7727 59.5029 42.6705C58.7927 42.5653 57.7954 42.5625 56.3047 42.5625H41.1458Z"
                      fill="#8D93A5"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M40.4375 60.625C40.4375 62.3855 41.8646 63.8125 43.625 63.8125C45.3854 63.8125 46.8125 62.3855 46.8125 60.625C46.8125 58.8646 45.3854 57.4375 43.625 57.4375C41.8646 57.4375 40.4375 58.8646 40.4375 60.625ZM43.625 61.6875C43.0382 61.6875 42.5625 61.2118 42.5625 60.625C42.5625 60.0382 43.0382 59.5625 43.625 59.5625C44.2118 59.5625 44.6875 60.0382 44.6875 60.625C44.6875 61.2118 44.2118 61.6875 43.625 61.6875Z"
                      fill="#8D93A5"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M56.375 63.8126C54.6146 63.8126 53.1875 62.3856 53.1875 60.6251C53.1875 58.8647 54.6146 57.4376 56.375 57.4376C58.1354 57.4376 59.5625 58.8647 59.5625 60.6251C59.5625 62.3856 58.1354 63.8126 56.375 63.8126ZM55.3125 60.6251C55.3125 61.212 55.7882 61.6876 56.375 61.6876C56.9618 61.6876 57.4375 61.212 57.4375 60.6251C57.4375 60.0383 56.9618 59.5626 56.375 59.5626C55.7882 59.5626 55.3125 60.0383 55.3125 60.6251Z"
                      fill="#8D93A5"
                    />
                  </svg>
                </div>

                <h2 className="text-2xl font-medium text-dark mb-4">Sepetiniz Boş</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Henüz sepetinize ürün eklemediniz. Alışverişe başlamak için aşağıdaki butona tıklayabilirsiniz.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/products"
                    className="inline-flex justify-center font-medium text-white bg-blue py-3 px-8 rounded-md ease-out duration-200 hover:bg-blue-dark"
                  >
                    Ürünleri Keşfet
                  </Link>
                  <Link
                    href="/shop-with-sidebar"
                    className="inline-flex justify-center font-medium text-dark bg-gray-2 border border-gray-3 py-3 px-8 rounded-md ease-out duration-200 hover:bg-gray-3"
                  >
                    Mağazaya Git
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </>
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
      alert(`Bu üründen maksimum ${maxStock} adet sipariş verebilirsiniz.`);
      return;
    }
    
    try {
      setUpdating(true);
      await cartService.updateCartItem(itemId, newQuantity);
      setQuantity(newQuantity);
      // Kısa bir gecikme ile sepeti yenile
      setTimeout(() => onUpdate(), 100);
    } catch (err) {
      console.error('Miktar güncellenirken hata:', err);
      alert('Miktar güncellenirken hata oluştu. Lütfen tekrar deneyin.');
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
      // Kısa bir gecikme ile sepeti yenile
      setTimeout(() => onUpdate(), 100);
    } catch (err) {
      console.error('Ürün kaldırılırken hata:', err);
      alert('Ürün kaldırılırken hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <div className="flex items-center border-t border-gray-3 py-5 px-7.5">
      <div className="min-w-[400px]">
        <div className="flex items-center justify-between gap-5">
          <div className="w-full flex items-center gap-5.5">
            <div className="flex items-center justify-center rounded-[5px] bg-gray-2 max-w-[80px] w-full h-17.5">
              <img 
                src={getImageUrl((() => {
                  let imageUrl = item.product?.images?.[0]?.url;
                  if (item.variant && item.product?.variants) {
                    const variant = item.product.variants.find((v: any) => v._id === item.variant);
                    if (variant?.image) {
                      imageUrl = variant.image;
                    }
                  }
                  return imageUrl;
                })())} 
                alt={item.product?.name || 'Ürün'}
                className="w-full h-full object-cover rounded-[5px]"
              />
            </div>

            <div>
              <h3 className="text-dark ease-out duration-200 hover:text-blue">
                <a href={`/product/${item.product?._id}`}> {item.product?.name || 'Ürün Adı'} </a>
              </h3>
              {item.variant && (
                <div className="mt-1 text-sm text-gray-600">
                  <div className="font-medium">
                    {(() => {
                      if (item.product?.variants) {
                        const variant = item.product.variants.find((v: any) => v._id === item.variant);
                        return variant?.name || 'Varyasyon';
                      }
                      return 'Varyasyon';
                    })()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {(() => {
                      if (item.product?.variants) {
                        const variant = item.product.variants.find((v: any) => v._id === item.variant);
                        if (variant?.options && Array.isArray(variant.options)) {
                          return variant.options.map((option: any, index: number) => (
                            <span key={index}>
                              {option.name}: {option.value}
                              {index < variant.options.length - 1 ? ', ' : ''}
                            </span>
                          ));
                        }
                      }
                      return null;
                    })()}
                  </div>
                  
                  <div className={`text-xs mt-1 ${
                    (() => {
                      let stock = 0;
                      if (item.product?.variants) {
                        const variant = item.product.variants.find((v: any) => v._id === item.variant);
                        stock = variant?.stock || 0;
                      }
                      return stock <= 5 ? 'text-red-500' : 'text-green-600';
                    })()
                  }`}>
                    Stok: {(() => {
                      let stock = 0;
                      if (item.product?.variants) {
                        const variant = item.product.variants.find((v: any) => v._id === item.variant);
                        stock = variant?.stock || 0;
                      }
                      return stock;
                    })()} adet
                    {(() => {
                      let stock = 0;
                      if (item.product?.variants) {
                        const variant = item.product.variants.find((v: any) => v._id === item.variant);
                        stock = variant?.stock || 0;
                      }
                      if (stock <= 5 && stock > 0) return ' (Az kaldı!)';
                      if (stock === 0) return ' (Tükendi)';
                      return '';
                    })()}
                  </div>
                </div>
              )}
              {!item.variant && (
                <div className={`text-xs mt-1 ${
                  (item.product?.stock || 0) <= 5 ? 'text-red-500' : 'text-green-600'
                }`}>
                  Stok: {item.product?.stock || 0} adet
                  {(item.product?.stock || 0) <= 5 && (item.product?.stock || 0) > 0 && ' (Az kaldı!)'}
                  {(item.product?.stock || 0) === 0 && ' (Tükendi)'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="min-w-[180px]">
        <div className="flex flex-col">
          {(() => {
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
              if (item.product?.salePrice && item.product.salePrice < item.product.price) {
                displayPrice = item.product.salePrice;
                isDiscounted = true;
              }
            }
            
            if (isDiscounted) {
              return (
                <>
                  <p className="text-dark font-medium">{formatPrice(displayPrice)}</p>
                  <p className="text-gray-500 line-through text-sm">{formatPrice(originalPrice)}</p>
                  <p className="text-green-600 text-xs font-medium">
                    %{Math.round(((originalPrice - displayPrice) / originalPrice) * 100)} İndirim
                  </p>
                </>
              );
            } else {
              return <p className="text-dark font-medium">{formatPrice(displayPrice)}</p>;
            }
          })()}
        </div>
      </div>

      <div className="min-w-[275px]">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleQuantityChange(item._id, quantity - 1)}
            disabled={quantity <= 1 || (() => {
              let stock = item.product?.stock || 0;
              if (item.variant && item.product?.variants) {
                const variant = item.product.variants.find((v: any) => v._id === item.variant);
                stock = variant?.stock || 0;
              }
              return stock === 0;
            })()}
            className="flex items-center justify-center w-8 h-8 rounded border border-gray-3 hover:bg-gray-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="12" height="2" viewBox="0 0 12 2" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value) || 1)}
            disabled={(() => {
              let stock = item.product?.stock || 0;
              if (item.variant && item.product?.variants) {
                const variant = item.product.variants.find((v: any) => v._id === item.variant);
                stock = variant?.stock || 0;
              }
              return stock === 0;
            })()}
            className="w-16 h-8 text-center border border-gray-3 rounded focus:outline-none focus:border-blue disabled:opacity-50 disabled:cursor-not-allowed"
            min="1"
            max={(() => {
              let stock = item.product?.stock || 0;
              if (item.variant && item.product?.variants) {
                const variant = item.product.variants.find((v: any) => v._id === item.variant);
                stock = variant?.stock || 0;
              }
              return stock;
            })()}
          />
          <button
            onClick={() => handleQuantityChange(item._id, quantity + 1)}
            disabled={quantity >= (() => {
              let stock = item.product?.stock || 0;
              if (item.variant && item.product?.variants) {
                const variant = item.product.variants.find((v: any) => v._id === item.variant);
                stock = variant?.stock || 0;
              }
              return stock;
            })() || (() => {
              let stock = item.product?.stock || 0;
              if (item.variant && item.product?.variants) {
                const variant = item.product.variants.find((v: any) => v._id === item.variant);
                stock = variant?.stock || 0;
              }
              return stock === 0;
            })()}
            className="flex items-center justify-center w-8 h-8 rounded border border-gray-3 hover:bg-gray-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        {(() => {
          let stock = item.product?.stock || 0;
          if (item.variant && item.product?.variants) {
            const variant = item.product.variants.find((v: any) => v._id === item.variant);
            stock = variant?.stock || 0;
          }
          return stock === 0;
        })() && (
          <div className="text-red-500 text-xs text-center mt-1">
            Bu ürün tükendi!
          </div>
        )}
      </div>

      <div className="min-w-[200px]">
        <p className="text-dark font-medium">
          {formatPrice(item.total || 0)}
        </p>
      </div>

      <div className="min-w-[50px] flex justify-end">
        <button
          onClick={handleRemove}
          disabled={updating}
          aria-label="button for remove product from cart"
          className="flex items-center justify-center rounded-lg max-w-[38px] w-full h-9.5 bg-gray-2 border border-gray-3 text-dark ease-out duration-200 hover:bg-red-light-6 hover:border-red-light-4 hover:text-red disabled:opacity-50"
        >
          <svg
            className="fill-current"
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9.45017 2.06252H12.5498C12.7482 2.06239 12.921 2.06228 13.0842 2.08834C13.7289 2.19129 14.2868 2.59338 14.5883 3.17244C14.6646 3.319 14.7192 3.48298 14.7818 3.6712L14.8841 3.97819C14.9014 4.03015 14.9064 4.04486 14.9105 4.05645C15.0711 4.50022 15.4873 4.80021 15.959 4.81217C15.9714 4.81248 15.9866 4.81254 16.0417 4.81254H18.7917C19.1714 4.81254 19.4792 5.12034 19.4792 5.50004C19.4792 5.87973 19.1714 6.18754 18.7917 6.18754H3.20825C2.82856 6.18754 2.52075 5.87973 2.52075 5.50004C2.52075 5.12034 2.82856 4.81254 3.20825 4.81254H5.95833C6.01337 4.81254 6.02856 4.81248 6.04097 4.81217C6.51273 4.80021 6.92892 4.50024 7.08944 4.05647C7.09366 4.0448 7.09852 4.03041 7.11592 3.97819L7.21823 3.67122C7.28083 3.48301 7.33538 3.319 7.41171 3.17244C7.71324 2.59339 8.27112 2.19129 8.91581 2.08834C9.079 2.06228 9.25181 2.06239 9.45017 2.06252ZM8.25739 4.81254C8.30461 4.71993 8.34645 4.6237 8.38245 4.52419C8.39338 4.49397 8.4041 4.4618 8.41787 4.42048L8.50936 4.14601C8.59293 3.8953 8.61217 3.84416 8.63126 3.8075C8.73177 3.61448 8.91773 3.48045 9.13263 3.44614C9.17345 3.43962 9.22803 3.43754 9.49232 3.43754H12.5077C12.772 3.43754 12.8265 3.43962 12.8674 3.44614C13.0823 3.48045 13.2682 3.61449 13.3687 3.8075C13.3878 3.84416 13.4071 3.89529 13.4906 4.14601L13.5821 4.42031L13.6176 4.52421C13.6535 4.62372 13.6954 4.71994 13.7426 4.81254H8.25739Z"
              fill=""
            />
            <path
              d="M5.42208 7.74597C5.39683 7.36711 5.06923 7.08047 4.69038 7.10572C4.31152 7.13098 4.02487 7.45858 4.05013 7.83743L4.47496 14.2099C4.55333 15.3857 4.61663 16.3355 4.76511 17.0808C4.91947 17.8557 5.18203 18.5029 5.72432 19.0103C6.26662 19.5176 6.92987 19.7365 7.7133 19.839C8.46682 19.9376 9.41871 19.9376 10.5971 19.9375H11.4028C12.5812 19.9376 13.5332 19.9376 14.2867 19.839C15.0701 19.7365 15.7334 19.5176 16.2757 19.0103C16.818 18.5029 17.0805 17.8557 17.2349 17.0808C17.3834 16.3355 17.4467 15.3857 17.525 14.2099L17.9499 7.83743C17.9751 7.45858 17.6885 7.13098 17.3096 7.10572C16.9308 7.08047 16.6032 7.36711 16.5779 7.74597L16.1563 14.0702C16.0739 15.3057 16.0152 16.1654 15.8864 16.8122C15.7614 17.4396 15.5869 17.7717 15.3363 18.0062C15.0857 18.2406 14.7427 18.3926 14.1084 18.4756C13.4544 18.5612 12.5927 18.5625 11.3545 18.5625H10.6455C9.40727 18.5625 8.54559 18.5612 7.89164 18.4756C7.25731 18.3926 6.91433 18.2406 6.6637 18.0062C6.41307 17.7717 6.2386 17.4396 6.11361 16.8122C5.98476 16.1654 5.92607 15.3057 5.8437 14.0702L5.42208 7.74597Z"
              fill=""
            />
            <path
              d="M8.63993 9.39928C9.01774 9.3615 9.35464 9.63715 9.39242 10.015L9.85076 14.5983C9.88854 14.9761 9.61289 15.313 9.23508 15.3508C8.85727 15.3886 8.52036 15.1129 8.48258 14.7351L8.02425 10.1518C7.98647 9.77397 8.26212 9.43706 8.63993 9.39928Z"
              fill=""
            />
            <path
              d="M13.3601 9.39928C13.7379 9.43706 14.0135 9.77397 13.9758 10.1518L13.5174 14.7351C13.4796 15.1129 13.1427 15.3886 12.7649 15.3508C12.3871 15.313 12.1115 14.9761 12.1492 14.5983L12.6076 10.015C12.6454 9.63715 12.9823 9.3615 13.3601 9.39928Z"
              fill=""
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Cart;
