import { Request, Response } from 'express';
import { RecommendationService } from './recommendationService';

/**
 * @desc    
 * @route   get /api/recommendations/popular
 * @access  
 */
export const getPopularProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 8;
    
    let products = await RecommendationService.getRecommendations('popular', undefined, limit);
    
    if (products.length === 0) {
      console.log('Popüler ürünler cache\'de yok, hesaplanıyor...');
      await RecommendationService.calculatePopularProducts(limit);
      products = await RecommendationService.getRecommendations('popular', undefined, limit);
    }

    if (products.length === 0) {
      console.log('Fallback: En çok görüntülenen ürünler getiriliyor...');
      const Product = require('../Product/productModel').default;
      const fallbackProducts = await Product.find({ status: 'active' })
        .sort({ viewCount: -1, averageRating: -1 })
        .limit(limit)
        .populate('category', 'name slug')
        .select('name slug price salePrice images category averageRating reviewCount stock viewCount');
      
      products = fallbackProducts;
    }

    res.status(200).json({
      success: true,
      data: products,
      message: 'Popüler ürünler başarıyla getirildi'
    });
  } catch (error) {
    console.error('Get popular products error:', error);
    res.status(500).json({
      success: false,
      message: 'Popüler ürünler getirilirken hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   get /api/recommendations/similar/:productId
 * @access  
 */
export const getSimilarProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit as string) || 4;
    
    let products = await RecommendationService.getRecommendations('similar', productId, limit);
    
    if (products.length === 0) {
      console.log('Benzer ürünler cache\'de yok, hesaplanıyor...');
      await RecommendationService.calculateSimilarProducts(productId, limit);
      products = await RecommendationService.getRecommendations('similar', productId, limit);
    }

    if (products.length === 0) {
      console.log('Fallback: Aynı kategorideki ürünler getiriliyor...');
      const Product = require('../Product/productModel').default;
      const currentProduct = await Product.findById(productId);
      
      if (currentProduct) {
        const fallbackProducts = await Product.find({
          category: currentProduct.category,
          _id: { $ne: productId },
          status: 'active'
        })
        .sort({ averageRating: -1, viewCount: -1 })
        .limit(limit)
        .populate('category', 'name slug')
        .select('name slug price salePrice images category averageRating reviewCount stock viewCount');
        
        products = fallbackProducts;
      }
    }

    res.status(200).json({
      success: true,
      data: products,
      message: 'Benzer ürünler başarıyla getirildi'
    });
  } catch (error) {
    console.error('Get similar products error:', error);
    res.status(500).json({
      success: false,
      message: 'Benzer ürünler getirilirken hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   get /api/recommendations/frequently-bought/:productId
 * @access  
 */
export const getFrequentlyBoughtTogether = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit as string) || 4;
    
    console.log('Frequently bought together isteniyor. Product ID:', productId, 'Limit:', limit);
    
    let products = await RecommendationService.getRecommendations('frequently_bought', productId, limit);
    console.log('Cache\'den gelen ürünler:', products.length);
    
    if (products.length === 0) {
      console.log('Birlikte alınan ürünler cache\'de yok, hesaplanıyor...');
      await RecommendationService.calculateFrequentlyBoughtTogether(productId, limit);
      products = await RecommendationService.getRecommendations('frequently_bought', productId, limit);
      console.log('Hesaplama sonrası ürünler:', products.length);
    }

    if (products.length === 0) {
      console.log('Fallback: Popüler ürünler getiriliyor...');
      const Product = require('../Product/productModel').default;
      const fallbackProducts = await Product.find({
        _id: { $ne: productId },
        status: 'active'
      })
      .sort({ viewCount: -1, averageRating: -1 })
      .limit(limit)
      .populate('category', 'name slug')
      .select('name slug price salePrice images category averageRating reviewCount stock viewCount');
      
      products = fallbackProducts;
      console.log('Fallback ürünler:', products.length);
    }

    console.log('Gönderilen ürün sayısı:', products.length);
    res.status(200).json({
      success: true,
      data: products,
      message: 'Birlikte alınan ürünler başarıyla getirildi'
    });
  } catch (error) {
    console.error('Get frequently bought together error:', error);
    res.status(500).json({
      success: false,
      message: 'Birlikte alınan ürünler getirilirken hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   get /api/recommendations/viewed-together/:productId
 * @access  
 */
export const getViewedTogether = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit as string) || 4;
    
    let products = await RecommendationService.getRecommendations('viewed_together', productId, limit);
    
    if (products.length === 0) {
      await RecommendationService.calculateViewedTogether(productId, limit);
      products = await RecommendationService.getRecommendations('viewed_together', productId, limit);
    }

    res.status(200).json({
      success: true,
      data: products,
      message: 'Birlikte görüntülenen ürünler başarıyla getirildi'
    });
  } catch (error) {
    console.error('Get viewed together error:', error);
    res.status(500).json({
      success: false,
      message: 'Birlikte görüntülenen ürünler getirilirken hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   get /api/recommendations/personalized/:userId
 * @access  
 */
export const getPersonalizedRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 8;
    
    let products = await RecommendationService.getRecommendations('personalized', userId, limit);
    
    if (products.length === 0) {
      await RecommendationService.calculatePersonalizedRecommendations(userId, limit);
      products = await RecommendationService.getRecommendations('personalized', userId, limit);
    }

    res.status(200).json({
      success: true,
      data: products,
      message: 'Kişiselleştirilmiş öneriler başarıyla getirildi'
    });
  } catch (error) {
    console.error('Get personalized recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Kişiselleştirilmiş öneriler getirilirken hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   get /api/recommendations/product/:productId
 * @access  
 */
export const getProductRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    
    const [similarProducts, frequentlyBought, viewedTogether] = await Promise.all([
      RecommendationService.getRecommendations('similar', productId, 4),
      RecommendationService.getRecommendations('frequently_bought', productId, 4),
      RecommendationService.getRecommendations('viewed_together', productId, 4)
    ]);

    res.status(200).json({
      success: true,
      data: {
        similar: similarProducts,
        frequentlyBought,
        viewedTogether
      },
      message: 'Ürün önerileri başarıyla getirildi'
    });
  } catch (error) {
    console.error('Get product recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Ürün önerileri getirilirken hata oluştu'
    });
  }
};

/**
 * @desc    Debug endpoint - sipariş durumlarını kontrol et
 * @route   get /api/recommendations/debug/orders
 * @access  
 */
export const debugOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const Order = require('../Order/orderModel').default;
    
    const orders = await Order.find({})
      .select('orderNumber fulfillment.status items.product createdAt')
      .populate('items.product', 'name')
      .limit(10)
      .sort({ createdAt: -1 });

    console.log('Debug - Sipariş durumları:', orders.map((o: any) => ({
      orderNumber: o.orderNumber,
      status: o.fulfillment.status,
      items: o.items.map((item: any) => ({
        productName: item.product?.name,
        productId: item.product?._id
      })),
      createdAt: o.createdAt
    })));

    res.status(200).json({
      success: true,
      data: orders,
      message: 'Debug bilgileri getirildi'
    });
  } catch (error) {
    console.error('Debug orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug bilgileri getirilirken hata oluştu'
    });
  }
};

/**
 * @desc    
 * @route   post /api/recommendations/calculate
 * @access  
 */
export const calculateRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, productId, userId } = req.body;
    
    switch (type) {
      case 'popular':
        await RecommendationService.calculatePopularProducts();
        break;
      case 'similar':
        if (!productId) {
          res.status(400).json({
            success: false,
            message: 'Benzer ürünler için productId gereklidir'
          });
          return;
        }
        await RecommendationService.calculateSimilarProducts(productId);
        break;
      case 'frequently_bought':
        if (!productId) {
          res.status(400).json({
            success: false,
            message: 'Sıkça birlikte alınanlar için productId gereklidir'
          });
          return;
        }
        await RecommendationService.calculateFrequentlyBoughtTogether(productId);
        break;
      case 'viewed_together':
        if (!productId) {
          res.status(400).json({
            success: false,
            message: 'Birlikte görüntülenenler için productId gereklidir'
          });
          return;
        }
        await RecommendationService.calculateViewedTogether(productId);
        break;
      case 'personalized':
        if (!userId) {
          res.status(400).json({
            success: false,
            message: 'Kişiselleştirilmiş öneriler için userId gereklidir'
          });
          return;
        }
        await RecommendationService.calculatePersonalizedRecommendations(userId);
        break;
      default:
        res.status(400).json({
          success: false,
          message: 'Geçersiz öneri türü'
        });
        return;
    }

    res.status(200).json({
      success: true,
      message: `${type} önerileri başarıyla hesaplandı`
    });
  } catch (error) {
    console.error('Calculate recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Öneri hesaplaması sırasında hata oluştu'
    });
  }
}; 