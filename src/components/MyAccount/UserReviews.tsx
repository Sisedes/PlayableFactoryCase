"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/store/authStore";
import { getMyReviews, deleteMyReview } from "@/services/reviewService";

interface UserReviewsProps {
  onNavigateToOrders: () => void;
}

const UserReviews: React.FC<UserReviewsProps> = ({ onNavigateToOrders }) => {
  const { user, accessToken } = useAuth();
  const [myReviews, setMyReviews] = useState<any[]>([]);
  const [myReviewsLoading, setMyReviewsLoading] = useState(false);
  const [myReviewsPagination, setMyReviewsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalReviews: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  const loadMyReviews = async (page = 1) => {
    if (!accessToken) return;
    
    setMyReviewsLoading(true);
    try {
      const response = await getMyReviews(accessToken, page);
      if (response.success) {
        setMyReviews(response.data);
        setMyReviewsPagination({
          currentPage: response.currentPage || 1,
          totalPages: response.pages || 1,
          totalReviews: response.total || 0,
          hasNextPage: response.currentPage < (response.pages || 1),
          hasPrevPage: response.currentPage > 1
        });
      }
    } catch (error) {
      console.error('Yorumlar yüklenirken hata:', error);
    } finally {
      setMyReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      loadMyReviews();
    }
  }, [accessToken]);

  return (
    <div className="xl:max-w-[770px] w-full bg-white rounded-xl shadow-1">
      <div className="p-4 sm:p-7.5 xl:p-10">
        <div className="flex items-center justify-between mb-7">
          <h2 className="font-medium text-xl sm:text-2xl text-dark">
            Yorumlarım
          </h2>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-800 mb-1">
                Yorum Yapmak İçin
              </h3>
              <p className="text-sm text-blue-700 mb-3">
                Teslim edilen siparişlerinizdeki ürünlere yorum yapabilirsiniz. Siparişlerim sekmesine gidip teslim edilen siparişlerin detaylarını açarak &quot;Yorum Yap&quot; butonuna tıklayabilirsiniz.
              </p>
              <button
                onClick={onNavigateToOrders}
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Siparişlerim&apos;e Git
              </button>
            </div>
          </div>
        </div>

        {myReviewsLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
          </div>
        ) : myReviews.length > 0 ? (
          <div className="space-y-6">
            {myReviews.map((review) => (
              <div key={review._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    {(() => {
                      let imageUrl = '';
                      
                      if (review.product?.images && review.product.images.length > 0) {
                        if (Array.isArray(review.product.images) && review.product.images[0] && typeof review.product.images[0] === 'object' && review.product.images[0].url) {
                          imageUrl = review.product.images[0].url;
                        } else if (Array.isArray(review.product.images) && review.product.images[0] && typeof review.product.images[0] === 'string') {
                          imageUrl = review.product.images[0];
                        } else if (typeof review.product.images === 'string') {
                          imageUrl = review.product.images;
                        }
                      }
                      
                      if (imageUrl && imageUrl.trim() !== '') {
                        const fullUrl = imageUrl.startsWith('http') ? imageUrl : `http://localhost:5000${imageUrl}`;
                        return (
                          <img
                            src={fullUrl}
                            alt={review.product?.name || 'Ürün'}
                            className="w-full h-full object-cover rounded-md"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        );
                      }
                      
                      return (
                        <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-dark truncate">
                        {review.product?.name || 'Ürün adı bulunamadı'}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        review.status === 'approved' ? 'bg-green-100 text-green-700' :
                        review.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        review.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {review.status === 'approved' ? 'Onaylandı' :
                         review.status === 'pending' ? 'Bekliyor' :
                         review.status === 'rejected' ? 'Reddedildi' : review.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className="w-4 h-4"
                          style={{
                            fill: star <= review.rating ? '#fbbf24' : '#d1d5db',
                            color: star <= review.rating ? '#fbbf24' : '#d1d5db'
                          }}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-sm text-gray-600 ml-1">
                        {review.rating}/5
                      </span>
                    </div>

                    <h4 className="font-medium text-dark mb-2">{review.title}</h4>
                    <p className="text-gray-600 text-sm mb-3">{review.comment}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {new Date(review.createdAt).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <div className="flex space-x-2">
                        {review.status === 'pending' && (
                          <button
                            onClick={() => {
                            }}
                            className="text-blue hover:text-blue-dark transition-colors"
                          >
                            Düzenle
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            if (confirm('Bu yorumu silmek istediğinizden emin misiniz?')) {
                              try {
                                await deleteMyReview(review._id, accessToken || '');
                                loadMyReviews(myReviewsPagination.currentPage);
                              } catch (error) {
                                console.error('Yorum silinirken hata:', error);
                              }
                            }
                          }}
                          className="text-red hover:text-red-dark transition-colors"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {myReviewsPagination.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-6">
                <button
                  onClick={() => loadMyReviews(myReviewsPagination.currentPage - 1)}
                  disabled={!myReviewsPagination.hasPrevPage}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Önceki
                </button>
                <span className="text-sm text-gray-600">
                  Sayfa {myReviewsPagination.currentPage} / {myReviewsPagination.totalPages}
                </span>
                <button
                  onClick={() => loadMyReviews(myReviewsPagination.currentPage + 1)}
                  disabled={!myReviewsPagination.hasNextPage}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sonraki
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 2L13.09 8.26L20 9.27L15 14.14L16.18 21.02L11 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L11 2Z" />
            </svg>
            <h3 className="text-lg font-medium text-dark mb-2">Henüz yorumunuz yok</h3>
            <p className="text-gray-500 mb-4">Satın aldığınız ürünlere yorum yaparak başlayın.</p>
            <button
              onClick={onNavigateToOrders}
              className="inline-flex items-center font-medium text-white bg-blue py-2 px-4 rounded-md ease-out duration-200 hover:bg-blue-dark"
            >
              Siparişlerime Git
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserReviews; 