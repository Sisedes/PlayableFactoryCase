"use client";
import React, { useState, useEffect } from "react";
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
  const { cart: serverCart, refreshCart } = useCart();
  const dispatch = useDispatch();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLoginForm, setShowLoginForm] = useState(false);

  const [selectedShippingAddress, setSelectedShippingAddress] = useState<UserAddress | null>(null);
  const [selectedBillingAddress, setSelectedBillingAddress] = useState<UserAddress | null>(null);
  const [useCustomAddress, setUseCustomAddress] = useState(false);

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

  useEffect(() => {
    if (sameAsShipping && watchedValues.addresses.shipping) {
      setValue('addresses.billing', watchedValues.addresses.shipping);
    }
  }, [sameAsShipping, watchedValues.addresses.shipping, setValue]);

  useEffect(() => {
    if (sameAsShipping && watchedValues.addresses.shipping) {
      setValue('addresses.billing', watchedValues.addresses.shipping);
    }
  }, [watchedValues.addresses.shipping, sameAsShipping, setValue]);

  useEffect(() => {
    if (sameAsShipping && selectedShippingAddress) {
      setValue('addresses.billing', {
        ...selectedShippingAddress
      });
    }
  }, [sameAsShipping, selectedShippingAddress, setValue]);

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    if (user && isAuthenticated) {
      setValue('customerInfo', {
        email: user.email || '',
        phone: normalizePhone(user.phone || ''),
        firstName: user.firstName || '',
        lastName: user.lastName || ''
      });
      setValue('addresses.shipping', {
        ...watchedValues.addresses.shipping,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: normalizePhone(user.phone || '')
      });
      setValue('addresses.billing', {
        ...watchedValues.addresses.billing,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: normalizePhone(user.phone || '')
      });
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    if (selectedShippingAddress) {
      console.log('Shipping address selected:', selectedShippingAddress);
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
      
      if (sameAsShipping) {
        console.log('Updating billing address to match shipping');
        setValue('addresses.billing', {
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
      }
      
      setTimeout(() => {
        trigger(['addresses.shipping', 'addresses.billing']);
      }, 100);
    }
      }, [selectedShippingAddress, sameAsShipping, setValue, trigger]);

  useEffect(() => {
    if (selectedBillingAddress) {
      console.log('Billing address selected:', selectedBillingAddress);
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
        trigger(['addresses.billing']);
      }, 100);
    }
  }, [selectedBillingAddress, setValue, trigger]);

  const handleShippingAddressSelect = (address: UserAddress | null) => {
    setSelectedShippingAddress(address);
    if (address) {
      setUseCustomAddress(false);
    }
  };

  const handleBillingAddressSelect = (address: UserAddress | null) => {
    setSelectedBillingAddress(address);
    if (address) {
      setValue('sameAsShipping', false);
    }
  };

  const handleUseCustomAddress = () => {
    setUseCustomAddress(true);
    setSelectedShippingAddress(null);
    setSelectedBillingAddress(null);
  };

  const loadCart = async () => {
    try {
      setLoading(true);
      if (!serverCart) {
        await refreshCart();
      }
      
      if (serverCart && serverCart.items.length === 0) {
        router.push('/cart');
        return;
      }
    } catch (err) {
      console.error('Sepet yüklenirken hata:', err);
      setError('Sepet yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field: keyof CheckoutFormData, value: any) => {
    setValue(field, value);
  };

  const handleCustomerInfoChange = (field: keyof CheckoutFormData['customerInfo'], value: string) => {
    setValue(`customerInfo.${field}`, value);
  };

  const handleAddressChange = (type: 'shipping' | 'billing', field: string, value: string) => {
    if (type === 'shipping') {
      setValue(`addresses.shipping.${field as keyof CheckoutFormData['addresses']['shipping']}`, value);
    } else {
      setValue(`addresses.billing.${field as keyof CheckoutFormData['addresses']['billing']}`, value);
    }
  };

  const handleSameAsShippingChange = (checked: boolean) => {
    setValue('sameAsShipping', checked);
    if (checked) {
      setValue('addresses.billing', watchedValues.addresses.shipping);
    }
  };

  const handleSubmitForm = async (data: CheckoutFormData) => {
    console.log('Form submit başladı');
    console.log('Form data:', data);
    console.log('Server cart:', serverCart);
    console.log('Cart items length:', serverCart?.items?.length);
    
    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      console.log('Token exists:', !!token);
      console.log('User authenticated:', isAuthenticated);
      
      let orderResponse;

      if (isAuthenticated) {
        orderResponse = await orderService.createOrderFromCart({
          customerInfo: {
            email: data.customerInfo.email,
            phone: data.customerInfo.phone || '',
            firstName: data.customerInfo.firstName,
            lastName: data.customerInfo.lastName
          },
          addresses: {
            shipping: {
              firstName: data.addresses.shipping.firstName,
              lastName: data.addresses.shipping.lastName,
              company: data.addresses.shipping.company || '',
              address1: data.addresses.shipping.address1,
              address2: data.addresses.shipping.address2 || '',
              city: data.addresses.shipping.city,
              state: data.addresses.shipping.state,
              postalCode: data.addresses.shipping.postalCode,
              country: data.addresses.shipping.country,
              phone: data.addresses.shipping.phone || ''
            },
            billing: {
              firstName: data.addresses.billing.firstName,
              lastName: data.addresses.billing.lastName,
              company: data.addresses.billing.company || '',
              address1: data.addresses.billing.address1,
              address2: data.addresses.billing.address2 || '',
              city: data.addresses.billing.city,
              state: data.addresses.billing.state,
              postalCode: data.addresses.billing.postalCode,
              country: data.addresses.billing.country,
              phone: data.addresses.billing.phone || ''
            }
          },
          paymentMethod: data.paymentMethod,
          notes: data.notes,
          sameAsShipping: data.sameAsShipping
        });
      } else {
        const orderItems = serverCart?.items.map(item => ({
          productId: item.product._id,
          variantId: item.variant?._id,
          quantity: item.quantity
        })) || [];

        orderResponse = await orderService.createGuestOrder({
          customerInfo: {
            email: data.customerInfo.email,
            phone: data.customerInfo.phone || '',
            firstName: data.customerInfo.firstName,
            lastName: data.customerInfo.lastName
          },
          items: orderItems,
          addresses: {
            shipping: {
              firstName: data.addresses.shipping.firstName,
              lastName: data.addresses.shipping.lastName,
              company: data.addresses.shipping.company || '',
              address1: data.addresses.shipping.address1,
              address2: data.addresses.shipping.address2 || '',
              city: data.addresses.shipping.city,
              state: data.addresses.shipping.state,
              postalCode: data.addresses.shipping.postalCode,
              country: data.addresses.shipping.country,
              phone: data.addresses.shipping.phone || ''
            },
            billing: {
              firstName: data.addresses.billing.firstName,
              lastName: data.addresses.billing.lastName,
              company: data.addresses.billing.company || '',
              address1: data.addresses.billing.address1,
              address2: data.addresses.billing.address2 || '',
              city: data.addresses.billing.city,
              state: data.addresses.billing.state,
              postalCode: data.addresses.billing.postalCode,
              country: data.addresses.billing.country,
              phone: data.addresses.billing.phone || ''
            }
          },
          paymentMethod: data.paymentMethod,
          notes: data.notes,
          sameAsShipping: data.sameAsShipping
        });
      }

      if (orderResponse.success) {
        try {
          await cartService.clearCart();
          await refreshCart();
          
          cartService.clearLocalStorage();
          
          dispatch(removeAllItemsFromCart());
        } catch (error) {
          console.warn('Sepet temizleme hatası:', error);
        }
        
        router.push(`/order-success?orderNumber=${orderResponse.data?.orderNumber}`);
      } else {
        setError(orderResponse.message || 'Sipariş oluşturulamadı');
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
        <Breadcrumb title={"Ödeme"} pages={[
          { name: "Sepet", href: "/cart" },
          { name: "Ödeme" }
        ]} />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue"></div>
        </div>
      </>
    );
  }

  if (error && !serverCart) {
    return (
      <>
        <Breadcrumb title={"Ödeme"} pages={[
          { name: "Sepet", href: "/cart" },
          { name: "Ödeme" }
        ]} />
        <div className="text-center mt-8">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={loadCart}
            className="text-blue hover:underline"
          >
            Tekrar Dene
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title={"Ödeme"} pages={[
        { name: "Sepet", href: "/cart" },
        { name: "Ödeme" }
      ]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form onSubmit={handleSubmit(handleSubmitForm)}>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              {/* <!-- checkout left --> */}
              <div className="lg:max-w-[670px] w-full">
                {/* <!-- login box --> */}
                <Login />

                {/* <!-- billing details --> */}
                <Billing 
                  customerInfo={watchedValues.customerInfo}
                  onChange={handleCustomerInfoChange}
                />

                {/* <!-- address selection for authenticated users --> */}
                {isAuthenticated ? (
                  <>
                    {/* Teslimat Adresi Seçimi */}
                    <div className="mt-7.5">
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
                          onClick={handleUseCustomAddress}
                          className="text-blue hover:text-blue-dark font-medium"
                        >
                          Veya yeni bir adres girin (kaydedilmez)
                        </button>
                      </div>
                    )}

                    {/* Manuel Adres Girişi */}
                    {useCustomAddress && (
                      <div className="mt-7.5">
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
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
                        
                        <Shipping 
                          address={watchedValues.addresses.shipping}
                          onChange={(field, value) => handleAddressChange('shipping', field, value)}
                          title="Teslimat Adresi"
                        />
                      </div>
                    )}

                    {/* Fatura Adresi Seçimi (eğer farklı ise) */}
                    {!sameAsShipping && (
                      <div className="mt-7.5">
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
                    {/* <!-- address box two for guest users --> */}
                    <Shipping 
                      address={watchedValues.addresses.shipping}
                      onChange={(field, value) => handleAddressChange('shipping', field, value)}
                      title="Teslimat Adresi"
                    />

                    {/* <!-- billing address if different --> */}
                    {!sameAsShipping && (
                      <Shipping 
                        address={watchedValues.addresses.billing}
                        onChange={(field, value) => handleAddressChange('billing', field, value)}
                        title="Fatura Adresi"
                      />
                    )}
                  </>
                )}

                {/* <!-- same as shipping checkbox --> */}
                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameAsShipping}
                      onChange={(e) => handleSameAsShippingChange(e.target.checked)}
                      className="w-4 h-4 text-blue border-gray-3 rounded focus:ring-blue"
                    />
                    <span className="text-dark">Fatura adresi teslimat adresi ile aynı</span>
                  </label>
                </div>

                {/* <!-- others note box --> */}
                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                  <div>
                    <label htmlFor="notes" className="block mb-2.5">
                      Sipariş Notları (isteğe bağlı)
                    </label>

                    <textarea
                      name="notes"
                      id="notes"
                      rows={5}
                      value={watchedValues.notes}
                      onChange={(e) => handleFormChange('notes', e.target.value)}
                      placeholder="Siparişiniz hakkında notlar, örn. teslimat için özel notlar."
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* <!-- checkout right --> */}
              <div className="max-w-[455px] w-full">
                {/* <!-- order list box --> */}
                <div className="bg-white shadow-1 rounded-[10px]">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">
                      Siparişiniz
                    </h3>
                  </div>

                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                    {/* <!-- title --> */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <div>
                        <h4 className="font-medium text-dark">Ürün</h4>
                      </div>
                      <div>
                        <h4 className="font-medium text-dark text-right">
                          Ara Toplam
                        </h4>
                      </div>
                    </div>

                    {/* <!-- product items --> */}
                    {serverCart?.items.map((item, key) => (
                      <div key={key} className="flex items-center justify-between py-5 border-b border-gray-3">
                        <div className="flex-1">
                          <p className="text-dark text-sm">
                            {item.product.name}
                          </p>
                          {item.variant && (
                            <p className="text-xs text-gray-500 mt-1">
                              {item.variant.name}
                            </p>
                          )}
                          <p className="text-xs text-gray-400">
                            Miktar: {item.quantity}
                          </p>
                        </div>
                        <div>
                          <p className="text-dark text-right">
                            {formatPrice(item.total)}
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
                          {formatPrice(serverCart?.totals.subtotal || 0)}
                        </p>
                      </div>
                    </div>

                    {/* <!-- tax --> */}
                    {serverCart?.totals.tax && serverCart.totals.tax > 0 && (
                      <div className="flex items-center justify-between py-3 border-b border-gray-3">
                        <div>
                          <p className="text-dark">KDV (%18)</p>
                        </div>
                        <div>
                          <p className="text-dark text-right">
                            {formatPrice(serverCart.totals.tax)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* <!-- shipping --> */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-3">
                      <div>
                        <p className="text-dark">Kargo</p>
                      </div>
                      <div>
                        <p className="text-dark text-right">
                          {serverCart?.totals.shipping && serverCart.totals.shipping > 0 ? formatPrice(serverCart.totals.shipping) : 'Ücretsiz'}
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
                          {formatPrice(serverCart?.totals.total || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* <!-- payment box --> */}
                <PaymentMethod 
                  selectedMethod={watchedValues.paymentMethod}
                  onChange={(method) => handleFormChange('paymentMethod', method)}
                />

                {/* <!-- error message --> */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {/* <!-- validation errors --> */}
                {Object.keys(errors).length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-4">
                    <p className="text-yellow-800 text-sm font-medium mb-2">Form hataları:</p>
                    <ul className="text-yellow-700 text-sm space-y-1">
                      {Object.entries(errors).map(([field, error]) => {
                        if (error?.message) {
                          return (
                            <li key={field}>
                              <strong>{field}:</strong> {error.message}
                            </li>
                          );
                        }
                        if (typeof error === 'object' && error !== null) {
                          return Object.entries(error).map(([subField, subError]: [string, any]) => (
                            <li key={`${field}.${subField}`}>
                              <strong>{field}.{subField}:</strong> {subError?.message}
                            </li>
                          ));
                        }
                        return null;
                      })}
                    </ul>
                    <p className="text-yellow-600 text-xs mt-2">Form geçerli değil, lütfen hataları düzeltin.</p>
                  </div>
                )}

                {/* <!-- checkout button --> */}
                <button
                  type="submit"
                  disabled={submitting || !serverCart || serverCart.items.length === 0}
                  className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={async () => {
                    console.log('Submit button clicked');
                    console.log('Form errors:', errors);
                    console.log('Form is valid:', isValid);
                    console.log('Form is disabled:', submitting || !serverCart || serverCart.items.length === 0);
                    
                    const isValidForm = await trigger();
                    console.log('Manual validation result:', isValidForm);
                    
                    if (!isValidForm) {
                      console.log('Form validation failed, errors:', errors);
                    }
                  }}
                >
                  {submitting ? 'İşleniyor...' : 'Siparişi Tamamla'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Checkout;
