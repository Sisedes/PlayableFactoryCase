'use client';
import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export default function DataTest() {
  const {
    categories,
    products,
    popularProducts,
    categoriesLoading,
    productsLoading,
    popularLoading,
    error,
    fetchCategories,
    fetchProducts,
    fetchPopularProducts,
    clearError
  } = useStore();

  useEffect(() => {
    // Sayfa yüklendiğinde verileri çek
    fetchCategories();
    fetchPopularProducts();
    fetchProducts({ limit: '6' });
  }, [fetchCategories, fetchPopularProducts, fetchProducts]);

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold">Hata!</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={clearError}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Temizle
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center">Data Fetching Test</h1>
      
      {/* Categories Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">
          Kategoriler {categoriesLoading && '(Yükleniyor...)'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map(category => (
            <div key={category._id} className="bg-white border rounded-lg p-4 shadow-sm">
              <h3 className="font-medium">{category.name}</h3>
              <p className="text-sm text-gray-600">{category.productCount} ürün</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Products */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">
          Popüler Ürünler {popularLoading && '(Yükleniyor...)'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularProducts.map(product => (
            <div key={product._id} className="bg-white border rounded-lg p-4 shadow-sm">
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{product.shortDescription}</p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-green-600">
                  {product.pricing.salePrice || product.pricing.basePrice} TL
                </span>
                <span className="text-sm text-gray-500">
                  Stok: {product.inventory.stock}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* All Products */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">
          Tüm Ürünler {productsLoading && '(Yükleniyor...)'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => (
            <div key={product._id} className="bg-white border rounded-lg p-4 shadow-sm">
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-sm text-blue-600 mb-1">{product.category.name}</p>
              <p className="text-sm text-gray-600 mb-2">{product.shortDescription}</p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-green-600">
                  {product.pricing.salePrice || product.pricing.basePrice} TL
                </span>
                <span className="text-sm text-gray-500">
                  Stok: {product.inventory.stock}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}