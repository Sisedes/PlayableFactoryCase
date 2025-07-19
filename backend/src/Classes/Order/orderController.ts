import { Request, Response } from 'express';
import Order from './orderModel';
import Cart from '../Cart/cartModel';
import Product from '../Product/productModel';
import { IOrder, IOrderItem } from '../../types';
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from '../../utils/emailService';

/**
 * @desc    
 * @route   post /api/orders/create-from-cart
 * @access  
 */
export const createOrderFromCart = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('=== CREATE ORDER FROM CART START ===');
    console.log('Create order from cart request body:', req.body);
    console.log('User from request:', (req as any).user);
    console.log('Headers:', req.headers);
    
    const {
      customerInfo,
      addresses,
      paymentMethod,
      notes,
      sameAsShipping = true
    } = req.body;

    const userId = (req as any).user?.userId;
    const sessionId = req.cookies?.sessionId || req.headers['x-session-id'] as string;
    
    console.log('=== CART LOOKUP DEBUG ===');
    console.log('UserId:', userId);
    console.log('SessionId:', sessionId);
    console.log('Cookies:', req.cookies);
    console.log('Headers x-session-id:', req.headers['x-session-id']);
    console.log('All headers:', Object.keys(req.headers));

    let cart;
    if (userId) {
      console.log('Looking for cart by userId:', userId);
      cart = await Cart.findByUser(userId);
      console.log('Cart found by userId:', cart ? 'Yes' : 'No');
      if (cart) {
        console.log('Cart items:', cart.items);
        console.log('Cart totals:', cart.totals);
      }
      
      if (!cart && sessionId) {
        console.log('Cart not found by userId, trying sessionId...');
        cart = await Cart.findBySession(sessionId);
        console.log('Cart found by sessionId:', cart ? 'Yes' : 'No');
        
        if (cart) {
          console.log('Linking cart to user...');
          cart.user = userId;
          await cart.save();
          console.log('Cart linked to user successfully');
        }
      }
    } else if (sessionId) {
      console.log('Looking for cart by sessionId:', sessionId);
      cart = await Cart.findBySession(sessionId);
      console.log('Cart found by sessionId:', cart ? 'Yes' : 'No');
      if (cart) {
        console.log('Cart items:', cart.items);
        console.log('Cart totals:', cart.totals);
      }
    }
    
    console.log('Final cart:', cart);
    console.log('Cart items length:', cart?.items?.length);

    if (!cart || cart.items.length === 0) {
      console.log('Cart is empty or not found');
      console.log('Cart:', cart);
      console.log('Cart items:', cart?.items);
      res.status(400).json({
        success: false,
        message: 'Sepet boş'
      });
      return;
    }

    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(400).json({
          success: false,
          message: `Ürün bulunamadı: ${item.product}`
        });
        return;
      }

      if (product.stock < item.quantity) {
        res.status(400).json({
          success: false,
          message: `Yetersiz stok: ${product.name}`
        });
        return;
      }
    }

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const billingAddress = sameAsShipping ? addresses.shipping : addresses.billing;

    const orderData = {
      orderNumber,
      user: userId,
      customerInfo: {
        customerId: userId,
        email: customerInfo.email,
        phone: customerInfo.phone,
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName
      },
      items: cart.items.map((item: any) => {
        console.log('Processing cart item:', {
          productName: item.product.name,
          productImages: item.product.images,
          variantImage: item.variant?.image,
          finalImage: item.variant?.image || item.product.images?.[0]?.url
        });
        
        return {
          product: item.product,
          variant: item.variant,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          name: item.product.name,
          sku: item.product.sku,
          image: item.variant?.image || item.product.images?.[0]?.url
        };
      }),
      pricing: {
        subtotal: cart.totals.subtotal,
        discount: cart.totals.discount,
        tax: cart.totals.tax,
        shipping: cart.totals.shipping,
        total: cart.totals.total
      },
      addresses: {
        billing: billingAddress,
        shipping: addresses.shipping
      },
      payment: {
        method: paymentMethod,
        status: 'pending'
      },
      fulfillment: {
        status: 'pending'
      },
      appliedCoupons: cart.appliedCoupons,
      notes
    };

    const order = new Order(orderData);
    await order.save();

    for (const item of cart.items) {
      if (item.variant) {
        await Product.updateOne(
          { 
            _id: item.product,
            'variants._id': item.variant 
          },
          { 
            $inc: { 'variants.$.stock': -item.quantity }
          }
        );
      } else {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity }
        });
      }
    }

    await cart.clearCart();
    
    if (cart.items.length === 0) {
      await Cart.findByIdAndDelete(cart._id);
      console.log('Cart cleared and deleted from database');
    }

    await order.populate('items.product', 'name images price salePrice');

    try {
      await sendOrderConfirmationEmail(
        customerInfo.email,
        order.toObject(),
        `${customerInfo.firstName} ${customerInfo.lastName}`
      );
    } catch (emailError) {
      console.error('Email gönderme hatası:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Sipariş başarıyla oluşturuldu',
      data: {
        order,
        orderNumber
      }
    });
  } catch (error: any) {
    console.error('=== CREATE ORDER ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', error?.message || 'Unknown error');
    console.error('Error stack:', error?.stack || 'No stack trace');
    console.error('Full error object:', JSON.stringify(error, null, 2));
    
    res.status(500).json({
      success: false,
      message: 'Sipariş oluşturulurken hata oluştu',
      error: error?.message || 'Unknown error'
    });
  }
};

