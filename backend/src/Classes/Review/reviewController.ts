import { Request, Response } from 'express';
import Review from './reviewModel';
import Product from '../Product/productModel';

/**
 * @desc    
 * @route   get /api/reviews/pending
 * @access  
 */
export const getPendingReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const reviews = await Review.find({ status: 'pending' })
      .populate('user', 'firstName lastName email')
      .populate('product', 'name slug images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalReviews = await Review.countDocuments({ status: 'pending' });
    const totalPages = Math.ceil(totalReviews / limitNum);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total: totalReviews,
      pages: totalPages,
      currentPage: pageNum,
      data: reviews
    });
  } catch (error) {
    console.error('Get pending reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Bekleyen yorumlar getirilirken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

/**
 * @desc    
 * @route   get /api/reviews/admin/all
 * @access  
 */
export const getAllReviewsAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, productId } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (productId) {
      filter.product = productId;
    }

    const reviews = await Review.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('product', 'name slug images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalReviews = await Review.countDocuments(filter);
    const totalPages = Math.ceil(totalReviews / limitNum);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total: totalReviews,
      pages: totalPages,
      currentPage: pageNum,
      data: reviews
    });
  } catch (error) {
    console.error('Get all reviews admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Yorumlar getirilirken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

/**
 * @desc    
 * @route   put /api/reviews/:id/approve
 * @access  
 */
export const approveReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { moderationNote } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      res.status(404).json({
        success: false,
        message: 'Yorum bulunamadı'
      });
      return;
    }

    review.status = 'approved';
    if (moderationNote) {
      review.moderationNote = moderationNote;
    }
    
    await review.save();

    await updateProductRating(review.product);

    res.status(200).json({
      success: true,
      message: 'Yorum başarıyla onaylandı',
      data: review
    });
  } catch (error) {
    console.error('Approve review error:', error);
    res.status(500).json({
      success: false,
      message: 'Yorum onaylanırken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

/**
 * @desc    
 * @route   put /api/reviews/:id/reject
 * @access  
 */
export const rejectReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { moderationNote } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      res.status(404).json({
        success: false,
        message: 'Yorum bulunamadı'
      });
      return;
    }

    review.status = 'rejected';
    if (moderationNote) {
      review.moderationNote = moderationNote;
    }
    
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Yorum başarıyla reddedildi',
      data: review
    });
  } catch (error) {
    console.error('Reject review error:', error);
    res.status(500).json({
      success: false,
      message: 'Yorum reddedilirken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

/**
 * @desc    
 * @route   delete /api/reviews/:id
 * @access  
 */
export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      res.status(404).json({
        success: false,
        message: 'Yorum bulunamadı'
      });
      return;
    }

    const productId = review.product;
    await Review.findByIdAndDelete(id);

    await updateProductRating(productId);

    res.status(200).json({
      success: true,
      message: 'Yorum başarıyla silindi'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Yorum silinirken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

/**
 * @desc    
 * @route   get /api/reviews/:id
 * @access  
 */
export const getReviewById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id)
      .populate('user', 'firstName lastName email')
      .populate('product', 'name slug images category')
      .populate('order', 'orderNumber createdAt');

    if (!review) {
      res.status(404).json({
        success: false,
        message: 'Yorum bulunamadı'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Get review by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Yorum detayı getirilirken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};


const updateProductRating = async (productId: any): Promise<void> => {
  try {
    const reviews = await Review.find({ 
      product: productId, 
      status: 'approved' 
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;

    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(averageRating * 10) / 10, // 1 ondalık basamak
      reviewCount: totalReviews
    });
  } catch (error) {
    console.error('Update product rating error:', error);
  }
}; 