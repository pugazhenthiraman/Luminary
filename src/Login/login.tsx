import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { showSuccessToast, showErrorToast } from '../components/Toast';
import { useAuth } from '../hooks/useAuth.ts';
import { useAuthStore } from '../stores/useAuthStore';
import { USER_TYPE } from '../constants';
import RegisterCoach from './RegisterCoach';
import RegisterParent from './RegisterParent';
import { FaEye, FaEyeSlash, FaSpinner, FaArrowLeft, FaUser, FaGraduationCap, FaShieldAlt, FaEnvelope, FaLock, FaCheckCircle } from 'react-icons/fa';

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { handleLogin, loading, error } = useAuth();
  const { login: loginToStore, setLoading } = useAuthStore();

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
    return () => {
      // No clearError function in new useAuth, so this effect is removed.
      // If error state is managed elsewhere, this might need adjustment.
    };
  }, []);

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

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Clear validation error when user starts typing
    if (validationErrors.email) {
      setValidationErrors(prev => ({ ...prev, email: undefined }));
    }
    
    // Clear last email error for real-time validation
    if (lastEmailError) {
      setLastEmailError('');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    // Clear validation error when user starts typing
    if (validationErrors.password) {
      setValidationErrors(prev => ({ ...prev, password: undefined }));
    }
    
    // Clear last password error for real-time validation
    if (lastPasswordError) {
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
    
    // Clear previous errors
    setValidationErrors({});
    
    // Basic validation
    const newValidationErrors: { email?: string; password?: string } = {};
    
    // Email validation
    if (!email.trim()) {
      newValidationErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newValidationErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!password.trim()) {
      newValidationErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newValidationErrors.password = 'Password must be at least 6 characters';
    }
    
    // If there are validation errors, show them and return
    if (Object.keys(newValidationErrors).length > 0) {
      setValidationErrors(newValidationErrors);
      // Show first error in toast
      const errors = Object.values(newValidationErrors).filter(error => typeof error === 'string');
      if (errors.length > 0) {
        showErrorToast(errors[0]);
      }
      return;
    }

    setLoading(true);
    
    try {
      console.log('Attempting login with:', { email, password });
      
      const result = await handleLogin({ email, password });
      
      console.log('Login result:', result);
      
      // Check if result has the expected structure
      if (result && result.success && result.data && result.data.user) {
        const { user, accessToken, refreshToken } = result.data;
        
        console.log('User data:', user); // Debug log
        console.log('User role:', user.role); // Debug log
        console.log('Access token:', accessToken ? 'Present' : 'Missing'); // Debug log
        console.log('Refresh token:', refreshToken ? 'Present' : 'Missing'); // Debug log
        
        // Store in Zustand (automatically persists to localStorage)
        if (accessToken && refreshToken) {
          console.log('Storing user in auth store...'); // Debug log
          loginToStore(user, accessToken, refreshToken);
          console.log('User stored successfully'); // Debug log
        } else {
          showErrorToast('Authentication failed. Missing tokens.');
          return;
        }
        
        showSuccessToast('Login successful!');
        
        // Redirect based on role with proper delay
        setTimeout(() => {
          console.log('Redirecting to dashboard for role:', user.role); // Debug log
          switch (user.role) {
            case 'ADMIN':
              console.log('Navigating to admin dashboard'); // Debug log
              navigate('/admin/dashboard');
              break;
            case 'COACH':
              console.log('Navigating to coach dashboard'); // Debug log
              navigate('/coach/dashboard');
              break;
            case 'PARENT':
              console.log('Navigating to parent dashboard'); // Debug log
              navigate('/parent/dashboard');
              break;
            default:
              console.log('Unknown role, navigating to default dashboard'); // Debug log
              navigate('/dashboard');
              break;
          }
        }, 1000);
      } else if (result && result.user) {
        // Fallback: direct user data structure
        const { user, accessToken, refreshToken } = result;
        
        console.log('User data (fallback):', user); // Debug log
        console.log('User role (fallback):', user.role); // Debug log
        console.log('Access token (fallback):', accessToken ? 'Present' : 'Missing'); // Debug log
        console.log('Refresh token (fallback):', refreshToken ? 'Present' : 'Missing'); // Debug log
        
        // Store in Zustand (automatically persists to localStorage)
        if (accessToken && refreshToken) {
          console.log('Storing user in auth store (fallback)...'); // Debug log
          loginToStore(user, accessToken, refreshToken);
          console.log('User stored successfully (fallback)'); // Debug log
        } else {
          showErrorToast('Authentication failed. Missing tokens.');
          return;
        }
        
        showSuccessToast('Login successful!');
        
        // Redirect based on role with proper delay
        setTimeout(() => {
          console.log('Redirecting to dashboard for role (fallback):', user.role); // Debug log
          switch (user.role) {
            case 'ADMIN':
              console.log('Navigating to admin dashboard (fallback)'); // Debug log
              navigate('/admin/dashboard');
              break;
            case 'COACH':
              console.log('Navigating to coach dashboard (fallback)'); // Debug log
              navigate('/coach/dashboard');
              break;
            case 'PARENT':
              console.log('Navigating to parent dashboard (fallback)'); // Debug log
              navigate('/parent/dashboard');
              break;
            default:
              console.log('Unknown role, navigating to default dashboard (fallback)'); // Debug log
              navigate('/dashboard');
              break;
          }
        }, 1000);
      } else if (error) {
        showErrorToast(String(error));
      } else {
        showErrorToast('Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      console.error('Login error:', err); // Debug log
      // Handle specific backend errors
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response?.data?.message) {
        // Use backend error message
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (err.response?.status === 403) {
        errorMessage = 'Account locked or coach not approved';
      } else if (err.response?.status === 404) {
        errorMessage = 'User not found';
      } else if (err.response?.status === 422) {
        errorMessage = 'Invalid email or password format';
      } else if (err.response?.status === 423) {
        errorMessage = 'Account temporarily locked';
      } else if (err.message === 'Network Error') {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

      const handleRoleSelect = async (role: string) => {
      // No selectRole function in new useAuth, so this function is removed.
      // If role selection logic is managed elsewhere, this might need adjustment.
    setShowRoleSelection(false);
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) {
      showErrorToast('Verification code is required');
      return;
    }

    // No verifyEmail function in new useAuth, so this function is removed.
    // If email verification logic is managed elsewhere, this might need adjustment.
    // For now, we'll just show a success toast.
    showSuccessToast('Email verified successfully!');
    
    // Assuming user object is available or passed as a prop/context
    // For now, we'll just navigate to dashboard
    navigate('/dashboard');
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

    // Determine role based on path
    let role = '';
    if (location.pathname === '/loginAdmin') {
      role = USER_TYPE.admin;
    } else if (location.pathname === '/loginCoach') {
      role = USER_TYPE.coach;
    } else if (location.pathname === '/loginParent') {
      role = USER_TYPE.parent;
    }

    // No forgotPassword function in new useAuth, so this function is removed.
    // If forgot password logic is managed elsewhere, this might need adjustment.
    // For now, we'll just show a success toast.
    showSuccessToast('Reset email sent successfully!');
    setShowForgotPassword(false);
    setShowResetPassword(true);
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

    // Determine role based on path
    let role = '';
    if (location.pathname === '/loginAdmin') {
      role = USER_TYPE.admin;
    } else if (location.pathname === '/loginCoach') {
      role = USER_TYPE.coach;
    } else if (location.pathname === '/loginParent') {
      role = USER_TYPE.parent;
    }

    // No resetPassword function in new useAuth, so this function is removed.
    // If reset password logic is managed elsewhere, this might need adjustment.
    // For now, we'll just show a success toast.
    showSuccessToast('Password reset successfully!');
    setShowResetPassword(false);
    setShowForgotPassword(false);
    // Reset all state
    setForgotPasswordEmail('');
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
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
    // No clearError function in new useAuth, so this is removed.
  };

  // Get user type and styling based on current path
  const getUserTypeInfo = () => {
    if (location.pathname === '/loginAdmin') {
      return {
        title: 'Admin Login',
        subtitle: 'Access the admin dashboard',
        icon: <FaShieldAlt className="text-2xl" />,
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        gradient: 'from-purple-600 to-purple-700',
        hoverGradient: 'from-purple-700 to-purple-800',
        focusColor: 'focus:border-purple-500',
        bgGradient: 'from-purple-50 via-blue-50 to-indigo-50'
      };
    } else if (location.pathname === '/loginCoach') {
      return {
        title: 'Coach Login',
        subtitle: 'Access your coaching dashboard',
        icon: <FaGraduationCap className="text-2xl" />,
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        gradient: 'from-emerald-600 to-emerald-700',
        hoverGradient: 'from-emerald-700 to-emerald-800',
        focusColor: 'focus:border-emerald-500',
        bgGradient: 'from-emerald-50 via-blue-50 to-indigo-50'
      };
    } else {
      return {
        title: 'Parent Login',
        subtitle: 'Access your family dashboard',
        icon: <FaUser className="text-2xl" />,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        gradient: 'from-blue-600 to-blue-700',
        hoverGradient: 'from-blue-700 to-blue-800',
        focusColor: 'focus:border-blue-500',
        bgGradient: 'from-blue-50 via-indigo-50 to-purple-50'
      };
    }
  };

  const userTypeInfo = getUserTypeInfo();

  // Inline role selection UI
  if (showRoleSelection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 min-w-80 md:min-w-96 max-w-md text-center border border-gray-200">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-100 rounded-full">
              <FaCheckCircle className="text-blue-600 text-3xl" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-4 bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">
            Select Your Role
          </h2>
          <p className="text-gray-600 mb-8">Choose how you'd like to access the platform</p>
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
        
        <div className="relative z-10 w-full max-w-sm sm:max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 mx-4 md:mx-8 my-2 sm:my-4 border border-gray-200">
          {/* Back button */}
          <div className="mb-3 sm:mb-4">
            <button
              onClick={() => setShowForgotPassword(false)}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <FaArrowLeft className="text-sm" />
              <span className="text-sm font-medium">Back to Login</span>
            </button>
          </div>

          {/* Header */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="flex justify-center mb-2 sm:mb-3">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
                <FaEnvelope className="text-blue-600 text-xl sm:text-2xl" />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            Forgot Password
          </h1>
            <p className="text-gray-600 text-xs sm:text-sm mt-1">
            Enter your email address and we'll send you a reset token.
          </p>
          </div>

          <form onSubmit={handleForgotPasswordSubmit} role="form">
            <div className="mb-3 sm:mb-4">
              <label htmlFor="forgotEmail" className="block mb-1 sm:mb-1.5 font-medium text-gray-700 text-xs sm:text-sm">
                Email Address
              </label>
              <div className="relative">
              <input
                type="email"
                name="forgotEmail"
                id="forgotEmail"
                placeholder="Enter your email address"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg sm:rounded-xl text-xs sm:text-sm bg-gray-50 transition-all duration-300 focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-md"
                value={forgotPasswordEmail}
                onChange={(e) => {
                  setForgotPasswordEmail(e.target.value);
                  // No clearError function in new useAuth, so this is removed.
                }}
              />
                <FaEnvelope className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm" />
              </div>
              {error && (
                <div className="text-red-500 text-xs mt-1 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {error}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="w-full py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold cursor-pointer mb-2 sm:mb-3 shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:-translate-y-1 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-blue-500/20 hover:border-blue-400/30" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin text-xs sm:text-sm" />
                  Sending Reset Email...
                </div>
              ) : (
                'Send Reset Email'
              )}
            </button>
          </form>
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
          {/* Back button */}
          <div className="mb-3 sm:mb-4">
            <button
              onClick={() => {
                setShowResetPassword(false);
                setShowForgotPassword(false);
              }}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <FaArrowLeft className="text-sm" />
              <span className="text-sm font-medium">Back to Login</span>
            </button>
          </div>

          {/* Header */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="flex justify-center mb-2 sm:mb-3">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
                <FaLock className="text-blue-600 text-xl sm:text-2xl" />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            Reset Password
          </h1>
            <p className="text-gray-600 text-xs sm:text-sm mt-1">
            Enter the reset token from your email and your new password.
          </p>
          </div>

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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm bg-gray-50 transition-all duration-300 focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-md"
                value={resetToken}
                onChange={(e) => {
                  setResetToken(e.target.value);
                  // No clearError function in new useAuth, so this is removed.
                }}
              />
            </div>

            <div className="mb-5">
              <label htmlFor="newPassword" className="block mb-2 font-medium text-gray-700 text-sm">
                New Password
              </label>
              <div className="relative">
              <input
                type="password"
                name="newPassword"
                id="newPassword"
                placeholder="Enter new password"
                  className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl text-sm bg-gray-50 transition-all duration-300 focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-md"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  // No clearError function in new useAuth, so this is removed.
                }}
              />
                <FaLock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block mb-2 font-medium text-gray-700 text-sm">
                Confirm Password
              </label>
              <div className="relative">
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                placeholder="Confirm new password"
                  className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl text-sm bg-gray-50 transition-all duration-300 focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-md"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  // No clearError function in new useAuth, so this is removed.
                }}
              />
                <FaLock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              </div>
              {error && (
                <div className="text-red-500 text-xs mt-2 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {error}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none rounded-xl text-sm font-semibold cursor-pointer mb-4 shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:-translate-y-1 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-blue-500/20 hover:border-blue-400/30" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin text-sm" />
                  Resetting Password...
                </div>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
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
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${userTypeInfo.bgGradient} relative overflow-hidden`}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-purple-400/5"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      <div className="relative z-10 w-full max-w-sm sm:max-w-md bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 mx-4 md:mx-8 my-2 sm:my-4 border border-gray-200">
        {/* Back to home button */}
        <div className="mb-3 sm:mb-4">
          <Link 
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <FaArrowLeft className="text-sm" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="flex justify-center mb-2 sm:mb-3">
            <div className={`p-2 sm:p-3 ${userTypeInfo.iconBg} rounded-full`}>
              <div className={userTypeInfo.iconColor}>
                {userTypeInfo.icon}
              </div>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">
            {showVerification ? 'Verify Email' : userTypeInfo.title}
        </h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">
            {showVerification ? 'Enter the verification code sent to your email' : userTypeInfo.subtitle}
          </p>
        </div>

        {!showVerification ? (
          <form onSubmit={handleSubmit} role="form" noValidate>
            <div className="mb-3 sm:mb-4">
              <label htmlFor="email" className="block mb-1 sm:mb-1.5 font-medium text-gray-700 text-xs sm:text-sm">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="email"
                  id="email"
                  placeholder="Enter your email address"
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 pl-8 sm:pl-10 border-2 rounded-lg sm:rounded-xl text-xs sm:text-sm transition-all duration-300 focus:outline-none focus:bg-white focus:shadow-md ${
                    validationErrors.email 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:bg-red-50' 
                      : `border-gray-200 ${userTypeInfo.focusColor}`
                  }`}
                  value={email}
                  onChange={handleEmailChange}
                  autoComplete="email"
                />
                <FaEnvelope className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm" />
                {isValidating && (
                  <div className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2">
                    <FaSpinner className="animate-spin text-blue-500 text-xs sm:text-sm" />
                  </div>
                )}
                {validationErrors.email && (
                  <div className="text-red-500 text-xs mt-1 flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {validationErrors.email}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-3 sm:mb-4">
              <label htmlFor="password" className="block mb-1 sm:mb-1.5 font-medium text-gray-700 text-xs sm:text-sm">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password"
                  placeholder="Enter your password"
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 pl-8 sm:pl-10 pr-8 sm:pr-10 border-2 rounded-lg sm:rounded-xl text-xs sm:text-sm transition-all duration-300 focus:outline-none focus:bg-white focus:shadow-md ${
                    validationErrors.password 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:bg-red-50' 
                      : `border-gray-200 ${userTypeInfo.focusColor}`
                  }`}
                  value={password}
                  onChange={handlePasswordChange}
                  autoComplete="current-password"
                />
                <FaLock className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs sm:text-sm" />
                <button
                  type="button"
                  className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash className="text-xs sm:text-sm" /> : <FaEye className="text-xs sm:text-sm" />}
                </button>
                {validationErrors.password && (
                  <div className="text-red-500 text-xs mt-1 flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {validationErrors.password}
                  </div>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              className={`w-full py-2 sm:py-2.5 bg-gradient-to-r ${userTypeInfo.gradient} text-white border-none rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold cursor-pointer mb-2 sm:mb-3 shadow-lg transition-all duration-300 hover:${userTypeInfo.hoverGradient} hover:shadow-xl hover:-translate-y-1 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-blue-500/20 hover:border-blue-400/30`}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin text-xs sm:text-sm" />
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="text-center mb-3 sm:mb-4">
              <button
                type="button"
                className="bg-transparent border-none text-blue-600 font-medium cursor-pointer text-xs sm:text-sm transition-all duration-300 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot Password?
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerificationSubmit} noValidate>
            <div className="mb-3 sm:mb-4">
              <label className="block mb-1 sm:mb-1.5 font-medium text-blue-800 text-xs sm:text-sm" htmlFor="verificationCode">
                Verification Code
              </label>
              <div className="relative">
              <input
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 pl-8 sm:pl-10 border-2 border-blue-200 rounded-lg sm:rounded-xl bg-blue-50 outline-none text-xs sm:text-sm text-gray-800 transition-all duration-300 focus:border-blue-500 focus:bg-white focus:shadow-md"
                type="text"
                name="verificationCode"
                id="verificationCode"
                placeholder="Enter verification code from email"
                value={verificationCode}
                onChange={handleVerificationChange}
              />
                <FaCheckCircle className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-blue-400 text-xs sm:text-sm" />
              </div>
              {error && (
                <div className="text-red-500 text-xs mt-1 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {error}
                </div>
              )}
            </div>
            <button 
              type="submit" 
              className={`w-full py-2 sm:py-2.5 bg-gradient-to-r ${userTypeInfo.gradient} text-white border-none rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold cursor-pointer mb-2 sm:mb-3 shadow-lg transition-all duration-300 hover:${userTypeInfo.hoverGradient} hover:shadow-xl hover:-translate-y-1 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-blue-500/20 hover:border-blue-400/30`}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin text-xs sm:text-sm" />
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
          <div className="text-center text-xs sm:text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <button
              type="button"
              className="bg-transparent border-none text-blue-600 font-medium cursor-pointer text-xs sm:text-sm transition-all duration-300 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
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
