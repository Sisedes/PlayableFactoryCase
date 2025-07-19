import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/store/authStore";
import { getUserAddresses, addAddress, type Address } from "@/services/addressService";
import { addressFormSchema, type AddressFormFormData } from "@/lib/validations";
import FormField from "@/components/Common/FormField";

interface AddressSelectorProps {
  onAddressSelect: (address: Address | null) => void;
  selectedAddress?: Address | null;
  title?: string;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({ 
  onAddressSelect, 
  selectedAddress, 
  title = "Adres Seçimi" 
}) => {
  const { user, accessToken } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch
  } = useForm<AddressFormFormData>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      type: 'home',
      title: '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      company: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Türkiye',
      phone: user?.phone || '',
      isDefault: false
    }
  });

  const watchedValues = watch();

  useEffect(() => {
    if (accessToken) {
      loadAddresses();
    }
  }, [accessToken]);

  useEffect(() => {
    if (user) {
      setValue('firstName', user.firstName || '');
      setValue('lastName', user.lastName || '');
      setValue('phone', user.phone || '');
    }
  }, [user, setValue]);

  const loadAddresses = async () => {
    if (!accessToken) return;
    
    setLoading(true);
    try {
      const response = await getUserAddresses(accessToken);
      if (response.success && response.data) {
        setAddresses(response.data);
        
        const defaultAddress = response.data.find(addr => addr.isDefault);
        if (defaultAddress && !selectedAddress) {
          onAddressSelect(defaultAddress);
        }
      }
    } catch (error) {
      console.error('Adresler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: AddressFormFormData) => {
    if (!accessToken) return;

    setSavingAddress(true);
    try {
      const response = await addAddress(data, accessToken);
      if (response.success && response.data) {
        await loadAddresses();
        onAddressSelect(response.data);
        setShowNewAddressForm(false);
        reset();
      } else {
        alert(response.message || 'Adres kaydedilemedi');
      }
    } catch (error) {
      console.error('Adres kaydetme hatası:', error);
      alert('Adres kaydedilirken hata oluştu');
    } finally {
      setSavingAddress(false);
    }
  };

  const formatAddress = (address: Address) => {
    return `${address.address1}${address.address2 ? `, ${address.address2}` : ''}, ${address.city}/${address.state} ${address.postalCode}`;
  };

  if (loading) {
    return (
      <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-medium text-xl text-dark">{title}</h3>
        <button
          onClick={() => setShowNewAddressForm(!showNewAddressForm)}
          className="flex items-center gap-2 text-blue hover:text-blue-dark font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {showNewAddressForm ? 'İptal' : 'Yeni Adres Ekle'}
        </button>
      </div>

      {/* Yeni Adres Formu */}
      {showNewAddressForm && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-dark mb-4">Yeni Adres Ekle</h4>
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormField
                label="Adres Başlığı"
                {...register('title')}
                error={errors.title}
                required
                placeholder="Ev, İş, vb."
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adres Tipi
                </label>
                <select
                  {...register('type')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue/20"
                >
                  <option value="home">Ev</option>
                  <option value="work">İş</option>
                  <option value="other">Diğer</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormField
                label="Ad"
                {...register('firstName')}
                error={errors.firstName}
                required
                placeholder="Ad"
              />
              <FormField
                label="Soyad"
                {...register('lastName')}
                error={errors.lastName}
                required
                placeholder="Soyad"
              />
            </div>

            <div className="mb-4">
              <FormField
                label="Adres"
                {...register('address1')}
                error={errors.address1}
                required
                placeholder="Sokak adı ve numara"
                className="mb-2"
              />
              <FormField
                {...register('address2')}
                error={errors.address2}
                placeholder="Apartman, daire, vb. (isteğe bağlı)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <FormField
                label="Şehir"
                {...register('city')}
                error={errors.city}
                required
                placeholder="İstanbul"
              />
              <FormField
                label="İl"
                {...register('state')}
                error={errors.state}
                required
                placeholder="İstanbul"
              />
              <FormField
                label="Posta Kodu"
                {...register('postalCode')}
                error={errors.postalCode}
                required
                placeholder="34000"
              />
            </div>

            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('isDefault')}
                  className="w-4 h-4 text-blue border-gray-300 rounded focus:ring-blue"
                />
                <span className="text-sm text-gray-700">Varsayılan adres olarak ayarla</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={savingAddress}
                className="flex-1 bg-blue text-white py-2 px-4 rounded-md hover:bg-blue-dark disabled:opacity-50"
              >
                {savingAddress ? 'Kaydediliyor...' : 'Adresi Kaydet ve Seç'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewAddressForm(false);
                  reset();
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kayıtlı Adresler */}
      {addresses.length > 0 ? (
        <div className="space-y-3">
          {addresses.map((address) => (
            <div
              key={address._id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedAddress?._id === address._id
                  ? 'border-blue bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onAddressSelect(address)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {address.title}
                    </span>
                    {address.isDefault && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Varsayılan
                      </span>
                    )}
                    <span className="text-xs text-gray-500 capitalize">
                      ({address.type})
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">
                    {address.firstName} {address.lastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatAddress(address)}
                  </p>
                  {address.phone && (
                    <p className="text-sm text-gray-600 mt-1">
                      Tel: {address.phone}
                    </p>
                  )}
                </div>
                <div className="ml-4">
                  {selectedAddress?._id === address._id && (
                    <svg className="w-5 h-5 text-blue" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Henüz kayıtlı adresiniz bulunmuyor.</p>
          <button
            onClick={() => setShowNewAddressForm(true)}
            className="bg-blue text-white py-2 px-4 rounded-md hover:bg-blue-dark"
          >
            İlk Adresinizi Ekleyin
          </button>
        </div>
      )}

      {/* Geçici Adres Seçeneği */}
      {addresses.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              Veya geçici bir adres girebilirsiniz (kaydedilmez)
            </p>
            <button
              onClick={() => onAddressSelect(null)}
              className={`px-4 py-2 rounded-md border transition-colors ${
                !selectedAddress
                  ? 'border-blue bg-blue-50 text-blue'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              Geçici Adres Kullan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressSelector; 