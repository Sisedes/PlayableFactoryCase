import express from 'express';
import {
  getMyOrders,
  getOrderById,
  getOrderByNumber,
  createOrder,
  getAllOrdersAdmin,
  getOrderByIdAdmin,
  updateOrderStatusAdmin,
  createOrderFromCart,
  processPayment,
  createGuestOrder
} from '../Classes/Order/orderController';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @route   post /api/orders/create-from-cart
 * @desc    
 * @access  
 */
router.post('/create-from-cart', authenticateToken, createOrderFromCart);

/**
 * @route   post /api/orders/create-guest
 * @desc    
 * @access  
 */
router.post('/create-guest', createGuestOrder);

/**
 * @route   post /api/orders/:orderId/process-payment
 * @desc    
 * @access  
 */
router.post('/:orderId/process-payment', authenticateToken, processPayment);

/**
 * @route   get /api/orders/my-orders
 * @desc    
 * @access  
 */
router.get('/my-orders', authenticateToken, getMyOrders);

/**
 * @route   get /api/orders/by-number/:orderNumber
 * @desc    
 * @access  
 */
router.get('/by-number/:orderNumber', getOrderByNumber);

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

/**
 * @route   get /api/orders/admin/:id
 * @desc    
 * @access  
 */
router.get('/admin/:id', authenticateToken, requireAdmin, getOrderByIdAdmin);

/**
 * @route   put /api/orders/admin/:id/status
 * @desc    
 * @access  
 */
router.put('/admin/:id/status', authenticateToken, requireAdmin, updateOrderStatusAdmin);

export default router; 