"use client";
import React, { useState, useRef, useEffect } from "react";
import { Address, AddressFormData } from "@/services/addressService";

interface AddressModalProps {
  isOpen: boolean;
  closeModal: () => void;
  onSave: (addressData: AddressFormData) => Promise<void>;
  editingAddress?: Address | null;
  isLoading?: boolean;
}

const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  closeModal,
  onSave,
  editingAddress,
  isLoading = false
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState<AddressFormData>({
    type: 'home',
    title: '',
    firstName: '',
    lastName: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Türkiye',
    phone: '',
    isDefault: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (editingAddress) {
        setFormData({
          type: editingAddress.type,
          title: editingAddress.title,
          firstName: editingAddress.firstName,
          lastName: editingAddress.lastName,
          company: editingAddress.company || '',
          address1: editingAddress.address1,
          address2: editingAddress.address2 || '',
          city: editingAddress.city,
          state: editingAddress.state,
          postalCode: editingAddress.postalCode,
          country: editingAddress.country,
          phone: editingAddress.phone || '',
          isDefault: editingAddress.isDefault
        });
      } else {
        setFormData({
          type: 'home',
          title: '',
          firstName: '',
          lastName: '',
          company: '',
          address1: '',
          address2: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'Türkiye',
          phone: '',
          isDefault: false
        });
      }
      setErrors({});
    }
  }, [isOpen, editingAddress]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeModal]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Adres başlığı gereklidir';
    if (!formData.firstName.trim()) newErrors.firstName = 'Ad gereklidir';
    if (!formData.lastName.trim()) newErrors.lastName = 'Soyad gereklidir';
    if (!formData.address1.trim()) newErrors.address1 = 'Adres gereklidir';
    if (!formData.city.trim()) newErrors.city = 'Şehir gereklidir';
    if (!formData.state.trim()) newErrors.state = 'İl/Bölge gereklidir';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Posta kodu gereklidir';
    if (!formData.country.trim()) newErrors.country = 'Ülke gereklidir';

    if (formData.postalCode && !/^\d{5}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Posta kodu 5 haneli olmalıdır';
    }

    if (formData.phone && !/^[+]?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Geçerli bir telefon numarası giriniz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSave(formData);
      closeModal();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 overflow-y-auto no-scrollbar w-full h-screen sm:py-20 xl:py-25 2xl:py-[150px] bg-dark/70 sm:px-8 px-4 py-5 z-99999">
      <div className="flex items-center justify-center">
        <div
          ref={modalRef}
          className="w-full max-w-[900px] rounded-xl shadow-3 bg-white p-7.5 relative modal-content"
        >
          <button
            onClick={closeModal}
            disabled={isLoading}
            aria-label="button for close modal"
            className="absolute top-0 right-0 sm:top-3 sm:right-3 flex items-center justify-center w-10 h-10 rounded-full ease-in duration-150 bg-meta text-body hover:text-dark disabled:opacity-50"
          >
            <svg
              className="fill-current"
              width="26"
              height="26"
              viewBox="0 0 26 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.3108 13L19.2291 8.08167C19.5866 7.72417 19.5866 7.12833 19.2291 6.77083C19.0543 6.59895 18.8189 6.50262 18.5737 6.50262C18.3285 6.50262 18.0932 6.59895 17.9183 6.77083L13 11.6892L8.08164 6.77083C7.90679 6.59895 7.67142 6.50262 7.42623 6.50262C7.18104 6.50262 6.94566 6.59895 6.77081 6.77083C6.41331 7.12833 6.41331 7.72417 6.77081 8.08167L11.6891 13L6.77081 17.9183C6.41331 18.2758 6.41331 18.8717 6.77081 19.2292C7.12831 19.5867 7.72414 19.5867 8.08164 19.2292L13 14.3108L17.9183 19.2292C18.2758 19.5867 18.8716 19.5867 19.2291 19.2292C19.5866 18.8717 19.5866 18.2758 19.2291 17.9183L14.3108 13Z"
                fill=""
              />
            </svg>
          </button>

          <div>
            <h3 className="text-xl font-medium text-dark mb-6">
              {editingAddress ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Adres Tipi ve Başlık */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="type" className="block mb-2.5 text-dark font-medium">
                    Adres Tipi <span className="text-red">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-50"
                  >
                    <option value="home">Ev</option>
                    <option value="work">İş</option>
                    <option value="other">Diğer</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="title" className="block mb-2.5 text-dark font-medium">
                    Adres Başlığı <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="Örn: Ev Adresim"
                    className={`rounded-md border ${errors.title ? 'border-red' : 'border-gray-3'} bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-50`}
                  />
                  {errors.title && <p className="text-red text-sm mt-1">{errors.title}</p>}
                </div>
              </div>

              {/* Ad Soyad */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="firstName" className="block mb-2.5 text-dark font-medium">
                    Ad <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`rounded-md border ${errors.firstName ? 'border-red' : 'border-gray-3'} bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-50`}
                  />
                  {errors.firstName && <p className="text-red text-sm mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label htmlFor="lastName" className="block mb-2.5 text-dark font-medium">
                    Soyad <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`rounded-md border ${errors.lastName ? 'border-red' : 'border-gray-3'} bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-50`}
                  />
                  {errors.lastName && <p className="text-red text-sm mt-1">{errors.lastName}</p>}
                </div>
              </div>

              {/* Şirket */}
              <div>
                <label htmlFor="company" className="block mb-2.5 text-dark font-medium">
                  Şirket (İsteğe bağlı)
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-50"
                />
              </div>

              {/* Adres Satırları */}
              <div>
                <label htmlFor="address1" className="block mb-2.5 text-dark font-medium">
                  Adres Satır 1 <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  name="address1"
                  value={formData.address1}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  placeholder="Mahalle, Sokak No"
                  className={`rounded-md border ${errors.address1 ? 'border-red' : 'border-gray-3'} bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-50`}
                />
                {errors.address1 && <p className="text-red text-sm mt-1">{errors.address1}</p>}
              </div>

              <div>
                <label htmlFor="address2" className="block mb-2.5 text-dark font-medium">
                  Adres Satır 2 (İsteğe bağlı)
                </label>
                <input
                  type="text"
                  name="address2"
                  value={formData.address2}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  placeholder="Daire, Kat, Kapı No"
                  className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-50"
                />
              </div>

              {/* Şehir, İl, Posta Kodu */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label htmlFor="city" className="block mb-2.5 text-dark font-medium">
                    Şehir <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`rounded-md border ${errors.city ? 'border-red' : 'border-gray-3'} bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-50`}
                  />
                  {errors.city && <p className="text-red text-sm mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label htmlFor="state" className="block mb-2.5 text-dark font-medium">
                    İl/Bölge <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`rounded-md border ${errors.state ? 'border-red' : 'border-gray-3'} bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-50`}
                  />
                  {errors.state && <p className="text-red text-sm mt-1">{errors.state}</p>}
                </div>

                <div>
                  <label htmlFor="postalCode" className="block mb-2.5 text-dark font-medium">
                    Posta Kodu <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="34000"
                    maxLength={5}
                    className={`rounded-md border ${errors.postalCode ? 'border-red' : 'border-gray-3'} bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-50`}
                  />
                  {errors.postalCode && <p className="text-red text-sm mt-1">{errors.postalCode}</p>}
                </div>
              </div>

              {/* Ülke ve Telefon */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="country" className="block mb-2.5 text-dark font-medium">
                    Ülke <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`rounded-md border ${errors.country ? 'border-red' : 'border-gray-3'} bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-50`}
                  />
                  {errors.country && <p className="text-red text-sm mt-1">{errors.country}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block mb-2.5 text-dark font-medium">
                    Telefon (İsteğe bağlı)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="+90 555 000 00 00"
                    className={`rounded-md border ${errors.phone ? 'border-red' : 'border-gray-3'} bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-50`}
                  />
                  {errors.phone && <p className="text-red text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>

              {/* Varsayılan Adres */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="rounded border-gray-3 text-blue focus:ring-blue focus:ring-2 disabled:opacity-50"
                />
                <label htmlFor="isDefault" className="ml-2 text-dark">
                  Bu adresi varsayılan adres olarak ayarla
                </label>
              </div>

              {/* Butonlar */}
              <div className="flex gap-4 pt-4">
              <button
                type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Kaydediliyor...
                    </>
                  ) : editingAddress ? 'Adresi Güncelle' : 'Adresi Kaydet'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isLoading}
                  className="inline-flex font-medium text-dark bg-gray-1 border border-gray-3 py-3 px-7 rounded-md ease-out duration-200 hover:bg-gray-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  İptal
              </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;

