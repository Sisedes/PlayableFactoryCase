import React, { useState } from "react";
import { useAuth } from "@/store/authStore";
import Link from "next/link";

interface LoginProps {
  showLoginForm?: boolean;
  onShowLoginForm?: (show: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ showLoginForm, onShowLoginForm }) => {
  const { user, isAuthenticated } = useAuth();
  const [dropdown, setDropdown] = useState(false);

  if (isAuthenticated && user) {
    return (
      <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-lg text-dark">Müşteri Bilgileri</h3>
          <div className="flex items-center gap-2 text-green-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Giriş Yapıldı</span>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Ad Soyad</p>
              <p className="font-medium text-dark">{user.firstName} {user.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">E-posta</p>
              <p className="font-medium text-dark">{user.email}</p>
            </div>
            {user.phone && (
              <div>
                <p className="text-sm text-gray-600">Telefon</p>
                <p className="font-medium text-dark">{user.phone}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Hesap Durumu</p>
              <p className="font-medium text-dark">
                {user.emailVerified ? 'E-posta Doğrulandı' : 'E-posta Doğrulanmadı'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>✓ Bilgileriniz otomatik olarak dolduruldu</p>
          <p>✓ Sipariş geçmişinize erişebilirsiniz</p>
          <p>✓ Hızlı ödeme seçenekleri</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-1 rounded-[10px]">
      <div
        onClick={() => setDropdown(!dropdown)}
        className={`cursor-pointer flex items-center gap-0.5 py-5 px-5.5 ${
          dropdown && "border-b border-gray-3"
        }`}
      >
        <span className="text-dark">Mevcut müşteri misiniz?</span>
        <span className="flex items-center gap-2.5 pl-1 font-medium text-blue">
          Giriş yapmak için tıklayın
          <svg
            className={`${
              dropdown && "rotate-180"
            } fill-current ease-out duration-200`}
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.06103 7.80259C4.30813 7.51431 4.74215 7.48092 5.03044 7.72802L10.9997 12.8445L16.9689 7.72802C17.2572 7.48092 17.6912 7.51431 17.9383 7.80259C18.1854 8.09088 18.1521 8.5249 17.8638 8.772L11.4471 14.272C11.1896 14.4927 10.8097 14.4927 10.5523 14.272L4.1356 8.772C3.84731 8.5249 3.81393 8.09088 4.06103 7.80259Z"
              fill=""
            />
          </svg>
        </span>
      </div>

      {/* <!-- dropdown menu --> */}
      <div
        className={`${
          dropdown ? "block" : "hidden"
        } pt-7.5 pb-8.5 px-4 sm:px-8.5`}
      >
        <div className="mb-6">
          <p className="text-custom-sm text-gray-600 mb-4">
            Giriş yaparak daha hızlı ödeme yapabilir ve sipariş geçmişinize erişebilirsiniz.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-blue-800 mb-2">Giriş Yapmanın Avantajları:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Bilgileriniz otomatik doldurulur</li>
              <li>• Sipariş geçmişinize erişim</li>
              <li>• Hızlı ödeme seçenekleri</li>
              <li>• Özel indirimler ve kampanyalar</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/signin?redirect=/checkout"
            className="flex-1 flex justify-center items-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark"
          >
            Giriş Yap
          </Link>
          
          <Link
            href="/signup?redirect=/checkout"
            className="flex-1 flex justify-center items-center font-medium text-blue bg-blue-50 border border-blue-200 py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-100"
          >
            Kayıt Ol
          </Link>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Veya misafir olarak devam edebilirsiniz
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
