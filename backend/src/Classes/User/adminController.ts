import { Request, Response } from 'express';
import Order from '../Order/orderModel';
import User from './userModel';
import Product from '../Product/productModel';
import Review from '../Review/reviewModel';

/**
 * @desc    
 * @route   get /api/admin/dashboard/stats
 * @access  
 */
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalSalesResult = await Order.aggregate([
      { $match: { 'fulfillment.status': { $in: ['delivered', 'shipped'] } } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);
    const totalSales = totalSalesResult.length > 0 ? totalSalesResult[0].total : 0;

    const totalOrders = await Order.countDocuments();

    const totalCustomers = await User.countDocuments({ role: { $ne: 'admin' } });

    const totalProducts = await Product.countDocuments();

    const recentOrders = await Order.find()
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber customerInfo pricing total fulfillment.status createdAt');

    const popularProducts = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'items.product',
          as: 'orderItems'
        }
      },
      {
        $addFields: {
          totalSold: {
            $sum: {
              $map: {
                input: '$orderItems',
                as: 'order',
                in: {
                  $sum: {
                    $map: {
                      input: {
                        $filter: {
                          input: '$$order.items',
                          as: 'item',
                          cond: { $eq: ['$$item.product', '$$CURRENT._id'] }
                        }
                      },
                      as: 'item',
                      in: '$$item.quantity'
                    }
                  }
                }
              }
            }
          }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $project: {
          name: 1,
          slug: 1,
          price: 1,
          salePrice: 1,
          images: 1,
          totalSold: 1,
          category: { $arrayElemAt: ['$category.name', 0] }
        }
      }
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const salesChart = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          'fulfillment.status': { $in: ['delivered', 'shipped'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          total: { $sum: '$pricing.total' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const orderStatusDistribution = await Order.aggregate([
      {
        $group: {
          _id: '$fulfillment.status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newCustomersThisMonth = await User.countDocuments({
      role: { $ne: 'admin' },
      createdAt: { $gte: thirtyDaysAgo }
    });

    const thisMonthSales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          'fulfillment.status': { $in: ['delivered', 'shipped'] }
        }
      },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);

    const monthlySales = thisMonthSales.length > 0 ? thisMonthSales[0].total : 0;

    res.status(200).json({
      success: true,
      data: {
        totalSales,
        totalOrders,
        totalCustomers,
        totalProducts,
        newCustomersThisMonth,
        monthlySales,
        recentOrders,
        popularProducts,
        salesChart,
        orderStatusDistribution
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Dashboard istatistikleri getirilirken hata oluştu'
    });
  }
}; 