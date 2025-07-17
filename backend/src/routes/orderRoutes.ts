import express from 'express';
import {
  getMyOrders,
  getOrderById,
  createOrder,
  getAllOrdersAdmin
} from '../Classes/Order/orderController';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @route   get /api/orders/my-orders
 * @desc    
 * @access  
 */
router.get('/my-orders', authenticateToken, getMyOrders);

/**
 * @route   get /api/orders/:id
 * @desc    
 * @access  
 */
router.get('/:id', authenticateToken, getOrderById);

/**
 * @route   post /api/orders
 * @desc    
 * @access  
 */
router.post('/', authenticateToken, createOrder);

/**
 * @route   get /api/orders/admin/all
 * @desc    
 * @access  
 */
router.get('/admin/all', authenticateToken, requireAdmin, getAllOrdersAdmin);

export default router; 