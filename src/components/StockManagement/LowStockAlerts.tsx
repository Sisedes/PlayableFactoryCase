import React, { useState, useEffect, useCallback } from 'react';
import { getLowStockAlerts, getStockStatistics } from '@/services/productService';

interface LowStockProduct {
  _id: string;
  name: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  status: string;
}

interface ProductWithVariants {
  _id: string;
  name: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  status: string;
  variants: Array<{
    _id: string;
    name: string;
    sku: string;
    stock: number;
    options: Array<{
      name: string;
      value: string;
    }>;
  }>;
}

interface LowStockAlertsProps {
  accessToken: string;
  onUpdateStock: (product: LowStockProduct) => void;
  onUpdateVariantStock: (product: ProductWithVariants, variant: any) => void;
}

const LowStockAlerts: React.FC<LowStockAlertsProps> = ({ accessToken, onUpdateStock, onUpdateVariantStock }) => {
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState<LowStockProduct[]>([]);
  const [productsWithLowStockVariants, setProductsWithLowStockVariants] = useState<ProductWithVariants[]>([]);
  const [productsWithOutOfStockVariants, setProductsWithOutOfStockVariants] = useState<ProductWithVariants[]>([]);
  const [loading, setLoading] = useState(false);
  const [stockStatistics, setStockStatistics] = useState<any>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalLowStock: 0,
    totalOutOfStock: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  const loadAlerts = useCallback(async (page = 1) => {
    if (!accessToken || accessToken === '') {
      return;
    }

    setLoading(true);
    try {
      const [alertsResponse, statsResponse] = await Promise.all([
        getLowStockAlerts({ page, limit: 20 }, accessToken),
        getStockStatistics({ period: 30 }, accessToken)
      ]);
      
      if (alertsResponse.success && alertsResponse.data) {
        setLowStockProducts(alertsResponse.data.lowStockProducts || []);
        setOutOfStockProducts(alertsResponse.data.outOfStockProducts || []);
        setProductsWithLowStockVariants(alertsResponse.data.productsWithLowStockVariants || []);
        setProductsWithOutOfStockVariants(alertsResponse.data.productsWithOutOfStockVariants || []);
        
        const paginationData = alertsResponse.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalLowStock: 0,
          totalOutOfStock: 0,
          hasNextPage: false,
          hasPrevPage: false
        };
        
        setPagination(paginationData);
      }

      if (statsResponse.success && statsResponse.data) {
        setStockStatistics(statsResponse.data);
      }
    } catch (error) {
      console.error('Düşük stok uyarıları yüklenirken hata:', error);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalLowStock: 0,
        totalOutOfStock: 0,
        hasNextPage: false,
        hasPrevPage: false
      });
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken && accessToken !== '') {
      loadAlerts();
    }
  }, [accessToken, loadAlerts]);

  const handleRowClick = (product: LowStockProduct) => {
    onUpdateStock(product);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
        <span className="ml-2 text-gray-600">Düşük stok uyarıları yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Özet Kartları */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Uyarı</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(pagination?.totalLowStock || 0) + (pagination?.totalOutOfStock || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Düşük Stok</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {pagination?.totalLowStock || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-red rounded-lg">
                <svg className="w-6 h-6 text-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray">Stok Tükendi</p>
                <p className="text-2xl font-bold text-red">
                  {pagination?.totalOutOfStock || 0}
                </p>
              </div>
            </div>
          </div>


        </div>

      {/* Düşük Stok ve Stok Tükenen Ürünler */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b border-gray">
          <h3 className="text-lg font-medium text-gray">Stok Uyarıları</h3>
          <p className="text-sm text-gray mt-1">Ürünlere tıklayarak stok güncelleyebilirsiniz</p>
        </div>
        
        {(lowStockProducts.length > 0 || outOfStockProducts.length > 0 || productsWithLowStockVariants.length > 0 || productsWithOutOfStockVariants.length > 0) ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ürün
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Varyasyon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stok
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Stok tükenen ürünler */}
                {outOfStockProducts.map((product) => (
                  <tr 
                    key={`out-${product._id}`} 
                    className="hover:bg-red-50 bg-red-50 cursor-pointer transition-colors duration-200"
                    onClick={() => handleRowClick(product)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.sku}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-400">-</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-red-600 bg-red-50">
                        Stok Tükendi
                      </span>
                    </td>
                  </tr>
                ))}
                
                {/* Düşük stok ürünleri */}
                {lowStockProducts.map((product) => (
                  <tr 
                    key={`low-${product._id}`} 
                    className="hover:bg-yellow-50 bg-yellow-50 cursor-pointer transition-colors duration-200"
                    onClick={() => handleRowClick(product)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.sku}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-400">-</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-yellow-600 bg-yellow-50">
                        Düşük Stok
                      </span>
                    </td>
                  </tr>
                ))}

                {/* Stok tükenen varyasyonlar */}
                {productsWithOutOfStockVariants.map((product) => 
                  product.variants?.filter(variant => variant.stock === 0).map((variant) => (
                    <tr 
                      key={`out-variant-${product._id}-${variant._id}`} 
                      className="hover:bg-red-50 bg-red-50 cursor-pointer transition-colors duration-200"
                      onClick={() => onUpdateVariantStock(product, variant)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.sku}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{variant.name}</div>
                          <div className="text-sm text-gray-500">{variant.sku}</div>
                          <div className="text-xs text-gray-400">
                            {variant.options.map(opt => `${opt.name}: ${opt.value}`).join(', ')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {variant.stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-red-600 bg-red-50">
                          Stok Tükendi
                        </span>
                      </td>
                    </tr>
                  ))
                )}
                
                {/* Düşük stok varyasyonları */}
                {productsWithLowStockVariants.map((product) => 
                  product.variants?.filter(variant => variant.stock > 0 && variant.stock <= (product.lowStockThreshold || 5)).map((variant) => (
                    <tr 
                      key={`low-variant-${product._id}-${variant._id}`} 
                      className="hover:bg-yellow-50 bg-yellow-50 cursor-pointer transition-colors duration-200"
                      onClick={() => onUpdateVariantStock(product, variant)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.sku}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{variant.name}</div>
                          <div className="text-sm text-gray-500">{variant.sku}</div>
                          <div className="text-xs text-gray-400">
                            {variant.options.map(opt => `${opt.name}: ${opt.value}`).join(', ')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {variant.stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-yellow-600 bg-yellow-50">
                          Düşük Stok
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-8 text-center text-gray-500">
            Stok uyarısı bulunmuyor
          </div>
        )}
      </div>

      {/* Pagination */}
      {(pagination?.totalPages || 1) > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Toplam {pagination?.totalLowStock || 0} düşük stok ürünü
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => loadAlerts((pagination?.currentPage || 1) - 1)}
              disabled={!pagination?.hasPrevPage}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Önceki
            </button>
            <span className="px-3 py-1 text-sm">
              {pagination?.currentPage || 1} / {pagination?.totalPages || 1}
            </span>
            <button
              onClick={() => loadAlerts((pagination?.currentPage || 1) + 1)}
              disabled={!pagination?.hasNextPage}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Sonraki
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LowStockAlerts; 