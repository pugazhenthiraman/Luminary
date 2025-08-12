import axiosInstance from "./axiosInstance";

// Fetch coach details for parent view (admin endpoint - requires admin permissions)
export const getCoachDetailsAdmin = (coachId) =>
  axiosInstance.get(`/admin/coaches/${coachId}`);

// Fetch coach details for parent view (using courses endpoint)
export const getCoachDetails = (coachId) => {
  const id = parseInt(coachId, 10);
  if (isNaN(id) || id <= 0) {
    throw new Error(`Invalid coach ID: ${coachId}`);
  }
  
  // Get coach info from courses endpoint since /coaches/{id} doesn't exist
  return axiosInstance.get(`/courses`, { params: { coachId: id } })
    .then(response => {
      // Extract coach info from the first course
      const courses = response.data?.data?.courses || [];
      if (courses.length > 0 && courses[0].coach) {
        const coach = courses[0].coach;
        // Return in expected format
        return {
          ...response,
          data: {
            id: coach.id,
            name: coach.name,
            avatar: coach.avatar,
            rating: coach.rating,
            totalReviews: coach.totalReviews,
            // Add additional fields from courses
            courses: courses.map(c => c.title),
            totalCourses: courses.length
          }
        };
      } else {
        throw new Error('Coach not found');
      }
    });
};

// Fetch coach details by course ID for parent view
export const getCoachDetailsByCourse = (courseId) => {
  const id = parseInt(courseId, 10);
  if (isNaN(id) || id <= 0) {
    throw new Error(`Invalid course ID: ${courseId}`);
  }
  
  console.log(`[API] Attempting to fetch coach details for course ID: ${id}`);
  
  // Use the correct parent API endpoint to get coach details by course
  return axiosInstance.get(`/parent/coach/by-course/${id}`)
    .then(response => {
      console.log(`[API] Coach details API response for course ${id}:`, response.data);
      const coachData = response.data?.data || response.data;
      if (coachData && response.data.success) {
        // Return coach data in expected format
        return {
          ...response,
          data: {
            success: true,
            data: coachData
          }
        };
      } else {
        throw new Error('No coach data found for this course');
      }
    })
    .catch(error => {
      console.error(`[API] Error fetching coach details for course ${id}:`, {
        status: error.response?.status,
        statusCode: error.response?.data?.statusCode,
        message: error.response?.data?.message || error.message,
        fullError: error.response?.data
      });
      
      // If the specific API fails with 404, try to get course details and extract coach info
      const isNotFound = error.response?.status === 404 || 
                        error.response?.data?.statusCode === 404 ||
                        error.status === 404 ||
                        error.code === 'ERR_BAD_REQUEST' ||
                        error.message?.includes('404') ||
                        error.message?.includes('Not Found') ||
                        error.response?.data?.message?.includes('Coach not found') ||
                        error.response?.data?.message?.includes('not found');
      
      console.log(`[API] Is 404 error? ${isNotFound}`, {
        responseStatus: error.response?.status,
        dataStatusCode: error.response?.data?.statusCode,
        message: error.response?.data?.message
      });
      
      if (isNotFound) {
        console.log(`[API] Coach not found via parent API for course ${id}, trying course details fallback...`);
        return axiosInstance.get(`/courses/${id}`)
          .then(courseResponse => {
            console.log(`[API] Course details fallback response for course ${id}:`, courseResponse.data);
            const course = courseResponse.data?.data || courseResponse.data;
            if (course && course.coach) {
              console.log(`[API] Found coach data in course details for course ${id}:`, course.coach);
              return {
                data: {
                  success: true,
                  data: {
                    id: course.coach.id,
                    userId: course.coach.userId,
                    firstName: course.coach.firstName || course.coach.name?.split(' ')[0] || 'Coach',
                    lastName: course.coach.lastName || course.coach.name?.split(' ')[1] || '',
                    name: course.coach.name,
                    email: course.coach.email || '',
                    phone: course.coach.phone || '',
                    avatar: course.coach.avatar || null,
                    domain: course.coach.domain || course.coach.specialization || '',
                    experience: course.coach.experience || '0',
                    address: course.coach.address || '',
                    languages: course.coach.languages || ['English'],
                    hourlyRate: course.coach.hourlyRate || null,
                    rating: course.coach.rating || '0',
                    totalReviews: course.coach.totalReviews || 0,
                    courses: course.coach.courses || [{
                      id: course.id,
                      title: course.title,
                      category: course.category,
                      thumbnail: course.thumbnail
                    }]
                  }
                }
              };
            } else {
              console.error(`[API] No coach data found in course details for course ${id}`);
              throw new Error('Coach information not available for this course');
            }
          })
          .catch(fallbackError => {
            console.error(`[API] Fallback course details also failed for course ${id}:`, fallbackError.response?.data || fallbackError.message);
            throw new Error('Unable to retrieve coach information for this course');
          });
      }
      
      // If not a 404 error, throw the original error
      console.log(`[API] Not a 404 error, throwing original error for course ${id}`);
      throw error;
    });
};

