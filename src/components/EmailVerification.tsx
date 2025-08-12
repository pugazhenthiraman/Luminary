import React, { useState, useEffect, useRef } from 'react';
import { FaEnvelope, FaSpinner, FaCheckCircle, FaTimesCircle, FaArrowLeft } from 'react-icons/fa';
import { showSuccessToast, showErrorToast, showWarningToast } from './Toast';
import { requestVerificationCode, verifyEmailWithCode, resendVerificationCode } from '../api/auth';


interface EmailVerificationProps {
  email: string;
  userType: 'parent' | 'coach';
  firstName: string;
  onVerificationSuccess: (userData: any) => void;
  onBack: () => void;
}


const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  userType,
  firstName,
  onVerificationSuccess,
  onBack
}) => {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;


  // Refs for input fields
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);


  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);


  // Format time display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };


  // Handle input change
  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    if (!/^\d*$/.test(value)) return; // Only allow numbers


    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);


    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };


  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };


  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...verificationCode];
   
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newCode[i] = pastedData[i];
    }
   
    setVerificationCode(newCode);
   
    // Focus the next empty input or the last input
    const nextEmptyIndex = newCode.findIndex(digit => !digit);
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : 5;
    inputRefs.current[focusIndex]?.focus();
  };


  // Verify code
  const handleVerifyCode = async () => {
    const code = verificationCode.join('');
   
    if (code.length !== 6) {
      showErrorToast('Please enter the complete 6-digit verification code');
      return;
    }


    if (attempts >= maxAttempts) {
      showErrorToast('Maximum verification attempts exceeded. Please request a new code.');
      return;
    }


    setIsLoading(true);


    try {
      const response = await verifyEmailWithCode({ email, code });
     
      if (response.data.success) {
        showSuccessToast('Email verified successfully!');
        onVerificationSuccess(response.data.data);
      } else {
        throw new Error(response.data.message || 'Verification failed');
      }
    } catch (error: any) {
      setAttempts(prev => prev + 1);
      const errorMessage = error.response?.data?.message || error.message || 'Verification failed';
      showErrorToast(errorMessage);
     
      // Clear the code on error
      setVerificationCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };


  // Resend code
  const handleResendCode = async () => {
    if (!canResend) return;


    setIsResending(true);


    try {
      await resendVerificationCode({ email, userType });
      showSuccessToast('Verification code resent to your email');
     
      // Reset timer and attempts
      setTimeLeft(600);
      setCanResend(false);
      setAttempts(0);
      setVerificationCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to resend verification code';
      showErrorToast(errorMessage);
    } finally {
      setIsResending(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/10 to-purple-400/10"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-400/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
     
      <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 min-w-80 md:min-w-96 max-w-md w-full mx-4 my-4 sm:my-6 md:my-8 border border-gray-200">
        {/* Back button */}
        <div className="mb-4 sm:mb-6">
          <button
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            onClick={onBack}
          >
            <FaArrowLeft className="text-sm" />
            <span className="text-sm font-medium">Back to Registration</span>
          </button>
        </div>


        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <FaEnvelope className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-gray-600 text-sm">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-indigo-600 font-semibold">{email}</p>
        </div>


        {/* Verification Code Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
            Enter Verification Code
          </label>
          <div className="flex justify-center gap-2 mb-4">
            {verificationCode.map((digit, index) => (
              <input
                key={index}
                ref={el => { inputRefs.current[index] = el; }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={e => handleInputChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                disabled={isLoading}
                placeholder="0"
                title="Verification code digit"
              />
            ))}
          </div>
         
          {/* Timer and attempts info */}
          <div className="text-center text-sm text-gray-600 mb-4">
            {timeLeft > 0 ? (
              <p>Code expires in: <span className="font-semibold text-indigo-600">{formatTime(timeLeft)}</span></p>
            ) : (
              <p className="text-red-600">Code has expired</p>
            )}
            {attempts > 0 && (
              <p className="text-orange-600 mt-1">
                Attempts remaining: {maxAttempts - attempts}
              </p>
            )}
          </div>
        </div>


        {/* Verify Button */}
        <button
          onClick={handleVerifyCode}
          disabled={isLoading || verificationCode.join('').length !== 6 || attempts >= maxAttempts}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <FaCheckCircle />
              Verify Email
            </>
          )}
        </button>


        {/* Resend Code */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
          <button
            onClick={handleResendCode}
            disabled={!canResend || isResending}
            className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2 mx-auto"
          >
            {isResending ? (
              <>
                <FaSpinner className="animate-spin" />
                Resending...
              </>
            ) : (
              'Resend Code'
            )}
          </button>
        </div>


        {/* Help text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800 text-center">
            <strong>Having trouble?</strong> Check your spam folder or contact support at{' '}
            <a href="mailto:support@luminary.com" className="underline">
              support@luminary.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};


export default EmailVerification;



