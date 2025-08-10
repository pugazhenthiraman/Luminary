import axiosInstance from "./axiosInstance";

export const getCourses = (params = {}) =>
  axiosInstance.get("/courses", { params });
export const getCourseById = (courseId) =>
  axiosInstance.get(`/courses/${courseId}`);

// Convenience helper for fetching courses by coach
export const getCoursesByCoach = (coachId) =>
  axiosInstance.get("/courses", { params: { coachId } });

// Alias for clarity when importing in UI
export const getCourseDetails = getCourseById;
