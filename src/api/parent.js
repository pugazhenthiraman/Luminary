import axiosInstance from './axiosInstance';

// Get parent's children
export const getChildren = () => {
  return axiosInstance.get('/children')
    .then(response => {
      console.log('[Parent API] Children response:', response.data);
      // Extract children array from the nested data structure
      const childrenData = response.data?.data?.children || [];
      return {
        data: {
          success: true,
          data: childrenData,
          message: 'Children retrieved successfully'
        }
      };
    })
    .catch(error => {
      console.error('[Parent API] Error fetching children:', error);
      // Return empty array as fallback
      return {
        data: {
          success: true,
          data: [],
          message: 'No children found'
        }
      };
    });
};

// Get parent's enrollments
// TODO: This endpoint needs to be implemented in the backend
// For now, returning empty array as placeholder
export const getEnrollments = () => {
  console.log('[Parent API] getEnrollments called - endpoint not yet implemented');
  return Promise.resolve({
    data: {
      success: true,
      data: [],
      message: 'Enrollments feature coming soon'
    }
  });
};

// Get parent's upcoming sessions
export const getUpcomingSessions = () => {
  return axiosInstance.get('/sessions/upcoming')
    .then(response => {
      console.log('[Parent API] Upcoming sessions response:', response.data);
      return response;
    })
    .catch(error => {
      console.error('[Parent API] Error fetching upcoming sessions:', error);
      // Return empty array as fallback
      return {
        data: {
          success: true,
          data: [],
          message: 'No upcoming sessions found'
        }
      };
    });
};

// Get parent's schedule
export const getSchedule = () => {
  return axiosInstance.get('/sessions/calendar')
    .then(response => {
      console.log('[Parent API] Schedule response:', response.data);
      return response;
    })
    .catch(error => {
      console.error('[Parent API] Error fetching schedule:', error);
      // Return empty array as fallback
      return {
        data: {
          success: true,
          data: [],
          message: 'No schedule found'
        }
      };
    });
};

// Enroll child in a course
// TODO: This endpoint needs to be implemented in the backend
export const enrollInCourse = (enrollmentData) => {
  console.log('[Parent API] enrollInCourse called with:', enrollmentData);
  console.warn('[Parent API] Enrollment endpoint not yet implemented in backend');
  return Promise.reject(new Error('Enrollment feature is not yet available. Please contact support.'));
};

// Get parent profile
export const getParentProfile = () => {
  return axiosInstance.get('/auth/profile')
    .then(response => {
      console.log('[Parent API] Profile response:', response.data);
      return response;
    })
    .catch(error => {
      console.error('[Parent API] Error fetching profile:', error);
      throw error;
    });
};

// Update parent profile
// TODO: Check if auth/profile supports PUT for updates
export const updateParentProfile = (profileData) => {
  return axiosInstance.put('/auth/profile', profileData)
    .then(response => {
      console.log('[Parent API] Profile update response:', response.data);
      return response;
    })
    .catch(error => {
      console.error('[Parent API] Error updating profile:', error);
      throw error;
    });
};
