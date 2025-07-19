'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue"></div>
      </div>
    );
  }

  if (error || !orderNumber) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sipariş Bulunamadı</h1>
          <p className="text-gray-600 mb-6">{error || 'Geçersiz sipariş numarası'}</p>
          <Link 
            href="/"
            className="bg-blue text-white px-6 py-3 rounded-md hover:bg-blue-dark transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb 
        title="Sipariş Başarılı"
        pages={[
          { name: "Sepet", href: "/cart" },
          { name: "Ödeme", href: "/checkout" },
          { name: "Sipariş Başarılı" }
        ]}
      />

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-green-500 text-white px-6 py-8 text-center">
              <div className="mx-auto w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-2">Siparişiniz Alındı!</h1>
              <p className="text-lg opacity-90">En kısa zamanda kargolanacaktır</p>
            </div>

            {/* Content */}
            <div className="px-6 py-8">
              {/* Order Info */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 sm:mb-0">
                    Sipariş Bilgileri
                  </h2>
                  <span className="bg-blue text-white px-4 py-2 rounded-full font-medium text-sm">
                    #{orderDetails?.orderNumber}
                  </span>
                </div>
                <p className="text-gray-600">
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
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Edilen Ürünler</h3>
                  <div className="space-y-4">
                    {orderDetails.items.map((item, index) => {
                      console.log('Rendering order item:', {
                        productName: item.product.name,
                        itemImage: item.image,
                        productImages: item.product.images,
                        finalImage: item.image || item.product.images?.[0]?.url || '/images/products/product-1-sm-1.png'
                      });
                      
                      return (
                        <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <img 
                              src={item.image || item.product.images?.[0]?.url || '/images/products/product-1-sm-1.png'} 
                              alt={item.product.name}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                          </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                          <p className="text-sm text-gray-600">Adet: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatPrice(item.total)}</p>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                  
                  {/* Pricing Summary */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ara Toplam:</span>
                        <span className="font-medium">{formatPrice(orderDetails.pricing.subtotal)}</span>
                      </div>
                      {orderDetails.pricing.discount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">İndirim:</span>
                          <span className="font-medium text-red-600">-{formatPrice(orderDetails.pricing.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Kargo:</span>
                        <span className="font-medium">{formatPrice(orderDetails.pricing.shipping)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">KDV:</span>
                        <span className="font-medium">{formatPrice(orderDetails.pricing.tax)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-lg font-semibold text-gray-900">Toplam:</span>
                        <span className="text-lg font-semibold text-blue-600">{formatPrice(orderDetails.pricing.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Shipping Address */}
              {orderDetails && (
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Teslimat Adresi</h3>
                  <div className="text-gray-700">
                    <p className="font-medium">{orderDetails.addresses.shipping.firstName} {orderDetails.addresses.shipping.lastName}</p>
                    <p>{orderDetails.addresses.shipping.address1}</p>
                    <p>{orderDetails.addresses.shipping.city}/{orderDetails.addresses.shipping.state} {orderDetails.addresses.shipping.postalCode}</p>
                    <p>{orderDetails.addresses.shipping.country}</p>
                  </div>
                </div>
              )}

              {/* Payment Info */}
              {orderDetails && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">Ödeme Bilgileri</h3>
                  <div className="text-blue-800">
                    <p><span className="font-medium">Ödeme Yöntemi:</span> {getPaymentMethodText(orderDetails.payment.method)}</p>
                    <p><span className="font-medium">Durum:</span> {orderDetails.payment.status === 'pending' ? 'Beklemede' : 'Ödendi'}</p>
                  </div>
                </div>
              )}

              {/* What's Next */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Sonraki Adımlar
                </h3>
                <ul className="space-y-3 text-blue-800">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 mr-2 mt-0.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Siparişiniz hazırlandığında size bilgilendirme e-postası gönderilecektir</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 mr-2 mt-0.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Kargo takip numarası e-posta adresinize iletilecektir</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 mr-2 mt-0.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Sorularınız için müşteri hizmetlerimizle iletişime geçebilirsiniz</span>
                  </li>
                </ul>
              </div>

              {/* Contact Info */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">İletişim Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Müşteri Hizmetleri</p>
                    <p className="font-medium text-gray-900">+90 (212) 555 0123</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">E-posta</p>
                    <p className="font-medium text-gray-900">destek@pazarcik.com</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/"
                  className="flex-1 bg-blue text-white py-3 px-6 rounded-lg text-center font-medium hover:bg-blue-dark transition-colors"
                >
                  Alışverişe Devam Et
                </Link>
                <Link 
                  href="/my-account"
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg text-center font-medium hover:bg-gray-300 transition-colors"
                >
                  Hesabıma Git
                </Link>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Siparişiniz için teşekkür ederiz! En kısa zamanda kargolanacaktır.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderSuccess; 