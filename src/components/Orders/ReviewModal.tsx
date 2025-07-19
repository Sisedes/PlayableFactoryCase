import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { createReview, updateMyReview, checkReviewExists, Review, CreateReviewData } from '@/services/reviewService';
import { useAuth } from '@/store/authStore';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    _id: string;
    name: string;
    images: any[];
  };
  orderId: string;
  onReviewSubmitted?: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  product,
  orderId,
  onReviewSubmitted
}) => {
  const { accessToken } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isOpen && product._id) {
      checkExistingReview();
    }
  }, [isOpen, product._id]);

  const checkExistingReview = async () => {
    if (!accessToken) return;
    
    try {
      const response = await checkReviewExists(product._id, accessToken);
      if (response.success && response.data.exists && response.data.review) {
        setExistingReview(response.data.review);
        setRating(response.data.review.rating);
        setTitle(response.data.review.title || '');
        setComment(response.data.review.comment || '');
        setIsEditing(true);
      } else {
        setExistingReview(null);
        setRating(5);
        setTitle('');
        setComment('');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Yorum kontrolü hatası:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessToken) {
      setError('Oturum bilgisi bulunamadı');
      return;
    }

    if (!title.trim()) {
      setError('Başlık alanı zorunludur');
      return;
    }

    if (!comment.trim()) {
      setError('Yorum alanı zorunludur');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const reviewData: CreateReviewData = {
        productId: product._id,
        rating,
        title: title.trim(),
        comment: comment.trim()
      };

      let response;
      if (isEditing && existingReview) {
        response = await updateMyReview(existingReview._id, reviewData, accessToken);
      } else {
        response = await createReview(reviewData, accessToken);
      }

      if (response.success) {
        onReviewSubmitted?.();
        onClose();
        // Formu temizle
        setRating(5);
        setTitle('');
        setComment('');
        setExistingReview(null);
        setIsEditing(false);
      } else {
        setError(response.message || 'Yorum kaydedilirken hata oluştu');
      }
    } catch (error: any) {
      setError(error.message || 'Yorum kaydedilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setRating(5);
    setHoverRating(0);
    setTitle('');
    setComment('');
    setExistingReview(null);
    setIsEditing(false);
    onClose();
  };

  if (!isOpen) return null;

  // Debug için product verilerini yazdır
  console.log('ReviewModal Product Data:', product);
  console.log('Product Images:', product.images);
  console.log('First Image:', product.images?.[0]);
  console.log('Image Type:', typeof product.images?.[0]);
  
  // Güvenli URL oluşturma
  let debugImageUrl = '';
  if (product.images && product.images.length > 0) {
    if (Array.isArray(product.images) && product.images[0] && typeof product.images[0] === 'object' && product.images[0].url) {
      debugImageUrl = product.images[0].url;
    } else if (Array.isArray(product.images) && product.images[0] && typeof product.images[0] === 'string') {
      debugImageUrl = product.images[0];
    } else if (typeof product.images === 'string') {
      debugImageUrl = product.images;
    }
  }
  console.log('Debug Image URL:', debugImageUrl);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-dark">
              {isEditing ? 'Yorumunuzu Düzenleyin' : 'Ürün Değerlendirmesi'}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Ürün Bilgisi */}
          <div className="flex items-center space-x-3 mb-6 p-3 bg-gray-50 rounded-lg">
            <div className="relative w-16 h-16 flex-shrink-0">
              {(() => {
                let imageUrl = '';
                
                if (product.images && product.images.length > 0) {
                  if (Array.isArray(product.images) && product.images[0] && typeof product.images[0] === 'object' && product.images[0].url) {
                    imageUrl = product.images[0].url;
                  }
                  else if (Array.isArray(product.images) && product.images[0] && typeof product.images[0] === 'string') {
                    imageUrl = product.images[0];
                  }
                  else if (typeof product.images === 'string') {
                    imageUrl = product.images;
                  }
                }
                
                if (imageUrl && imageUrl.trim() !== '') {
                  const fullUrl = imageUrl.startsWith('http') ? imageUrl : `http://localhost:5000${imageUrl}`;
                  return (
                    <img
                      src={fullUrl}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-md"
                      onError={(e) => {
                        console.log('Image load error:', imageUrl);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  );
                }
                
                return (
                  <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                );
              })()}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-dark truncate">{product.name}</h4>
              <p className="text-sm text-gray-500">Sipariş: #{orderId}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="mb-4">
              <label className="block text-sm font-medium text-dark mb-2">
                Değerlendirme
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      console.log('Yıldız tıklandı:', star);
                      setRating(star);
                    }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transition-colors duration-200"
                  >
                    <svg
                      className="w-8 h-8 transition-colors duration-200"
                      style={{
                        fill: star <= (hoverRating || rating) ? '#fbbf24' : '#d1d5db',
                        color: star <= (hoverRating || rating) ? '#fbbf24' : '#d1d5db'
                      }}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {(hoverRating || rating) === 1 && 'Çok Kötü'}
                {(hoverRating || rating) === 2 && 'Kötü'}
                {(hoverRating || rating) === 3 && 'Orta'}
                {(hoverRating || rating) === 4 && 'İyi'}
                {(hoverRating || rating) === 5 && 'Mükemmel'}
              </p>
            </div>

            {/* Başlık */}
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-dark mb-2">
                Başlık *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Yorumunuz için kısa bir başlık yazın"
                maxLength={100}
              />
            </div>

            {/* Yorum */}
            <div className="mb-6">
              <label htmlFor="comment" className="block text-sm font-medium text-dark mb-2">
                Yorumunuz *
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Ürün hakkında detaylı yorumunuzu yazın..."
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {comment.length}/500 karakter
              </p>
            </div>

            {/* Hata Mesajı */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Butonlar */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue text-white rounded-md hover:bg-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Kaydediliyor...
                  </div>
                ) : (
                  isEditing ? 'Güncelle' : 'Yorum Yap'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal; 