import React, { useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise, stripeConfig } from "../config/stripe";
import StripePaymentForm from "./StripePaymentForm";
import { paymentAPI } from "../api/payment";
import { FaTimes, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

const PaymentModal = ({
  isOpen,
  onClose,
  course,
  selectedChildren = [],
  totalAmount,
  onSuccess,
  onError,
}) => {
  const [paymentStep, setPaymentStep] = useState("payment"); // 'payment', 'processing', 'success', 'error'
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handlePaymentSuccess = async (paymentFormData) => {
    setPaymentStep("processing");
    setError(null);

    try {
      // Create payment with backend
      const paymentResponse = await paymentAPI.createPayment({
        courseId: Number(course.id),
        sessionId: null, // Will be set when session is created
        amount: totalAmount,
        currency: "USD",
        paymentMethodId: paymentFormData.paymentMethodId,
        description: paymentFormData.description,
        metadata: {
          selectedChildren: selectedChildren.map((child) => child.id),
          courseTitle: course.title,
          cardholderName: paymentFormData.cardholderName,
        },
      });

      if (paymentResponse.success) {
        // Confirm payment with Stripe
        const confirmResponse = await paymentAPI.confirmPayment(
          paymentResponse.data.paymentId,
          paymentResponse.data.paymentIntentId
        );

        if (confirmResponse.success) {
          setPaymentData({
            paymentId: paymentResponse.data.paymentId,
            paymentIntentId: paymentResponse.data.paymentIntentId,
            amount: totalAmount,
            course: course,
            children: selectedChildren,
          });
          setPaymentStep("success");

          // Call success callback
          if (onSuccess) {
            onSuccess({
              paymentId: paymentResponse.data.paymentId,
              course,
              children: selectedChildren,
              amount: totalAmount,
            });
          }
        } else {
          throw new Error(
            confirmResponse.message || "Payment confirmation failed"
          );
        }
      } else {
        throw new Error(paymentResponse.message || "Payment creation failed");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "Payment failed. Please try again.");
      setPaymentStep("error");

      if (onError) {
        onError(err);
      }
    }
  };

  const handleClose = () => {
    if (paymentStep === "processing") {
      return; // Don't allow closing during processing
    }

    setPaymentStep("payment");
    setPaymentData(null);
    setError(null);
    onClose();
  };

  const handleRetry = () => {
    setPaymentStep("payment");
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {paymentStep === "payment" && "Complete Payment"}
            {paymentStep === "processing" && "Processing Payment"}
            {paymentStep === "success" && "Payment Successful"}
            {paymentStep === "error" && "Payment Failed"}
          </h2>
          {paymentStep !== "processing" && (
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Payment Step */}
          {paymentStep === "payment" && (
            <div>
              {/* Course Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {course.description}
                </p>

                {selectedChildren.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Enrolling {selectedChildren.length} child
                      {selectedChildren.length > 1 ? "ren" : ""}:
                    </p>
                    <ul className="text-sm text-gray-600">
                      {selectedChildren.map((child, index) => (
                        <li key={index}>
                          • {child.firstName} {child.lastName}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Stripe Payment Form */}
              <Elements stripe={stripePromise} options={stripeConfig}>
                <StripePaymentForm
                  amount={totalAmount}
                  currency="USD"
                  courseTitle={course.title}
                  courseId={course.id}
                  onSuccess={handlePaymentSuccess}
                  onError={(err) => {
                    setError(err.message || "Payment failed");
                    setPaymentStep("error");
                  }}
                />
              </Elements>
            </div>
          )}

          {/* Processing Step */}
          {paymentStep === "processing" && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Processing Payment
              </h3>
              <p className="text-gray-600">
                Please wait while we process your payment...
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Do not close this window
              </p>
            </div>
          )}

          {/* Success Step */}
          {paymentStep === "success" && paymentData && (
            <div className="text-center py-8">
              <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Payment Successful!
              </h3>
              <p className="text-gray-600 mb-4">
                Your payment of ${paymentData.amount.toFixed(2)} has been
                processed successfully.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-700">
                  <strong>Course:</strong> {paymentData.course.title}
                </p>
                <p className="text-sm text-green-700">
                  <strong>Payment ID:</strong> {paymentData.paymentId}
                </p>
                {paymentData.children.length > 0 && (
                  <p className="text-sm text-green-700">
                    <strong>Enrolled:</strong>{" "}
                    {paymentData.children
                      .map((c) => `${c.firstName} ${c.lastName}`)
                      .join(", ")}
                  </p>
                )}
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Continue
              </button>
            </div>
          )}

          {/* Error Step */}
          {paymentStep === "error" && (
            <div className="text-center py-8">
              <FaExclamationTriangle className="text-red-500 text-6xl mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Payment Failed
              </h3>
              <p className="text-gray-600 mb-4">
                {error ||
                  "Something went wrong with your payment. Please try again."}
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleRetry}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Try Again
                </button>
                <button
                  onClick={handleClose}
                  className="w-full py-3 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
