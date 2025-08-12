import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaSpinner, FaUser, FaEnvelope, FaLock, FaArrowLeft } from 'react-icons/fa';
import { showSuccessToast, showErrorToast, showWarningToast } from '../components/Toast';
import CustomPhoneInput from '../components/PhoneInput';
import EmailVerification from '../components/EmailVerification';
import { useAuth } from '../hooks/useAuth.ts';


const RegisterParent = ({ onBack }: { onBack: () => void }) => {
  const navigate = useNavigate();
 
  // Registration flow state
  const [currentStep, setCurrentStep] = useState<'registration' | 'verification'>('registration');
  const [registrationData, setRegistrationData] = useState<any>(null);
 
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });


  // Validation states
  const [errors, setErrors] = useState<string[]>([]);
  const [lastEmailError, setLastEmailError] = useState('');
  const [lastPasswordError, setLastPasswordError] = useState('');
  const [lastConfirmPasswordError, setLastConfirmPasswordError] = useState('');
  const [lastPhoneError, setLastPhoneError] = useState('');
  const [lastFirstNameError, setLastFirstNameError] = useState('');
  const [lastLastNameError, setLastLastNameError] = useState('');


  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);


  // Refs for debouncing
  const emailTimeoutRef = useRef<number | null>(null);
  const passwordTimeoutRef = useRef<number | null>(null);
  const confirmPasswordTimeoutRef = useRef<number | null>(null);
  const firstNameTimeoutRef = useRef<number | null>(null);
  const lastNameTimeoutRef = useRef<number | null>(null);


  const { handleRegister, loading, error } = useAuth();


  // Validation functions
  const validateEmail = (email: string): string => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };


  const validatePassword = (password: string): string => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) return 'Password must contain at least one special character';
    return '';
  };


  const validateConfirmPassword = (confirmPassword: string, password: string): string => {
    if (!confirmPassword) return 'Please confirm your password';
    if (confirmPassword !== password) return 'Passwords do not match';
    return '';
  };


  const validateName = (name: string, fieldName: string): string => {
    if (!name) return `${fieldName} is required`;
    if (name.length < 2) return `${fieldName} must be at least 2 characters long`;
    if (!/^[a-zA-Z\s]+$/.test(name)) return `${fieldName} can only contain letters and spaces`;
    return '';
  };


  // Formatting functions
  const formatName = (name: string): string => {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };


  // Input change handlers with debouncing
  const handleFirstNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatName(e.target.value);
    setFormData(prev => ({ ...prev, firstName: value }));


    if (firstNameTimeoutRef.current) {
      clearTimeout(firstNameTimeoutRef.current);
    }


    firstNameTimeoutRef.current = window.setTimeout(() => {
      const error = validateName(value, 'First Name');
      setLastFirstNameError(error);
      if (error) {
        showErrorToast(error);
      }
    }, 1500);
  }, []);


  const handleLastNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatName(e.target.value);
    setFormData(prev => ({ ...prev, lastName: value }));


    if (lastNameTimeoutRef.current) {
      clearTimeout(lastNameTimeoutRef.current);
    }


    lastNameTimeoutRef.current = window.setTimeout(() => {
      const error = validateName(value, 'Last Name');
      setLastLastNameError(error);
      if (error) {
        showErrorToast(error);
      }
    }, 1500);
  }, []);


  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, email: value }));


    if (emailTimeoutRef.current) {
      clearTimeout(emailTimeoutRef.current);
    }


    setIsValidating(true);
    emailTimeoutRef.current = window.setTimeout(() => {
      const error = validateEmail(value);
      setLastEmailError(error);
      if (error) {
        showErrorToast(error);
      }
      setIsValidating(false);
    }, 1500);
  }, []);


  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, password: value }));


    if (passwordTimeoutRef.current) {
      clearTimeout(passwordTimeoutRef.current);
    }


    setIsValidating(true);
    passwordTimeoutRef.current = window.setTimeout(() => {
      const error = validatePassword(value);
      setLastPasswordError(error);
      if (error) {
        showErrorToast(error);
      }
      setIsValidating(false);
    }, 1500);
  }, []);


  const handleConfirmPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, confirmPassword: value }));


    if (confirmPasswordTimeoutRef.current) {
      clearTimeout(confirmPasswordTimeoutRef.current);
    }


    confirmPasswordTimeoutRef.current = window.setTimeout(() => {
      const error = validateConfirmPassword(value, formData.password);
      setLastConfirmPasswordError(error);
      if (error) {
        showErrorToast(error);
      }
    }, 1500);
  }, [formData.password]);


  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    // Validate all fields
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);
    const firstNameError = validateName(formData.firstName, 'First Name');
    const lastNameError = validateName(formData.lastName, 'Last Name');


    setLastEmailError(emailError);
    setLastPasswordError(passwordError);
    setLastConfirmPasswordError(confirmPasswordError);
    setLastFirstNameError(firstNameError);
    setLastLastNameError(lastNameError);


    const allErrors = [emailError, passwordError, confirmPasswordError, lastPhoneError, firstNameError, lastNameError].filter(Boolean);


    if (allErrors.length > 0) {
      showErrorToast('Please fix the errors in the form');
      setIsLoading(false);
      return;
    }


    const parentData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    };


    const result = await handleRegister(parentData, 'parent');
    if (result && result.user) {
      if (result.requiresVerification) {
        // Store registration data and move to verification step
        setRegistrationData(result);
        setCurrentStep('verification');
        showSuccessToast('Registration successful! Please check your email for verification code.');
      } else {
        // Old flow - direct login (shouldn't happen with new implementation)
        showSuccessToast('Registration successful! Please login to continue.');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } else if (error) {
      showErrorToast(error);
    }
  };


  // Handle successful email verification
  const handleVerificationSuccess = (userData: any) => {
    showSuccessToast('Email verified successfully! You can now login.');
    setTimeout(() => {
      navigate('/login');
    }, 1500);
  };


  // Handle back from verification
  const handleBackFromVerification = () => {
    setCurrentStep('registration');
    setRegistrationData(null);
  };


  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (emailTimeoutRef.current) clearTimeout(emailTimeoutRef.current);
      if (passwordTimeoutRef.current) clearTimeout(passwordTimeoutRef.current);
      if (confirmPasswordTimeoutRef.current) clearTimeout(confirmPasswordTimeoutRef.current);
      if (firstNameTimeoutRef.current) clearTimeout(firstNameTimeoutRef.current);
      if (lastNameTimeoutRef.current) clearTimeout(lastNameTimeoutRef.current);
    };
  }, []);


  // Show email verification component if needed
  if (currentStep === 'verification' && registrationData) {
    return (
      <EmailVerification
        email={formData.email}
        firstName={formData.firstName}
        userType="parent"
        onVerificationSuccess={handleVerificationSuccess}
        onBack={handleBackFromVerification}
      />
    );
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/10 to-purple-400/10"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-400/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
     
      <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 min-w-80 md:min-w-96 max-w-4xl w-full mx-4 my-4 sm:my-6 md:my-8 border border-gray-200">
        {/* Back button */}
        <div className="mb-4 sm:mb-6">
          <button
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            onClick={onBack}
          >
            <FaArrowLeft className="text-sm" />
            <span className="text-sm font-medium">Back to Login</span>
          </button>
        </div>


        <h1 className="text-center mb-4 sm:mb-6 text-gray-900 text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Join Luminary as Parent
        </h1>
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-gray-700 text-sm sm:text-base md:text-lg font-medium leading-relaxed max-w-xl mx-auto mb-3">
            Connect with certified coaches and find the perfect learning experience for your children.
          </p>
          <p className="text-indigo-600 text-xs sm:text-sm font-semibold bg-gradient-to-r from-indigo-100 to-purple-100 px-3 sm:px-4 py-2 rounded-full inline-block border border-indigo-200/50">
            Start your family's learning journey ✨
          </p>
        </div>
       
        <form onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block mb-1.5 sm:mb-2 font-medium text-gray-700 text-xs sm:text-sm">
                First Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="firstName"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={handleFirstNameChange}
                  className={`w-full px-3 py-2 sm:py-2.5 border-2 rounded-lg text-xs sm:text-sm transition-all duration-300 focus:outline-none focus:bg-white focus:shadow-md ${
                    lastFirstNameError
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:bg-red-50'
                      : 'border-gray-200 focus:border-indigo-500'
                  }`}
                />
                {isValidating && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FaSpinner className="animate-spin text-blue-500 text-xs sm:text-sm" />
                  </div>
                )}
              </div>
              {lastFirstNameError && (
                <div className="text-red-500 text-xs mt-1 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {lastFirstNameError}
                </div>
              )}
            </div>
            <div>
              <label className="block mb-1.5 sm:mb-2 font-medium text-gray-700 text-xs sm:text-sm">
                Last Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="lastName"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={handleLastNameChange}
                  className={`w-full px-3 py-2 sm:py-2.5 border-2 rounded-lg text-xs sm:text-sm transition-all duration-300 focus:outline-none focus:bg-white focus:shadow-md ${
                    lastLastNameError
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:bg-red-50'
                      : 'border-gray-200 focus:border-indigo-500'
                  }`}
                />
              </div>
              {lastLastNameError && (
                <div className="text-red-500 text-xs mt-1 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {lastLastNameError}
                </div>
              )}
            </div>
          </div>


          {/* Email */}
          <div>
            <label className="block mb-1.5 sm:mb-2 font-medium text-gray-700 text-xs sm:text-sm">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleEmailChange}
                className={`w-full px-3 py-2 sm:py-2.5 border-2 rounded-lg text-xs sm:text-sm transition-all duration-300 focus:outline-none focus:bg-white focus:shadow-md ${
                  lastEmailError
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:bg-red-50'
                    : 'border-gray-200 focus:border-indigo-500'
                }`}
              />
              {isValidating && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <FaSpinner className="animate-spin text-blue-500 text-xs sm:text-sm" />
                </div>
              )}
            </div>
            {lastEmailError && (
              <div className="text-red-500 text-xs mt-1 flex items-center gap-1.5">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {lastEmailError}
              </div>
            )}
          </div>


          {/* Phone */}
          <div>
            <label className="block mb-1.5 sm:mb-2 font-medium text-gray-700 text-xs sm:text-sm">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <CustomPhoneInput
              value={formData.phone}
              onChange={(phone: string) => setFormData(prev => ({ ...prev, phone }))}
              onValidationChange={(isValid: boolean, error: string) => {
                setLastPhoneError(isValid ? '' : error);
              }}
              className={`${
                lastPhoneError
                  ? 'border-red-300 bg-red-50 focus:border-red-500'
                  : 'border-gray-200 focus:border-indigo-500'
              }`}
            />
            {lastPhoneError && (
              <div className="text-red-500 text-xs mt-1 flex items-center gap-1.5">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {lastPhoneError}
              </div>
            )}
          </div>


          {/* Password */}
          <div>
            <label className="block mb-1.5 sm:mb-2 font-medium text-gray-700 text-xs sm:text-sm">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handlePasswordChange}
                className={`w-full px-3 py-2 sm:py-2.5 pr-10 border-2 rounded-lg text-xs sm:text-sm transition-all duration-300 focus:outline-none focus:bg-white focus:shadow-md ${
                  lastPasswordError
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:bg-red-50'
                    : 'border-gray-200 focus:border-indigo-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-xs sm:text-sm"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {lastPasswordError && (
              <div className="text-red-500 text-xs mt-1 flex items-center gap-1.5">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {lastPasswordError}
              </div>
            )}
          </div>


          {/* Confirm Password */}
          <div>
            <label className="block mb-1.5 sm:mb-2 font-medium text-gray-700 text-xs sm:text-sm">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleConfirmPasswordChange}
                className={`w-full px-3 py-2 sm:py-2.5 pr-10 border-2 rounded-lg text-xs sm:text-sm transition-all duration-300 focus:outline-none focus:bg-white focus:shadow-md ${
                  lastConfirmPasswordError
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:bg-red-50'
                    : 'border-gray-200 focus:border-indigo-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-xs sm:text-sm"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {lastConfirmPasswordError && (
              <div className="text-red-500 text-xs mt-1 flex items-center gap-1.5">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {lastConfirmPasswordError}
              </div>
            )}
          </div>


          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || isLoading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {loading || isLoading ? (
              <>
                <FaSpinner className="animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <FaUser />
                Create Parent Account
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};


export default RegisterParent;



