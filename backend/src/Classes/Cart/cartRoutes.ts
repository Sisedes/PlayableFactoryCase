import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCarts,
  applyCoupon,
  removeCoupon
} from './cartController';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = express.Router();

/**
 * @route   get /api/cart
 * @desc    
 * @access  
 */
router.get('/', getCart);

/**
 * @route   post /api/cart/add
 * @desc    
 * @access  
 */
router.post('/add', addToCart);

/**
 * @route   put /api/cart/update/:itemId
 * @desc    
 * @access  
 */
router.put('/update/:itemId', updateCartItem);

/**
 * @route   delete /api/cart/remove/:itemId
 * @desc    
 * @access  
 */
router.delete('/remove/:itemId', removeFromCart);

/**
 * @route   delete /api/cart/clear
 * @desc    
 * @access  
 */
router.delete('/clear', clearCart);

/**
 * @route   post /api/cart/apply-coupon
 * @desc    
 * @access  
 */
router.post('/apply-coupon', applyCoupon);

/**
 * @route   delete /api/cart/remove-coupon
 * @desc    
 * @access  
 */
router.delete('/remove-coupon', removeCoupon);

/**
 * @route   post /api/cart/merge
 * @desc    
 * @access  
 */
router.post('/merge', authenticateToken, mergeCarts);

export default router; 