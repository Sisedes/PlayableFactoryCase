import express from 'express';
import { authenticateToken, requireAdmin } from '../../middleware/authMiddleware';
import { 
  getDashboardStats, 
  getAdvancedReports, 
  bulkCategoryAssignment, 
  bulkPriceUpdate, 
  getNotifications, 
  updateNotificationSettings 
} from './adminController';

const router = express.Router();

router.get('/dashboard', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Admin routes working - Dashboard',
  });
});

router.get('/users', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Admin routes working - Get all users',
  });
});

router.get('/dashboard/stats', authenticateToken, requireAdmin, getDashboardStats);

router.get('/reports', authenticateToken, requireAdmin, getAdvancedReports);

router.post('/bulk/category', authenticateToken, requireAdmin, bulkCategoryAssignment);
router.post('/bulk/price', authenticateToken, requireAdmin, bulkPriceUpdate);

router.get('/notifications', authenticateToken, requireAdmin, getNotifications);
router.put('/notifications/settings', authenticateToken, requireAdmin, updateNotificationSettings);

export default router; 