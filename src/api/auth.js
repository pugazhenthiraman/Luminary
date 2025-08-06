import axiosInstance from "./axiosInstance";

// Login for all user types (parent, coach)
export const login = (data) => axiosInstance.post("/auth/login", data);

// Admin login - separate endpoint
export const adminLogin = (data) => axiosInstance.post("/auth/admin/login", data);

// Registration for parent and coach
export const register = (data, userType = "parent") => {
  console.log('=== auth.js register DEBUG ===');
  console.log('userType received:', userType);
  console.log('data received:', data);
  
  if (userType === "coach") {
    console.log('Creating FormData for coach registration');
    const formData = new FormData();
    
    // Add all text fields
    Object.keys(data).forEach(key => {
      if (key === 'languages') {
        // Handle languages array - send as JSON string for backend to parse
        formData.append('languages', JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    });
    
    // Add files if they exist
    if (data.license) {
      formData.append('license', data.license);
    }
    if (data.resume) {
      formData.append('resume', data.resume);
    }
    if (data.video) {
      formData.append('video', data.video);
    }
    console.log('Calling /auth/register/coach endpoint');
    console.log('=== END auth.js register DEBUG ===');
    return axiosInstance.post("/auth/register/coach", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
  console.log('Calling /auth/register/' + userType + ' endpoint');
  console.log('=== END auth.js register DEBUG ===');
  // For parent registration, use JSON
  return axiosInstance.post(`/auth/register/${userType}`, data);
};

// Logout
export const logout = () => axiosInstance.post("/auth/logout");

// Refresh token
export const refreshToken = (refreshToken) => 
  axiosInstance.post("/auth/refresh", { refreshToken });

// Email verification
export const verifyEmail = (token) => 
  axiosInstance.post("/auth/verify-email", { token });

// Forgot password
export const forgotPassword = (email) => 
  axiosInstance.post("/auth/forgot-password", { email });

// Reset password
export const resetPassword = (token, password) => 
  axiosInstance.post("/auth/reset-password", { token, password });
