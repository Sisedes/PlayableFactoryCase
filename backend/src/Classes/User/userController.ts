import { Request, Response } from 'express';
import User from './userModel';
import { IAddress } from '../../types';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendNotificationEmail } from '../../utils/emailService';
import Order from '../Order/orderModel';

/**
 * @desc    
 * @route   put /api/users/profile
 * @access  
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { firstName, lastName, phone } = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
      return;
    }

    if (firstName) user.profile.firstName = firstName;
    if (lastName) user.profile.lastName = lastName;
    if (phone) user.profile.phone = phone;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profil başarıyla güncellendi',
      data: {
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Profil güncellenirken hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   post /api/users/send-password-reset-code
 * @access  
 */
export const sendPasswordResetCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { email } = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
      return;
    }

    if (user.email !== email) {
      res.status(400).json({
        success: false,
        message: 'Girdiğiniz e-posta adresi hesabınızla eşleşmiyor'
      });
      return;
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 dakika

    user.authentication.passwordResetToken = resetCode;
    user.authentication.passwordResetExpires = resetCodeExpires;
    await user.save();

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Parola Sıfırlama Kodu</h2>
        <p>Merhaba ${user.profile.firstName},</p>
        <p>Parola sıfırlama talebiniz için gerekli kod aşağıdadır:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${resetCode}</h1>
        </div>
        <p><strong>Bu kod 10 dakika geçerlidir.</strong></p>
        <p>Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
        <p>Güvenliğiniz için kodunuzu kimseyle paylaşmayın.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">Bu e-posta otomatik olarak gönderilmiştir.</p>
      </div>
    `;

    await sendNotificationEmail(
      user.email,
      'Parola Sıfırlama Kodu',
      emailContent
    );

    res.status(200).json({
      success: true,
      message: 'Parola sıfırlama kodu e-posta adresinize gönderildi'
    });
  } catch (error) {
    console.error('Send password reset code error:', error);
    res.status(500).json({
      success: false,
      message: 'Kod gönderilirken hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   post /api/users/reset-password-with-code
 * @access  
 */
export const resetPasswordWithCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { code, newPassword } = req.body;

    const user = await User.findById(userId).select('+authentication.passwordResetToken +authentication.passwordResetExpires');
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
      return;
    }

    if (!user.authentication.passwordResetToken || user.authentication.passwordResetToken !== code) {
      res.status(400).json({
        success: false,
        message: 'Geçersiz kod'
      });
      return;
    }

    if (!user.authentication.passwordResetExpires || user.authentication.passwordResetExpires < new Date()) {
      res.status(400).json({
        success: false,
        message: 'Kod süresi dolmuş'
      });
      return;
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);

    user.authentication.passwordResetToken = null;
    user.authentication.passwordResetExpires = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Parola başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Reset password with code error:', error);
    res.status(500).json({
      success: false,
      message: 'Parola güncellenirken hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   get /api/users/addresses
 * @access  
 */
export const getUserAddresses = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    
    const user = await User.findById(userId).select('addresses');
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user.addresses
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Adresler getirilemedi'
    });
  }
};

/**
 * @desc    
 * @route   post /api/users/addresses
 * @access  
 */
export const addAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const addressData: IAddress = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
      return;
    }

    if (addressData.isDefault) {
      user.addresses.forEach((address: any) => {
        address.isDefault = false;
      });
    }

    user.addresses.push(addressData);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Adres başarıyla eklendi',
      data: user.addresses[user.addresses.length - 1]
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({
      success: false,
      message: 'Adres eklenirken hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   put /api/users/addresses/:addressId
 * @access  
 */
export const updateAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { addressId } = req.params;
    const addressData: Partial<IAddress> = req.body;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      res.status(400).json({
        success: false,
        message: 'Geçersiz adres ID'
      });
      return;
    }

    const user = await User.findById(userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
      return;
    }

    const addressIndex = user.addresses.findIndex(
      (address: any) => address._id.toString() === addressId
    );

    if (addressIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Adres bulunamadı'
      });
      return;
    }

    if (addressData.isDefault) {
      user.addresses.forEach((address: any, index: number) => {
        if (index !== addressIndex) {
          address.isDefault = false;
        }
      });
    }

    Object.assign(user.addresses[addressIndex], addressData);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Adres başarıyla güncellendi',
      data: user.addresses[addressIndex]
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Adres güncellenirken hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   delete /api/users/addresses/:addressId
 * @access  
 */
export const deleteAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { addressId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      res.status(400).json({
        success: false,
        message: 'Geçersiz adres ID'
      });
      return;
    }

    const user = await User.findById(userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
      return;
    }

    const addressIndex = user.addresses.findIndex(
      (address: any) => address._id.toString() === addressId
    );

    if (addressIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Adres bulunamadı'
      });
      return;
    }

    user.addresses.splice(addressIndex, 1);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Adres başarıyla silindi'
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Adres silinirken hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   put /api/users/addresses/:addressId/default
 * @access  
 */
export const setDefaultAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { addressId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      res.status(400).json({
        success: false,
        message: 'Geçersiz adres ID'
      });
      return;
    }

    const user = await User.findById(userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
      return;
    }

    const addressIndex = user.addresses.findIndex(
      (address: any) => address._id.toString() === addressId
    );

    if (addressIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Adres bulunamadı'
      });
      return;
    }

    user.addresses.forEach((address: any) => {
      address.isDefault = false;
    });

    user.addresses[addressIndex].isDefault = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Varsayılan adres güncellendi',
      data: user.addresses[addressIndex]
    });
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({
      success: false,
      message: 'Varsayılan adres güncellenirken hata oluştu'
    });
  }
}; 

/**
 * @desc    
 * @route   get /api/users/favorites
 * @access  
 */
export const getFavoriteProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    
    const user = await User.findById(userId)
      .populate({
        path: 'preferences.favoriteProducts',
        select: 'name slug description price salePrice images category averageRating reviewCount',
        populate: {
          path: 'category',
          select: 'name slug'
        }
      });
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user.preferences.favoriteProducts || []
    });
  } catch (error) {
    console.error('Get favorite products error:', error);
    res.status(500).json({
      success: false,
      message: 'Favori ürünler getirilemedi'
    });
  }
};

/**
 * @desc    
 * @route   post /api/users/favorites
 * @access  
 */
export const addToFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { productId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({
        success: false,
        message: 'Geçersiz ürün ID'
      });
      return;
    }

    const user = await User.findById(userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
      return;
    }

    if (user.preferences.favoriteProducts.includes(new mongoose.Types.ObjectId(productId))) {
      res.status(400).json({
        success: false,
        message: 'Bu ürün zaten favorilerinizde'
      });
      return;
    }

    user.preferences.favoriteProducts.push(new mongoose.Types.ObjectId(productId));
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Ürün favorilere eklendi'
    });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Ürün favorilere eklenirken hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   delete /api/users/favorites/:productId
 * @access  
 */
export const removeFromFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({
        success: false,
        message: 'Geçersiz ürün ID'
      });
      return;
    }

    const user = await User.findById(userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
      return;
    }

    const productIndex = user.preferences.favoriteProducts.findIndex(
      (id: any) => id.toString() === productId
    );
    if (productIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Ürün favorilerinizde bulunamadı'
      });
      return;
    }

    user.preferences.favoriteProducts.splice(productIndex, 1);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Ürün favorilerden çıkarıldı'
    });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Ürün favorilerden çıkarılırken hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   get /api/users/favorites/:productId/check
 * @access  
 */
export const checkFavoriteStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({
        success: false,
        message: 'Geçersiz ürün ID'
      });
      return;
    }

    const user = await User.findById(userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
      return;
    }

    const isFavorite = user.preferences.favoriteProducts.some(
      (id: any) => id.toString() === productId
    );

    res.status(200).json({
      success: true,
      data: {
        isFavorite
      }
    });
  } catch (error) {
    console.error('Check favorite status error:', error);
    res.status(500).json({
      success: false,
      message: 'Favori durumu kontrol edilemedi'
    });
  }
}; 

// Admin: Tüm müşterileri getir (sayfalama ile)
export const getAllCustomersForAdmin = async (req: Request, res: Response) => {
  try {
    console.log('getAllCustomersForAdmin çağrıldı');
    console.log('Query parametreleri:', req.query);
    
    const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    console.log('Hesaplanan değerler:', { pageNum, limitNum, skip });

    // Arama filtresi
    const searchFilter = search ? {
      $or: [
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'profile.phone': { $regex: search, $options: 'i' } }
      ]
    } : {};

    console.log('Arama filtresi:', searchFilter);

    // Sıralama
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    console.log('Sıralama:', sort);

    const customers = await User.find({ 
      role: 'customer',
      ...searchFilter 
    })
    .select('profile.firstName profile.lastName email profile.phone isActive authentication.isEmailVerified createdAt')
    .sort(sort)
    .skip(skip)
    .limit(limitNum);

    console.log('Bulunan müşteri sayısı:', customers.length);

    const totalCustomers = await User.countDocuments({ 
      role: 'customer',
      ...searchFilter 
    });

    console.log('Toplam müşteri sayısı:', totalCustomers);

    // Her müşteri için sipariş sayısını hesapla
    const customersWithOrderCount = await Promise.all(
      customers.map(async (customer) => {
        const orderCount = await Order.countDocuments({ 
          'customerInfo.customerId': customer._id 
        });
        
        return {
          _id: customer._id,
          firstName: customer.profile.firstName,
          lastName: customer.profile.lastName,
          email: customer.email,
          phone: customer.profile.phone,
          isActive: customer.isActive,
          authentication: customer.authentication,
          createdAt: customer.createdAt,
          orderCount
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        data: customersWithOrderCount,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCustomers / limitNum),
          totalCustomers,
          hasNextPage: pageNum < Math.ceil(totalCustomers / limitNum),
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Müşteriler getirilirken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// Admin: Müşteri detaylarını getir
export const getCustomerDetails = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;

    const customer = await User.findById(customerId)
      .select('-password')
      .populate('addresses');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Müşteri bulunamadı'
      });
    }

    // Müşteri verilerini düzenle
    const customerData = {
      _id: customer._id,
      firstName: customer.profile.firstName,
      lastName: customer.profile.lastName,
      email: customer.email,
      phone: customer.profile.phone,
      isActive: customer.isActive,
      authentication: customer.authentication,
      addresses: customer.addresses,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt
    };

    // Müşterinin siparişlerini getir
    const orders = await Order.find({ 
      'customerInfo.customerId': customerId 
    })
    .select('orderNumber createdAt pricing.total fulfillment.status')
    .sort({ createdAt: -1 })
    .limit(10);

    // İstatistikler
    const totalOrders = await Order.countDocuments({ 
      'customerInfo.customerId': customer._id 
    });
    
    const totalSpent = await Order.aggregate([
      { $match: { 'customerInfo.customerId': customer._id } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);

    const orderStatusStats = await Order.aggregate([
      { $match: { 'customerInfo.customerId': customer._id } },
      { $group: { _id: '$fulfillment.status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        customer: customerData,
        orders,
        stats: {
          totalOrders,
          totalSpent: totalSpent[0]?.total || 0,
          orderStatusStats
        }
      }
    });
  } catch (error) {
    console.error('Get customer details error:', error);
    res.status(500).json({
      success: false,
      message: 'Müşteri detayları getirilirken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// Admin: Müşteri durumunu değiştir (aktif/pasif)
export const updateCustomerStatus = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const { isActive } = req.body;

    const customer = await User.findByIdAndUpdate(
      customerId,
      { isActive },
      { new: true }
    ).select('-password');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Müşteri bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      message: `Müşteri ${isActive ? 'aktif' : 'pasif'} yapıldı`,
      data: customer
    });
  } catch (error) {
    console.error('Update customer status error:', error);
    res.status(500).json({
      success: false,
      message: 'Müşteri durumu güncellenirken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
}; 