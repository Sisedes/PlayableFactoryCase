import React from "react";
import Link from "next/link";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Ana Footer İçeriği */}
        <div className="py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Şirket Bilgileri */}
          <div>
            <div className="flex items-center mb-4">
              <img
                src="/images/logo/logo.png"
                alt="Logo"
                className="h-8 w-auto"
              />
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Kaliteli ürünler ve müşteri memnuniyeti odaklı hizmet anlayışımızla 
              sizlere en iyi alışveriş deneyimini sunuyoruz.
            </p>
            
            {/* İletişim Bilgileri */}
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span>+90 (212) 555 0123</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span>info@pazarcik.com</span>
              </div>
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Hızlı Linkler
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/shop-with-sidebar" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Ürünler
                </Link>
              </li>
              <li>
                <Link href="/shop-with-sidebar" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Kategoriler
                </Link>
              </li>
            </ul>
          </div>

          {/* Hesap */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Hesabım
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/my-account" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Hesabım
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Siparişlerim
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Favorilerim
                </Link>
              </li>
              <li>
                <Link href="/signin" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Giriş Yap
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Alt Footer */}
        <div className="border-t border-gray-200 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-sm text-gray-500">
              &copy; {year} Pazarcık. Tüm hakları saklıdır.
            </p>
            <div className="flex space-x-4">
              {/* Gizlilik ve Şartlar linkleri kaldırıldı */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
