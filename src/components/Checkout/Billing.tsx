import React, { useState } from "react";
import { useAuth } from "@/store/authStore";
import { updateProfile } from "@/services/userService";

interface CustomerInfo {
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
}

interface BillingProps {
  customerInfo: CustomerInfo;
  onChange: (field: string, value: string) => void;
}

const Billing = ({ customerInfo, onChange }: BillingProps) => {
  const { isAuthenticated, user, accessToken, refreshUserData, updateUserProfile } = useAuth();
  const [phoneEdit, setPhoneEdit] = useState(!!(isAuthenticated && (!user?.phone || user.phone === "")));
  const [phoneValue, setPhoneValue] = useState(customerInfo.phone || "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handlePhoneSave = async () => {
    if (!accessToken) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const result = await updateProfile({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        phone: phoneValue
      }, accessToken);
      if (result.success) {
        setSaveSuccess(true);
        setPhoneEdit(false);
        updateUserProfile({ phone: phoneValue });
        onChange('phone', phoneValue);
      } else {
        setSaveError(result.message || "Telefon kaydedilemedi");
      }
    } catch (err: any) {
      setSaveError("Telefon kaydedilemedi");
    } finally {
      setSaving(false);
    }
  };

  const showPhoneEdit = isAuthenticated && (!user?.phone || user.phone === "" || phoneEdit);
  const phoneReadOnly = isAuthenticated && user?.phone && !phoneEdit;

  return (
    <div className="mt-9">
      <div className="flex items-center justify-between mb-5.5">
        <h2 className="font-medium text-dark text-xl sm:text-2xl">
          Müşteri Bilgileri
        </h2>
        {!isAuthenticated && (
          <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Misafir Kullanıcı</span>
          </div>
        )}
      </div>
      {!isAuthenticated && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-5">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="font-medium text-orange-800 mb-1">Misafir Olarak Devam Ediyorsunuz</h4>
              <p className="text-sm text-orange-700">
                Giriş yaparak bilgilerinizin otomatik doldurulmasını sağlayabilir ve sipariş geçmişinize erişebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
        <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
          <div className="w-full">
            <label htmlFor="firstName" className="block mb-2.5">
              Ad <span className="text-red">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              value={customerInfo.firstName}
              onChange={(e) => onChange('firstName', e.target.value)}
              placeholder="Ahmet"
              className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${
                isAuthenticated ? 'border-green-300 bg-green-50' : 'border-gray-3'
              }`}
              readOnly={isAuthenticated}
            />
            {isAuthenticated && (
              <p className="text-xs text-green-600 mt-1">✓ Hesap bilgilerinizden otomatik dolduruldu</p>
            )}
          </div>
          <div className="w-full">
            <label htmlFor="lastName" className="block mb-2.5">
              Soyad <span className="text-red">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              value={customerInfo.lastName}
              onChange={(e) => onChange('lastName', e.target.value)}
              placeholder="Yılmaz"
              className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${
                isAuthenticated ? 'border-green-300 bg-green-50' : 'border-gray-3'
              }`}
              readOnly={isAuthenticated}
            />
            {isAuthenticated && (
              <p className="text-xs text-green-600 mt-1">✓ Hesap bilgilerinizden otomatik dolduruldu</p>
            )}
          </div>
        </div>
        <div className="mb-5">
          <label htmlFor="email" className="block mb-2.5">
            E-posta Adresi <span className="text-red">*</span>
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={customerInfo.email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="ornek@email.com"
            className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${
              isAuthenticated ? 'border-green-300 bg-green-50' : 'border-gray-3'
            }`}
            readOnly={isAuthenticated}
          />
          {isAuthenticated && (
            <p className="text-xs text-green-600 mt-1">✓ Hesap bilgilerinizden otomatik dolduruldu</p>
          )}
        </div>
        <div className="mb-5.5">
          <label htmlFor="phone" className="block mb-2.5">
            Telefon <span className="text-red">*</span>
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="tel"
              name="phone"
              id="phone"
              value={showPhoneEdit ? phoneValue : (customerInfo.phone || "")}
              onChange={(e) => {
                setPhoneValue(e.target.value);
                if (showPhoneEdit) onChange('phone', e.target.value);
              }}
              placeholder="0555 123 45 67"
              className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${
                phoneReadOnly ? 'border-green-300 bg-green-50' : 'border-gray-3'
              }`}
              readOnly={phoneReadOnly}
            />
            {showPhoneEdit && (
              <button
                type="button"
                onClick={handlePhoneSave}
                disabled={saving || !phoneValue}
                className="px-4 py-2 bg-blue text-white rounded hover:bg-blue-dark disabled:opacity-50"
              >
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            )}
          </div>
          {saveError && <p className="text-xs text-red-600 mt-1">{saveError}</p>}
          {saveSuccess && <p className="text-xs text-green-600 mt-1">Telefon numaranız kaydedildi!</p>}
          {phoneReadOnly && (
            <p className="text-xs text-green-600 mt-1">✓ Hesap bilgilerinizden otomatik dolduruldu</p>
          )}
          {showPhoneEdit && !user?.phone && (
            <p className="text-xs text-orange-600 mt-1">Telefon numaranız profilinize kaydedilecektir.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Billing;
