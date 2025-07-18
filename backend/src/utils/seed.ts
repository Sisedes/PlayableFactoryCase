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
