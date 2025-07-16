import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Category, Product } from '../models';
import connectDB from '../config/database';

// 8 Ana Kategori
const categories = [
  {
    name: 'Elektronik',
    slug: 'elektronik',
    description: 'Bilgisayar, telefon, televizyon ve elektronik ürünler',
    sortOrder: 1
  },
  {
    name: 'Giyim',
    slug: 'giyim',
    description: 'Kadın, erkek ve çocuk giyim ürünleri',
    sortOrder: 2
  },
  {
    name: 'Ev ve Bahçe',
    slug: 'ev-ve-bahce',
    description: 'Ev dekorasyonu, mobilya ve bahçe ürünleri',
    sortOrder: 3
  },
  {
    name: 'Spor',
    slug: 'spor',
    description: 'Spor giyim, ekipman ve aksesuar ürünleri',
    sortOrder: 4
  },
  {
    name: 'Kitaplar',
    slug: 'kitaplar',
    description: 'Roman, bilim, eğitim ve çocuk kitapları',
    sortOrder: 5
  },
  {
    name: 'Sağlık ve Güzellik',
    slug: 'saglik-ve-guzellik',
    description: 'Kozmetik, kişisel bakım ve sağlık ürünleri',
    sortOrder: 6
  },
  {
    name: 'Oyuncaklar',
    slug: 'oyuncaklar',
    description: 'Çocuk oyuncakları ve eğitici ürünler',
    sortOrder: 7
  },
  {
    name: 'Gıda',
    slug: 'gida',
    description: 'Taze gıda, atıştırmalık ve içecek ürünleri',
    sortOrder: 8
  }
];

// Admin kullanıcı
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

// Örnek müşteri
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

// Örnek ürünler (her kategoriden birer tane)
const generateSampleProducts = (categories: any[]) => {
  const products = [];
  
  // Elektronik
  products.push({
    name: 'Apple iPhone 15 Pro 128GB',
    slug: 'iphone-15-pro-128gb',
    description: 'En son teknoloji iPhone 15 Pro, 128GB depolama alanı ile.',
    shortDescription: 'Apple iPhone 15 Pro - Premium smartphone deneyimi',
    category: null, 
    price: 45999,
    currency: 'TRY',
    sku: 'IP15P-128-BLK',
    stock: 50,
    trackQuantity: true,
    lowStockThreshold: 5,
    images: [{
      url: '/uploads/iphone-15-pro.jpg',
      alt: 'iPhone 15 Pro',
      isPrimary: true,
      sortOrder: 0
    }],
    variants: [{
      name: 'Renk - Siyah',
      options: [{ name: 'color', value: 'Siyah' }],
      sku: 'IP15P-128-BLK',
      stock: 50,
      isDefault: true
    }],
    tags: ['apple', 'iphone', 'smartphone', 'premium'],
    status: 'active',
    isFeatured: true
  });

  products.push({
    name: 'Nike Air Max 270 Spor Ayakkabı',
    slug: 'nike-air-max-270',
    description: 'Rahat ve şık Nike Air Max 270 spor ayakkabı.',
    shortDescription: 'Nike Air Max 270 - Konfor ve stil bir arada',
    category: null,
    price: 2999,
    salePrice: 2499,
    currency: 'TRY',
    sku: 'NIKE-AM270-42',
    stock: 30,
    trackQuantity: true,
    lowStockThreshold: 3,
    images: [{
      url: '/uploads/nike-air-max-270.jpg',
      alt: 'Nike Air Max 270',
      isPrimary: true,
      sortOrder: 0
    }],
    variants: [
      {
        name: 'Numara - 42',
        options: [{ name: 'size', value: '42' }],
        sku: 'NIKE-AM270-42',
        stock: 10,
        isDefault: true
      },
      {
        name: 'Numara - 43',
        options: [{ name: 'size', value: '43' }],
        sku: 'NIKE-AM270-43',
        stock: 10,
        isDefault: false
      }
    ],
    tags: ['nike', 'spor', 'ayakkabı', 'air max'],
    status: 'active',
    isFeatured: true
  });

  return products;
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Veritabanı seed işlemi başlatılıyor...');
    
    await connectDB();
    
    console.log('🗑️ Mevcut veriler temizleniyor...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    
    console.log('📂 Kategoriler oluşturuluyor...');
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ ${createdCategories.length} kategori oluşturuldu`);
    
    console.log('👨‍💼 Admin kullanıcı oluşturuluyor...');
    const admin = new User(adminUser);
    await admin.save();
    console.log('✅ Admin kullanıcı oluşturuldu:', admin.email);
    
    console.log('👤 Müşteri kullanıcı oluşturuluyor...');
    const customer = new User(customerUser);
    await customer.save();
    console.log('✅ Müşteri kullanıcı oluşturuldu:', customer.email);
    
    console.log('📦 Örnek ürünler oluşturuluyor...');
    const sampleProducts = generateSampleProducts(createdCategories);
    
    const elektronikCategory = createdCategories.find(c => c.slug === 'elektronik');
    const giyimCategory = createdCategories.find(c => c.slug === 'giyim');
    
    if (elektronikCategory && giyimCategory) {
      (sampleProducts[0] as any).category = elektronikCategory._id;
      (sampleProducts[1] as any).category = giyimCategory._id;
    } else {
      throw new Error('Elektronik veya Giyim kategorisi bulunamadı!');
    }
    
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`✅ ${createdProducts.length} ürün oluşturuldu`);
    
    console.log('\n🎉 Seed işlemi tamamlandı!');
    console.log('\n📊 Oluşturulan veriler:');
    console.log(`- ${createdCategories.length} kategori`);
    console.log(`- 2 kullanıcı (1 admin, 1 müşteri)`);
    console.log(`- ${createdProducts.length} ürün`);
    
    console.log('\n🔐 Giriş bilgileri:');
    console.log('Admin: admin@ecommerce.com / Admin123!');
    console.log('Müşteri: customer@example.com / Customer123!');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Seed işlemi başarısız:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

export default seedDatabase; 