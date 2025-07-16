import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Cart routes working - Get cart',
  });
});

router.post('/add', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Cart routes working - Add to cart',
  });
});

export default router; 