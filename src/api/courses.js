import axiosInstance from "./axiosInstance";

export const getCourses = (params = {}) => {
  // Clean params - remove undefined values
  const cleanedParams = Object.keys(params).reduce((acc, key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      acc[key] = params[key];
    }
    return acc;
  }, {});
  
  return axiosInstance.get("/courses", { params: cleanedParams });
};

export const getCourseById = (courseId) => {
  const id = parseInt(courseId, 10);
  if (isNaN(id) || id <= 0) {
    throw new Error(`Invalid course ID: ${courseId}`);
  }
  console.log(`[API] getCourseById - Original ID: ${courseId}, Converted ID: ${id}, Type: ${typeof id}`);
  return axiosInstance.get(`/courses/${id}`);
};

// Update course
export const updateCourse = async (courseId, courseData) => {
  const id = parseInt(courseId, 10);
  if (isNaN(id) || id <= 0) {
    throw new Error(`Invalid course ID: ${courseId}`);
  }
  
  try {
    console.log(`[API] updateCourse - Original ID: ${courseId}, Converted ID: ${id}, Type: ${typeof id}`);
    console.log('[API] Update data being sent:', courseData);
    
    // Clean the data - remove any undefined values and ensure proper types
    const cleanedData = Object.keys(courseData).reduce((acc, key) => {
      const value = courseData[key];
      if (value !== undefined && value !== null) {
        // Convert numeric fields to numbers
        if (key === 'creditCost' || key === 'price') {
          acc[key] = Number(value);
        } else if (key === 'weeklySchedule' && Array.isArray(value)) {
          // Ensure weeklySchedule is properly formatted
          acc[key] = value;
        } else {
          acc[key] = value;
        }
      }
      return acc;
    }, {});
    
    console.log('[API] Cleaned data being sent:', cleanedData);
    
    const response = await axiosInstance.put(`/courses/${id}`, cleanedData);
    console.log('[API] Update response:', response);
    return response;
  } catch (error) {
    console.error(`[API] Update course ${id} failed:`, error);
    console.error('[API] Error response:', error.response?.data);
    
    // Log validation errors specifically
    if (error.response?.status === 422) {
      console.error('[API] Validation errors:', error.response.data);
    }
    
    throw error;
  }
};

// Delete course
export const deleteCourse = async (courseId) => {
  const id = parseInt(courseId, 10);
  if (isNaN(id) || id <= 0) {
    throw new Error(`Invalid course ID: ${courseId}`);
  }
  
  try {
    console.log(`[API] deleteCourse - Original ID: ${courseId}, Converted ID: ${id}, Type: ${typeof id}`);
    console.log(`[API] DELETE /courses/${id}`);
    console.log(`[API] Full URL will be: ${axiosInstance.defaults.baseURL}/courses/${id}`);
    
    // Add request interceptor for this specific call to see what's actually sent
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        console.log('[API] Actual request config:', {
          method: config.method,
          url: config.url,
          baseURL: config.baseURL,
          fullURL: `${config.baseURL}${config.url}`,
          params: config.params,
          data: config.data
        });
        return config;
      },
      (error) => {
        console.error('[API] Request interceptor error:', error);
        return Promise.reject(error);
      }
    );
    
    // Try the standard DELETE request first
    let response;
    try {
      response = await axiosInstance.delete(`/courses/${id}`);
    } catch (deleteError) {
      console.log('[API] Standard DELETE failed, trying with request body...');
      
      // If that fails, try sending the ID in the request body as well
      // Some backends might expect the ID in the body for validation
      response = await axiosInstance.delete(`/courses/${id}`, {
        data: { id: id }
      });
    }
    
    // Remove the interceptor
    axiosInstance.interceptors.request.eject(requestInterceptor);
    
    console.log('[API] Delete response:', response);
    return response;
  } catch (error) {
    console.error(`[API] Delete course ${id} failed:`, error);
    console.error('[API] Error response:', error.response?.data);
    
    // Re-throw with additional context
    if (error.response?.status === 500) {
      console.error('[API] Server error - check backend logs');
      console.error('[API] The backend is still receiving string ID instead of integer');
      console.error('[API] This suggests the backend route parameter parsing needs to be fixed');
    }
    
    throw error;
  }
};

// Convenience helper for fetching courses by coach
export const getCoursesByCoach = (coachId) => {
  const id = parseInt(coachId, 10);
  if (isNaN(id) || id <= 0) {
    throw new Error(`Invalid coach ID: ${coachId}`);
  }
  return axiosInstance.get("/courses", { params: { coachId: id } });
};

// Alias for clarity when importing in UI
export const getCourseDetails = getCourseById;