/**
 * @desc    
 * @route   post /api/orders/:orderId/process-payment
 * @access  
 */
export const processPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { paymentDetails } = req.body;
    const userId = (req as any).user?.userId;

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Sipariş bulunamadı'
      });
      return;
    }

    if (order.user?.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'Bu siparişe erişim izniniz yok'
      });
      return;
    }

    if (order.payment.status !== 'pending') {
      res.status(400).json({
        success: false,
        message: 'Bu sipariş zaten ödenmiş'
      });
      return;
    }

    const paymentSuccess = Math.random() > 0.1; 

    if (paymentSuccess) {
      order.payment.status = 'paid';
      order.payment.transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      order.payment.paidAt = new Date();
      order.fulfillment.status = 'confirmed';

      await order.save();

      res.status(200).json({
        success: true,
        message: 'Ödeme başarıyla tamamlandı',
        data: {
          order,
          transactionId: order.payment.transactionId
        }
      });
    } else {
      order.payment.status = 'failed';
      await order.save();

      res.status(400).json({
        success: false,
        message: 'Ödeme başarısız oldu. Lütfen tekrar deneyin.'
      });
    }
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Ödeme işlenirken hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   post /api/orders/guest
 * @access  
 */
export const createGuestOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      customerInfo,
      items,
      addresses,
      paymentMethod,
      notes,
      sameAsShipping = true
    } = req.body;
    
    const sessionId = req.cookies?.sessionId || req.headers['x-session-id'] as string;

    if (!items || items.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Sipariş boş'
      });
      return;
    }

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        res.status(400).json({
          success: false,
          message: `Ürün bulunamadı: ${item.productId}`
        });
        return;
      }

      if (product.stock < item.quantity) {
        res.status(400).json({
          success: false,
          message: `Yetersiz stok: ${product.name}`
        });
        return;
      }
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const price = product.salePrice || product.price;
      const total = price * item.quantity;
      subtotal += total;

      orderItems.push({
        product: item.productId,
        variant: item.variantId,
        quantity: item.quantity,
        price,
        total,
        name: product.name,
        sku: product.sku,
        image: item.variantId ? 
          product.variants?.find((v: any) => v._id.toString() === item.variantId)?.image : 
          product.images[0]?.url
      });
    }

    const tax = subtotal * 0.18; 
    const shipping = subtotal >= 1000 ? 0 : 50; 
    const total = subtotal + tax + shipping;

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const billingAddress = sameAsShipping ? addresses.shipping : addresses.billing;

    const orderData = {
      orderNumber,
      customerInfo: {
        email: customerInfo.email,
        phone: customerInfo.phone,
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName
      },
      items: orderItems,
      pricing: {
        subtotal,
        discount: 0,
        tax,
        shipping,
        total
      },
      addresses: {
        billing: billingAddress,
        shipping: addresses.shipping
      },
      payment: {
        method: paymentMethod,
        status: 'pending'
      },
      fulfillment: {
        status: 'pending'
      },
      notes
    };

    const order = new Order(orderData);
    await order.save();

    for (const item of items) {
      if (item.variantId) {
        await Product.updateOne(
          { 
            _id: item.productId,
            'variants._id': item.variantId 
          },
          { 
            $inc: { 'variants.$.stock': -item.quantity }
          }
        );
      } else {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity }
        });
      }
    }

    await order.populate('items.product', 'name images price salePrice');

    if (sessionId) {
      try {
        const sessionCart = await Cart.findBySession(sessionId);
        if (sessionCart) {
          await sessionCart.clearCart();
          if (sessionCart.items.length === 0) {
            await Cart.findByIdAndDelete(sessionCart._id);
            console.log('Session cart cleared and deleted from database');
          }
        }
      } catch (cartError) {
        console.error('Session cart clear error:', cartError);
      }
    }

    try {
      await sendOrderConfirmationEmail(
        customerInfo.email,
        order.toObject(),
        `${customerInfo.firstName} ${customerInfo.lastName}`
      );
    } catch (emailError) {
      console.error('Email gönderme hatası:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Misafir siparişi başarıyla oluşturuldu',
      data: {
        order,
        orderNumber
      }
    });
  } catch (error) {
    console.error('Create guest order error:', error);
    res.status(500).json({
      success: false,
      message: 'Sipariş oluşturulurken hata oluştu'
    });
  }
};

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
 * @route   get /api/orders/by-number/:orderNumber
 * @access  
 */
