import axiosInstance from "./axiosInstance";

// Login for all user types (parent, coach)
export const login = (data) => axiosInstance.post("/auth/login", data);

// Admin login - separate endpoint
export const adminLogin = (data) =>
  axiosInstance.post("/auth/admin/login", data);

// Registration for parent and coach
export const register = (data, userType = "parent") => {
  console.log("=== auth.js register DEBUG ===");
  console.log("userType received:", userType);
  console.log("data received:", data);

  if (userType === "coach") {
    console.log("Creating FormData for coach registration");
    const formData = new FormData();

    // Add non-file fields only
    Object.keys(data).forEach((key) => {
      if (key === "license" || key === "resume" || key === "video" || key === "idVerification") {
        return; // skip file fields here; append them explicitly below
      }
      if (data[key] === undefined || data[key] === null) {
        return; // skip null/undefined
      }
      if (key === "languages") {
        formData.append("languages", JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    });

    // Append file fields once if present
    if (data.license instanceof File) {
      formData.append("license", data.license);
    }
    if (data.resume instanceof File) {
      formData.append("resume", data.resume);
    }
    if (data.video instanceof File) {
      formData.append("video", data.video);
    }
    if (data.idVerification instanceof File) {
      formData.append("idVerification", data.idVerification);
    }

    console.log("Calling /auth/register/coach endpoint");
    console.log("=== END auth.js register DEBUG ===");
    return axiosInstance.post("/auth/register/coach", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
  console.log("Calling /auth/register/" + userType + " endpoint");
  console.log("=== END auth.js register DEBUG ===");
  // For parent registration, use JSON
  return axiosInstance.post(`/auth/register/${userType}`, data);
};

// Logout
export const logout = () => axiosInstance.post("/auth/logout");

// Refresh token
export const refreshToken = (refreshToken) =>
  axiosInstance.post("/auth/refresh", { refreshToken });

// Email verification (link-based)
export const verifyEmailToken = (token) =>
  axiosInstance.get(`/auth/verify-email/${encodeURIComponent(token)}`);

// Legacy/email-code verification endpoints (kept for existing flows)
export const verifyEmail = (token) =>
  axiosInstance.post("/auth/verify-email", { token });

// Forgot password
export const forgotPassword = (email) =>
  axiosInstance.post("/auth/forgot-password", { email });

// Reset password via token in URL
export const resetPasswordWithToken = (token, password) =>
  axiosInstance.post(`/auth/reset-password/${encodeURIComponent(token)}`, {
    password,
  });

// Verify current password using reset token
export const verifyCurrentPassword = (token, currentPassword) =>
  axiosInstance.post(
    `/auth/verify-current-password/${encodeURIComponent(token)}`,
    { currentPassword }
  );

// Check if candidate new password equals old password
export const checkNewPasswordSame = (token, password) =>
  axiosInstance.post(`/auth/check-new-password/${encodeURIComponent(token)}`, {
    password,
  });

// Legacy reset password that posts token in body (kept for compatibility)
export const resetPassword = (token, password) =>
  axiosInstance.post("/auth/reset-password", { token, password });
export const requestVerificationCode = (data) =>
  axiosInstance.post("/auth/request-verification-code", data);

export const verifyEmailWithCode = (data) =>
  axiosInstance.post("/auth/verify-email-code", data);

export const resendVerificationCode = (data) =>
  axiosInstance.post("/auth/resend-verification-code", data);

export const checkVerificationStatus = (email) =>
  axiosInstance.get(`/auth/verification-status/${encodeURIComponent(email)}`);

// Cancel registration and delete unverified user
export const cancelRegistration = (email, userType = "parent") =>
  axiosInstance.post("/auth/cancel-registration", { email, userType });

// Get current user profile
export const getProfile = () => axiosInstance.get("/auth/profile");

// List roles available for current user (by email)
export const getMyRoles = () => axiosInstance.get("/auth/me/roles");

// Secure role switch (requires password), returns new tokens and user
export const switchRole = (payload) => axiosInstance.post("/auth/switch-role", payload);

// Reapplication workflow
export const fetchReapplicationData = (token) =>
  axiosInstance.get(`/auth/reapply/${encodeURIComponent(token)}`);

export const resubmitApplication = (token, data) => {
  // If data is FormData (with files), send as multipart
  if (data instanceof FormData) {
    return axiosInstance.post(`/auth/reapply/${encodeURIComponent(token)}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
  // Otherwise send as JSON
  return axiosInstance.post(`/auth/reapply/${encodeURIComponent(token)}`, data);
};