import React, { useState } from "react";
import { cartService, type Cart as CartType } from "@/services/cartService";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import toast from "react-hot-toast";

const OrderSummary = () => {
  const { cart: serverCart, loading, refreshCart } = useCart();
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(price);
  };

  const displayCart = serverCart || {
    items: [],
    totals: { subtotal: 0, discount: 0, tax: 0, shipping: 0, total: 0 },
  };
  const items = displayCart.items || [];
  const totals = displayCart.totals || {
    subtotal: 0,
    discount: 0,
    tax: 0,
    shipping: 0,
    total: 0,
  };

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

        if (response.data.discountType === "percentage") {
          setDiscountPercentage(10);
        } else {
          setDiscountPercentage(0);
        }

        refreshCart();
        toast.success("Kupon kodu başarıyla uygulandı!");
      }
    } catch (error: any) {
      toast.error(error.message || "Kupon kodu uygulanırken hata oluştu!");
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
        toast.success("Kupon kodu kaldırıldı!");
      }
    } catch (error: any) {
      toast.error(error.message || "Kupon kaldırılırken hata oluştu!");
    }
  };

  const hasOutOfStockItems = items?.some((item: any) => {
    let stock = item.product?.stock || 0;
    if (item.variant && item.product?.variants) {
      const variant = item.product.variants.find(
        (v: any) => v._id === item.variant
      );
      stock = variant?.stock || 0;
    }
    return stock === 0;
  });

  const CheckoutButton = () => {
    if (hasOutOfStockItems) {
      return (
        <button
          disabled
          className="w-full flex justify-center items-center font-medium text-white bg-gray-400 py-3 px-6 rounded-lg cursor-not-allowed mt-6 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          Tükendi Ürünler Var
        </button>
      );
    }

    return (
      <Link
        href="/checkout"
        className="w-full flex justify-center items-center font-medium text-gray bg-blue py-3 px-6 rounded-lg hover:bg-blue transition-colors mt-6"
      >
        <svg
          width="24px"
          height="24px"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="16.5" cy="18.5" r="1.5" />
          <circle cx="9.5" cy="18.5" r="1.5" />
          <path d="M18 16H8a1 1 0 0 1-.958-.713L4.256 6H3a1 1 0 0 1 0-2h2a1 1 0 0 1 .958.713L6.344 6H21a1 1 0 0 1 .937 1.352l-3 8A1 1 0 0 1 18 16zm-9.256-2h8.563l2.25-6H6.944z" />
        </svg>
        Ödemeye Geç
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="bg-white shadow-sm rounded-xl border border-gray-200">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-lg text-gray-900">Sipariş Özeti</h3>
          <p className="text-sm text-gray-600 mt-1">{items.length} ürün</p>
        </div>

        <div className="p-6">
          <div className="space-y-4 mb-6">
            {items.map((item: any, key: number) => (
              <div
                key={key}
                className="flex items-start justify-between py-3 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.product?.name || item.title || item.name}
                  </p>
                  {item.variant && (
                    <p className="text-xs text-gray-500 mt-1">
                      {(() => {
                        if (item.product?.variants) {
                          const variant = item.product.variants.find(
                            (v: any) => v._id === item.variant
                          );
                          return variant?.name || "Varyasyon";
                        }
                        return "Varyasyon";
                      })()}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Miktar: {item.quantity}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <p className="text-sm font-medium text-gray-900">
                    {formatPrice(item.total || 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Ara Toplam</span>
              <span className="text-sm font-medium text-gray-900">
                {subtotal && subtotal > 0 ? formatPrice(subtotal) : ''}
              </span>
            </div>

            {totalDiscount > 0 && (
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-green-600 font-medium">
                    İndirim
                  </span>
                  {discountCode && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      {discountCode}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-green-600 font-medium">
                    -{formatPrice(totalDiscount)}
                  </span>
                  {discountCode && (
                    <button
                      onClick={removeDiscountCode}
                      className="text-red-500 hover:text-red-700 text-xs p-1 rounded-full hover:bg-red-50 transition-colors"
                      title="Kuponu kaldır"
                    >
                      <svg
                        className="w-3 h-3"
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
                  )}
                </div>
              </div>
            )}

            {totalDiscount > 0 && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">
                  İndirimli Ara Toplam
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {subtotalAfterDiscount && subtotalAfterDiscount > 0 ? formatPrice(subtotalAfterDiscount) : ''}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">KDV (%18)</span>
              <span className="text-sm font-medium text-gray-900">
                {tax && tax > 0 ? formatPrice(tax) : ''}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <span className="text-sm text-gray-600">Kargo</span>
                {subtotalAfterDiscount >= 1000 && (
                  <p className="text-xs text-green-600 mt-1">
                    1000 TL üstü ücretsiz!
                  </p>
                )}
              </div>
              <div className="text-right">
                {subtotalAfterDiscount >= 1000 ? (
                  <span className="text-sm text-green-600 font-medium">
                    Ücretsiz
                  </span>
                ) : (
                  <span className="text-sm font-medium text-gray-900">
                    {shipping && shipping > 0 ? formatPrice(shipping) : ''}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between py-4 border-t border-gray-200 mt-4">
              <span className="text-lg font-bold text-gray-900">Toplam</span>
              <span className="text-lg font-bold text-gray-900">
                {total && total > 0 ? formatPrice(total) : ''}
              </span>
            </div>
          </div>

          <CheckoutButton />

          {/* Test: Kupon Kaldırma Butonu */}
          {totalDiscount > 0 && (
            <div className="mt-4">
              <button
                onClick={removeDiscountCode}
                className="w-full px-4 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                Test: Kupon Kodunu Kaldır
              </button>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span>Güvenli Ödeme</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
