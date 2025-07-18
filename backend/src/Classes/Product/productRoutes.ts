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
  setMainImage,
  testProductImages,
  getStockHistory,
  updateStock,
  getLowStockAlerts,
  getStockStatistics,
  updateProductVariants,
  getProductVariants,
  updateVariantStock,
  createTestVariantProduct
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

/**
 * @route   put /api/products/admin/:id/images/:imageId/set-main
 * @desc    
 * @access  
 */
router.put('/admin/:id/images/:imageId/set-main', authenticateToken, requireAdmin, setMainImage);

/**
 * @route   get /api/products/admin/:id/stock-history
 * @desc    
 * @access  
 */
router.get('/admin/:id/stock-history', authenticateToken, requireAdmin, getStockHistory);

/**
 * @route   put /api/products/admin/:id/stock
 * @desc    
 * @access  
 */
router.put('/admin/:id/stock', authenticateToken, requireAdmin, updateStock);

/**
 * @route   get /api/products/admin/low-stock-alerts
 * @desc    
 * @access  
 */
router.get('/admin/low-stock-alerts', authenticateToken, requireAdmin, getLowStockAlerts);

/**
 * @route   get /api/products/admin/stock-statistics
 * @desc    
 * @access  
 */
router.get('/admin/stock-statistics', authenticateToken, requireAdmin, getStockStatistics);

/**
 * @route   get /api/products/:id/variants
 * @desc    
 * @access  
 */
router.get('/:id/variants', authenticateToken, requireAdmin, getProductVariants);

/**
 * @route   put /api/products/:id/variants
 * @desc    
 * @access  
 */
router.put('/:id/variants', authenticateToken, requireAdmin, uploadMultiple, updateProductVariants);

/**
 * @route   put /api/products/:id/variants/:variantId/stock
 * @desc    
 * @access  
 */
router.put('/:id/variants/:variantId/stock', authenticateToken, requireAdmin, updateVariantStock);

/**
 * @route   get /api/products/:id/variants/:variantId/stock-history
 * @desc    
 * @access  
 */
router.get('/:id/variants/:variantId/stock-history', authenticateToken, requireAdmin, getStockHistory);

/**
 * @route   post /api/products/test/variant-product
 * @desc    
 * @access  
 */
router.post('/test/variant-product', authenticateToken, requireAdmin, createTestVariantProduct);

export default router; 