import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Custom toast configuration
const toastConfig = {
  position: "top-right",
  autoClose: 1500,
  hideProgressBar: false,
  newestOnTop: false,
  closeOnClick: true,
  rtl: false,
  pauseOnFocusLoss: true,
  draggable: true,
  pauseOnHover: true,
  theme: "light",
  toastStyle: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(0, 0, 0, 0.1)",
    borderRadius: "12px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
    fontSize: "14px",
    fontWeight: "500",
  },
  progressStyle: {
    background: "linear-gradient(90deg, #3b82f6, #1d4ed8)",
  },
};

// Toast Container Component
export const ToastContainerComponent = () => {
  return <ToastContainer {...toastConfig} />;
};

// Individual toast functions
export const showSuccessToast = (message) => {
  toast.success(message, {
    ...toastConfig,
    toastStyle: {
      ...toastConfig.toastStyle,
      border: "1px solid rgba(34, 197, 94, 0.2)",
      background: "rgba(255, 255, 255, 0.98)",
    },
    progressStyle: {
      background: "linear-gradient(90deg, #22c55e, #16a34a)",
    },
  });
};

export const showErrorToast = (message) => {
  toast.error(message, {
    ...toastConfig,
    toastStyle: {
      ...toastConfig.toastStyle,
      border: "1px solid rgba(239, 68, 68, 0.2)",
      background: "rgba(255, 255, 255, 0.98)",
    },
    progressStyle: {
      background: "linear-gradient(90deg, #ef4444, #dc2626)",
    },
  });
};

export const showWarningToast = (message) => {
  toast.warning(message, {
    ...toastConfig,
    toastStyle: {
      ...toastConfig.toastStyle,
      border: "1px solid rgba(245, 158, 11, 0.2)",
      background: "rgba(255, 255, 255, 0.98)",
    },
    progressStyle: {
      background: "linear-gradient(90deg, #f59e0b, #d97706)",
    },
  });
};
