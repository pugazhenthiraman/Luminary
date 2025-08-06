import axiosInstance from "./axiosInstance";

export const getAdminStats = () => axiosInstance.get("/admin/dashboard/stats");
export const getAllCoaches = () => axiosInstance.get("/admin/coaches");
export const getCoachById = (coachId) =>
  axiosInstance.get(`/admin/coaches/${coachId}`);
export const approveCoach = (coachId) =>
  axiosInstance.post(`/admin/coaches/${coachId}/approve`);
export const rejectCoach = (coachId, reason) =>
  axiosInstance.post(`/admin/coaches/${coachId}/reject`, { reason });
export const suspendCoach = (coachId) =>
  axiosInstance.post(`/admin/coaches/${coachId}/suspend`);
export const reactivateCoach = (coachId) =>
  axiosInstance.post(`/admin/coaches/${coachId}/reactivate`);
export const updateCoachNotes = (coachId, notes) =>
  axiosInstance.put(`/admin/coaches/${coachId}/notes`, { notes });
