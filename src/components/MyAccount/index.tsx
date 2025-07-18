"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import AddressModal from "./AddressModal";
import Orders from "../Orders";
import { useAuth } from "@/store/authStore";
import { resendVerification } from "@/services";
import { getAllCategories, getAllCategoriesForAdmin, createCategory, updateCategory, deleteCategory } from "@/services/categoryService";
import { 
  getAllProducts, 
  getAllProductsForAdmin, 
  updateProductAdmin, 
  deleteProductAdmin, 
  bulkUpdateProducts,
  deleteProductImage,
  setMainImage,
  getStockHistory,
  updateStock,
  getLowStockAlerts,
  getStockStatistics
} from "@/services/productService";
import { 
  getUserAddresses, 
  addAddress, 
  updateAddress, 
  deleteAddress, 
  setDefaultAddress,
  Address,
  AddressFormData 
} from "@/services/addressService";
import { 
  updateProfile, 
  sendPasswordResetCode, 
  resetPasswordWithCode,
  getAllCustomersForAdmin,
  getCustomerDetails,
  updateCustomerStatus,
  Customer,
  CustomerDetails
} from "@/services/userService";
import { 
  getFavoriteProducts, 
  addToFavorites, 
  removeFromFavorites,
  FavoriteProduct 
} from "@/services/favoriteService";
import { 
  getDashboardStats, 
  DashboardStats, 
  getAdvancedReports, 
  bulkCategoryAssignment, 
  bulkPriceUpdate, 
  getNotifications, 
  updateNotificationSettings,
  AdvancedReportData,
  Notification,
  NotificationSettings 
} from "@/services/adminService";
import PasswordResetModal from "./PasswordResetModal";
import AdminOrders from "../Orders/AdminOrders";
import StockHistoryModal from "../StockManagement/StockHistoryModal";
import UpdateStockModal from "../StockManagement/UpdateStockModal";
import LowStockAlerts from "../StockManagement/LowStockAlerts";
import axios from "axios";

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
  }>;
  tags?: string[];
  status: 'draft' | 'active' | 'inactive';
  isFeatured?: boolean;
  averageRating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

