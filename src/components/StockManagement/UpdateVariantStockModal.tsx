import React, { useState } from 'react';
import { updateVariantStock } from '@/services/variationService';

interface UpdateVariantStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  currentStock: number;
  accessToken: string;
  onStockUpdated: () => void;
}

const UpdateVariantStockModal: React.FC<UpdateVariantStockModalProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
  variantId,
  variantName,
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
      const response = await updateVariantStock(productId, variantId, formData, accessToken);
      if (response.success) {
        alert('Varyasyon stoku başarıyla güncellendi!');
        onStockUpdated();
        onClose();
        setFormData({
          newStock: currentStock,
          reason: '',
          notes: ''
        });
      } else {
        setError(response.message || 'Varyasyon stoku güncellenirken hata oluştu');
      }
    } catch (error) {
      console.error('Varyasyon stok güncelleme hatası:', error);
      setError('Varyasyon stoku güncellenirken hata oluştu');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Varyasyon Stok Güncelle</h2>
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
          <p className="text-sm text-gray-600 mb-2">
            <strong>Ürün:</strong> {productName}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Varyasyon:</strong> {variantName}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Mevcut Stok:</strong> {currentStock}
          </p>
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
              placeholder="0"
              className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 px-3 text-gray-900 outline-none transition-all focus:border-blue-500 focus:bg-white"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Güncelleme Nedeni
            </label>
            <select
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 px-3 text-gray-900 outline-none transition-all focus:border-blue-500 focus:bg-white"
              disabled={loading}
            >
              <option value="">Neden seçin</option>
              <option value="manual_adjustment">Manuel Düzeltme</option>
              <option value="inventory_count">Envanter Sayımı</option>
              <option value="damaged_goods">Hasarlı Ürün</option>
              <option value="returned_goods">İade Edilen Ürün</option>
              <option value="new_shipment">Yeni Sevkiyat</option>
              <option value="other">Diğer</option>
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
              placeholder="Stok güncelleme hakkında notlar..."
              className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 px-3 text-gray-900 outline-none transition-all focus:border-blue-500 focus:bg-white"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Güncelleniyor...' : 'Güncelle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateVariantStockModal; 