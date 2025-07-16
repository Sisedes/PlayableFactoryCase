import express from 'express';
import { 
  getAllProducts, 
  getProductById, 
  getProductsByCategory,
  getPopularProducts,
  getLatestProducts
} from './productsController';

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

export default router; 