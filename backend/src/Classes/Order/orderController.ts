import { Request, Response } from 'express';
import Order from './orderModel';

/**
 * @desc    
 * @route   get /api/orders/my-orders
 * @access  
 */
export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find({ user: userId })
      .populate('items.product', 'name images price salePrice')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalOrders = await Order.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalOrders / limitNum);

    res.status(200).json({
      success: true,
      count: orders.length,
      total: totalOrders,
      pages: totalPages,
      currentPage: pageNum,
      data: orders
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Siparişler getirilirken hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   get /api/orders/:id
 * @access  
 */
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    const order = await Order.findOne({ _id: id, user: userId })
      .populate('items.product', 'name images price salePrice description');

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Sipariş bulunamadı'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Sipariş detayı getirilirken hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   post /api/orders
 * @access  
 */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const orderData = req.body;

    orderData.user = userId;

    const order = new Order(orderData);
    await order.save();

    await order.populate('items.product', 'name images price salePrice');

    res.status(201).json({
      success: true,
      message: 'Sipariş başarıyla oluşturuldu',
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Sipariş oluşturulurken hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   get /api/orders/admin/all
 * @access  
 */
export const getAllOrdersAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (status && status !== 'all') {
      filter['fulfillment.status'] = status;
    }

    const orders = await Order.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'name images price salePrice')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalOrders = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / limitNum);

    res.status(200).json({
      success: true,
      count: orders.length,
      total: totalOrders,
      pages: totalPages,
      currentPage: pageNum,
      data: orders
    });
  } catch (error) {
    console.error('Get all orders admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Siparişler getirilirken hata oluştu'
    });
  }
}; 