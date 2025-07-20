"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/store/authStore";
import AddressModal from "./AddressModal";
import { 
  getUserAddresses, 
  addAddress, 
  updateAddress, 
  deleteAddress, 
  setDefaultAddress,
  Address,
  AddressFormData 
} from "@/services/addressService";
import toast from "react-hot-toast";

const UserAddresses = () => {
  const { accessToken } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressModal, setAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressModalLoading, setAddressModalLoading] = useState(false);

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
        closeAddressModal();
        toast.success(response.message || (editingAddress ? 'Adres güncellendi' : 'Adres eklendi'));
      } else {
        toast.error(response.message || 'İşlem başarısız');
      }
    } catch (error) {
      toast.error('Adres kaydedilirken hata oluştu');
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
        toast.success('Adres silindi');
      } else {
        toast.error(response.message || 'Adres silinemedi');
      }
    } catch (error) {
      toast.error('Adres silinirken hata oluştu');
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    if (!accessToken) return;

    try {
      const response = await setDefaultAddress(addressId, accessToken);
      if (response.success) {
        await loadAddresses();
        toast.success('Varsayılan adres güncellendi');
      } else {
        toast.error(response.message || 'Varsayılan adres güncellenemedi');
      }
    } catch (error) {
      toast.error('Varsayılan adres ayarlanırken hata oluştu');
    }
  };

  useEffect(() => {
    if (accessToken) {
      loadAddresses();
    }
  }, [accessToken]);

  return (
    <>
      <div className="xl:max-w-[770px] w-full">
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

      <AddressModal
        isOpen={addressModal}
        closeModal={closeAddressModal}
        onSave={handleAddressSave}
        editingAddress={editingAddress}
        isLoading={addressModalLoading}
      />
    </>
  );
};

export default UserAddresses; 