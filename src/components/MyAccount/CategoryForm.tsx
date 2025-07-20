"use client";
import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCategorySchema, updateCategorySchema, CreateCategoryInput, UpdateCategoryInput } from "@/lib/validationSchemas";
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

interface CategoryFormProps {
  category?: LocalCategory | null;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const isEditing = !!category;
  const schema = isEditing ? updateCategorySchema : createCategorySchema;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
    watch
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      sortOrder: 0,
      isActive: true
    }
  });

  const watchedImage = watch('image');

  useEffect(() => {
    if (category) {
      setValue('name', category.name);
      setValue('description', category.description);
      setValue('sortOrder', category.sortOrder);
      setValue('isActive', category.isActive);
    }
  }, [category, setValue]);

  const handleFormSubmit = async (data: any) => {
    try {
      const formData = new FormData();
      
      formData.append('name', data.name.trim());
      formData.append('description', data.description.trim());
      formData.append('sortOrder', data.sortOrder?.toString() || '0');
      formData.append('isActive', String(data.isActive ?? true));

      if (isEditing) {
        formData.append('_id', category!._id);
      }

      if (data.image) {
        if (data.image instanceof File) {
          formData.append('categoryImage', data.image);
        } else if (typeof data.image === 'string') {
        }
      }

      await onSubmit(formData);
      
      if (!isEditing) {
        reset();
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Form gönderilirken hata oluştu');
    }
  };

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '';
    return imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${imageUrl}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-dark">
          {isEditing ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
        </h3>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kategori Adı <span className="text-red-500">*</span>
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
                placeholder="Kategori adını girin"
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
                placeholder="Kategori açıklamasını girin"
              />
            )}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sıralama
          </label>
          <Controller
            name="sortOrder"
            control={control}
            render={({ field: { value, onChange } }) => (
              <input
                type="number"
                value={value || 0}
                onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                className={`w-full rounded-md border px-4 py-3 text-dark outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${
                  errors.sortOrder ? 'border-red-300 bg-red-50' : 'border-gray-3 bg-gray-1'
                }`}
                placeholder="0"
                min="0"
                max="999"
              />
            )}
          />
          {errors.sortOrder && (
            <p className="mt-1 text-sm text-red-600">{errors.sortOrder.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Düşük sayılar daha önce görünür (0-999 arası)
          </p>
        </div>

        <div>
          <Controller
            name="isActive"
            control={control}
            render={({ field: { value, onChange } }) => (
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value ?? true}
                  onChange={onChange}
                  className="rounded border-gray-3"
                />
                <span className="text-sm font-medium text-gray-700">Kategori aktif</span>
              </label>
            )}
          />
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Kategori Görseli</h4>
          
          {isEditing && category?.image && !watchedImage && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Mevcut Görsel:</p>
              <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={getImageUrl(category.image)}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
          
          <FileUpload
            name="image"
            control={control}
            label="Yeni Görsel Yükle"
            accept="image/*"
            multiple={false}
            maxFiles={1}
            maxSize={5}
            preview={true}
            className="space-y-3"
          />
          
          {errors.image && (
            <p className="text-sm text-red-600">{errors.image.message}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors duration-200"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="inline-flex items-center font-medium text-white bg-blue py-3 px-8 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting || loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEditing ? 'Güncelleniyor...' : 'Ekleniyor...'}
              </>
            ) : (
              isEditing ? 'Kategoriyi Güncelle' : 'Kategori Ekle'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm; 