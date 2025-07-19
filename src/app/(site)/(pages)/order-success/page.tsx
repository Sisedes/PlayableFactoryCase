'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumb from '@/components/Common/Breadcrumb';
import { orderService } from '@/services/orderService';

interface OrderDetails {
  _id: string;
  orderNumber: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  items: Array<{
    product: {
      name: string;
      images: Array<{ url: string; alt: string }>;
    };
    quantity: number;
    price: number;
    total: number;
    image?: string;
  }>;
  pricing: {
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
  };
  addresses: {
    shipping: {
      firstName: string;
      lastName: string;
      address1: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  payment: {
    method: string;
    status: string;
  };
  createdAt: string;
}

// Loading Component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue mx-auto mb-4"></div>
      <p className="text-gray-600">Sipariş bilgileri yükleniyor...</p>
    </div>
  </div>
);

// Error Component
const ErrorDisplay = ({ error, orderNumber }: { error: string | null; orderNumber: string | null }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="text-center max-w-md">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Sipariş Bulunamadı</h1>
      <p className="text-gray-600 mb-6">{error || 'Geçersiz sipariş numarası'}</p>
      <Link 
        href="/"
        className="inline-block bg-blue text-white px-6 py-3 rounded-lg hover:bg-blue-dark transition-colors duration-200"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  </div>
);

// Order Item Component
const OrderItem = ({ item, index }: { item: any; index: number }) => (
  <div key={index} className="flex items-center space-x-3 p-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
    <div className="flex-shrink-0">
      {item.product.images && item.product.images[0] && (
        <div className="relative w-12 h-12 rounded-lg overflow-hidden shadow-sm">
          <Image
            src={item.product.images[0].url}
            alt={item.product.images[0].alt || item.product.name}
            fill
            className="object-cover"
            sizes="48px"
            loading="lazy"
          />
        </div>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-semibold text-gray-900 truncate text-sm">{item.product.name}</h4>
      <p className="text-xs text-gray-600 flex items-center">
        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium mr-2">
          {item.quantity} Adet
        </span>
      </p>
    </div>
    <div className="text-right">
      <p className="font-bold text-gray-900 text-sm">{formatPrice(item.total)}</p>
    </div>
  </div>
);

// Pricing Summary Component
const PricingSummary = ({ pricing }: { pricing: any }) => (
  <div className="mt-4 pt-4 border-t border-gray-200">
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-gray-600 text-sm">Ara Toplam:</span>
        <span className="font-medium text-sm">{formatPrice(pricing.subtotal)}</span>
      </div>
      {pricing.discount > 0 && (
        <div className="flex justify-between">
          <span className="text-gray-600 text-sm">İndirim:</span>
          <span className="font-medium text-red-600 text-sm">-{formatPrice(pricing.discount)}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span className="text-gray-600 text-sm">Kargo:</span>
        <span className="font-medium text-sm">{formatPrice(pricing.shipping)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600 text-sm">KDV:</span>
        <span className="font-medium text-sm">{formatPrice(pricing.tax)}</span>
      </div>
      <div className="flex justify-between pt-2 border-t border-gray-200">
        <span className="text-base font-semibold text-gray-900">Toplam:</span>
        <span className="text-base font-semibold text-blue-600">{formatPrice(pricing.total)}</span>
      </div>
    </div>
  </div>
);

// Utility function
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price);
};

// Info Card Component
const InfoCard = ({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) => (
  <div className={`bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
    <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center">
      {title === "Sipariş Edilen Ürünler" && (
        <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )}
      {title === "Teslimat Adresi" && (
        <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )}
      {title === "Ödeme Bilgileri" && (
        <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )}
      
      {title === "İletişim Bilgileri" && (
        <svg className="w-4 h-4 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      )}
      {title}
    </h3>
    {children}
  </div>
);

const OrderSuccess = () => {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderNumber) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await orderService.getOrderByNumber(orderNumber);
        
        if (response.success && response.data) {
          setOrderDetails(response.data);
        } else {
          setError(response.message || 'Sipariş detayları getirilemedi');
        }
      } catch (err: any) {
        console.error('Sipariş detayları getirilirken hata:', err);
        setError('Sipariş detayları getirilirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderNumber]);

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'credit_card': return 'Kredi Kartı';
      case 'paypal': return 'PayPal';
      case 'bank_transfer': return 'Banka Havalesi';
      case 'cash_on_delivery': return 'Kapıda Ödeme';
      default: return method;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !orderNumber) {
    return <ErrorDisplay error={error} orderNumber={orderNumber} />;
  }

  return (
    <div className="overflow-x-hidden">
      <Breadcrumb 
        title="Sipariş Başarılı"
        pages={[
          { name: "Sepet", href: "/cart" },
          { name: "Ödeme", href: "/checkout" },
          { name: "Sipariş Başarılı" }
        ]}
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 lg:py-16 overflow-x-hidden">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 relative">
            {/* Header */}
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10 overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
              </div>
             

            {/* Content */}
            <div className="px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
              {/* Order Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-2 lg:p-3 mb-3 lg:mb-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 lg:mb-3 ">
                  <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-1 sm:mb-0 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24 ">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Sipariş Bilgileri
                  </h2>
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-blue text-white px-3 py-1 rounded-full font-medium text-xs lg:text-sm shadow-md">
                    #{orderDetails?.orderNumber}
                  </span>
                </div>
                <p className="text-gray-600 text-xs lg:text-sm flex items-center">
                  <svg className="w-3 h-3 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Sipariş Tarihi: {orderDetails?.createdAt ? new Date(orderDetails.createdAt).toLocaleDateString('tr-TR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Bilinmiyor'}
                </p>
              </div>

                              {/* Order Items */}
                {orderDetails && (
                  <InfoCard title="Sipariş Edilen Ürünler" className="mb-3 lg:mb-4">
                    <div className="space-y-3">
                      {orderDetails.items.map((item, index) => (
                        <OrderItem key={index} item={item} index={index} />
                      ))}
                    </div>
                    <PricingSummary pricing={orderDetails.pricing} />
                  </InfoCard>
                )}

                {/* Shipping Address */}
                {orderDetails && (
                  <InfoCard title="Teslimat Adresi" className="mb-3 lg:mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <div className="text-gray-700 space-y-2 text-sm">
                      <div className="flex items-center p-2 bg-white rounded-lg border border-blue-100">
                        <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-semibold">{orderDetails.addresses.shipping.firstName} {orderDetails.addresses.shipping.lastName}</span>
                      </div>
                      <div className="flex items-start p-2 bg-white rounded-lg border border-blue-100">
                        <svg className="w-4 h-4 mr-2 mt-0.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div>
                          <p className="font-medium">{orderDetails.addresses.shipping.address1}</p>
                          <p className="text-gray-600">{orderDetails.addresses.shipping.city}/{orderDetails.addresses.shipping.state} {orderDetails.addresses.shipping.postalCode}</p>
                          <p className="text-gray-600">{orderDetails.addresses.shipping.country}</p>
                        </div>
                      </div>
                    </div>
                  </InfoCard>
                )}

                {/* Payment Info */}
                {orderDetails && (
                  <InfoCard title="Ödeme Bilgileri" className="mb-3 lg:mb-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center p-2 bg-white rounded-lg border border-purple-100">
                        <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <span className="font-medium text-gray-700">Ödeme Yöntemi:</span>
                        <span className="ml-2 font-semibold text-purple-700">{getPaymentMethodText(orderDetails.payment.method)}</span>
                      </div>
                      <div className="flex items-center p-2 bg-white rounded-lg border border-purple-100">
                        <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium text-gray-700">Durum:</span>
                        <span className={`ml-2 px-3 py-1 rounded-full text-xs font-bold ${
                          orderDetails.payment.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                            : 'bg-green-100 text-green-800 border border-green-200'
                        }`}>
                          {orderDetails.payment.status === 'pending' ? 'Beklemede' : 'Ödendi'}
                        </span>
                      </div>
                    </div>
                  </InfoCard>
                )}

                {/* Contact Info */}
                <InfoCard title="İletişim Bilgileri" className="mb-3 lg:mb-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-2 bg-white rounded-lg border border-orange-100">
                      <div className="flex items-center mb-1">
                        <svg className="w-4 h-4 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <p className="text-xs text-gray-600 font-medium">Müşteri Hizmetleri</p>
                      </div>
                      <p className="font-bold text-gray-900 text-sm">+90 (212) 555 0123</p>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-orange-100">
                      <div className="flex items-center mb-1">
                        <svg className="w-4 h-4 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs text-gray-600 font-medium">E-posta</p>
                      </div>
                      <p className="font-bold text-gray-900 text-sm">destek@pazarcik.com</p>
                    </div>
                  </div>
                </InfoCard>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                  href="/"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl text-center font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 bg-blue"
                >
                  <span className="flex items-center justify-center bg-blue">
                    <svg className="w-4 h-4 mr-2 bg-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Alışverişe Devam Et
                  </span>
                </Link>
                <Link 
                  href="/my-account"
                  className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 py-3 px-6 rounded-xl text-center font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border border-gray-300"
                >
                  <span className="flex items-center justify-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Hesabıma Git
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-center mb-2">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <p className="text-gray-700 text-sm lg:text-base font-medium">
                  Siparişiniz için teşekkür ederiz!
                </p>
              </div>
              <p className="text-gray-600 text-xs lg:text-sm">
                En kısa zamanda kargolanacaktır.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess; 