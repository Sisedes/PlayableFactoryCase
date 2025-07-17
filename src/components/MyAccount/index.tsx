"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import AddressModal from "./AddressModal";
import Orders from "../Orders";
import { useAuth } from "@/store/authStore";
import { resendVerification } from "@/services";
import { getAllCategories } from "@/services/categoryService";
import { getAllProducts, getAllProductsForAdmin } from "@/services/productService";
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
  ProfileUpdateData 
} from "@/services/userService";
import { 
  getFavoriteProducts, 
  addToFavorites, 
  removeFromFavorites,
  FavoriteProduct 
} from "@/services/favoriteService";
import PasswordResetModal from "./PasswordResetModal";

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
  const [productImages, setProductImages] = useState<FileList | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressModalLoading, setAddressModalLoading] = useState(false);

  const { user, accessToken, isAdmin, updateUserProfile } = useAuth();

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

  useEffect(() => {
    const fetchData = async () => {
      if (isAdmin) {
        setLoading(true);
        try {
          console.log('Admin verileri yükleniyor...');
          
          const [categoriesResponse, productsResponse] = await Promise.all([
            getAllCategories().catch(error => {
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
      
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || ''
      });
    }
  }, [isAdmin, user, accessToken]);

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

    if (productForm.salePrice && parseFloat(productForm.salePrice) >= parseFloat(productForm.price)) {
      alert('İndirimli fiyat normal fiyattan düşük olmalıdır');
      return;
    }

    setSubmitLoading(true);
    
    try {
      console.log('Gönderilecek status değeri:', productForm.status);
      const formData = new FormData();
      
      formData.append('name', productForm.name);
      formData.append('category', productForm.category);
      formData.append('price', productForm.price);
      if (productForm.salePrice) formData.append('salePrice', productForm.salePrice);
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

  return (
    <>
      <Breadcrumb title={"My Account"} pages={["my account"]} />

      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">
            {/* <!--== user dashboard menu start ==--> */}
            <div className="xl:max-w-[370px] w-full bg-white rounded-xl shadow-1">
              <div className="flex xl:flex-col">
                <div className="hidden lg:flex flex-wrap items-center gap-5 py-6 px-4 sm:px-7.5 xl:px-9 border-r xl:border-r-0 xl:border-b border-gray-3">
                  <div className="max-w-[64px] w-full h-16 rounded-full overflow-hidden">
                    <Image
                      src="/images/users/user-04.jpg"
                      alt="user"
                      width={64}
                      height={64}
                    />
                  </div>

                  <div>
                    <p className="font-medium text-dark mb-0.5">
                      James Septimus
                    </p>
                    <p className="text-custom-xs">Member Since Sep 2020</p>
                  </div>
                </div>

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
                      Orders
                    </button>

                    <button
                      onClick={() => setActiveTab("downloads")}
                      className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                        activeTab === "downloads"
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
                          d="M11.5074 15.1306C11.3772 15.273 11.193 15.3542 11 15.3542C10.807 15.3542 10.6229 15.273 10.4926 15.1306L6.82594 11.1202C6.56973 10.8399 6.5892 10.4051 6.86943 10.1489C7.14966 9.89265 7.58452 9.91212 7.84073 10.1923L10.3125 12.8958V2.75C10.3125 2.3703 10.6203 2.0625 11 2.0625C11.3797 2.0625 11.6875 2.3703 11.6875 2.75V12.8958L14.1593 10.1923C14.4155 9.91212 14.8503 9.89265 15.1306 10.1489C15.4108 10.4051 15.4303 10.8399 15.1741 11.1202L11.5074 15.1306Z"
                          fill=""
                        />
                        <path
                          d="M3.4375 13.75C3.4375 13.3703 3.1297 13.0625 2.75 13.0625C2.37031 13.0625 2.0625 13.3703 2.0625 13.75V13.8003C2.06248 15.0539 2.06247 16.0644 2.16931 16.8591C2.28025 17.6842 2.51756 18.3789 3.06932 18.9307C3.62108 19.4824 4.3158 19.7198 5.1409 19.8307C5.93562 19.9375 6.94608 19.9375 8.1997 19.9375H13.8003C15.0539 19.9375 16.0644 19.9375 16.8591 19.8307C17.6842 19.7198 18.3789 19.4824 18.9307 18.9307C19.4824 18.3789 19.7198 17.6842 19.8307 16.8591C19.9375 16.0644 19.9375 15.0539 19.9375 13.8003V13.75C19.9375 13.3703 19.6297 13.0625 19.25 13.0625C18.8703 13.0625 18.5625 13.3703 18.5625 13.75C18.5625 15.0658 18.561 15.9835 18.468 16.6759C18.3775 17.3485 18.2121 17.7047 17.9584 17.9584C17.7047 18.2121 17.3485 18.3775 16.6759 18.4679C15.9835 18.561 15.0658 18.5625 13.75 18.5625H8.25C6.9342 18.5625 6.01652 18.561 5.32411 18.4679C4.65148 18.3775 4.29529 18.2121 4.04159 17.9584C3.78789 17.7047 3.62249 17.3485 3.53205 16.6759C3.43896 15.9835 3.4375 15.0658 3.4375 13.75Z"
                          fill=""
                        />
                      </svg>
                      Downloads
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
                      Addresses
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
                      Account Details
                    </button>

                    {/* Admin Sekmeler */}
                    {isAdmin && (
                      <>
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
                      Logout
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
                        <label className="block mb-2.5 text-dark font-medium">
                          İndirimli Fiyat (₺)
                        </label>
                        <input
                          type="number"
                          name="salePrice"
                          value={productForm.salePrice}
                          onChange={handleProductFormChange}
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="w-full rounded-lg border border-gray-3 bg-gray-1 py-3 px-4 text-dark outline-none transition-all focus:border-blue focus:bg-white"
                          disabled={submitLoading}
                        />
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
                            const categoryProductCount = products.filter(
                              (product) => product.category._id === category._id
                            ).length;
                            
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

                      {/* Tek Ürün Tablosu */}
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
                                            onClick={() => setEditProduct(product)}
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
                  
                  {/* Bekleyen Yorumlar */}
                  <div className="space-y-4">
                    {/* Örnek Yorum */}
                    <div className="border border-gray-3 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">AH</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-dark">Ahmet Yılmaz</h4>
                            <p className="text-sm text-gray-500">2 gün önce</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                          Bekliyor
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex items-center mb-2">
                          <div className="flex text-yellow-400">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                            </svg>
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                            </svg>
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                            </svg>
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                            </svg>
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                            </svg>
                          </div>
                          <span className="ml-2 text-sm text-gray-600">(5/5)</span>
                        </div>
                        <p className="text-dark font-medium mb-1">iPhone 14 Pro - Harika bir telefon!</p>
                      </div>
                      
                      <p className="text-gray-600 mb-4">
                        Bu telefonu 3 aydır kullanıyorum ve çok memnunum. Kamera kalitesi harika, 
                        batarya ömrü uzun ve performansı çok iyi. Kesinlikle tavsiye ederim.
                      </p>
                      
                      <div className="flex space-x-3">
                        <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors">
                          Onayla
                        </button>
                        <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">
                          Reddet
                        </button>
                        <button className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors">
                          Detay
                        </button>
                      </div>
                    </div>

                    {/* Örnek Yorum 2 */}
                    <div className="border border-gray-3 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">MK</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-dark">Melisa Kaya</h4>
                            <p className="text-sm text-gray-500">1 hafta önce</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                          Bekliyor
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex items-center mb-2">
                          <div className="flex text-yellow-400">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                            </svg>
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                            </svg>
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                            </svg>
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                            </svg>
                            <svg className="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 24 24">
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                            </svg>
                          </div>
                          <span className="ml-2 text-sm text-gray-600">(4/5)</span>
                        </div>
                        <p className="text-dark font-medium mb-1">MacBook Air M2 - İdeal laptop</p>
                      </div>
                      
                      <p className="text-gray-600 mb-4">
                        Çok hafif ve sessiz. Bataryası harika, günlük işlerimi rahatlıkla karşılıyor. 
                        Sadece fiyatı biraz yüksek ama değer.
                      </p>
                      
                      <div className="flex space-x-3">
                        <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors">
                          Onayla
                        </button>
                        <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">
                          Reddet
                        </button>
                        <button className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors">
                          Detay
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Yoksa boş durum */}
                  {/* 
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 className="text-lg font-medium text-dark mb-2">Bekleyen yorum bulunmuyor</h3>
                    <p className="text-gray-500">Şu anda onay bekleyen herhangi bir yorum yok.</p>
                  </div>
                  */}
                </div>
              </div>
            )}
            {/* <!-- manage reviews tab content end -->
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-dark">Ürün Düzenle</h3>
                <button
                  onClick={() => setEditProduct(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form className="space-y-4">
                <div>
                  <label className="block mb-2 text-dark font-medium">Ürün Adı</label>
                  <input
                    type="text"
                    defaultValue={editProduct.name}
                    className="w-full rounded-lg border border-gray-3 bg-gray-1 py-2 px-3 text-dark outline-none transition-all focus:border-blue"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-dark font-medium">Kategori</label>
                  <select 
                    defaultValue={editProduct.category._id}
                    className="w-full rounded-lg border border-gray-3 bg-gray-1 py-2 px-3 text-dark outline-none transition-all focus:border-blue"
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
                      step="0.01"
                      defaultValue={editProduct.price}
                      className="w-full rounded-lg border border-gray-3 bg-gray-1 py-2 px-3 text-dark outline-none transition-all focus:border-blue"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-dark font-medium">İndirimli Fiyat (₺)</label>
                    <input
                      type="number"
                      step="0.01"
                      defaultValue={editProduct.salePrice || ''}
                      className="w-full rounded-lg border border-gray-3 bg-gray-1 py-2 px-3 text-dark outline-none transition-all focus:border-blue"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block mb-2 text-dark font-medium">Açıklama</label>
                  <textarea
                    rows={3}
                    defaultValue={editProduct.description}
                    className="w-full rounded-lg border border-gray-3 bg-gray-1 py-2 px-3 text-dark outline-none transition-all focus:border-blue resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-dark font-medium">Stok</label>
                    <input
                      type="number"
                      defaultValue={editProduct.stock}
                      className="w-full rounded-lg border border-gray-3 bg-gray-1 py-2 px-3 text-dark outline-none transition-all focus:border-blue"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-dark font-medium">SKU</label>
                    <input
                      type="text"
                      defaultValue={editProduct.sku}
                      className="w-full rounded-lg border border-gray-3 bg-gray-1 py-2 px-3 text-dark outline-none transition-all focus:border-blue"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block mb-2 text-dark font-medium">Yeni Resimler</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="w-full rounded-lg border border-gray-3 bg-gray-1 py-2 px-3 text-dark outline-none transition-all focus:border-blue"
                  />
                  <p className="text-sm text-gray-500 mt-1">Mevcut resimlere ek olarak yeni resimler ekleyebilirsiniz</p>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditProduct(null)}
                    className="px-4 py-2 text-gray-600 border border-gray-3 rounded-md hover:bg-gray-50"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue text-white rounded-md hover:bg-blue-dark"
                  >
                    Güncelle
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
                  onClick={() => {
                    console.log('Silme işlemi:', deleteProductId);
                    setDeleteProductId(null);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyAccount;
