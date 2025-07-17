import express from 'express';
import { 
  getAllProducts, 
  getProductById, 
  getProductsByCategory,
  getPopularProducts,
  getLatestProducts,
  getAllProductsForAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductAdmin,
  deleteProductAdmin,
  bulkUpdateProducts,
  deleteProductImage,
  testProductImages
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
 * @route   get /api/products/test/images
 * @desc    
 * @access  
 */
router.get('/test/images', testProductImages);

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

/**
 * @route   get /api/products/admin/all
 * @desc    
 * @access  
 */
router.get('/admin/all', authenticateToken, requireAdmin, getAllProductsForAdmin);

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

/**
 * @route   put /api/products/admin/bulk
 * @desc    
 * @access  
 */
router.put('/admin/bulk', authenticateToken, requireAdmin, bulkUpdateProducts);

/**
 * @route   put /api/products/admin/:id
 * @desc    
 * @access  
 */
router.put('/admin/:id', authenticateToken, requireAdmin, uploadMultiple, updateProductAdmin);

/**
 * @route   delete /api/products/admin/:id
 * @desc    
 * @access  
 */
router.delete('/admin/:id', authenticateToken, requireAdmin, deleteProductAdmin);

/**
 * @route   delete /api/products/admin/:id/images/:imageId
 * @desc    
 * @access  
 */
router.delete('/admin/:id/images/:imageId', authenticateToken, requireAdmin, deleteProductImage);

export default router; 