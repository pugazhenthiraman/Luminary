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
};

export default creditsApi;