const MyAccount = () => {
  const [activeTab, setActiveTab] = useState("favorites");
  const [addressModal, setAddressModal] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  
  const [categories, setCategories] = useState<LocalCategory[]>([]);
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [editProduct, setEditProduct] = useState<LocalProduct | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  useEffect(() => {
    console.log('selectedProducts değişti:', selectedProducts);
    console.log('selectedProducts uzunluğu:', selectedProducts.length);
  }, [selectedProducts]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [editProductLoading, setEditProductLoading] = useState(false);
  const [editApplyDiscount, setEditApplyDiscount] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    price: '',
    salePrice: '',
    description: '',
    stock: '',
    sku: '',
    status: 'active'
  });
  const [applyDiscount, setApplyDiscount] = useState(false);
  const [productImages, setProductImages] = useState<FileList | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressModalLoading, setAddressModalLoading] = useState(false);

  const { user, accessToken, isAdmin, updateUserProfile } = useAuth();
  
  console.log('MyAccount - accessToken:', accessToken);
  console.log('MyAccount - isAdmin:', isAdmin);
  console.log('MyAccount - user:', user);

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  const [passwordResetModal, setPasswordResetModal] = useState(false);
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);

  const [favoriteProducts, setFavoriteProducts] = useState<FavoriteProduct[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewActionLoading, setReviewActionLoading] = useState<string | null>(null); 
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

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

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customerPagination, setCustomerPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCustomers: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetails | null>(null);
  const [customerDetailsModal, setCustomerDetailsModal] = useState(false);
  const [customerDetailsLoading, setCustomerDetailsLoading] = useState(false);

  const [stockHistoryModal, setStockHistoryModal] = useState(false);
  const [updateStockModal, setUpdateStockModal] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] = useState<LocalProduct | null>(null);
  const [stockStatistics, setStockStatistics] = useState<any>(null);
  const [stockStatsLoading, setStockStatsLoading] = useState(false);

  const [reportType, setReportType] = useState('sales');
  const [reportPeriod, setReportPeriod] = useState('7days');
  const [reportData, setReportData] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const [bulkOperationType, setBulkOperationType] = useState('');
  const [bulkOperationLoading, setBulkOperationLoading] = useState(false);
  const [bulkSelectedCategories, setBulkSelectedCategories] = useState<string[]>([]);
  const [bulkPriceChange, setBulkPriceChange] = useState({
    type: 'percentage',
    value: ''
  });

  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    newOrders: true,
    lowStock: true,
    systemAlerts: true,
    emailNotifications: true
  });

  useEffect(() => {
    const fetchData = async () => {
      if (isAdmin) {
        setLoading(true);
        try {
          console.log('Admin verileri yükleniyor...');
          
          const [categoriesResponse, productsResponse] = await Promise.all([
            getAllCategoriesForAdmin(accessToken || '').catch(error => {
              console.error('Kategoriler yüklenirken hata:', error);
              return { success: false, data: [], message: 'Kategoriler yüklenemedi' };
            }),
            getAllProductsForAdmin({}, accessToken || '').catch(error => {
              console.error('Ürünler yüklenirken hata:', error);
              return { success: false, data: [], message: 'Ürünler yüklenemedi' };
            })
          ]);
          
          if (categoriesResponse.success && categoriesResponse.data) {
            setCategories(categoriesResponse.data as unknown as LocalCategory[]);
          } else {
            console.warn('Kategoriler yüklenemedi:', categoriesResponse.message);
            setCategories([]);
          }
          
          if (productsResponse.success && productsResponse.data) {
            setProducts(productsResponse.data as unknown as LocalProduct[]);
          } else {
            console.warn('Ürünler yüklenemedi:', productsResponse.message);
            setProducts([]);
          }
        } catch (error) {
          console.error('Veri yükleme hatası:', error);
          setCategories([]);
          setProducts([]);
        } finally {
          setLoading(false);
        }
      }
    };

    if (user !== null && typeof isAdmin !== 'undefined' && accessToken) {
      fetchData();
      loadAddresses();
      loadFavoriteProducts();
      
      if (isAdmin) {
        loadDashboardStats();
        setActiveTab("dashboard");
      }
      
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || ''
      });
    }
  }, [isAdmin, user, accessToken]);

  useEffect(() => {
    if (activeTab === 'stock-management' && isAdmin && accessToken) {
      loadStockStatistics();
    }
    if (activeTab === 'advanced-reports' && isAdmin && accessToken) {
      loadAdvancedReports();
    }
    if (activeTab === 'notifications' && isAdmin && accessToken) {
      loadNotifications();
    }
  }, [activeTab, isAdmin, accessToken]);

  const handleProductFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductImages(e.target.files);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessToken) {
      alert('Giriş yapmanız gerekiyor');
      return;
    }

    if (!productForm.name || !productForm.category || !productForm.price || !productForm.description || !productForm.stock) {
      alert('Lütfen gerekli alanları doldurun');
      return;
    }

    if (applyDiscount) {
      if (!productForm.salePrice) {
        alert('İndirim uygulamak istiyorsanız indirimli fiyat girmelisiniz');
        return;
      }
      if (parseFloat(productForm.salePrice) >= parseFloat(productForm.price)) {
      alert('İndirimli fiyat normal fiyattan düşük olmalıdır');
      return;
      }
    }

    setSubmitLoading(true);
    
    try {
      console.log('Gönderilecek status değeri:', productForm.status);
      const formData = new FormData();
      
      formData.append('name', productForm.name);
      formData.append('category', productForm.category);
      formData.append('price', productForm.price);
      if (applyDiscount && productForm.salePrice) {
        formData.append('salePrice', productForm.salePrice);
      }
      formData.append('description', productForm.description);
      formData.append('stock', productForm.stock);
      if (productForm.sku) formData.append('sku', productForm.sku);
      formData.append('status', productForm.status);
      
      if (productImages) {
        for (let i = 0; i < productImages.length; i++) {
          formData.append('images', productImages[i]);
        }
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Ürün başarıyla eklendi!');
        setProductForm({
          name: '',
          category: '',
          price: '',
          salePrice: '',
          description: '',
          stock: '',
          sku: '',
          status: 'active'
        });
        setApplyDiscount(false);
        setProductImages(null);
        
        const productsResponse = await getAllProductsForAdmin({}, accessToken || '');
        if (productsResponse.success) {
          setProducts(productsResponse.data as unknown as LocalProduct[]);
        }
        
        setActiveTab('manage-products');
      } else {
        alert('Hata: ' + result.message);
      }
    } catch (error) {
      console.error('Ürün ekleme hatası:', error);
      alert('Ürün eklenirken bir hata oluştu');
    } finally {
      setSubmitLoading(false);
    }
  };

  const openAddressModal = () => {
    setEditingAddress(null);
    setAddressModal(true);
  };

  const openEditAddressModal = (address: Address) => {
    setEditingAddress(address);
    setAddressModal(true);
  };

  const closeAddressModal = () => {
    setEditingAddress(null);
    setAddressModal(false);
  };

  const handleResendVerification = async () => {
    if (!accessToken) {
      setResendMessage('Giriş yapmanız gereklidir.');
      return;
    }

    setResendLoading(true);
    setResendMessage(null);

    const response = await resendVerification(accessToken);
    if (response.success) {
      setResendMessage('Doğrulama e-postası başarıyla gönderildi! E-posta kutunuzu kontrol edin.');
    } else {
      setResendMessage(response.message || 'E-posta gönderilirken hata oluştu.');
    }
    
    setResendLoading(false);
    
    setTimeout(() => {
      setResendMessage(null);
    }, 5000);
  };

  const loadAddresses = async () => {
    if (!accessToken) return;
    
    setAddressLoading(true);
    try {
      const response = await getUserAddresses(accessToken);
      if (response.success && response.data) {
        setAddresses(response.data);
      }
    } catch (error) {
      console.error('Adresler yüklenirken hata:', error);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleAddressSave = async (addressData: AddressFormData) => {
    if (!accessToken) return;

    setAddressModalLoading(true);
    try {
      let response;
      if (editingAddress) {
        response = await updateAddress(editingAddress._id!, addressData, accessToken);
      } else {
        response = await addAddress(addressData, accessToken);
      }

      if (response.success) {
        await loadAddresses();
        alert(response.message || (editingAddress ? 'Adres güncellendi' : 'Adres eklendi'));
      } else {
        alert(response.message || 'İşlem başarısız');
      }
    } catch (error) {
      console.error('Adres kaydetme hatası:', error);
      alert('Adres kaydedilirken hata oluştu');
    } finally {
      setAddressModalLoading(false);
    }
  };

  const handleAddressDelete = async (addressId: string) => {
    if (!accessToken || !confirm('Bu adresi silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await deleteAddress(addressId, accessToken);
      if (response.success) {
        await loadAddresses();
        alert('Adres silindi');
      } else {
        alert(response.message || 'Adres silinemedi');
      }
    } catch (error) {
      console.error('Adres silme hatası:', error);
      alert('Adres silinirken hata oluştu');
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    if (!accessToken) return;

    try {
      const response = await setDefaultAddress(addressId, accessToken);
      if (response.success) {
        await loadAddresses();
        alert('Varsayılan adres güncellendi');
      } else {
        alert(response.message || 'Varsayılan adres güncellenemedi');
      }
    } catch (error) {
      console.error('Varsayılan adres ayarlama hatası:', error);
      alert('Varsayılan adres ayarlanırken hata oluştu');
    }
  };

  const handleProfileFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    setProfileLoading(true);
    setProfileMessage(null);

    try {
      const response = await updateProfile(profileForm, accessToken);
      if (response.success) {
        setProfileMessage('Profil başarıyla güncellendi');
        updateUserProfile(profileForm);
      } else {
        setProfileMessage(response.message || 'Profil güncellenirken hata oluştu');
      }
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      setProfileMessage('Profil güncellenirken hata oluştu');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSendResetCode = async (email: string) => {
    if (!accessToken) return;

    setPasswordResetLoading(true);
    try {
      const response = await sendPasswordResetCode({ email }, accessToken);
      if (response.success) {
        alert(response.message || 'Kod gönderildi');
      } else {
        alert(response.message || 'Kod gönderilirken hata oluştu');
      }
    } catch (error) {
      console.error('Kod gönderme hatası:', error);
      alert('Kod gönderilirken hata oluştu');
    } finally {
      setPasswordResetLoading(false);
    }
  };

  const handleResetPassword = async (code: string, newPassword: string) => {
    if (!accessToken) return;

    setPasswordResetLoading(true);
    try {
      const response = await resetPasswordWithCode({ code, newPassword }, accessToken);
      if (response.success) {
        alert(response.message || 'Parola başarıyla güncellendi');
        setPasswordResetModal(false);
      } else {
        alert(response.message || 'Parola güncellenirken hata oluştu');
      }
    } catch (error) {
      console.error('Parola güncelleme hatası:', error);
      alert('Parola güncellenirken hata oluştu');
    } finally {
      setPasswordResetLoading(false);
    }
  };

  const loadFavoriteProducts = async () => {
    if (!accessToken) return;
    
    setFavoritesLoading(true);
    try {
      const response = await getFavoriteProducts(accessToken);
      if (response.success && response.data) {
        setFavoriteProducts(response.data);
      }
    } catch (error) {
      console.error('Favori ürünler yüklenirken hata:', error);
    } finally {
      setFavoritesLoading(false);
    }
  };

  const handleAddToFavorites = async (productId: string) => {
    if (!accessToken) return;

    try {
      const response = await addToFavorites(productId, accessToken);
      if (response.success) {
        await loadFavoriteProducts();
        alert(response.message || 'Ürün favorilere eklendi');
      } else {
        alert(response.message || 'Ürün favorilere eklenemedi');
      }
    } catch (error) {
      console.error('Favorilere ekleme hatası:', error);
      alert('Ürün favorilere eklenirken hata oluştu');
    }
  };

  const handleRemoveFromFavorites = async (productId: string) => {
    if (!accessToken || !confirm('Bu ürünü favorilerden çıkarmak istediğinizden emin misiniz?')) return;

    try {
      const response = await removeFromFavorites(productId, accessToken);
      if (response.success) {
        await loadFavoriteProducts();
        alert('Ürün favorilerden çıkarıldı');
      } else {
        alert(response.message || 'Ürün favorilerden çıkarılamadı');
      }
    } catch (error) {
      console.error('Favorilerden çıkarma hatası:', error);
      alert('Ürün favorilerden çıkarılırken hata oluştu');
    }
  };

  const loadPendingReviews = async () => {
    if (!accessToken || !isAdmin) return;
    setReviewsLoading(true);
    setReviewMessage(null);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/reviews/pending`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (res.data.success) {
        setPendingReviews(res.data.data);
      } else {
        setReviewMessage(res.data.message || 'Yorumlar yüklenemedi');
      }
    } catch (err: any) {
      setReviewMessage('Yorumlar yüklenirken hata oluştu');
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleApproveReview = async (reviewId: string) => {
    if (!accessToken) return;
    setReviewActionLoading(reviewId);
    setReviewMessage(null);
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/reviews/${reviewId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (res.data.success) {
        setPendingReviews(prev => prev.filter(r => r._id !== reviewId));
        setReviewMessage('Yorum başarıyla onaylandı');
      } else {
        setReviewMessage(res.data.message || 'Yorum onaylanamadı');
      }
    } catch (err: any) {
      setReviewMessage('Yorum onaylanırken hata oluştu');
    } finally {
      setReviewActionLoading(null);
    }
  };

  const handleRejectReview = async (reviewId: string) => {
    if (!accessToken) return;
    setReviewActionLoading(reviewId);
    setReviewMessage(null);
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/reviews/${reviewId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (res.data.success) {
        setPendingReviews(prev => prev.filter(r => r._id !== reviewId));
        setReviewMessage('Yorum reddedildi');
      } else {
        setReviewMessage(res.data.message || 'Yorum reddedilemedi');
      }
    } catch (err: any) {
      setReviewMessage('Yorum reddedilirken hata oluştu');
    } finally {
      setReviewActionLoading(null);
    }
  };

  const loadDashboardStats = async () => {
    if (!accessToken || !isAdmin) return;
    
    setDashboardLoading(true);
    try {
      const response = await getDashboardStats(accessToken);
      if (response.success && response.data) {
        setDashboardStats(response.data);
      }
    } catch (error) {
      console.error('Dashboard istatistikleri yüklenirken hata:', error);
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin && activeTab === 'manage-reviews') {
      loadPendingReviews();
    }
    if (isAdmin && activeTab === 'manage-customers') {
      loadCustomers();
    }
  }, [isAdmin, activeTab, accessToken]);

  useEffect(() => {
    setSelectedProducts([]);
  }, [selectedCategory]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && customerDetailsModal) {
        setCustomerDetailsModal(false);
        setSelectedCustomer(null);
      }
    };

    if (customerDetailsModal) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [customerDetailsModal]);

  const getCategoryProductCount = (categoryId: string) => {
    return products.filter(product => product.category._id === categoryId).length;
  };

  const handleProductSelect = (productId: string) => {
    console.log('Ürün seçimi:', productId);
    setSelectedProducts(prev => {
      const newSelection = prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      console.log('Yeni seçim:', newSelection);
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    const filteredProducts = selectedCategory === 'all' 
      ? products 
      : products.filter(product => product.category._id === selectedCategory);
    
    const allProductIds = filteredProducts.map(p => p._id);
    console.log('Tümünü seç:', allProductIds);
    console.log('Seçilecek ürün sayısı:', allProductIds.length);
    setSelectedProducts(allProductIds);
  };

  const handleDeselectAll = () => {
    console.log('Tüm seçimleri kaldır');
    setSelectedProducts([]);
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (!accessToken || selectedProducts.length === 0) {
      alert('Lütfen işlem yapmak için ürün seçin');
      return;
    }

    const actionText = action === 'activate' ? 'aktif yapmak' : 
                      action === 'deactivate' ? 'pasif yapmak' : 'silmek';
    
    if (!confirm(`${selectedProducts.length} ürünü ${actionText} istediğinizden emin misiniz?`)) {
      return;
    }

    setBulkActionLoading(true);
    try {
      const response = await bulkUpdateProducts(selectedProducts, action, accessToken);
      if (response.success) {
        alert(response.message);
        setSelectedProducts([]);
        const productsResponse = await getAllProductsForAdmin({}, accessToken || '');
        if (productsResponse.success) {
          setProducts(productsResponse.data as unknown as LocalProduct[]);
        }
      } else {
        alert(response.message || 'İşlem başarısız');
      }
    } catch (error) {
      console.error('Toplu işlem hatası:', error);
      alert('Toplu işlem sırasında hata oluştu');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleEditProduct = async (productId: string, formData: FormData) => {
    const price = parseFloat(formData.get('price') as string);
    const salePrice = parseFloat(formData.get('salePrice') as string);

    if (editApplyDiscount) {
      if (!salePrice) {
        alert('İndirim uygulamak istiyorsanız indirimli fiyat girmelisiniz');
        setEditProductLoading(false);
        return;
      }
      if (salePrice >= price) {
        alert('İndirimli fiyat normal fiyattan düşük olmalıdır');
        setEditProductLoading(false);
        return;
      }
    }

    if (!editApplyDiscount) {
      formData.delete('salePrice');
    }

    if (!accessToken) return;

    setEditProductLoading(true);
    try {
      const response = await updateProductAdmin(productId, formData, accessToken);
      if (response.success) {
        alert('Ürün başarıyla güncellendi');
        setEditProduct(null);
        setSelectedFiles([]); 
        const productsResponse = await getAllProductsForAdmin({}, accessToken || '');
        if (productsResponse.success) {
          setProducts(productsResponse.data as unknown as LocalProduct[]);
        }
      } else {
        alert(response.message || 'Ürün güncellenirken hata oluştu');
      }
    } catch (error) {
      console.error('Ürün güncelleme hatası:', error);
      alert('Ürün güncellenirken hata oluştu');
    } finally {
      setEditProductLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!accessToken || !confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await deleteProductAdmin(productId, accessToken);
      if (response.success) {
        alert('Ürün başarıyla silindi');
        setDeleteProductId(null);
        const productsResponse = await getAllProductsForAdmin({}, accessToken || '');
        if (productsResponse.success) {
          setProducts(productsResponse.data as unknown as LocalProduct[]);
        }
      } else {
        alert(response.message || 'Ürün silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Ürün silme hatası:', error);
      alert('Ürün silinirken hata oluştu');
    }
  };

  const handleDeleteImage = async (productId: string, imageId: string) => {
    if (!accessToken) return;

    const imageToDelete = editProduct?.images.find(img => img._id === imageId);
    
    if (imageToDelete?.isMain) {
      alert('Ana resim silinemez! Önce başka bir resmi ana resim yapın, sonra bu resmi silebilirsiniz.');
      return;
    }

    if (!confirm('Bu resmi silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await deleteProductImage(productId, imageId, accessToken);
      if (response.success) {
        // Popup'ta anında güncelleme
        if (editProduct && editProduct._id === productId) {
          const updatedImages = editProduct.images.filter(img => img._id !== imageId);
          setEditProduct({
            ...editProduct,
            images: updatedImages
          });
        }
        
        const productsResponse = await getAllProductsForAdmin({}, accessToken || '');
        if (productsResponse.success) {
          setProducts(productsResponse.data as unknown as LocalProduct[]);
        }
        
        alert('Resim başarıyla silindi');
      } else {
        alert(response.message || 'Resim silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Resim silme hatası:', error);
      alert('Resim silinirken hata oluştu');
    }
  };

  const handleSetMainImage = async (productId: string, imageId: string, imageIndex: number) => {
    if (!accessToken) return;

    try {
      const response = await setMainImage(productId, imageId, accessToken);
      if (response.success) {
        if (editProduct && editProduct._id === productId) {
          const updatedImages = editProduct.images.map(img => ({
            ...img,
            isMain: img._id === imageId
          }));
          setEditProduct({
            ...editProduct,
            images: updatedImages
          });
        }
        
        const productsResponse = await getAllProductsForAdmin({}, accessToken || '');
        if (productsResponse.success) {
          setProducts(productsResponse.data as unknown as LocalProduct[]);
        }
        
        alert('Ana resim başarıyla ayarlandı');
      } else {
        alert(response.message || 'Ana resim ayarlanırken hata oluştu');
      }
    } catch (error) {
      console.error('Ana resim ayarlama hatası:', error);
      alert('Ana resim ayarlanırken hata oluştu');
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5Mb
      return isValidType && isValidSize;
    });

    if (validFiles.length !== fileArray.length) {
      alert('Bazı dosyalar geçersiz format veya boyutta. Sadece PNG, JPG, JPEG, WebP formatında ve 5MB\'dan küçük dosyalar kabul edilir.');
    }

    const currentCount = selectedFiles.length;
    const newFiles = validFiles.slice(0, 10 - currentCount);
    
    if (validFiles.length > 10 - currentCount) {
      alert(`Maksimum 10 resim yükleyebilirsiniz. ${10 - currentCount} resim daha eklenebilir.`);
    }

    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileRemove = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleCategoryFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCategoryForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processCategoryImage(file);
    }
  };

  const processCategoryImage = (file: File) => {
    if (file.size > 5 * 1024 * 1024) { // 5Mb
      alert('Resim dosyası 5MB\'dan büyük olamaz');
      return;
    }
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Sadece JPEG, PNG, WebP ve GIF dosyaları yükleyebilirsiniz');
      return;
    }

    setCategoryImage(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setCategoryImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCategoryImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processCategoryImage(files[0]);
    }
  };

  const handleCategoryImageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };



  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessToken) {
      alert('Giriş yapmanız gerekiyor');
      return;
    }

    if (!categoryForm.name || !categoryForm.description) {
      alert('Lütfen gerekli alanları doldurun');
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
        alert(editCategory ? 'Kategori başarıyla güncellendi!' : 'Kategori başarıyla eklendi!');
                                        setCategoryForm({
                                  name: '',
                                  description: '',
                                  sortOrder: 0
                                });
        setCategoryImage(null);
        setCategoryImagePreview('');
        setEditCategory(null);
        
        const categoriesResponse = await getAllCategoriesForAdmin(accessToken || '');
        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data as unknown as LocalCategory[]);
        }
      } else {
        alert('Hata: ' + result.message);
      }
    } catch (error) {
      console.error('Kategori işlemi hatası:', error);
      alert('Kategori işlemi sırasında bir hata oluştu');
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

  const handleDeleteCategory = async (categoryId: string) => {
    if (!accessToken || !confirm('Bu kategoriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) return;

    try {
      const result = await deleteCategory(categoryId, accessToken);
      
      if (result.success) {
        alert('Kategori başarıyla silindi');
        setDeleteCategoryId(null);
        
        const categoriesResponse = await getAllCategoriesForAdmin(accessToken || '');
        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data as unknown as LocalCategory[]);
        }
      } else {
        alert(result.message || 'Kategori silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Kategori silme hatası:', error);
      alert('Kategori silinirken hata oluştu');
    }
  };

  const handleToggleCategoryStatus = async (categoryId: string, currentStatus: boolean) => {
    if (!accessToken) {
      alert('Giriş yapmanız gerekiyor');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('isActive', (!currentStatus).toString());
      
      const result = await updateCategory(categoryId, formData, accessToken);
      if (result.success) {
        alert(`Kategori ${!currentStatus ? 'aktif' : 'pasif'} hale getirildi!`);
        
        const categoriesResponse = await getAllCategoriesForAdmin(accessToken);
        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data as unknown as LocalCategory[]);
        }
      } else {
        alert('Hata: ' + result.message);
      }
    } catch (error) {
      console.error('Kategori durum değiştirme hatası:', error);
      alert('Kategori durumu değiştirilirken bir hata oluştu');
    }
  };

  const loadCustomers = async (page = 1, search = '') => {
    console.log('loadCustomers çağrıldı:', { page, search, accessToken: !!accessToken });
    
    if (!accessToken) {
      console.log('Access token yok, fonksiyon sonlandırılıyor');
      return;
    }

    setCustomersLoading(true);
    try {
      console.log('API çağrısı yapılıyor...');
      const response = await getAllCustomersForAdmin({
        page: Math.max(1, page),
        limit: 10,
        search: search || '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }, accessToken);

      console.log('API yanıtı:', response);

      if (response.success && response.data) {
        console.log('Müşteri verileri:', response.data);
        setCustomers(response.data.data || []);
        setCustomerPagination(response.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalCustomers: 0,
          hasNextPage: false,
          hasPrevPage: false
        });
      } else {
        console.log('API başarısız veya veri yok');
        setCustomers([]);
        setCustomerPagination({
          currentPage: 1,
          totalPages: 1,
          totalCustomers: 0,
          hasNextPage: false,
          hasPrevPage: false
        });
      }
    } catch (error) {
      console.error('Müşteriler yüklenirken hata:', error);
      setCustomers([]);
      setCustomerPagination({
        currentPage: 1,
        totalPages: 1,
        totalCustomers: 0,
        hasNextPage: false,
        hasPrevPage: false
      });
    } finally {
      setCustomersLoading(false);
    }
  };

  const handleCustomerSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCustomers(1, customerSearch);
  };

  const handleCustomerPageChange = (page: number) => {
    if (page > 0) {
      loadCustomers(page, customerSearch);
    }
  };

  const handleViewCustomerDetails = async (customerId: string) => {
    if (!accessToken) return;

    setCustomerDetailsLoading(true);
    try {
      const response = await getCustomerDetails(customerId, accessToken);
      if (response.success) {
        setSelectedCustomer(response.data);
        setCustomerDetailsModal(true);
      }
    } catch (error) {
      console.error('Müşteri detayları yüklenirken hata:', error);
      alert('Müşteri detayları yüklenirken hata oluştu');
    } finally {
      setCustomerDetailsLoading(false);
    }
  };

  const handleUpdateCustomerStatus = async (customerId: string, isActive: boolean) => {
    if (!accessToken) return;

    try {
      const response = await updateCustomerStatus(customerId, isActive, accessToken);
      if (response.success) {
        alert(`Müşteri ${isActive ? 'aktif' : 'pasif'} yapıldı`);
        loadCustomers(customerPagination.currentPage, customerSearch);
      }
    } catch (error) {
      console.error('Müşteri durumu güncellenirken hata:', error);
      alert('Müşteri durumu güncellenirken hata oluştu');
    }
  };

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

  const handleViewStockHistory = (product: LocalProduct) => {
    setSelectedProductForStock(product);
    setStockHistoryModal(true);
  };

  const handleUpdateStock = (product: LocalProduct) => {
    setSelectedProductForStock(product);
    setUpdateStockModal(true);
  };

  const handleStockUpdated = async () => {
    if (accessToken) {
      const productsResponse = await getAllProductsForAdmin({}, accessToken);
      if (productsResponse.success) {
        setProducts(productsResponse.data as unknown as LocalProduct[]);
      }
    }
  };

  const loadAdvancedReports = async () => {
    if (!accessToken) return;
    
    setReportLoading(true);
    try {
      const params: any = {
        type: reportType,
        period: reportPeriod
      };

      if (reportPeriod === 'custom' && dateRange.startDate && dateRange.endDate) {
        params.startDate = dateRange.startDate;
        params.endDate = dateRange.endDate;
      }

      const response = await getAdvancedReports(params, accessToken);
      
      if (response.success && response.data) {
        setReportData({ [reportType]: response.data });
      } else {
        console.error('Rapor yükleme hatası:', response.message);
      }
    } catch (error) {
      console.error('Raporlar yüklenirken hata:', error);
    } finally {
      setReportLoading(false);
    }
  };

  const handleBulkCategoryAssignment = async () => {
    if (!accessToken || selectedProducts.length === 0 || bulkSelectedCategories.length === 0) {
      alert('Lütfen ürün ve kategori seçin');
      return;
    }

    setBulkOperationLoading(true);
    try {
      const response = await bulkCategoryAssignment(selectedProducts, bulkSelectedCategories, accessToken);
      
      if (response.success) {
        alert(response.data?.message || `${selectedProducts.length} ürün başarıyla kategorilere atandı`);
        setSelectedProducts([]);
        setBulkSelectedCategories([]);
        if (accessToken) {
          const productsResponse = await getAllProductsForAdmin({}, accessToken);
          if (productsResponse.success) {
            setProducts(productsResponse.data as unknown as LocalProduct[]);
          }
        }
      } else {
        alert(response.message || 'Toplu kategori atama başarısız');
      }
    } catch (error) {
      console.error('Toplu kategori atama hatası:', error);
      alert('Toplu kategori atama sırasında hata oluştu');
    } finally {
      setBulkOperationLoading(false);
    }
  };

  const handleBulkPriceUpdate = async () => {
    if (!accessToken || selectedProducts.length === 0 || !bulkPriceChange.value) {
      alert('Lütfen ürün seçin ve fiyat değişikliği belirtin');
      return;
    }

    setBulkOperationLoading(true);
    try {
      const response = await bulkPriceUpdate(
        selectedProducts, 
        bulkPriceChange.type as 'percentage' | 'fixed', 
        bulkPriceChange.value, 
        accessToken
      );
      
      if (response.success) {
        alert(response.data?.message || `${selectedProducts.length} ürünün fiyatı başarıyla güncellendi`);
        setSelectedProducts([]);
        setBulkPriceChange({ type: 'percentage', value: '' });
        if (accessToken) {
          const productsResponse = await getAllProductsForAdmin({}, accessToken);
          if (productsResponse.success) {
            setProducts(productsResponse.data as unknown as LocalProduct[]);
          }
        }
      } else {
        alert(response.message || 'Toplu fiyat güncelleme başarısız');
      }
    } catch (error) {
      console.error('Toplu fiyat güncelleme hatası:', error);
      alert('Toplu fiyat güncelleme sırasında hata oluştu');
    } finally {
      setBulkOperationLoading(false);
    }
  };

  const handleBulkImageUpload = async (files: FileList) => {
    if (!accessToken || selectedProducts.length === 0) {
      alert('Lütfen ürün seçin');
      return;
    }

    setBulkOperationLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      alert(`${selectedProducts.length} ürüne resim başarıyla yüklendi`);
      setSelectedProducts([]);
      if (accessToken) {
        const productsResponse = await getAllProductsForAdmin({}, accessToken);
        if (productsResponse.success) {
          setProducts(productsResponse.data as unknown as LocalProduct[]);
        }
      }
    } catch (error) {
      console.error('Toplu resim yükleme hatası:', error);
      alert('Toplu resim yükleme sırasında hata oluştu');
    } finally {
      setBulkOperationLoading(false);
    }
  };

  const loadNotifications = async () => {
    if (!accessToken) return;
    
    setNotificationsLoading(true);
    try {
      const response = await getNotifications(accessToken);
      
      if (response.success && response.data) {
        setNotifications(response.data);
      } else {
        console.error('Bildirim yükleme hatası:', response.message);
      }
    } catch (error) {
      console.error('Bildirimler yüklenirken hata:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleNotificationSettingsUpdate = async () => {
    if (!accessToken) return;
    
    try {
      const settings: NotificationSettings = {
        newOrders: notificationSettings.newOrders,
        lowStock: notificationSettings.lowStock,
        systemAlerts: notificationSettings.systemAlerts,
        emailNotifications: notificationSettings.emailNotifications
      };

      const response = await updateNotificationSettings(settings, accessToken);
      
      if (response.success) {
        alert('Bildirim ayarları başarıyla güncellendi');
      } else {
        alert(response.message || 'Bildirim ayarları güncellenemedi');
      }
    } catch (error) {
      console.error('Bildirim ayarları güncellenirken hata:', error);
      alert('Bildirim ayarları güncellenirken hata oluştu');
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Bildirim okundu işaretlenirken hata:', error);
    }
  };

  return (
    <>
              <Breadcrumb title={"Hesabım"} pages={[
          { name: "Hesabım" }
        ]} />

      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">
            {/* <!--== user dashboard menu start ==--> */}
            <div className="xl:max-w-[370px] w-full bg-white rounded-xl shadow-1">
              <div className="flex xl:flex-col">

                <div className="p-4 sm:p-7.5 xl:p-9">
                  <div className="flex flex-wrap xl:flex-nowrap xl:flex-col gap-4">
                    <button
                      onClick={() => setActiveTab("favorites")}
                      className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                        activeTab === "favorites"
                          ? "text-white bg-blue"
                          : "text-dark-2 bg-gray-1"
                      }`}
                    >
                      <svg
                        className="fill-current"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M11 2L13.09 8.26L20 9.27L15 14.14L16.18 21.02L11 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L11 2Z"
                          fill=""
                        />
                      </svg>
                      Favorilerim
                    </button>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                        activeTab === "orders"
                          ? "text-white bg-blue"
                          : "text-dark-2 bg-gray-1"
                      }`}
                    >
                      <svg
                        className="fill-current"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8.0203 11.9167C8.0203 11.537 7.71249 11.2292 7.3328 11.2292C6.9531 11.2292 6.6453 11.537 6.6453 11.9167V15.5833C6.6453 15.963 6.9531 16.2708 7.3328 16.2708C7.71249 16.2708 8.0203 15.963 8.0203 15.5833V11.9167Z"
                          fill=""
                        />
                        <path
                          d="M14.6661 11.2292C15.0458 11.2292 15.3536 11.537 15.3536 11.9167V15.5833C15.3536 15.963 15.0458 16.2708 14.6661 16.2708C14.2864 16.2708 13.9786 15.963 13.9786 15.5833V11.9167C13.9786 11.537 14.2864 11.2292 14.6661 11.2292Z"
                          fill=""
                        />
                        <path
                          d="M11.687 11.9167C11.687 11.537 11.3792 11.2292 10.9995 11.2292C10.6198 11.2292 10.312 11.537 10.312 11.9167V15.5833C10.312 15.963 10.6198 16.2708 10.9995 16.2708C11.3792 16.2708 11.687 15.963 11.687 15.5833V11.9167Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M15.8338 3.18356C15.3979 3.01319 14.9095 2.98443 14.2829 2.97987C14.0256 2.43753 13.473 2.0625 12.8328 2.0625H9.16613C8.52593 2.0625 7.97332 2.43753 7.716 2.97987C7.08942 2.98443 6.60107 3.01319 6.16515 3.18356C5.64432 3.38713 5.19129 3.73317 4.85788 4.18211C4.52153 4.63502 4.36363 5.21554 4.14631 6.01456L3.57076 8.12557C3.21555 8.30747 2.90473 8.55242 2.64544 8.88452C2.07527 9.61477 1.9743 10.4845 2.07573 11.4822C2.17415 12.4504 2.47894 13.6695 2.86047 15.1955L2.88467 15.2923C3.12592 16.2573 3.32179 17.0409 3.55475 17.6524C3.79764 18.2899 4.10601 18.8125 4.61441 19.2095C5.12282 19.6064 5.70456 19.7788 6.38199 19.8598C7.03174 19.9375 7.8394 19.9375 8.83415 19.9375H13.1647C14.1594 19.9375 14.9671 19.9375 15.6169 19.8598C16.2943 19.7788 16.876 19.6064 17.3844 19.2095C17.8928 18.8125 18.2012 18.2899 18.4441 17.6524C18.6771 17.0409 18.8729 16.2573 19.1142 15.2923L19.1384 15.1956C19.5199 13.6695 19.8247 12.4504 19.9231 11.4822C20.0245 10.4845 19.9236 9.61477 19.3534 8.88452C19.0941 8.55245 18.7833 8.30751 18.4282 8.12562L17.8526 6.01455C17.6353 5.21554 17.4774 4.63502 17.141 4.18211C16.8076 3.73317 16.3546 3.38713 15.8338 3.18356ZM6.66568 4.46423C6.86717 4.38548 7.11061 4.36231 7.71729 4.35618C7.97516 4.89706 8.527 5.27083 9.16613 5.27083H12.8328C13.4719 5.27083 14.0238 4.89706 14.2816 4.35618C14.8883 4.36231 15.1318 4.38548 15.3332 4.46423C15.6137 4.57384 15.8576 4.76017 16.0372 5.00191C16.1986 5.21928 16.2933 5.52299 16.56 6.50095L16.8841 7.68964C15.9328 7.56246 14.7046 7.56248 13.1787 7.5625H8.82014C7.29428 7.56248 6.06614 7.56246 5.11483 7.68963L5.43894 6.50095C5.7056 5.52299 5.80033 5.21928 5.96176 5.00191C6.14129 4.76017 6.38523 4.57384 6.66568 4.46423ZM9.16613 3.4375C9.03956 3.4375 8.93696 3.5401 8.93696 3.66667C8.93696 3.79323 9.03956 3.89583 9.16613 3.89583H12.8328C12.9594 3.89583 13.062 3.79323 13.062 3.66667C13.062 3.5401 12.9594 3.4375 12.8328 3.4375H9.16613ZM3.72922 9.73071C3.98482 9.40334 4.38904 9.18345 5.22428 9.06262C6.07737 8.93921 7.23405 8.9375 8.87703 8.9375H13.1218C14.7648 8.9375 15.9215 8.93921 16.7746 9.06262C17.6098 9.18345 18.014 9.40334 18.2696 9.73071C18.5252 10.0581 18.6405 10.5036 18.5552 11.3432C18.468 12.2007 18.1891 13.3233 17.7906 14.9172C17.5365 15.9338 17.3595 16.6372 17.1592 17.1629C16.9655 17.6713 16.7758 17.9402 16.5382 18.1257C16.3007 18.3112 15.9938 18.43 15.4536 18.4946C14.895 18.5614 14.1697 18.5625 13.1218 18.5625H8.87703C7.8291 18.5625 7.10386 18.5614 6.54525 18.4946C6.005 18.43 5.69817 18.3112 5.4606 18.1257C5.22304 17.9402 5.03337 17.6713 4.83967 17.1629C4.63938 16.6372 4.46237 15.9338 4.20822 14.9172C3.80973 13.3233 3.53086 12.2007 3.44368 11.3432C3.35832 10.5036 3.47362 10.0581 3.72922 9.73071Z"
                          fill=""
                        />
                      </svg>
                      Siparişlerim
                    </button>

                    <button
                      onClick={() => setActiveTab("addresses")}
                      className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                        activeTab === "addresses"
                          ? "text-white bg-blue"
                          : "text-dark-2 bg-gray-1"
                      }`}
                    >
                      <svg
                        className="fill-current"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8.25065 15.8125C7.87096 15.8125 7.56315 16.1203 7.56315 16.5C7.56315 16.8797 7.87096 17.1875 8.25065 17.1875H13.7507C14.1303 17.1875 14.4382 16.8797 14.4382 16.5C14.4382 16.1203 14.1303 15.8125 13.7507 15.8125H8.25065Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M11.0007 1.14581C10.3515 1.14581 9.7618 1.33173 9.12199 1.64287C8.50351 1.94363 7.78904 2.38706 6.8966 2.94094L5.00225 4.11664C4.15781 4.6407 3.48164 5.06035 2.96048 5.45947C2.42079 5.87278 2.00627 6.29371 1.70685 6.84072C1.40806 7.38659 1.2735 7.96741 1.20899 8.65396C1.14647 9.31931 1.14648 10.1329 1.14648 11.1533V12.6315C1.14647 14.3767 1.14646 15.7543 1.28646 16.8315C1.43008 17.9364 1.73183 18.8284 2.41365 19.5336C3.0986 20.2421 3.97024 20.5587 5.04929 20.7087C6.0951 20.8542 7.43075 20.8542 9.11401 20.8541H12.8872C14.5705 20.8542 15.9062 20.8542 16.952 20.7087C18.0311 20.5587 18.9027 20.2421 19.5877 19.5336C20.2695 18.8284 20.5712 17.9364 20.7148 16.8315C20.8548 15.7543 20.8548 14.3768 20.8548 12.6315V11.1533C20.8548 10.1329 20.8548 9.31929 20.7923 8.65396C20.7278 7.96741 20.5932 7.38659 20.2944 6.84072C19.995 6.29371 19.5805 5.87278 19.0408 5.45947C18.5197 5.06035 17.8435 4.64071 16.9991 4.11665L15.1047 2.94093C14.2123 2.38706 13.4978 1.94363 12.8793 1.64287C12.2395 1.33173 11.6498 1.14581 11.0007 1.14581ZM7.59022 4.12875C8.52133 3.55088 9.17602 3.14555 9.72332 2.87941C10.2565 2.62011 10.6342 2.52081 11.0007 2.52081C11.3672 2.52081 11.7448 2.62011 12.278 2.87941C12.8253 3.14555 13.48 3.55088 14.4111 4.12875L16.2444 5.26657C17.1252 5.8132 17.7436 6.19788 18.2048 6.55112C18.6536 6.89482 18.9118 7.17845 19.0883 7.50093C19.2655 7.82455 19.3689 8.20291 19.4233 8.7826C19.4791 9.37619 19.4798 10.1253 19.4798 11.1869V12.5812C19.4798 14.3879 19.4785 15.676 19.3513 16.6542C19.2264 17.6149 18.9912 18.1723 18.5991 18.5779C18.2101 18.9803 17.6805 19.2192 16.7626 19.3468C15.8225 19.4776 14.5826 19.4791 12.834 19.4791H9.16732C7.41875 19.4791 6.17883 19.4776 5.23869 19.3468C4.32077 19.2192 3.79119 18.9803 3.40221 18.5779C3.01008 18.1723 2.77486 17.6149 2.64999 16.6542C2.52285 15.676 2.52148 14.3879 2.52148 12.5812V11.1869C2.52148 10.1253 2.52218 9.37619 2.57796 8.7826C2.63243 8.20291 2.73584 7.82455 2.91299 7.50093C3.0895 7.17845 3.3477 6.89482 3.79649 6.55112C4.25774 6.19788 4.87612 5.8132 5.75689 5.26657L7.59022 4.12875Z"
                          fill=""
                        />
                      </svg>
                      Adreslerim
                    </button>

                    <button
                      onClick={() => setActiveTab("account-details")}
                      className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                        activeTab === "account-details"
                          ? "text-white bg-blue"
                          : "text-dark-2 bg-gray-1"
                      }`}
                    >
                      <svg
                        className="fill-current"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M10.9995 1.14581C8.59473 1.14581 6.64531 3.09524 6.64531 5.49998C6.64531 7.90472 8.59473 9.85415 10.9995 9.85415C13.4042 9.85415 15.3536 7.90472 15.3536 5.49998C15.3536 3.09524 13.4042 1.14581 10.9995 1.14581ZM8.02031 5.49998C8.02031 3.85463 9.35412 2.52081 10.9995 2.52081C12.6448 2.52081 13.9786 3.85463 13.9786 5.49998C13.9786 7.14533 12.6448 8.47915 10.9995 8.47915C9.35412 8.47915 8.02031 7.14533 8.02031 5.49998Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M10.9995 11.2291C8.87872 11.2291 6.92482 11.7112 5.47697 12.5256C4.05066 13.3279 2.97864 14.5439 2.97864 16.0416L2.97858 16.1351C2.97754 17.2001 2.97624 18.5368 4.14868 19.4916C4.7257 19.9614 5.53291 20.2956 6.6235 20.5163C7.71713 20.7377 9.14251 20.8541 10.9995 20.8541C12.8564 20.8541 14.2818 20.7377 15.3754 20.5163C16.466 20.2956 17.2732 19.9614 17.8503 19.4916C19.0227 18.5368 19.0214 17.2001 19.0204 16.1351L19.0203 16.0416C19.0203 14.5439 17.9483 13.3279 16.522 12.5256C15.0741 11.7112 13.1202 11.2291 10.9995 11.2291ZM4.35364 16.0416C4.35364 15.2612 4.92324 14.4147 6.15108 13.724C7.35737 13.0455 9.07014 12.6041 10.9995 12.6041C12.9288 12.6041 14.6416 13.0455 15.8479 13.724C17.0757 14.4147 17.6453 15.2612 17.6453 16.0416C17.6453 17.2405 17.6084 17.9153 16.982 18.4254C16.6424 18.702 16.0746 18.9719 15.1027 19.1686C14.1338 19.3648 12.8092 19.4791 10.9995 19.4791C9.18977 19.4791 7.86515 19.3648 6.89628 19.1686C5.92437 18.9719 5.35658 18.702 5.01693 18.4254C4.39059 17.9153 4.35364 17.2405 4.35364 16.0416Z"
                          fill=""
                        />
                      </svg>
                      Hesap Detaylarım
                    </button>

                    {/* Admin Sekmeler */}
                    {isAdmin && (
                      <>
                    <button
                          onClick={() => setActiveTab("dashboard")}
                      className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                            activeTab === "dashboard"
                          ? "text-white bg-blue"
                          : "text-dark-2 bg-gray-1"
                      }`}
                    >
                      <svg
                        className="fill-current"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                              d="M3.4375 3.4375C3.4375 3.0578 3.7453 2.75 4.125 2.75H8.25C8.6297 2.75 8.9375 3.0578 8.9375 3.4375V8.25C8.9375 8.6297 8.6297 8.9375 8.25 8.9375H4.125C3.7453 8.9375 3.4375 8.6297 3.4375 8.25V3.4375Z"
                          fill=""
                        />
                        <path
                              d="M13.0625 3.4375C13.0625 3.0578 13.3703 2.75 13.75 2.75H17.875C18.2547 2.75 18.5625 3.0578 18.5625 3.4375V8.25C18.5625 8.6297 18.2547 8.9375 17.875 8.9375H13.75C13.3703 8.9375 13.0625 8.6297 13.0625 8.25V3.4375Z"
                              fill=""
                            />
                            <path
                              d="M3.4375 13.0625C3.4375 12.6828 3.7453 12.375 4.125 12.375H8.25C8.6297 12.375 8.9375 12.6828 8.9375 13.0625V17.875C8.9375 18.2547 8.6297 18.5625 8.25 18.5625H4.125C3.7453 18.5625 3.4375 18.2547 3.4375 17.875V13.0625Z"
                              fill=""
                            />
                            <path
                              d="M13.0625 13.0625C13.0625 12.6828 13.3703 12.375 13.75 12.375H17.875C18.2547 12.375 18.5625 12.6828 18.5625 13.0625V17.875C18.5625 18.2547 18.2547 18.5625 17.875 18.5625H13.75C13.3703 18.5625 13.0625 18.2547 13.0625 17.875V13.0625Z"
                          fill=""
                        />
                      </svg>
                          Yönetici Paneli
                    </button>

                        <button
                          onClick={() => setActiveTab("add-product")}
                          className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                            activeTab === "add-product"
                              ? "text-white bg-blue"
                              : "text-dark-2 bg-gray-1"
                          }`}
                        >
                          <svg
                            className="fill-current"
                            width="22"
                            height="22"
                            viewBox="0 0 22 22"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M11 4.125C11.3797 4.125 11.6875 4.4328 11.6875 4.8125V10.3125H17.1875C17.5672 10.3125 17.875 10.6203 17.875 11C17.875 11.3797 17.5672 11.6875 17.1875 11.6875H11.6875V17.1875C11.6875 17.5672 11.3797 17.875 11 17.875C10.6203 17.875 10.3125 17.5672 10.3125 17.1875V11.6875H4.8125C4.4328 11.6875 4.125 11.3797 4.125 11C4.125 10.6203 4.4328 10.3125 4.8125 10.3125H10.3125V4.8125C10.3125 4.4328 10.6203 4.125 11 4.125Z"
                              fill=""
                            />
                          </svg>
                          Ürün Ekle
                        </button>

                        <button
                          onClick={() => setActiveTab("manage-products")}
                          className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                            activeTab === "manage-products"
                              ? "text-white bg-blue"
                              : "text-dark-2 bg-gray-1"
                          }`}
                        >
                          <svg
                            className="fill-current"
                            width="22"
                            height="22"
                            viewBox="0 0 22 22"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3.4375 4.8125C3.4375 4.4328 3.7453 4.125 4.125 4.125H17.875C18.2547 4.125 18.5625 4.4328 18.5625 4.8125C18.5625 5.1922 18.2547 5.5 17.875 5.5H4.125C3.7453 5.5 3.4375 5.1922 3.4375 4.8125Z"
                              fill=""
                            />
                            <path
                              d="M3.4375 11C3.4375 10.6203 3.7453 10.3125 4.125 10.3125H17.875C18.2547 10.3125 18.5625 10.6203 18.5625 11C18.5625 11.3797 18.2547 11.6875 17.875 11.6875H4.125C3.7453 11.6875 3.4375 11.3797 3.4375 11Z"
                              fill=""
                            />
                            <path
                              d="M3.4375 17.1875C3.4375 16.8078 3.7453 16.5 4.125 16.5H17.875C18.2547 16.5 18.5625 16.8078 18.5625 17.1875C18.5625 17.5672 18.2547 17.875 17.875 17.875H4.125C3.7453 17.875 3.4375 17.5672 3.4375 17.1875Z"
                              fill=""
                            />
                          </svg>
                          Ürün Yönetimi
                        </button>

                        <button
                          onClick={() => setActiveTab("manage-reviews")}
                          className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                            activeTab === "manage-reviews"
                              ? "text-white bg-blue"
                              : "text-dark-2 bg-gray-1"
                          }`}
                        >
                          <svg
                            className="fill-current"
                            width="22"
                            height="22"
                            viewBox="0 0 22 22"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M3.4375 7.5625C3.4375 5.56802 5.06052 3.9375 7.0625 3.9375H14.9375C16.9395 3.9375 18.5625 5.56052 18.5625 7.5625V14.4375C18.5625 16.4395 16.9395 18.0625 14.9375 18.0625H7.0625C5.06052 18.0625 3.4375 16.4395 3.4375 14.4375V7.5625ZM7.0625 5.3125C5.8198 5.3125 4.8125 6.3198 4.8125 7.5625V14.4375C4.8125 15.6802 5.8198 16.6875 7.0625 16.6875H14.9375C16.1802 16.6875 17.1875 15.6802 17.1875 14.4375V7.5625C17.1875 6.3198 16.1802 5.3125 14.9375 5.3125H7.0625Z"
                              fill=""
                            />
                            <path
                              d="M9.625 9.625C9.625 9.24532 9.95532 8.9375 10.3125 8.9375H15.8125C16.1922 8.9375 16.5 9.24532 16.5 9.625C16.5 10.0047 16.1922 10.3125 15.8125 10.3125H10.3125C9.95532 10.3125 9.625 10.0047 9.625 9.625Z"
                              fill=""
                            />
                            <path
                              d="M9.625 12.375C9.625 11.9953 9.95532 11.6875 10.3125 11.6875H13.75C14.1297 11.6875 14.4375 11.9953 14.4375 12.375C14.4375 12.7547 14.1297 13.0625 13.75 13.0625H10.3125C9.95532 13.0625 9.625 12.7547 9.625 12.375Z"
                              fill=""
                            />
                            <path
                              d="M6.1875 9.625C6.1875 9.24532 6.51782 8.9375 6.875 8.9375H7.5625C7.94218 8.9375 8.25 9.24532 8.25 9.625C8.25 10.0047 7.94218 10.3125 7.5625 10.3125H6.875C6.51782 10.3125 6.1875 10.0047 6.1875 9.625Z"
                              fill=""
                            />
                            <path
                              d="M6.1875 12.375C6.1875 11.9953 6.51782 11.6875 6.875 11.6875H7.5625C7.94218 11.6875 8.25 11.9953 8.25 12.375C8.25 12.7547 7.94218 13.0625 7.5625 13.0625H6.875C6.51782 13.0625 6.1875 12.7547 6.1875 12.375Z"
                              fill=""
                            />
                          </svg>
                          Yorum Onaylama
                        </button>

                        <button
                          onClick={() => setActiveTab("manage-categories")}
                          className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                            activeTab === "manage-categories"
                              ? "text-white bg-blue"
                              : "text-dark-2 bg-gray-1"
                          }`}
                        >
                          <svg
                            className="fill-current"
                            width="22"
                            height="22"
                            viewBox="0 0 22 22"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3.4375 3.4375C3.4375 3.0578 3.7453 2.75 4.125 2.75H8.25C8.6297 2.75 8.9375 3.0578 8.9375 3.4375V8.25C8.9375 8.6297 8.6297 8.9375 8.25 8.9375H4.125C3.7453 8.9375 3.4375 8.6297 3.4375 8.25V3.4375Z"
                              fill=""
                            />
                            <path
                              d="M13.0625 3.4375C13.0625 3.0578 13.3703 2.75 13.75 2.75H17.875C18.2547 2.75 18.5625 3.0578 18.5625 3.4375V8.25C18.5625 8.6297 18.2547 8.9375 17.875 8.9375H13.75C13.3703 8.9375 13.0625 8.6297 13.0625 8.25V3.4375Z"
                              fill=""
                            />
                            <path
                              d="M3.4375 13.0625C3.4375 12.6828 3.7453 12.375 4.125 12.375H8.25C8.6297 12.375 8.9375 12.6828 8.9375 13.0625V17.875C8.9375 18.2547 8.6297 18.5625 8.25 18.5625H4.125C3.7453 18.5625 3.4375 18.2547 3.4375 17.875V13.0625Z"
                              fill=""
                            />
                            <path
                              d="M13.0625 13.0625C13.0625 12.6828 13.3703 12.375 13.75 12.375H17.875C18.2547 12.375 18.5625 12.6828 18.5625 13.0625V17.875C18.5625 18.2547 18.2547 18.5625 17.875 18.5625H13.75C13.3703 18.5625 13.0625 18.2547 13.0625 17.875V13.0625Z"
                              fill=""
                            />
                          </svg>
                          Kategori Yönetimi
                        </button>

                        <button
                          onClick={() => setActiveTab("manage-customers")}
                          className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                            activeTab === "manage-customers"
                              ? "text-white bg-blue"
                              : "text-dark-2 bg-gray-1"
                          }`}
                        >
                          <svg
                            className="fill-current"
                            width="22"
                            height="22"
                            viewBox="0 0 22 22"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              fill=""
                            />
                          </svg>
                          Müşteri Yönetimi
                        </button>

                        <button
                          onClick={() => setActiveTab("manage-orders")}
                          className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                            activeTab === "manage-orders"
                              ? "text-white bg-blue"
                              : "text-dark-2 bg-gray-1"
                          }`}
                        >
                          <svg
                            className="fill-current"
                            width="22"
                            height="22"
                            viewBox="0 0 22 22"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M8.0203 11.9167C8.0203 11.537 7.71249 11.2292 7.3328 11.2292C6.9531 11.2292 6.6453 11.537 6.6453 11.9167V15.5833C6.6453 15.963 6.9531 16.2708 7.3328 16.2708C7.71249 16.2708 8.0203 15.963 8.0203 15.5833V11.9167Z"
                              fill=""
                            />
                            <path
                              d="M14.6661 11.2292C15.0458 11.2292 15.3536 11.537 15.3536 11.9167V15.5833C15.3536 15.963 15.0458 16.2708 14.6661 16.2708C14.2864 16.2708 13.9786 15.963 13.9786 15.5833V11.9167C13.9786 11.537 14.2864 11.2292 14.6661 11.2292Z"
                              fill=""
                            />
                            <path
                              d="M11.687 11.9167C11.687 11.537 11.3792 11.2292 10.9995 11.2292C10.6198 11.2292 10.312 11.537 10.312 11.9167V15.5833C10.312 15.963 10.6198 16.2708 10.9995 16.2708C11.3792 16.2708 11.687 15.963 11.687 15.5833V11.9167Z"
                              fill=""
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M15.8338 3.18356C15.3979 3.01319 14.9095 2.98443 14.2829 2.97987C14.0256 2.43753 13.473 2.0625 12.8328 2.0625H9.16613C8.52593 2.0625 7.97332 2.43753 7.716 2.97987C7.08942 2.98443 6.60107 3.01319 6.16515 3.18356C5.64432 3.38713 5.19129 3.73317 4.85788 4.18211C4.52153 4.63502 4.36363 5.21554 4.14631 6.01456L3.57076 8.12557C3.21555 8.30747 2.90473 8.55242 2.64544 8.88452C2.07527 9.61477 1.9743 10.4845 2.07573 11.4822C2.17415 12.4504 2.47894 13.6695 2.86047 15.1955L2.88467 15.2923C3.12592 16.2573 3.32179 17.0409 3.55475 17.6524C3.79764 18.2899 4.10601 18.8125 4.61441 19.2095C5.12282 19.6064 5.70456 19.7788 6.38199 19.8598C7.03174 19.9375 7.8394 19.9375 8.83415 19.9375H13.1647C14.1594 19.9375 14.9671 19.9375 15.6169 19.8598C16.2943 19.7788 16.876 19.6064 17.3844 19.2095C17.8928 18.8125 18.2012 18.2899 18.4441 17.6524C18.6771 17.0409 18.8729 16.2573 19.1142 15.2923L19.1384 15.1956C19.5199 13.6695 19.8247 12.4504 19.9231 11.4822C20.0245 10.4845 19.9236 9.61477 19.3534 8.88452C19.0941 8.55245 18.7833 8.30751 18.4282 8.12562L17.8526 6.01455C17.6353 5.21554 17.4774 4.63502 17.141 4.18211C16.8076 3.73317 16.3546 3.38713 15.8338 3.18356ZM6.66568 4.46423C6.86717 4.38548 7.11061 4.36231 7.71729 4.35618C7.97516 4.89706 8.527 5.27083 9.16613 5.27083H12.8328C13.4719 5.27083 14.0238 4.89706 14.2816 4.35618C14.8883 4.36231 15.1318 4.38548 15.3332 4.46423C15.6137 4.57384 15.8576 4.76017 16.0372 5.00191C16.1986 5.21928 16.2933 5.52299 16.56 6.50095L16.8841 7.68964C15.9328 7.56246 14.7046 7.56248 13.1787 7.5625H8.82014C7.29428 7.56248 6.06614 7.56246 5.11483 7.68963L5.43894 6.50095C5.7056 5.52299 5.80033 5.21928 5.96176 5.00191C6.14129 4.76017 6.38523 4.57384 6.66568 4.46423ZM9.16613 3.4375C9.03956 3.4375 8.93696 3.5401 8.93696 3.66667C8.93696 3.79323 9.03956 3.89583 9.16613 3.89583H12.8328C12.9594 3.89583 13.062 3.79323 13.062 3.66667C13.062 3.5401 12.9594 3.4375 12.8328 3.4375H9.16613ZM3.72922 9.73071C3.98482 9.40334 4.38904 9.18345 5.22428 9.06262C6.07737 8.93921 7.23405 8.9375 8.87703 8.9375H13.1218C14.7648 8.9375 15.9215 8.93921 16.7746 9.06262C17.6098 9.18345 18.014 9.40334 18.2696 9.73071C18.5252 10.0581 18.6405 10.5036 18.5552 11.3432C18.468 12.2007 18.1891 13.3233 17.7906 14.9172C17.5365 15.9338 17.3595 16.6372 17.1592 17.1629C16.9655 17.6713 16.7758 17.9402 16.5382 18.1257C16.3007 18.3112 15.9938 18.43 15.4536 18.4946C14.895 18.5614 14.1697 18.5625 13.1218 18.5625H8.87703C7.8291 18.5625 7.10386 18.5614 6.54525 18.4946C6.005 18.43 5.69817 18.3112 5.4606 18.1257C5.22304 17.9402 5.03337 17.6713 4.83967 17.1629C4.63938 16.6372 4.46237 15.9338 4.20822 14.9172C3.80973 13.3233 3.53086 12.2007 3.44368 11.3432C3.35832 10.5036 3.47362 10.0581 3.72922 9.73071Z"
                              fill=""
                            />
                          </svg>
                          Sipariş Yönetimi
                        </button>

                        <button
                          onClick={() => setActiveTab("stock-management")}
                          className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                            activeTab === "stock-management"
                              ? "text-white bg-blue"
                              : "text-dark-2 bg-gray-1"
                          }`}
                        >
                          <svg
                            className="fill-current"
                            width="22"
                            height="22"
                            viewBox="0 0 22 22"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3.4375 4.8125C3.4375 4.4328 3.7453 4.125 4.125 4.125H17.875C18.2547 4.125 18.5625 4.4328 18.5625 4.8125C18.5625 5.1922 18.2547 5.5 17.875 5.5H4.125C3.7453 5.5 3.4375 5.1922 3.4375 4.8125Z"
                              fill=""
                            />
                            <path
                              d="M3.4375 11C3.4375 10.6203 3.7453 10.3125 4.125 10.3125H17.875C18.2547 10.3125 18.5625 10.6203 18.5625 11C18.5625 11.3797 18.2547 11.6875 17.875 11.6875H4.125C3.7453 11.6875 3.4375 11.3797 3.4375 11Z"
                              fill=""
                            />
                            <path
                              d="M3.4375 17.1875C3.4375 16.8078 3.7453 16.5 4.125 16.5H17.875C18.2547 16.5 18.5625 16.8078 18.5625 17.1875C18.5625 17.5672 18.2547 17.875 17.875 17.875H4.125C3.7453 17.875 3.4375 17.5672 3.4375 17.1875Z"
                              fill=""
                            />
                          </svg>
                          Stok Yönetimi
                        </button>

                        <button
                          onClick={() => setActiveTab("advanced-reports")}
                          className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                            activeTab === "advanced-reports"
                              ? "text-white bg-blue"
                              : "text-dark-2 bg-gray-1"
                          }`}
                        >
                          <svg
                            className="fill-current"
                            width="22"
                            height="22"
                            viewBox="0 0 22 22"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              fill=""
                            />
                          </svg>
                          Gelişmiş Raporlar
                        </button>

                        <button
                          onClick={() => setActiveTab("bulk-operations")}
                          className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                            activeTab === "bulk-operations"
                              ? "text-white bg-blue"
                              : "text-dark-2 bg-gray-1"
                          }`}
                        >
                          <svg
                            className="fill-current"
                            width="22"
                            height="22"
                            viewBox="0 0 22 22"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                              fill=""
                            />
                            <path
                              d="M8 8h8v2H8V8zm0 4h6v2H8v-2z"
                              fill=""
                            />
                          </svg>
                          Toplu İşlemler
                        </button>

                        <button
                          onClick={() => setActiveTab("notifications")}
                          className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                            activeTab === "notifications"
                              ? "text-white bg-blue"
                              : "text-dark-2 bg-gray-1"
                          }`}
                        >
                          <svg
                            className="fill-current"
                            width="22"
                            height="22"
                            viewBox="0 0 22 22"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                              fill=""
                            />
                          </svg>
                          Bildirimler
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => setActiveTab("logout")}
                      className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                        activeTab === "logout"
                          ? "text-white bg-blue"
                          : "text-dark-2 bg-gray-1"
                      }`}
                    >
                      <svg
                        className="fill-current"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13.7005 1.14581C12.4469 1.14579 11.4365 1.14578 10.6417 1.25263C9.81664 1.36356 9.12193 1.60088 8.57017 2.15263C8.08898 2.63382 7.84585 3.22514 7.71822 3.91997C7.59419 4.59515 7.57047 5.42142 7.56495 6.41282C7.56284 6.79251 7.86892 7.10202 8.24861 7.10414C8.6283 7.10625 8.93782 6.80016 8.93993 6.42047C8.94551 5.4181 8.97154 4.70761 9.07059 4.16838C9.16603 3.64881 9.31927 3.34807 9.54244 3.12491C9.79614 2.87121 10.1523 2.7058 10.825 2.61537C11.5174 2.52227 12.435 2.52081 13.7508 2.52081H14.6675C15.9833 2.52081 16.901 2.52227 17.5934 2.61537C18.266 2.7058 18.6222 2.87121 18.8759 3.12491C19.1296 3.37861 19.295 3.7348 19.3855 4.40742C19.4786 5.09983 19.48 6.01752 19.48 7.33331V14.6666C19.48 15.9824 19.4786 16.9001 19.3855 17.5925C19.295 18.2652 19.1296 18.6214 18.8759 18.8751C18.6222 19.1288 18.266 19.2942 17.5934 19.3846C16.901 19.4777 15.9833 19.4791 14.6675 19.4791H13.7508C12.435 19.4791 11.5174 19.4777 10.825 19.3846C10.1523 19.2942 9.79614 19.1288 9.54244 18.8751C9.31927 18.6519 9.16603 18.3512 9.07059 17.8316C8.97154 17.2924 8.94551 16.5819 8.93993 15.5795C8.93782 15.1998 8.6283 14.8937 8.24861 14.8958C7.86892 14.8979 7.56284 15.2075 7.56495 15.5871C7.57047 16.5785 7.59419 17.4048 7.71822 18.08C7.84585 18.7748 8.08898 19.3661 8.57017 19.8473C9.12193 20.3991 9.81664 20.6364 10.6417 20.7473C11.4365 20.8542 12.4469 20.8542 13.7006 20.8541H14.7178C15.9714 20.8542 16.9819 20.8542 17.7766 20.7473C18.6017 20.6364 19.2964 20.3991 19.8482 19.8473C20.4 19.2956 20.6373 18.6009 20.7482 17.7758C20.855 16.981 20.855 15.9706 20.855 14.7169V7.28302C20.855 6.02939 20.855 5.01893 20.7482 4.22421C20.6373 3.39911 20.4 2.70439 19.8482 2.15263C19.2964 1.60088 18.6017 1.36356 17.7766 1.25263C16.9819 1.14578 15.9714 1.14579 14.7178 1.14581H13.7005Z"
                          fill=""
                        />
                        <path
                          d="M13.7507 10.3125C14.1303 10.3125 14.4382 10.6203 14.4382 11C14.4382 11.3797 14.1303 11.6875 13.7507 11.6875H3.69247L5.48974 13.228C5.77802 13.4751 5.81141 13.9091 5.56431 14.1974C5.3172 14.4857 4.88318 14.5191 4.5949 14.272L1.38657 11.522C1.23418 11.3914 1.14648 11.2007 1.14648 11C1.14648 10.7993 1.23418 10.6086 1.38657 10.478L4.5949 7.72799C4.88318 7.48089 5.3172 7.51428 5.56431 7.80256C5.81141 8.09085 5.77802 8.52487 5.48974 8.77197L3.69247 10.3125H13.7507Z"
                          fill=""
                        />
                      </svg>
                      Çıkış Yap
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* <!--== user dashboard menu end ==-->

            
          <!--== user dashboard content start ==--> */}
            {/* <!-- dashboard tab content start --> */}

            <div
              className={`xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10 ${
                activeTab === "favorites" ? "block" : "hidden"
              }`}
            >
              <div className="flex items-center justify-between mb-7">
                <h2 className="font-medium text-xl sm:text-2xl text-dark">
                  Favori Ürünlerim
                </h2>
                <span className="text-sm text-gray-500">
                  {favoriteProducts.length} ürün
                </span>
              </div>

              {favoritesLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
                    </div>
              ) : favoriteProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteProducts.map((product) => (
                    <div key={product._id} className="border border-gray-3 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
                      <div className="relative">
                        <Image
                          src={product.images?.[0]?.url ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${product.images[0].url}` : "/images/products/default.png"}
                          alt={product.name}
                          width={300}
                          height={200}
                          className="w-full h-48 object-cover"
                        />
                          <button
                          onClick={() => handleRemoveFromFavorites(product._id)}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                          title="Favorilerden çıkar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          </button>
                        </div>
                      
                      <div className="p-4">
                        <div className="mb-2">
                          <span className="text-xs text-blue bg-blue/10 px-2 py-1 rounded-full">
                            {product.category.name}
                          </span>
                      </div>
                        
                        <h3 className="font-medium text-dark mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-1">
                            {product.averageRating ? (
                              <>
                                <div className="flex text-yellow-400">
                                  {[...Array(5)].map((_, i) => (
                                    <svg key={i} className={`w-4 h-4 ${i < Math.floor(product.averageRating!) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 24 24">
                                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L16.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                                    </svg>
                                  ))}
                    </div>
                                <span className="text-sm text-gray-500">({product.reviewCount || 0})</span>
                              </>
                            ) : (
                              <span className="text-sm text-gray-500">Henüz değerlendirme yok</span>
                            )}
                  </div>
                </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {product.salePrice ? (
                              <>
                                <span className="text-lg font-bold text-red">{product.salePrice}₺</span>
                                <span className="text-sm text-gray-500 line-through">{product.price}₺</span>
                              </>
                            ) : (
                              <span className="text-lg font-bold text-dark">{product.price}₺</span>
                            )}
                  </div>
                          
                          <button
                            onClick={() => window.location.href = `/shop-details/${product.slug}`}
                            className="text-blue hover:text-blue-dark text-sm font-medium transition-colors duration-200"
                          >
                            Ürünü Gör
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-dark mb-2">Henüz favori ürününüz yok</h3>
                  <p className="text-gray-500 mb-4">Beğendiğiniz ürünleri favorilerinize ekleyerek buradan kolayca erişebilirsiniz.</p>
                  <button
                    onClick={() => window.location.href = '/shop-with-sidebar'}
                    className="inline-flex items-center font-medium text-white bg-blue py-2 px-4 rounded-md ease-out duration-200 hover:bg-blue-dark"
                  >
                    Alışverişe Başla
                  </button>
                </div>
              )}
            </div>
            {/* <!-- dashboard tab content end -->

          <!-- orders tab content start --> */}
            <div
              className={`xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 ${
                activeTab === "orders" ? "block" : "hidden"
              }`}
            >
              <Orders />
            </div>
            {/* <!-- orders tab content end -->

          <!-- downloads tab content start --> */}
            <div
              className={`xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10 ${
                activeTab === "downloads" ? "block" : "hidden"
              }`}
            >
              <p>You don&apos;t have any download</p>
            </div>
            {/* <!-- downloads tab content end -->

          <!-- addresses tab content start --> */}
            <div
              className={`xl:max-w-[770px] w-full ${
                activeTab === "addresses" ? "block" : "hidden"
              }`}
            >
              <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                <div className="flex items-center justify-between mb-7">
                  <h2 className="font-medium text-xl sm:text-2xl text-dark">
                    Adres Yönetimi
                  </h2>

                  <button
                    className="inline-flex items-center font-medium text-white bg-blue py-2 px-4 rounded-md ease-out duration-200 hover:bg-blue-dark"
                    onClick={openAddressModal}
                  >
                    <svg
                      className="fill-current mr-2"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 1C8.39783 1 8.71875 1.32092 8.71875 1.71875V7.28125H14.2812C14.6791 7.28125 15 7.60217 15 8C15 8.39783 14.6791 8.71875 14.2812 8.71875H8.71875V14.2812C8.71875 14.6791 8.39783 15 8 15C7.60217 15 7.28125 14.6791 7.28125 14.2812V8.71875H1.71875C1.32092 8.71875 1 8.39783 1 8C1 7.60217 1.32092 7.28125 1.71875 7.28125H7.28125V1.71875C7.28125 1.32092 7.60217 1 8 1Z"
                        fill="white"
                      />
                    </svg>
                    Yeni Adres Ekle
                  </button>
                </div>

                {addressLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
                  </div>
                ) : addresses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                      <div 
                        key={address._id} 
                        className={`border rounded-lg p-4 ${
                          address.isDefault 
                            ? 'border-blue bg-blue/5' 
                            : 'border-gray-3'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-dark">{address.title}</h3>
                            {address.isDefault && (
                              <span className="px-2 py-1 bg-blue text-white text-xs rounded-full">
                                Varsayılan
                              </span>
                            )}
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            address.type === 'home' ? 'bg-green-100 text-green-700' :
                            address.type === 'work' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {address.type === 'home' ? 'Ev' : 
                             address.type === 'work' ? 'İş' : 'Diğer'}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <p className="font-medium text-dark">
                            {address.firstName} {address.lastName}
                          </p>
                          {address.company && (
                            <p>{address.company}</p>
                          )}
                          <p>{address.address1}</p>
                          {address.address2 && (
                            <p>{address.address2}</p>
                          )}
                          <p>
                            {address.city}, {address.state} {address.postalCode}
                          </p>
                          <p>{address.country}</p>
                          {address.phone && (
                            <p className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                              {address.phone}
                    </p>
                          )}
              </div>

                        <div className="flex flex-wrap gap-2">
                  <button
                            onClick={() => openEditAddressModal(address)}
                            className="text-blue hover:text-blue-dark text-sm font-medium transition-colors duration-200"
                          >
                            Düzenle
                  </button>
                          
                          {!address.isDefault && (
                            <button
                              onClick={() => handleSetDefaultAddress(address._id!)}
                              className="text-green-600 hover:text-green-700 text-sm font-medium transition-colors duration-200"
                            >
                              Varsayılan Yap
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleAddressDelete(address._id!)}
                            className="text-red hover:text-red-dark text-sm font-medium transition-colors duration-200"
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    <h3 className="text-lg font-medium text-dark mb-2">Henüz adres bulunmuyor</h3>
                    <p className="text-gray-500 mb-4">İlk adresinizi ekleyerek başlayın.</p>
                    <button
                      onClick={openAddressModal}
                      className="inline-flex items-center font-medium text-white bg-blue py-2 px-4 rounded-md ease-out duration-200 hover:bg-blue-dark"
                    >
                      <svg
                        className="fill-current mr-2"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                          <path
                          d="M8 1C8.39783 1 8.71875 1.32092 8.71875 1.71875V7.28125H14.2812C14.6791 7.28125 15 7.60217 15 8C15 8.39783 14.6791 8.71875 14.2812 8.71875H8.71875V14.2812C8.71875 14.6791 8.39783 15 8 15C7.60217 15 7.28125 14.6791 7.28125 14.2812V8.71875H1.71875C1.32092 8.71875 1 8.39783 1 8C1 7.60217 1.32092 7.28125 1.71875 7.28125H7.28125V1.71875C7.28125 1.32092 7.60217 1 8 1Z"
                          fill="white"
                        />
                      </svg>
                      İlk Adresimi Ekle
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* <!-- addresses tab content end -->

          <!-- details tab content start --> */}
            <div
              className={`xl:max-w-[770px] w-full ${
                activeTab === "account-details" ? "block" : "hidden"
              }`}
            >
              {/* Profil Bilgileri */}
              <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5 mb-8">
                <h3 className="font-medium text-xl sm:text-2xl text-dark mb-7">
                  Profil Bilgileri
                </h3>

                <form onSubmit={handleProfileSubmit}>
                  <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                    <div className="w-full">
                      <label htmlFor="firstName" className="block mb-2.5">
                        Ad <span className="text-red">*</span>
                      </label>

                      <input
                        type="text"
                        name="firstName"
                        id="firstName"
                        value={profileForm.firstName}
                        onChange={handleProfileFormChange}
                        placeholder={user?.firstName || "Adınızı girin"}
                        disabled={profileLoading}
                        className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-50"
                      />
                    </div>

                    <div className="w-full">
                      <label htmlFor="lastName" className="block mb-2.5">
                        Soyad <span className="text-red">*</span>
                      </label>

                      <input
                        type="text"
                        name="lastName"
                        id="lastName"
                        value={profileForm.lastName}
                        onChange={handleProfileFormChange}
                        placeholder={user?.lastName || "Soyadınızı girin"}
                        disabled={profileLoading}
                        className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="mb-5">
                    <label htmlFor="phone" className="block mb-2.5">
                      Telefon Numarası
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={profileForm.phone}
                      onChange={handleProfileFormChange}
                      placeholder={user?.phone || "Telefon numaranızı girin"}
                      disabled={profileLoading}
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-50"
                    />
                  </div>

                  {/* Profil mesajı */}
                  {profileMessage && (
                    <div className={`mb-5 p-4 rounded-lg ${
                      profileMessage.includes('başarıyla') 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-center">
                        <svg className={`w-5 h-5 mr-2 ${
                          profileMessage.includes('başarıyla') ? 'text-green-600' : 'text-red-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {profileMessage.includes('başarıyla') ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          )}
                        </svg>
                        <p className={`text-sm ${
                          profileMessage.includes('başarıyla') ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {profileMessage}
                        </p>
                    </div>
                  </div>
                  )}

                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="inline-flex items-center justify-center font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {profileLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Güncelleniyor...
                      </>
                    ) : (
                      'Değişiklikleri Kaydet'
                    )}
                  </button>
                </form>

                <p className="text-custom-sm mt-5">
                  Bu bilgiler hesap bölümünde ve yorumlarda görüntülenecektir
                </p>
              </div>

              {/* Parola Değiştirme */}
                <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                <h3 className="font-medium text-xl sm:text-2xl text-dark mb-7">
                  Parola Değiştirme
                </h3>

                  <div className="mb-5">
                  <p className="text-gray-600 mb-4">
                    Parolanızı güvenli bir şekilde değiştirmek için e-posta adresinize doğrulama kodu göndereceğiz.
                  </p>

                  <button
                    type="button"
                    onClick={() => setPasswordResetModal(true)}
                    className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark"
                  >
                    Parolayı Değiştir
                  </button>
                </div>
              </div>
            </div>
            {/* <!-- details tab content end -->

          <!-- add product tab content start --> */}
            {isAdmin && (
              <div
                className={`xl:max-w-[770px] w-full ${
                  activeTab === "add-product" ? "block" : "hidden"
                }`}
              >
                <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                  <h2 className="font-medium text-xl sm:text-2xl text-dark mb-7">
                    Yeni Ürün Ekle
                  </h2>
                  
                  <form className="space-y-6" onSubmit={handleProductSubmit}>
                    {/* Ürün Adı */}
                    <div>
                      <label className="block mb-2.5 text-dark font-medium">
                        Ürün Adı <span className="text-red">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={productForm.name}
                        onChange={handleProductFormChange}
                        placeholder="Ürün adını girin"
                        className="w-full rounded-lg border border-gray-3 bg-gray-1 py-3 px-4 text-dark outline-none transition-all focus:border-blue focus:bg-white"
                        required
                        disabled={submitLoading}
                      />
                    </div>

                    {/* Kategori Seçimi */}
                    <div>
                      <label className="block mb-2.5 text-dark font-medium">
                        Kategori <span className="text-red">*</span>
                      </label>
                      <select 
                        name="category"
                        value={productForm.category}
                        onChange={handleProductFormChange}
                        className="w-full rounded-lg border border-gray-3 bg-gray-1 py-3 px-4 text-dark outline-none transition-all focus:border-blue focus:bg-white"
                        required
                        disabled={submitLoading}
                      >
                        <option value="">Kategori seçin</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Fiyat */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block mb-2.5 text-dark font-medium">
                          Fiyat (₺) <span className="text-red">*</span>
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={productForm.price}
                          onChange={handleProductFormChange}
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="w-full rounded-lg border border-gray-3 bg-gray-1 py-3 px-4 text-dark outline-none transition-all focus:border-blue focus:bg-white"
                          required
                          disabled={submitLoading}
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center mb-2.5">
                          <input
                            type="checkbox"
                            id="applyDiscount"
                            checked={applyDiscount}
                            onChange={(e) => setApplyDiscount(e.target.checked)}
                            className="h-4 w-4 text-blue border-gray-300 rounded focus:ring-blue"
                            disabled={submitLoading}
                          />
                          <label htmlFor="applyDiscount" className="ml-2 text-dark font-medium">
                            İndirim Uygula
                        </label>
                        </div>
                        <input
                          type="number"
                          name="salePrice"
                          value={productForm.salePrice}
                          onChange={handleProductFormChange}
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className={`w-full rounded-lg border border-gray-3 py-3 px-4 text-dark outline-none transition-all focus:border-blue focus:bg-white ${
                            applyDiscount ? 'bg-gray-1' : 'bg-gray-100'
                          }`}
                          disabled={submitLoading || !applyDiscount}
                        />
                        {applyDiscount && (
                          <p className="text-sm text-gray-500 mt-1">
                            İndirimli fiyat normal fiyattan düşük olmalıdır
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Açıklama */}
                    <div>
                      <label className="block mb-2.5 text-dark font-medium">
                        Ürün Açıklaması <span className="text-red">*</span>
                      </label>
                      <textarea
                        name="description"
                        value={productForm.description}
                        onChange={handleProductFormChange}
                        rows={4}
                        placeholder="Ürün açıklamasını girin"
                        className="w-full rounded-lg border border-gray-3 bg-gray-1 py-3 px-4 text-dark outline-none transition-all focus:border-blue focus:bg-white resize-none"
                        required
                        disabled={submitLoading}
                      />
                    </div>

                    {/* Stok */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block mb-2.5 text-dark font-medium">
                          Stok Miktarı <span className="text-red">*</span>
                        </label>
                        <input
                          type="number"
                          name="stock"
                          value={productForm.stock}
                          onChange={handleProductFormChange}
                          min="0"
                          placeholder="0"
                          className="w-full rounded-lg border border-gray-3 bg-gray-1 py-3 px-4 text-dark outline-none transition-all focus:border-blue focus:bg-white"
                          required
                          disabled={submitLoading}
                        />
                      </div>
                      
                      <div>
                        <label className="block mb-2.5 text-dark font-medium">
                          SKU Kodu
                        </label>
                        <input
                          type="text"
                          name="sku"
                          value={productForm.sku}
                          onChange={handleProductFormChange}
                          placeholder="SKU123"
                          className="w-full rounded-lg border border-gray-3 bg-gray-1 py-3 px-4 text-dark outline-none transition-all focus:border-blue focus:bg-white"
                          disabled={submitLoading}
                        />
                      </div>
                    </div>

                    {/* Resim Yükleme */}
                    <div>
                      <label className="block mb-2.5 text-dark font-medium">
                        Ürün Resimleri <span className="text-red">*</span>
                      </label>
                      <div className="border-2 border-dashed border-gray-3 rounded-lg p-6 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue hover:text-blue-dark">
                            <span>Dosya seçin</span>
                            <input 
                              type="file" 
                              className="sr-only" 
                              multiple 
                              accept="image/*"
                              onChange={handleImageChange}
                              disabled={submitLoading}
                            />
                          </label>
                          <p className="pl-1">veya sürükleyip bırakın</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF max 5MB</p>
                        {productImages && productImages.length > 0 && (
                          <div className="mt-3 text-sm text-green-600">
                            {productImages.length} dosya seçildi
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Durum */}
                    <div>
                      <label className="block mb-2.5 text-dark font-medium">
                        Ürün Durumu
                      </label>
                      <div className="flex items-center space-x-6">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="status"
                            value="active"
                            checked={productForm.status === 'active'}
                            onChange={handleProductFormChange}
                            className="h-4 w-4 text-blue border-gray-300 focus:ring-blue"
                            disabled={submitLoading}
                          />
                          <span className="ml-2 text-dark">Aktif</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="status"
                            value="draft"
                            checked={productForm.status === 'draft'}
                            onChange={handleProductFormChange}
                            className="h-4 w-4 text-blue border-gray-300 focus:ring-blue"
                            disabled={submitLoading}
                          />
                          <span className="ml-2 text-dark">Taslak</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        disabled={submitLoading}
                        className="inline-flex items-center justify-center font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Kaydediliyor...
                          </>
                        ) : (
                          'Ürünü Kaydet'
                        )}
                      </button>
                      <button
                        type="button"
                        disabled={submitLoading}
                        className="inline-flex font-medium text-dark bg-gray-1 border border-gray-3 py-3 px-7 rounded-md ease-out duration-200 hover:bg-gray-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => {
                          setProductForm({
                            name: '',
                            category: '',
                            price: '',
                            salePrice: '',
                            description: '',
                            stock: '',
                            sku: '',
                            status: 'active'
                          });
                          setProductImages(null);
                        }}
                      >
                        İptal
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            {/* <!-- add product tab content end -->

          <!-- product management tab content start --> */}
            {isAdmin && (
              <div
                className={`xl:max-w-[770px] w-full ${
                  activeTab === "manage-products" ? "block" : "hidden"
                }`}
              >
                <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                  <h2 className="font-medium text-xl sm:text-2xl text-dark mb-7">
                    Ürün Yönetimi
                  </h2>
                  
                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
                    </div>
                  ) : (
                    <div>
                      {/* Toplu İşlem Butonları - Tablo Üstünde */}
                      <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-lg font-semibold text-blue-800">
                              {selectedProducts.length} ürün seçildi
                            </span>
                            <button 
                              onClick={() => {
                                console.log('Debug: selectedProducts =', selectedProducts);
                                console.log('Debug: selectedProducts.length =', selectedProducts.length);
                                alert(`Seçili ürün sayısı: ${selectedProducts.length}`);
                              }}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                            >
                              Debug
                            </button>
                          </div>
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleBulkAction('activate')}
                              disabled={selectedProducts.length === 0 || bulkActionLoading}
                              className="px-6 py-3 text-sm font-bold rounded-lg border-2 transition-all duration-200 bg-green-500 border-green-600 hover:bg-green-600 hover:shadow-lg disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-400 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center space-x-2"
                              style={{ minWidth: '120px' }}
                            >
                              {bulkActionLoading ? (
                                <>
                                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  <span>İşleniyor...</span>
                                </>
                              ) : (
                                <>
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>Aktif Yap</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleBulkAction('deactivate')}
                              disabled={selectedProducts.length === 0 || bulkActionLoading}
                              className="px-6 py-3 text-sm font-bold rounded-lg border-2 transition-all duration-200 bg-yellow-500 border-yellow-600 hover:bg-yellow-600 hover:shadow-lg disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-400 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center space-x-2"
                              style={{ minWidth: '120px' }}
                            >
                              {bulkActionLoading ? (
                                <>
                                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  <span>İşleniyor...</span>
                                </>
                              ) : (
                                <>
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span>Pasif Yap</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleBulkAction('delete')}
                              disabled={selectedProducts.length === 0 || bulkActionLoading}
                              className="px-6 py-3 text-sm font-bold rounded-lg border-2 transition-all duration-200 bg-red-500 border-red-600 hover:bg-red-600 hover:shadow-lg disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-400 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center space-x-2"
                              style={{ minWidth: '120px' }}
                            >
                              {bulkActionLoading ? (
                                <>
                                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  <span>İşleniyor...</span>
                                </>
                              ) : (
                                <>
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  <span>Sil</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Kategori Sekmeleri */}
                      <div className="border-b border-gray-3 mb-6">
                        <nav className="-mb-px flex space-x-8 overflow-x-auto">
                          <button
                            onClick={() => setSelectedCategory('all')}
                            className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                              selectedCategory === 'all'
                                ? 'border-blue text-blue'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            Tüm Ürünler ({products.length})
                          </button>
                          {categories.map((category) => {
                            const categoryProductCount = getCategoryProductCount(category._id);
                            
                            return (
                              <button
                                key={category._id}
                                onClick={() => setSelectedCategory(category._id)}
                                className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                                  selectedCategory === category._id
                                    ? 'border-blue text-blue'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                              >
                                {category.name} ({categoryProductCount})
                              </button>
                            );
                          })}
                        </nav>
                      </div>

                      {/* Ürün Tablosu */}
                      {(() => {
                        const filteredProducts = selectedCategory === 'all' 
                          ? products 
                          : products.filter(product => product.category._id === selectedCategory);
                        
                        return filteredProducts.length > 0 ? (
                          <div className="border border-gray-3 rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      <div className="flex items-center space-x-2">
                                        <input
                                          type="checkbox"
                                          checked={filteredProducts.length > 0 && selectedProducts.length === filteredProducts.length}
                                          onChange={filteredProducts.length > 0 && selectedProducts.length === filteredProducts.length ? handleDeselectAll : handleSelectAll}
                                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span>Seç</span>
                                      </div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Ürün
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Kategori
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Fiyat
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Stok
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Durum
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      İşlemler
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {filteredProducts.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50">
                                      <td className="px-4 py-4 whitespace-nowrap">
                                        <input
                                          type="checkbox"
                                          checked={selectedProducts.includes(product._id)}
                                          onChange={() => handleProductSelect(product._id)}
                                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                          style={{ display: 'block' }}
                                        />
                                      </td>
                                      <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                          <div className="flex-shrink-0 h-10 w-10">
                                            <Image
                                              className="h-10 w-10 rounded object-cover"
                                              src={product.images?.[0]?.url ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${product.images[0].url}` : "/images/products/default.png"}
                                              alt={product.name}
                                              width={40}
                                              height={40}
                                            />
                                          </div>
                                          <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                              {product.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                              SKU: {product.sku}
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                          {product.category.name}
                                        </div>
                                      </td>
                                      <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                          {product.salePrice ? (
                                            <>
                                              <span className="text-red font-medium">{product.salePrice}₺</span>
                                              <span className="text-gray-500 line-through ml-2">{product.price}₺</span>
                                            </>
                                          ) : (
                                            <span className="font-medium">{product.price}₺</span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                          {product.stock} adet
                                        </div>
                                      </td>
                                      <td className="px-4 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                          product.status === 'active' 
                                            ? 'bg-green-100 text-green-800'
                                            : product.status === 'draft'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                          {product.status === 'active' ? 'Aktif' : 
                                           product.status === 'draft' ? 'Taslak' : 'Pasif'}
                                        </span>
                                      </td>
                                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                          <button
                                            onClick={() => {
                                              setEditProduct(product);
                                              setEditApplyDiscount(!!product.salePrice);
                                            }}
                                            className="text-blue hover:text-blue-dark transition-colors duration-200 px-3 py-1 rounded border border-blue hover:bg-blue hover:text-white"
                                          >
                                            Düzenle
                                          </button>
                                          <button
                                            onClick={() => setDeleteProductId(product._id)}
                                            className="text-red hover:text-red-dark transition-colors duration-200 px-3 py-1 rounded border border-red hover:bg-red hover:text-white"
                                          >
                                            Sil
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 border border-gray-3 rounded-lg bg-gray-50">
                            <p className="text-gray-500">
                              {selectedCategory === 'all' 
                                ? 'Henüz ürün bulunmuyor.' 
                                : 'Bu kategoride ürün bulunmuyor.'}
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* <!-- product management tab content end -->

          <!-- manage reviews tab content start --> */}
            {isAdmin && (
              <div
                className={`xl:max-w-[770px] w-full ${
                  activeTab === "manage-reviews" ? "block" : "hidden"
                }`}
              >
                <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                  <h2 className="font-medium text-xl sm:text-2xl text-dark mb-7">
                    Yorum Onaylama
                  </h2>
                  {reviewMessage && (
                    <div className="mb-4 p-3 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {reviewMessage}
                    </div>
                  )}
                  {reviewsLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
                    </div>
                  ) : pendingReviews.length > 0 ? (
                  <div className="space-y-4">
                      {pendingReviews.map((review) => (
                        <div key={review._id} className="border border-gray-3 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue rounded-full flex items-center justify-center">
                                <span className="text-white font-medium">
                                  {review.user?.firstName?.[0] || '?'}{review.user?.lastName?.[0] || ''}
                                </span>
                          </div>
                          <div>
                                <h4 className="font-medium text-dark">
                                  {review.user?.firstName} {review.user?.lastName}
                                </h4>
                                <p className="text-sm text-gray-500">{review.user?.email}</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                          Bekliyor
                        </span>
                      </div>
                      <div className="mb-3">
                        <div className="flex items-center mb-2">
                          <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 24 24">
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                            </svg>
                                ))}
                              </div>
                              <span className="ml-2 text-sm text-gray-600">({review.rating}/5)</span>
                            </div>
                            <p className="text-dark font-medium mb-1">{review.title}</p>
                          </div>
                          <p className="text-gray-600 mb-4">{review.comment}</p>
                          <div className="flex items-center gap-3 mb-2">
                            <Image
                              src={review.product?.images?.[0]?.url ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${review.product.images[0].url}` : '/images/products/default.png'}
                              alt={review.product?.name || ''}
                              width={48}
                              height={48}
                              className="rounded"
                            />
                            <span className="text-sm text-dark font-medium">{review.product?.name}</span>
                          </div>
                          <div className="flex space-x-3 mt-4">
                            <button
                              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
                              onClick={() => handleApproveReview(review._id)}
                              disabled={reviewActionLoading === review._id}
                            >
                              {reviewActionLoading === review._id ? 'Onaylanıyor...' : 'Onayla'}
                            </button>
                            <button
                              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
                              onClick={() => handleRejectReview(review._id)}
                              disabled={reviewActionLoading === review._id}
                            >
                              {reviewActionLoading === review._id ? 'Reddediliyor...' : 'Reddet'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                      <h3 className="text-lg font-medium text-dark mb-2">Bekleyen yorum bulunmuyor</h3>
                      <p className="text-gray-500">Şu anda onay bekleyen herhangi bir yorum yok.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* <!-- manage reviews tab content end -->

          <!-- manage categories tab content start --> */}
            {isAdmin && (
              <div
                className={`xl:max-w-[770px] w-full ${
                  activeTab === "manage-categories" ? "block" : "hidden"
                }`}
              >
                <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                  <h2 className="font-medium text-xl sm:text-2xl text-dark mb-7">
                    Kategori Yönetimi
                  </h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Kategori Ekleme/Düzenleme Formu */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-medium text-dark mb-4">
                        {editCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
                      </h3>
                      
                      <form onSubmit={handleCategorySubmit} className="space-y-4">
                        <div>
                          <label className="block mb-2 text-dark font-medium">
                            Kategori Adı <span className="text-red">*</span>
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={categoryForm.name}
                            onChange={handleCategoryFormChange}
                            placeholder="Kategori adını girin"
                            className="w-full rounded-lg border border-gray-3 bg-white py-3 px-4 text-dark outline-none transition-all focus:border-blue"
                            required
                            disabled={categoryLoading}
                          />
                        </div>

                        <div>
                          <label className="block mb-2 text-dark font-medium">
                            Açıklama <span className="text-red">*</span>
                          </label>
                          <textarea
                            name="description"
                            value={categoryForm.description}
                            onChange={handleCategoryFormChange}
                            rows={3}
                            placeholder="Kategori açıklamasını girin"
                            className="w-full rounded-lg border border-gray-3 bg-white py-3 px-4 text-dark outline-none transition-all focus:border-blue resize-none"
                            required
                            disabled={categoryLoading}
                          />
                        </div>

                        {/* Sıralama */}
                        <div>
                          <label className="block mb-2 text-dark font-medium">
                            Sıralama
                          </label>
                          <input
                            type="number"
                            name="sortOrder"
                            value={categoryForm.sortOrder}
                            onChange={handleCategoryFormChange}
                            min="0"
                            placeholder="Sıralama numarası"
                            className="w-full rounded-lg border border-gray-3 bg-white py-3 px-4 text-dark outline-none transition-all focus:border-blue"
                            disabled={categoryLoading}
                          />
                          <p className="text-xs text-gray-500 mt-1">Düşük sayılar önce görünür</p>
                        </div>

                        {/* Kategori Resmi */}
                        <div>
                          <label className="block mb-2 text-dark font-medium">
                            Kategori Resmi
                          </label>
                          <div className="space-y-3">
                            {/* Resim Yükleme Alanı */}
                            <div className="relative">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleCategoryImageChange}
                                className="hidden"
                                id="categoryImageInput"
                                disabled={categoryLoading}
                              />
                              <label
                                htmlFor="categoryImageInput"
                                className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue transition-colors bg-gray-50 hover:bg-gray-100"
                                onDrop={handleCategoryImageDrop}
                                onDragOver={handleCategoryImageDragOver}
                              >
                                <div className="text-center">
                                  <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                  </svg>
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium text-blue hover:text-blue-dark">Resim seç</span> veya sürükle bırak
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP, GIF (max. 5MB)</p>
                                </div>
                              </label>
                            </div>

                            {/* Resim Önizleme */}
                            {categoryImagePreview && (
                              <div className="relative">
                                <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                                  <Image
                                    src={categoryImagePreview}
                                    alt="Kategori resmi önizleme"
                                    width={128}
                                    height={128}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCategoryImage(null);
                                    setCategoryImagePreview('');
                                  }}
                                  className="absolute -top-2 -right-2 bg-red text-white rounded-full p-1 hover:bg-red-dark transition-colors"
                                  title="Resmi kaldır"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>





                        <div className="flex space-x-3">
                          <button
                            type="submit"
                            disabled={categoryLoading}
                            className="flex-1 px-6 py-3 text-sm font-bold rounded-lg border-2 transition-all duration-200 bg-blue text-white border-blue hover:bg-blue-dark hover:shadow-lg disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-400 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center space-x-2"
                          >
                            {categoryLoading ? (
                              <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>İşleniyor...</span>
                              </>
                            ) : (
                              <>
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span>{editCategory ? 'Güncelle' : 'Ekle'}</span>
                              </>
                            )}
                          </button>
                          
                          {editCategory && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditCategory(null);
                                        setCategoryForm({
          name: '',
          description: '',
          sortOrder: 0
        });
                                setCategoryImage(null);
                                setCategoryImagePreview('');
                              }}
                              disabled={categoryLoading}
                              className="px-6 py-3 text-sm font-bold rounded-lg border-2 transition-all duration-200 bg-gray-500 text-white border-gray-600 hover:bg-gray-600 disabled:opacity-50"
                            >
                              İptal
                            </button>
                          )}
                        </div>
                      </form>
                    </div>

                    {/* Kategori Listesi */}
                    <div>
                      <h3 className="text-lg font-medium text-dark mb-4">
                        Mevcut Kategoriler ({categories.length})
                      </h3>
                      
                      {loading ? (
                        <div className="flex justify-center items-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
                        </div>
                      ) : categories.length > 0 ? (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {categories.map((category) => (
                            <div key={category._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3 flex-1">
                                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                    {category.image ? (
                                      <Image
                                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${category.image}`}
                                        alt={category.name}
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium text-dark">{category.name}</h4>
                                    <p className="text-sm text-gray-600 line-clamp-2">{category.description}</p>
                                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                      <span>Ürün: {getCategoryProductCount(category._id)}</span>
                                      <span>Sıra: {category.sortOrder}</span>
                                      <span className={`px-2 py-1 rounded-full ${
                                        category.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                      }`}>
                                        {category.isActive ? 'Aktif' : 'Pasif'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex space-x-2 ml-4">
                                  <button
                                    onClick={() => handleToggleCategoryStatus(category._id, category.isActive)}
                                    className={`p-2 transition-colors ${
                                      category.isActive 
                                        ? 'text-orange hover:text-orange-dark' 
                                        : 'text-green hover:text-green-dark'
                                    }`}
                                    title={category.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      {category.isActive ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                                      ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      )}
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleEditCategory(category)}
                                    className="p-2 text-blue hover:text-blue-dark transition-colors"
                                    title="Düzenle"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => setDeleteCategoryId(category._id)}
                                    className="p-2 text-red hover:text-red-dark transition-colors"
                                    title="Sil"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 border border-gray-3 rounded-lg bg-gray-50">
                          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          <p className="text-gray-500">Henüz kategori bulunmuyor.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* <!-- manage categories tab content end -->

          <!-- manage customers tab content start --> */}
            {isAdmin && (
              <div
                className={`xl:max-w-[770px] w-full ${
                  activeTab === "manage-customers" ? "block" : "hidden"
                }`}
              >
                <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                  <h2 className="font-medium text-xl sm:text-2xl text-dark mb-7">
                    Müşteri Yönetimi
                  </h2>
                  
                  {/* Arama Formu */}
                  <div className="mb-6">
                    <form onSubmit={handleCustomerSearch} className="flex gap-4">
                      <input
                        type="text"
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        placeholder="Ad, soyad, ad+soyad, e-posta veya telefon ile ara..."
                        className="flex-1 rounded-lg border border-gray-3 bg-gray-1 py-3 px-4 text-dark outline-none transition-all focus:border-blue focus:bg-white"
                      />
                      <button
                        type="submit"
                        className="px-6 py-3 bg-blue text-white rounded-lg hover:bg-blue-dark transition-colors"
                      >
                        Ara
                      </button>
                    </form>
                  </div>

                  {/* Müşteri Tablosu */}
                  {customersLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
                    </div>
                  ) : customers && customers.length > 0 ? (
                    <div className="border border-gray-3 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Müşteri
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                İletişim
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sipariş Sayısı
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Durum
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Kayıt Tarihi
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                İşlemler
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {customers && customers.map((customer) => (
                              <tr key={customer._id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <span className="text-blue-600 font-medium text-sm">
                                          {customer.firstName[0]}{customer.lastName[0]}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">
                                        {customer.firstName} {customer.lastName}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {customer.authentication.isEmailVerified ? 'E-posta doğrulandı' : 'E-posta doğrulanmadı'}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{customer.email}</div>
                                  {customer.phone && (
                                    <div className="text-sm text-gray-500">{customer.phone}</div>
                                  )}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{customer.orderCount} sipariş</div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    customer.isActive 
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {customer.isActive ? 'Aktif' : 'Pasif'}
                                  </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(customer.createdAt).toLocaleDateString('tr-TR')}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <div className="flex justify-end space-x-2">
                                    <button
                                      onClick={() => handleViewCustomerDetails(customer._id)}
                                      className="text-blue hover:text-blue-dark transition-colors duration-200 px-3 py-1 rounded border border-blue hover:bg-blue hover:text-white"
                                    >
                                      Detaylar
                                    </button>
                                    <button
                                      onClick={() => handleUpdateCustomerStatus(customer._id, !customer.isActive)}
                                      className={`px-3 py-1 rounded border transition-colors duration-200 ${
                                        customer.isActive
                                          ? 'text-red border-red hover:bg-red hover:text-white'
                                          : 'text-green border-green hover:bg-green hover:text-white'
                                      }`}
                                    >
                                      {customer.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-gray-3 rounded-lg bg-gray-50">
                      <p className="text-gray-500">
                        {customerSearch ? 'Arama kriterlerine uygun müşteri bulunamadı.' : 'Henüz müşteri bulunmuyor.'}
                      </p>
                    </div>
                  )}

                  {/* Sayfalama */}
                  {customerPagination && customerPagination.totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Toplam {customerPagination.totalCustomers || 0} müşteri
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleCustomerPageChange((customerPagination.currentPage || 1) - 1)}
                          disabled={!customerPagination.hasPrevPage}
                          className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Önceki
                        </button>
                        <span className="px-3 py-2 text-sm text-gray-700">
                          Sayfa {customerPagination.currentPage || 1} / {customerPagination.totalPages || 1}
                        </span>
                        <button
                          onClick={() => handleCustomerPageChange((customerPagination.currentPage || 1) + 1)}
                          disabled={!customerPagination.hasNextPage}
                          className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Sonraki
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* <!-- manage customers tab content end -->

            {/* <!-- manage orders tab content start --> */}
            {isAdmin && (
              <div
                className={`xl:max-w-[770px] w-full ${
                  activeTab === "manage-orders" ? "block" : "hidden"
                }`}
              >
                <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                  <h2 className="font-medium text-xl sm:text-2xl text-dark mb-7">
                    Sipariş Yönetimi
                  </h2>
                  <AdminOrders />
                </div>
              </div>
            )}
            {/* <!-- manage orders tab content end -->

            {/* <!-- stock management tab content start --> */}
            {isAdmin && (
              <div
                className={`xl:max-w-[770px] w-full ${
                  activeTab === "stock-management" ? "block" : "hidden"
                }`}
              >
                <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                  <h2 className="font-medium text-xl sm:text-2xl text-dark mb-7">
                    Stok Yönetimi
                  </h2>

                  {/* Düşük Stok Uyarıları */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-dark mb-4">Düşük Stok Uyarıları</h3>
                    <LowStockAlerts 
                      accessToken={accessToken || ''} 
                      onUpdateStock={(product) => {
                       
                        const localProduct: LocalProduct = {
                          _id: product._id,
                          name: product.name,
                          slug: product.sku.toLowerCase().replace(/\s+/g, '-'),
                          description: '',
                          category: product.category,
                          price: 0,
                          sku: product.sku,
                          stock: product.stock,
                          lowStockThreshold: product.lowStockThreshold,
                          images: [],
                          status: 'active',
                          createdAt: '',
                          updatedAt: ''
                        };
                        handleUpdateStock(localProduct);
                      }}
                    />
                  </div>

                  {/* Ürün Listesi - Stok Yönetimi */}
                  <div>
                    <h3 className="text-lg font-medium text-dark mb-4">Ürün Stok Yönetimi</h3>
                    {loading ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ürün
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Kategori
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stok
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Eşik
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Durum
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                İşlemler
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {products.map((product) => (
                              <tr key={product._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                      {product.images && product.images.length > 0 ? (
                                        <img
                                          className="h-10 w-10 rounded-lg object-cover"
                                          src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${product.images[0].url}`}
                                          alt={product.name}
                                        />
                                      ) : (
                                        <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                          </svg>
                                        </div>
                                      )}
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                      <div className="text-sm text-gray-500">{product.sku}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {product.category.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {product.stock}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {product.lowStockThreshold || 5}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    product.stock === 0 ? 'bg-red-100 text-red-800' :
                                    product.stock <= (product.lowStockThreshold || 5) ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {product.stock === 0 ? 'Stok Tükendi' :
                                     product.stock <= (product.lowStockThreshold || 5) ? 'Düşük Stok' :
                                     'Stokta'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <div className="flex justify-end space-x-2">
                                    <button
                                      onClick={() => handleViewStockHistory(product)}
                                      className="text-blue-600 hover:text-blue-900 text-sm"
                                    >
                                      Geçmiş
                                    </button>
                                    <button
                                      onClick={() => handleUpdateStock(product)}
                                      className="text-green-600 hover:text-green-900 text-sm"
                                    >
                                      Güncelle
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* <!-- stock management tab content end -->

            {/* <!-- advanced reports tab content start --> */}
            {isAdmin && (
              <div
                className={`xl:max-w-[770px] w-full ${
                  activeTab === "advanced-reports" ? "block" : "hidden"
                }`}
              >
                <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                  <h2 className="font-medium text-xl sm:text-2xl text-dark mb-7">
                    Gelişmiş Raporlar
                  </h2>

                  {/* Rapor Filtreleri */}
                  <div className="mb-8 bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rapor Türü</label>
                        <select
                          value={reportType}
                          onChange={(e) => setReportType(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="sales">Satış Raporları</option>
                          <option value="customers">Müşteri Raporları</option>
                          <option value="products">Ürün Raporları</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Dönem</label>
                        <select
                          value={reportPeriod}
                          onChange={(e) => setReportPeriod(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="7days">Son 7 Gün</option>
                          <option value="30days">Son 30 Gün</option>
                          <option value="90days">Son 90 Gün</option>
                          <option value="custom">Özel Tarih</option>
                        </select>
                      </div>
                      {reportPeriod === 'custom' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Başlangıç</label>
                            <input
                              type="date"
                              value={dateRange.startDate}
                              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bitiş</label>
                            <input
                              type="date"
                              value={dateRange.endDate}
                              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {reportLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
                    </div>
                  ) : reportData ? (
                    <div className="space-y-8">
                      {/* Özet Kartları */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-blue-100 text-sm">Toplam</p>
                              <p className="text-2xl font-bold">
                                {reportType === 'sales' ? `${reportData.sales.total.toLocaleString('tr-TR')}₺` :
                                 reportType === 'customers' ? reportData.customers.total :
                                 reportData.products.total}
                              </p>
                            </div>
                            <div className="bg-blue-400 rounded-full p-3">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </div>
                          </div>
                          <div className="mt-4">
                            <span className={`text-sm ${reportData[reportType].change >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                              {reportData[reportType].change >= 0 ? '+' : ''}{reportData[reportType].change}%
                            </span>
                            <span className="text-blue-100 text-sm ml-2">geçen döneme göre</span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-green-100 text-sm">Ortalama</p>
                              <p className="text-2xl font-bold">
                                {reportType === 'sales' ? `${(reportData.sales.total / 7).toFixed(0)}₺` :
                                 reportType === 'customers' ? Math.round(reportData.customers.total / 7) :
                                 Math.round(reportData.products.total / 7)}
                              </p>
                            </div>
                            <div className="bg-green-400 rounded-full p-3">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                            </div>
                          </div>
                          <p className="text-green-100 text-sm mt-2">günlük ortalama</p>
                        </div>

                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-purple-100 text-sm">En Yüksek</p>
                              <p className="text-2xl font-bold">
                                {reportType === 'sales' ? `${Math.max(...reportData.sales.data.map(d => d.value)).toLocaleString('tr-TR')}₺` :
                                 reportType === 'customers' ? Math.max(...reportData.customers.data.map(d => d.value)) :
                                 Math.max(...reportData.products.data.map(d => d.value))}
                              </p>
                            </div>
                            <div className="bg-purple-400 rounded-full p-3">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                              </svg>
                            </div>
                          </div>
                          <p className="text-purple-100 text-sm mt-2">tek günlük rekor</p>
                        </div>
                      </div>

                      {/* Grafik */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-dark mb-4">
                          {reportType === 'sales' ? 'Satış Trendi' :
                           reportType === 'customers' ? 'Müşteri Artışı' :
                           'Ürün Performansı'}
                        </h3>
                        <div className="h-64 flex items-end justify-between space-x-2">
                          {reportData[reportType].data.map((day: any, index: number) => (
                            <div key={index} className="flex-1 flex flex-col items-center">
                              <div 
                                className="w-full bg-blue-500 rounded-t"
                                style={{ 
                                  height: `${(day.value / Math.max(...reportData[reportType].data.map((d: any) => d.value))) * 200}px` 
                                }}
                              ></div>
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(day.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Detaylı Tablo */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-dark mb-4">Detaylı Veriler</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  {reportType === 'sales' ? 'Satış' :
                                   reportType === 'customers' ? 'Müşteri' :
                                   'Ürün'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Değişim</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {reportData[reportType].data.map((day: any, index: number) => {
                                const prevValue = index > 0 ? reportData[reportType].data[index - 1].value : 0;
                                const change = prevValue > 0 ? ((day.value - prevValue) / prevValue) * 100 : 0;
                                
                                return (
                                  <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {new Date(day.date).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {reportType === 'sales' ? `${day.value.toLocaleString('tr-TR')}₺` : day.value}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                      }`}>
                                        {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">Rapor verileri yüklenemedi.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* <!-- advanced reports tab content end -->

            {/* <!-- bulk operations tab content start --> */}
            {isAdmin && (
              <div
                className={`xl:max-w-[770px] w-full ${
                  activeTab === "bulk-operations" ? "block" : "hidden"
                }`}
              >
                <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                  <h2 className="font-medium text-xl sm:text-2xl text-dark mb-7">
                    Toplu İşlemler
                  </h2>

                  {/* Ürün Seçimi */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-dark mb-4">Ürün Seçimi</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-600">
                          {selectedProducts.length} ürün seçildi
                        </span>
                        <div className="space-x-2">
                          <button
                            onClick={handleSelectAll}
                            className="px-3 py-1 text-sm bg-blue text-white rounded-md hover:bg-blue-dark"
                          >
                            Tümünü Seç
                          </button>
                          <button
                            onClick={handleDeselectAll}
                            className="px-3 py-1 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600"
                          >
                            Seçimi Kaldır
                          </button>
                        </div>
                      </div>
                      
                      {loading ? (
                        <div className="flex justify-center items-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
                          {products.map((product) => (
                            <div
                              key={product._id}
                              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                selectedProducts.includes(product._id)
                                  ? 'border-blue bg-blue/5'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => handleProductSelect(product._id)}
                            >
                              <div className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={selectedProducts.includes(product._id)}
                                  onChange={() => handleProductSelect(product._id)}
                                  className="rounded border-gray-300 text-blue focus:ring-blue-500"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                  <p className="text-xs text-gray-500">{product.sku}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Toplu İşlem Seçenekleri */}
                  <div className="space-y-6">
                    {/* Kategori Atama */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-medium text-dark mb-4">Toplu Kategori Atama</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Kategoriler</label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                            {categories.map((category) => (
                              <label key={category._id} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={bulkSelectedCategories.includes(category._id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setBulkSelectedCategories(prev => [...prev, category._id]);
                                    } else {
                                      setBulkSelectedCategories(prev => prev.filter(id => id !== category._id));
                                    }
                                  }}
                                  className="rounded border-gray-300 text-blue focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{category.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={handleBulkCategoryAssignment}
                          disabled={selectedProducts.length === 0 || bulkSelectedCategories.length === 0 || bulkOperationLoading}
                          className="px-4 py-2 bg-blue text-white rounded-md hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {bulkOperationLoading ? 'İşleniyor...' : 'Kategorilere Ata'}
                        </button>
                      </div>
                    </div>

                    {/* Fiyat Güncelleme */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-medium text-dark mb-4">Toplu Fiyat Güncelleme</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Değişim Türü</label>
                            <select
                              value={bulkPriceChange.type}
                              onChange={(e) => setBulkPriceChange(prev => ({ ...prev, type: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="percentage">Yüzde (%)</option>
                              <option value="fixed">Sabit Tutar (₺)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Değer</label>
                            <input
                              type="number"
                              value={bulkPriceChange.value}
                              onChange={(e) => setBulkPriceChange(prev => ({ ...prev, value: e.target.value }))}
                              placeholder={bulkPriceChange.type === 'percentage' ? '10' : '50'}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <button
                          onClick={handleBulkPriceUpdate}
                          disabled={selectedProducts.length === 0 || !bulkPriceChange.value || bulkOperationLoading}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {bulkOperationLoading ? 'İşleniyor...' : 'Fiyatları Güncelle'}
                        </button>
                      </div>
                    </div>

                    {/* Resim Yükleme */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-medium text-dark mb-4">Toplu Resim Yükleme</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Resimler</label>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => e.target.files && handleBulkImageUpload(e.target.files)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Seçilen tüm ürünlere aynı resimler yüklenecektir.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* <!-- bulk operations tab content end -->

            {/* <!-- notifications tab content start --> */}
            {isAdmin && (
              <div
                className={`xl:max-w-[770px] w-full ${
                  activeTab === "notifications" ? "block" : "hidden"
                }`}
              >
                <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                  <h2 className="font-medium text-xl sm:text-2xl text-dark mb-7">
                    Bildirimler
                  </h2>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Bildirim Listesi */}
                    <div className="lg:col-span-2">
                      <h3 className="text-lg font-medium text-dark mb-4">Bildirimler</h3>
                      
                      {notificationsLoading ? (
                        <div className="flex justify-center items-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
                        </div>
                      ) : notifications.length > 0 ? (
                        <div className="space-y-3">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                              }`}
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h4 className="font-medium text-dark">{notification.title}</h4>
                                    {!notification.read && (
                                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(notification.timestamp).toLocaleString('tr-TR')}
                                  </p>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${
                                  notification.type === 'new_order' ? 'bg-green-500' :
                                  notification.type === 'low_stock' ? 'bg-red-500' :
                                  'bg-blue-500'
                                }`}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                          <p className="text-gray-500">Henüz bildirim bulunmuyor.</p>
                        </div>
                      )}
                    </div>

                    {/* Bildirim Ayarları */}
                    <div>
                      <h3 className="text-lg font-medium text-dark mb-4">Bildirim Ayarları</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                        <div>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={notificationSettings.newOrders}
                              onChange={(e) => setNotificationSettings(prev => ({ ...prev, newOrders: e.target.checked }))}
                              className="rounded border-gray-300 text-blue focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Yeni Sipariş Bildirimleri</span>
                          </label>
                        </div>
                        <div>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={notificationSettings.lowStock}
                              onChange={(e) => setNotificationSettings(prev => ({ ...prev, lowStock: e.target.checked }))}
                              className="rounded border-gray-300 text-blue focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Düşük Stok Uyarıları</span>
                          </label>
                        </div>
                        <div>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={notificationSettings.systemAlerts}
                              onChange={(e) => setNotificationSettings(prev => ({ ...prev, systemAlerts: e.target.checked }))}
                              className="rounded border-gray-300 text-blue focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Sistem Bildirimleri</span>
                          </label>
                        </div>
                        <div>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={notificationSettings.emailNotifications}
                              onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                              className="rounded border-gray-300 text-blue focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">E-posta Bildirimleri</span>
                          </label>
                        </div>
                        <button
                          onClick={handleNotificationSettingsUpdate}
                          className="w-full px-4 py-2 bg-blue text-white rounded-md hover:bg-blue-dark"
                        >
                          Ayarları Kaydet
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* <!-- notifications tab content end -->

          <!-- admin dashboard tab content start --> */}
            {isAdmin && (
              <div
                className={`xl:max-w-[770px] w-full ${
                  activeTab === "dashboard" ? "block" : "hidden"
                }`}
              >
                <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                  <h2 className="font-medium text-xl sm:text-2xl text-dark mb-7">
                    Yönetici Paneli
                  </h2>
                  
                  {dashboardLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
                    </div>
                  ) : dashboardStats ? (
                    <div className="space-y-8">
                      {/* İstatistik Kartları */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-blue-100 text-sm">Toplam Satış</p>
                              <p className="text-2xl font-bold">{dashboardStats.totalSales.toLocaleString('tr-TR')}₺</p>
                            </div>
                            <div className="bg-blue-400 rounded-full p-3">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-green-100 text-sm">Toplam Sipariş</p>
                              <p className="text-2xl font-bold">{dashboardStats.totalOrders}</p>
                            </div>
                            <div className="bg-green-400 rounded-full p-3">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-purple-100 text-sm">Toplam Müşteri</p>
                              <p className="text-2xl font-bold">{dashboardStats.totalCustomers}</p>
                            </div>
                            <div className="bg-purple-400 rounded-full p-3">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-orange-100 text-sm">Toplam Ürün</p>
                              <p className="text-2xl font-bold">{dashboardStats.totalProducts}</p>
                            </div>
                            <div className="bg-orange-400 rounded-full p-3">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Aylık İstatistikler */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h3 className="text-lg font-medium text-dark mb-4">Bu Ay</h3>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Yeni Müşteriler</span>
                              <span className="font-medium text-dark">{dashboardStats.newCustomersThisMonth}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Aylık Satış</span>
                              <span className="font-medium text-dark">{dashboardStats.monthlySales.toLocaleString('tr-TR')}₺</span>
                            </div>
                      </div>
                    </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h3 className="text-lg font-medium text-dark mb-4">Sipariş Durumu</h3>
                          <div className="space-y-3">
                            {dashboardStats.orderStatusDistribution.map((status) => (
                              <div key={status.status} className="flex justify-between items-center">
                                <span className="text-gray-600 capitalize">
                                  {status.status === 'pending' ? 'Bekliyor' :
                                   status.status === 'confirmed' ? 'Onaylandı' :
                                   status.status === 'processing' ? 'İşleniyor' :
                                   status.status === 'shipped' ? 'Kargoda' :
                                   status.status === 'delivered' ? 'Teslim Edildi' :
                                   status.status === 'cancelled' ? 'İptal Edildi' : status.status}
                                </span>
                                <span className="font-medium text-dark">{status.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Son Siparişler ve Popüler Ürünler */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Son Siparişler */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h3 className="text-lg font-medium text-dark mb-4">Son Siparişler</h3>
                          <div className="space-y-4">
                            {dashboardStats.recentOrders.map((order) => (
                              <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 font-medium text-sm">#{order.orderNumber}</span>
                          </div>
                          <div>
                                    <p className="font-medium text-dark text-sm">
                                      {order.customerInfo?.firstName} {order.customerInfo?.lastName}
                                    </p>
                                    <p className="text-gray-500 text-xs">
                                      {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                                    </p>
                          </div>
                        </div>
                                <div className="text-right">
                                  <p className="font-medium text-dark">{order.pricing?.total}₺</p>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    order.fulfillment?.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                    order.fulfillment?.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                    order.fulfillment?.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {order.fulfillment?.status === 'pending' ? 'Bekliyor' :
                                     order.fulfillment?.status === 'confirmed' ? 'Onaylandı' :
                                     order.fulfillment?.status === 'processing' ? 'İşleniyor' :
                                     order.fulfillment?.status === 'shipped' ? 'Kargoda' :
                                     order.fulfillment?.status === 'delivered' ? 'Teslim Edildi' :
                                     order.fulfillment?.status === 'cancelled' ? 'İptal Edildi' : order.fulfillment?.status}
                        </span>
                                </div>
                              </div>
                            ))}
                          </div>
                      </div>
                      
                        {/* Popüler Ürünler */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h3 className="text-lg font-medium text-dark mb-4">Popüler Ürünler</h3>
                          <div className="space-y-4">
                            {dashboardStats.popularProducts.map((product) => (
                              <div key={product._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                                  {product.images?.[0]?.url ? (
                                    <img
                                      src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${product.images[0].url}`}
                                      alt={product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                                  )}
                        </div>
                                <div className="flex-1">
                                  <p className="font-medium text-dark text-sm line-clamp-1">{product.name}</p>
                                  <p className="text-gray-500 text-xs">{product.category}</p>
                      </div>
                                <div className="text-right">
                                  <p className="font-medium text-dark text-sm">{product.price}₺</p>
                                  <p className="text-gray-500 text-xs">{product.totalSold || 0} satış</p>
                                </div>
                              </div>
                            ))}
                      </div>
                    </div>
                  </div>

                      {/* Satış Grafiği */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-dark mb-4">Son 7 Günlük Satış</h3>
                        <div className="h-64 flex items-end justify-between space-x-2">
                          {dashboardStats.salesChart.map((day) => (
                            <div key={day._id} className="flex-1 flex flex-col items-center">
                              <div 
                                className="w-full bg-blue-500 rounded-t"
                                style={{ 
                                  height: `${Math.max((day.total / Math.max(...dashboardStats.salesChart.map(d => d.total))) * 200, 20)}px` 
                                }}
                              ></div>
                              <p className="text-xs text-gray-500 mt-2">{new Date(day._id).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</p>
                              <p className="text-xs font-medium text-dark">{day.total}₺</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                      <h3 className="text-lg font-medium text-dark mb-2">İstatistikler yüklenemedi</h3>
                      <p className="text-gray-500">Dashboard verileri yüklenirken bir hata oluştu.</p>
                  </div>
                  )}
                </div>
              </div>
            )}
            {/* <!-- admin dashboard tab content end -->

          <!--== user dashboard content end ==--> */}
          </div>
        </div>
      </section>

      <AddressModal 
        isOpen={addressModal} 
        closeModal={closeAddressModal}
        onSave={handleAddressSave}
        editingAddress={editingAddress}
        isLoading={addressModalLoading}
      />

      <PasswordResetModal
        isOpen={passwordResetModal}
        closeModal={() => setPasswordResetModal(false)}
        onSendCode={handleSendResetCode}
        onResetPassword={handleResetPassword}
        userEmail={user?.email || ''}
        isLoading={passwordResetLoading}
      />
      
      {/* Ürün Düzenleme Popup'ı */}
      {editProduct && (
        <div className="fixed inset-0 z-[99999] overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-dark">Ürün Düzenle</h3>
                <button
                  onClick={() => {
                    setEditProduct(null);
                    setEditApplyDiscount(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                
                console.log('=== FRONTEND FORM SUBMIT DEBUG ===');
                console.log('Selected files count:', selectedFiles.length);
                console.log('Selected files:', selectedFiles.map(f => f.name));
                
                selectedFiles.forEach((file, index) => {
                  formData.append('images', file);
                  console.log(`Added file ${index}:`, file.name);
                });
                
                Array.from(formData.entries()).forEach(([key, value]) => {
                  console.log(`FormData key: ${key}, value:`, value);
                });
                
                console.log('=== END FRONTEND DEBUG ===');
                
                await handleEditProduct(editProduct._id, formData);
              }} className="space-y-4">
                <div>
                  <label className="block mb-2 text-dark font-medium">Ürün Adı</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editProduct.name}
                    className="w-full rounded-lg border border-gray-3 bg-gray-1 py-2 px-3 text-dark outline-none transition-all focus:border-blue"
                    required
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-dark font-medium">Kategori</label>
                  <select 
                    name="category"
                    defaultValue={editProduct.category._id}
                    className="w-full rounded-lg border border-gray-3 bg-gray-1 py-2 px-3 text-dark outline-none transition-all focus:border-blue"
                    required
                  >
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-dark font-medium">Fiyat (₺)</label>
                    <input
                      type="number"
                      name="price"
                      step="0.01"
                      defaultValue={editProduct.price}
                      className="w-full rounded-lg border border-gray-3 bg-gray-1 py-2 px-3 text-dark outline-none transition-all focus:border-blue"
                      required
                    />
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id="editApplyDiscount"
                        checked={editApplyDiscount}
                        onChange={(e) => setEditApplyDiscount(e.target.checked)}
                        className="h-4 w-4 text-blue border-gray-300 rounded focus:ring-blue"
                      />
                      <label htmlFor="editApplyDiscount" className="ml-2 text-dark font-medium">
                        İndirim Uygula
                      </label>
                    </div>
                    <input
                      type="number"
                      name="salePrice"
                      step="0.01"
                      defaultValue={editProduct.salePrice || ''}
                      className={`w-full rounded-lg border border-gray-3 py-2 px-3 text-dark outline-none transition-all focus:border-blue ${
                        editApplyDiscount ? 'bg-gray-1' : 'bg-gray-100'
                      }`}
                      disabled={!editApplyDiscount}
                    />
                    {editApplyDiscount && (
                      <p className="text-sm text-gray-500 mt-1">
                        İndirimli fiyat normal fiyattan düşük olmalıdır
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block mb-2 text-dark font-medium">Açıklama</label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={editProduct.description}
                    className="w-full rounded-lg border border-gray-3 bg-gray-1 py-2 px-3 text-dark outline-none transition-all focus:border-blue resize-none"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-dark font-medium">Stok</label>
                    <input
                      type="number"
                      name="stock"
                      defaultValue={editProduct.stock}
                      className="w-full rounded-lg border border-gray-3 bg-gray-1 py-2 px-3 text-dark outline-none transition-all focus:border-blue"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-dark font-medium">SKU</label>
                    <input
                      type="text"
                      name="sku"
                      defaultValue={editProduct.sku}
                      className="w-full rounded-lg border border-gray-3 bg-gray-1 py-2 px-3 text-dark outline-none transition-all focus:border-blue"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-dark font-medium">Durum</label>
                  <select 
                    name="status"
                    defaultValue={editProduct.status}
                    className="w-full rounded-lg border border-gray-3 bg-gray-1 py-2 px-3 text-dark outline-none transition-all focus:border-blue"
                  >
                    <option value="active">Aktif</option>
                    <option value="draft">Taslak</option>
                    <option value="inactive">Pasif</option>
                  </select>
                </div>
                
                {/* Mevcut Resimler */}
                {editProduct.images && editProduct.images.length > 0 && (
                  <div>
                    <label className="block mb-2 text-dark font-medium">Mevcut Resimler</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {editProduct.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="relative overflow-hidden rounded-lg border border-gray-200">
                            <Image
                              src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${image.url}`}
                              alt={image.alt || 'Ürün resmi'}
                              width={150}
                              height={150}
                              className="w-full h-32 object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                                <button
                                  type="button"
                                  onClick={() => handleSetMainImage(editProduct._id, image._id || '', index)}
                                  className={`p-2 rounded-full ${
                                    image.isMain 
                                      ? 'bg-green-500 text-white' 
                                      : 'bg-white text-gray-700 hover:bg-green-500 hover:text-white'
                                  } transition-colors duration-200`}
                                  title={image.isMain ? 'Ana resim' : 'Ana resim yap'}
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteImage(editProduct._id, image._id || '')}
                                  className={`p-2 rounded-full transition-colors duration-200 ${
                                    image.isMain 
                                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                      : 'bg-white text-red-500 hover:bg-red-500 hover:text-white'
                                  }`}
                                  title={image.isMain ? 'Ana resim silinemez' : 'Resmi sil'}
                                  disabled={image.isMain}
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 text-center">
                            <p className="text-xs text-gray-600 truncate">{image.alt || `Resim ${index + 1}`}</p>
                            {image.isMain && (
                              <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                Ana Resim
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Resimlerin üzerine gelerek düzenleme seçeneklerini görebilirsiniz
                    </p>
                  </div>
                )}
                
                <div>
                  <label className="block mb-2 text-dark font-medium">Yeni Resimler</label>
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      isDragOver 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      id="product-images-input"
                      onChange={(e) => handleFileSelect(e.target.files)}
                    />
                    <label htmlFor="product-images-input" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-lg font-medium text-gray-700 mb-2">
                          Resimleri seçin veya sürükleyip bırakın
                        </p>
                        <p className="text-sm text-gray-500">
                          PNG, JPG, JPEG, WebP formatlarında birden fazla resim seçebilirsiniz
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          Maksimum 10 resim, her biri 5MB&apos;a kadar
                        </p>
                        {selectedFiles.length > 0 && (
                          <p className="text-xs text-blue-600 mt-1">
                            {selectedFiles.length}/10 resim seçildi
                          </p>
                        )}
                      </div>
                    </label>
                  </div>
                  
                  {/* Seçilen dosyaların önizlemesi */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Seçilen Resimler ({selectedFiles.length}):
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="relative group">
                            <div className="relative overflow-hidden rounded-lg border border-gray-200">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="w-full h-24 object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => handleFileRemove(index)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                title="Dosyayı kaldır"
                              >
                                ×
                              </button>
                            </div>
                            <p className="text-xs text-gray-600 truncate mt-1 text-center">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-400 text-center">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-500 mt-2">
                    Mevcut resimlere ek olarak yeni resimler ekleyebilirsiniz. Yüklenen resimler otomatik olarak ürün resimlerine eklenecektir.
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditProduct(null);
                      setEditApplyDiscount(false);
                      setSelectedFiles([]); 
                    }}
                    disabled={editProductLoading}
                    className="px-4 py-2 text-gray-600 border border-gray-3 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={editProductLoading}
                    className="px-4 py-2 bg-blue text-white rounded-md hover:bg-blue-dark disabled:opacity-50"
                  >
                    {editProductLoading ? 'Güncelleniyor...' : 'Güncelle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Ürün Silme Onay Popup'ı */}
      {deleteProductId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-dark">Ürünü Sil</h3>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">
                Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteProductId(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-3 rounded-md hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  onClick={() => handleDeleteProduct(deleteProductId)}
                  className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-700"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kategori Silme Onay Popup'ı */}
      {deleteCategoryId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-dark">Kategoriyi Sil</h3>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">
                Bu kategoriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz, kategori resmi silinecek ve kategorideki tüm ürünler etkilenebilir.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteCategoryId(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-3 rounded-md hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  onClick={() => handleDeleteCategory(deleteCategoryId)}
                  className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-700"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Müşteri Detayları Modal'ı */}
      {customerDetailsModal && selectedCustomer && (
        <div 
          className="fixed inset-0 z-[9999] overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setCustomerDetailsModal(false);
              setSelectedCustomer(null);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto relative">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-dark">Müşteri Detayları</h3>
                <button
                  onClick={() => {
                    setCustomerDetailsModal(false);
                    setSelectedCustomer(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 z-[10000] relative"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {customerDetailsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Müşteri Bilgileri */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium text-dark mb-3">Müşteri Bilgileri</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Ad Soyad</p>
                        <p className="font-medium">{selectedCustomer.customer.firstName} {selectedCustomer.customer.lastName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">E-posta</p>
                        <p className="font-medium">{selectedCustomer.customer.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Telefon</p>
                        <p className="font-medium">{selectedCustomer.customer.phone || 'Belirtilmemiş'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Durum</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedCustomer.customer.isActive 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedCustomer.customer.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">E-posta Doğrulama</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedCustomer.customer.authentication.isEmailVerified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedCustomer.customer.authentication.isEmailVerified ? 'Doğrulandı' : 'Doğrulanmadı'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Kayıt Tarihi</p>
                        <p className="font-medium">{new Date(selectedCustomer.customer.createdAt).toLocaleDateString('tr-TR')}</p>
                      </div>
                    </div>
                  </div>

                  {/* İstatistikler */}
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-medium text-dark mb-3">Sipariş İstatistikleri</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{selectedCustomer.stats.totalOrders}</p>
                        <p className="text-sm text-gray-600">Toplam Sipariş</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{selectedCustomer.stats.totalSpent.toLocaleString('tr-TR')}₺</p>
                        <p className="text-sm text-gray-600">Toplam Harcama</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          {selectedCustomer.stats.totalOrders > 0 
                            ? (selectedCustomer.stats.totalSpent / selectedCustomer.stats.totalOrders).toFixed(2)
                            : 0}₺
                        </p>
                        <p className="text-sm text-gray-600">Ortalama Sipariş</p>
                      </div>
                    </div>
                  </div>

                  {/* Son Siparişler */}
                  <div>
                    <h4 className="font-medium text-dark mb-3">Son Siparişler</h4>
                    {selectedCustomer.orders.length > 0 ? (
                      <div className="space-y-3">
                        {selectedCustomer.orders.map((order) => (
                          <div key={order._id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-dark">#{order.orderNumber}</p>
                                <p className="text-sm text-gray-600">
                                  {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-dark">{order.pricing.total}₺</p>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  order.fulfillment.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                  order.fulfillment.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                  order.fulfillment.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {order.fulfillment.status === 'pending' ? 'Bekliyor' :
                                   order.fulfillment.status === 'confirmed' ? 'Onaylandı' :
                                   order.fulfillment.status === 'processing' ? 'İşleniyor' :
                                   order.fulfillment.status === 'shipped' ? 'Kargoda' :
                                   order.fulfillment.status === 'delivered' ? 'Teslim Edildi' :
                                   order.fulfillment.status === 'cancelled' ? 'İptal Edildi' : order.fulfillment.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">Henüz sipariş bulunmuyor.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stok Geçmişi Modal'ı */}
      {stockHistoryModal && selectedProductForStock && (
        <StockHistoryModal
          isOpen={stockHistoryModal}
          onClose={() => {
            setStockHistoryModal(false);
            setSelectedProductForStock(null);
          }}
          productId={selectedProductForStock._id}
          productName={selectedProductForStock.name}
          accessToken={accessToken || ''}
        />
      )}

      {/* Stok Güncelleme Modal'ı */}
      {updateStockModal && selectedProductForStock && (
        <UpdateStockModal
          isOpen={updateStockModal}
          onClose={() => {
            setUpdateStockModal(false);
            setSelectedProductForStock(null);
          }}
          productId={selectedProductForStock._id}
          productName={selectedProductForStock.name}
          currentStock={selectedProductForStock.stock}
          accessToken={accessToken || ''}
          onStockUpdated={handleStockUpdated}
        />
      )}
    </>
  );
};

export default MyAccount;
