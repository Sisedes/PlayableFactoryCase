const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce-db');

// Model şemalarını doğrudan tanımlayalım
const userSchema = new mongoose.Schema({
  email: String,
  profile: {
    firstName: String,
    lastName: String,
    phone: String
  }
}, { collection: 'users' });

const orderSchema = new mongoose.Schema({
  orderNumber: String,
  user: mongoose.Schema.Types.ObjectId,
  customerInfo: {
    customerId: mongoose.Schema.Types.ObjectId,
    email: String,
    phone: String,
    firstName: String,
    lastName: String
  },
  items: Array,
  pricing: Object,
  addresses: Object,
  payment: Object,
  fulfillment: Object,
  notes: String
}, { collection: 'orders' });

const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', orderSchema);

async function fixOrders() {
  try {
    console.log('Sipariş düzeltme işlemi başlatılıyor...');
    
    // Kullanıcıyı e-posta ile bul
    const user = await User.findOne({ email: 'kaan44tor@gmail.com' });
    
    if (!user) {
      console.log('Kullanıcı bulunamadı: kaan44tor@gmail.com');
      return;
    }
    
    console.log(`Kullanıcı bulundu: ${user._id} (${user.profile.firstName} ${user.profile.lastName})`);
    
    // user alanı olmayan siparişleri bul
    const ordersWithoutUser = await Order.find({ 
      user: { $exists: false },
      'customerInfo.email': 'kaan44tor@gmail.com'
    });
    
    console.log(`${ordersWithoutUser.length} adet user alanı olmayan sipariş bulundu`);
    
    if (ordersWithoutUser.length === 0) {
      console.log('Düzeltilecek sipariş bulunamadı');
      return;
    }
    
    // Siparişleri güncelle
    const updatePromises = ordersWithoutUser.map(order => {
      return Order.findByIdAndUpdate(order._id, {
        $set: {
          user: user._id,
          'customerInfo.customerId': user._id
        }
      });
    });
    
    await Promise.all(updatePromises);
    
    console.log(`${ordersWithoutUser.length} adet sipariş başarıyla güncellendi`);
    
    // Güncellenmiş siparişleri kontrol et
    const updatedOrders = await Order.find({ 
      user: user._id,
      'customerInfo.email': 'kaan44tor@gmail.com'
    });
    
    console.log(`Toplam ${updatedOrders.length} adet sipariş artık kullanıcıya ait`);
    
    // Sipariş detaylarını göster
    updatedOrders.forEach((order, index) => {
      console.log(`\nSipariş ${index + 1}:`);
      console.log(`- ID: ${order._id}`);
      console.log(`- Sipariş No: ${order.orderNumber}`);
      console.log(`- Tarih: ${order.createdAt}`);
      console.log(`- Toplam: ${order.pricing.total}₺`);
      console.log(`- Durum: ${order.fulfillment.status}`);
      console.log(`- User ID: ${order.user}`);
    });
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    mongoose.connection.close();
    console.log('Veritabanı bağlantısı kapatıldı');
  }
}

fixOrders(); 