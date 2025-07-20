<a name="top"></a>

# Pazarcık - E-Ticaret Case Study

[![Next.js](https://img.shields.io/badge/Next.js-15.2.3-000?logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.3.3-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2.6.1-764ABC?logo=redux)](https://redux-toolkit.js.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.17.0-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18.2-000?logo=express)](https://expressjs.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-FFB300?logo=jsonwebtokens)](https://jwt.io/)
[![License](https://img.shields.io/badge/license-MIT-green)](#-license)

⭐ Bu projeyi beğendiyseniz GitHub'da yıldızlamayı unutmayın!

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

### Backend Deployment (Vercel/Netlify Functions)

1. **Vercel ile Deployment:**
```bash
# Vercel CLI kurulumu
npm i -g vercel

# Proje dizininde
cd backend
vercel

# Ortam değişkenlerini ayarlayın
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add EMAIL_USER
vercel env add EMAIL_PASS
```

2. **Railway ile Deployment:**
```bash
# Railway CLI kurulumu
npm i -g @railway/cli

# Proje bağlantısı
railway login
railway init
railway up
```

### Frontend Deployment (Vercel)

1. **Vercel ile Deployment:**
```bash
# Proje kök dizininde
vercel

# Ortam değişkenlerini ayarlayın
vercel env add NEXT_PUBLIC_API_URL
```

2. **Netlify ile Deployment:**
```bash
# Build komutları
npm run build
npm run export

# Netlify'da deploy edin
```

### Production Ortam Değişkenleri

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

---

## Katkı ve Geri Bildirim

Bu proje bir case study olarak hazırlanmıştır. Geri bildirimleriniz için:

- **Issue açın** - Hata bildirimi veya öneriler için
- **Pull request gönderin** - İyileştirmeler için
- **Yıldızlayın** - Projeyi desteklemek için

---

## Lisans

Bu proje MIT lisansı ile sunulmuştur.

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

> Başarılı ve keyifli projeler dileriz!