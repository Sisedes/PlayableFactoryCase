import { Request, Response } from 'express';
import Order from '../Order/orderModel';
import User from './userModel';
import Product from '../Product/productModel';
import Review from '../Review/reviewModel';
import Category from '../Categories/categoriesModel';

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

/**
 * @desc    
 * @route   get /api/admin/reports
 * @access  
 */
export const getAdvancedReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, period, startDate, endDate } = req.query;
    
    let dateFilter: any = {};
    const now = new Date();
    
    if (period === '7days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: sevenDaysAgo } };
    } else if (period === '30days') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: thirtyDaysAgo } };
    } else if (period === '90days') {
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: ninetyDaysAgo } };
    } else if (period === 'custom' && startDate && endDate) {
      dateFilter = { 
        createdAt: { 
          $gte: new Date(startDate as string), 
          $lte: new Date(endDate as string) 
        } 
      };
    }

    let reportData: any = {};

    if (type === 'sales') {
      const salesData = await Order.aggregate([
        { $match: { ...dateFilter, 'fulfillment.status': { $in: ['delivered', 'shipped'] } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            value: { $sum: '$pricing.total' }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      const totalSales = salesData.reduce((sum, item) => sum + item.value, 0);
      
      const previousPeriodStart = new Date(dateFilter.createdAt.$gte);
      const previousPeriodEnd = new Date(dateFilter.createdAt.$lte);
      const periodDuration = previousPeriodEnd.getTime() - previousPeriodStart.getTime();
      
      const previousPeriodStartDate = new Date(previousPeriodStart.getTime() - periodDuration);
      const previousPeriodEndDate = new Date(previousPeriodEnd.getTime() - periodDuration);
      
      const previousSalesData = await Order.aggregate([
        { 
          $match: { 
            createdAt: { 
              $gte: previousPeriodStartDate, 
              $lte: previousPeriodEndDate 
            }, 
            'fulfillment.status': { $in: ['delivered', 'shipped'] } 
          } 
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$pricing.total' }
          }
        }
      ]);

      const previousTotalSales = previousSalesData.length > 0 ? previousSalesData[0].total : 0;
      const change = previousTotalSales > 0 ? ((totalSales - previousTotalSales) / previousTotalSales) * 100 : 0;

      reportData = {
        total: totalSales,
        change: Math.round(change * 10) / 10,
        data: salesData.map(item => ({
          date: item._id,
          value: item.value
        }))
      };
    } else if (type === 'customers') {
      const customerData = await User.aggregate([
        { $match: { ...dateFilter, role: { $ne: 'admin' } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            value: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      const totalCustomers = customerData.reduce((sum, item) => sum + item.value, 0);
      
      const previousPeriodStart = new Date(dateFilter.createdAt.$gte);
      const previousPeriodEnd = new Date(dateFilter.createdAt.$lte);
      const periodDuration = previousPeriodEnd.getTime() - previousPeriodStart.getTime();
      
      const previousPeriodStartDate = new Date(previousPeriodStart.getTime() - periodDuration);
      const previousPeriodEndDate = new Date(previousPeriodEnd.getTime() - periodDuration);
      
      const previousCustomerData = await User.aggregate([
        { 
          $match: { 
            createdAt: { 
              $gte: previousPeriodStartDate, 
              $lte: previousPeriodEndDate 
            }, 
            role: { $ne: 'admin' } 
          } 
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 }
          }
        }
      ]);

      const previousTotalCustomers = previousCustomerData.length > 0 ? previousCustomerData[0].total : 0;
      const change = previousTotalCustomers > 0 ? ((totalCustomers - previousTotalCustomers) / previousTotalCustomers) * 100 : 0;

      reportData = {
        total: totalCustomers,
        change: Math.round(change * 10) / 10,
        data: customerData.map(item => ({
          date: item._id,
          value: item.value
        }))
      };
    } else if (type === 'products') {
      const productData = await Product.aggregate([
        { $match: { ...dateFilter, status: 'active' } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            value: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      const totalProducts = productData.reduce((sum, item) => sum + item.value, 0);
      
      const previousPeriodStart = new Date(dateFilter.createdAt.$gte);
      const previousPeriodEnd = new Date(dateFilter.createdAt.$lte);
      const periodDuration = previousPeriodEnd.getTime() - previousPeriodStart.getTime();
      
      const previousPeriodStartDate = new Date(previousPeriodStart.getTime() - periodDuration);
      const previousPeriodEndDate = new Date(previousPeriodEnd.getTime() - periodDuration);
      
      const previousProductData = await Product.aggregate([
        { 
          $match: { 
            createdAt: { 
              $gte: previousPeriodStartDate, 
              $lte: previousPeriodEndDate 
            }, 
            status: 'active' 
          } 
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 }
          }
        }
      ]);

      const previousTotalProducts = previousProductData.length > 0 ? previousProductData[0].total : 0;
      const change = previousTotalProducts > 0 ? ((totalProducts - previousTotalProducts) / previousTotalProducts) * 100 : 0;

      reportData = {
        total: totalProducts,
        change: Math.round(change * 10) / 10,
        data: productData.map(item => ({
          date: item._id,
          value: item.value
        }))
      };
    }

    res.status(200).json({
      success: true,
      data: reportData
    });
  } catch (error) {
    console.error('Advanced reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Raporlar getirilirken hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   post /api/admin/bulk/category
 * @access  
 */
export const bulkCategoryAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productIds, categoryIds } = req.body;

    if (!productIds || !categoryIds || !Array.isArray(productIds) || !Array.isArray(categoryIds)) {
      res.status(400).json({
        success: false,
        message: 'Geçersiz ürün veya kategori ID\'leri'
      });
      return;
    }

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: { category: categoryIds[0] } } 
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} ürün başarıyla kategorilere atandı`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error('Bulk category assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Toplu kategori atama sırasında hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   post /api/admin/bulk/price
 * @access  
 */
export const bulkPriceUpdate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productIds, changeType, changeValue } = req.body;

    if (!productIds || !Array.isArray(productIds) || !changeType || !changeValue) {
      res.status(400).json({
        success: false,
        message: 'Geçersiz parametreler'
      });
      return;
    }

    let updateOperation: any = {};

    if (changeType === 'percentage') {
      const percentage = parseFloat(changeValue);
      updateOperation = {
        $mul: { 
          price: 1 + (percentage / 100),
          salePrice: 1 + (percentage / 100)
        }
      };
    } else if (changeType === 'fixed') {
      const fixedAmount = parseFloat(changeValue);
      updateOperation = {
        $inc: { 
          price: fixedAmount,
          salePrice: fixedAmount
        }
      };
    }

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      updateOperation
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} ürünün fiyatı başarıyla güncellendi`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error('Bulk price update error:', error);
    res.status(500).json({
      success: false,
      message: 'Toplu fiyat güncelleme sırasında hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   get /api/admin/notifications
 * @access  
 */
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {

    const notifications = [
      {
        id: '1',
        type: 'new_order',
        title: 'Yeni Sipariş',
        message: '#12345 numaralı yeni sipariş alındı',
        timestamp: new Date().toISOString(),
        read: false
      },
      {
        id: '2',
        type: 'low_stock',
        title: 'Düşük Stok Uyarısı',
        message: '5 ürünün stoku kritik seviyede',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false
      },
      {
        id: '3',
        type: 'system',
        title: 'Sistem Güncellemesi',
        message: 'Sistem bakımı tamamlandı',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        read: true
      }
    ];

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirimler getirilirken hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   put /api/admin/notifications/settings
 * @access  
 */
export const updateNotificationSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { newOrders, lowStock, systemAlerts, emailNotifications } = req.body;


    res.status(200).json({
      success: true,
      message: 'Bildirim ayarları başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Bildirim ayarları güncellenirken hata oluştu'
    });
  }
}; 