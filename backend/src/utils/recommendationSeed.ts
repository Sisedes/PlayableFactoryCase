import mongoose from 'mongoose';
import UserActivity from '../Classes/UserActivity/userActivityModel';
import Product from '../Classes/Product/productModel';
import Recommendation from '../Classes/Recommendation/recommendationModel';
import { Types } from 'mongoose';

const seedRecommendations = async () => {
  try {
    console.log('🌱 Recommendation seed başlatılıyor...');

    // Aktif ürünleri al
    const products = await Product.find({ status: 'active' }).limit(20);
    
    if (products.length === 0) {
      console.log('❌ Aktif ürün bulunamadı');
      return;
    }

    console.log(`📦 ${products.length} ürün bulundu`);

    // UserActivity verilerini oluştur
    const userActivities = [];
    const now = new Date();
    
    for (let i = 0; i < 100; i++) {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const randomDaysAgo = Math.floor(Math.random() * 7);
      const randomHoursAgo = Math.floor(Math.random() * 24);
      
      userActivities.push({
        user: new Types.ObjectId(), // Random user ID
        sessionId: `session_${Math.random().toString(36).substr(2, 9)}`,
        type: 'view',
        product: randomProduct._id,
        category: randomProduct.category,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: new Date(now.getTime() - (randomDaysAgo * 24 * 60 * 60 * 1000) - (randomHoursAgo * 60 * 60 * 1000))
      });
    }

    
    await UserActivity.insertMany(userActivities);
    console.log(`${userActivities.length} UserActivity kaydı oluşturuldu`);

    // Popüler ürünleri hesapla
    const RecommendationService = require('../Classes/Recommendation/recommendationService').RecommendationService;
    await RecommendationService.calculatePopularProducts(8);
    console.log(' Popüler ürünler hesaplandı');

    // Sonuçları kontrol et
    const popularRecommendation = await Recommendation.findOne({ type: 'popular' });
    if (popularRecommendation) {
      console.log(`Popüler ürün önerisi oluşturuldu: ${popularRecommendation.recommendedProducts.length} ürün`);
    } else {
      console.log('Popüler ürün önerisi oluşturulamadı');
    }

    console.log(' Recommendation seed tamamlandı!');
  } catch (error) {
    console.error('Recommendation seed hatası:', error);
  }
};

// Script'i çalıştır
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce-db')
    .then(() => {
      console.log('📡 MongoDB bağlantısı başarılı');
      return seedRecommendations();
    })
    .then(() => {
      console.log('Seed işlemi tamamlandı');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed işlemi hatası:', error);
      process.exit(1);
    });
}

export default seedRecommendations; 