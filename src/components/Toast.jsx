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
    minHeight: "auto",
    padding: "12px 16px",
    margin: "8px",
    maxWidth: "350px",
    width: "auto",
  },
  progressStyle: {
    background: "linear-gradient(90deg, #3b82f6, #1d4ed8)",
  },
};

// Mobile-responsive toast configuration
const getMobileToastConfig = () => {
  const isMobile = window.innerWidth <= 768;

  return {
    ...toastConfig,
    position: isMobile ? "top-right" : "top-right",
    toastStyle: {
      ...toastConfig.toastStyle,
      fontSize: isMobile ? "13px" : "14px",
      padding: isMobile ? "10px 14px" : "12px 16px",
      margin: isMobile ? "6px 12px" : "8px",
      maxWidth: isMobile ? "280px" : "350px",
      width: isMobile ? "280px" : "auto",
      borderRadius: isMobile ? "8px" : "12px",
      minHeight: isMobile ? "auto" : "auto",
    },
  };
};

// Toast Container Component
export const ToastContainerComponent = () => {
  return (
    <ToastContainer
      {...getMobileToastConfig()}
      className="!z-[9999]"
      toastClassName="!font-sans"
      bodyClassName="!font-sans"
      closeButton={({ closeToast }) => (
        <button
          onClick={closeToast}
          className="!text-gray-400 hover:!text-gray-600 transition-colors duration-200 !p-1 hover:!bg-gray-100 !rounded-full"
          aria-label="Close notification"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    />
  );
};

// Individual toast functions
export const showSuccessToast = (message) => {
  const config = getMobileToastConfig();
  toast.success(message, {
    ...config,
    toastStyle: {
      ...config.toastStyle,
      border: "1px solid rgba(34, 197, 94, 0.2)",
      background: "rgba(255, 255, 255, 0.98)",
    },
    progressStyle: {
      background: "linear-gradient(90deg, #22c55e, #16a34a)",
    },
    icon: ({ theme, type }) => (
      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
        <svg
          className="w-3 h-3 text-green-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    ),
  });
};

export const showErrorToast = (message) => {
  const config = getMobileToastConfig();
  toast.error(message, {
    ...config,
    toastStyle: {
      ...config.toastStyle,
      border: "1px solid rgba(239, 68, 68, 0.2)",
      background: "rgba(255, 255, 255, 0.98)",
    },
    progressStyle: {
      background: "linear-gradient(90deg, #ef4444, #dc2626)",
    },
    icon: ({ theme, type }) => (
      <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
        <svg
          className="w-3 h-3 text-red-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    ),
  });
};

export const showWarningToast = (message) => {
  const config = getMobileToastConfig();
  toast.warning(message, {
    ...config,
    toastStyle: {
      ...config.toastStyle,
      border: "1px solid rgba(245, 158, 11, 0.2)",
      background: "rgba(255, 255, 255, 0.98)",
    },
    progressStyle: {
      background: "linear-gradient(90deg, #f59e0b, #d97706)",
    },
    icon: ({ theme, type }) => (
      <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center">
        <svg
          className="w-3 h-3 text-yellow-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    ),
  });
};

export const showInfoToast = (message) => {
  const config = getMobileToastConfig();
  toast.info(message, {
    ...config,
    toastStyle: {
      ...config.toastStyle,
      border: "1px solid rgba(59, 130, 246, 0.2)",
      background: "rgba(255, 255, 255, 0.98)",
    },
    progressStyle: {
      background: "linear-gradient(90deg, #3b82f6, #1d4ed8)",
    },
    icon: ({ theme, type }) => (
      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
        <svg
          className="w-3 h-3 text-blue-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    ),
  });
};
