import axiosInstance from './axiosInstance';

/**
 * Get reviews for a specific course
 * @param {string|number} courseId - Course ID
 * @param {Object} params - Query parameters (page, limit, sortBy, sortOrder)
 * @returns {Promise} Axios response
 */
export const getCourseReviews = (courseId, params = {}) => {
  return axiosInstance.get(`/reviews/course/${courseId}`, { params });
};

/**
 * Create a review for a course
 * @param {string|number} courseId - Course ID
 * @param {Object} reviewData - Review data (rating, comment, childId)
 * @returns {Promise} Axios response
 */
export const createCourseReview = (courseId, reviewData) => {
  return axiosInstance.post(`/reviews/course/${courseId}`, reviewData);
};

/**
 * Update own review
 * @param {string|number} reviewId - Review ID
 * @param {Object} reviewData - Updated review data
 * @returns {Promise} Axios response
 */
export const updateCourseReview = (reviewId, reviewData) => {
  return axiosInstance.put(`/reviews/${reviewId}`, reviewData);
};

/**
 * Delete own review
 * @param {string|number} reviewId - Review ID
 * @returns {Promise} Axios response
 */
export const deleteCourseReview = (reviewId) => {
  return axiosInstance.delete(`/reviews/${reviewId}`);
};

/**
 * Get all reviews by the current user
 * @param {Object} params - Query parameters (page, limit)
 * @returns {Promise} Axios response
 */
export const getMyReviews = (params = {}) => {
  return axiosInstance.get('/reviews/my', { params });
};

/**
 * Check if user can review a course (must be enrolled)
 * @param {string|number} courseId - Course ID
 * @returns {Promise} Axios response with canReview flag
 */
export const checkCanReview = (courseId) => {
  return axiosInstance.get(`/reviews/course/${courseId}/check`);
};

export default {
  getCourseReviews,
  createCourseReview,
  updateCourseReview,
  deleteCourseReview,
  getMyReviews,
  checkCanReview,
};



