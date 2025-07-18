import express from 'express';
import { subscribeToNewsletter, unsubscribeFromNewsletter, getNewsletterSubscribers } from './newsletterController';
import { authenticateToken, requireAdmin } from '../../middleware/authMiddleware';

const router = express.Router();

router.post('/subscribe', subscribeToNewsletter);
router.post('/unsubscribe', unsubscribeFromNewsletter);

router.get('/subscribers', authenticateToken, requireAdmin, getNewsletterSubscribers);

export default router; 