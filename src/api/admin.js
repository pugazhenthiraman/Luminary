import axiosInstance from "./axiosInstance";

// Dashboard
export const getDashboard = () => axiosInstance.get("/admin/dashboard");
export const getDashboardStats = () =>
  axiosInstance.get("/admin/dashboard/stats");

// Coaches
export const getCoaches = (params = {}, config = {}) =>
  axiosInstance.get("/admin/coaches", { params, ...config });
export const getCoachDetails = (coachId, config = {}) =>
  axiosInstance.get(`/admin/coaches/${coachId}`, { ...config });
export const approveCoach = (coachId, adminNotes, config = {}) =>
  axiosInstance.post(
    `/admin/coaches/${coachId}/approve`,
    { adminNotes },
    config
  );
export const rejectCoach = (
  coachId,
  rejectionReason,
  adminNotes,
  config = {}
) =>
  axiosInstance.post(
    `/admin/coaches/${coachId}/reject`,
    {
      rejectionReason,
      adminNotes,
    },
    config
  );
export const suspendCoach = (coachId, reason, adminNotes, config = {}) =>
  axiosInstance.post(
    `/admin/coaches/${coachId}/suspend`,
    {
      reason,
      adminNotes,
    },
    config
  );
export const reactivateCoach = (coachId, adminNotes, config = {}) =>
  axiosInstance.post(
    `/admin/coaches/${coachId}/reactivate`,
    { adminNotes },
    config
  );
export const updateCoachNotes = (coachId, adminNotes, config = {}) =>
  axiosInstance.put(`/admin/coaches/${coachId}/notes`, { adminNotes }, config);
export const deactivateApprovedCoach = (coachId, config = {}) =>
  axiosInstance.post(`/admin/coaches/${coachId}/deactivate`, undefined, config);
export const activateRejectedCoach = (coachId, config = {}) =>
  axiosInstance.post(
    `/admin/coaches/${coachId}/activate-from-rejected`,
    undefined,
    config
  );

export const freezePendingCoach = (coachId, config = {}) =>
  axiosInstance.post(`/admin/coaches/${coachId}/freeze`, undefined, config);
export const unfreezePendingCoach = (coachId, config = {}) =>
  axiosInstance.post(`/admin/coaches/${coachId}/unfreeze`, undefined, config);

// Courses
export const getCourses = (params = {}, config = {}) =>
  axiosInstance.get("/admin/courses", { params, ...config });
export const getCourseDetails = (courseId, config = {}) =>
  axiosInstance.get(`/admin/courses/${courseId}`, { ...config });
export const approveCourse = (courseId, adminNotes, config = {}) =>
  axiosInstance.post(
    `/admin/courses/${courseId}/approve`,
    { adminNotes },
    config
  );
export const rejectCourse = (
  courseId,
  rejectionReason,
  adminNotes,
  config = {}
) =>
  axiosInstance.post(
    `/admin/courses/${courseId}/reject`,
    {
      rejectionReason,
      adminNotes,
    },
    config
  );
export const deactivateCourse = (courseId, reason, config = {}) =>
  axiosInstance.post(
    `/admin/courses/${courseId}/deactivate`,
    { reason },
    config
  );
export const activateCourseFromRejected = (courseId, config = {}) =>
  axiosInstance.post(
    `/admin/courses/${courseId}/activate-from-rejected`,
    undefined,
    config
  );
export const activateDeactivatedCourse = (courseId, reason, config = {}) =>
  axiosInstance.post(
    `/admin/courses/${courseId}/activate-deactivated`,
    {
      reason,
    },
    config
  );
export const freezePendingCourse = (courseId, config = {}) =>
  axiosInstance.post(`/admin/courses/${courseId}/freeze`, undefined, config);
export const unfreezePendingCourse = (courseId, config = {}) =>
  axiosInstance.post(`/admin/courses/${courseId}/unfreeze`, undefined, config);

// Activities
export const getAdminActivities = (params = {}, config = {}) =>
  axiosInstance.get("/admin/activities", { params, ...config });

// Test Email
export const testAdminEmail = (email, config = {}) =>
  axiosInstance.post("/admin/test-email", { email }, config);
