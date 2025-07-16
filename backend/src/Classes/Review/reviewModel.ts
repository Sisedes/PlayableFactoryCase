import mongoose, { Schema, Model } from 'mongoose';
import { IReview } from '../../types';

const reviewSchema = new Schema<IReview>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Ürün gereklidir']
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Kullanıcı gereklidir']
  },
  order: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  rating: {
    type: Number,
    required: [true, 'Puan gereklidir'],
    min: [1, 'Puan en az 1 olmalıdır'],
    max: [5, 'Puan en fazla 5 olabilir']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Başlık 200 karakterden fazla olamaz']
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [2000, 'Yorum 2000 karakterden fazla olamaz']
  },
  images: [{
    type: String,
    trim: true
  }],
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    required: true
  },
  moderationNote: {
    type: String,
    trim: true,
    maxlength: 500
  },
  helpfulVotes: {
    helpful: {
      type: Number,
      default: 0,
      min: 0
    },
    notHelpful: {
      type: Number,
      default: 0,
      min: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, status: 1, rating: -1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ createdAt: -1 });

reviewSchema.virtual('helpfulScore').get(function(this: IReview) {
  const total = this.helpfulVotes.helpful + this.helpfulVotes.notHelpful;
  return total > 0 ? (this.helpfulVotes.helpful / total) * 100 : 0;
});

reviewSchema.statics.findApproved = function() {
  return this.find({ status: 'approved' });
};

reviewSchema.statics.findByProduct = function(productId: string) {
  return this.find({ product: productId, status: 'approved' })
    .populate('user', 'profile.firstName profile.lastName')
    .sort({ createdAt: -1 });
};

reviewSchema.statics.findByUser = function(userId: string) {
  return this.find({ user: userId })
    .populate('product', 'name images')
    .sort({ createdAt: -1 });
};

const Review: Model<IReview> = mongoose.model<IReview>('Review', reviewSchema);

export default Review; 