// Debug function for testing (can be called from browser console)
if (typeof window !== 'undefined') {
  window.testCoachAPI = async (courseId) => {
    try {
      console.log(`Testing coach API for course ${courseId}...`);
      const result = await getCoachDetailsByCourse(courseId);
      console.log('✅ Success:', result);
      return result;
    } catch (error) {
      console.log('❌ Error:', error);
      throw error;
    }
  };
  
  // Test both APIs separately
  window.testAPIs = async (courseId) => {
    console.log(`\n=== Testing APIs for Course ${courseId} ===`);
    
    // Test parent coach API
    try {
      console.log('1. Testing Parent Coach API...');
      const response1 = await fetch(`http://localhost:5000/api/v1/parent/coach/by-course/${courseId}`);
      const data1 = await response1.json();
      console.log(`Parent Coach API (${response1.status}):`, data1);
    } catch (error) {
      console.log('Parent Coach API Error:', error);
    }
    
    // Test courses API
    try {
      console.log('2. Testing Courses API...');
      const response2 = await fetch(`http://localhost:5000/api/v1/courses/${courseId}`);
      const data2 = await response2.json();
      console.log(`Courses API (${response2.status}):`, data2);
      if (data2.data && data2.data.coach) {
        console.log('✅ Coach data found in courses API:', data2.data.coach);
      } else {
        console.log('❌ No coach data in courses API');
      }
    } catch (error) {
      console.log('Courses API Error:', error);
    }
    
    console.log('=== End Test ===\n');
  };
  
  // Simplified version of the coach API function for testing
  window.testCoachAPISimple = async (courseId) => {
    console.log(`\n=== Testing Simplified Coach API for Course ${courseId} ===`);
    
    try {
      // Step 1: Try parent coach API
      console.log('Step 1: Trying parent coach API...');
      const response = await axiosInstance.get(`/parent/coach/by-course/${courseId}`);
      console.log('✅ Parent coach API success:', response.data);
      return response;
    } catch (error) {
      console.log('❌ Parent coach API failed:', {
        status: error.response?.status,
        statusCode: error.response?.data?.statusCode,
        message: error.response?.data?.message,
        fullError: error.response?.data
      });
      
      // Step 2: Check if it's a 404 and try fallback
      const is404 = error.response?.status === 404 || error.response?.data?.statusCode === 404;
      console.log(`Is 404 error? ${is404}`);
      
      if (is404) {
        console.log('Step 2: Trying courses API fallback...');
        try {
          const fallbackResponse = await axiosInstance.get(`/courses/${courseId}`);
          console.log('✅ Courses API success:', fallbackResponse.data);
          
          const course = fallbackResponse.data?.data || fallbackResponse.data;
          if (course && course.coach) {
            console.log('✅ Found coach data in course:', course.coach);
            return {
              data: {
                success: true,
                data: course.coach
              }
            };
          } else {
            console.log('❌ No coach data in course');
            throw new Error('No coach data found in course');
          }
        } catch (fallbackError) {
          console.log('❌ Courses API also failed:', fallbackError);
          throw fallbackError;
        }
      } else {
        console.log('❌ Not a 404 error, throwing original error');
        throw error;
      }
    }
  };
}
