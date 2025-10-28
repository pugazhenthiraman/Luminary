import React from 'react';
import { FaStar, FaUser, FaClock, FaCheckCircle } from 'react-icons/fa';
import { format } from 'date-fns';

export interface Review {
  id: number;
  rating: number;
  comment?: string | null;
  createdAt: string;
  isVerified?: boolean;
  reviewer: {
    id: number;
    firstName: string;
    lastName: string;
    profileImageUrl?: string | null;
  };
  child?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

interface ReviewDisplayProps {
  reviews: Review[];
  averageRating?: number;
  totalReviews?: number;
  currentUserId?: number | string;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: number) => void;
  showEditDelete?: boolean;
}

const ReviewDisplay: React.FC<ReviewDisplayProps> = ({
  reviews,
  averageRating = 0,
  totalReviews = 0,
  currentUserId,
  onEdit,
  onDelete,
  showEditDelete = false,
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Unknown date';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            } text-sm`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overall Rating Summary */}
      {totalReviews > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {averageRating.toFixed(1)}
              </h3>
              <div className="flex items-center mt-1">
                {renderStars(Math.round(averageRating))}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Rating Distribution</p>
                {/* Could add rating distribution bars here */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900">
            All Reviews ({totalReviews})
          </h3>
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Reviewer Info */}
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {review.reviewer.profileImageUrl ? (
                        <img
                          src={review.reviewer.profileImageUrl}
                          alt={review.reviewer.firstName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        getInitials(review.reviewer.firstName, review.reviewer.lastName)
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900">
                          {review.reviewer.firstName} {review.reviewer.lastName}
                        </h4>
                        {review.isVerified && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            <FaCheckCircle className="mr-1" />
                            Verified Parent
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Child Info (if available) */}
                  {review.child && (
                    <div className="ml-15 mb-3">
                      <p className="text-sm text-gray-600">
                        Review for: <span className="font-medium">{review.child.firstName} {review.child.lastName}</span>
                      </p>
                    </div>
                  )}

                  {/* Review Comment */}
                  {review.comment && (
                    <p className="text-gray-700 leading-relaxed mt-3">
                      {review.comment}
                    </p>
                  )}
                </div>

                {/* Edit/Delete Actions */}
                {showEditDelete && 
                 currentUserId && String(currentUserId) === String(review.reviewer.id) && 
                 (onEdit || onDelete) && (
                  <div className="flex items-center space-x-2 ml-4">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(review)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="Edit review"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(review.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Delete review"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaStar className="text-gray-400 text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Reviews Yet
          </h3>
          <p className="text-gray-600">
            Be the first to review this course!
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewDisplay;

