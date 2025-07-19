import React from "react";

const OrderDetails = ({ orderItem }: any) => {
  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'Bekliyor',
      'confirmed': 'Onaylandı',
      'processing': 'İşleniyor',
      'shipped': 'Kargoda',
      'delivered': 'Teslim Edildi',
      'cancelled': 'İptal Edildi'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status: string) => {
    const statusClassMap: { [key: string]: string } = {
      'pending': 'text-yellow-600 bg-yellow-100',
      'confirmed': 'text-blue-600 bg-blue-100',
      'processing': 'text-orange-600 bg-orange-100',
      'shipped': 'text-purple-600 bg-purple-100',
      'delivered': 'text-green-600 bg-green-100',
      'cancelled': 'text-red-600 bg-red-100'
    };
    return statusClassMap[status] || 'text-gray-600 bg-gray-100';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Tarih bilgisi yok';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrderNumber = () => {
    if (!orderItem?.orderNumber) return 'Sipariş numarası yok';
    return `#${orderItem.orderNumber}`;
  };

  const getTotal = () => {
    const total = orderItem?.pricing?.total || orderItem?.total;
    return total ? `${total}₺` : 'Tutar bilgisi yok';
  };

  const getStatus = () => {
    const status = orderItem?.fulfillment?.status || orderItem?.status;
    return status || 'Durum bilgisi yok';
  };

  const getCustomerName = () => {
    const customerInfo = orderItem?.customerInfo;
    if (customerInfo?.firstName && customerInfo?.lastName) {
      return `${customerInfo.firstName} ${customerInfo.lastName}`;
    }
    return 'Müşteri bilgisi yok';
  };

  const getShippingAddress = () => {
    const shipping = orderItem?.addresses?.shipping;
    if (!shipping) return 'Adres bilgisi yok';
    
    const parts = [
      shipping.address1,
      shipping.address2,
      shipping.city,
      shipping.state,
      shipping.postalCode,
      shipping.country
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : 'Adres bilgisi yok';
  };

  const getProducts = () => {
    const items = orderItem?.items;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return [];
    }
    return items;
  };



  return (
    <div className="w-full px-4 py-3">
      {/* Sipariş Başlığı */}
      <div className="mb-3">
        <h3 className="text-base font-semibold text-gray-900 mb-2">
          Sipariş Detayları
        </h3>
        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
          <div>
            <span className="font-medium">Sipariş No:</span> {getOrderNumber()}
          </div>
          <div>
            <span className="font-medium">Tarih:</span> {formatDate(orderItem?.createdAt)}
          </div>
          <div>
            <span className="font-medium">Durum:</span>
            <span className={`ml-1 inline-block px-1.5 py-0.5 text-xs rounded-full ${getStatusClass(getStatus())}`}>
              {getStatusText(getStatus())}
            </span>
          </div>
        </div>
      </div>

      {/* Müşteri Bilgileri */}
      <div className="mb-3 p-2 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-1 text-sm">Müşteri Bilgileri</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs">
          <div>
            <span className="font-medium">Ad Soyad:</span> {getCustomerName()}
          </div>
          <div>
            <span className="font-medium">E-posta:</span> {orderItem?.customerInfo?.email || 'E-posta bilgisi yok'}
          </div>
          <div>
            <span className="font-medium">Telefon:</span> {orderItem?.customerInfo?.phone || 'Telefon bilgisi yok'}
          </div>
        </div>
      </div>

      {/* Teslimat Adresi */}
      <div className="mb-3 p-2 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-1 text-sm">Teslimat Adresi</h4>
        <p className="text-xs text-gray-700">{getShippingAddress()}</p>
      </div>

      {/* Ürün Listesi */}
      <div className="mb-3">
        <h4 className="font-medium text-gray-900 mb-1 text-sm">Ürünler</h4>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {getProducts().map((item: any, index: number) => (
            <div key={index} className="flex items-center p-1.5 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <h5 className="font-medium text-gray-900 text-xs">
                  <a 
                    href={`/product/${item.product?._id || item.productId || item.id}`}
                    className="hover:text-blue-600 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.product?.name || item.name || 'Ürün adı bilgisi yok'}
                  </a>
                </h5>
                <p className="text-xs text-gray-600">
                  Adet: {item.quantity || 1}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900 text-xs">
                  {item.price ? `${item.price}₺` : 'Fiyat bilgisi yok'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fiyat Özeti */}
      <div className="mb-3 p-2 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-1 text-sm">Fiyat Özeti</h4>
        <div className="space-y-0.5 text-xs">
          <div className="flex justify-between">
            <span>Ara Toplam:</span>
            <span>{orderItem?.pricing?.subtotal ? `${orderItem.pricing.subtotal}₺` : 'Bilgi yok'}</span>
          </div>
          {orderItem?.pricing?.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>İndirim:</span>
              <span>-{orderItem.pricing.discount}₺</span>
            </div>
          )}
          {orderItem?.pricing?.tax > 0 && (
            <div className="flex justify-between">
              <span>KDV:</span>
              <span>{orderItem.pricing.tax}₺</span>
            </div>
          )}
          {orderItem?.pricing?.shipping > 0 && (
            <div className="flex justify-between">
              <span>Kargo:</span>
              <span>{orderItem.pricing.shipping}₺</span>
            </div>
          )}
          <div className="flex justify-between font-medium text-sm border-t pt-1">
            <span>Toplam:</span>
            <span>{getTotal()}</span>
          </div>
        </div>
      </div>

      {/* Ödeme Bilgileri */}
      {orderItem?.payment && (
        <div className="mb-3 p-2 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-1 text-sm">Ödeme Bilgileri</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs">
            <div>
              <span className="font-medium">Ödeme Yöntemi:</span>
              <span className="ml-1 capitalize">
                {orderItem.payment.method === 'credit_card' ? 'Kredi Kartı' :
                 orderItem.payment.method === 'paypal' ? 'PayPal' :
                 orderItem.payment.method === 'bank_transfer' ? 'Banka Havalesi' :
                 orderItem.payment.method === 'cash_on_delivery' ? 'Kapıda Ödeme' :
                 orderItem.payment.method}
              </span>
            </div>
            <div>
              <span className="font-medium">Ödeme Durumu:</span>
              <span className={`ml-1 inline-block px-1.5 py-0.5 text-xs rounded-full ${
                orderItem.payment.status === 'paid' ? 'bg-green-100 text-green-700' :
                orderItem.payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                orderItem.payment.status === 'failed' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {orderItem.payment.status === 'paid' ? 'Ödendi' :
                 orderItem.payment.status === 'pending' ? 'Bekliyor' :
                 orderItem.payment.status === 'failed' ? 'Başarısız' :
                 orderItem.payment.status === 'refunded' ? 'İade Edildi' :
                 orderItem.payment.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Kargo Bilgileri */}
      {orderItem?.fulfillment?.trackingNumber && (
        <div className="p-2 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-1 text-sm">Kargo Bilgileri</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs">
            <div>
              <span className="font-medium">Takip Numarası:</span>
              <span className="ml-1 font-mono">{orderItem.fulfillment.trackingNumber}</span>
            </div>
            {orderItem.fulfillment.carrier && (
              <div>
                <span className="font-medium">Kargo Firması:</span>
                <span className="ml-1">{orderItem.fulfillment.carrier}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
