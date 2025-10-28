import React, { useState, useEffect } from 'react';
import { FaStar, FaSpinner, FaTimes } from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from './Toast';

export interface ReviewFormData {
  rating: number;
  comment: string;
  childId?: string;
}

interface ReviewFormProps {
  courseId: string | number;
  children?: Array<{
    id: string;
    firstName: string;
    lastName: string;
  }>;
  onSubmit: (data: ReviewFormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: {
    rating: number;
    comment?: string;
    childId?: string;
  };
  existingReview?: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  courseId,
  children = [],
  onSubmit,
  onCancel,
  initialData,
  existingReview = false,
}) => {
  const [rating, setRating] = useState(initialData?.rating || 5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(initialData?.comment || '');
  const [selectedChildId, setSelectedChildId] = useState(initialData?.childId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setRating(initialData.rating);
      setComment(initialData.comment || '');
      setSelectedChildId(initialData.childId || '');
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating < 1 || rating > 5) {
      showErrorToast('Please select a rating');
      return;
    }

    if (comment.trim().length < 10) {
      showErrorToast('Please provide a more detailed comment (at least 10 characters)');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        rating,
        comment: comment.trim(),
        childId: selectedChildId || undefined,
      });
      showSuccessToast(
        existingReview
          ? 'Review updated successfully'
          : 'Review submitted successfully!'
      );
      
      // Reset form only if not editing
      if (!existingReview) {
        setRating(5);
        setComment('');
        setSelectedChildId('');
        if (onCancel) {
          onCancel();
        }
      }
    } catch (error: any) {
      showErrorToast(error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarInput = () => {
    return (
      <div className="flex items-center space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`transition-all duration-200 ${
              star <= rating || star <= hoveredRating
                ? 'text-yellow-400 scale-110'
                : 'text-gray-300'
            } hover:scale-125`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            disabled={isSubmitting}
          >
            <FaStar className="w-8 h-8 fill-current" />
          </button>
        ))}
        <span className="ml-3 text-gray-700 font-medium">
          {rating}/5 stars
        </span>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Your Rating *
        </label>
        {renderStarInput()}
      </div>

      {/* Child Selection (if children available) */}
      {children.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Which child is this review for?
          </label>
          <select
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          >
            <option value="">Select a child (optional)</option>
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.firstName} {child.lastName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Comment Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Review *
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={5}
          maxLength={1000}
          placeholder="Share your experience with this course. Be specific about what you liked or didn't like..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          disabled={isSubmitting}
          required
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500">
            Minimum 10 characters required
          </p>
          <p className="text-xs text-gray-500">
            {comment.length}/1000 characters
          </p>
        </div>
      </div>

      {/* Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 mb-2 font-medium">
          Review Guidelines:
        </p>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Be honest and constructive in your feedback</li>
          <li>• Share specific details about the course content and instructor</li>
          <li>• Focus on the learning experience rather than personal opinions</li>
          <li>• Help other parents make informed decisions</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || rating < 1 || comment.trim().length < 10}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>Submitting...</span>
            </>
          ) : existingReview ? (
            <span>Update Review</span>
          ) : (
            <span>Submit Review</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;

