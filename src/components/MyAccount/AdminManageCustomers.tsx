"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/store/authStore";
import { 
  getAllCustomersForAdmin,
  getCustomerDetails,
  updateCustomerStatus,
  Customer,
  CustomerDetails
} from "@/services/userService";
import toast from "react-hot-toast";

const AdminManageCustomers = () => {
  const { accessToken } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customerPagination, setCustomerPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCustomers: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetails | null>(null);
  const [customerDetailsModal, setCustomerDetailsModal] = useState(false);
  const [customerDetailsLoading, setCustomerDetailsLoading] = useState(false);

  const loadCustomers = async (page = 1, search = '') => {
    if (!accessToken) return;

    setCustomersLoading(true);
    try {
      const response = await getAllCustomersForAdmin({
        page: Math.max(1, page),
        limit: 10,
        search: search || '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }, accessToken);

      if (response.success && response.data) {
        setCustomers(response.data.data || []);
        setCustomerPagination(response.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalCustomers: 0,
          hasNextPage: false,
          hasPrevPage: false
        });
      } else {
        setCustomers([]);
        setCustomerPagination({
          currentPage: 1,
          totalPages: 1,
          totalCustomers: 0,
          hasNextPage: false,
          hasPrevPage: false
        });
      }
    } catch (error) {
      setCustomers([]);
      setCustomerPagination({
        currentPage: 1,
        totalPages: 1,
        totalCustomers: 0,
        hasNextPage: false,
        hasPrevPage: false
      });
      console.error('Müşteriler yüklenirken hata:', error);
    } finally {
      setCustomersLoading(false);
    }
  };

  const handleCustomerSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCustomers(1, customerSearch);
  };

  const handleCustomerPageChange = (page: number) => {
    if (page > 0) {
      loadCustomers(page, customerSearch);
    }
  };

  const handleViewCustomerDetails = async (customerId: string) => {
    if (!accessToken) return;

    setCustomerDetailsLoading(true);
    try {
      console.log('Müşteri detayları isteniyor:', customerId);
      const response = await getCustomerDetails(customerId, accessToken);
      console.log('Müşteri detayları yanıtı:', response);
      console.log('Response.data:', response.data);
      console.log('Response.data.customer:', response.data?.customer);
      console.log('Response.data.orders:', response.data?.orders);
      if (response.success) {
        console.log('SelectedCustomer set ediliyor:', response.data);
        console.log('Sipariş durumları:', response.data?.orders?.map(order => ({
          orderNumber: order.orderNumber,
          status: order.fulfillment?.status
        })));
        setSelectedCustomer(response.data);
        setCustomerDetailsModal(true);
      } else {
        toast.error(response.message || 'Müşteri detayları yüklenemedi');
      }
    } catch (error) {
      console.error('Müşteri detayları hatası:', error);
      let errorMessage = 'Müşteri detayları yüklenirken hata oluştu';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        if (errorMessage.includes('HTTP error! status: 500')) {
          errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
        } else if (errorMessage.includes('HTTP error! status: 404')) {
          errorMessage = 'Müşteri bulunamadı.';
        } else if (errorMessage.includes('HTTP error! status: 401')) {
          errorMessage = 'Yetkilendirme hatası. Lütfen tekrar giriş yapın.';
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setCustomerDetailsLoading(false);
    }
  };

  const handleUpdateCustomerStatus = async (customerId: string, isActive: boolean) => {
    if (!accessToken) return;

    try {
      const response = await updateCustomerStatus(customerId, isActive, accessToken);
      if (response.success) {
        toast.success(`Müşteri ${isActive ? 'aktif' : 'pasif'} yapıldı`);
        
        loadCustomers(customerPagination.currentPage, customerSearch);
        
        if (selectedCustomer && selectedCustomer.customer._id === customerId) {
          setSelectedCustomer({
            ...selectedCustomer,
            customer: {
              ...selectedCustomer.customer,
              isActive: isActive
            }
          });
        }
      } else {
        toast.error(response.message || 'Müşteri durumu güncellenemedi');
      }
    } catch (error) {
      toast.error('Müşteri durumu güncellenirken hata oluştu');
    }
  };

  useEffect(() => {
    if (accessToken) {
      loadCustomers();
    }
  }, [accessToken]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && customerDetailsModal) {
        setCustomerDetailsModal(false);
        setSelectedCustomer(null);
      }
    };

    if (customerDetailsModal) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [customerDetailsModal]);

  return (
    <>
      <div className="xl:max-w-[770px] w-full bg-white rounded-xl shadow-1">
        <div className="p-4 sm:p-7.5 xl:p-10">
          <div className="flex items-center justify-between mb-7">
            <h2 className="font-medium text-xl sm:text-2xl text-dark">
              Müşteri Yönetimi
            </h2>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                Toplam: {customerPagination.totalCustomers} müşteri
              </span>
            </div>
          </div>

          {/* Arama */}
          <div className="mb-6">
            <form onSubmit={handleCustomerSearch} className="flex gap-3">
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Müşteri ara (ad, soyad, email)"
                className="flex-1 rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              />
              <button
                type="submit"
                disabled={customersLoading}
                className="px-6 py-2.5 bg-blue text-white rounded-md hover:bg-blue-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {customersLoading ? 'Aranıyor...' : 'Ara'}
              </button>
            </form>
          </div>

          {/* Müşteri İstatistikleri */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">Toplam Müşteri</p>
                  <p className="text-2xl font-bold">{customerPagination.totalCustomers}</p>
                </div>
                <svg className="w-8 h-8 text-green-200" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M22.82,20.55l-.63-.18c-1.06-.29-1.79-.51-1.91-1.75,2.83-3,2.79-5.67,2.73-8.47,0-.38,0-.76,0-1.15a7.1,7.1,0,0,0-7-7A7.1,7.1,0,0,0,9,9c0,.39,0,.77,0,1.15-.06,2.8-.1,5.45,2.73,8.47-.12,1.24-.85,1.46-1.91,1.75l-.63.18C5.61,21.74,2,25,2,29a1,1,0,0,0,2,0c0-3,3-5.61,5.82-6.55.16-.06.34-.1.52-.15A4.11,4.11,0,0,0,13.45,20a5.4,5.4,0,0,0,5.1,0,4.11,4.11,0,0,0,3.11,2.35c.18.05.36.09.52.15C25,23.39,28,26,28,29a1,1,0,0,0,2,0C30,25,26.39,21.74,22.82,20.55Zm-9.36-3C10.9,15,10.94,12.86,11,10.18,11,9.8,11,9.4,11,9A5,5,0,0,1,21,9c0,.4,0,.8,0,1.18,0,2.68.09,4.8-2.47,7.36A3.58,3.58,0,0,1,13.46,17.54Z"/>
                </svg>
              </div>
            </div>

            <div className="bg-green rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">Aktif Müşteri</p>
                  <p className="text-2xl font-bold">{customers.filter(c => c.isActive).length}</p>
                </div>
                <svg className="w-8 h-8 text-green-200" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M22.82,20.55l-.63-.18c-1.06-.29-1.79-.51-1.91-1.75,2.83-3,2.79-5.67,2.73-8.47,0-.38,0-.76,0-1.15a7.1,7.1,0,0,0-7-7A7.1,7.1,0,0,0,9,9c0,.39,0,.77,0,1.15-.06,2.8-.1,5.45,2.73,8.47-.12,1.24-.85,1.46-1.91,1.75l-.63.18C5.61,21.74,2,25,2,29a1,1,0,0,0,2,0c0-3,3-5.61,5.82-6.55.16-.06.34-.1.52-.15A4.11,4.11,0,0,0,13.45,20a5.4,5.4,0,0,0,5.1,0,4.11,4.11,0,0,0,3.11,2.35c.18.05.36.09.52.15C25,23.39,28,26,28,29a1,1,0,0,0,2,0C30,25,26.39,21.74,22.82,20.55Zm-9.36-3C10.9,15,10.94,12.86,11,10.18,11,9.8,11,9.4,11,9A5,5,0,0,1,21,9c0,.4,0,.8,0,1.18,0,2.68.09,4.8-2.47,7.36A3.58,3.58,0,0,1,13.46,17.54Z"/>
                </svg>
              </div>
            </div>

            <div className="bg-teal rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">E-posta Onaylı Müşteri</p>
                  <p className="text-2xl font-bold">{customers.filter(c => c.authentication?.isEmailVerified).length}</p>
                </div>
                <svg className="w-8 h-8 text-yellow-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <div className="bg-red rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">Pasif Müşteri</p>
                  <p className="text-2xl font-bold">{customers.filter(c => !c.isActive).length}</p>
                </div>
                <svg className="w-8 h-8 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                </svg>
              </div>
            </div>
          </div>

          {/* Müşteri Listesi */}
          {customersLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
            </div>
          ) : customers.length > 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Table Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                  <div className="col-span-4">Müşteri Bilgileri</div>
                  <div className="col-span-2">İletişim</div>
                  <div className="col-span-2">Durum</div>
                  <div className="col-span-2">Sipariş</div>
                  <div className="col-span-2">İşlemler</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {customers.map((customer) => (
                  <div key={customer._id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Müşteri Bilgileri */}
                      <div className="col-span-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 font-medium">
                              {customer.firstName?.charAt(0)?.toUpperCase() || customer.lastName?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-dark truncate">
                              {customer.firstName} {customer.lastName}
                            </p>
                            <p className="text-sm text-gray-500 truncate">{customer.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* İletişim */}
                      <div className="col-span-2">
                        <div className="text-sm">
                          {customer.phone ? (
                            <p className="text-gray-900">{customer.phone}</p>
                          ) : (
                            <p className="text-gray-400">Telefon yok</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(customer.createdAt).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </div>

                      {/* Durum */}
                      <div className="col-span-2">
                        <div className="space-y-1">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                            customer.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {customer.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                          <br />
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                            customer.authentication?.isEmailVerified ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {customer.authentication?.isEmailVerified ? 'E-posta ✓' : 'E-posta ✗'}
                          </span>
                        </div>
                      </div>

                      {/* Sipariş */}
                      <div className="col-span-2">
                        <div className="text-sm">
                          <p className="font-medium text-blue-600">{customer.orderCount || 0} sipariş</p>
                          <p className="text-xs text-gray-500">
                            {customer.orderCount > 0 ? 'Müşteri' : 'Henüz alışveriş yapmamış'}
                          </p>
                        </div>
                      </div>

                      {/* İşlemler */}
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewCustomerDetails(customer._id)}
                            disabled={customerDetailsLoading}
                            className="inline-flex items-center px-2.5 py-1.5 bg-blue text-white text-xs rounded hover:bg-blue-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Detayları Görüntüle"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Detay
                          </button>
                          
                          <button
                            onClick={() => handleUpdateCustomerStatus(customer._id, !customer.isActive)}
                            className={`inline-flex items-center px-2.5 py-1.5 text-white text-xs rounded transition-colors duration-200 ${
                              customer.isActive 
                                ? 'bg-orange-500 hover:bg-orange-600' 
                                : 'bg-green-500 hover:bg-green-600'
                            }`}
                            title={customer.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                          >
                            {customer.isActive ? (
                              <>
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                Pasif
                              </>
                            ) : (
                              <>
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Aktif
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {customerPagination.totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">{(customerPagination.currentPage - 1) * 10 + 1}</span>
                      {' - '}
                      <span className="font-medium">
                        {Math.min(customerPagination.currentPage * 10, customerPagination.totalCustomers)}
                      </span>
                      {' arası, toplam '}
                      <span className="font-medium">{customerPagination.totalCustomers}</span>
                      {' müşteri'}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCustomerPageChange(customerPagination.currentPage - 1)}
                        disabled={!customerPagination.hasPrevPage}
                        className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Önceki
                      </button>
                      
                      <span className="text-sm text-gray-700 px-3 py-2">
                        Sayfa {customerPagination.currentPage} / {customerPagination.totalPages}
                      </span>
                      
                      <button
                        onClick={() => handleCustomerPageChange(customerPagination.currentPage + 1)}
                        disabled={!customerPagination.hasNextPage}
                        className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Sonraki
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <h3 className="text-lg font-medium text-dark mb-2">
                {customerSearch ? 'Arama sonucu bulunamadı' : 'Henüz müşteri bulunmuyor'}
              </h3>
              <p className="text-gray-500">
                {customerSearch ? 'Farklı anahtar kelimeler deneyin' : 'Müşteriler kayıt oldukça burada görünecekler'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Müşteri Detayları Modal */}
      {customerDetailsModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-lg">
                      {selectedCustomer.customer?.firstName?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedCustomer.customer?.firstName} {selectedCustomer.customer?.lastName}
                    </h3>
                    <p className="text-blue-100 text-sm">{selectedCustomer.customer?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setCustomerDetailsModal(false);
                    setSelectedCustomer(null);
                  }}
                  className="text-white hover:text-blue-200 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sol Kolon - Kişisel Bilgiler */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-dark mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Kişisel Bilgiler
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider">Ad Soyad</label>
                        <p className="font-medium text-dark">{selectedCustomer.customer?.firstName} {selectedCustomer.customer?.lastName}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider">E-posta</label>
                        <p className="font-medium text-dark">{selectedCustomer.customer?.email}</p>
                      </div>
                      {selectedCustomer.customer?.phone && (
                        <div>
                          <label className="text-xs text-gray-500 uppercase tracking-wider">Telefon</label>
                          <p className="font-medium text-dark">{selectedCustomer.customer.phone}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider">Üyelik Tarihi</label>
                        <p className="font-medium text-dark">{new Date(selectedCustomer.customer?.createdAt).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</p>
                      </div>
                    </div>

                    {/* Durum Bilgileri */}
                    <div className="mt-6">
                      <label className="text-xs text-gray-500 uppercase tracking-wider">Durum</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          selectedCustomer.customer?.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {selectedCustomer.customer?.isActive ? (
                            <>
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Aktif
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              Pasif
                            </>
                          )}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          selectedCustomer.customer?.authentication?.isEmailVerified ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {selectedCustomer.customer?.authentication?.isEmailVerified ? (
                            <>
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                              </svg>
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              E-posta Onaysız
                            </>
                          )}
                        </span>
                      </div>
                      
                      {/* Kullanıcı Durumu Switch */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Hesap Durumu</label>
                            <p className="text-xs text-gray-500">
                              {selectedCustomer.customer?.isActive ? 'Hesap aktif ve kullanılabilir' : 'Hesap pasif ve erişim engellendi'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleUpdateCustomerStatus(selectedCustomer.customer._id, !selectedCustomer.customer.isActive)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              selectedCustomer.customer?.isActive ? 'bg-green' : 'bg-gray'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                                selectedCustomer.customer?.isActive ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sağ Kolon - İstatistikler ve Siparişler */}
                <div className="lg:col-span-2">
                  <div className="space-y-6">

                    {/* Sipariş İstatistikleri */}
                    {selectedCustomer.stats && (
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h4 className="font-semibold text-dark mb-4 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z" />
                          </svg>
                          Sipariş İstatistikleri
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
                            <p className="text-3xl font-bold text-blue-600">{selectedCustomer.stats.totalOrders}</p>
                            <p className="text-sm text-blue-700 font-medium">Toplam Sipariş</p>
                          </div>
                          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
                            <p className="text-3xl font-bold text-green-600">₺{selectedCustomer.stats.totalSpent?.toLocaleString('tr-TR')}</p>
                            <p className="text-sm text-green-700 font-medium">Toplam Harcama</p>
                          </div>
                          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 text-center">
                            <p className="text-3xl font-bold text-orange-600">₺{(selectedCustomer.stats.totalSpent / selectedCustomer.stats.totalOrders || 0)?.toLocaleString('tr-TR')}</p>
                            <p className="text-sm text-orange-700 font-medium">Ortalama Sipariş</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Son Siparişler */}
                    {selectedCustomer.orders && selectedCustomer.orders.length > 0 && (
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h4 className="font-semibold text-dark mb-4 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          Son Siparişler
                        </h4>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {selectedCustomer.orders.slice(0, 5).map((order) => (
                            <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="font-medium text-dark">#{order.orderNumber}</p>
                                  <p className="text-sm text-gray-500">
                                    {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-lg text-dark">₺{order.total?.toLocaleString('tr-TR')}</p>
                                <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                                  order.fulfillment?.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                  order.fulfillment?.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                  order.fulfillment?.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                  order.fulfillment?.status === 'processing' ? 'bg-orange-100 text-orange-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {order.fulfillment?.status === 'delivered' ? 'Teslim Edildi' :
                                   order.fulfillment?.status === 'cancelled' ? 'İptal Edildi' :
                                   order.fulfillment?.status === 'shipped' ? 'Kargoda' :
                                   order.fulfillment?.status === 'processing' ? 'Hazırlanıyor' :
                                   order.fulfillment?.status === 'confirmed' ? 'Onaylandı' :
                                   'Beklemede'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={() => {
                    setCustomerDetailsModal(false);
                    setSelectedCustomer(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminManageCustomers; 