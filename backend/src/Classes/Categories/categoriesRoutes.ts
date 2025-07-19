import express from 'express';
import { 
  getAllCategories, 
  getAllCategoriesForAdmin,
  getCategoryBySlug, 
  getCategoryStats,
  createCategory,
  updateCategory,
  deleteCategory
} from './categoriesController';
import { authenticateToken, requireAdmin } from '../../middleware/authMiddleware';
import { uploadCategoryImageWithErrorHandling } from '../../middleware/upload';

const router = express.Router();

/**
 * @route   get /api/categories
 * @desc    
 * @access  
 */
router.get('/', getAllCategories);

/**
 * @route   get /api/categories/admin
 * @desc    
 * @access  
 */
router.get('/admin', authenticateToken, requireAdmin, getAllCategoriesForAdmin);

/**
 * @route   get /api/categories/stats
 * @desc    
 * @access  
 */
router.get('/stats', getCategoryStats);

/**
 * @route   get /api/categories/:slug
 * @desc    
 * @access  
 */
router.get('/:slug', getCategoryBySlug);

/**
 * @route   post /api/categories
 * @desc    
 * @access  
 */
router.post('/', authenticateToken, requireAdmin, ...uploadCategoryImageWithErrorHandling, createCategory);

/**
 * @route   put /api/categories/:id
 * @desc    
 * @access  
 */
router.put('/:id', authenticateToken, requireAdmin, ...uploadCategoryImageWithErrorHandling, updateCategory);

/**
 * @route   delete /api/categories/:id
 * @desc    
 * @access  
 */
router.delete('/:id', authenticateToken, requireAdmin, deleteCategory);

export default router; 