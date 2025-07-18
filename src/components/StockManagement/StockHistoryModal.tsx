import React, { useState, useEffect } from 'react';
import { getStockHistory } from '@/services/productService';

interface StockHistoryItem {
  _id: string;
  variantId?: string;
  previousStock: number;
  newStock: number;
  changeAmount: number;
  changeType: 'manual' | 'variant_manual' | 'order' | 'return' | 'adjustment' | 'initial';
  reason?: string;
  performedBy: {
    firstName: string;
    lastName: string;
    email: string;
  };
  performedAt: string;
  notes?: string;
}

interface StockHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  accessToken: string;
}

const StockHistoryModal: React.FC<StockHistoryModalProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
  variantId,
  variantName,
  accessToken
}) => {
  const [history, setHistory] = useState<StockHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalHistory: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  const loadHistory = async (page = 1) => {
    if (!productId || !accessToken) return;

    setLoading(true);
    try {
      let response;
      if (variantId) {
        // Varyasyon stok geçmişi
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/${productId}/variants/${variantId}/stock-history?page=${page}&limit=20`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        const data = await response.json();
        response = data;
      } else {
        // Ana ürün stok geçmişi
        response = await getStockHistory(productId, { page, limit: 20 }, accessToken);
      }
      
      if (response.success) {
        setHistory(response.data);
        setPagination(response.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalHistory: 0,
          hasNextPage: false,
          hasPrevPage: false
        });
      }
    } catch (error) {
      console.error('Stok geçmişi yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && productId) {
      loadHistory();
    }
  }, [isOpen, productId]);

  const getChangeTypeText = (type: string) => {
    const types = {
      manual: 'Manuel',
      variant_manual: 'Varyasyon Manuel',
      order: 'Sipariş',
      return: 'İade',
      adjustment: 'Düzeltme',
      initial: 'İlk Stok'
    };
    return types[type as keyof typeof types] || type;
  };

  const getReasonText = (reason: string) => {
    const reasons = {
      'manual_adjustment': 'Manuel Düzeltme',
      'inventory_count': 'Envanter Sayımı',
      'damaged_goods': 'Hasarlı Ürün',
      'returned_goods': 'İade Edilen Ürün',
      'new_shipment': 'Yeni Sevkiyat',
      'Yeni ürün girişi': 'Yeni Ürün Girişi',
      'Stok düzeltmesi': 'Stok Düzeltmesi',
      'Hasar/Defo': 'Hasar/Defo',
      'Sayım düzeltmesi': 'Sayım Düzeltmesi',
      'Diğer': 'Diğer'
    };
    return reasons[reason as keyof typeof reasons] || reason;
  };

  const getChangeTypeColor = (type: string) => {
    const colors = {
      manual: 'bg-blue-100 text-blue-800',
      order: 'bg-red-100 text-red-800',
      return: 'bg-green-100 text-green-800',
      adjustment: 'bg-yellow-100 text-yellow-800',
      initial: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Stok Geçmişi - {productName}
            {variantName && (
              <span className="text-lg font-normal text-gray-600 ml-2">
                ({variantName})
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto max-h-[70vh]">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
            </div>
          ) : history.length > 0 ? (
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getChangeTypeColor(item.changeType)}`}>
                        {getChangeTypeText(item.changeType)}
                      </span>
                      <span className={`font-semibold ${item.changeAmount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.changeAmount > 0 ? '+' : ''}{item.changeAmount}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(item.performedAt)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Önceki Stok:</span>
                      <span className="ml-2 font-medium">{item.previousStock}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Yeni Stok:</span>
                      <span className="ml-2 font-medium">{item.newStock}</span>
                    </div>
                  </div>
                  
                  {item.reason && (
                    <div className="mt-2">
                      <span className="text-gray-600 text-sm">Sebep:</span>
                      <span className="ml-2 text-sm">{getReasonText(item.reason)}</span>
                    </div>
                  )}
                  
                  {item.notes && (
                    <div className="mt-2">
                      <span className="text-gray-600 text-sm">Notlar:</span>
                      <span className="ml-2 text-sm">{item.notes}</span>
                    </div>
                  )}
                  
                  <div className="mt-2 text-sm text-gray-500">
                    İşlemi Yapan: {item.performedBy.firstName} {item.performedBy.lastName}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Stok geçmişi bulunamadı
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Toplam {pagination.totalHistory} kayıt
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => loadHistory(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Önceki
              </button>
              <span className="px-3 py-1 text-sm">
                {pagination.currentPage} / {pagination.totalPages}
              </span>
              <button
                onClick={() => loadHistory(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockHistoryModal; 