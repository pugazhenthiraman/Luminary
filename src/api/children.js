import axiosInstance from "./axiosInstance";

// Children API wrapper
// Base URL is configured in axiosInstance (defaults to /api/v1)
const childrenApi = {
  // Get all children for the authenticated parent
  // Supports: page, limit, search, sortBy, sortOrder
  getChildren: (params) => axiosInstance.get("/children", { params }),

  // Get a single child by ID
  getChildById: (childId) => axiosInstance.get(`/children/${childId}`),

  // Create a new child
  createChild: (data) => axiosInstance.post("/children", data),

  // Update existing child
  updateChild: (childId, data) =>
    axiosInstance.put(`/children/${childId}`, data),

  // Delete a child
  deleteChild: (childId) => axiosInstance.delete(`/children/${childId}`),

  // Get child's learning progress
  // period: 'week' | 'month' | 'year'
  getChildProgress: (childId, params) =>
    axiosInstance.get(`/children/${childId}/progress`, { params }),

  // Get child's course enrollments
  // Supports: status, page, limit
  getChildEnrollments: (childId, params) =>
    axiosInstance.get(`/children/${childId}/enrollments`, { params }),
};

export default childrenApi;
