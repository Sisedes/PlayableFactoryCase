import { Request, Response } from 'express';
import Cart from './cartModel';
import Product from '../Product/productModel';
import { ICart, ICartItem } from '../../types';

/**
 * @desc    
 * @route   get /api/cart
 * @access  
 */
export const getCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const sessionId = req.cookies?.sessionId || req.headers['x-session-id'] as string;

    let cart: ICart | null = null;

    if (userId) {
      cart = await (Cart as any).findByUser(userId);
    } else if (sessionId) {
      cart = await (Cart as any).findBySession(sessionId);
    }

    if (!cart) {
      cart = {
        _id: 'empty_cart',
        user: userId,
        sessionId: !userId ? sessionId : undefined,
        items: [],
        totals: {
          subtotal: 0,
          discount: 0,
          tax: 0,
          shipping: 0,
          total: 0
        },
        appliedCoupons: [],
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      } as any;
    }

    if (cart && (cart as any)._id !== 'empty_cart') {
      await cart.populate({
        path: 'items.product',
        select: 'name images price salePrice stock sku category description shortDescription variants'
      });
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Sepet getirilirken hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   post /api/cart/add
 * @access  
 */
export const addToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, quantity = 1, variantId } = req.body;
    const userId = (req as any).user?.userId;
    const sessionId = req.cookies?.sessionId || req.headers['x-session-id'] as string;

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Ürün bulunamadı'
      });
      return;
    }

    if (product.stock < quantity) {
      res.status(400).json({
        success: false,
        message: 'Yetersiz stok'
      });
      return;
    }

    let cart: ICart | null = null;

    if (userId) {
      cart = await (Cart as any).findByUser(userId);
    } else if (sessionId) {
      cart = await (Cart as any).findBySession(sessionId);
    }

    if (!cart) {
      cart = new Cart({
        user: userId,
        sessionId: !userId ? sessionId : undefined,
        items: [],
        totals: {
          subtotal: 0,
          discount: 0,
          tax: 0,
          shipping: 0,
          total: 0
        },
        appliedCoupons: []
      });
      await cart.save();
    }

    await (cart as any).addItem(productId, quantity, variantId);

    await cart.populate({
      path: 'items.product',
      select: 'name images price salePrice stock sku category description shortDescription'
    });
    await cart.populate({
      path: 'items.variant',
      select: 'name options sku price salePrice stock image isDefault'
    });

    res.status(200).json({
      success: true,
      message: 'Ürün sepete eklendi',
      data: cart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Ürün sepete eklenirken hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   put /api/cart/update/:itemId
 * @access  
 */
export const updateCartItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = (req as any).user?.userId;
    const sessionId = req.cookies?.sessionId || req.headers['x-session-id'] as string;

    let cart: ICart | null = null;

    if (userId) {
      cart = await (Cart as any).findByUser(userId);
    } else if (sessionId) {
      cart = await (Cart as any).findBySession(sessionId);
    }

    if (!cart) {
      res.status(404).json({
        success: false,
        message: 'Sepet bulunamadı'
      });
      return;
    }

    const item = (cart.items as any).id(itemId);
    if (item) {
      const product = await Product.findById(item.product);
      if (product && product.stock < quantity) {
        res.status(400).json({
          success: false,
          message: 'Yetersiz stok'
        });
        return;
      }
    }

    await (cart as any).updateItem(itemId, quantity);
    
    if (cart.items.length === 0) {
      await Cart.findByIdAndDelete(cart._id);
      res.status(200).json({
        success: true,
        message: 'Sepet güncellendi ve boş sepet silindi',
        data: null
      });
    } else {
      await cart.populate({
        path: 'items.product',
        select: 'name images price salePrice stock sku category description shortDescription'
      });
      await cart.populate({
        path: 'items.variant',
        select: 'name options sku price salePrice stock image isDefault'
      });

      res.status(200).json({
        success: true,
        message: 'Sepet güncellendi',
        data: cart
      });
    }
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Sepet güncellenirken hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   delete /api/cart/remove/:itemId
 * @access  
 */
export const removeFromCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemId } = req.params;
    const userId = (req as any).user?.userId;
    const sessionId = req.cookies?.sessionId || req.headers['x-session-id'] as string;

    let cart: ICart | null = null;

    if (userId) {
      cart = await (Cart as any).findByUser(userId);
    } else if (sessionId) {
      cart = await (Cart as any).findBySession(sessionId);
    }

    if (!cart) {
      res.status(404).json({
        success: false,
        message: 'Sepet bulunamadı'
      });
      return;
    }

    await (cart as any).removeItem(itemId);
    
    if (cart.items.length === 0) {
      await Cart.findByIdAndDelete(cart._id);
      res.status(200).json({
        success: true,
        message: 'Ürün sepetten kaldırıldı ve sepet silindi',
        data: null
      });
    } else {
      await cart.populate({
        path: 'items.product',
        select: 'name images price salePrice stock sku category description shortDescription'
      });
      await cart.populate({
        path: 'items.variant',
        select: 'name options sku price salePrice stock image isDefault'
      });

      res.status(200).json({
        success: true,
        message: 'Ürün sepetten kaldırıldı',
        data: cart
      });
    }
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Ürün sepetten kaldırılırken hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   delete /api/cart/clear
 * @access  
 */
export const clearCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const sessionId = req.cookies?.sessionId || req.headers['x-session-id'] as string;

    let cart: ICart | null = null;

    if (userId) {
      cart = await (Cart as any).findByUser(userId);
    } else if (sessionId) {
      cart = await (Cart as any).findBySession(sessionId);
    }

    if (!cart) {
      res.status(404).json({
        success: false,
        message: 'Sepet bulunamadı'
      });
      return;
    }

    await (cart as any).clearCart();
    
    if (cart.items.length === 0) {
      await Cart.findByIdAndDelete(cart._id);
      res.status(200).json({
        success: true,
        message: 'Sepet temizlendi ve silindi',
        data: null
      });
    } else {
      res.status(200).json({
        success: true,
        message: 'Sepet temizlendi',
        data: cart
      });
    }
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Sepet temizlenirken hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   post /api/cart/merge
 * @access  
 */
export const mergeCarts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { sessionId } = req.body;

    if (!sessionId) {
      res.status(400).json({
        success: false,
        message: 'Session ID gerekli'
      });
      return;
    }

    const userCart = await (Cart as any).findByUser(userId);
    const sessionCart = await (Cart as any).findBySession(sessionId);

    if (!sessionCart) {
      res.status(404).json({
        success: false,
        message: 'Session sepeti bulunamadı'
      });
      return;
    }

    if (!userCart) {
      sessionCart.user = userId;
      sessionCart.sessionId = undefined;
      await sessionCart.save();
      await sessionCart.populate('items.product', 'name images price salePrice stock sku');

      res.status(200).json({
        success: true,
        message: 'Sepetler birleştirildi',
        data: sessionCart
      });
      return;
    }

    await (userCart as any).mergeCarts(sessionCart);
    
    await Cart.findByIdAndDelete(sessionCart._id);

    await userCart.populate('items.product', 'name images price salePrice stock sku');

    res.status(200).json({
      success: true,
      message: 'Sepetler birleştirildi',
      data: userCart
    });
  } catch (error) {
    console.error('Merge carts error:', error);
    res.status(500).json({
      success: false,
      message: 'Sepetler birleştirilirken hata oluştu'
    });
  }
}; 

