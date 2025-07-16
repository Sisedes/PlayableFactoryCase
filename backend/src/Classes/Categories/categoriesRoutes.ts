import express from 'express';
import { 
  getAllCategories, 
  getCategoryBySlug, 
  getCategoryStats 
} from './categoriesController';

const router = express.Router();

/**
 * @route   get /api/categories
 * @desc    
 * @access  
 */
router.get('/', getAllCategories);

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

export default router; 