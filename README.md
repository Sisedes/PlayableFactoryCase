# Pazarcık - E-Ticaret Case Study

[![Next.js](https://img.shields.io/badge/Next.js-15.2.3-000?logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.3.3-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2.6.1-764ABC?logo=redux)](https://redux-toolkit.js.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.17.0-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18.2-000?logo=express)](https://expressjs.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-FFB300?logo=jsonwebtokens)](https://jwt.io/)

---

## İçindekiler

- [Proje Özeti](#-proje-özeti)
- [Teknoloji Yığını](#-teknoloji-yığını)
- [Kurulum ve Çalıştırma](#-kurulum-ve-çalıştırma)
- [Demo Hesaplar](#-demo-hesaplar)
- [API Dökümantasyonu](#-api-dökümantasyonu)
- [Özellikler](#-özellikler)
- [Proje Yapısı](#-proje-yapısı)
- [Ortam Değişkenleri](#-ortam-değişkenleri)
- [Yayınlama Talimatları](#-yayınlama-talimatları)
- [Katkı ve Geri Bildirim](#-katkı-ve-geri-bildirim)
- [Lisans](#-lisans)

---

## Proje Özeti

Pazarcık, modern e-ticaret deneyimini hem müşteri hem de yönetici tarafında eksiksiz bir şekilde sunan, full-stack bir case study projesidir. 

**Ana Özellikler:**
- Tam fonksiyonel e-ticaret platformu
- Kullanıcı yönetimi ve kimlik doğrulama
- Ürün kataloğu ve kategori yönetimi
- Sepet ve sipariş sistemi
- Ürün yorumları ve puanlama
- Akıllı öneri sistemi
- Yönetici paneli ve analitik
- Responsive tasarım
- Güvenlik odaklı mimari

---

## Teknoloji Yığını

### Frontend
- **Next.js 15.2.3** - React framework (App Router)
- **TypeScript 5.2.2** - Tip güvenliği
- **Tailwind CSS 3.3.3** - Utility-first CSS framework
- **Redux Toolkit 2.6.1** - State yönetimi
- **Zustand 5.0.6** - Hafif state yönetimi
- **React Hook Form 7.60.0** - Form yönetimi
- **Zod 4.0.5** - Schema validasyonu
- **Axios 1.10.0** - HTTP client
- **Swiper 10.2.0** - Carousel/slider
- **Recharts 3.1.0** - Grafik bileşenleri

### Backend
- **Node.js 18+** - JavaScript runtime
- **Express.js 4.18.2** - Web framework
- **TypeScript 5.3.3** - Tip güvenliği
- **MongoDB 6.17.0** - NoSQL veritabanı
- **Mongoose 8.16.4** - MongoDB ODM
- **JWT 9.0.2** - Kimlik doğrulama
- **bcryptjs 2.4.3** - Parola hashleme
- **Multer 1.4.5** - Dosya yükleme
- **Nodemailer 6.10.1** - E-posta gönderimi
- **Sharp 0.33.1** - Resim işleme
- **Swagger 6.2.8** - API dokümantasyonu

---

## Kurulum ve Çalıştırma

### Gereksinimler
- **Node.js 18+** (LTS sürümü önerilir)
- **MongoDB 6.0+** (Community Edition)
- **npm veya yarn** paket yöneticisi

### Adım 1: Projeyi Klonlayın
```bash
git clone <repository-url>
cd case-study
```

### Adım 2: Backend Kurulumu
```bash
cd backend
npm install
cp env.example .env
```

### Adım 3: Veritabanı Kurulumu
```bash
# MongoDB'yi başlatın
mongod

# Veya MongoDB servisini başlatın
sudo systemctl start mongod
```

### Adım 4: Frontend Kurulumu
```bash
cd ..
npm install
```

### Adım 5: Ortam Değişkenlerini Ayarlayın
Backend `.env` dosyasını düzenleyin:
```env
MONGODB_URI=mongodb://localhost:27017/ecommerce-db
JWT_SECRET=your-super-secure-jwt-secret-key-here
EMAIL_USER=your-email@hotmail.com
EMAIL_PASS=your-hotmail-password
```

### Adım 6: Seed Verilerini Yükleyin
```bash
cd backend
npm run seed
```

### Adım 7: Uygulamayı Çalıştırın
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
npm run dev
```

**Erişim Adresleri:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/health

---

## Demo Hesaplar

### Admin Hesabı
- **E-posta:** `admin@ecommerce.com`
- **Şifre:** `Admin123!`

### Müşteri Hesabı
- **E-posta:** `customer@example.com`
- **Şifre:** `Customer123!`

> Seed komutu ile örnek kullanıcılar, ürünler ve kategoriler otomatik olarak eklenir.

---

## API Dökümantasyonu

### Kimlik Doğrulama API'leri (Authentication)

| Endpoint | Method | Açıklama | Erişim | İşlev |
|----------|--------|----------|--------|-------|
| `/api/auth/register` | POST | Kullanıcı kaydı | Public | Yeni kullanıcı hesabı oluşturur ve doğrulama e-postası gönderir |
| `/api/auth/login` | POST | Kullanıcı girişi | Public | Kullanıcı kimlik bilgilerini doğrular ve JWT token döner |
| `/api/auth/logout` | POST | Kullanıcı çıkışı | Private | Kullanıcı oturumunu sonlandırır ve token'ı geçersiz kılar |
| `/api/auth/refresh` | POST | Access token yenileme | Public | Süresi dolmuş access token'ı refresh token ile yeniler |
| `/api/auth/verify-email/:token` | GET | E-posta doğrulama | Public | E-posta doğrulama token'ını kontrol eder ve hesabı aktifleştirir |
| `/api/auth/forgot-password` | POST | Parola sıfırlama isteği | Public | Parola sıfırlama kodu e-posta ile gönderir |
| `/api/auth/verify-reset-code` | POST | Parola sıfırlama kodunu doğrula | Public | Gönderilen parola sıfırlama kodunu doğrular |
| `/api/auth/reset-password` | POST | Kod ile parola sıfırlama | Public | Doğrulanmış kod ile yeni parola belirler |
| `/api/auth/me` | GET | Mevcut kullanıcı bilgileri | Private | Giriş yapmış kullanıcının profil bilgilerini getirir |
| `/api/auth/validate-token` | POST | Token doğrulama | Private | JWT token'ın geçerliliğini kontrol eder |
| `/api/auth/upload-profile-image` | POST | Profil resmi yükleme | Private | Kullanıcının profil fotoğrafını yükler ve kaydeder |
| `/api/auth/check-auth` | GET | Kimlik doğrulama durumu kontrolü | Public | Kullanıcının giriş yapıp yapmadığını kontrol eder |
| `/api/auth/resend-verification` | POST | Doğrulama e-postası yeniden gönderme | Private | E-posta doğrulama linkini yeniden gönderir |

### Kullanıcı API'leri (Users)

| Endpoint | Method | Açıklama | Erişim | İşlev |
|----------|--------|----------|--------|-------|
| `/api/users/profile` | PUT | Kullanıcı profilini güncelle | Private | Kullanıcının ad, soyad, telefon gibi bilgilerini günceller |
| `/api/users/addresses` | GET | Kullanıcının adreslerini getir | Private | Kullanıcının kayıtlı tüm adreslerini listeler |
| `/api/users/addresses` | POST | Yeni adres ekle | Private | Kullanıcıya yeni teslimat adresi ekler |
| `/api/users/addresses/:addressId` | PUT | Adres güncelle | Private | Mevcut adres bilgilerini günceller |
| `/api/users/addresses/:addressId` | DELETE | Adres sil | Private | Belirtilen adresi kullanıcının adres listesinden kaldırır |
| `/api/users/addresses/:addressId/default` | PUT | Varsayılan adres ayarla | Private | Belirtilen adresi varsayılan teslimat adresi yapar |
| `/api/users/favorites` | GET | Favori ürünleri getir | Private | Kullanıcının favori ürünlerini listeler |
| `/api/users/favorites` | POST | Favorilere ürün ekle | Private | Ürünü kullanıcının favori listesine ekler |
| `/api/users/favorites/:productId` | DELETE | Favorilerden ürün çıkar | Private | Ürünü kullanıcının favori listesinden kaldırır |
| `/api/users/favorites/:productId/check` | GET | Favori durumunu kontrol et | Private | Ürünün favori listesinde olup olmadığını kontrol eder |

### Ürün API'leri (Products)

| Endpoint | Method | Açıklama | Erişim | İşlev |
|----------|--------|----------|--------|-------|
| `/api/products` | GET | Tüm ürünleri listele | Public | Filtreleme, sıralama ve sayfalama ile ürünleri listeler |
| `/api/products/popular` | GET | Popüler ürünleri getir | Public | En çok satılan ve görüntülenen ürünleri getirir |
| `/api/products/latest` | GET | En son eklenen ürünler | Public | Sisteme en son eklenen ürünleri listeler |
| `/api/products/similar` | GET | Benzer ürünleri getir | Public | Belirli bir ürüne benzer ürünleri önerir |
| `/api/products/category/:categoryId` | GET | Kategoriye göre ürünler | Public | Belirli kategorideki ürünleri listeler |
| `/api/products/:id` | GET | Ürün detayı | Public | Ürünün tüm detaylarını ve resimlerini getirir |
| `/api/products/:id/increment-view` | POST | Ürün görüntüleme sayısını artır | Public | Ürünün görüntülenme sayısını bir artırır |
| `/api/products` | POST | Yeni ürün oluştur | Admin | Yeni ürün ekler ve resimlerini yükler |
| `/api/products/:id` | PUT | Ürün güncelle | Admin | Mevcut ürün bilgilerini günceller |
| `/api/products/:id` | DELETE | Ürün sil | Admin | Ürünü sistemden tamamen kaldırır |
| `/api/products/admin/low-stock-alerts` | GET | Düşük stok uyarıları | Admin | Stoku azalan ürünleri listeler |
| `/api/products/admin/stock-statistics` | GET | Stok istatistikleri | Admin | Genel stok durumu istatistiklerini gösterir |

### Kategori API'leri (Categories)

| Endpoint | Method | Açıklama | Erişim | İşlev |
|----------|--------|----------|--------|-------|
| `/api/categories` | GET | Tüm kategorileri listele | Public | Sistemdeki tüm ürün kategorilerini listeler |
| `/api/categories/stats` | GET | Kategori istatistikleri | Public | Her kategorideki ürün sayısı gibi istatistikleri gösterir |
| `/api/categories/:slug` | GET | Slug ile kategori detayı | Public | URL slug'ı ile kategori bilgilerini getirir |
| `/api/categories` | POST | Yeni kategori oluştur | Admin | Yeni ürün kategorisi ekler ve resmini yükler |
| `/api/categories/:id` | PUT | Kategori güncelle | Admin | Mevcut kategori bilgilerini günceller |
| `/api/categories/:id` | DELETE | Kategori sil | Admin | Kategoriyi sistemden kaldırır |

### Sepet API'leri (Cart)

| Endpoint | Method | Açıklama | Erişim | İşlev |
|----------|--------|----------|--------|-------|
| `/api/cart` | GET | Kullanıcının sepetini getir | Private | Kullanıcının sepetindeki tüm ürünleri listeler |
| `/api/cart/add` | POST | Sepete ürün ekle | Private | Ürünü kullanıcının sepetine ekler veya miktarını artırır |
| `/api/cart/update/:itemId` | PUT | Sepet öğesini güncelle | Private | Sepetteki ürünün miktarını değiştirir |
| `/api/cart/remove/:itemId` | DELETE | Sepetten ürün çıkar | Private | Ürünü kullanıcının sepetinden tamamen kaldırır |
| `/api/cart/clear` | DELETE | Sepeti temizle | Private | Kullanıcının sepetindeki tüm ürünleri siler |
| `/api/cart/apply-coupon` | POST | Kupon uygula | Private | Geçerli kupon kodunu sepete uygular ve indirim yapar |
| `/api/cart/remove-coupon` | DELETE | Kuponu kaldır | Private | Uygulanmış kuponu sepetten kaldırır |
| `/api/cart/merge` | POST | Sepetleri birleştir | Private | Misafir sepetini kullanıcı sepeti ile birleştirir |

### Sipariş API'leri (Orders)

| Endpoint | Method | Açıklama | Erişim | İşlev |
|----------|--------|----------|--------|-------|
| `/api/orders/create-from-cart` | POST | Sepetten sipariş oluştur | Private | Kullanıcının sepetindeki ürünlerden sipariş oluşturur |
| `/api/orders/create-guest` | POST | Misafir siparişi oluştur | Public | Giriş yapmamış kullanıcı için sipariş oluşturur |
| `/api/orders/:orderId/process-payment` | POST | Ödeme işlemi | Private | Sipariş için ödeme işlemini gerçekleştirir |
| `/api/orders/my-orders` | GET | Kullanıcının siparişleri | Private | Kullanıcının geçmiş siparişlerini listeler |
| `/api/orders/by-number/:orderNumber` | GET | Sipariş numarası ile sipariş | Public | Sipariş numarası ile sipariş detaylarını getirir |
| `/api/orders/:id` | GET | Sipariş detayı | Private | Belirli bir siparişin tüm detaylarını gösterir |
| `/api/orders` | POST | Yeni sipariş oluştur | Private | Manuel olarak yeni sipariş oluşturur |
| `/api/orders/admin/:id/status` | PUT | Admin sipariş durumu güncelle | Admin | Siparişin durumunu (hazırlanıyor, kargoda, teslim edildi) değiştirir |

### Admin API'leri (Admin)

| Endpoint | Method | Açıklama | Erişim | İşlev |
|----------|--------|----------|--------|-------|
| `/api/admin/dashboard` | GET | Admin dashboard | Admin | Admin panelinin ana sayfasını gösterir |
| `/api/admin/users` | GET | Tüm kullanıcıları listele | Admin | Sistemdeki tüm kullanıcı hesaplarını listeler |
| `/api/admin/dashboard/stats` | GET | Dashboard istatistikleri | Admin | Satış, kullanıcı, ürün gibi genel istatistikleri getirir |
| `/api/admin/reports` | GET | Gelişmiş raporlar | Admin | Detaylı satış ve performans raporlarını oluşturur |
| `/api/admin/bulk/category` | POST | Toplu kategori atama | Admin | Birden fazla ürünü aynı anda kategorilere atar |
| `/api/admin/bulk/price` | POST | Toplu fiyat güncelleme | Admin | Seçili ürünlerin fiyatlarını toplu olarak değiştirir |
| `/api/admin/notifications` | GET | Bildirimler | Admin | Sistem bildirimlerini ve uyarıları listeler |

### Değerlendirme API'leri (Reviews)

| Endpoint | Method | Açıklama | Erişim | İşlev |
|----------|--------|----------|--------|-------|
| `/api/reviews` | POST | Yeni değerlendirme oluştur | Private | Kullanıcı ürün için yeni değerlendirme yazar |
| `/api/reviews/my-reviews` | GET | Kullanıcının değerlendirmeleri | Private | Kullanıcının yazdığı tüm değerlendirmeleri listeler |
| `/api/reviews/check/:productId` | GET | Değerlendirme varlığını kontrol et | Private | Kullanıcının o ürün için değerlendirme yazıp yazmadığını kontrol eder |
| `/api/reviews/product/:productId` | GET | Ürün değerlendirmeleri | Public | Ürünün tüm onaylanmış değerlendirmelerini listeler |
| `/api/reviews/:id` | PUT | Değerlendirme güncelle | Private | Kullanıcı kendi değerlendirmesini düzenler |
| `/api/reviews/:id` | DELETE | Değerlendirme sil | Private | Kullanıcı kendi değerlendirmesini siler |
| `/api/reviews/pending` | GET | Bekleyen değerlendirmeler | Admin | Onay bekleyen değerlendirmeleri listeler |
| `/api/reviews/:id/approve` | PUT | Değerlendirme onayla | Admin | Değerlendirmeyi onaylar ve yayınlar |
| `/api/reviews/:id/reject` | PUT | Değerlendirme reddet | Admin | Değerlendirmeyi reddeder ve siler |

### Bülten API'leri (Newsletter)

| Endpoint | Method | Açıklama | Erişim | İşlev |
|----------|--------|----------|--------|-------|
| `/api/newsletter/subscribe` | POST | Bültene abone ol | Public | E-posta adresini bülten abone listesine ekler |
| `/api/newsletter/unsubscribe` | POST | Bülten aboneliğini iptal et | Public | E-posta adresini bülten abone listesinden çıkarır |
| `/api/newsletter/subscribers` | GET | Bülten aboneleri | Admin | Tüm bülten abonelerinin listesini gösterir |

### Öneri API'leri (Recommendations)

| Endpoint | Method | Açıklama | Erişim | İşlev |
|----------|--------|----------|--------|-------|
| `/api/recommendations/popular` | GET | Popüler ürünler | Public | En çok satılan ve görüntülenen ürünleri listeler |
| `/api/recommendations/similar/:productId` | GET | Benzer ürünler | Public | Belirli ürüne benzer ürünleri önerir |
| `/api/recommendations/frequently-bought/:productId` | GET | Sık birlikte alınan ürünler | Public | Ürünle birlikte sık alınan diğer ürünleri gösterir |
| `/api/recommendations/viewed-together/:productId` | GET | Birlikte görüntülenen ürünler | Public | Ürünle birlikte sık görüntülenen ürünleri listeler |
| `/api/recommendations/product/:productId` | GET | Ürün önerileri | Public | Belirli ürün için kişiselleştirilmiş öneriler sunar |
| `/api/recommendations/personalized/:userId` | GET | Kişiselleştirilmiş öneriler | Private | Kullanıcının geçmiş davranışlarına göre öneriler sunar |

### Sistem API'leri (System)

| Endpoint | Method | Açıklama | Erişim | İşlev |
|----------|--------|----------|--------|-------|
| `/health` | GET | Sistem sağlık kontrolü | Public | API'nin çalışır durumda olup olmadığını kontrol eder |

---

## Özellikler

### Müşteri Özellikleri
- **Kayıt ve Giriş:** E-posta doğrulama ile güvenli kayıt
- **Parola Sıfırlama:** E-posta ile güvenli parola sıfırlama
- **Ana Sayfa:** Hero slider, öne çıkan ürünler, kategoriler
- **Ürün Kataloğu:** Filtreleme, arama, sıralama
- **Ürün Detayları:** Galeri, varyantlar, yorumlar
- **Sepet Yönetimi:** Ürün ekleme, güncelleme, silme
- **Sipariş Sistemi:** Adres seçimi, ödeme simülasyonu
- **Profil Yönetimi:** Kişisel bilgiler, adres yönetimi
- **Favoriler:** Ürün favorileme sistemi
- **Son Görüntülenenler:** Kullanıcı aktivite takibi

### Yönetici Özellikleri
- **Dashboard:** Satış istatistikleri, grafikler
- **Ürün Yönetimi:** Ekleme, düzenleme, silme, stok kontrolü
- **Kategori Yönetimi:** Kategori CRUD işlemleri
- **Sipariş Yönetimi:** Sipariş durumu güncelleme
- **Kullanıcı Yönetimi:** Kullanıcı listesi ve detayları
- **Yorum Moderasyonu:** Yorum onaylama/reddetme

### Teknik Özellikler
- **Güvenlik:** JWT, bcrypt, rate limiting, CORS
- **Dosya Yükleme:** Resim optimizasyonu, boyut kontrolü
- **E-posta:** Otomatik e-posta gönderimi
- **Responsive:** Mobil uyumlu tasarım
- **SEO:** Meta etiketleri, sayfa optimizasyonu
- **Performance:** Lazy loading, resim optimizasyonu

---

## Proje Yapısı

```
case-study/
├── backend/
│   ├── src/
│   │   ├── Classes/
│   │   │   ├── Cart/           # Sepet işlemleri
│   │   │   ├── Categories/     # Kategori yönetimi
│   │   │   ├── Newsletter/     # Bülten aboneliği
│   │   │   ├── Order/          # Sipariş işlemleri
│   │   │   ├── Product/        # Ürün yönetimi
│   │   │   ├── Recommendation/ # Öneri sistemi
│   │   │   ├── Review/         # Yorum sistemi
│   │   │   └── User/           # Kullanıcı yönetimi
│   │   ├── config/             # Veritabanı, JWT konfigürasyonu
│   │   ├── controllers/        # Auth controller
│   │   ├── middleware/         # Auth, error handling, validation
│   │   ├── models/             # Mongoose modelleri
│   │   ├── routes/             # API route'ları
│   │   ├── utils/              # Yardımcı fonksiyonlar
│   │   └── server.ts           # Ana sunucu dosyası
│   ├── uploads/                # Yüklenen dosyalar
│   └── package.json
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (site)/             # Ana site sayfaları
│   │   ├── api/                # API route'ları
│   │   └── layout.tsx          # Ana layout
│   ├── components/             # React bileşenleri
│   │   ├── Auth/               # Kimlik doğrulama
│   │   ├── Cart/               # Sepet bileşenleri
│   │   ├── Checkout/           # Ödeme sayfası
│   │   ├── Common/             # Ortak bileşenler
│   │   ├── Header/             # Header bileşenleri
│   │   ├── Home/               # Ana sayfa bileşenleri
│   │   ├── MyAccount/          # Hesap yönetimi
│   │   ├── Orders/             # Sipariş bileşenleri
│   │   ├── ProductDetails/     # Ürün detay sayfası
│   │   ├── ProductListing/     # Ürün listesi
│   │   └── StockManagement/    # Stok yönetimi
│   ├── hooks/                  # Custom React hooks
│   ├── redux/                  # Redux store ve slice'lar
│   ├── services/               # API servisleri
│   ├── store/                  # Zustand store
│   ├── types/                  # TypeScript tip tanımları
│   └── utils/                  # Yardımcı fonksiyonlar
├── public/                     # Statik dosyalar
└── package.json
```

---

## Ortam Değişkenleri

### Ortam Yapılandırma Örnekleri

#### Development Ortamı
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce-dev
JWT_SECRET=dev-secret-key
EMAIL_USER=dev@example.com
```

#### Production Ortamı
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=production-super-secure-key
EMAIL_USER=prod@domain.com
```

### Backend (.env)
```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce-db
DB_NAME=ecommerce-db

# JWT
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret-key
JWT_REFRESH_EXPIRES_IN=30d

# Email (Hotmail/Outlook)
EMAIL_SERVICE=hotmail
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@hotmail.com
EMAIL_PASS=your-hotmail-password
EMAIL_FROM_NAME=E-Commerce
EMAIL_FROM_ADDRESS=your-email@hotmail.com

# File Upload
UPLOAD_PATH=uploads
MAX_FILE_SIZE=5242880
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp

# Security
BCRYPT_SALT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCK_DURATION=7200000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5

# Admin
ADMIN_EMAIL=admin@ecommerce.com
ADMIN_PASSWORD=Admin@123
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Yayınlama Talimatları

###  Sunucuya Sıfırdan Yükleme Rehberi

#### Adım 1: Sunucuya Bağlanma ve Temel Kurulumlar

**SSH ile Bağlanma:**
```bash
ssh kullanici_adiniz@sunucu_ip_adresiniz
# Örnek: ssh root@145.223.103.156
```

**Sistem Güncellemesi:**
```bash
sudo apt update && sudo apt upgrade -y
```

**Gerekli Yazılımları Yükleme:**
```bash
# Node.js ve npm
sudo apt install nodejs npm -y

# Git
sudo apt install git -y

# PM2 (Süreç Yöneticisi)
sudo npm install pm2@latest -g

# Nginx (Web Sunucusu)
sudo apt install nginx -y

# UFW (Güvenlik Duvarı)
sudo apt install ufw -y
sudo ufw enable
sudo ufw allow ssh
```

#### Adım 2: Proje Dosyalarını Sunucuya Klonlama

```bash
# Proje klasörü oluşturma
mkdir -p /root/pazarcik
cd /root/pazarcik

# GitHub deposunu klonlama
git clone https://github.com/Sisedes/PlayableFactoryCase.git
cd PlayableFactoryCase/

# Ana dala geçme
git checkout main
git pull origin main
```

#### Adım 3: Ortam Değişkenlerini Yapılandırma

**Backend .env Dosyası:**
```bash
cd backend/
nano .env
```

```env
# Server Configuration
NODE_ENV=production
PORT=5000
API_BASE_URL=http://localhost:5000
FRONTEND_URL=http://SUNUCU_IP:3000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://kaan4:A6yfv7e5pHHqDK5X@cluster0.sczghk2.mongodb.net/ecommerce-db?retryWrites=true&w=majority&appName=Cluster0
DB_NAME=ecommerce-db

# JWT Configuration
JWT_SECRET=ecommerce-jwt-secret-2024-case-study-ultra-secure
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=ecommerce-refresh-token-secret-2024
JWT_REFRESH_EXPIRES_IN=30d

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=kaan41tor@gmail.com
EMAIL_PASS=xtbkwvtrxvfjoqts
EMAIL_FROM_NAME=E-Commerce Mağazası
EMAIL_FROM_ADDRESS=kaan41tor@gmail.com

# File Upload
UPLOAD_PATH=uploads
MAX_FILE_SIZE=5242880
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp

# Security
BCRYPT_SALT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCK_DURATION=7200000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5

# Admin
ADMIN_EMAIL=admin@ecommerce.com
ADMIN_PASSWORD=Admin@123
```

**Frontend .env.local Dosyası:**
```bash
cd .
nano .env.local
```

```env
NEXT_PUBLIC_BACKEND_URL=http://SUNUCU_IP:5000
```

#### Adım 4: Bağımlılıkları Yükleme ve Derleme

```bash
# Backend
cd ../backend/
npm install
npm run build

# Frontend
cd ../frontend/
npm install
npm run build
```

#### Adım 5: PM2 ile Uygulamaları Başlatma

```bash
# Backend
cd ../backend/
pm2 start dist/server.js --name backend-app
pm2 save

# Frontend
cd ../frontend/
pm2 start npm --name frontend-app -- start
pm2 save

# PM2 otomatik başlatma
pm2 startup
```

#### Adım 6: Nginx Reverse Proxy Yapılandırması

**Nginx Konfigürasyon Dosyası:**
```bash
sudo nano /etc/nginx/sites-available/ecommerce_app
```

```nginx
server {
    listen 80;
    server_name SUNUCU_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Nginx'i Etkinleştirme:**
```bash
sudo ln -s /etc/nginx/sites-available/ecommerce_app /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo ufw allow 'Nginx HTTP'
sudo ufw reload
```

#### Adım 7: Test Etme

Tarayıcınızda `http://SUNUCU_IP` adresine giderek uygulamanızı test edin.

---

###  Production Ortam Değişkenleri

```env
# Production Backend
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=production-super-secure-jwt-secret
EMAIL_USER=production-email@domain.com
EMAIL_PASS=production-email-password

# Production Frontend
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

### Database Seed Verisi

Seed komutu ile aşağıdaki örnek veriler otomatik olarak eklenir:

- **Kullanıcılar:** Admin ve demo müşteri hesapları
- **Kategoriler:** Elektronik, Giyim, Ev & Yaşam, Spor
- **Ürünler:** Her kategoride örnek ürünler
- **Yorumlar:** Örnek ürün değerlendirmeleri

**Not:** Aşağıdaki seed kodu örnek amaçlıdır, son hali değildir.

```typescript
// backend/src/utils/seed.ts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Category, Product } from '../models';
import connectDB from '../config/database';

const categories = [
  {
    name: 'Elektronik',
    slug: 'elektronik',
    description: 'Bilgisayar, telefon, televizyon ve elektronik ürünler',
    image: '/uploads/categories/05030360-1752844571341-7gitqg.png',
    sortOrder: 1
  },
  {
    name: 'Giyim',
    slug: 'giyim',
    description: 'Kadın, erkek ve çocuk giyim ürünleri',
    image: '/uploads/categories/images-2-1752844527476-unm3q7.png',
    sortOrder: 2
  },
  {
    name: 'Ev ve Bahçe',
    slug: 'ev-ve-bahce',
    description: 'Ev dekorasyonu, mobilya ve bahçe ürünleri',
    image: '/uploads/categories/image-1-1752844490770-t7fg5f.png',
    sortOrder: 3
  },
  {
    name: 'Spor',
    slug: 'spor',
    description: 'Spor giyim, ekipman ve aksesuar ürünleri',
    image: '/uploads/categories/316064-0077773160644-1752844441481-mqk7mh.png',
    sortOrder: 4
  },
  {
    name: 'Kitaplar',
    slug: 'kitaplar',
    description: 'Roman, bilim, eğitim ve çocuk kitapları',
    image: '/uploads/categories/wilson-basket-topu-nba-drv-pro-s-1752844374926-bjdnt3.png',
    sortOrder: 5
  },
  {
    name: 'Sağlık ve Güzellik',
    slug: 'saglik-ve-guzellik',
    description: 'Kozmetik, kişisel bakım ve sağlık ürünleri',
    image: '/uploads/categories/104036098-medium-1752844335086-hvwzok.png',
    sortOrder: 6
  },
  {
    name: 'Oyuncaklar',
    slug: 'oyuncaklar',
    description: 'Çocuk oyuncakları ve eğitici ürünler',
    image: '/uploads/categories/istockphoto-483960103-612x612-1752844286364-0g3g69.jpg',
    sortOrder: 7
  },
  {
    name: 'Gıda',
    slug: 'gida',
    description: 'Taze gıda, atıştırmalık ve içecek ürünleri',
    image: '/uploads/categories/mlxw3tu-a-large-1752844253253-8rtoqd.jpg',
    sortOrder: 8
  }
];

const adminUser = {
  email: 'admin@ecommerce.com',
  password: 'Admin123!',
  role: 'admin',
  profile: {
    firstName: 'Admin',
    lastName: 'User'
  },
  authentication: {
    isEmailVerified: true
  }
};

const customerUser = {
  email: 'customer@example.com',
  password: 'Customer123!',
  role: 'customer',
  profile: {
    firstName: 'John',
    lastName: 'Doe',
    phone: '+90 555 123 45 67'
  },
  addresses: [{
    type: 'home',
    title: 'Ev Adresim',
    firstName: 'John',
    lastName: 'Doe',
    address1: 'Atatürk Caddesi No: 123',
    city: 'İstanbul',
    state: 'İstanbul',
    postalCode: '34000',
    country: 'Türkiye',
    phone: '+90 555 123 45 67',
    isDefault: true
  }],
  authentication: {
    isEmailVerified: true
  }
};

const generateSampleProducts = (categories: any[]) => {
  const products = [];
  
  // Elektronik ürünleri
  const elektronikCategory = categories.find(c => c.slug === 'elektronik');
  if (elektronikCategory) {
    products.push({
      name: 'Apple iPhone 15 Pro 128GB',
      slug: 'iphone-15-pro-128gb',
      description: 'En son teknoloji iPhone 15 Pro, 128GB depolama alanı ile. A17 Pro çip, 48MP kamera sistemi ve Titanium tasarım.',
      shortDescription: 'Apple iPhone 15 Pro - Premium smartphone deneyimi',
      category: elektronikCategory._id,
      price: 45999,
      currency: 'TRY',
      sku: 'IP15P-128-BLK',
      stock: 50,
      trackQuantity: true,
      lowStockThreshold: 5,
      images: [
        {
          url: '/uploads/products/iphone-15-pro-1.jpg',
          alt: 'iPhone 15 Pro - Ön Görünüm',
          isPrimary: true,
          sortOrder: 0
        },
        {
          url: '/uploads/products/iphone-15-pro-2.jpg',
          alt: 'iPhone 15 Pro - Arka Görünüm',
          isPrimary: false,
          sortOrder: 1
        },
        {
          url: '/uploads/products/iphone-15-pro-3.jpg',
          alt: 'iPhone 15 Pro - Yan Görünüm',
          isPrimary: false,
          sortOrder: 2
        },
        {
          url: '/uploads/products/iphone-15-pro-4.jpg',
          alt: 'iPhone 15 Pro - Kamera Detayı',
          isPrimary: false,
          sortOrder: 3
        }
      ],
      tags: ['apple', 'iphone', 'smartphone', 'premium'],
      status: 'active',
      isFeatured: true,
      averageRating: 4.8,
      reviewCount: 127
    });

    products.push({
      name: 'Samsung Galaxy S24 Ultra',
      slug: 'samsung-galaxy-s24-ultra',
      description: 'Samsung Galaxy S24 Ultra ile en iyi Android deneyimi. S Pen desteği, 200MP kamera ve AI özellikleri.',
      shortDescription: 'Samsung Galaxy S24 Ultra - En iyi Android telefon',
      category: elektronikCategory._id,
      price: 39999,
      salePrice: 35999,
      currency: 'TRY',
      sku: 'SGS24U-256-BLK',
      stock: 30,
      trackQuantity: true,
      lowStockThreshold: 3,
      images: [
        {
          url: '/uploads/products/samsung-s24-ultra-1.jpg',
          alt: 'Samsung Galaxy S24 Ultra - Ön Görünüm',
          isPrimary: true,
          sortOrder: 0
        },
        {
          url: '/uploads/products/samsung-s24-ultra-2.jpg',
          alt: 'Samsung Galaxy S24 Ultra - Arka Görünüm',
          isPrimary: false,
          sortOrder: 1
        },
        {
          url: '/uploads/products/samsung-s24-ultra-3.jpg',
          alt: 'Samsung Galaxy S24 Ultra - S Pen',
          isPrimary: false,
          sortOrder: 2
        }
      ],
      tags: ['samsung', 'galaxy', 'smartphone', 'android'],
      status: 'active',
      isFeatured: true,
      averageRating: 4.6,
      reviewCount: 89
    });

    products.push({
      name: 'MacBook Air M2 13"',
      slug: 'macbook-air-m2-13',
      description: 'Apple M2 çip ile güçlendirilmiş MacBook Air. Hafif tasarım, uzun pil ömrü ve güçlü performans.',
      shortDescription: 'MacBook Air M2 - Hafif ve güçlü laptop',
      category: elektronikCategory._id,
      price: 29999,
      currency: 'TRY',
      sku: 'MBA-M2-13-256',
      stock: 25,
      trackQuantity: true,
      lowStockThreshold: 2,
      images: [
        {
          url: '/uploads/products/macbook-air-m2-1.jpg',
          alt: 'MacBook Air M2 - Kapalı Görünüm',
          isPrimary: true,
          sortOrder: 0
        },
        {
          url: '/uploads/products/macbook-air-m2-2.jpg',
          alt: 'MacBook Air M2 - Açık Görünüm',
          isPrimary: false,
          sortOrder: 1
        },
        {
          url: '/uploads/products/macbook-air-m2-3.jpg',
          alt: 'MacBook Air M2 - Klavye Detayı',
          isPrimary: false,
          sortOrder: 2
        }
      ],
      tags: ['apple', 'macbook', 'laptop', 'm2'],
      status: 'active',
      isFeatured: false,
      averageRating: 4.9,
      reviewCount: 45
    });
  }

  // Giyim ürünleri
  const giyimCategory = categories.find(c => c.slug === 'giyim');
  if (giyimCategory) {
    products.push({
      name: 'Nike Air Max 270 Spor Ayakkabı',
      slug: 'nike-air-max-270',
      description: 'Rahat ve şık Nike Air Max 270 spor ayakkabı. Air Max teknolojisi ile maksimum konfor.',
      shortDescription: 'Nike Air Max 270 - Konfor ve stil bir arada',
      category: giyimCategory._id,
      price: 2999,
      salePrice: 2499,
      currency: 'TRY',
      sku: 'NIKE-AM270-42',
      stock: 30,
      trackQuantity: true,
      lowStockThreshold: 3,
      images: [
        {
          url: '/uploads/products/nike-air-max-270-1.jpg',
          alt: 'Nike Air Max 270 - Yan Görünüm',
          isPrimary: true,
          sortOrder: 0
        },
        {
          url: '/uploads/products/nike-air-max-270-2.jpg',
          alt: 'Nike Air Max 270 - Üst Görünüm',
          isPrimary: false,
          sortOrder: 1
        },
        {
          url: '/uploads/products/nike-air-max-270-3.jpg',
          alt: 'Nike Air Max 270 - Alt Görünüm',
          isPrimary: false,
          sortOrder: 2
        },
        {
          url: '/uploads/products/nike-air-max-270-4.jpg',
          alt: 'Nike Air Max 270 - Detay',
          isPrimary: false,
          sortOrder: 3
        }
      ],
      tags: ['nike', 'spor', 'ayakkabı', 'air max'],
      status: 'active',
      isFeatured: true,
      averageRating: 4.7,
      reviewCount: 156
    });

    products.push({
      name: 'Adidas Ultraboost 22',
      slug: 'adidas-ultraboost-22',
      description: 'Adidas Ultraboost 22 ile maksimum performans. Boost teknolojisi ve Primeknit üst yüzey.',
      shortDescription: 'Adidas Ultraboost 22 - Performans ayakkabısı',
      category: giyimCategory._id,
      price: 3499,
      currency: 'TRY',
      sku: 'ADIDAS-UB22-43',
      stock: 20,
      trackQuantity: true,
      lowStockThreshold: 2,
      images: [
        {
          url: '/uploads/products/adidas-ultraboost-22-1.jpg',
          alt: 'Adidas Ultraboost 22 - Yan Görünüm',
          isPrimary: true,
          sortOrder: 0
        },
        {
          url: '/uploads/products/adidas-ultraboost-22-2.jpg',
          alt: 'Adidas Ultraboost 22 - Üst Görünüm',
          isPrimary: false,
          sortOrder: 1
        },
        {
          url: '/uploads/products/adidas-ultraboost-22-3.jpg',
          alt: 'Adidas Ultraboost 22 - Boost Teknolojisi',
          isPrimary: false,
          sortOrder: 2
        }
      ],
      tags: ['adidas', 'spor', 'ayakkabı', 'ultraboost'],
      status: 'active',
      isFeatured: false,
      averageRating: 4.5,
      reviewCount: 78
    });
  }

  // Spor ürünleri
  const sporCategory = categories.find(c => c.slug === 'spor');
  if (sporCategory) {
    products.push({
      name: 'Fitness Eldiveni',
      slug: 'fitness-eldiveni',
      description: 'Profesyonel fitness eldiveni. Ter emici kumaş ve kaymaz taban.',
      shortDescription: 'Fitness Eldiveni - Profesyonel kalite',
      category: sporCategory._id,
      price: 199,
      currency: 'TRY',
      sku: 'FIT-GLOVE-L',
      stock: 100,
      trackQuantity: true,
      lowStockThreshold: 10,
      images: [
        {
          url: '/uploads/products/fitness-eldiveni-1.jpg',
          alt: 'Fitness Eldiveni - Ön Görünüm',
          isPrimary: true,
          sortOrder: 0
        },
        {
          url: '/uploads/products/fitness-eldiveni-2.jpg',
          alt: 'Fitness Eldiveni - Arka Görünüm',
          isPrimary: false,
          sortOrder: 1
        }
      ],
      tags: ['fitness', 'eldiven', 'spor', 'egzersiz'],
      status: 'active',
      isFeatured: false,
      averageRating: 4.2,
      reviewCount: 34
    });
  }

  // Ev ve Bahçe ürünleri
  const evBahceCategory = categories.find(c => c.slug === 'ev-ve-bahce');
  if (evBahceCategory) {
    products.push({
      name: 'Akıllı LED Ampul',
      slug: 'akilli-led-ampul',
      description: 'WiFi bağlantılı akıllı LED ampul. Uzaktan kontrol, renk değiştirme ve zamanlayıcı özellikleri.',
      shortDescription: 'Akıllı LED Ampul - Uzaktan kontrol',
      category: evBahceCategory._id,
      price: 299,
      currency: 'TRY',
      sku: 'LED-SMART-WIFI',
      stock: 75,
      trackQuantity: true,
      lowStockThreshold: 5,
      images: [
        {
          url: '/uploads/products/akilli-led-ampul-1.jpg',
          alt: 'Akıllı LED Ampul - Yanık',
          isPrimary: true,
          sortOrder: 0
        },
        {
          url: '/uploads/products/akilli-led-ampul-2.jpg',
          alt: 'Akıllı LED Ampul - Sönük',
          isPrimary: false,
          sortOrder: 1
        },
        {
          url: '/uploads/products/akilli-led-ampul-3.jpg',
          alt: 'Akıllı LED Ampul - Uygulama',
          isPrimary: false,
          sortOrder: 2
        }
      ],
      tags: ['led', 'akıllı', 'ampul', 'wifi'],
      status: 'active',
      isFeatured: false,
      averageRating: 4.3,
      reviewCount: 67
    });
  }

  return products;
};

const seedDatabase = async () => {
  try {
    console.log('Veritabanı seed işlemi başlatılıyor...');
    await connectDB();
    console.log('Mevcut veriler temizleniyor...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Kategoriler oluşturuluyor...');
    const createdCategories = await Category.insertMany(categories);
    console.log(`${createdCategories.length} kategori oluşturuldu`);
    console.log('Admin kullanıcı oluşturuluyor...');
    const admin = new User(adminUser);
    await admin.save();
    console.log('Admin kullanıcı oluşturuldu:', admin.email);
    console.log('Müşteri kullanıcı oluşturuluyor...');
    const customer = new User(customerUser);
    await customer.save();
    console.log('Müşteri kullanıcı oluşturuldu:', customer.email);
    console.log('Örnek ürünler oluşturuluyor...');
    const sampleProducts = generateSampleProducts(createdCategories);
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`${createdProducts.length} ürün oluşturuldu`);
    console.log('Seed işlemi tamamlandı!');
    console.log('Oluşturulan veriler:');
    console.log(`- ${createdCategories.length} kategori`);
    console.log(`- 2 kullanıcı (1 admin, 1 müşteri)`);
    console.log(`- ${createdProducts.length} ürün`);
    console.log('Giriş bilgileri:');
    console.log('Admin: admin@ecommerce.com / Admin123!');
    console.log('Müşteri: customer@example.com / Customer123!');
    process.exit(0);
  } catch (error) {
    console.error('Seed işlemi başarısız:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

export default seedDatabase;
```

---


## Case Study Hedefleri

Bu proje aşağıdaki konularda deneyim göstermek için hazırlanmıştır:

- **Full-Stack Development:** Next.js + Node.js + MongoDB
- **Modern Web Teknolojileri:** TypeScript, Tailwind CSS, Redux
- **API Design:** RESTful API, JWT authentication
- **Database Design:** MongoDB schema design, relationships
- **Security:** Input validation, rate limiting, secure authentication
- **User Experience:** Responsive design, intuitive interfaces
- **Code Quality:** Clean code, TypeScript, proper error handling
- **Performance:** Image optimization, lazy loading, caching

---

[Başa Dön](#top) 