/**
 * @desc    
 * @route   post /api/cart/apply-coupon
 * @access  
 */
export const applyCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { couponCode } = req.body;
    const userId = (req as any).user?.userId;
    const sessionId = req.cookies?.sessionId || req.headers['x-session-id'] as string;

    if (!couponCode) {
      res.status(400).json({
        success: false,
        message: 'Kupon kodu gerekli'
      });
      return;
    }

    let cart: ICart | null = null;

    if (userId) {
      cart = await (Cart as any).findByUser(userId);
    } else if (sessionId) {
      cart = await (Cart as any).findBySession(sessionId);
    }

    if (!cart) {
      res.status(404).json({
        success: false,
        message: 'Sepet bulunamadı'
      });
      return;
    }

    let discountAmount = 0;
    let discountType = '';

    switch (couponCode.toLowerCase()) {
      case 'indirim10':
        discountAmount = cart.totals.subtotal * 0.10; 
        discountType = 'percentage';
        break;
      case 'indirim50tl':
        discountAmount = Math.min(50, cart.totals.subtotal);
        discountType = 'fixed';
        break;
      default:
        res.status(400).json({
          success: false,
          message: 'Geçersiz kupon kodu'
        });
        return;
    }

    cart.totals.discount = Math.round(discountAmount * 100) / 100;
    
    if (!cart.appliedCoupons.includes(couponCode.toUpperCase())) {
      cart.appliedCoupons.push(couponCode.toUpperCase());
    }

    await cart.save();
    await cart.populate('items.product', 'name images price salePrice stock sku');

    res.status(200).json({
      success: true,
      message: 'Kupon kodu başarıyla uygulandı',
      data: {
        cart,
        discountAmount: cart.totals.discount,
        discountType
      }
    });
  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Kupon kodu uygulanırken hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   delete /api/cart/remove-coupon
 * @access  
 */
export const removeCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const sessionId = req.cookies?.sessionId || req.headers['x-session-id'] as string;

    let cart: ICart | null = null;

    if (userId) {
      cart = await (Cart as any).findByUser(userId);
    } else if (sessionId) {
      cart = await (Cart as any).findBySession(sessionId);
    }

    if (!cart) {
      res.status(404).json({
        success: false,
        message: 'Sepet bulunamadı'
      });
      return;
    }

    cart.totals.discount = 0;
    cart.appliedCoupons = [];

    await cart.save();
    await cart.populate('items.product', 'name images price salePrice stock sku');

    res.status(200).json({
      success: true,
      message: 'İndirim kaldırıldı',
      data: cart
    });
  } catch (error) {
    console.error('Remove coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'İndirim kaldırılırken hata oluştu'
    });
  }
}; 