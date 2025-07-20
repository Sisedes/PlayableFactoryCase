"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/store/authStore";
import Image from "next/image";
import StockHistoryModal from "../StockManagement/StockHistoryModal";
import UpdateStockModal from "../StockManagement/UpdateStockModal";
import UpdateVariantStockModal from "../StockManagement/UpdateVariantStockModal";
import LowStockAlerts from "../StockManagement/LowStockAlerts";
import { 
  getAllProductsForAdmin,
  getStockStatistics
} from "@/services/productService";
import toast from "react-hot-toast";

interface LocalProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  price: number;
  salePrice?: number;
  currency?: string;
  sku: string;
  stock: number;
  trackQuantity?: boolean;
  lowStockThreshold?: number;
  images: Array<{
    _id?: string;
    url: string;
    alt: string;
    isMain?: boolean;
    isPrimary?: boolean;
  }>;
  variants?: Array<{
    _id?: string;
    name: string;
    options: Array<{
      name: string;
      value: string;
    }>;
    sku: string;
    price?: number;
    stock: number;
    image?: string;
    isDefault: boolean;
  }>;
  tags?: string[];
  status: 'draft' | 'active' | 'inactive';
  isFeatured?: boolean;
  averageRating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

const AdminStockManagement = () => {
  const { accessToken } = useAuth();
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [stockHistoryModal, setStockHistoryModal] = useState(false);
  const [updateStockModal, setUpdateStockModal] = useState(false);
  const [updateVariantStockModal, setUpdateVariantStockModal] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] = useState<LocalProduct | null>(null);
  const [selectedVariantForStock, setSelectedVariantForStock] = useState<any>(null);
  const [stockStatistics, setStockStatistics] = useState<any>(null);
  const [stockStatsLoading, setStockStatsLoading] = useState(false);
  const [filterStockLevel, setFilterStockLevel] = useState<'all' | 'low' | 'out'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken) return;
      
      setLoading(true);
      try {
        const [productsResponse] = await Promise.all([
          getAllProductsForAdmin({}, accessToken).catch(error => {
            return { success: false, data: [], message: 'Ürünler yüklenemedi' };
          })
        ]);
        
        if (productsResponse.success && productsResponse.data) {
          setProducts(productsResponse.data as unknown as LocalProduct[]);
        } else {
          setProducts([]);
        }
      } catch (error) {
        setProducts([]);
        console.error('Ürünler yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchData();
      loadStockStatistics();
    }
  }, [accessToken]);

  const loadStockStatistics = async () => {
    if (!accessToken) return;

    setStockStatsLoading(true);
    try {
      const response = await getStockStatistics({ period: 30 }, accessToken);
      if (response.success) {
        setStockStatistics(response.data);
      }
    } catch (error) {
      console.error('Stok istatistikleri yüklenirken hata:', error);
    } finally {
      setStockStatsLoading(false);
    }
  };

  const handleViewStockHistory = (product: LocalProduct, variant?: any) => {
    setSelectedProductForStock(product);
    setSelectedVariantForStock(variant);
    setStockHistoryModal(true);
  };

  const handleUpdateStock = (product: LocalProduct | any) => {
    const localProduct: LocalProduct = {
      _id: product._id,
      name: product.name,
      slug: product.slug || '',
      description: product.description || '',
      category: product.category,
      price: product.price || 0,
      sku: product.sku,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
      images: product.images || [],
      status: product.status || 'active',
      createdAt: product.createdAt || '',
      updatedAt: product.updatedAt || ''
    };
    setSelectedProductForStock(localProduct);
    setUpdateStockModal(true);
  };

  const handleUpdateVariantStock = (product: any, variant: any) => {
    const localProduct: LocalProduct = {
      _id: product._id,
      name: product.name,
      slug: product.slug || '',
      description: product.description || '',
      category: product.category,
      price: product.price || 0,
      sku: product.sku,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
      images: product.images || [],
      status: product.status || 'active',
      createdAt: product.createdAt || '',
      updatedAt: product.updatedAt || ''
    };
    setSelectedProductForStock(localProduct);
    setSelectedVariantForStock(variant);
    setUpdateVariantStockModal(true);
  };

  const handleStockUpdated = async () => {
    if (accessToken) {
      const productsResponse = await getAllProductsForAdmin({}, accessToken);
      if (productsResponse.success) {
        setProducts(productsResponse.data as unknown as LocalProduct[]);
      }
      await loadStockStatistics();
    }
  };

  const getStockStatus = (stock: number, lowStockThreshold = 5) => {
    if (stock <= 0) return { status: 'out', color: 'text-red-600', bg: 'bg-red-100' };
    if (stock <= lowStockThreshold) return { status: 'low', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { status: 'good', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '/images/products/default.png';
    return imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${imageUrl}`;
  };

  const filteredProducts = products.filter(product => {
    let stockFilter = true;
    if (filterStockLevel === 'out') stockFilter = product.stock <= 0;
    if (filterStockLevel === 'low') stockFilter = product.stock > 0 && product.stock <= (product.lowStockThreshold || 5);
    
    const searchLower = searchTerm.toLowerCase();
    const searchFilter = !searchTerm || 
      product.name.toLowerCase().includes(searchLower) ||
      product.sku.toLowerCase().includes(searchLower) ||
      product.category?.name.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower);
    
    return stockFilter && searchFilter;
  });

  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= (p.lowStockThreshold || 5)).length;
  const outOfStockCount = products.filter(p => p.stock <= 0).length;

  if (loading) {
    return (
      <div className="xl:max-w-[770px] w-full bg-white rounded-xl shadow-1">
        <div className="p-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="xl:max-w-[770px] w-full bg-white rounded-xl shadow-1">
        <div className="p-4 sm:p-7.5 xl:p-10">
          <div className="flex items-center justify-between mb-7">
            <h2 className="font-medium text-xl sm:text-2xl text-dark">
              Stok Yönetimi
            </h2>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                Toplam: {products.length} ürün
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-green rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">Stokta Ürün</p>
                  <p className="text-2xl font-bold">{products.filter(p => p.stock > (p.lowStockThreshold || 5)).length}</p>
                </div>
                <svg className="w-8 h-8 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <div className="bg-orange rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">Düşük Stok</p>
                  <p className="text-2xl font-bold">{lowStockCount}</p>
                </div>
                <svg className="w-8 h-8 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>

            <div className="bg-red rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">Stok Tükendi</p>
                  <p className="text-2xl font-bold">{outOfStockCount}</p>
                </div>
                <svg className="w-8 h-8 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {(lowStockCount > 0 || outOfStockCount > 0) && (
            <div className="mb-8">
              <LowStockAlerts 
                accessToken={accessToken || ''}
                onUpdateStock={handleUpdateStock}
                onUpdateVariantStock={handleUpdateVariantStock}
              />
            </div>
          )}

          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Ürün adı, SKU, kategori veya açıklama ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue/20 focus:border-transparent text-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-dark whitespace-nowrap">Stok Durumu:</label>
                <select
                  value={filterStockLevel}
                  onChange={(e) => setFilterStockLevel(e.target.value as any)}
                  className="rounded-md border border-gray-3 bg-gray-1 py-2 px-3 text-sm outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                >
                  <option value="all">Tümü ({products.length})</option>
                  <option value="low">Düşük Stok ({lowStockCount})</option>
                  <option value="out">Stok Tükendi ({outOfStockCount})</option>
                </select>
              </div>
            </div>

            {searchTerm && (
              <div className="mt-3 text-sm text-gray-600">
                <span className="font-medium">{filteredProducts.length}</span> ürün bulundu
                {filteredProducts.length !== products.length && (
                  <span className="ml-2 text-gray-500">
                    (toplam {products.length} üründen)
                  </span>
                )}
              </div>
            )}
          </div>

          {filteredProducts.length > 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                  <div className="col-span-3">Ürün Bilgileri</div>
                  <div className="col-span-2">Kategori & SKU</div>
                  <div className="col-span-2">Stok Durumu</div>
                  <div className="col-span-2">Eşik & Varyant</div>
                  <div className="col-span-3">İşlemler</div>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock, product.lowStockThreshold);
                  
                  return (
                    <div key={product._id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
                      <div className="grid grid-cols-12 gap-4 items-start">
                        <div className="col-span-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 flex-shrink-0">
                              {product.images && product.images.length > 0 ? (
                                <Image
                                  src={getImageUrl(product.images[0].url)}
                                  alt={product.name}
                                  width={40}
                                  height={40}
                                  className="object-cover rounded-md w-full h-full"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-dark text-sm truncate">{product.name}</p>
                              <p className="text-xs text-gray-500 truncate">{product.description}</p>
                            </div>
                          </div>
                        </div>

                        <div className="col-span-2">
                          <div className="text-sm">
                            <p className="font-medium text-dark">{product.category?.name || 'N/A'}</p>
                            <p className="text-gray-500 text-xs">SKU: {product.sku || 'N/A'}</p>
                          </div>
                        </div>

                        <div className="col-span-2">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex px-3 py-1 text-sm rounded-full font-medium ${stockStatus.color} ${stockStatus.bg}`}>
                              {product.stock} adet
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {stockStatus.status === 'out' ? 'Stok Tükendi' : 
                             stockStatus.status === 'low' ? 'Düşük Stok' : 'Stokta'}
                          </p>
                        </div>

                        <div className="col-span-2">
                          <div className="text-sm">
                            <p className="text-dark">Eşik: {product.lowStockThreshold || 5}</p>
                            {product.variants && product.variants.length > 0 && (
                              <p className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
                                {product.variants.length} varyant
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="col-span-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleUpdateStock(product)}
                              className="inline-flex items-center px-2 py-1 bg-blue text-white text-xs rounded hover:bg-blue-dark transition-colors duration-200"
                              title="Stok Güncelle"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Güncelle
                            </button>
                            <button
                              onClick={() => handleViewStockHistory(product)}
                              className="inline-flex items-center px-2 py-1 bg-teal text-white text-xs rounded hover:bg-gray-700 transition-colors duration-200"
                              title="Stok Geçmişi"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Geçmiş
                            </button>
                          </div>
                        </div>
                      </div>

                      {product.variants && product.variants.length > 0 && (
                        <div className="mt-4 pl-12">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm font-medium text-dark mb-2">Varyantlar:</p>
                            <div className="space-y-2">
                              {product.variants.map((variant, index) => {
                                const variantStockStatus = getStockStatus(variant.stock, 5);
                                return (
                                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                                    <div className="flex-1">
                                      <span className="text-sm font-medium">{variant.name}</span>
                                      <span className="text-xs text-gray-500 ml-2">({variant.sku})</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${variantStockStatus.color} ${variantStockStatus.bg}`}>
                                        {variant.stock} adet
                                      </span>
                                      <button
                                        onClick={() => handleUpdateVariantStock(product, variant)}
                                        className="px-2 py-1 bg-blue text-white text-xs rounded hover:bg-blue-dark transition-colors duration-200"
                                      >
                                        Güncelle
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="text-lg font-medium text-dark mb-2">
                {filterStockLevel === 'all' ? 'Henüz ürün bulunmuyor' : 
                 filterStockLevel === 'low' ? 'Düşük stoklu ürün bulunmuyor' : 
                 'Stoku tükenmiş ürün bulunmuyor'}
              </h3>
              <p className="text-gray-500">
                {filterStockLevel === 'all' ? 'Ürün ekleyerek başlayın.' : 'Bu iyi bir haber!'}
              </p>
            </div>
          )}
        </div>
      </div>

      <StockHistoryModal
        isOpen={stockHistoryModal}
        onClose={() => {
          setStockHistoryModal(false);
          setSelectedProductForStock(null);
          setSelectedVariantForStock(null);
        }}
        productId={selectedProductForStock?._id || ''}
        productName={selectedProductForStock?.name || ''}
        variantId={selectedVariantForStock?._id}
        variantName={selectedVariantForStock?.name}
        accessToken={accessToken || ''}
      />

      <UpdateStockModal
        isOpen={updateStockModal}
        onClose={() => {
          setUpdateStockModal(false);
          setSelectedProductForStock(null);
        }}
        productId={selectedProductForStock?._id || ''}
        productName={selectedProductForStock?.name || ''}
        currentStock={selectedProductForStock?.stock || 0}
        accessToken={accessToken || ''}
        onStockUpdated={handleStockUpdated}
      />

      <UpdateVariantStockModal
        isOpen={updateVariantStockModal}
        onClose={() => {
          setUpdateVariantStockModal(false);
          setSelectedProductForStock(null);
          setSelectedVariantForStock(null);
        }}
        productId={selectedProductForStock?._id || ''}
        productName={selectedProductForStock?.name || ''}
        variantId={selectedVariantForStock?._id || ''}
        variantName={selectedVariantForStock?.name || ''}
        currentStock={selectedVariantForStock?.stock || 0}
        accessToken={accessToken || ''}
        onStockUpdated={handleStockUpdated}
      />
    </>
  );
};

export default AdminStockManagement; 