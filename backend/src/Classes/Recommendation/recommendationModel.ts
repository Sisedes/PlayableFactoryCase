import mongoose, { Schema, Model } from 'mongoose';

export interface IRecommendation extends Document {
  _id: mongoose.Types.ObjectId;
  type: 'popular' | 'similar' | 'frequently_bought' | 'personalized' | 'viewed_together';
  productId: mongoose.Types.ObjectId;
  recommendedProducts: mongoose.Types.ObjectId[];
  metadata?: {
    score?: number;
    reason?: string;
    category?: string;
    tags?: string[];
  };
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const recommendationSchema = new Schema<IRecommendation>({
  type: {
    type: String,
    enum: ['popular', 'similar', 'frequently_bought', 'personalized', 'viewed_together'],
    required: true,
    index: true
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  recommendedProducts: [{
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  }],
  metadata: {
    score: {
      type: Number,
      min: 0,
      max: 1
    },
    reason: {
      type: String,
      trim: true,
      maxlength: 200
    },
    category: {
      type: String,
      trim: true
    },
    tags: [{
      type: String,
      trim: true
    }]
  },
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true
});

recommendationSchema.index({ type: 1, productId: 1 }, { unique: true });
recommendationSchema.index({ type: 1, createdAt: -1 });
recommendationSchema.index({ 'metadata.score': -1 });

recommendationSchema.statics.findByTypeAndProduct = function(type: string, productId: string) {
  return this.findOne({ type, productId })
    .populate('recommendedProducts', 'name slug price salePrice images category averageRating reviewCount')
    .populate('recommendedProducts.category', 'name slug');
};

recommendationSchema.statics.findPopularProducts = function(limit: number = 10) {
  return this.findOne({ type: 'popular' })
    .populate('recommendedProducts', 'name slug price salePrice images category averageRating reviewCount')
    .populate('recommendedProducts.category', 'name slug')
    .sort({ 'metadata.score': -1 })
    .limit(limit);
};

recommendationSchema.statics.findSimilarProducts = function(productId: string, limit: number = 4) {
  return this.findOne({ type: 'similar', productId })
    .populate('recommendedProducts', 'name slug price salePrice images category averageRating reviewCount')
    .populate('recommendedProducts.category', 'name slug')
    .sort({ 'metadata.score': -1 })
    .limit(limit);
};

recommendationSchema.statics.findFrequentlyBoughtTogether = function(productId: string, limit: number = 4) {
  return this.findOne({ type: 'frequently_bought', productId })
    .populate('recommendedProducts', 'name slug price salePrice images category averageRating reviewCount')
    .populate('recommendedProducts.category', 'name slug')
    .sort({ 'metadata.score': -1 })
    .limit(limit);
};

recommendationSchema.statics.findViewedTogether = function(productId: string, limit: number = 4) {
  return this.findOne({ type: 'viewed_together', productId })
    .populate('recommendedProducts', 'name slug price salePrice images category averageRating reviewCount')
    .populate('recommendedProducts.category', 'name slug')
    .sort({ 'metadata.score': -1 })
    .limit(limit);
};

const Recommendation: Model<IRecommendation> = mongoose.model<IRecommendation>('Recommendation', recommendationSchema);

export default Recommendation; 