import express from 'express';
const router = express.Router();

router.get('/profile', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'User routes working - Profile endpoint',
  });
});

router.put('/profile', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'User routes working - Update profile endpoint',
  });
});

export default router; 