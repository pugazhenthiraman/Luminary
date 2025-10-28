import api from "./axiosInstance";

// Credits API client: balance and course enrollment via credits
const creditsApi = {
  getBalance: async (userId) => {
    const res = await api.get(`/credits/balance/${userId}`, {
      _noLogoutOn401: true,
      _noBlockOn403: true,
    });
    return res?.data?.data || res?.data; // ApiResponse wrapper
  },

  getPackages: async (isActive = undefined) => {
    const params = {};
    // Only add isActive param if it's explicitly provided (true or false)
    if (isActive !== undefined) {
      params.isActive = isActive;
    }
    const res = await api.get(`/credits/packages`, {
      params,
      _noLogoutOn401: true,
      _noBlockOn403: true,
    });
    return res?.data?.data || res?.data;
  },

  enrollWithCredits: async (userId, { courseId, childrenIds }) => {
    const res = await api.post(
      `/credits/enroll/${userId}`,
      {
        courseId,
        childrenIds,
      },
      { _noLogoutOn401: true }
    );
    return res?.data; // { success, data: { enrollments, creditBalance, transaction, totalCreditCost } }
  },

  getPurchases: async (userId) => {
    const res = await api.get(`/credits/purchases/${userId}`, {
      _noLogoutOn401: true,
      _noBlockOn403: true,
    });
    return res?.data?.data || res?.data;
  },

  // Admin functions for managing credit packages
  createPackage: async (packageData) => {
    const res = await api.post(`/credits/packages`, packageData);
    return res?.data;
  },

  updatePackage: async (packageId, packageData) => {
    const res = await api.put(`/credits/packages/${packageId}`, packageData);
    return res?.data;
  },

  deletePackage: async (packageId) => {
    const res = await api.delete(`/credits/packages/${packageId}`);
    return res?.data;
  },

  getTransactions: async (userId, params = {}) => {
    const res = await api.get(`/credits/transactions/${userId}`, {
      params,
      _noLogoutOn401: true,
      _noBlockOn403: true,
    });
    return res?.data?.data || res?.data;
  },
};

export default creditsApi;
