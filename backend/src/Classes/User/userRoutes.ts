import express from 'express';
import {
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  updateProfile,
  sendPasswordResetCode,
  resetPasswordWithCode,
  getFavoriteProducts,
  addToFavorites,
  removeFromFavorites,
  checkFavoriteStatus
} from './userController';
import { authenticateToken } from '../../middleware/authMiddleware';
import { validateAddress, handleValidationErrors } from '../../middleware/validationMiddleware';

const router = express.Router();

/**
 * @route   put /api/users/profile
 * @desc    
 * @access  
 */
router.put('/profile', authenticateToken, updateProfile);

/**
 * @route   post /api/users/send-password-reset-code
 * @desc    
 * @access  
 */
router.post('/send-password-reset-code', authenticateToken, sendPasswordResetCode);

/**
 * @route   post /api/users/reset-password-with-code
 * @desc    
 * @access  
 */
router.post('/reset-password-with-code', authenticateToken, resetPasswordWithCode);

/**
 * @route   get /api/users/addresses
 * @desc    
 * @access  
 */
router.get('/addresses', authenticateToken, getUserAddresses);

/**
 * @route   post /api/users/addresses
 * @desc    
 * @access  
 */
router.post('/addresses', 
  authenticateToken,
  validateAddress,
  handleValidationErrors,
  addAddress
);

/**
 * @route   put /api/users/addresses/:addressId
 * @desc    
 * @access  
 */
router.put('/addresses/:addressId', 
  authenticateToken,
  validateAddress,
  handleValidationErrors,
  updateAddress
);

/**
 * @route   delete /api/users/addresses/:addressId
 * @desc    
 * @access  
 */
router.delete('/addresses/:addressId', authenticateToken, deleteAddress);

/**
 * @route   put /api/users/addresses/:addressId/default
 * @desc    
 * @access  
 */
router.put('/addresses/:addressId/default', authenticateToken, setDefaultAddress);

/**
 * @route   get /api/users/favorites
 * @desc    
 * @access  
 */
router.get('/favorites', authenticateToken, getFavoriteProducts);

/**
 * @route   post /api/users/favorites
 * @desc    
 * @access  
 */
router.post('/favorites', authenticateToken, addToFavorites);

/**
 * @route   delete /api/users/favorites/:productId
 * @desc    
 * @access  
 */
router.delete('/favorites/:productId', authenticateToken, removeFromFavorites);

/**
 * @route   get /api/users/favorites/:productId/check
 * @desc    
 * @access  
 */
router.get('/favorites/:productId/check', authenticateToken, checkFavoriteStatus);

export default router; 