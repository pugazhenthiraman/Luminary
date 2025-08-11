import axiosInstance from "./axiosInstance";

// Fetch coach details for parent view
export const getCoachDetails = (coachId) =>
  axiosInstance.get(`/admin/coaches/${coachId}`);
