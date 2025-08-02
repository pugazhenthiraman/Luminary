import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { showSuccessToast, showErrorToast } from '../components/Toast';
import { useAuth } from '../hooks/useAuth';
import { USER_TYPE } from '../constants';
import RegisterCoach from './RegisterCoach';
import RegisterParent from './RegisterParent';
import { FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';

const Login = () => {
  const location = useLocation();
  const { 
    isLoading, 
    error, 
    login, 
    forgotPassword, 
    resetPassword, 
    verifyEmail, 
    selectRole, 
    clearError 
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});
  const [isValidating, setIsValidating] = useState(false);
  const [lastEmailError, setLastEmailError] = useState('');
  const [lastPasswordError, setLastPasswordError] = useState('');
  const debounceTimerRef = useRef<number | null>(null);
  
  // Email verification state
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  
  // Role selection state
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  
  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  
  // Reset password state
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Registration state
  const [showRegister, setShowRegister] = useState(false);
  const [registerRole, setRegisterRole] = useState<'coach' | 'parent' | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      // User is already logged in, no need to redirect here
      // The App.tsx or routing logic should handle this
    }
  }, []);

  // Reset registration state when URL changes
  useEffect(() => {
    setShowRegister(false);
    setRegisterRole(null);
  }, [location.pathname]);

  // Clear error when component unmounts or error changes
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  // Real-time validation with proper debouncing
  const validateField = useCallback((field: 'email' | 'password', value: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      setIsValidating(true);
      
      if (field === 'email' && value) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          const errorMsg = 'Please include an "@" in the email address';
                      if (lastEmailError !== errorMsg) {
              setLastEmailError(errorMsg);
              showErrorToast(errorMsg);
            }
        } else {
          setLastEmailError('');
        }
      }
      
      if (field === 'password' && value) {
                  if (value.length < 8) {
            const errorMsg = 'Password must be at least 8 characters';
            if (lastPasswordError !== errorMsg) {
              setLastPasswordError(errorMsg);
              showErrorToast(errorMsg);
            }
          } else if (!/[A-Z]/.test(value)) {
            const errorMsg = 'Password must contain at least one capital letter';
            if (lastPasswordError !== errorMsg) {
              setLastPasswordError(errorMsg);
              showErrorToast(errorMsg);
            }
          } else if (!/[a-z]/.test(value)) {
            const errorMsg = 'Password must contain at least one lowercase letter';
            if (lastPasswordError !== errorMsg) {
              setLastPasswordError(errorMsg);
              showErrorToast(errorMsg);
            }
          } else if (!/\d/.test(value)) {
            const errorMsg = 'Password must contain at least one number';
            if (lastPasswordError !== errorMsg) {
              setLastPasswordError(errorMsg);
              showErrorToast(errorMsg);
            }
          } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
            const errorMsg = 'Password must contain at least one special character (!@#$%^&*)';
            if (lastPasswordError !== errorMsg) {
              setLastPasswordError(errorMsg);
              showErrorToast(errorMsg);
            }
        } else {
          setLastPasswordError('');
        }
      }
      
      setIsValidating(false);
    }, 1500); // Increased delay to 1500ms
  }, [lastEmailError, lastPasswordError]);

  // Handle email changes
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value) {
      validateField('email', value);
    } else {
      setLastEmailError('');
    }
  };

  // Handle password changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (value) {
      validateField('password', value);
    } else {
      setLastPasswordError('');
    }
  };

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please include an "@" in the email address';
    }
    
    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else {
      // Check for password complexity requirements
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      
      if (!hasUpperCase) {
        newErrors.password = 'Password must contain at least one capital letter';
      } else if (!hasLowerCase) {
        newErrors.password = 'Password must contain at least one lowercase letter';
      } else if (!hasNumbers) {
        newErrors.password = 'Password must contain at least one number';
      } else if (!hasSpecialChar) {
        newErrors.password = 'Password must contain at least one special character (!@#$%^&*)';
      }
    }
    
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      // Show toast for validation errors - always show on submit
      if (validationErrors.email) {
        showErrorToast(validationErrors.email);
        return;
      }
      if (validationErrors.password) {
        showErrorToast(validationErrors.password);
        return;
      }
      return;
    }

    // Check for admin credentials first
    if (email === 'admin@gmail.com' && password === '@Admin123') {
      // Store admin data in localStorage
      const adminData = {
        id: 'admin-001',
        email: 'admin@gmail.com',
        name: 'Admin User',
        role: 'ADMIN',
        isVerified: true
      };
      
      localStorage.setItem('user', JSON.stringify(adminData));
      localStorage.setItem('activeRole', 'ADMIN');
      
      showSuccessToast('Admin login successful!');
      
      // Redirect to admin dashboard
      setTimeout(() => {
        window.location.href = '/admin/dashboard';
      }, 1000);
      
      return;
    }

    // Check for coach credentials
    if (email === 'pugazhenthi962003@gmail.com' && password === '@Pugal2003') {
      // Store coach data in localStorage
      const coachData = {
        id: 'coach-001',
        email: 'pugazhenthi962003@gmail.com',
        name: 'Pugazhenthi',
        role: 'COACH',
        isVerified: true
      };
      
      localStorage.setItem('user', JSON.stringify(coachData));
      localStorage.setItem('activeRole', 'COACH');
      
      showSuccessToast('Coach login successful!');
      
      // Redirect to coach dashboard
      setTimeout(() => {
        window.location.href = '/coach/dashboard';
      }, 1000);
      
      return;
    }

    // Check for parent credentials
    if (email === 'ruffesh@gmail.com' && password === '@Ruffesh123') {
      // Store parent data in localStorage
      const parentData = {
        id: 'parent-001',
        email: 'ruffesh@gmail.com',
        name: 'Ruffesh',
        role: 'PARENT',
        isVerified: true,
        children: [] // Start with empty children array - parents can add children in Profile
      };
      
      localStorage.setItem('user', JSON.stringify(parentData));
      localStorage.setItem('activeRole', 'PARENT');
      
      showSuccessToast('Parent login successful!');
      
      // Redirect to parent dashboard
      setTimeout(() => {
        window.location.href = '/parent/dashboard';
      }, 1000);
      
      return;
    }

    // Determine role based on path
    let role = '';
    if (location.pathname === '/loginAdmin') {
      role = USER_TYPE.admin;
    } else if (location.pathname === '/loginCoach') {
      role = USER_TYPE.coach;
    } else if (location.pathname === '/loginParent') {
      role = USER_TYPE.parent;
    }

    const result = await login({ email, password, role });
    
    if (result.success) {
      showSuccessToast('Successfully signed in!');
      
      if (result.requiresRoleSelection && result.availableRoles) {
        setAvailableRoles(result.availableRoles);
        setShowRoleSelection(true);
      }
      // If no role selection needed, navigation is handled by the hook
    } else if (error === 'email_not_verified') {
      setShowVerification(true);
      showSuccessToast('Your Identity is yet to be verified, Kindly check email for the verification code');
    } else if (error) {
      showErrorToast(error);
    }
  };

      const handleRoleSelect = async (role: string) => {
      // Removed info toast as requested
      
      await selectRole(role);
    setShowRoleSelection(false);
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) {
      showErrorToast('Verification code is required');
      return;
    }

          // Removed info toast as requested

    const result = await verifyEmail(email, verificationCode);
    if (result.success && result.user) {
      showSuccessToast('Email verified successfully!');
      
      const user = result.user;
      const userAvailableRoles = user.availableRoles as string[];
      if (userAvailableRoles && userAvailableRoles.length > 1) {
        setAvailableRoles(userAvailableRoles);
        setShowRoleSelection(true);
        setShowVerification(false);
      } else {
        // Single role, navigate automatically (handled by the hook)
        setShowVerification(false);
      }
    } else if (error) {
      showErrorToast(error);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      showErrorToast('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotPasswordEmail)) {
      showErrorToast('Invalid email address');
      return;
    }

          // Removed info toast as requested

    // Determine role based on path
    let role = '';
    if (location.pathname === '/loginAdmin') {
      role = USER_TYPE.admin;
    } else if (location.pathname === '/loginCoach') {
      role = USER_TYPE.coach;
    } else if (location.pathname === '/loginParent') {
      role = USER_TYPE.parent;
    }

    const success = await forgotPassword(forgotPasswordEmail, role);
    if (success) {
      showSuccessToast('Reset email sent successfully!');
      setShowForgotPassword(false);
      setShowResetPassword(true);
    } else if (error) {
      showErrorToast(error);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken) {
      showErrorToast('Reset token is required');
      return;
    }
    if (!newPassword) {
      showErrorToast('New password is required');
      return;
    }
    if (newPassword !== confirmPassword) {
      showErrorToast('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      showErrorToast('Password must be at least 6 characters long');
      return;
    }

          // Removed info toast as requested

    // Determine role based on path
    let role = '';
    if (location.pathname === '/loginAdmin') {
      role = USER_TYPE.admin;
    } else if (location.pathname === '/loginCoach') {
      role = USER_TYPE.coach;
    } else if (location.pathname === '/loginParent') {
      role = USER_TYPE.parent;
    }

    const success = await resetPassword(resetToken, newPassword, forgotPasswordEmail, role);
    if (success) {
      showSuccessToast('Password reset successfully!');
      setShowResetPassword(false);
      setShowForgotPassword(false);
      // Reset all state
      setForgotPasswordEmail('');
      setResetToken('');
      setNewPassword('');
      setConfirmPassword('');
    } else if (error) {
      showErrorToast(error);
    }
  };

  // Determine the register link based on the current path
  let registerRoleBtn: 'coach' | 'parent' | null = null;
  if (location.pathname === '/loginCoach') {
    registerRoleBtn = 'coach';
  } else if (location.pathname === '/loginParent') {
    registerRoleBtn = 'parent';
  }

  const handleVerificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationCode(e.target.value);
    clearError();
  };

  // Inline role selection UI
  if (showRoleSelection) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 min-w-80 md:min-w-96 max-w-md text-center border border-gray-200">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-8 bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">
            Select Your Role
          </h2>
          <div className="flex flex-col gap-4">
            {availableRoles.map((role) => (
              <button 
                className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none rounded-2xl py-4 px-6 text-lg font-semibold cursor-pointer transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-2xl hover:-translate-y-1 transform border border-blue-500/20 hover:border-blue-400/30" 
                key={role} 
                onClick={() => handleRoleSelect(role)}
              >
                {role === 'ADMIN' ? 'Admin' : role === 'COACH' ? 'Coach' : role === 'PARENT' ? 'Parent' : role}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Forgot password UI
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-purple-400/5"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 mx-4 md:mx-8 my-8 border border-gray-200">
          <h1 className="text-center mb-6 text-gray-900 text-2xl md:text-3xl font-bold">
            Forgot Password
          </h1>
          <p className="text-center mb-6 text-gray-600 text-sm leading-relaxed">
            Enter your email address and we'll send you a reset token.
          </p>
          <form onSubmit={handleForgotPasswordSubmit} role="form">
            <div className="mb-5">
              <label htmlFor="forgotEmail" className="block mb-2 font-medium text-gray-700 text-sm">
                Email Address
              </label>
              <input
                type="email"
                name="forgotEmail"
                id="forgotEmail"
                placeholder="Enter your email address"
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 transition-all duration-300 focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-md"
                value={forgotPasswordEmail}
                onChange={(e) => {
                  setForgotPasswordEmail(e.target.value);
                  clearError();
                }}
              />
              {error && (
                <div className="text-red-500 text-xs mt-1.5 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {error}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none rounded-lg text-sm font-medium cursor-pointer mb-4 shadow-md transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:-translate-y-0.5 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-blue-500/20 hover:border-blue-400/30" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin text-sm" />
                  Sending Reset Email...
                </div>
              ) : (
                'Send Reset Email'
              )}
            </button>
          </form>
          <div className="text-center mt-6 text-sm">
            <span className="text-gray-600">Remember your password? </span>
            <button
              type="button"
              className="bg-transparent border-none text-blue-600 font-medium cursor-pointer text-sm transition-all duration-300 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              onClick={() => setShowForgotPassword(false)}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Reset password UI
  if (showResetPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-purple-400/5"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 mx-4 md:mx-8 my-8 border border-gray-200">
          <h1 className="text-center mb-6 text-gray-900 text-2xl md:text-3xl font-bold">
            Reset Password
          </h1>
          <p className="text-center mb-6 text-gray-600 text-sm leading-relaxed">
            Enter the reset token from your email and your new password.
          </p>
          <form onSubmit={handleResetPasswordSubmit} role="form">
            <div className="mb-5">
              <label htmlFor="resetToken" className="block mb-2 font-medium text-gray-700 text-sm">
                Reset Token
              </label>
              <input
                type="text"
                name="resetToken"
                id="resetToken"
                placeholder="Enter reset token from email"
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 transition-all duration-300 focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-md"
                value={resetToken}
                onChange={(e) => {
                  setResetToken(e.target.value);
                  clearError();
                }}
              />
            </div>

            <div className="mb-5">
              <label htmlFor="newPassword" className="block mb-2 font-medium text-gray-700 text-sm">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                id="newPassword"
                placeholder="Enter new password"
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 transition-all duration-300 focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-md"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  clearError();
                }}
              />
            </div>

            <div className="mb-5">
              <label htmlFor="confirmPassword" className="block mb-2 font-medium text-gray-700 text-sm">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                placeholder="Confirm new password"
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 transition-all duration-300 focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-md"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearError();
                }}
              />
              {error && (
                <div className="text-red-500 text-xs mt-1.5 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {error}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none rounded-lg text-sm font-medium cursor-pointer mb-4 shadow-md transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:-translate-y-0.5 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-blue-500/20 hover:border-blue-400/30" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin text-sm" />
                  Resetting Password...
                </div>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
          <div className="text-center mt-6 text-sm">
            <span className="text-gray-600">Remember your password? </span>
            <button
              type="button"
              className="bg-transparent border-none text-blue-600 font-medium cursor-pointer text-sm transition-all duration-300 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              onClick={() => {
                setShowResetPassword(false);
                setShowForgotPassword(false);
              }}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Inline registration UI
  if (showRegister && registerRole === 'coach') {
    return <RegisterCoach onBack={() => setShowRegister(false)} />;
  }
  if (showRegister && registerRole === 'parent') {
    return <RegisterParent onBack={() => setShowRegister(false)} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-purple-400/5"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-10 mx-4 md:mx-8 my-8 border border-gray-200">
        <h1 className="text-center mb-8 text-gray-900 text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">
          {showVerification ? 'Verify Email' : 'Welcome Back'}
        </h1>
        {!showVerification ? (
          <form onSubmit={handleSubmit} role="form" noValidate>
            <div className="mb-5">
              <label htmlFor="email" className="block mb-2 font-medium text-gray-700 text-sm">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="email"
                  id="email"
                  placeholder="Enter your email address"
                  className={`w-full px-3 py-2.5 border-2 rounded-lg text-sm transition-all duration-300 focus:outline-none focus:bg-white focus:shadow-md ${
                    lastEmailError 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:bg-red-50' 
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                  value={email}
                  onChange={handleEmailChange}
                  autoComplete="email"
                />
                {isValidating && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FaSpinner className="animate-spin text-blue-500 text-sm" />
                  </div>
                )}
                {lastEmailError && (
                  <div className="text-red-500 text-xs mt-1.5 flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {lastEmailError}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-5">
              <label htmlFor="password" className="block mb-2 font-medium text-gray-700 text-sm">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password"
                  placeholder="Enter your password"
                  className={`w-full px-3 py-2.5 pr-10 border-2 rounded-lg text-sm transition-all duration-300 focus:outline-none focus:bg-white focus:shadow-md ${
                    lastPasswordError 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:bg-red-50' 
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                  value={password}
                  onChange={handlePasswordChange}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                </button>
                {lastPasswordError && (
                  <div className="text-red-500 text-xs mt-1.5 flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {lastPasswordError}
                  </div>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none rounded-lg text-sm font-medium cursor-pointer mb-4 shadow-md transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:-translate-y-0.5 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-blue-500/20 hover:border-blue-400/30" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin text-sm" />
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="text-center mb-6">
              <button
                type="button"
                className="bg-transparent border-none text-blue-600 font-medium cursor-pointer text-sm transition-all duration-300 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot Password?
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerificationSubmit} noValidate>
            <div className="mb-5">
              <label className="block mb-2 font-medium text-blue-800 text-sm" htmlFor="verificationCode">
                Verification Code
              </label>
              <input
                className="w-full px-3 py-2.5 border-2 border-blue-200 rounded-lg bg-blue-50 outline-none text-sm text-gray-800 transition-all duration-300 focus:border-blue-500 focus:bg-white focus:shadow-md"
                type="text"
                name="verificationCode"
                id="verificationCode"
                placeholder="Enter verification code from email"
                value={verificationCode}
                onChange={handleVerificationChange}
              />
              {error && (
                <div className="text-red-500 text-xs mt-1.5 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {error}
                </div>
              )}
            </div>
            <button 
              type="submit" 
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none rounded-lg text-sm font-medium cursor-pointer mb-4 shadow-md transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:-translate-y-0.5 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-blue-500/20 hover:border-blue-400/30" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin text-sm" />
                  Verifying Email...
                </div>
              ) : (
                'Verify Email'
              )}
            </button>
          </form>
        )}
        {/* Only show register link if registerLink is not empty */}
        {registerRoleBtn && (
          <div className="text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <button
              type="button"
              className="bg-transparent border-none text-blue-600 font-medium cursor-pointer text-sm transition-all duration-300 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              onClick={() => {
                setShowRegister(true);
                setRegisterRole(registerRoleBtn);
              }}
            >
              Register here
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
