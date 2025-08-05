import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { showSuccessToast, showErrorToast } from '../components/Toast';
import { FaEye, FaEyeSlash, FaSpinner, FaShieldAlt, FaArrowLeft, FaEnvelope, FaLock } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});
  const [isValidating, setIsValidating] = useState(false);
  const [lastEmailError, setLastEmailError] = useState('');
  const [lastPasswordError, setLastPasswordError] = useState('');
  const debounceTimerRef = useRef<number | null>(null);

  // Check if user is already logged in as admin
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      if (userData.role === 'ADMIN') {
        navigate('/admin/dashboard');
      }
    }
  }, [navigate]);

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
        // Remove password validation for admin login - just check if it's not empty
        if (value.trim() === '') {
          const errorMsg = 'Password is required';
          if (lastPasswordError !== errorMsg) {
            setLastPasswordError(errorMsg);
            showErrorToast(errorMsg);
          }
        } else {
          setLastPasswordError('');
        }
      }
      
      setIsValidating(false);
    }, 1500);
  }, [lastEmailError, lastPasswordError]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setValidationErrors(prev => ({ ...prev, email: undefined }));
    validateField('email', value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setValidationErrors(prev => ({ ...prev, password: undefined }));
    validateField('password', value);
  };

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please include an "@" in the email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setValidationErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
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

    setIsLoading(true);

    try {
      // Check for admin credentials
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
          navigate('/admin/dashboard');
        }, 1000);
      } else {
        showErrorToast('Invalid admin credentials');
      }
    } catch (error) {
      showErrorToast('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 relative overflow-hidden px-4 sm:px-6">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-400/5 to-blue-400/5"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      <div className="relative z-10 w-full max-w-sm sm:max-w-md bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 mx-2 sm:mx-4 md:mx-8 my-2 sm:my-4 border border-gray-200">
        {/* Back to home button */}
        <div className="mb-3 sm:mb-4">
          <Link 
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 text-sm"
          >
            <FaArrowLeft className="text-sm" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="flex justify-center mb-2 sm:mb-3">
            <div className="p-2 sm:p-3 bg-purple-100 rounded-full">
              <FaShieldAlt className="text-purple-600 text-lg sm:text-2xl" />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-800 to-purple-600 bg-clip-text text-transparent">
            Admin Login
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">
            Access the admin dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} role="form" noValidate>
          <div className="mb-4 sm:mb-5">
            <label htmlFor="email" className="block mb-2 font-medium text-gray-700 text-sm">
              Email Address
            </label>
            <div className="relative">
              <input
                type="text"
                name="email"
                id="email"
                placeholder="Enter admin email"
                className={`w-full px-4 py-3 pl-10 border-2 rounded-xl text-sm transition-all duration-300 focus:outline-none focus:bg-white focus:shadow-md ${
                  lastEmailError 
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:bg-red-50' 
                    : 'border-gray-200 focus:border-purple-500'
                }`}
                value={email}
                onChange={handleEmailChange}
                autoComplete="email"
              />
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              {isValidating && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <FaSpinner className="animate-spin text-purple-500 text-sm" />
                </div>
              )}
              {lastEmailError && (
                <div className="text-red-500 text-xs mt-2 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {lastEmailError}
                </div>
              )}
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <label htmlFor="password" className="block mb-2 font-medium text-gray-700 text-sm">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                placeholder="Enter admin password"
                className={`w-full px-4 py-3 pl-10 pr-10 border-2 rounded-xl text-sm transition-all duration-300 focus:outline-none focus:bg-white focus:shadow-md ${
                  lastPasswordError 
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:bg-red-50' 
                    : 'border-gray-200 focus:border-purple-500'
                }`}
                value={password}
                onChange={handlePasswordChange}
                autoComplete="current-password"
              />
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
              </button>
              {lastPasswordError && (
                <div className="text-red-500 text-xs mt-2 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {lastPasswordError}
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white border-none rounded-xl text-sm font-semibold cursor-pointer shadow-lg transition-all duration-300 hover:from-purple-700 hover:to-purple-800 hover:shadow-xl hover:-translate-y-1 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-purple-500/20 hover:border-purple-400/30" 
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <FaSpinner className="animate-spin text-sm" />
                Signing In...
              </div>
            ) : (
              'Sign In as Admin'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8 pt-4 border-t border-gray-200">
          <p className="text-gray-500 text-xs">
            This login is restricted to authorized administrators only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 