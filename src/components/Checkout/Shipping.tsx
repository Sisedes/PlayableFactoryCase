import React from "react";
import { type Address } from "@/services/orderService";
import { useAuth } from "@/store/authStore";

interface ShippingProps {
  address: Address;
  onChange: (field: string, value: string) => void;
  title?: string;
}

const Shipping = ({ address, onChange, title = "Adres" }: ShippingProps) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-xl text-dark">
            {title}
          </h3>
          {isAuthenticated && (
            <div className="flex items-center gap-2 text-green-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Otomatik Dolduruldu</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-8.5">
        <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
          <div className="w-full">
            <label htmlFor="firstName" className="block mb-2.5">
              Ad <span className="text-red">*</span>
            </label>

            <input
              type="text"
              name="firstName"
              id="firstName"
              value={address.firstName}
              onChange={(e) => onChange('firstName', e.target.value)}
              placeholder="Ahmet"
              className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${
                isAuthenticated ? 'border-green-300 bg-green-50' : 'border-gray-3'
              }`}
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
              value={address.lastName}
              onChange={(e) => onChange('lastName', e.target.value)}
              placeholder="Yılmaz"
              className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${
                isAuthenticated ? 'border-green-300 bg-green-50' : 'border-gray-3'
              }`}
            />
          </div>
        </div>

        <div className="mb-5">
          <label htmlFor="company" className="block mb-2.5">
            Şirket Adı (İsteğe bağlı)
          </label>

          <input
            type="text"
            name="company"
            id="company"
            value={address.company || ''}
            onChange={(e) => onChange('company', e.target.value)}
            placeholder="Şirket adı"
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
        </div>

        <div className="mb-5">
          <label htmlFor="address1" className="block mb-2.5">
            Adres <span className="text-red">*</span>
          </label>

          <input
            type="text"
            name="address1"
            id="address1"
            value={address.address1}
            onChange={(e) => onChange('address1', e.target.value)}
            placeholder="Sokak adı ve numara"
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />

          <div className="mt-5">
            <input
              type="text"
              name="address2"
              id="address2"
              value={address.address2 || ''}
              onChange={(e) => onChange('address2', e.target.value)}
              placeholder="Apartman, daire, vb. (isteğe bağlı)"
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
          <div className="w-full">
            <label htmlFor="city" className="block mb-2.5">
              Şehir <span className="text-red">*</span>
            </label>

            <input
              type="text"
              name="city"
              id="city"
              value={address.city}
              onChange={(e) => onChange('city', e.target.value)}
              placeholder="İstanbul"
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>

          <div className="w-full">
            <label htmlFor="state" className="block mb-2.5">
              İl <span className="text-red">*</span>
            </label>

            <input
              type="text"
              name="state"
              id="state"
              value={address.state}
              onChange={(e) => onChange('state', e.target.value)}
              placeholder="İstanbul"
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
          <div className="w-full">
            <label htmlFor="postalCode" className="block mb-2.5">
              Posta Kodu <span className="text-red">*</span>
            </label>

            <input
              type="text"
              name="postalCode"
              id="postalCode"
              value={address.postalCode}
              onChange={(e) => onChange('postalCode', e.target.value)}
              placeholder="34000"
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>

          <div className="w-full">
            <label htmlFor="country" className="block mb-2.5">
              Ülke <span className="text-red">*</span>
            </label>

            <input
              type="text"
              name="country"
              id="country"
              value={address.country}
              onChange={(e) => onChange('country', e.target.value)}
              placeholder="Türkiye"
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>
        </div>

        <div className="mb-5">
          <label htmlFor="phone" className="block mb-2.5">
            Telefon <span className="text-red">*</span>
          </label>

          <input
            type="tel"
            name="phone"
            id="phone"
            value={address.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="0555 123 45 67"
            className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${
              isAuthenticated ? 'border-green-300 bg-green-50' : 'border-gray-3'
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default Shipping;
