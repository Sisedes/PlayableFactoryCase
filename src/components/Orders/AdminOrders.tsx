"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useAuth } from "@/store/authStore";
import { 
  getAllOrdersForAdmin, 
  updateOrderStatus, 
  getOrderDetails,
  AdminOrder,
  OrdersResponse 
} from "@/services/adminService";
import OrderDetailsModal from "./OrderDetailsModal";
import UpdateStatusModal from "./UpdateStatusModal";

const AdminOrders = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc'
  });
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [orderDetailsModal, setOrderDetailsModal] = useState(false);
  const [statusUpdateModal, setStatusUpdateModal] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  const { accessToken, isAuthenticated, user } = useAuth();

  const loadOrders = useCallback(async (page = 1) => {
    if (!accessToken || !isAuthenticated) {
      console.error('Token veya authentication eksik:', { accessToken: !!accessToken, isAuthenticated });
      setError('Kimlik doğrulama gerekli');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getAllOrdersForAdmin({
        page: page,
        limit: 10,
        status: filters.status === 'all' ? undefined : filters.status,
        search: filters.search || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      }, accessToken);

      if (response.success && response.data) {
        setOrders(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || 'Siparişler yüklenemedi');
      }
      } catch (err: any) {
    console.error('Siparişler yüklenirken hata:', err);
    console.error('Hata detayları:', {
      message: err.message,
      response: err.response,
      request: err.request,
      config: err.config
    });
    setError(`Siparişler yüklenirken hata oluştu: ${err.message}`);
  } finally {
      setLoading(false);
    }
  }, [accessToken, filters]);

  useEffect(() => {
    if (accessToken && isAuthenticated) {
      console.log('AdminOrders: Auth durumu:', { accessToken: !!accessToken, isAuthenticated, userRole: user?.role });
      loadOrders();
    } else {
      console.log('AdminOrders: Auth eksik:', { accessToken: !!accessToken, isAuthenticated });
    }
  }, [loadOrders, accessToken, isAuthenticated]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page: number) => {
    loadOrders(page);
  };

  const handleViewOrderDetails = async (order: AdminOrder) => {
    setSelectedOrder(order);
    setOrderDetailsModal(true);
  };

  const handleUpdateStatus = async (order: AdminOrder) => {
    setSelectedOrder(order);
    setStatusUpdateModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Beklemede';
      case 'confirmed': return 'Onaylandı';
      case 'processing': return 'İşleniyor';
      case 'shipped': return 'Kargoda';
      case 'delivered': return 'Teslim Edildi';
      case 'cancelled': return 'İptal Edildi';
      default: return status;
    }
  };

  if (loading && orders.length === 0) {
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
          onClick={() => loadOrders()}
          className="px-4 py-2 bg-blue text-white rounded-md hover:bg-blue-dark"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm">
        {/* Filtreler */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Sipariş numarası veya müşteri adı ara..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="pending">Beklemede</option>
                <option value="confirmed">Onaylandı</option>
                <option value="processing">İşleniyor</option>
                <option value="shipped">Kargoda</option>
                <option value="delivered">Teslim Edildi</option>
                <option value="cancelled">İptal Edildi</option>
              </select>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Tarih</option>
                <option value="orderNumber">Sipariş No</option>
                <option value="pricing.total">Toplam</option>
              </select>
              <button
                onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {filters.sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Sipariş Listesi */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sipariş No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Müşteri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Toplam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      #{order.orderNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.customerInfo.firstName} {order.customerInfo.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.customerInfo.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString('tr-TR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.pricing.total.toLocaleString('tr-TR')} ₺
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.fulfillment.status)}`}>
                      {getStatusText(order.fulfillment.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewOrderDetails(order)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Detay
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Durum Güncelle
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sayfalama */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Toplam {pagination?.totalOrders || 0} sipariş
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange((pagination?.currentPage || 1) - 1)}
                  disabled={!pagination?.hasPrevPage}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Önceki
                </button>
                <span className="px-3 py-1 text-sm">
                  Sayfa {pagination?.currentPage || 1} / {pagination?.totalPages || 1}
                </span>
                <button
                  onClick={() => handlePageChange((pagination?.currentPage || 1) + 1)}
                  disabled={!pagination?.hasNextPage}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sonraki
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={orderDetailsModal}
        onClose={() => setOrderDetailsModal(false)}
      />

      {/* Update Status Modal */}
      <UpdateStatusModal
        order={selectedOrder}
        isOpen={statusUpdateModal}
        onClose={() => setStatusUpdateModal(false)}
        onSubmit={async (status, trackingNumber, carrier, notes) => {
          if (!selectedOrder || !accessToken) return;

          setUpdatingOrder(selectedOrder._id);
          
          try {
            const response = await updateOrderStatus(
              selectedOrder._id,
              status,
              accessToken,
              trackingNumber,
              carrier,
              notes
            );

            if (response.success) {
              alert('Sipariş durumu başarıyla güncellendi');
              setStatusUpdateModal(false);
              loadOrders(1);
            } else {
              alert(response.message || 'Sipariş durumu güncellenemedi');
            }
          } catch (error) {
            console.error('Sipariş durumu güncellenirken hata:', error);
            alert('Sipariş durumu güncellenirken hata oluştu');
          } finally {
            setUpdatingOrder(null);
          }
        }}
        isUpdating={updatingOrder === selectedOrder?._id}
      />
    </>
  );
};

export default AdminOrders; 