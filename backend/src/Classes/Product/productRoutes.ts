import express from 'express';
import { 
  getAllProducts, 
  getProductById, 
  getProductsByCategory,
  getPopularProducts,
  getLatestProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from './productsController';
import { authenticateToken, requireAdmin } from '../../middleware/authMiddleware';
import { uploadMultiple } from '../../middleware/upload';

const router = express.Router();

/**
 * @route   get /api/products
 * @desc   
 * @access  
 */
router.get('/', getAllProducts);

/**
 * @route   get /api/products/popular
 * @desc    
 * @access  
 */
router.get('/popular', getPopularProducts);

/**
 * @route   get /api/products/latest
 * @desc    
 * @access  
 */
router.get('/latest', getLatestProducts);

/**
 * @route   get /api/products/category/:categoryId
 * @desc    
 * @access  
 */
router.get('/category/:categoryId', getProductsByCategory);

/**
 * @route   get /api/products/:id
 * @desc    
 * @access  
 */
router.get('/:id', getProductById);

// Admin Routes
/**
 * @route   post /api/products
 * @desc    
 * @access  
 */
router.post('/', authenticateToken, requireAdmin, uploadMultiple, createProduct);

/**
 * @route   put /api/products/:id
 * @desc    
 * @access  
 */
router.put('/:id', authenticateToken, requireAdmin, uploadMultiple, updateProduct);

/**
 * @route   delete /api/products/:id
 * @desc    
 * @access  
 */
router.delete('/:id', authenticateToken, requireAdmin, deleteProduct);

export default router; 