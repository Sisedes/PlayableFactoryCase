import express from 'express';
import {
  getPopularProducts,
  getSimilarProducts,
  getFrequentlyBoughtTogether,
  getViewedTogether,
  getPersonalizedRecommendations,
  getProductRecommendations,
  calculateRecommendations
} from './recommendationController';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = express.Router();

router.get('/popular', getPopularProducts);
router.get('/similar/:productId', getSimilarProducts);
router.get('/frequently-bought/:productId', getFrequentlyBoughtTogether);
router.get('/viewed-together/:productId', getViewedTogether);
router.get('/product/:productId', getProductRecommendations);

router.get('/personalized/:userId', authenticateToken, getPersonalizedRecommendations);
router.post('/calculate', authenticateToken, calculateRecommendations);

export default router; 