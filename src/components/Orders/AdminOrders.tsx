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
  const [statusForm, setStatusForm] = useState({
    status: '',
    trackingNumber: '',
    carrier: '',
    notes: ''
  });

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
    setStatusForm({
      status: order.fulfillment.status,
      trackingNumber: order.fulfillment.trackingNumber || '',
      carrier: order.fulfillment.carrier || '',
      notes: order.fulfillment.notes || ''
    });
    setStatusUpdateModal(true);
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !accessToken) return;

    setUpdatingOrder(selectedOrder._id);
    
    try {
      const response = await updateOrderStatus(
        selectedOrder._id,
        statusForm.status,
        accessToken,
        statusForm.trackingNumber || undefined,
        statusForm.carrier || undefined,
        statusForm.notes || undefined
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
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Toplam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{order.customerInfo.firstName} {order.customerInfo.lastName}</div>
                      <div className="text-gray-500">{order.customerInfo.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.fulfillment.status)}`}>
                      {getStatusText(order.fulfillment.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.pricing.total.toFixed(2)}₺
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
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

      {/* Sipariş Detayları Modal */}
      {orderDetailsModal && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-dark">Sipariş Detayları - {selectedOrder.orderNumber}</h3>
                <button
                  onClick={() => setOrderDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Müşteri Bilgileri */}
                <div>
                  <h4 className="font-medium text-dark mb-3">Müşteri Bilgileri</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>Ad Soyad:</strong> {selectedOrder.customerInfo.firstName} {selectedOrder.customerInfo.lastName}</p>
                    <p><strong>E-posta:</strong> {selectedOrder.customerInfo.email}</p>
                    {selectedOrder.customerInfo.phone && (
                      <p><strong>Telefon:</strong> {selectedOrder.customerInfo.phone}</p>
                    )}
                  </div>
                </div>

                {/* Sipariş Bilgileri */}
                <div>
                  <h4 className="font-medium text-dark mb-3">Sipariş Bilgileri</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>Sipariş No:</strong> {selectedOrder.orderNumber}</p>
                    <p><strong>Tarih:</strong> {new Date(selectedOrder.createdAt).toLocaleString('tr-TR')}</p>
                    <p><strong>Durum:</strong> 
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.fulfillment.status)}`}>
                        {getStatusText(selectedOrder.fulfillment.status)}
                      </span>
                    </p>
                    {selectedOrder.fulfillment.trackingNumber && (
                      <p><strong>Takip No:</strong> {selectedOrder.fulfillment.trackingNumber}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Ürünler */}
              <div className="mt-6">
                <h4 className="font-medium text-dark mb-3">Ürünler</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <div className="w-16 h-16 relative">
                        {item.product.images && item.product.images.length > 0 ? (
                          <Image
                            src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${item.product.images[0].url}`}
                            alt={item.product.images[0].alt || item.product.name}
                            fill
                            className="object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-300 rounded flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-dark">{item.product.name}</h5>
                        <p className="text-sm text-gray-500">Adet: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-dark">{item.price.toFixed(2)}₺</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fiyat Detayları */}
              <div className="mt-6">
                <h4 className="font-medium text-dark mb-3">Fiyat Detayları</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span>Ara Toplam:</span>
                    <span>{selectedOrder.pricing.subtotal.toFixed(2)}₺</span>
                  </div>
                  {selectedOrder.pricing.discount > 0 && (
                    <div className="flex justify-between mb-2 text-green-600">
                      <span>İndirim:</span>
                      <span>-{selectedOrder.pricing.discount.toFixed(2)}₺</span>
                    </div>
                  )}
                  <div className="flex justify-between mb-2">
                    <span>KDV:</span>
                    <span>{selectedOrder.pricing.tax.toFixed(2)}₺</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Kargo:</span>
                    <span>{selectedOrder.pricing.shipping.toFixed(2)}₺</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg border-t pt-2">
                    <span>Toplam:</span>
                    <span>{selectedOrder.pricing.total.toFixed(2)}₺</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Durum Güncelleme Modal */}
      {statusUpdateModal && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-dark">Sipariş Durumu Güncelle</h3>
                <button
                  onClick={() => setStatusUpdateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleStatusSubmit} className="space-y-4">
                <div>
                  <label className="block mb-2 text-dark font-medium">Durum</label>
                  <select
                    value={statusForm.status}
                    onChange={(e) => setStatusForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full rounded-lg border border-gray-3 bg-gray-1 py-2 px-3 text-dark outline-none transition-all focus:border-blue"
                    required
                  >
                    <option value="pending">Beklemede</option>
                    <option value="confirmed">Onaylandı</option>
                    <option value="processing">İşleniyor</option>
                    <option value="shipped">Kargoda</option>
                    <option value="delivered">Teslim Edildi</option>
                    <option value="cancelled">İptal Edildi</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-dark font-medium">Takip Numarası</label>
                  <input
                    type="text"
                    value={statusForm.trackingNumber}
                    onChange={(e) => setStatusForm(prev => ({ ...prev, trackingNumber: e.target.value }))}
                    className="w-full rounded-lg border border-gray-3 bg-gray-1 py-2 px-3 text-dark outline-none transition-all focus:border-blue"
                    placeholder="Kargo takip numarası"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-dark font-medium">Kargo Firması</label>
                  <input
                    type="text"
                    value={statusForm.carrier}
                    onChange={(e) => setStatusForm(prev => ({ ...prev, carrier: e.target.value }))}
                    className="w-full rounded-lg border border-gray-3 bg-gray-1 py-2 px-3 text-dark outline-none transition-all focus:border-blue"
                    placeholder="Kargo firması adı"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-dark font-medium">Notlar</label>
                  <textarea
                    value={statusForm.notes}
                    onChange={(e) => setStatusForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full rounded-lg border border-gray-3 bg-gray-1 py-2 px-3 text-dark outline-none transition-all focus:border-blue resize-none"
                    placeholder="Sipariş hakkında notlar"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStatusUpdateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={updatingOrder === selectedOrder._id}
                    className="flex-1 px-4 py-2 bg-blue text-white rounded-md hover:bg-blue-dark disabled:opacity-50"
                  >
                    {updatingOrder === selectedOrder._id ? 'Güncelleniyor...' : 'Güncelle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminOrders; 