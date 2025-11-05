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
export const getEnrollments = () => {
  return axiosInstance.get('/children/enrollments/all')
    .then(response => {
      console.log('[Parent API] Enrollments response:', response.data);
      // Map backend response to frontend format
      const enrollments = response.data?.data?.enrollments || [];
      return {
        data: {
          success: true,
          data: enrollments,
          message: 'Enrollments retrieved successfully'
        }
      };
    })
    .catch(error => {
      console.error('[Parent API] Error fetching enrollments:', error);
      // Return empty array as fallback
      return {
        data: {
          success: true,
          data: [],
          message: 'No enrollments found'
        }
      };
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

// Change password
export const changePassword = (passwordData) => {
  return axiosInstance.post('/auth/change-password', passwordData)
    .then(response => {
      console.log('[Parent API] Password change response:', response.data);
      return response;
    })
    .catch(error => {
      console.error('[Parent API] Error changing password:', error);
      throw error;
    });
};
