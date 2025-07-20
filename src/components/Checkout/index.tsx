"use client";
import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Breadcrumb from "../Common/Breadcrumb";
import Login from "./Login";
import AddressSelector from "./AddressSelector";
import Shipping from "./Shipping";
import PaymentMethod from "./PaymentMethod";
import Billing from "./Billing";
import { cartService, type Cart as CartType } from "@/services/cartService";
import { orderService } from "@/services/orderService";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/authStore";
import { useCart } from "@/hooks/useCart";
import { type Address as UserAddress } from "@/services/addressService";
import { checkoutSchema, type CheckoutFormData } from "@/lib/validations";
import FormField from "@/components/Common/FormField";
import { useDispatch } from "react-redux";
import { removeAllItemsFromCart } from "@/redux/features/cart-slice";
import Image from "next/image";
import { getImageUrl } from "@/utils/apiUtils";

interface OrderAddress {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

const normalizePhone = (phone: string) => {
  if (!phone) return '';
  if (phone.startsWith('0') && phone.length === 11) {
    return '90' + phone.substring(1);
  }
  if (phone.startsWith('+')) {
    return phone.substring(1);
  }
  return phone;
};

const Checkout = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { cart: serverCart, refreshCart, clearCart } = useCart();
  const dispatch = useDispatch();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLoginForm, setShowLoginForm] = useState(false);

  const [selectedShippingAddress, setSelectedShippingAddress] = useState<UserAddress | null>(null);
  const [selectedBillingAddress, setSelectedBillingAddress] = useState<UserAddress | null>(null);
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  
  // manuel inpu
  const userModifiedFields = useRef<Set<string>>(new Set());

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset,
    trigger
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onChange',
    defaultValues: {
      customerInfo: {
        email: user?.email || '',
        phone: user?.phone || '',
        firstName: user?.firstName || '',
        lastName: user?.lastName || ''
      },
      addresses: {
        shipping: {
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          company: '',
          address1: '',
          address2: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'Türkiye',
          phone: user?.phone || ''
        },
        billing: {
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          company: '',
          address1: '',
          address2: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'Türkiye',
          phone: user?.phone || ''
        }
      },
      paymentMethod: 'credit_card',
      sameAsShipping: true,
      notes: ''
    }
  });

  const watchedValues = watch();
  const sameAsShipping = watchedValues.sameAsShipping;

  // Form validasyonunu manuel olarak kontrol et
  const isFormValid = () => {
    if (!watchedValues.customerInfo.email || !watchedValues.customerInfo.firstName || !watchedValues.customerInfo.lastName) {
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(watchedValues.customerInfo.email)) {
      return false;
    }
    
    const shipping = watchedValues.addresses.shipping;
    if (!shipping.firstName || !shipping.lastName || !shipping.address1 || !shipping.city || !shipping.state || !shipping.postalCode) {
      return false;
    }
    
    if (!/^[0-9]+$/.test(shipping.postalCode)) {
      return false;
    }
    
    if (!sameAsShipping) {
      const billing = watchedValues.addresses.billing;
      if (!billing.firstName || !billing.lastName || !billing.address1 || !billing.city || !billing.state || !billing.postalCode) {
        return false;
      }
      
      if (!/^[0-9]+$/.test(billing.postalCode)) {
        return false;
      }
    }
    
    return true;
  };

  useEffect(() => {
    if (sameAsShipping && watchedValues.addresses.shipping) {
      setValue('addresses.billing', watchedValues.addresses.shipping);
    }
  }, [sameAsShipping, watchedValues.addresses.shipping, setValue]);

  useEffect(() => {
    if (sameAsShipping && selectedShippingAddress) {
      setValue('addresses.billing', {
        ...selectedShippingAddress
      });
    }
  }, [selectedShippingAddress, setValue]);

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    resetUserModifiedFields();
  }, [isAuthenticated]);

  const displayCart = serverCart || {
    items: [],
    totals: { subtotal: 0, discount: 0, tax: 0, shipping: 0, total: 0 },
  };
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

  const subtotalAfterDiscount = subtotal - backendDiscount;

  // Debug: Cart totals
  useEffect(() => {
    if (serverCart) {
      console.log('DEBUG - serverCart totals:', serverCart.totals);
      console.log('DEBUG - subtotal value:', serverCart.totals.subtotal);
      console.log('DEBUG - items:', serverCart.items);
      console.log('DEBUG - subtotalAfterDiscount:', subtotalAfterDiscount);
    }
  }, [serverCart, subtotalAfterDiscount]);

  useEffect(() => {
    if (user && isAuthenticated) {
      if (!userModifiedFields.current.has('customerInfo.email')) {
        setValue('customerInfo.email', user.email || '');
      }
      if (!userModifiedFields.current.has('customerInfo.phone')) {
        setValue('customerInfo.phone', normalizePhone(user.phone || ''));
      }
      if (!userModifiedFields.current.has('customerInfo.firstName')) {
        setValue('customerInfo.firstName', user.firstName || '');
      }
      if (!userModifiedFields.current.has('customerInfo.lastName')) {
        setValue('customerInfo.lastName', user.lastName || '');
      }
      
      // Adres bilgileri
      if (!userModifiedFields.current.has('addresses.shipping.firstName')) {
        setValue('addresses.shipping.firstName', user.firstName || '');
      }
      if (!userModifiedFields.current.has('addresses.shipping.lastName')) {
        setValue('addresses.shipping.lastName', user.lastName || '');
      }
      if (!userModifiedFields.current.has('addresses.shipping.phone')) {
        setValue('addresses.shipping.phone', normalizePhone(user.phone || ''));
      }
      
      if (!userModifiedFields.current.has('addresses.billing.firstName')) {
        setValue('addresses.billing.firstName', user.firstName || '');
      }
      if (!userModifiedFields.current.has('addresses.billing.lastName')) {
        setValue('addresses.billing.lastName', user.lastName || '');
      }
      if (!userModifiedFields.current.has('addresses.billing.phone')) {
        setValue('addresses.billing.phone', normalizePhone(user.phone || ''));
      }
    }
  }, [user, isAuthenticated, setValue]);

  useEffect(() => {
    if (selectedShippingAddress) {
      setValue('addresses.shipping', {
        firstName: selectedShippingAddress.firstName,
        lastName: selectedShippingAddress.lastName,
        company: selectedShippingAddress.company || '',
        address1: selectedShippingAddress.address1,
        address2: selectedShippingAddress.address2 || '',
        city: selectedShippingAddress.city,
        state: selectedShippingAddress.state,
        postalCode: selectedShippingAddress.postalCode,
        country: selectedShippingAddress.country,
        phone: selectedShippingAddress.phone || ''
      });
      
      setTimeout(() => {
        trigger(['addresses.shipping', 'addresses.billing']);
      }, 100);
    }
  }, [selectedShippingAddress, setValue, trigger]);

  useEffect(() => {
    if (selectedBillingAddress) {
      setValue('addresses.billing', {
        firstName: selectedBillingAddress.firstName,
        lastName: selectedBillingAddress.lastName,
        company: selectedBillingAddress.company || '',
        address1: selectedBillingAddress.address1,
        address2: selectedBillingAddress.address2 || '',
        city: selectedBillingAddress.city,
        state: selectedBillingAddress.state,
        postalCode: selectedBillingAddress.postalCode,
        country: selectedBillingAddress.country,
        phone: selectedBillingAddress.phone || ''
      });
      
      setTimeout(() => {
        trigger('addresses.billing');
      }, 100);
    }
  }, [selectedBillingAddress, setValue, trigger]);

  const handleShippingAddressSelect = (address: UserAddress | null) => {
    setSelectedShippingAddress(address);
    setUseCustomAddress(false);
  };

  const handleBillingAddressSelect = (address: UserAddress | null) => {
    setSelectedBillingAddress(address);
  };

  const handleUseCustomAddress = () => {
    setUseCustomAddress(true);
    setSelectedShippingAddress(null);
  };


  const resetUserModifiedFields = () => {
    userModifiedFields.current.clear();
  };

  const loadCart = async () => {
    setLoading(true);
    setError(null);
    try {
      await refreshCart();
    } catch (error: any) {
      console.error('Sepet yükleme hatası:', error);
      setError(error.response?.data?.message || 'Sepet yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field: keyof CheckoutFormData, value: any) => {
    setValue(field as any, value);
  };

  const handleCustomerInfoChange = (field: keyof CheckoutFormData['customerInfo'], value: string) => {
    setValue(`customerInfo.${field}`, value);
    userModifiedFields.current.add(`customerInfo.${field}`);
  };

  const handleAddressChange = (type: 'shipping' | 'billing', field: string, value: string) => {
    setValue(`addresses.${type}.${field}` as any, value);

    userModifiedFields.current.add(`addresses.${type}.${field}`);
  };

  const handleSameAsShippingChange = (checked: boolean) => {
    setValue('sameAsShipping', checked);
    if (checked && watchedValues.addresses.shipping) {
      setValue('addresses.billing', watchedValues.addresses.shipping);
    }
  };

  const handleSubmitForm = async (data: CheckoutFormData) => {
    if (!serverCart || serverCart.items.length === 0) {
      setError('Sepetinizde ürün bulunmamaktadır');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let response;
      
      if (isAuthenticated && user) {
        const orderData = {
          customerInfo: data.customerInfo,
          addresses: {
            shipping: data.addresses.shipping,
            billing: data.addresses.billing
          },
          paymentMethod: data.paymentMethod,
          notes: data.notes,
          sameAsShipping: data.sameAsShipping
        };

        response = await orderService.createOrderFromCart(orderData);
      } else {
        // Misafir kullanıcılar için createGuestOrder kullan
        const orderData = {
          customerInfo: data.customerInfo,
          addresses: {
            shipping: data.addresses.shipping,
            billing: data.addresses.billing
          },
          paymentMethod: data.paymentMethod,
          notes: data.notes,
          sameAsShipping: data.sameAsShipping,
          items: serverCart.items.map(item => ({
            productId: item.product._id,
            variantId: item.variant?._id,
            quantity: item.quantity
          }))
        };

        response = await orderService.createGuestOrder(orderData);
      }
      
      if (response.success) {
        // Önce yönlendirme 
        router.push(`/order-success?orderNumber=${response.data.orderNumber}`);
        
        // Sonra sepet boşalt   //reduxtan temizlem eskiden nasıl çalışıyodu bilmiyorum ama temizlemeden çalışıyordu
        setTimeout(async () => {
          try {
            dispatch(removeAllItemsFromCart());
            
            await clearCart();
          } catch (cartError) {
            console.warn('Sepet temizlenirken hata:', cartError);
          }
        }, 100);
      } else {
        setError(response.message || 'Sipariş oluşturulurken hata oluştu');
      }
    } catch (error: any) {
      console.error('Sipariş hatası:', error);
      setError(error.response?.data?.message || 'Sipariş oluşturulurken hata oluştu');
    } finally {
      setSubmitting(false);
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
        <Breadcrumb title="Ödeme" pages={[
          { name: "Sepet", href: "/cart" },
          { name: "Ödeme" }
        ]} />
        <section className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Sepetiniz yükleniyor...</p>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (error && !serverCart) {
    return (
      <>
        <Breadcrumb title="Ödeme" pages={[
          { name: "Sepet", href: "/cart" },
          { name: "Ödeme" }
        ]} />
        <section className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Hata Oluştu</h2>
                <p className="text-red-600 mb-6">{error}</p>
                <button 
                  onClick={loadCart}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Tekrar Dene
                </button>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {/* SEO Meta */}
      <div className="sr-only">
        <h1>Ödeme Sayfası - Güvenli Alışveriş</h1>
        <p>Güvenli ödeme sayfası. Teslimat ve fatura adreslerinizi girin, ödeme yönteminizi seçin ve siparişinizi tamamlayın.</p>
      </div>

      <Breadcrumb title="Ödeme" pages={[
        { name: "Sepet", href: "/cart" },
        { name: "Ödeme" }
      ]} />
      
      <section className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit(handleSubmitForm)}>
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sol Taraf - Form Alanları */}
              <div className="lg:flex-1">
                {/* Login Box */}
                <Login />

                {/* Billing Details */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
                  <Billing 
                    customerInfo={watchedValues.customerInfo}
                    onChange={handleCustomerInfoChange}
                  />
                </div>

                {/* Address Selection for Authenticated Users */}
                {isAuthenticated && user ? (
                  <>
                    {/* Teslimat Adresi Seçimi */}
                    <div className="mt-6">
                      <AddressSelector
                        title="Teslimat Adresi Seçimi"
                        selectedAddress={selectedShippingAddress}
                        onAddressSelect={handleShippingAddressSelect}
                      />
                    </div>

                    {/* Özel Adres Girişi Seçeneği */}
                    {!selectedShippingAddress && !useCustomAddress && (
                      <div className="mt-4 text-center">
                        <button
                          type="button"
                          onClick={handleUseCustomAddress}
                          className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                          Veya yeni bir adres girin (kaydedilmez)
                        </button>
                      </div>
                    )}

                    {/* Manuel Adres Girişi */}
                    {useCustomAddress && (
                      <div className="mt-6">
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
                          <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <div>
                              <h4 className="font-medium text-orange-800 mb-1">Geçici Adres Girişi</h4>
                              <p className="text-sm text-orange-700">
                                Bu adres kaydedilmeyecek, sadece bu sipariş için kullanılacak.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                          <Shipping 
                            address={watchedValues.addresses.shipping}
                            onChange={(field, value) => handleAddressChange('shipping', field, value)}
                            title="Teslimat Adresi"
                          />
                        </div>
                      </div>
                    )}

                    {/* Fatura Adresi Seçimi (eğer farklı ise) */}
                    {!sameAsShipping && (
                      <div className="mt-6">
                        <AddressSelector
                          title="Fatura Adresi Seçimi"
                          selectedAddress={selectedBillingAddress}
                          onAddressSelect={handleBillingAddressSelect}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Guest Users için Adres Formları */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
                      <Shipping 
                        address={watchedValues.addresses.shipping}
                        onChange={(field, value) => handleAddressChange('shipping', field, value)}
                        title="Teslimat Adresi"
                      />
                    </div>

                    {/* Fatura Adresi (eğer farklı ise) */}
                    {!sameAsShipping && (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
                        <Shipping 
                          address={watchedValues.addresses.billing}
                          onChange={(field, value) => handleAddressChange('billing', field, value)}
                          title="Fatura Adresi"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Same as Shipping Checkbox */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameAsShipping}
                      onChange={(e) => handleSameAsShippingChange(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-900 font-medium">Fatura adresi teslimat adresi ile aynı</span>
                  </label>
                </div>

                {/* Notes */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
                  <div>
                    <label htmlFor="notes" className="block mb-3 font-medium text-gray-900">
                      Sipariş Notları (isteğe bağlı)
                    </label>
                    <textarea
                      name="notes"
                      id="notes"
                      rows={4}
                      value={watchedValues.notes}
                      onChange={(e) => handleFormChange('notes', e.target.value)}
                      placeholder="Siparişiniz hakkında notlar, örn. teslimat için özel notlar."
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-500 outline-none transition-all focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Sağ Taraf - Sipariş Özeti */}
              <div className="lg:w-96">
                <div className="sticky top-8 space-y-6">
                  {/* Order Summary */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-h-[calc(100vh-8rem)]">
                    <div className="border-b border-gray-200 px-6 py-4">
                      <h3 className="font-semibold text-xl text-gray-900">
                        Siparişiniz
                      </h3>
                    </div>

                    <div className="p-6 overflow-y-auto max-h-[calc(100vh-12rem)]">
                    {/* Product Items */}
                    <div className="space-y-4 mb-6">
                      {serverCart?.items.map((item, key) => (
                        <div key={key} className="flex gap-4 py-3 border-b border-gray-100 last:border-b-0">
                          <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <Image 
                              src={getImageUrl(item.product.images?.[0]?.url || "")} 
                              alt={item.product.name} 
                              fill
                              className="object-contain p-2"
                              sizes="64px"
                              loading="lazy"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                              {item.product.name}
                            </h4>
                            {item.variant && (
                              <p className="text-xs text-gray-500 mt-1">
                                {item.variant.name}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              Miktar: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              {formatPrice(item.total)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-3 border-t border-gray-200 pt-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Ara Toplam</span>
                        <span className="font-medium text-gray-900">
                          {subtotal > 0 ? formatPrice(subtotal) : ''}
                        </span>
                      </div>

                      {backendDiscount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">İndirim</span>
                          <span className="font-medium text-green-600">
                            -{formatPrice(backendDiscount)}
                          </span>
                        </div>
                      )}

                      {backendDiscount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">İndirimli Ara Toplam</span>
                          <span className="font-medium text-gray-900">
                            {subtotalAfterDiscount > 0 ? formatPrice(subtotalAfterDiscount) : ''}
                          </span>
                        </div>
                      )}

                      {tax > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">KDV (%18)</span>
                          <span className="font-medium text-gray-900">
                            {formatPrice(tax)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-sm">
                        <div>
                          <span className="text-gray-600">Kargo</span>
                          {subtotalAfterDiscount >= 1000 && (
                            <p className="text-xs text-green-600 mt-1">
                              1000 TL üstü ücretsiz!
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          {subtotalAfterDiscount >= 1000 ? (
                            <span className="text-green-600 font-medium">
                              Ücretsiz
                            </span>
                          ) : (
                            <span className="font-medium text-gray-900">
                              {shipping > 0 ? formatPrice(shipping) : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-3">
                        <span className="text-gray-900">Toplam</span>
                        <span className="text-gray-900">
                          {total > 0 ? formatPrice(total) : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
                  <PaymentMethod 
                    selectedMethod={watchedValues.paymentMethod}
                    onChange={(method) => handleFormChange('paymentMethod', method)}
                  />
                </div>

                {/* Error Messages */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-6">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                {/* Form Validation Errors */}
                {Object.keys(errors).length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-6">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div className="text-red-600 text-sm">
                        <p className="font-medium mb-2">Lütfen aşağıdaki hataları düzeltin:</p>
                        <ul className="space-y-1">
                          {errors.customerInfo?.email && <li>• {errors.customerInfo.email.message}</li>}
                          {errors.customerInfo?.phone && <li>• {errors.customerInfo.phone.message}</li>}
                          {errors.customerInfo?.firstName && <li>• {errors.customerInfo.firstName.message}</li>}
                          {errors.customerInfo?.lastName && <li>• {errors.customerInfo.lastName.message}</li>}
                          {errors.addresses?.shipping?.firstName && <li>• Teslimat adresi: {errors.addresses.shipping.firstName.message}</li>}
                          {errors.addresses?.shipping?.lastName && <li>• Teslimat adresi: {errors.addresses.shipping.lastName.message}</li>}
                          {errors.addresses?.shipping?.address1 && <li>• Teslimat adresi: {errors.addresses.shipping.address1.message}</li>}
                          {errors.addresses?.shipping?.city && <li>• Teslimat adresi: {errors.addresses.shipping.city.message}</li>}
                          {errors.addresses?.shipping?.state && <li>• Teslimat adresi: {errors.addresses.shipping.state.message}</li>}
                          {errors.addresses?.shipping?.postalCode && <li>• Teslimat adresi: {errors.addresses.shipping.postalCode.message}</li>}
                          {errors.addresses?.shipping?.country && <li>• Teslimat adresi: {errors.addresses.shipping.country.message}</li>}
                          {errors.addresses?.shipping?.phone && <li>• Teslimat adresi: {errors.addresses.shipping.phone.message}</li>}
                          {!sameAsShipping && errors.addresses?.billing?.firstName && <li>• Fatura adresi: {errors.addresses.billing.firstName.message}</li>}
                          {!sameAsShipping && errors.addresses?.billing?.lastName && <li>• Fatura adresi: {errors.addresses.billing.lastName.message}</li>}
                          {!sameAsShipping && errors.addresses?.billing?.address1 && <li>• Fatura adresi: {errors.addresses.billing.address1.message}</li>}
                          {!sameAsShipping && errors.addresses?.billing?.city && <li>• Fatura adresi: {errors.addresses.billing.city.message}</li>}
                          {!sameAsShipping && errors.addresses?.billing?.state && <li>• Fatura adresi: {errors.addresses.billing.state.message}</li>}
                          {!sameAsShipping && errors.addresses?.billing?.postalCode && <li>• Fatura adresi: {errors.addresses.billing.postalCode.message}</li>}
                          {!sameAsShipping && errors.addresses?.billing?.country && <li>• Fatura adresi: {errors.addresses.billing.country.message}</li>}
                          {!sameAsShipping && errors.addresses?.billing?.phone && <li>• Fatura adresi: {errors.addresses.billing.phone.message}</li>}
                          {errors.paymentMethod && <li>• {errors.paymentMethod.message}</li>}
                          {errors.notes && <li>• {errors.notes.message}</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Checkout Button */}
                <button
                  type="submit"
                  disabled={submitting || !serverCart || serverCart.items.length === 0 || !isFormValid() || Object.keys(errors).length > 0}
                  className="w-full flex justify-center items-center gap-2 font-medium text-white bg-blue py-4 px-6 rounded-xl transition-all duration-200 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      İşleniyor...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Siparişi Tamamla
                    </>
                  )}
                </button>

                {/* Debug Information */}
                {/* {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs">
                    <p><strong>Debug Info:</strong></p>
                    <p>submitting: {submitting.toString()}</p>
                    <p>serverCart exists: {!!serverCart}</p>
                    <p>cart items length: {serverCart?.items?.length || 0}</p>
                    <p>isValid (react-hook-form): {isValid.toString()}</p>
                    <p>isFormValid (manual): {isFormValid().toString()}</p>
                    <p>errors count: {Object.keys(errors).length}</p>
                    <p>button disabled: {(submitting || !serverCart || serverCart?.items?.length === 0 || !isFormValid() || Object.keys(errors).length > 0).toString()}</p>
                    <p><strong>Form Values:</strong></p>
                    <p>Email: {watchedValues.customerInfo.email || 'empty'} {watchedValues.customerInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watchedValues.customerInfo.email) ? '(invalid)' : ''}</p>
                    <p>FirstName: {watchedValues.customerInfo.firstName || 'empty'}</p>
                    <p>LastName: {watchedValues.customerInfo.lastName || 'empty'}</p>
                    <p>Shipping Address1: {watchedValues.addresses.shipping.address1 || 'empty'}</p>
                    <p>Shipping City: {watchedValues.addresses.shipping.city || 'empty'}</p>
                    <p>Shipping State: {watchedValues.addresses.shipping.state || 'empty'}</p>
                    <p>Shipping PostalCode: {watchedValues.addresses.shipping.postalCode || 'empty'} {watchedValues.addresses.shipping.postalCode && !/^[0-9]+$/.test(watchedValues.addresses.shipping.postalCode) ? '(invalid)' : ''}</p>
                    <p><strong>Validation Checks:</strong></p>
                    <p>Email valid: {!!(watchedValues.customerInfo.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watchedValues.customerInfo.email))}</p>
                    <p>Name valid: {!!(watchedValues.customerInfo.firstName && watchedValues.customerInfo.lastName)}</p>
                    <p>Shipping address valid: {!!(watchedValues.addresses.shipping.firstName && watchedValues.addresses.shipping.lastName && watchedValues.addresses.shipping.address1 && watchedValues.addresses.shipping.city && watchedValues.addresses.shipping.state && watchedValues.addresses.shipping.postalCode)}</p>
                    <p>Postal code valid: {!!(watchedValues.addresses.shipping.postalCode && /^[0-9]+$/.test(watchedValues.addresses.shipping.postalCode))}</p>
                  </div>
                )} */}
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Checkout;
