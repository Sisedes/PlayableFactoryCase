import React, { useState } from 'react';
import { updateStock } from '@/services/productService';

interface UpdateStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  currentStock: number;
  accessToken: string;
  onStockUpdated: () => void;
}

const UpdateStockModal: React.FC<UpdateStockModalProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
  currentStock,
  accessToken,
  onStockUpdated
}) => {
  const [formData, setFormData] = useState({
    newStock: currentStock,
    reason: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'newStock' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newStock < 0) {
      setError('Stok miktarı negatif olamaz');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await updateStock(productId, formData, accessToken);
      if (response.success) {
        alert('Stok başarıyla güncellendi!');
        onStockUpdated();
        onClose();
        // Formu sıfırla
        setFormData({
          newStock: currentStock,
          reason: '',
          notes: ''
        });
      } else {
        setError(response.message || 'Stok güncellenirken hata oluştu');
      }
    } catch (error) {
      console.error('Stok güncelleme hatası:', error);
      setError('Stok güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      newStock: currentStock,
      reason: '',
      notes: ''
    });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Stok Güncelle
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Ürün: <span className="font-medium">{productName}</span></p>
          <p className="text-sm text-gray-600">Mevcut Stok: <span className="font-medium">{currentStock}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yeni Stok Miktarı <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="newStock"
              value={formData.newStock}
              onChange={handleInputChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Değişim Sebebi
            </label>
            <select
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="">Sebep seçin</option>
              <option value="Yeni ürün girişi">Yeni ürün girişi</option>
              <option value="Stok düzeltmesi">Stok düzeltmesi</option>
              <option value="Hasar/Defo">Hasar/Defo</option>
              <option value="Sayım düzeltmesi">Sayım düzeltmesi</option>
              <option value="Diğer">Diğer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notlar
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ek notlar..."
              disabled={loading}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Güncelleniyor...' : 'Güncelle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateStockModal; 