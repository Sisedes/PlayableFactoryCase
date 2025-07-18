"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export interface IVariantOption {
  name: string;
  value: string;
}

export interface IProductVariant {
  _id?: string;
  name: string;
  options: IVariantOption[];
  sku: string;
  price?: number;
  salePrice?: number; // İndirimli fiyat eklendi
  stock: number;
  image?: string;
  isDefault: boolean;
}

interface VariationModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  variants: IProductVariant[];
  onSave: (variants: IProductVariant[]) => void;
  loading?: boolean;
}

const VariationModal: React.FC<VariationModalProps> = ({
  isOpen,
  onClose,
  productName,
  variants,
  onSave,
  loading = false
}) => {
  const [localVariants, setLocalVariants] = useState<IProductVariant[]>(variants);
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File }>({});
  const [applyDiscounts, setApplyDiscounts] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    setLocalVariants(variants);
    setSelectedFiles({});
    
    // İndirim checkbox'larını ayarla
    const discountStates: { [key: string]: boolean } = {};
    variants.forEach((variant, index) => {
      discountStates[index] = !!(variant.salePrice && variant.salePrice > 0);
    });
    setApplyDiscounts(discountStates);
  }, [variants]);

  const handleAddVariant = () => {
    const newVariant: IProductVariant = {
      name: '',
      options: [{ name: '', value: '' }],
      sku: '',
      price: 0,
      salePrice: 0,
      stock: 0,
      isDefault: localVariants.length === 0
    };
    setLocalVariants([...localVariants, newVariant]);
  };

  const handleRemoveVariant = (index: number) => {
    const updatedVariants = localVariants.filter((_, i) => i !== index);
    // Eğer silinen varyant varsayılan ise, ilk varyantı varsayılan yap
    if (localVariants[index].isDefault && updatedVariants.length > 0) {
      updatedVariants[0].isDefault = true;
    }
    setLocalVariants(updatedVariants);
  };

  const handleVariantChange = (index: number, field: keyof IProductVariant, value: string | number) => {
    const updatedVariants = [...localVariants];
    const variant = updatedVariants[index];
    
    if (field === 'price') {
      variant.price = Number(value);
    } else if (field === 'salePrice') {
      variant.salePrice = Number(value);
    } else if (field === 'stock') {
      variant.stock = Number(value);
    } else if (field === 'name') {
      variant.name = value as string;
    } else if (field === 'sku') {
      variant.sku = value as string;
    } else if (field === 'image') {
      variant.image = value as string;
    }
    
    setLocalVariants(updatedVariants);
  };

  const handleOptionChange = (variantIndex: number, optionIndex: number, field: 'name' | 'value', value: string) => {
    const updatedVariants = [...localVariants];
    updatedVariants[variantIndex].options[optionIndex][field] = value;
    setLocalVariants(updatedVariants);
  };

  const handleAddOption = (variantIndex: number) => {
    const updatedVariants = [...localVariants];
    updatedVariants[variantIndex].options.push({ name: '', value: '' });
    setLocalVariants(updatedVariants);
  };

  const handleRemoveOption = (variantIndex: number, optionIndex: number) => {
    const updatedVariants = [...localVariants];
    updatedVariants[variantIndex].options.splice(optionIndex, 1);
    setLocalVariants(updatedVariants);
  };

  const handleSetDefault = (index: number) => {
    const updatedVariants = localVariants.map((variant, i) => ({
      ...variant,
      isDefault: i === index
    }));
    setLocalVariants(updatedVariants);
  };

  const handleImageChange = (variantIndex: number, file: File) => {
    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Dosya boyutu 5MB\'dan büyük olamaz');
      return;
    }
    
    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      alert('Sadece resim dosyaları kabul edilir');
      return;
    }
    
    setSelectedFiles(prev => ({
      ...prev,
      [variantIndex]: file
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, variantIndex: number) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageChange(variantIndex, files[0]);
    }
  };

  const handleSave = () => {
    // Validasyon
    const errors: string[] = [];
    
    localVariants.forEach((variant, index) => {
      if (!variant.name.trim()) {
        errors.push(`Varyant ${index + 1}: Varyant adı gereklidir`);
      }
      if (!variant.sku.trim()) {
        errors.push(`Varyant ${index + 1}: SKU gereklidir`);
      }
      if (variant.stock < 0) {
        errors.push(`Varyant ${index + 1}: Stok negatif olamaz`);
      }
      if (variant.price && variant.price < 0) {
        errors.push(`Varyant ${index + 1}: Fiyat negatif olamaz`);
      }
      if (variant.salePrice && variant.salePrice < 0) {
        errors.push(`Varyant ${index + 1}: İndirimli fiyat negatif olamaz`);
      }
      if (variant.salePrice && variant.price && variant.salePrice >= variant.price) {
        errors.push(`Varyant ${index + 1}: İndirimli fiyat normal fiyattan düşük olmalıdır`);
      }
      
      variant.options.forEach((option, optionIndex) => {
        if (!option.name.trim()) {
          errors.push(`Varyant ${index + 1}, Seçenek ${optionIndex + 1}: Seçenek adı gereklidir`);
        }
        if (!option.value.trim()) {
          errors.push(`Varyant ${index + 1}, Seçenek ${optionIndex + 1}: Seçenek değeri gereklidir`);
        }
      });
    });

    if (errors.length > 0) {
      alert('Lütfen aşağıdaki hataları düzeltin:\n' + errors.join('\n'));
      return;
    }

    onSave(localVariants);
  };

  const handleClose = () => {
    setLocalVariants(variants);
    setSelectedFiles({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {productName} - Varyasyon Yönetimi
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
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Varyasyonlar</h3>
              <button
                onClick={handleAddVariant}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Varyasyon Ekle
              </button>
            </div>

            {localVariants.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p>Henüz varyasyon eklenmemiş</p>
                <p className="text-sm">Ürününüzün farklı seçeneklerini (renk, boyut, vb.) ekleyin</p>
              </div>
            ) : (
              <div className="space-y-6">
                {localVariants.map((variant, variantIndex) => (
                  <div key={variantIndex} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="text"
                          value={variant.name}
                          onChange={(e) => handleVariantChange(variantIndex, 'name', e.target.value)}
                          placeholder="Varyant adı (örn: Renk, Boyut)"
                          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="defaultVariant"
                            checked={variant.isDefault}
                            onChange={() => handleSetDefault(variantIndex)}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Varsayılan</span>
                        </label>
                      </div>
                      <button
                        onClick={() => handleRemoveVariant(variantIndex)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Varyasyon Özellikleri */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Varyasyon Özelliği</label>
                        <input
                          type="text"
                          value={variant.name}
                          onChange={(e) => handleVariantChange(variantIndex, 'name', e.target.value)}
                          placeholder="Renk, Boyut, Model vb."
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                        <input
                          type="text"
                          value={variant.sku}
                          onChange={(e) => handleVariantChange(variantIndex, 'sku', e.target.value)}
                          placeholder="SKU123-RED-L"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Fiyat ve Stok */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Normal Fiyat (₺)</label>
                        <input
                          type="number"
                          value={variant.price || ''}
                          onChange={(e) => handleVariantChange(variantIndex, 'price', e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <div className="flex items-center mb-1">
                                                  <input
                          type="checkbox"
                          id={`applyDiscount-${variantIndex}`}
                          checked={applyDiscounts[variantIndex] || false}
                          onChange={(e) => {
                            setApplyDiscounts(prev => ({
                              ...prev,
                              [variantIndex]: e.target.checked
                            }));
                            
                            // Eğer indirim kapatılırsa, salePrice'ı sıfırla
                            if (!e.target.checked) {
                              handleVariantChange(variantIndex, 'salePrice', 0);
                            }
                          }}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                          <label htmlFor={`applyDiscount-${variantIndex}`} className="ml-2 text-sm font-medium text-gray-700">
                            İndirim Uygula
                          </label>
                        </div>
                        <input
                          type="number"
                          value={variant.salePrice || ''}
                          onChange={(e) => handleVariantChange(variantIndex, 'salePrice', e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            applyDiscounts[variantIndex] ? 'bg-gray-50' : 'bg-gray-100'
                          }`}
                          disabled={!applyDiscounts[variantIndex]}
                        />
                        {applyDiscounts[variantIndex] && (
                          <p className="text-xs text-gray-500 mt-1">
                            İndirimli fiyat normal fiyattan düşük olmalıdır
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                        <input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => handleVariantChange(variantIndex, 'stock', e.target.value)}
                          placeholder="0"
                          min="0"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Varyasyon Görseli */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Varyasyon Görseli</label>
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, variantIndex)}
                      >
                        <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-700">
                            <span>Görsel seçin</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageChange(variantIndex, file);
                              }}
                            />
                          </label>
                          <p className="pl-1">veya sürükleyip bırakın</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF max 5MB</p>
                        {selectedFiles[variantIndex] && (
                          <div className="mt-2 text-sm text-green-600">
                            Görsel seçildi: {selectedFiles[variantIndex].name}
                          </div>
                        )}
                        {variant.image && !selectedFiles[variantIndex] && (
                          <div className="mt-2 text-sm text-blue-600">
                            Mevcut görsel: {variant.image.split('/').pop()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Varyasyon Seçenekleri */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700">Varyasyon Seçenekleri</label>
                        <button
                          type="button"
                          onClick={() => handleAddOption(variantIndex)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Seçenek Ekle
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {variant.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-600 mb-1">Seçenek Adı</label>
                              <input
                                type="text"
                                value={option.name}
                                onChange={(e) => handleOptionChange(variantIndex, optionIndex, 'name', e.target.value)}
                                placeholder="Renk, Boyut, Model vb."
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-600 mb-1">Seçenek Değeri</label>
                              <input
                                type="text"
                                value={option.value}
                                onChange={(e) => handleOptionChange(variantIndex, optionIndex, 'value', e.target.value)}
                                placeholder="Kırmızı, XL, iPhone 14 vb."
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            {variant.options.length > 1 && (
                              <button
                                onClick={() => handleRemoveOption(variantIndex, optionIndex)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Seçeneği sil"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {variant.options.length === 0 && (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          Henüz seçenek eklenmemiş. Varyasyonunuzun özelliklerini tanımlayın.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VariationModal; 