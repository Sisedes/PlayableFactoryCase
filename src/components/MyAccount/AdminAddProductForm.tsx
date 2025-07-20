"use client";
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/store/authStore";
import { getAllCategoriesForAdmin } from "@/services/categoryService";
import { createProduct } from "@/services/productService";
import { createProductSchema, CreateProductInput } from "@/lib/validationSchemas";
import FileUpload from "../Common/FileUpload";
import toast from "react-hot-toast";

interface LocalCategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  productCount?: number;
}

const AdminAddProductForm = () => {
  const { accessToken } = useAuth();
  const [categories, setCategories] = useState<LocalCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [applyDiscount, setApplyDiscount] = useState(false);
  const [showVariants, setShowVariants] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    trigger
  } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      price: '',
      salePrice: '',
      stock: '',
      sku: '',
      status: 'active',
      isFeatured: false,
      trackQuantity: true,
      lowStockThreshold: '5',
      tags: [],
      variants: []
    }
  });

  const watchedPrice = watch('price');
  const watchedSalePrice = watch('salePrice');
  const watchedTags = watch('tags') || [];

  useEffect(() => {
    const fetchCategories = async () => {
      if (!accessToken) return;
      
      setLoading(true);
      try {
        const categoriesResponse = await getAllCategoriesForAdmin(accessToken);
        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data as unknown as LocalCategory[]);
        }
      } catch (error) {
        console.error('Kategoriler yüklenirken hata:', error);
        toast.error('Kategoriler yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchCategories();
    }
  }, [accessToken]);

  const onSubmit = async (data: CreateProductInput) => {
    if (!accessToken) {
      toast.error('Giriş yapmanız gerekiyor');
      return;
    }

    if (applyDiscount && (!data.salePrice || Number(data.salePrice) >= Number(data.price))) {
      toast.error('İndirimli fiyat normal fiyattan düşük olmalıdır');
      return;
    }

    setSubmitLoading(true);

    try {
      const formData = new FormData();
      
      formData.append('name', data.name.trim());
      formData.append('description', data.description.trim());
      formData.append('shortDescription', data.description.trim().substring(0, 160));
      formData.append('category', data.category);
      formData.append('price', data.price);
      formData.append('stock', data.stock);
      formData.append('sku', data.sku?.trim() || `SKU-${Date.now()}`);
      formData.append('status', data.status);
      formData.append('trackQuantity', String(data.trackQuantity ?? true));
      formData.append('lowStockThreshold', data.lowStockThreshold || '5');

      if (applyDiscount && data.salePrice) {
        formData.append('salePrice', data.salePrice);
      }

      if (data.isFeatured) {
        formData.append('isFeatured', String(data.isFeatured));
      }

      if (data.tags && data.tags.length > 0) {
        formData.append('tags', JSON.stringify(data.tags));
      }

      if (data.images) {
        if (Array.isArray(data.images)) {
          data.images.forEach((file) => {
            formData.append('images', file);
          });
        } else {
          formData.append('images', data.images);
        }
      }

      if (data.variants && data.variants.length > 0) {
        formData.append('variants', JSON.stringify(data.variants));
      }

      console.log('FormData içeriği:');
      Array.from(formData.entries()).forEach(([key, value]) => {
        console.log(`${key}:`, value);
      });

      const result = await createProduct(formData, accessToken);
      
      if (result.success) {
        toast.success('Ürün başarıyla eklendi!');
        
        reset();
        setApplyDiscount(false);
        setShowVariants(false);
        setTagInput('');
      } else {
        toast.error('Hata: ' + result.message);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ürün eklenirken bir hata oluştu');
    } finally {
      setSubmitLoading(false);
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !watchedTags.includes(trimmedTag)) {
      const newTags = [...watchedTags, trimmedTag];
      setValue('tags', newTags);
      setTagInput('');
      trigger('tags');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = watchedTags.filter(tag => tag !== tagToRemove);
    setValue('tags', newTags);
    trigger('tags');
  };

  const addVariant = () => {
    const currentVariants = watch('variants') || [];
    const newVariant = {
      name: '',
      options: [{ name: '', value: '' }],
      sku: '',
      stock: '0',
      isDefault: currentVariants.length === 0
    };
    setValue('variants', [...currentVariants, newVariant]);
    setShowVariants(true);
  };

  const removeVariant = (index: number) => {
    const currentVariants = watch('variants') || [];
    const newVariants = currentVariants.filter((_, i) => i !== index);
    setValue('variants', newVariants);
    if (newVariants.length === 0) {
      setShowVariants(false);
    }
  };

  const generateSKU = () => {
    const name = watch('name');
    if (name) {
      const sku = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 10) + '-' + Date.now().toString().slice(-6);
      setValue('sku', sku.toUpperCase());
      trigger('sku');
    }
  };

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
    <div className="xl:max-w-[770px] w-full bg-white rounded-xl shadow-1">
      <div className="p-4 sm:p-7.5 xl:p-10">
        <div className="flex items-center justify-between mb-7">
          <h2 className="font-medium text-xl sm:text-2xl text-dark">
            Yeni Ürün Ekle
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-dark border-b border-gray-200 pb-2">
              Temel Bilgiler
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ürün Adı <span className="text-red-500">*</span>
              </label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className={`w-full rounded-md border px-4 py-3 text-dark outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${
                      errors.name ? 'border-red-300 bg-red-50' : 'border-gray-3 bg-gray-1'
                    }`}
                    placeholder="Ürün adını girin"
                  />
                )}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama <span className="text-red-500">*</span>
              </label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={4}
                    className={`w-full rounded-md border px-4 py-3 text-dark outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 resize-none ${
                      errors.description ? 'border-red-300 bg-red-50' : 'border-gray-3 bg-gray-1'
                    }`}
                    placeholder="Ürün açıklamasını girin"
                  />
                )}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori <span className="text-red-500">*</span>
              </label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className={`w-full rounded-md border px-4 py-3 text-dark outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${
                      errors.category ? 'border-red-300 bg-red-50' : 'border-gray-3 bg-gray-1'
                    }`}
                  >
                    <option value="">Kategori seçin</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-medium text-dark border-b border-gray-200 pb-2">
              Fiyat ve Stok
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fiyat (TL) <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      step="0.01"
                      className={`w-full rounded-md border px-4 py-3 text-dark outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${
                        errors.price ? 'border-red-300 bg-red-50' : 'border-gray-3 bg-gray-1'
                      }`}
                      placeholder="0.00"
                    />
                  )}
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stok Miktarı <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="stock"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      className={`w-full rounded-md border px-4 py-3 text-dark outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${
                        errors.stock ? 'border-red-300 bg-red-50' : 'border-gray-3 bg-gray-1'
                      }`}
                      placeholder="0"
                    />
                  )}
                />
                {errors.stock && (
                  <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyDiscount}
                  onChange={(e) => {
                    setApplyDiscount(e.target.checked);
                    if (!e.target.checked) {
                      setValue('salePrice', '');
                    }
                  }}
                  className="rounded border-gray-3"
                />
                <span className="text-sm font-medium text-gray-700">İndirimli fiyat uygula</span>
              </label>
            </div>

            {applyDiscount && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İndirimli Fiyat (TL)
                </label>
                <Controller
                  name="salePrice"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      step="0.01"
                      className={`w-full rounded-md border px-4 py-3 text-dark outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${
                        errors.salePrice ? 'border-red-300 bg-red-50' : 'border-gray-3 bg-gray-1'
                      }`}
                      placeholder="0.00"
                    />
                  )}
                />
                {errors.salePrice && (
                  <p className="mt-1 text-sm text-red-600">{errors.salePrice.message}</p>
                )}
                {watchedPrice && watchedSalePrice && Number(watchedSalePrice) >= Number(watchedPrice) && (
                  <p className="mt-1 text-sm text-red-600">İndirimli fiyat normal fiyattan düşük olmalıdır</p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-medium text-dark border-b border-gray-200 pb-2">
              Ürün Detayları
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-2">
                  <Controller
                    name="sku"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className={`flex-1 rounded-md border px-4 py-3 text-dark outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${
                          errors.sku ? 'border-red-300 bg-red-50' : 'border-gray-3 bg-gray-1'
                        }`}
                        placeholder="Ürün SKU"
                      />
                    )}
                  />
                  <button
                    type="button"
                    onClick={generateSKU}
                    className="px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
                    title="Otomatik SKU Oluştur"
                  >
                    Oluştur
                  </button>
                </div>
                {errors.sku && (
                  <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Düşük Stok Eşiği
                </label>
                <Controller
                  name="lowStockThreshold"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      className={`w-full rounded-md border px-4 py-3 text-dark outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${
                        errors.lowStockThreshold ? 'border-red-300 bg-red-50' : 'border-gray-3 bg-gray-1'
                      }`}
                      placeholder="5"
                    />
                  )}
                />
                {errors.lowStockThreshold && (
                  <p className="mt-1 text-sm text-red-600">{errors.lowStockThreshold.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durum
              </label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className={`w-full rounded-md border px-4 py-3 text-dark outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${
                      errors.status ? 'border-red-300 bg-red-50' : 'border-gray-3 bg-gray-1'
                    }`}
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Pasif</option>
                    <option value="draft">Taslak</option>
                  </select>
                )}
              />
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>


            <div>
              <Controller
                name="trackQuantity"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value ?? true}
                      onChange={onChange}
                      className="rounded border-gray-3"
                    />
                    <span className="text-sm font-medium text-gray-700">Stok takibi yap</span>
                  </label>
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-dark border-b border-gray-200 pb-2">
              Etiketler
            </h3>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 rounded-md border border-gray-3 bg-gray-1 px-4 py-3 text-dark outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                placeholder="Etiket ekle ve Enter'a bas"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-3 bg-blue text-white rounded-md hover:bg-blue-dark transition-colors duration-200"
              >
                Ekle
              </button>
            </div>

            {watchedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {watchedTags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-dark border-b border-gray-200 pb-2">
              Ürün Görselleri
            </h3>
            
            <FileUpload
              name="images"
              control={control}
              label="Ürün Görselleri"
              accept="image/*"
              multiple={true}
              maxFiles={5}
              maxSize={5}
              preview={true}
              className="space-y-3"
            />
            
            {errors.images && (
              <p className="text-sm text-red-600">{errors.images.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                reset();
                setApplyDiscount(false);
                setShowVariants(false);
                setTagInput('');
              }}
              className="px-6 py-3 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors duration-200"
            >
              Temizle
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="inline-flex items-center font-medium text-white bg-blue py-3 px-8 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Ekleniyor...
                </>
              ) : (
                'Ürün Ekle'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddProductForm; 