export const getOrderByNumber = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderNumber } = req.params;

    const order = await Order.findOne({ orderNumber })
      .populate('items.product', 'name images price salePrice description sku');

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Sipariş bulunamadı'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Sipariş başarıyla getirildi',
      data: order
    });
  } catch (error) {
    console.error('Get order by number error:', error);
    res.status(500).json({
      success: false,
      message: 'Sipariş getirilirken hata oluştu'
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
    const { page = 1, limit = 10, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (status && status !== 'all') {
      filter['fulfillment.status'] = status;
    }

    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customerInfo.firstName': { $regex: search, $options: 'i' } },
        { 'customerInfo.lastName': { $regex: search, $options: 'i' } },
        { 'customerInfo.email': { $regex: search, $options: 'i' } }
      ];
    }

    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const orders = await Order.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'name images price salePrice')
      .sort(sort)
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
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
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

/**
 * @desc    
 * @route   get /api/orders/admin/:id
 * @access  
 */
export const getOrderByIdAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('user', 'firstName lastName email')
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
    console.error('Get order by ID admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Sipariş detayı getirilirken hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   put /api/orders/admin/:id/status
 * @access  
 */
export const updateOrderStatusAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, carrier, notes } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Sipariş bulunamadı'
      });
      return;
    }

    order.fulfillment.status = status;
    
    if (trackingNumber) {
      order.fulfillment.trackingNumber = trackingNumber;
    }
    
    if (carrier) {
      order.fulfillment.carrier = carrier;
    }
    
    if (notes) {
      order.fulfillment.notes = notes;
    }

    if (status === 'shipped') {
      order.fulfillment.shippedAt = new Date();
    } else if (status === 'delivered') {
      order.fulfillment.deliveredAt = new Date();
    }

    await order.save();

    await order.populate('user', 'firstName lastName email');
    await order.populate('items.product', 'name images price salePrice');

    if (status !== 'pending') {
      try {
        const customerName = `${order.customerInfo.firstName} ${order.customerInfo.lastName}`;
        await sendOrderStatusUpdateEmail(
          order.customerInfo.email,
          customerName,
          order.orderNumber,
          status,
          trackingNumber,
          carrier,
          notes
        );
      } catch (emailError) {
        console.error('Durum güncelleme e-postası gönderme hatası:', emailError);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Sipariş durumu başarıyla güncellendi',
      data: order
    });
  } catch (error) {
    console.error('Update order status admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Sipariş durumu güncellenirken hata oluştu'
    });
  }
}; 