import express from 'express';
import {
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from './userController';
import { authenticateToken } from '../../middleware/authMiddleware';
import { validateAddress, handleValidationErrors } from '../../middleware/validationMiddleware';

const router = express.Router();

// Profil rotaları (gelecekte kullanılabilir)
router.get('/profile', authenticateToken, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'User routes working - Profile endpoint',
  });
});

router.put('/profile', authenticateToken, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'User routes working - Update profile endpoint',
  });
});

// Adres yönetimi rotaları
/**
 * @route   GET /api/users/addresses
 * @desc    Kullanıcının adreslerini getir
 * @access  Private
 */
router.get('/addresses', authenticateToken, getUserAddresses);

/**
 * @route   POST /api/users/addresses
 * @desc    Yeni adres ekle
 * @access  Private
 */
router.post('/addresses', 
  authenticateToken,
  validateAddress,
  handleValidationErrors,
  addAddress
);

/**
 * @route   PUT /api/users/addresses/:addressId
 * @desc    Adresi güncelle
 * @access  Private
 */
router.put('/addresses/:addressId',
  authenticateToken,
  validateAddress,
  handleValidationErrors,
  updateAddress
);

/**
 * @route   DELETE /api/users/addresses/:addressId
 * @desc    Adresi sil
 * @access  Private
 */
router.delete('/addresses/:addressId', authenticateToken, deleteAddress);

/**
 * @route   PUT /api/users/addresses/:addressId/default
 * @desc    Varsayılan adresi değiştir
 * @access  Private
 */
router.put('/addresses/:addressId/default', authenticateToken, setDefaultAddress);

export default router; 