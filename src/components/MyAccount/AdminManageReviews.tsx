"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/store/authStore";
import { 
  getAllReviewsAdmin,
  approveReview,
  rejectReview
} from "@/services/reviewService";
import toast from "react-hot-toast";

const AdminManageReviews = () => {
  const { accessToken } = useAuth();
  const [adminReviews, setAdminReviews] = useState<any[]>([]);
  const [adminReviewsLoading, setAdminReviewsLoading] = useState(false);
  const [reviewActionLoading, setReviewActionLoading] = useState<string | null>(null);
  const [reviewStatusFilter, setReviewStatusFilter] = useState('all');
  const [adminReviewsPagination, setAdminReviewsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalReviews: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  const loadAllReviewsAdmin = async (page = 1, status = 'all') => {
    if (!accessToken) return;
    
    setAdminReviewsLoading(true);
    try {
      const response = await getAllReviewsAdmin(accessToken, page, 10, status);
      if (response.success) {
        setAdminReviews(response.data);
        setAdminReviewsPagination({
          currentPage: response.currentPage || 1,
          totalPages: response.pages || 1,
          totalReviews: response.total || 0,
          hasNextPage: response.currentPage < (response.pages || 1),
          hasPrevPage: response.currentPage > 1
        });
      } else {
        console.error('Yorumlar yüklenemedi:', response.message);
      }
    } catch (error) {
      console.error('Yorumlar yüklenirken hata:', error);
    } finally {
      setAdminReviewsLoading(false);
    }
  };

  const handleApproveReview = async (reviewId: string) => {
    if (!accessToken) return;
    
    setReviewActionLoading(reviewId);
    try {
      const response = await approveReview(reviewId, accessToken);
      if (response.success) {
        toast.success('Yorum başarıyla onaylandı');
        loadAllReviewsAdmin(adminReviewsPagination.currentPage, reviewStatusFilter);
      } else {
        toast.error(response.message || 'Yorum onaylanamadı');
      }
    } catch (error) {
      toast.error('Yorum onaylanırken hata oluştu');
    } finally {
      setReviewActionLoading(null);
    }
  };

  const handleRejectReview = async (reviewId: string) => {
    if (!accessToken) return;
    
    setReviewActionLoading(reviewId);
    try {
      const response = await rejectReview(reviewId, accessToken);
      if (response.success) {
        toast.success('Yorum reddedildi');
        loadAllReviewsAdmin(adminReviewsPagination.currentPage, reviewStatusFilter);
      } else {
        toast.error(response.message || 'Yorum reddedilemedi');
      }
    } catch (error) {
      toast.error('Yorum reddedilirken hata oluştu');
    } finally {
      setReviewActionLoading(null);
    }
  };

  useEffect(() => {
    if (accessToken) {
      loadAllReviewsAdmin(1, reviewStatusFilter);
    }
  }, [accessToken, reviewStatusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Onaylandı';
      case 'pending':
        return 'Bekliyor';
      case 'rejected':
        return 'Reddedildi';
      default:
        return status;
    }
  };

  return (
    <div className="xl:max-w-[770px] w-full bg-white rounded-xl shadow-1">
      <div className="p-4 sm:p-7.5 xl:p-10">
        <div className="flex items-center justify-between mb-7">
          <h2 className="font-medium text-xl sm:text-2xl text-dark">
            Yorum Yönetimi
          </h2>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              Toplam: {adminReviewsPagination.totalReviews} yorum
            </span>
          </div>
        </div>

        {/* Filtreler */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-dark">Durum:</label>
              <select
                value={reviewStatusFilter}
                onChange={(e) => setReviewStatusFilter(e.target.value)}
                className="rounded-md border border-gray-3 bg-gray-1 py-2 px-3 text-sm outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              >
                <option value="all">Tüm Yorumlar</option>
                <option value="pending">Bekleyenler</option>
                <option value="approved">Onaylananlar</option>
                <option value="rejected">Reddedilenler</option>
              </select>
            </div>
          </div>
        </div>

        {/* Yorum Listesi */}
        {adminReviewsLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
          </div>
        ) : adminReviews.length > 0 ? (
          <div className="space-y-6">
            {adminReviews.map((review) => (
              <div key={review._id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
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
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(review.status)}`}>
                      {getStatusText(review.status)}
                    </span>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-medium text-dark mb-2">{review.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="font-medium text-dark">Müşteri:</span>
                      <span className="ml-2">
                        {review.user?.firstName} {review.user?.lastName}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-dark">Ürün:</span>
                      <span className="ml-2 text-blue hover:text-blue-dark">
                        {review.product?.name || 'Ürün adı bulunamadı'}
                      </span>
                    </div>
                    {review.user?.email && (
                      <div className="text-xs text-gray-500">
                        {review.user.email}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {review.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApproveReview(review._id)}
                          disabled={reviewActionLoading === review._id}
                          className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          {reviewActionLoading === review._id ? 'İşleniyor...' : 'Onayla'}
                        </button>
                        <button
                          onClick={() => handleRejectReview(review._id)}
                          disabled={reviewActionLoading === review._id}
                          className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          {reviewActionLoading === review._id ? 'İşleniyor...' : 'Reddet'}
                        </button>
                      </>
                    )}
                    
                    {review.status === 'approved' && (
                      <button
                        onClick={() => handleRejectReview(review._id)}
                        disabled={reviewActionLoading === review._id}
                        className="px-3 py-1.5 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {reviewActionLoading === review._id ? 'İşleniyor...' : 'Gizle'}
                      </button>
                    )}
                    
                    {review.status === 'rejected' && (
                      <button
                        onClick={() => handleApproveReview(review._id)}
                        disabled={reviewActionLoading === review._id}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {reviewActionLoading === review._id ? 'İşleniyor...' : 'Onayla'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {adminReviewsPagination.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-6">
                <button
                  onClick={() => loadAllReviewsAdmin(adminReviewsPagination.currentPage - 1, reviewStatusFilter)}
                  disabled={!adminReviewsPagination.hasPrevPage}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Önceki
                </button>
                
                <span className="text-sm text-gray-600">
                  Sayfa {adminReviewsPagination.currentPage} / {adminReviewsPagination.totalPages}
                </span>
                
                <button
                  onClick={() => loadAllReviewsAdmin(adminReviewsPagination.currentPage + 1, reviewStatusFilter)}
                  disabled={!adminReviewsPagination.hasNextPage}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-lg font-medium text-dark mb-2">
              {reviewStatusFilter === 'all' ? 'Henüz yorum bulunmuyor' : `${getStatusText(reviewStatusFilter)} yorum bulunmuyor`}
            </h3>
            <p className="text-gray-500">Müşteriler ürünlere yorum yaptığında burada görünecekler.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminManageReviews; 