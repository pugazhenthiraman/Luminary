import axiosInstance from "./axiosInstance";

// Payment API service
export const paymentAPI = {
  // Create a new payment
  createPayment: async (paymentData) => {
    try {
      const response = await axiosInstance.post("/payments", paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create a payment for credit package purchase
  createCreditPayment: async ({ packageId, paymentMethodId, description }) => {
    try {
      const response = await axiosInstance.post("/payments/credits", {
        packageId,
        paymentMethodId,
        description,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Confirm a payment
  confirmPayment: async (paymentId, paymentIntentId) => {
    try {
      const response = await axiosInstance.post(
        `/payments/${paymentId}/confirm`,
        {
          paymentIntentId,
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Cancel a payment
  cancelPayment: async (paymentId) => {
    try {
      const response = await axiosInstance.post(
        `/payments/${paymentId}/cancel`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get payment history
  getPayments: async (params = {}) => {
    try {
      const response = await axiosInstance.get("/payments", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get payment by ID
  getPaymentById: async (paymentId) => {
    try {
      const response = await axiosInstance.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create setup intent for saving payment methods
  createSetupIntent: async (customerId) => {
    try {
      const response = await axiosInstance.post("/payments/setup-intent", {
        customerId,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get saved payment methods
  getPaymentMethods: async () => {
    try {
      const response = await axiosInstance.get("/payments/payment-methods");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Remove payment method
  removePaymentMethod: async (paymentMethodId) => {
    try {
      const response = await axiosInstance.delete(
        `/payments/payment-methods/${paymentMethodId}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Process refund
  processRefund: async (paymentId, refundData) => {
    try {
      const response = await axiosInstance.post(
        `/payments/${paymentId}/refund`,
        refundData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Generate invoice
  generateInvoice: async (paymentId) => {
    try {
      const response = await axiosInstance.get(
        `/payments/invoice/${paymentId}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get payment analytics (Admin only)
  getPaymentAnalytics: async (params = {}) => {
    try {
      const response = await axiosInstance.get("/payments/analytics", {
        params,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default paymentAPI;
