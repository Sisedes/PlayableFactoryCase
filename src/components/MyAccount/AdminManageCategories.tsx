"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/store/authStore";
import Image from "next/image";
import { getAllCategoriesForAdmin, createCategory, updateCategory, deleteCategory } from "@/services/categoryService";
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

const AdminManageCategories = () => {
  const { accessToken } = useAuth();
  const [categories, setCategories] = useState<LocalCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    sortOrder: 0
  });
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState<string>('');
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [editCategory, setEditCategory] = useState<LocalCategory | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!accessToken) return;
      
      setLoading(true);
      try {
        const categoriesResponse = await getAllCategoriesForAdmin(accessToken);
        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data as unknown as LocalCategory[]);
        } else {
          setCategories([]);
        }
      } catch (error) {
        setCategories([]);
        console.error('Kategoriler yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchCategories();
    }
  }, [accessToken]);

  const handleCategoryFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCategoryForm(prev => ({
      ...prev,
      [name]: name === 'sortOrder' ? parseInt(value) || 0 : value
    }));
  };

  const handleCategoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processCategoryImage(file);
    }
  };

  const processCategoryImage = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Resim dosyası 10MB\'dan büyük olamaz');
      return;
    }
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Sadece JPEG, PNG ve WebP dosyaları yükleyebilirsiniz');
      return;
    }

    setCategoryImage(file);
    
    const imageUrl = URL.createObjectURL(file);
    setCategoryImagePreview(imageUrl);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessToken) {
      toast.error('Giriş yapmanız gerekiyor');
      return;
    }

    if (!categoryForm.name || !categoryForm.description) {
      toast.error('Lütfen gerekli alanları doldurun');
      return;
    }

    setCategoryLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('name', categoryForm.name);
      formData.append('description', categoryForm.description);
      
      if (categoryForm.sortOrder !== undefined) {
        formData.append('sortOrder', categoryForm.sortOrder.toString());
      }
      
      if (categoryImage) {
        formData.append('categoryImage', categoryImage);
      }
      
      let result;
      
      if (editCategory) {
        result = await updateCategory(editCategory._id, formData, accessToken);
      } else {
        result = await createCategory(formData, accessToken);
      }
      
      if (result.success) {
        toast.success(editCategory ? 'Kategori başarıyla güncellendi!' : 'Kategori başarıyla eklendi!');
        
        setCategoryForm({
          name: '',
          description: '',
          sortOrder: 0
        });
        setCategoryImage(null);
        setCategoryImagePreview('');
        setEditCategory(null);
        
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
        
        const categoriesResponse = await getAllCategoriesForAdmin(accessToken);
        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data as unknown as LocalCategory[]);
        }
      } else {
        toast.error('Hata: ' + result.message);
      }
    } catch (error) {
      toast.error('Kategori işlemi sırasında bir hata oluştu');
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleEditCategory = (category: LocalCategory) => {
    setEditCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description,
      sortOrder: category.sortOrder
    });
    setCategoryImage(null);
    setCategoryImagePreview(category.image ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${category.image}` : '');
  };

  const handleCancelEdit = () => {
    setEditCategory(null);
    setCategoryForm({
      name: '',
      description: '',
      sortOrder: 0
    });
    setCategoryImage(null);
    setCategoryImagePreview('');
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!accessToken || !confirm('Bu kategoriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) return;

    try {
      const result = await deleteCategory(categoryId, accessToken);
      
      if (result.success) {
        toast.success('Kategori başarıyla silindi');
        setDeleteCategoryId(null);
        
        const categoriesResponse = await getAllCategoriesForAdmin(accessToken);
        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data as unknown as LocalCategory[]);
        }
      } else {
        toast.error(result.message || 'Kategori silinirken hata oluştu');
      }
    } catch (error) {
      toast.error('Kategori silinirken hata oluştu');
    }
  };

  const handleToggleCategoryStatus = async (categoryId: string, currentStatus: boolean) => {
    if (!accessToken) {
      toast.error('Giriş yapmanız gerekiyor');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('isActive', (!currentStatus).toString());
      
      const result = await updateCategory(categoryId, formData, accessToken);
      if (result.success) {
        toast.success(`Kategori ${!currentStatus ? 'aktif' : 'pasif'} hale getirildi!`);
        
        const categoriesResponse = await getAllCategoriesForAdmin(accessToken);
        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data as unknown as LocalCategory[]);
        }
      } else {
        toast.error('Hata: ' + result.message);
      }
    } catch (error) {
      toast.error('Kategori durumu değiştirilirken bir hata oluştu');
    }
  };

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '/images/categories/default.png';
    return imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${imageUrl}`;
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
            Kategori Yönetimi
          </h2>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              Toplam: {categories.length} kategori
            </span>
          </div>
        </div>

        {/* Kategori Ekleme/Düzenleme Formu */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="font-medium text-lg text-dark mb-4">
            {editCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
          </h3>
          
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block mb-2 text-dark font-medium">
                  Kategori Adı <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={categoryForm.name}
                  onChange={handleCategoryFormChange}
                  placeholder="Kategori adını girin"
                  required
                  className="rounded-md border border-gray-3 bg-white placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <div>
                <label htmlFor="sortOrder" className="block mb-2 text-dark font-medium">
                  Sıralama
                </label>
                <input
                  type="number"
                  id="sortOrder"
                  name="sortOrder"
                  value={categoryForm.sortOrder}
                  onChange={handleCategoryFormChange}
                  placeholder="0"
                  min="0"
                  className="rounded-md border border-gray-3 bg-white placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block mb-2 text-dark font-medium">
                Açıklama <span className="text-red">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={categoryForm.description}
                onChange={handleCategoryFormChange}
                placeholder="Kategori açıklamasını girin"
                rows={3}
                required
                className="rounded-md border border-gray-3 bg-white placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 resize-none"
              />
            </div>

            <div>
              <label htmlFor="categoryImage" className="block mb-2 text-dark font-medium">
                Kategori Görseli
              </label>
              <input
                type="file"
                id="categoryImage"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleCategoryImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {categoryImagePreview && (
                <div className="mt-3">
                  <img
                    src={categoryImagePreview}
                    alt="Önizleme"
                    className="w-24 h-24 object-cover rounded-md border border-gray-200"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              {editCategory && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors duration-200"
                >
                  İptal
                </button>
              )}
              <button
                type="submit"
                disabled={categoryLoading}
                className="inline-flex items-center font-medium text-white bg-blue py-2 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {categoryLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {editCategory ? 'Güncelleniyor...' : 'Ekleniyor...'}
                  </>
                ) : (
                  editCategory ? 'Kategoriyi Güncelle' : 'Kategori Ekle'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Kategori Listesi - Tablo Formatı */}
        {categories.length > 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                <div className="col-span-4">Kategori Bilgileri</div>
                <div className="col-span-3">Açıklama</div>
                <div className="col-span-2">Sıralama & Slug</div>
                <div className="col-span-1">Durum</div>
                <div className="col-span-2">İşlemler</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {categories.map((category) => (
                <div key={category._id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Kategori Bilgileri */}
                    <div className="col-span-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 flex-shrink-0">
                          {category.image ? (
                            <Image
                              src={getImageUrl(category.image)}
                              alt={category.name}
                              width={48}
                              height={48}
                              className="object-cover rounded-md"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-dark">{category.name}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(category.createdAt).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Açıklama */}
                    <div className="col-span-3">
                      <p className="text-sm text-gray-600 line-clamp-2">{category.description}</p>
                    </div>

                    {/* Sıralama & Slug */}
                    <div className="col-span-2">
                      <div className="text-sm">
                        <p className="font-medium text-dark">Sıra: {category.sortOrder}</p>
                        <p className="text-gray-500 text-xs truncate">/{category.slug}</p>
                      </div>
                    </div>

                    {/* Durum */}
                    <div className="col-span-1">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                        category.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {category.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>

                    {/* İşlemler */}
                    <div className="col-span-2">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="inline-flex items-center px-2 py-1.5 bg-blue text-white text-xs rounded hover:bg-blue-dark transition-colors duration-200"
                          title="Kategoriyi Düzenle"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleToggleCategoryStatus(category._id, category.isActive)}
                          className={`inline-flex items-center px-2 py-1.5 text-white text-xs rounded transition-colors duration-200 ${
                            category.isActive 
                              ? 'bg-orange-500 hover:bg-orange-600' 
                              : 'bg-green-500 hover:bg-green-600'
                          }`}
                          title={category.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                        >
                          {category.isActive ? (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category._id)}
                          className="inline-flex items-center px-2 py-1.5 bg-red text-white text-xs rounded hover:bg-red-dark transition-colors duration-200"
                          title="Kategoriyi Sil"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-medium text-dark mb-2">Henüz kategori bulunmuyor</h3>
            <p className="text-gray-500 mb-4">İlk kategorinizi ekleyerek başlayın.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminManageCategories; 