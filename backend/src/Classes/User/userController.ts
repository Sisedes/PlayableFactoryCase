import { Request, Response } from 'express';
import User from './userModel';
import { IAddress } from '../../types';
import mongoose from 'mongoose';

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