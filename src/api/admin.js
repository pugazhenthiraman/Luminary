import axiosInstance from "./axiosInstance";

// Dashboard
export const getDashboard = () => axiosInstance.get("/admin/dashboard");
export const getDashboardStats = () => axiosInstance.get("/admin/dashboard/stats");

// Coaches
export const getCoaches = (params = {}) => axiosInstance.get("/admin/coaches", { params });
export const getCoachDetails = (coachId) => axiosInstance.get(`/admin/coaches/${coachId}`);
export const approveCoach = (coachId, adminNotes) => axiosInstance.post(`/admin/coaches/${coachId}/approve`, { adminNotes });
export const rejectCoach = (coachId, rejectionReason, adminNotes) => axiosInstance.post(`/admin/coaches/${coachId}/reject`, { rejectionReason, adminNotes });
export const suspendCoach = (coachId, reason, adminNotes) => axiosInstance.post(`/admin/coaches/${coachId}/suspend`, { reason, adminNotes });
export const updateCoachNotes = (coachId, adminNotes) => axiosInstance.post(`/admin/coaches/${coachId}/notes`, { adminNotes });

// Courses
export const getCourses = (params = {}) => axiosInstance.get("/admin/courses", { params });
export const getCourseDetails = (courseId) => axiosInstance.get(`/admin/courses/${courseId}`);
export const approveCourse = (courseId, adminNotes) => axiosInstance.post(`/admin/courses/${courseId}/approve`, { adminNotes });
export const rejectCourse = (courseId, rejectionReason, adminNotes) => axiosInstance.post(`/admin/courses/${courseId}/reject`, { rejectionReason, adminNotes });

// Activities
export const getAdminActivities = (params = {}) => axiosInstance.get("/admin/activities", { params });

// Test Email
export const testAdminEmail = (email) => axiosInstance.post("/admin/test-email", { email });
