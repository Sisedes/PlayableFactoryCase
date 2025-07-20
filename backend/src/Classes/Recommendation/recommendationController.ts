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
    
    // Önce mevcut önerileri kontrol et
    let products = await RecommendationService.getRecommendations('popular', undefined, limit);
    
    // Eğer öneri yoksa hesapla
    if (products.length === 0) {
      try {
        await RecommendationService.calculatePopularProducts(limit);
        products = await RecommendationService.getRecommendations('popular', undefined, limit);
      } catch (calcError) {
        console.error('Popular products calculation error:', calcError);
      }
    }

    // Hala ürün yoksa fallback olarak aktif ürünlerden en popüler olanları getir
    if (products.length === 0) {
      try {
        const Product = require('../Product/productModel').default;
        const fallbackProducts = await Product.find({ status: 'active' })
          .sort({ viewCount: -1, averageRating: -1, createdAt: -1 })
          .limit(limit)
          .populate('category', 'name slug')
          .select('name slug price salePrice images category averageRating reviewCount stock viewCount createdAt');
        
        if (fallbackProducts.length > 0) {
          products = fallbackProducts;
        } else {
          // Hiç ürün yoksa en son eklenen ürünleri getir
          const latestProducts = await Product.find({ status: 'active' })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('category', 'name slug')
            .select('name slug price salePrice images category averageRating reviewCount stock viewCount createdAt');
          
          products = latestProducts;
        }
      } catch (fallbackError) {
        console.error('Fallback products error:', fallbackError);
        res.status(500).json({
          success: false,
          message: 'Popüler ürünler getirilirken hata oluştu'
        });
        return;
      }
    }

    res.status(200).json({
      success: true,
      data: products,
      message: 'Popüler ürünler başarıyla getirildi'
    });
  } catch (error) {
    console.error('getPopularProducts error:', error);
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
      await RecommendationService.calculateSimilarProducts(productId, limit);
      products = await RecommendationService.getRecommendations('similar', productId, limit);
    }

    if (products.length === 0) {
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
    
    
    let products = await RecommendationService.getRecommendations('frequently_bought', productId, limit);
    
    if (products.length === 0) {
      await RecommendationService.calculateFrequentlyBoughtTogether(productId, limit);
      products = await RecommendationService.getRecommendations('frequently_bought', productId, limit);
    }

    if (products.length === 0) {
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
    }

    res.status(200).json({
      success: true,
      data: products,
      message: 'Birlikte alınan ürünler başarıyla getirildi'
    });
  } catch (error) {
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

    

    res.status(200).json({
      success: true,
      data: orders,
      message: 'Debug bilgileri getirildi'
    });
  } catch (error) {
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
    res.status(500).json({
      success: false,
      message: 'Öneri hesaplaması sırasında hata oluştu'
    });
  }
}; 

/**
 * @desc    Test endpoint for recommendations
 * @route   get /api/recommendations/test
 * @access  Public
 */
export const testRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const UserActivity = require('../UserActivity/userActivityModel').default;
    const Product = require('../Product/productModel').default;
    const Recommendation = require('./recommendationModel').default;

    // Check UserActivity count
    const userActivityCount = await UserActivity.countDocuments();
    
    // Check Product count
    const productCount = await Product.countDocuments({ status: 'active' });
    
    // Check Recommendation count
    const recommendationCount = await Recommendation.countDocuments();
    
    // Check popular recommendation
    const popularRecommendation = await Recommendation.findOne({ type: 'popular' });

    res.status(200).json({
      success: true,
      data: {
        userActivityCount,
        productCount,
        recommendationCount,
        hasPopularRecommendation: !!popularRecommendation,
        popularRecommendationProducts: popularRecommendation?.recommendedProducts?.length || 0,
        timestamp: new Date().toISOString()
      },
      message: 'Recommendation system test completed'
    });
  } catch (error) {
    console.error('testRecommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Test sırasında hata oluştu'
    });
  }
}; 