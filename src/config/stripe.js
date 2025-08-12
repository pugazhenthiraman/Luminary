import { loadStripe } from "@stripe/stripe-js";
import axiosInstance from "../api/axiosInstance";

// Get Stripe publishable key from environment or backend
let stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Function to get Stripe config from backend
export const getStripeConfig = async () => {
  try {
    const response = await axiosInstance.get("/payments/config");
    if (response.data.success) {
      stripePublishableKey = response.data.data.publishableKey;
    }
  } catch {
    console.warn(
      "Failed to fetch Stripe config from backend, using environment variable"
    );
  }
  return stripePublishableKey;
};

// Initialize Stripe with publishable key
if (!stripePublishableKey) {
  console.error(
    "Stripe publishable key is not configured. Please add VITE_STRIPE_PUBLISHABLE_KEY to your .env file or configure it in the backend."
  );
}

// Create Stripe instance
export const stripePromise = loadStripe(stripePublishableKey);

// Stripe configuration
export const stripeConfig = {
  appearance: {
    theme: "stripe",
    variables: {
      colorPrimary: "#3b82f6",
      colorBackground: "#ffffff",
      colorText: "#1f2937",
      colorDanger: "#ef4444",
      fontFamily: "Inter, system-ui, sans-serif",
      spacingUnit: "4px",
      borderRadius: "8px",
    },
    rules: {
      ".Input": {
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        padding: "12px",
        fontSize: "16px",
      },
      ".Input:focus": {
        border: "2px solid #3b82f6",
        boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
      },
      ".Label": {
        fontSize: "14px",
        fontWeight: "500",
        color: "#374151",
        marginBottom: "6px",
      },
    },
  },
};

export default stripePromise;
