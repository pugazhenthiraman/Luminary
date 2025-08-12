import React, { useState } from "react";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { FaCreditCard, FaLock, FaSpinner } from "react-icons/fa";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#424770",
      "::placeholder": {
        color: "#aab7c4",
      },
      padding: "12px",
    },
    invalid: {
      color: "#9e2146",
    },
  },
};

const StripePaymentForm = ({
  amount,
  currency = "USD",
  onSuccess,
  onError,
  loading = false,
  disabled = false,
  courseTitle = "",
  sessionId = null,
  courseId = null,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardholderName, setCardholderName] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || disabled || loading) {
      return;
    }

    setIsProcessing(true);
    setErrors({});

    const cardNumberElement = elements.getElement(CardNumberElement);

    if (!cardholderName.trim()) {
      setErrors({ cardholderName: "Cardholder name is required" });
      setIsProcessing(false);
      return;
    }

    try {
      // Create payment method
      const { error: paymentMethodError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardNumberElement,
          billing_details: {
            name: cardholderName.trim(),
          },
        });

      if (paymentMethodError) {
        setErrors({ payment: paymentMethodError.message });
        setIsProcessing(false);
        return;
      }

      // Call success callback with payment method
      await onSuccess({
        paymentMethodId: paymentMethod.id,
        cardholderName: cardholderName.trim(),
        amount,
        currency,
        courseId,
        sessionId,
        description: courseTitle
          ? `Payment for ${courseTitle}`
          : "Course payment",
      });
    } catch (error) {
      console.error("Payment error:", error);
      setErrors({
        payment: error.message || "Payment failed. Please try again.",
      });
      if (onError) {
        onError(error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardChange = (event) => {
    if (event.error) {
      setErrors({ card: event.error.message });
    } else {
      setErrors({ ...errors, card: null });
    }
  };

  const isFormDisabled = !stripe || disabled || loading || isProcessing;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Header */}
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-3">
          <FaCreditCard className="text-blue-600 text-xl" />
          <div>
            <h3 className="font-semibold text-gray-900">Secure Payment</h3>
            <p className="text-sm text-gray-600">Powered by Stripe</p>
          </div>
        </div>
        <FaLock className="text-blue-600 text-lg" />
      </div>

      {/* Payment Amount */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Amount:</span>
          <span className="text-2xl font-bold text-gray-900">
            {currency} ${amount?.toFixed(2)}
          </span>
        </div>
        {courseTitle && (
          <p className="text-sm text-gray-600 mt-1">for {courseTitle}</p>
        )}
      </div>

      {/* Cardholder Name */}
      <div>
        <label
          htmlFor="cardholderName"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Cardholder Name
        </label>
        <input
          id="cardholderName"
          type="text"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder="Enter cardholder name"
          disabled={isFormDisabled}
          className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            errors.cardholderName ? "border-red-500" : "border-gray-300"
          } ${isFormDisabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
        />
        {errors.cardholderName && (
          <p className="text-red-500 text-sm mt-1">{errors.cardholderName}</p>
        )}
      </div>

      {/* Card Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Number
        </label>
        <div
          className={`w-full px-3 py-3 border rounded-lg transition-colors ${
            errors.card ? "border-red-500" : "border-gray-300"
          } ${isFormDisabled ? "bg-gray-100" : "bg-white"}`}
        >
          <CardNumberElement
            options={CARD_ELEMENT_OPTIONS}
            onChange={handleCardChange}
            disabled={isFormDisabled}
          />
        </div>
        {errors.card && (
          <p className="text-red-500 text-sm mt-1">{errors.card}</p>
        )}
      </div>

      {/* Expiry and CVC */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiry Date
          </label>
          <div
            className={`w-full px-3 py-3 border rounded-lg transition-colors ${
              errors.card ? "border-red-500" : "border-gray-300"
            } ${isFormDisabled ? "bg-gray-100" : "bg-white"}`}
          >
            <CardExpiryElement
              options={CARD_ELEMENT_OPTIONS}
              disabled={isFormDisabled}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CVC
          </label>
          <div
            className={`w-full px-3 py-3 border rounded-lg transition-colors ${
              errors.card ? "border-red-500" : "border-gray-300"
            } ${isFormDisabled ? "bg-gray-100" : "bg-white"}`}
          >
            <CardCvcElement
              options={CARD_ELEMENT_OPTIONS}
              disabled={isFormDisabled}
            />
          </div>
        </div>
      </div>

      {/* General Payment Error */}
      {errors.payment && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{errors.payment}</p>
        </div>
      )}

      {/* Security Notice */}
      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <FaLock className="text-green-600 text-sm" />
          <p className="text-green-700 text-sm font-medium">
            Your payment is secure
          </p>
        </div>
        <p className="text-green-600 text-sm mt-1">
          We use industry-standard encryption to protect your payment
          information.
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isFormDisabled}
        className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 flex items-center justify-center gap-2 ${
          isFormDisabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl"
        }`}
      >
        {isProcessing ? (
          <>
            <FaSpinner className="animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <FaLock />
            Pay ${amount?.toFixed(2)}
          </>
        )}
      </button>
    </form>
  );
};

export default StripePaymentForm;
