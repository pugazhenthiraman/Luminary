import axiosInstance from './axiosInstance';

// Get parent's children
export const getChildren = () => {
  return axiosInstance.get('/parent/children')
    .then(response => {
      console.log('[Parent API] Children response:', response.data);
      return response;
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
  return axiosInstance.get('/parent/enrollments')
    .then(response => {
      console.log('[Parent API] Enrollments response:', response.data);
      return response;
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
  return axiosInstance.get('/parent/sessions/upcoming')
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
  return axiosInstance.get('/parent/schedule')
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
export const enrollInCourse = (enrollmentData) => {
  return axiosInstance.post('/parent/enroll', enrollmentData)
    .then(response => {
      console.log('[Parent API] Enrollment response:', response.data);
      return response;
    })
    .catch(error => {
      console.error('[Parent API] Error enrolling in course:', error);
      throw error;
    });
};

// Get parent profile
export const getParentProfile = () => {
  return axiosInstance.get('/parent/profile')
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
  return axiosInstance.put('/parent/profile', profileData)
    .then(response => {
      console.log('[Parent API] Profile update response:', response.data);
      return response;
    })
    .catch(error => {
      console.error('[Parent API] Error updating profile:', error);
      throw error;
    });
};
