import express from 'express';
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

export default router; 