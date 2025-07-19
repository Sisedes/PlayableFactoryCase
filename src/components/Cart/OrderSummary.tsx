import React, { useState } from "react";
import { cartService, type Cart as CartType } from "@/services/cartService";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";

const OrderSummary = () => {
  const { cart: serverCart, loading, refreshCart } = useCart();
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const displayCart = serverCart || { items: [], totals: { subtotal: 0, discount: 0, tax: 0, shipping: 0, total: 0 } };
  const items = displayCart.items || [];
  const totals = displayCart.totals || { subtotal: 0, discount: 0, tax: 0, shipping: 0, total: 0 };

  const subtotal = totals.subtotal || 0;
  const backendDiscount = totals.discount || 0;
  const tax = totals.tax || 0;
  const shipping = totals.shipping || 0;
  const total = totals.total || 0;

  const calculateFrontendDiscount = (subtotal: number) => {
    if (discountPercentage > 0) {
      return subtotal * (discountPercentage / 100);
    }
    return discountAmount;
  };

  const totalDiscount = backendDiscount + calculateFrontendDiscount(subtotal);
  const subtotalAfterDiscount = subtotal - totalDiscount;

  const applyDiscountCode = async (code: string) => {
    if (!code.trim()) return;

    try {
      setApplyingCoupon(true);
      const response = await cartService.applyCoupon(code);
      
      if (response.success) {
        setDiscountAmount(response.data.discountAmount);
        setDiscountCode(code);
        
        if (response.data.discountType === 'percentage') {
          setDiscountPercentage(10); 
        } else {
          setDiscountPercentage(0);
        }
        
        refreshCart();
      }
    } catch (error: any) {
      alert(error.message || 'Kupon kodu uygulanırken hata oluştu!');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeDiscountCode = async () => {
    try {
      const response = await cartService.removeCoupon();
      if (response.success) {
        setDiscountCode("");
        setDiscountAmount(0);
        setDiscountPercentage(0);
        
        refreshCart();
      }
    } catch (error: any) {
      alert(error.message || 'Kupon kaldırılırken hata oluştu!');
    }
  };

  const hasOutOfStockItems = items?.some((item: any) => {
    let stock = item.product?.stock || 0;
    if (item.variant && item.product?.variants) {
      const variant = item.product.variants.find((v: any) => v._id === item.variant);
      stock = variant?.stock || 0;
    }
    return stock === 0;
  });

  const CheckoutButton = () => {
    if (hasOutOfStockItems) {
      return (
        <button
          disabled
          className="w-full flex justify-center font-medium text-white bg-gray-400 py-3 px-6 rounded-md cursor-not-allowed mt-7.5"
        >
          Tükendi Ürünler Var
        </button>
      );
    }

    return (
      <Link
        href="/checkout"
        className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5"
      >
        Ödemeye Geç
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="lg:max-w-[455px] w-full">
        <div className="bg-white shadow-1 rounded-[10px]">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:max-w-[455px] w-full">
      {/* <!-- order list box --> */}
      <div className="bg-white shadow-1 rounded-[10px]">
        <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
          <h3 className="font-medium text-xl text-dark">Sipariş Özeti</h3>
        </div>

        <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
          {/* <!-- title --> */}
          <div className="flex items-center justify-between py-5 border-b border-gray-3">
            <div>
              <h4 className="font-medium text-dark">Ürün</h4>
            </div>
            <div>
              <h4 className="font-medium text-dark text-right">Ara Toplam</h4>
            </div>
          </div>

          {/* <!-- product items --> */}
          {items.map((item: any, key: number) => (
            <div key={key} className="flex items-center justify-between py-5 border-b border-gray-3">
              <div className="flex-1">
                <p className="text-dark text-sm">
                  {item.product?.name || item.title || item.name}
                </p>
                {item.variant && (
                  <p className="text-xs text-gray-500 mt-1">
                    {(() => {
                      if (item.product?.variants) {
                        const variant = item.product.variants.find((v: any) => v._id === item.variant);
                        return variant?.name || 'Varyasyon';
                      }
                      return 'Varyasyon';
                    })()}
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  Miktar: {item.quantity}
                </p>
              </div>
              <div>
                <p className="text-dark text-right font-medium">
                  {formatPrice(item.total || 0)}
                </p>
              </div>
            </div>
          ))}

          {/* <!-- subtotal --> */}
          <div className="flex items-center justify-between py-3 border-b border-gray-3">
            <div>
              <p className="text-dark">Ara Toplam</p>
            </div>
            <div>
              <p className="text-dark text-right">
                {formatPrice(subtotal)}
              </p>
            </div>
          </div>

          {/* <!-- discount --> */}
          {totalDiscount > 0 && (
            <div className="flex items-center justify-between py-3 border-b border-gray-3">
              <div className="flex items-center gap-2">
                <p className="text-green-600">İndirim</p>
                {discountCode && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    {discountCode}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-green-600 text-right">
                  -{formatPrice(totalDiscount)}
                </p>
                {discountCode && (
                  <button
                    onClick={removeDiscountCode}
                    className="text-red-500 hover:text-red-700 text-xs"
                    title="Kuponu kaldır"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}

          {/* <!-- subtotal after discount --> */}
          {totalDiscount > 0 && (
            <div className="flex items-center justify-between py-3 border-b border-gray-3">
              <div>
                <p className="text-dark">İndirimli Ara Toplam</p>
              </div>
              <div>
                <p className="text-dark text-right">
                  {formatPrice(subtotalAfterDiscount)}
                </p>
              </div>
            </div>
          )}

          {/* <!-- tax --> */}
          <div className="flex items-center justify-between py-3 border-b border-gray-3">
            <div>
              <p className="text-dark">KDV (%18)</p>
            </div>
            <div>
              <p className="text-dark text-right">
                {formatPrice(tax)}
              </p>
            </div>
          </div>

          {/* <!-- shipping --> */}
          <div className="flex items-center justify-between py-3 border-b border-gray-3">
            <div>
              <p className="text-dark">Kargo</p>
              {subtotalAfterDiscount >= 1000 && (
                <p className="text-xs text-green-600">1000 TL üstü ücretsiz!</p>
              )}
            </div>
            <div>
              <p className="text-dark text-right">
                {shipping > 0 ? formatPrice(shipping) : 'Ücretsiz'}
              </p>
            </div>
          </div>

          {/* <!-- total --> */}
          <div className="flex items-center justify-between pt-5">
            <div>
              <p className="font-medium text-lg text-dark">Toplam</p>
            </div>
            <div>
              <p className="font-medium text-lg text-dark text-right">
                {formatPrice(total)}
              </p>
            </div>
          </div>

          {/* <!-- discount code input --> */}
          {!discountCode && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600 mb-2">İndirim kuponunuz var mı?</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Kupon kodu"
                  className="flex-1 text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue/20"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      applyDiscountCode(e.currentTarget.value);
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Kupon kodu"]') as HTMLInputElement;
                    if (input) applyDiscountCode(input.value);
                  }}
                  disabled={applyingCoupon}
                  className="text-sm bg-blue text-white px-3 py-2 rounded hover:bg-blue-dark transition-colors disabled:opacity-50"
                >
                  {applyingCoupon ? 'Uygulanıyor...' : 'Uygula'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Test: indirim10 (%10), indirim50tl (50 TL)
              </p>
            </div>
          )}

          {/* <!-- checkout button --> */}
          {CheckoutButton()}

          {/* Bilgi mesajları */}
          <div className="mt-4 space-y-2">
            <div className="text-xs text-gray-500 text-center">
              <p>• Güvenli ödeme sistemi</p>
              <p>• Hızlı kargo seçenekleri</p>
              <p>• 30 gün iade garantisi</p>
              <p className="text-green-600 font-medium">• 1000 TL üstü kargo ücretsiz!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
