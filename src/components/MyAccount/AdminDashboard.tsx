"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/store/authStore";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { 
  getDashboardStats, 
  DashboardStats
} from "@/services/adminService";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const { accessToken } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  const loadDashboardStats = async () => {
    if (!accessToken) return;
    
    setDashboardLoading(true);
    try {
      const response = await getDashboardStats(accessToken);
      if (response.success && response.data) {
        setDashboardStats(response.data);
      } else {
        toast.error('Verileri yüklenemedi');
      }
    } catch (error) {
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      loadDashboardStats();
    }
  }, [accessToken]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const translateOrderStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'Beklemede',
      'confirmed': 'Onaylandı',
      'processing': 'Hazırlanıyor',
      'shipped': 'Kargoda',
      'delivered': 'Teslim Edildi',
      'cancelled': 'İptal Edildi',
      'refunded': 'İade Edildi'
    };
    return statusMap[status] || status;
  };

  const translateFulfillmentStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'Beklemede',
      'confirmed': 'Onaylandı', 
      'processing': 'Hazırlanıyor',
      'shipped': 'Kargoda',
      'delivered': 'Teslim Edildi',
      'cancelled': 'İptal Edildi'
    };
    return statusMap[status] || status;
  };

  const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  if (dashboardLoading) {
    return (
      <section className="xl:max-w-[1170px] w-full mx-auto" role="main" aria-live="polite" aria-label="Dashboard yükleniyor">
        <div className="bg-gradient-to-br from-[#E5EAF4] to-[#F0F4F8] rounded-2xl p-4 sm:p-6 lg:p-8 xl:p-10">
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div 
                className="animate-spin rounded-full h-12 w-12 border-4 border-blue border-t-transparent mx-auto mb-4"
                role="status"
                aria-label="Yükleniyor"
              ></div>
              <p className="text-dark font-medium">Yenileniyor...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="xl:max-w-[1170px] w-full mx-auto" role="main" aria-labelledby="dashboard-title">
      <div className="rounded-2xl p-4 sm:p-6 lg:p-8 xl:p-10">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 id="dashboard-title" className="font-bold text-xl sm:text-2xl lg:text-heading-4 xl:text-heading-3 text-dark mb-2">
              Yönetim Paneli
            </h1>
          </div>
          <button
            onClick={loadDashboardStats}
            className="flex items-center justify-center px-4 py-3 text-sm sm:text-custom-sm bg-white text-dark rounded-lg hover:bg-blue hover:text-white transition-all duration-300 shadow-1 hover:shadow-2 min-h-[44px] touch-manipulation"
            aria-label="Dashboard verilerini yenile"
            type="button"
          >
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Yenile</span>
          </button>
        </header>

        {dashboardStats ? (
          <main className="space-y-6 sm:space-y-8">
            <section aria-labelledby="stats-heading">
              <h2 id="stats-heading" className="sr-only">Ana İstatistikler</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                <article className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <div className="w-full">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue bg-opacity-10 rounded-lg flex items-center justify-center group-hover:bg-blue group-hover:bg-opacity-100 transition-all duration-300 flex-shrink-0">
                          <svg className="w-5 sm:w-6 h-5 sm:h-6 text-blue group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-body text-sm sm:text-custom-sm font-medium">Toplam Sipariş</h3>
                          <p className="text-xs text-meta-4">Bu aya kadar</p>
                        </div>
                      </div>
                      <data value={dashboardStats.totalOrders || 0} className="text-2xl sm:text-3xl font-bold text-dark">
                        {dashboardStats.totalOrders?.toLocaleString('tr-TR') || 0}
                      </data>
                    </div>
                  </div>
                </article>

                <article className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <div className="w-full">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 sm:w-12 h-10 sm:h-12 bg-green bg-opacity-10 rounded-lg flex items-center justify-center group-hover:bg-green group-hover:bg-opacity-100 transition-all duration-300 flex-shrink-0">
                          <svg className="w-5 sm:w-6 h-5 sm:h-6 text-green group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-body text-sm sm:text-custom-sm font-medium">Toplam Ürün</h3>
                          <p className="text-xs text-meta-4">Aktif ürünler</p>
                        </div>
                      </div>
                      <data value={dashboardStats.totalProducts || 0} className="text-2xl sm:text-3xl font-bold text-dark">
                        {dashboardStats.totalProducts?.toLocaleString('tr-TR') || 0}
                      </data>
                    </div>
                  </div>
                </article>

                <article className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <div className="w-full">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 sm:w-12 h-10 sm:h-12 bg-teal bg-opacity-10 rounded-lg flex items-center justify-center group-hover:bg-teal group-hover:bg-opacity-100 transition-all duration-300 flex-shrink-0">
                          <svg className="w-5 sm:w-6 h-5 sm:h-6 text-teal group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-body text-sm sm:text-custom-sm font-medium">Toplam Müşteri</h3>
                          <p className="text-xs text-meta-4">Kayıtlı üyeler</p>
                        </div>
                      </div>
                      <data value={dashboardStats.totalCustomers || 0} className="text-2xl sm:text-3xl font-bold text-dark">
                        {dashboardStats.totalCustomers?.toLocaleString('tr-TR') || 0}
                      </data>
                    </div>
                  </div>
                </article>

                <article className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <div className="w-full">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 sm:w-12 h-10 sm:h-12 bg-orange bg-opacity-10 rounded-lg flex items-center justify-center group-hover:bg-orange group-hover:bg-opacity-100 transition-all duration-300 flex-shrink-0">
                          <svg className="w-5 sm:w-6 h-5 sm:h-6 text-orange group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-body text-sm sm:text-custom-sm font-medium">Toplam Satış</h3>
                          <p className="text-xs text-meta-4">Bu aya kadar</p>
                        </div>
                      </div>
                      <data value={dashboardStats.totalSales || 0} className="text-2xl sm:text-3xl font-bold text-dark">
                        {formatPrice(dashboardStats.totalSales || 0)}
                      </data>
                    </div>
                  </div>
                </article>
              </div>
            </section>
            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {dashboardStats.salesChart && dashboardStats.salesChart.length > 0 && (
                <article className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <h3 className="font-semibold text-xl text-dark mb-6">7 Günlük Satış Grafiği</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dashboardStats.salesChart}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis 
                          dataKey="_id" 
                          tick={{ fontSize: 12 }}
                          interval={0}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          tickFormatter={(value) => {
                            return value.includes('-') ? value.split('-').slice(1).join('/') : value;
                          }}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          formatter={(value, name, props) => [
                            props.dataKey === 'total' ? formatPrice(Number(value)) : value,
                            name
                          ]}
                          labelFormatter={(value) => `Tarih: ${value}`}
                          contentStyle={{ 
                            backgroundColor: '#F9FAFB', 
                            border: '1px solid #E5E7EB',
                            borderRadius: '6px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="total" 
                          stroke="#3B82F6" 
                          strokeWidth={3}
                          dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                          name="Elde Edilen Gelir"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#10B981" 
                          strokeWidth={3}
                          dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                          name="Sipariş Sayısı"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </article>
              )}

              {dashboardStats.orderStatusDistribution && dashboardStats.orderStatusDistribution.length > 0 && (
                <article className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <h3 className="font-semibold text-xl text-dark mb-6">Sipariş Durumu Dağılımı</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dashboardStats.orderStatusDistribution.map(item => ({
                            ...item,
                            status: translateOrderStatus(item.status)
                          }))}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="45%"
                          outerRadius={80}
                          label={({ percent }) => 
                            `${(percent * 100).toFixed(0)}%`
                          }
                          labelLine={false}
                        >
                          {dashboardStats.orderStatusDistribution.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={CHART_COLORS[index % CHART_COLORS.length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name) => [value, 'Sipariş Sayısı']}
                          labelFormatter={(label) => translateOrderStatus(label)}
                          contentStyle={{ 
                            backgroundColor: '#F9FAFB', 
                            border: '1px solid #E5E7EB',
                            borderRadius: '6px'
                          }}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36}
                          formatter={(value) => value}
                          wrapperStyle={{ paddingTop: '20px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </article>
              )}
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {dashboardStats.recentOrders && dashboardStats.recentOrders.length > 0 && (
                <article className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <h3 className="font-semibold text-xl text-dark mb-6">Son Siparişler</h3>
                  <div className="space-y-3">
                    {dashboardStats.recentOrders.slice(0, 5).map((order) => (
                      <div key={order._id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-dark truncate">
                            #{order.orderNumber}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.customerInfo.firstName} {order.customerInfo.lastName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-dark">
                            {formatPrice(order.pricing.total)}
                          </p>
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                            order.fulfillment.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            order.fulfillment.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                            order.fulfillment.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {translateFulfillmentStatus(order.fulfillment.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              )}

              {dashboardStats.popularProducts && dashboardStats.popularProducts.length > 0 && (
                <article className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <h3 className="font-semibold text-xl text-dark mb-6">Popüler Ürünler</h3>
                  <div className="space-y-3">
                    {dashboardStats.popularProducts
                      .sort((a, b) => {
                        if (b.totalSold !== a.totalSold) {
                          return b.totalSold - a.totalSold;
                        }
                        return (b.viewCount || 0) - (a.viewCount || 0);
                      })
                      .slice(0, 5)
                      .map((product) => (
                      <div key={product._id} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                        <div className="w-12 h-12 flex-shrink-0">
                          {Boolean(product.images && product.images.length > 0) ? (
                            <Image
                              src={product.images[0].url.startsWith('http') 
                                ? product.images[0].url 
                                : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${product.images[0].url}`
                              }
                              alt={`${product.name} ürün görseli`}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover rounded-md"
                              loading="lazy"
                              sizes="48px"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-dark truncate">{product.name}</h4>
                          <p className="text-xs text-gray-500">{product.category}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-600">Satılan: {product.totalSold}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-600">Görüntülenme: {product.viewCount || 0}</span>
                            {product.averageRating && (
                              <>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-yellow-600">
                                  ⭐ {product.averageRating.toFixed(1)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <data value={product.salePrice || product.price} className="text-sm font-semibold text-dark">
                            {formatPrice(product.salePrice || product.price)}
                          </data>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              )}
            </section>

            <section className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="font-semibold text-xl text-dark mb-6">Bu Ay İstatistikleri</h3>
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <article className="p-4 bg-meta rounded-lg text-center hover:shadow-md transition-all duration-300">
                  <div className="w-10 h-10 bg-blue bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg className="w-5 h-5 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <data value={dashboardStats.newCustomersThisMonth || 0} className="text-2xl font-bold text-dark mb-1">
                    {dashboardStats.newCustomersThisMonth || 0}
                  </data>
                  <p className="text-body text-custom-sm">Yeni Müşteri</p>
                </article>
                
                <article className="p-4 bg-meta rounded-lg text-center hover:shadow-md transition-all duration-300">
                  <div className="w-10 h-10 bg-green bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg className="w-5 h-5 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <data value={dashboardStats.monthlySales || 0} className="text-2xl font-bold text-dark mb-1">
                    {formatPrice(dashboardStats.monthlySales || 0)}
                  </data>
                  <p className="text-body text-custom-sm">Aylık Satış</p>
                </article>
                
                <article className="p-4 bg-meta rounded-lg text-center hover:shadow-md transition-all duration-300">
                  <div className="w-10 h-10 bg-teal bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg className="w-5 h-5 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <data value={((dashboardStats.monthlySales || 0) / Math.max((dashboardStats.totalOrders || 1), 1))} className="text-xl font-bold text-dark mb-1">
                    {((dashboardStats.monthlySales || 0) / Math.max((dashboardStats.totalOrders || 1), 1)).toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </data>
                  <p className="text-body text-custom-sm">Ortalama Sipariş</p>
                </article>
                
                <article className="p-4 bg-meta rounded-lg text-center hover:shadow-md transition-all duration-300">
                  <div className="w-10 h-10 bg-orange bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg className="w-5 h-5 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <data value={dashboardStats.totalProducts ? Math.round(((dashboardStats.totalSales || 0) / dashboardStats.totalProducts)) : 0} className="text-xl font-bold text-dark mb-1">
                    {dashboardStats.totalProducts ? Math.round(((dashboardStats.totalSales || 0) / dashboardStats.totalProducts)) : 0}₺
                  </data>
                  <p className="text-body text-custom-sm">Ürün Başına Gelir</p>
                </article>
              </div>
            </section>
          </main>
        ) : (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-center py-16">
              <svg className="mx-auto h-16 w-16 text-meta-4 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z" />
              </svg>
              <h3 className="font-semibold text-xl text-dark mb-3">Dashboard Verileri Yüklenemedi</h3>
              <p className="text-body text-custom-sm mb-6">Lütfen daha sonra tekrar deneyin.</p>
              <button
                onClick={loadDashboardStats}
                className="inline-flex font-medium text-white text-custom-sm rounded-lg bg-blue py-3 px-9 ease-out duration-200 hover:bg-blue-dark"
                type="button"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminDashboard; 