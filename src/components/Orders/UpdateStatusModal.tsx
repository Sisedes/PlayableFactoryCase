"use client";
import React, { useState } from 'react';
import { AdminOrder } from '@/services/adminService';

interface UpdateStatusModalProps {
  order: AdminOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (status: string, trackingNumber?: string, carrier?: string, notes?: string) => Promise<void>;
  isUpdating: boolean;
}

const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({ 
  order, 
  isOpen, 
  onClose, 
  onSubmit, 
  isUpdating 
}) => {
  const [formData, setFormData] = useState({
    status: '',
    trackingNumber: '',
    carrier: '',
    notes: ''
  });

  React.useEffect(() => {
    if (order) {
      setFormData({
        status: order.fulfillment.status,
        trackingNumber: order.fulfillment.trackingNumber || '',
        carrier: order.fulfillment.carrier || '',
        notes: order.fulfillment.notes || ''
      });
    }
  }, [order]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(
      formData.status,
      formData.trackingNumber || undefined,
      formData.carrier || undefined,
      formData.notes || undefined
    );
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 pt-20">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">
            Sipariş Durumu Güncelle
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isUpdating}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            {/* Order Info */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Sipariş No</p>
              <p className="font-medium text-gray-900">#{order.orderNumber}</p>
              <p className="text-sm text-gray-600 mt-1">
                {order.customerInfo.firstName} {order.customerInfo.lastName}
              </p>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Sipariş Durumu *
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
                disabled={isUpdating}
              >
                <option value="">Durum Seçin</option>
                <option value="pending">Beklemede</option>
                <option value="confirmed">Onaylandı</option>
                <option value="processing">İşleniyor</option>
                <option value="shipped">Kargoda</option>
                <option value="delivered">Teslim Edildi</option>
                <option value="cancelled">İptal Edildi</option>
              </select>
            </div>

            {/* Tracking Number */}
            <div>
              <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Kargo Takip Numarası
              </label>
              <input
                type="text"
                id="trackingNumber"
                value={formData.trackingNumber}
                onChange={(e) => handleInputChange('trackingNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Takip numarası girin"
                disabled={isUpdating}
              />
            </div>

            {/* Carrier */}
            <div>
              <label htmlFor="carrier" className="block text-sm font-medium text-gray-700 mb-1">
                Kargo Firması
              </label>
              <input
                type="text"
                id="carrier"
                value={formData.carrier}
                onChange={(e) => handleInputChange('carrier', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Kargo firması adı"
                disabled={isUpdating}
              />
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notlar
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Sipariş hakkında notlar..."
                disabled={isUpdating}
              />
            </div>

            {/* Status Info */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2 text-sm">Durum Açıklamaları</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li><strong>Beklemede:</strong> Sipariş alındı, onay bekleniyor</li>
                <li><strong>Onaylandı:</strong> Sipariş onaylandı, hazırlanıyor</li>
                <li><strong>İşleniyor:</strong> Sipariş hazırlanıyor</li>
                <li><strong>Kargoda:</strong> Sipariş kargoya verildi</li>
                <li><strong>Teslim Edildi:</strong> Sipariş teslim edildi</li>
                <li><strong>İptal Edildi:</strong> Sipariş iptal edildi</li>
              </ul>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors text-sm"
            disabled={isUpdating}
          >
            İptal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUpdating || !formData.status}
            className="px-3 py-2 bg-blue text-white rounded-md hover:bg-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isUpdating ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                Güncelleniyor...
              </div>
            ) : (
              'Güncelle'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateStatusModal; 