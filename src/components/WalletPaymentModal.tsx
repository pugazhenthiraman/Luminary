import React, { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise, stripeConfig } from '../config/stripe';
import StripePaymentForm from './StripePaymentForm';
import { paymentAPI } from '../api/payment';
import { FaTimes, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

type WalletPaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  plan: { id: string; name: string; price: number; credits: number } | null;
  onSuccess?: (payload: { creditsAdded: number; planId: string; planName: string }) => void;
};

const WalletPaymentModal: React.FC<WalletPaymentModalProps> = ({ isOpen, onClose, plan, onSuccess }) => {
  const [step, setStep] = useState<'payment' | 'processing' | 'success' | 'error'>('payment');
  const [error, setError] = useState<string | null>(null);
  const [paidAmount, setPaidAmount] = useState<number>(0);

  if (!isOpen || !plan) return null;

  const handlePaymentSuccess = async (paymentFormData: any) => {
    setStep('processing');
    setError(null);

    try {
      // Step 1: Create PaymentIntent on backend (gets client_secret)
      const paymentResp = await paymentAPI.createCreditPayment({
        packageId: plan.id,
        paymentMethodId: paymentFormData.paymentMethodId,
        description: `Purchase credits: ${plan.name}`,
      });

      if (!paymentResp?.success) {
        throw new Error(paymentResp?.message || 'Failed to create payment');
      }

      const clientSecret = paymentResp.data.clientSecret;
      const paymentIntentId = paymentResp.data.paymentIntentId;

      console.log('💳 Got client_secret from backend:', clientSecret);

      // Step 2: Confirm payment on client-side (handles 3D Secure)
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentFormData.paymentMethodId,
      });

      if (confirmError) {
        console.error('❌ Payment confirmation error:', confirmError);
        throw new Error(confirmError.message || 'Payment confirmation failed');
      }

      console.log('✅ Payment confirmed with status:', paymentIntent?.status);

      // Step 3: Notify backend that payment succeeded
      if (paymentIntent?.status === 'succeeded') {
        // Update backend with successful payment
        try {
          await paymentAPI.confirmPayment(paymentResp.data.paymentId, paymentIntentId);
          
          setPaidAmount(plan.price);
          onSuccess?.({ creditsAdded: plan.credits, planId: plan.id, planName: plan.name });
          setStep('success');
        } catch (backendError: any) {
          console.error('❌ Backend confirmation error:', backendError);
          // Even if backend fails, payment succeeded - show success but log error
          setPaidAmount(plan.price);
          onSuccess?.({ creditsAdded: plan.credits, planId: plan.id, planName: plan.name });
          setStep('success');
        }
      } else if (paymentIntent?.status === 'requires_action') {
        // This shouldn't happen if confirmCardPayment completes
        throw new Error('Additional authentication required. Please try again.');
      } else {
        throw new Error(`Payment status: ${paymentIntent?.status}`);
      }
    } catch (err: any) {
      console.error('❌ Payment error:', err);
      setError(err?.message || 'Payment failed. Please try again.');
      setStep('error');
    }
  };

  const handleClose = () => {
    if (step === 'processing') return;
    setStep('payment');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold text-gray-900">
            {step === 'payment' && `Buy ${plan.name} Plan`}
            {step === 'processing' && 'Processing Payment'}
            {step === 'success' && 'Payment Successful'}
            {step === 'error' && 'Payment Failed'}
          </h2>
          {step !== 'processing' && (
            <button onClick={handleClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100" aria-label="Close payment modal" title="Close">
              <FaTimes />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {step === 'payment' && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">Plan</div>
                    <div className="text-base font-semibold text-gray-900">{plan.name}</div>
                    <div className="text-xs text-gray-500">Includes {plan.credits} credits</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Amount</div>
                    <div className="text-xl font-bold text-gray-900">$ {plan.price.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              <Elements stripe={stripePromise} options={stripeConfig as any}>
                <StripePaymentForm
                  amount={plan.price}
                  currency="USD"
                  courseTitle={`Credits: ${plan.name}`}
                  onSuccess={handlePaymentSuccess}
                  onError={(err: any) => {
                    setError(err?.message || 'Payment failed');
                    setStep('error');
                  }}
                />
              </Elements>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-700 font-medium">Processing your payment...</p>
              <p className="text-sm text-gray-500 mt-2">Please don’t close this window</p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-10">
              <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
              <p className="text-gray-800 font-semibold mb-2">Payment Successful!</p>
              <p className="text-gray-600">You’ve added {plan.credits} credits to your wallet.</p>
              <button onClick={handleClose} className="mt-6 w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">Continue</button>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center py-10">
              <FaExclamationTriangle className="text-red-500 text-6xl mx-auto mb-4" />
              <p className="text-gray-800 font-semibold mb-2">Payment Failed</p>
              <p className="text-gray-600">{error || 'Something went wrong. Please try again.'}</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button onClick={() => setStep('payment')} className="py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Try Again</button>
                <button onClick={handleClose} className="py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletPaymentModal;
