import express from 'express';
import {
  getPendingReviews,
  getAllReviewsAdmin,
  approveReview,
  rejectReview,
  deleteReview,
  getReviewById
} from './reviewController';
import { authenticateToken, requireAdmin } from '../../middleware/authMiddleware';

const router = express.Router();

// Admin Routes
/**
 * @route   get /api/reviews/pending
 * @desc    
 * @access  
 */
router.get('/pending', authenticateToken, requireAdmin, getPendingReviews);

/**
 * @route   get /api/reviews/admin/all
 * @desc    
 * @access  
 */
router.get('/admin/all', authenticateToken, requireAdmin, getAllReviewsAdmin);

/**
 * @route   get /api/reviews/:id
 * @desc    
 * @access  
 */
router.get('/:id', authenticateToken, requireAdmin, getReviewById);

/**
 * @route   put /api/reviews/:id/approve
 * @desc    
 * @access  
 */
router.put('/:id/approve', authenticateToken, requireAdmin, approveReview);

/**
 * @route   put /api/reviews/:id/reject
 * @desc    
 * @access  
 */
router.put('/:id/reject', authenticateToken, requireAdmin, rejectReview);

/**
 * @route   delete /api/reviews/:id
 * @desc    
 * @access  
 */
router.delete('/:id', authenticateToken, requireAdmin, deleteReview);

export default router; 