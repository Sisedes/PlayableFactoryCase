import React, { useEffect, useState } from "react";
import SingleOrder from "./SingleOrder";
import { useAuth } from "@/store/authStore";
import axios from "axios";

const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!accessToken) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders/my-orders`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );

        if (response.data.success) {
          setOrders(response.data.data);
        } else {
          setError(response.data.message || 'Siparişler yüklenemedi');
        }
      } catch (err: any) {
        console.error('Siparişler yüklenirken hata:', err);
        setError('Siparişler yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [accessToken]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue text-white rounded-md hover:bg-blue-dark"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="min-w-[770px]">
          {/* <!-- order item --> */}
          {orders.length > 0 && (
            <div className="items-center justify-between py-4.5 px-7.5 hidden md:flex ">
              <div className="min-w-[111px]">
                <p className="text-custom-sm text-dark">Sipariş No</p>
              </div>
              <div className="min-w-[175px]">
                <p className="text-custom-sm text-dark">Tarih</p>
              </div>

              <div className="min-w-[128px]">
                <p className="text-custom-sm text-dark">Durum</p>
              </div>

              <div className="min-w-[213px]">
                <p className="text-custom-sm text-dark">Ürünler</p>
              </div>

              <div className="min-w-[113px]">
                <p className="text-custom-sm text-dark">Toplam</p>
              </div>

              <div className="min-w-[113px]">
                <p className="text-custom-sm text-dark">İşlem</p>
              </div>
            </div>
          )}
          {orders.length > 0 ? (
            orders.map((orderItem, key) => (
              <SingleOrder key={key} orderItem={orderItem} smallView={false} />
            ))
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h3 className="text-lg font-medium text-dark mb-2">Henüz siparişiniz yok</h3>
              <p className="text-gray-500 mb-4">İlk siparişinizi vermek için alışverişe başlayın.</p>
              <button
                onClick={() => window.location.href = '/shop-with-sidebar'}
                className="inline-flex items-center font-medium text-white bg-blue py-2 px-4 rounded-md ease-out duration-200 hover:bg-blue-dark"
              >
                Alışverişe Başla
              </button>
            </div>
          )}
        </div>

        {orders.length > 0 &&
          orders.map((orderItem, key) => (
            <SingleOrder key={key} orderItem={orderItem} smallView={true} />
          ))}
      </div>
    </>
  );
};

export default Orders;
