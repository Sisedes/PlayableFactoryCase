import React, { useState } from "react";
import OrderActions from "./OrderActions";
import OrderModal from "./OrderModal";
import Image from "next/image";

const SingleOrder = ({ orderItem, smallView }: any) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const toggleEdit = () => {
    setShowEdit(!showEdit);
  };

  const toggleModal = (status: boolean) => {
    setShowDetails(status);
    setShowEdit(status);
  };

  // Sipariş durumunu Türkçe'ye çevir
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

  // Sipariş durumuna göre renk sınıfı
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

  // Tarihi formatla
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Ürün adlarını birleştir
  const getProductNames = () => {
    if (!orderItem.items || orderItem.items.length === 0) return 'Ürün bilgisi yok';
    
    const names = orderItem.items.map((item: any) => {
      const productName = item.product?.name || item.name || 'Bilinmeyen ürün';
      return `${productName} (${item.quantity} adet)`;
    });
    
    return names.length > 2 
      ? `${names.slice(0, 2).join(', ')} ve ${names.length - 2} ürün daha`
      : names.join(', ');
  };

  return (
    <>
      {!smallView && (
        <div className="items-center justify-between border-t border-gray-3 py-5 px-7.5 hidden md:flex">
          <div className="min-w-[111px]">
            <p className="text-custom-sm text-red font-medium">
              {orderItem.orderNumber}
            </p>
          </div>
          <div className="min-w-[175px]">
            <p className="text-custom-sm text-dark">{formatDate(orderItem.createdAt)}</p>
          </div>

          <div className="min-w-[128px]">
            <span
              className={`inline-block text-custom-sm py-0.5 px-2.5 rounded-[30px] capitalize ${getStatusClass(orderItem.fulfillment?.status || orderItem.status)}`}
            >
              {getStatusText(orderItem.fulfillment?.status || orderItem.status)}
            </span>
          </div>

          <div className="min-w-[213px]">
            <p className="text-custom-sm text-dark">{getProductNames()}</p>
          </div>

          <div className="min-w-[113px]">
            <p className="text-custom-sm text-dark font-medium">
              {orderItem.pricing?.total || orderItem.total}₺
            </p>
          </div>

          <div className="flex gap-5 items-center">
            <OrderActions
              toggleDetails={toggleDetails}
              toggleEdit={toggleEdit}
            />
          </div>
        </div>
      )}

      {smallView && (
        <div className="block md:hidden">
          <div className="py-4.5 px-7.5 border-t border-gray-3">
            <div className="mb-3">
              <p className="text-custom-sm text-dark">
                <span className="font-bold pr-2">Sipariş No:</span> 
                <span className="text-red font-medium"> {orderItem.orderNumber}</span>
              </p>
            </div>
            <div className="mb-3">
              <p className="text-custom-sm text-dark">
                <span className="font-bold pr-2">Tarih:</span>{" "}
                {formatDate(orderItem.createdAt)}
              </p>
            </div>

            <div className="mb-3">
              <p className="text-custom-sm text-dark">
                <span className="font-bold pr-2">Durum:</span>{" "}
                <span
                  className={`inline-block text-custom-sm py-0.5 px-2.5 rounded-[30px] capitalize ${getStatusClass(orderItem.fulfillment?.status || orderItem.status)}`}
                >
                  {getStatusText(orderItem.fulfillment?.status || orderItem.status)}
                </span>
              </p>
            </div>

            <div className="mb-3">
              <p className="text-custom-sm text-dark">
                <span className="font-bold pr-2">Ürünler:</span> {getProductNames()}
              </p>
            </div>

            <div className="mb-3">
              <p className="text-custom-sm text-dark">
                <span className="font-bold pr-2">Toplam:</span>{" "}
                <span className="font-medium">{orderItem.pricing?.total || orderItem.total}₺</span>
              </p>
            </div>

            <div className="">
              <p className="text-custom-sm text-dark flex items-center">
                <span className="font-bold pr-2">İşlemler:</span>{" "}
                <OrderActions
                  toggleDetails={toggleDetails}
                  toggleEdit={toggleEdit}
                />
              </p>
            </div>
          </div>
        </div>
      )}

      <OrderModal
        showDetails={showDetails}
        showEdit={showEdit}
        toggleModal={toggleModal}
        order={orderItem}
      />
    </>
  );
};

export default SingleOrder;
