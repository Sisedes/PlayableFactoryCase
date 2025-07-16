import mongoose, { Schema, Model } from 'mongoose';
import { IUserActivity } from '../../types';

const userActivitySchema = new Schema<IUserActivity>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    sparse: true
  },
  sessionId: {
    type: String,
    trim: true,
    sparse: true
  },
  type: {
    type: String,
    enum: ['view', 'add_to_cart', 'purchase', 'wishlist_add', 'search'],
    required: true
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    sparse: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    sparse: true
  },
  searchQuery: {
    type: String,
    trim: true,
    maxlength: 200
  },
  metadata: {
    type: Schema.Types.Mixed
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  expires: 2592000 // 30 gün
});

userActivitySchema.index({ user: 1, createdAt: -1 });
userActivitySchema.index({ sessionId: 1, createdAt: -1 });
userActivitySchema.index({ type: 1, createdAt: -1 });
userActivitySchema.index({ product: 1, type: 1, createdAt: -1 });
userActivitySchema.index({ createdAt: -1 });
userActivitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

userActivitySchema.statics.findByUser = function(userId: string, type?: string) {
  const query: any = { user: userId };
  if (type) query.type = type;
  return this.find(query).sort({ createdAt: -1 });
};

userActivitySchema.statics.findBySession = function(sessionId: string, type?: string) {
  const query: any = { sessionId };
  if (type) query.type = type;
  return this.find(query).sort({ createdAt: -1 });
};

userActivitySchema.statics.getRecentlyViewed = function(userId?: string, sessionId?: string) {
  const query: any = { type: 'view' };
  if (userId) query.user = userId;
  else if (sessionId) query.sessionId = sessionId;
  
  return this.find(query)
    .populate('product', 'name slug images pricing')
    .sort({ createdAt: -1 })
    .limit(10);
};

userActivitySchema.statics.getPopularProducts = function(days: number = 7) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        type: 'view',
        createdAt: { $gte: since },
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
      $sort: { viewCount: -1 }
    },
    {
      $limit: 20
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    {
      $unwind: '$product'
    }
  ]);
};

const UserActivity: Model<IUserActivity> = mongoose.model<IUserActivity>('UserActivity', userActivitySchema);

export default UserActivity; 