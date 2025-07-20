import Recommendation, { IRecommendation } from './recommendationModel';
import Product from '../Product/productModel';
import UserActivity from '../UserActivity/userActivityModel';
import Order from '../Order/orderModel';
import { Types } from 'mongoose';

export class RecommendationService {
  
  static async calculatePopularProducts(limit: number = 10): Promise<void> {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const popularProducts = await UserActivity.aggregate([
        {
          $match: {
            type: 'view',
            createdAt: { $gte: sevenDaysAgo },
            product: { $exists: true }
          }
        },
        {
          $group: {
            _id: '$product',
            viewCount: { $sum: 1 },
            uniqueUsers: { $addToSet: '$user' },
            uniqueSessions: { $addToSet: '$sessionId' }
          }
        },
        {
          $addFields: {
            uniqueUserCount: { $size: { $ifNull: ['$uniqueUsers', []] } },
            uniqueSessionCount: { $size: { $ifNull: ['$uniqueSessions', []] } }
          }
        },
        {
          $sort: { viewCount: -1, uniqueUserCount: -1 }
        },
        {
          $limit: limit
        }
      ]);

      if (popularProducts.length > 0) {
        const productIds = popularProducts.map(p => p._id);
        
        await Recommendation.findOneAndUpdate(
          { type: 'popular' },
          {
            type: 'popular',
            productId: new Types.ObjectId(), 
            recommendedProducts: productIds,
            metadata: {
              score: 1.0,
              reason: 'En çok görüntülenen ürünler',
              category: 'popular'
            },
            expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000) 
          },
          { upsert: true, new: true }
        );
      }
    } catch (error) {
    }
  }

  static async calculateSimilarProducts(productId: string, limit: number = 4): Promise<void> {
    try {
      const product = await Product.findById(productId);
      if (!product) return;

      const similarProducts = await Product.aggregate([
        {
          $match: {
            _id: { $ne: new Types.ObjectId(productId) },
            status: 'active',
            $or: [
              { category: product.category },
              { tags: { $in: product.tags || [] } },
              {
                price: {
                  $gte: product.price * 0.7,
                  $lte: product.price * 1.3
                }
              }
            ]
          }
        },
        {
          $addFields: {
            similarityScore: {
              $add: [
                {
                  $cond: [
                    { $eq: ['$category', product.category] },
                    0.4, 
                    0
                  ]
                },
                {
                  $multiply: [
                    {
                      $size: {
                        $setIntersection: ['$tags', product.tags || []]
                      }
                    },
                    0.2 
                  ]
                },
                {
                  $cond: [
                    {
                      $and: [
                        { $gte: ['$price', product.price * 0.7] },
                        { $lte: ['$price', product.price * 1.3] }
                      ]
                    },
                    0.3, 
                    0
                  ]
                },
                {
                  $divide: [
                    { $abs: { $subtract: ['$averageRating', product.averageRating || 0] } },
                    5
                  ]
                }
              ]
            }
          }
        },
        {
          $sort: { similarityScore: -1 }
        },
        {
          $limit: limit
        }
      ]);

      if (similarProducts.length > 0) {
        const productIds = similarProducts.map(p => p._id);
        
        await Recommendation.findOneAndUpdate(
          { type: 'similar', productId: new Types.ObjectId(productId) },
          {
            type: 'similar',
            productId: new Types.ObjectId(productId),
            recommendedProducts: productIds,
            metadata: {
              score: similarProducts[0]?.similarityScore || 0,
              reason: 'Benzer özelliklere sahip ürünler',
              category: product.category.toString(),
              tags: product.tags
            },
            expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000) 
          },
          { upsert: true, new: true }
        );
      }
    } catch (error) {
    }
  }

  static async calculateFrequentlyBoughtTogether(productId: string, limit: number = 4): Promise<void> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      
      const ordersWithProduct = await Order.aggregate([
        {
          $match: {
            'items.product': new Types.ObjectId(productId),
            
            // 'fulfillment.status': { $in: ['delivered', 'shipped'] },
            createdAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $unwind: '$items'
        },
        {
          $match: {
            'items.product': { $ne: new Types.ObjectId(productId) }
          }
        },
        {
          $group: {
            _id: '$items.product',
            count: { $sum: 1 },
            orderIds: { $addToSet: '$_id' },
            uniqueOrders: { $addToSet: '$_id' }
          }
        },
        {
          $addFields: {
            uniqueOrderCount: { $size: '$uniqueOrders' }
          }
        },
        {
          $sort: { count: -1, uniqueOrderCount: -1 }
        },
        {
          $limit: limit
        }
      ]);

      if (ordersWithProduct.length < limit) {
        const ninetyDaysAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
        
        const additionalOrders = await Order.aggregate([
          {
            $match: {
              'items.product': new Types.ObjectId(productId),
              // 'fulfillment.status': { $in: ['delivered', 'shipped'] },
              createdAt: { $gte: ninetyDaysAgo, $lt: thirtyDaysAgo }
            }
          },
          {
            $unwind: '$items'
          },
          {
            $match: {
              'items.product': { $ne: new Types.ObjectId(productId) }
            }
          },
          {
            $group: {
              _id: '$items.product',
              count: { $sum: 1 },
              orderIds: { $addToSet: '$_id' },
              uniqueOrders: { $addToSet: '$_id' }
            }
          },
          {
            $addFields: {
              uniqueOrderCount: { $size: '$uniqueOrders' }
            }
          },
          {
            $sort: { count: -1, uniqueOrderCount: -1 }
          },
          {
            $limit: limit - ordersWithProduct.length
          }
        ]);

        const existingIds = new Set(ordersWithProduct.map(p => p._id.toString()));
        const uniqueAdditional = additionalOrders.filter(p => !existingIds.has(p._id.toString()));
        ordersWithProduct.push(...uniqueAdditional);
      }

      if (ordersWithProduct.length > 0) {
        const productIds = ordersWithProduct.map(p => p._id);
        
        await Recommendation.findOneAndUpdate(
          { type: 'frequently_bought', productId: new Types.ObjectId(productId) },
          {
            type: 'frequently_bought',
            productId: new Types.ObjectId(productId),
            recommendedProducts: productIds,
            metadata: {
              score: ordersWithProduct[0]?.count / 100 || 0, 
              reason: 'Bu ürünle birlikte alınan ürünler',
              category: 'frequently_bought',
              totalOrders: ordersWithProduct.length
            },
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) 
          },
          { upsert: true, new: true }
        );
      }
    } catch (error) {
    }
  }

  static async calculateViewedTogether(productId: string, limit: number = 4): Promise<void> {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const sessionsWithProduct = await UserActivity.aggregate([
        {
          $match: {
            product: new Types.ObjectId(productId),
            type: 'view',
            sessionId: { $exists: true },
            createdAt: { $gte: sevenDaysAgo }
          }
        },
        {
          $group: {
            _id: '$sessionId',
            viewedAt: { $first: '$createdAt' }
          }
        }
      ]);

      if (sessionsWithProduct.length > 0) {
        const sessionIds = sessionsWithProduct.map(s => s._id);
        
        const viewedTogether = await UserActivity.aggregate([
          {
            $match: {
              sessionId: { $in: sessionIds },
              product: { $ne: new Types.ObjectId(productId) },
              type: 'view',
              createdAt: { $gte: sevenDaysAgo }
            }
          },
          {
            $group: {
              _id: '$product',
              count: { $sum: 1 },
              sessions: { $addToSet: '$sessionId' }
            }
          },
          {
            $addFields: {
              uniqueSessions: { $size: '$sessions' }
            }
          },
          {
            $sort: { count: -1, uniqueSessions: -1 }
          },
          {
            $limit: limit
          }
        ]);

        if (viewedTogether.length > 0) {
          const productIds = viewedTogether.map(p => p._id);
          
          await Recommendation.findOneAndUpdate(
            { type: 'viewed_together', productId: new Types.ObjectId(productId) },
            {
              type: 'viewed_together',
              productId: new Types.ObjectId(productId),
              recommendedProducts: productIds,
              metadata: {
                score: viewedTogether[0]?.count / 50 || 0, 
                reason: 'Bunu görüntüleyenler şunları da görüntüledi',
                category: 'viewed_together'
              },
              expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000) 
            },
            { upsert: true, new: true }
          );
        }
      }
    } catch (error) {
    }
  }

  static async calculatePersonalizedRecommendations(userId: string, limit: number = 8): Promise<void> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const userActivities = await UserActivity.find({
        user: new Types.ObjectId(userId),
        createdAt: { $gte: thirtyDaysAgo }
      }).sort({ createdAt: -1 });

      if (userActivities.length === 0) return;

      const categoryCounts: Record<string, number> = {};
      const productIds = userActivities.map(a => a.product).filter(Boolean);
      
      userActivities.forEach(activity => {
        if (activity.category) {
          categoryCounts[activity.category.toString()] = (categoryCounts[activity.category.toString()] || 0) + 1;
        }
      });

      const favoriteCategories = Object.keys(categoryCounts)
        .sort((a, b) => categoryCounts[b] - categoryCounts[a])
        .slice(0, 3);

      const personalizedProducts = await Product.aggregate([
        {
          $match: {
            _id: { $nin: productIds },
            status: 'active',
            category: { $in: favoriteCategories.map(c => new Types.ObjectId(c)) }
          }
        },
        {
          $addFields: {
            score: {
              $add: [
                { $multiply: ['$averageRating', 0.3] },
                { $multiply: ['$viewCount', 0.0001] },
                { $cond: [{ $eq: ['$isFeatured', true] }, 0.2, 0] }
              ]
            }
          }
        },
        {
          $sort: { score: -1 }
        },
        {
          $limit: limit
        }
      ]);

      if (personalizedProducts.length > 0) {
        const productIds = personalizedProducts.map(p => p._id);
        
        await Recommendation.findOneAndUpdate(
          { type: 'personalized', productId: new Types.ObjectId(userId) },
          {
            type: 'personalized',
            productId: new Types.ObjectId(userId),
            recommendedProducts: productIds,
            metadata: {
              score: personalizedProducts[0]?.score || 0,
              reason: 'Geçmişinize göre önerilen ürünler',
              category: 'personalized'
            },
            expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) 
          },
          { upsert: true, new: true }
        );
      }
    } catch (error) {
    }
  }

  static async getRecommendations(type: string, productId?: string, limit: number = 4): Promise<any[]> {
    try {
      let recommendation;
      
      switch (type) {
        case 'popular':
          recommendation = await Recommendation.findOne({ type: 'popular' })
            .populate('recommendedProducts', 'name slug price salePrice images category averageRating reviewCount stock viewCount')
            .populate('recommendedProducts.category', 'name slug')
            .sort({ 'metadata.score': -1 })
            .limit(limit);
          break;
        case 'similar':
          if (!productId) return [];
          recommendation = await Recommendation.findOne({ type: 'similar', productId: new Types.ObjectId(productId) })
            .populate('recommendedProducts', 'name slug price salePrice images category averageRating reviewCount stock viewCount')
            .populate('recommendedProducts.category', 'name slug')
            .sort({ 'metadata.score': -1 })
            .limit(limit);
          break;
        case 'frequently_bought':
          if (!productId) return [];
          recommendation = await Recommendation.findOne({ type: 'frequently_bought', productId: new Types.ObjectId(productId) })
            .populate('recommendedProducts', 'name slug price salePrice images category averageRating reviewCount stock viewCount')
            .populate('recommendedProducts.category', 'name slug')
            .sort({ 'metadata.score': -1 })
            .limit(limit);
          break;
        case 'viewed_together':
          if (!productId) return [];
          recommendation = await Recommendation.findOne({ type: 'viewed_together', productId: new Types.ObjectId(productId) })
            .populate('recommendedProducts', 'name slug price salePrice images category averageRating reviewCount stock viewCount')
            .populate('recommendedProducts.category', 'name slug')
            .sort({ 'metadata.score': -1 })
            .limit(limit);
          break;
        case 'personalized':
          if (!productId) return [];
          recommendation = await Recommendation.findOne({ type: 'personalized', productId: new Types.ObjectId(productId) })
            .populate('recommendedProducts', 'name slug price salePrice images category averageRating reviewCount stock viewCount')
            .populate('recommendedProducts.category', 'name slug')
            .sort({ 'metadata.score': -1 })
            .limit(limit);
          break;
        default:
          return [];
      }

      return recommendation?.recommendedProducts || [];
    } catch (error) {
      return [];
    }
  }
} 