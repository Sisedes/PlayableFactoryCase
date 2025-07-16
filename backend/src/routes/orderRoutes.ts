import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Order routes working - Get orders',
  });
});

router.post('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Order routes working - Create order',
  });
});

export default router; 