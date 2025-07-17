import express from 'express';
import { authenticateToken, requireAdmin } from '../../middleware/authMiddleware';
import { getDashboardStats } from './adminController';

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

export default router; 