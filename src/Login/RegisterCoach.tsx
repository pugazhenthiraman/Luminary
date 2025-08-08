import React, { useState, useEffect, useCallback, useRef } from 'react';
import { showSuccessToast, showErrorToast } from '../components/Toast';
import { FaEye, FaEyeSlash, FaSpinner, FaChevronDown, FaTimes, FaArrowLeft, FaFileAlt } from 'react-icons/fa';
import ISO6391 from 'iso-639-1';
import CustomPhoneInput from '../components/PhoneInput';
import { coachStorage } from '../utils/coachStorage';
import { useAuth } from '../hooks/useAuth.ts';
import { useAuthStore } from '../stores/useAuthStore';
import { useNavigate } from 'react-router-dom';

const RegisterCoach = ({ onBack }: { onBack: () => void }) => {
  const navigate = useNavigate();
  // State for form fields
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    domain: '',
    experience: '',
    address: '',
    language: '',
    driverLicenseNumber: '',
  });

  // Language selection state
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [languageSearch, setLanguageSearch] = useState('');
  const [languageError, setLanguageError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const languagesPerPage = 20;
  const [dropdownPosition, setDropdownPosition] = useState<'above' | 'below'>('below');

  // Ref for language dropdown
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  // File upload state and error handling
  const [photoError, setPhotoError] = useState('');
  const [resumeError, setResumeError] = useState('');
  const [videoError, setVideoError] = useState('');

  // Uploaded files state
  const [uploadedFiles, setUploadedFiles] = useState({
    photo: null as File | null,
    license: null as File | null,
    resume: null as File | null,
    video: null as File | null
  });

  // File size limits (bytes)
  const RESUME_MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const VIDEO_MAX_SIZE = 50 * 1024 * 1024; // 50MB
  const LICENSE_MAX_SIZE = 5 * 1024 * 1024; // 5MB



  // Validation states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [driverLicenseError, setDriverLicenseError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce refs
  const emailDebounceRef = useRef<number | null>(null);
  const passwordDebounceRef = useRef<number | null>(null);
  const confirmPasswordDebounceRef = useRef<number | null>(null);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Get all languages
  const allLanguages = ISO6391.getAllNames().sort();

  // Filter languages based on search
  const filteredLanguages = allLanguages.filter(lang =>
    lang.toLowerCase().includes(languageSearch.toLowerCase())
  );
  
  // Pagination logic
  const totalPages = Math.ceil(filteredLanguages.length / languagesPerPage);
  const startIndex = (currentPage - 1) * languagesPerPage;
  const endIndex = startIndex + languagesPerPage;
  const currentLanguages = filteredLanguages.slice(startIndex, endIndex);

  // Language selection handlers
  const handleLanguageSelect = (language: string) => {
    if (!selectedLanguages.includes(language)) {
      setSelectedLanguages([...selectedLanguages, language]);
      setLanguageError('');
    }
    setLanguageSearch('');
    setShowLanguageDropdown(false);
  };

  const handleLanguageRemove = (languageToRemove: string) => {
    setSelectedLanguages(selectedLanguages.filter(lang => lang !== languageToRemove));
  };

  const handleLanguageSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLanguageSearch(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
    setShowLanguageDropdown(true);
    // Recalculate position when search input is focused
    setTimeout(calculateDropdownPosition, 0);
  };

  // Pagination navigation functions
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Calculate dropdown position
  const calculateDropdownPosition = useCallback(() => {
    if (languageDropdownRef.current) {
      const rect = languageDropdownRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 320; // Approximate height of dropdown
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        setDropdownPosition('above');
      } else {
        setDropdownPosition('below');
      }
    }
  }, []);

  // Click outside handler for language dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
        setLanguageSearch('');
        setCurrentPage(1);
      }
    };

    if (showLanguageDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      // Calculate position when dropdown opens
      calculateDropdownPosition();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageDropdown, calculateDropdownPosition]);

  // Update form.language when selectedLanguages changes
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      language: selectedLanguages.join(', ')
    }));
  }, [selectedLanguages]);

  // Handle window resize and scroll for dropdown positioning
  useEffect(() => {
    const handleResize = () => {
      if (showLanguageDropdown) {
        calculateDropdownPosition();
      }
    };

    const handleScroll = () => {
      if (showLanguageDropdown) {
        calculateDropdownPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [showLanguageDropdown, calculateDropdownPosition]);

  // Input formatting functions
  const formatName = (value: string) => {
    return value.replace(/\b\w/g, (char) => char.toUpperCase());
  };



  // Validation functions
  const validateEmail = (email: string) => {
    if (!email) return '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please include an "@" in the email address';
    }
    if (email.length > 254) {
      return 'Email is too long';
    }
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return '';
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one capital letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/\d/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must contain at least one special character (!@#$%^&*)';
    }
    return '';
  };



  // Real-time validation with debouncing
  const validateField = useCallback((field: string, value: string) => {
    let debounceRef: React.MutableRefObject<number | null>;
    let setError: (error: string) => void;

    switch (field) {
      case 'email':
        debounceRef = emailDebounceRef;
        setError = setEmailError;
        break;
      case 'password':
        debounceRef = passwordDebounceRef;
        setError = setPasswordError;
        break;
      case 'confirmPassword':
        debounceRef = confirmPasswordDebounceRef;
        setError = setConfirmPasswordError;
        break;

      default:
        return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => {
      setIsValidating(true);
      let error = '';

      switch (field) {
        case 'email':
          error = validateEmail(value);
          break;
        case 'password':
          error = validatePassword(value);
          break;
        case 'confirmPassword':
          if (value && form.password && value !== form.password) {
            error = 'Passwords do not match';
          }
          break;

      }

      setError(error);
      if (error) {
        showErrorToast(error);
      }
      setIsValidating(false);
    }, 1500);
  }, [form.password]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Apply formatting based on field type
    switch (name) {
      case 'firstName':
      case 'lastName':
        formattedValue = formatName(value);
        break;
      case 'experience':
        formattedValue = value; // Allow text for experience now
        break;
      default:
        formattedValue = value;
    }

    setForm((prev) => ({ ...prev, [name]: formattedValue }));

    // Trigger validation for specific fields
    if (['email', 'password', 'confirmPassword'].includes(name)) {
      validateField(name, formattedValue);
    }
  };

  // Handle phone input change from CustomPhoneInput
  const handlePhoneChange = (value: string, country: any) => {
    setForm(prev => ({ ...prev, phone: value }));
  };

  const handlePhoneValidationChange = (isValid: boolean, errorMessage: string) => {
    setPhoneError(errorMessage);
  };



  // File handlers
  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > RESUME_MAX_SIZE) {
      setResumeError('Resume file size must be less than 10MB.');
      showErrorToast('Resume file size must be less than 10MB.');
        e.target.value = ''; // Clear the input
    } else {
      setResumeError('');
        setUploadedFiles(prev => ({ ...prev, resume: file }));
      }
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > VIDEO_MAX_SIZE) {
      setVideoError('Intro video size must be less than 50MB.');
      showErrorToast('Intro video size must be less than 50MB.');
        e.target.value = ''; // Clear the input
    } else {
      setVideoError('');
        setUploadedFiles(prev => ({ ...prev, video: file }));
      }
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit for photos
        setPhotoError('Photo size must be less than 5MB');
        showErrorToast('Photo size must be less than 5MB');
        e.target.value = ''; // Clear the input
        return;
      }
      
      const allowedTypes = ['.jpg', '.jpeg', '.png', '.webp'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        setPhotoError('Please upload a valid image file (JPG, PNG, WEBP)');
        showErrorToast('Please upload a valid image file (JPG, PNG, WEBP)');
        e.target.value = ''; // Clear the input
        return;
      }
      
      setPhotoError('');
      setUploadedFiles(prev => ({ ...prev, photo: file }));
    }
  };

  const handleDriverLicenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > LICENSE_MAX_SIZE) {
        setDriverLicenseError('License file size must be less than 5MB.');
        showErrorToast('License file size must be less than 5MB.');
        e.target.value = ''; // Clear the input
      } else {
        setDriverLicenseError('');
        setUploadedFiles(prev => ({ ...prev, license: file }));
      }
    }
  };

  // Remove file functions
  const removeFile = (fileType: 'photo' | 'license' | 'resume' | 'video') => {
    setUploadedFiles(prev => ({ ...prev, [fileType]: null }));
    // Clear the file input
    const inputId = fileType === 'photo' ? 'photo-upload' :
                   fileType === 'license' ? 'license-upload' : 
                   fileType === 'resume' ? 'resume-upload' : 'introVideo-upload';
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  };

  // Form validation
  const validateForm = () => {
    const errors: string[] = [];

    // Required field validation
    if (!form.firstName) errors.push('First name is required');
    if (!form.lastName) errors.push('Last name is required');
    if (!form.email) errors.push('Email is required');
    if (!form.phone) errors.push('Phone number is required');
    if (!form.password) errors.push('Password is required');
    if (!form.confirmPassword) errors.push('Confirm password is required');
    if (!form.domain) errors.push('Domain is required');
    if (!form.experience) errors.push('Experience is required');
    if (!form.address) errors.push('Address is required');
    if (!uploadedFiles.photo) errors.push('Profile photo is required');
    if (selectedLanguages.length === 0) {
      errors.push('At least one language is required');
      setLanguageError('At least one language is required');
    } else {
      setLanguageError('');
    }
    // Driver license number is optional, but you can make it required if needed:
    // if (!form.driverLicenseNumber) errors.push('Driver license number is required');

    // Field-specific validation
    const emailError = validateEmail(form.email);
    if (emailError) errors.push(emailError);

    const passwordError = validatePassword(form.password);
    if (passwordError) errors.push(passwordError);

    if (form.password !== form.confirmPassword) {
      errors.push('Passwords do not match');
    }

    return errors;
  };

  const { handleRegister, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => showErrorToast(error));
      return;
    }

    // Prepare coach data for backend
    const coachData = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      password: form.password,
      experience: form.experience,
      domain: form.domain,
      address: form.address,
      languages: selectedLanguages,
      driverLicenseNumber: form.driverLicenseNumber,
      // Add files if they exist
      license: uploadedFiles.license,
      resume: uploadedFiles.resume,
      video: uploadedFiles.video
    };
    
    console.log('=== COACH REGISTRATION DEBUG START ===');
    console.log('Form data being sent:', coachData);
    console.log('userType being passed:', 'coach');
    
    const result = await handleRegister(coachData, 'coach');
    
    console.log('Result from handleRegister:', result);
    console.log('=== COACH REGISTRATION DEBUG END ===');
    
    if (result && result.user) {
      showSuccessToast('Registration successful! Please check your email for verification.');
      navigate('/login');
    } else if (error) {
      showErrorToast(String(error));
    } else {
      showErrorToast('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/10 to-purple-400/10"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-400/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 min-w-80 md:min-w-96 max-w-5xl w-full mx-4 my-4 sm:my-6 md:my-8 border border-gray-200">
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
          Join Luminary as Coach
        </h1>
        
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-gray-700 text-sm sm:text-base md:text-lg font-medium leading-relaxed max-w-2xl mx-auto mb-3">
            Share your expertise and help families find the perfect coaching experience.
          </p>
          <p className="text-indigo-600 text-xs sm:text-sm font-semibold bg-gradient-to-r from-indigo-100 to-purple-100 px-3 sm:px-4 py-2 rounded-full inline-block border border-indigo-200/50">
            Complete your profile to get started ✨
          </p>
        </div>
        
        <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit} noValidate>

                <div>
            <label className="block mb-2 sm:mb-3 font-medium text-gray-700 text-xs sm:text-sm">
              Profile Photo <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              {!uploadedFiles.photo ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 md:p-8 text-center hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 cursor-pointer group">
                  <input 
                    type="file" 
                    name="photo" 
                    id="photo-upload"
                    accept=".jpg,.jpeg,.png,.webp"
                    title="Upload your profile photo"
                    onChange={handlePhotoChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    multiple={false}
                  />
                  <div className="space-y-3 sm:space-y-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-purple-200 transition-colors duration-300">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-700">Click to upload your photo</p>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP up to 5MB</p>
                      <p className="text-xs text-purple-600 mt-2 font-medium">This will be your profile picture</p>
                    </div>
                  </div>
                </div>
              ) : (
                  <div className="relative">
                      <img 
                        src={URL.createObjectURL(uploadedFiles.photo)} 
                        alt="Profile preview" 
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover mx-auto border-4 border-purple-200 shadow-lg"
                      />
                    <button
                      type="button"
                      onClick={() => removeFile('photo')}
                    className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 bg-red-500 text-white rounded-full p-1 sm:p-2 hover:bg-red-600 transition-colors duration-200"
                      title="Remove photo"
                    aria-label="Remove profile photo"
                    >
                    <FaTimes className="text-xs sm:text-sm" />
                    </button>
                </div>
              )}
            {photoError && (
                <div className="text-red-500 text-xs mt-1 flex items-center gap-1.5">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {photoError}
              </div>
            )}
          </div>
          </div>

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
                  value={form.firstName} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg text-xs sm:text-sm transition-all duration-300 focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-md"
                />
                {isValidating && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FaSpinner className="animate-spin text-purple-500 text-xs sm:text-sm" />
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block mb-1.5 sm:mb-2 font-medium text-gray-700 text-xs sm:text-sm">
                Last Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input 
                  name="lastName" 
                  placeholder="Enter your last name" 
                  value={form.lastName} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg text-xs sm:text-sm transition-all duration-300 focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-md"
                />
                {isValidating && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FaSpinner className="animate-spin text-purple-500 text-xs sm:text-sm" />
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block mb-1.5 sm:mb-2 font-medium text-gray-700 text-xs sm:text-sm">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input 
                  name="email" 
                  type="text"
                  placeholder="Enter your email address" 
                  value={form.email} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg text-xs sm:text-sm transition-all duration-300 focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-md"
                />
                {isValidating && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FaSpinner className="animate-spin text-purple-500 text-xs sm:text-sm" />
                  </div>
                )}
              </div>
              {emailError && (
                <div className="text-red-500 text-xs mt-1 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {emailError}
                </div>
              )}
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block mb-1.5 sm:mb-2 font-medium text-gray-700 text-xs sm:text-sm">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input 
                  name="email" 
                  type="text"
                  placeholder="Enter your email address" 
                  value={form.email} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg text-xs sm:text-sm transition-all duration-300 focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-md"
                />
                {isValidating && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FaSpinner className="animate-spin text-purple-500 text-xs sm:text-sm" />
                  </div>
                )}
              </div>
              {emailError && (
                <div className="text-red-500 text-xs mt-1 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {emailError}
                </div>
              )}
            </div>
            <div>
              <CustomPhoneInput
                value={form.phone}
                onChange={handlePhoneChange}
                onValidationChange={handlePhoneValidationChange}
                label="Phone Number"
                placeholder="Enter your phone number"
                required={true}
                error={phoneError}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block mb-1.5 sm:mb-2 font-medium text-gray-700 text-xs sm:text-sm">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input 
                  name="password" 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password" 
                  value={form.password} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 sm:py-2.5 pr-10 border-2 border-gray-200 rounded-lg text-xs sm:text-sm transition-all duration-300 focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-md"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash className="text-xs sm:text-sm" /> : <FaEye className="text-xs sm:text-sm" />}
                </button>
                {isValidating && (
                  <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                    <FaSpinner className="animate-spin text-purple-500 text-xs sm:text-sm" />
                  </div>
                )}
              </div>
              {passwordError && (
                <div className="text-red-500 text-xs mt-1 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {passwordError}
                </div>
              )}
            </div>
            <div>
              <label className="block mb-1.5 sm:mb-2 font-medium text-gray-700 text-xs sm:text-sm">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input 
                  name="confirmPassword" 
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password" 
                  value={form.confirmPassword} 
                  onChange={handleChange}
                  className="w-full px-3 py-2 sm:py-2.5 pr-10 border-2 border-gray-200 rounded-lg text-xs sm:text-sm transition-all duration-300 focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-md"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash className="text-xs sm:text-sm" /> : <FaEye className="text-xs sm:text-sm" />}
                </button>
              </div>
              {confirmPasswordError && (
                <div className="text-red-500 text-xs mt-1 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {confirmPasswordError}
                </div>
              )}
            </div>
          </div>

                    {/* Passwords */}
          {/* Driver License Number - moved below confirm password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block mb-1.5 sm:mb-2 font-medium text-gray-700 text-xs sm:text-sm">
                Driver License Number
              </label>
              <div className="relative">
                <input
                  name="driverLicenseNumber"
                  type="text"
                  placeholder="Enter your driver license number"
                  value={form.driverLicenseNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg text-xs sm:text-sm transition-all duration-300 focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-md"
                />
              </div>
            </div>
          </div>




          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block mb-1.5 sm:mb-2 font-medium text-gray-700 text-xs sm:text-sm">
                Years of Experience <span className="text-red-500">*</span>
              </label>
                          <input 
                name="experience" 
                placeholder="e.g., 5 years" 
                value={form.experience} 
              onChange={handleChange}
                className="w-full px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg text-xs sm:text-sm transition-all duration-300 focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-md"
            />
            </div>
            <div>
              <label className="block mb-1.5 sm:mb-2 font-medium text-gray-700 text-xs sm:text-sm">
                Area of Expertise <span className="text-red-500">*</span>
              </label>
              <input 
                name="domain" 
                placeholder="e.g., Mathematics, Sports, Music" 
                value={form.domain} 
                onChange={handleChange}
                className="w-full px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg text-xs sm:text-sm transition-all duration-300 focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-md"
              />
            </div>
          </div>

            <div>
            <label className="block mb-1.5 sm:mb-2 font-medium text-gray-700 text-xs sm:text-sm">
              Address <span className="text-red-500">*</span>
              </label>
            <textarea 
              name="address" 
              placeholder="Enter your full address" 
              value={form.address} 
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg text-xs sm:text-sm transition-all duration-300 focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-md resize-none"
            />
          </div>

            <div>
            <label className="block mb-1.5 sm:mb-2 font-medium text-gray-700 text-xs sm:text-sm">
              Languages You Speak <span className="text-red-500">*</span>
              </label>
            <div className="relative" ref={languageDropdownRef}>
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedLanguages.map((language) => (
                  <span 
                    key={language} 
                    className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-xs sm:text-sm px-2 py-1 rounded-full"
                  >
                    {language}
                    <button
                      type="button"
                      onClick={() => handleLanguageRemove(language)}
                      className="text-purple-600 hover:text-purple-800"
                      title={`Remove ${language}`}
                      aria-label={`Remove ${language} from selected languages`}
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Search and select languages..."
                  value={languageSearch}
                  onChange={handleLanguageSearch}
                  onFocus={() => setShowLanguageDropdown(true)}
                  className="w-full px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg text-xs sm:text-sm transition-all duration-300 focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-md"
                />
                <button
                  type="button"
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  title={showLanguageDropdown ? "Close language dropdown" : "Open language dropdown"}
                  aria-label={showLanguageDropdown ? "Close language dropdown" : "Open language dropdown"}
                >
                  <FaChevronDown className={`text-xs sm:text-sm transition-transform duration-200 ${showLanguageDropdown ? 'rotate-180' : ''}`} />
                </button>
              </div>
              {showLanguageDropdown && (
                <div className={`absolute z-50 w-full bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto ${dropdownPosition === 'above' ? 'bottom-full mb-2' : 'top-full mt-2'}`}>
                  <div className="p-2">
                    {currentLanguages.map((language) => (
                      <button
                        key={language}
                        type="button"
                        onClick={() => handleLanguageSelect(language)}
                        className="w-full text-left px-3 py-2 text-xs sm:text-sm hover:bg-purple-50 rounded-md transition-colors duration-200"
                      >
                        {language}
                      </button>
                    ))}
                        </div>
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center p-2 border-t border-gray-200">
                        <button
                          type="button"
                        onClick={goToPrevPage}
                        disabled={currentPage === 1}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors duration-200"
                      >
                        Previous
                      </button>
                      <span className="text-xs text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors duration-200"
                      >
                        Next
                        </button>
                    </div>
                  )}
                </div>
              )}
              {languageError && (
                <div className="text-red-500 text-xs mt-1 flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {languageError}
                  </div>
                )}
            </div>
              </div>

          {/* File Uploads - All in a single row, optional */}
          <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
            {/* Resume Upload */}
            <div className="flex-1">
              <label className="block mb-2 sm:mb-3 font-medium text-gray-700 text-xs sm:text-sm">
                Resume/CV
              </label>
              <div className="relative">
                {!uploadedFiles.resume ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 text-center hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 cursor-pointer group">
                    <input 
                      type="file" 
                      name="resume" 
                      id="resume-upload"
                      accept=".pdf,.doc,.docx"
                      title="Upload your resume"
                      onChange={handleResumeChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      multiple={false}
                    />
                    <div className="space-y-2 sm:space-y-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-purple-200 transition-colors duration-300">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-700">Upload Resume/CV</p>
                        <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-700 flex-1 truncate">{uploadedFiles.resume.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile('resume')}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                        title="Remove resume"
                        aria-label="Remove resume file"
                      >
                        <FaTimes className="text-xs sm:text-sm" />
                      </button>
                    </div>
                  </div>
                )}
                {resumeError && (
                  <div className="text-red-500 text-xs mt-1 flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {resumeError}
                  </div>
                )}
              </div>
            </div>

            {/* Driver License Upload */}
            <div className="flex-1">
              <label className="block mb-2 sm:mb-3 font-medium text-gray-700 text-xs sm:text-sm">
                Driver License
              </label>
              <div className="relative">
                {!uploadedFiles.license ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 cursor-pointer group">
                    <input 
                      type="file" 
                      name="license" 
                      id="license-upload"
                      accept=".pdf,.jpg,.jpeg,.png"
                      title="Upload your driver license"
                      onChange={handleDriverLicenseChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      multiple={false}
                    />
                    <div className="space-y-2 sm:space-y-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-blue-200 transition-colors duration-300">
                        <FaFileAlt className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-700">Upload Driver License</p>
                        <p className="text-xs text-gray-500">PDF, JPG, PNG up to 5MB</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaFileAlt className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-700 flex-1 truncate">{uploadedFiles.license.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile('license')}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                        title="Remove license"
                        aria-label="Remove license file"
                      >
                        <FaTimes className="text-xs sm:text-sm" />
                      </button>
                    </div>
                  </div>
                )}
                {driverLicenseError && (
                  <div className="text-red-500 text-xs mt-1 flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {driverLicenseError}
                  </div>
                )}
              </div>
            </div>

            {/* Introduction Video Upload */}
            <div className="flex-1">
              <label className="block mb-2 sm:mb-3 font-medium text-gray-700 text-xs sm:text-sm">
                Introduction Video
              </label>
              <div className="relative">
                {!uploadedFiles.video ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 text-center hover:border-pink-400 hover:bg-pink-50 transition-all duration-300 cursor-pointer group">
                    <input 
                      type="file" 
                      name="video" 
                      id="introVideo-upload"
                      accept=".mp4,.avi,.mov,.wmv"
                      title="Upload your introduction video"
                      onChange={handleVideoChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      multiple={false}
                    />
                    <div className="space-y-2 sm:space-y-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-pink-200 transition-colors duration-300">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 6v12a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-700">Upload Introduction Video</p>
                        <p className="text-xs text-gray-500">MP4, AVI, MOV, WMV up to 50MB</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg border border-pink-200">
                      <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 6v12a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2z" />
                        </svg>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-700 flex-1 truncate">{uploadedFiles.video.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile('video')}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                        title="Remove video"
                        aria-label="Remove video file"
                      >
                        <FaTimes className="text-xs sm:text-sm" />
                      </button>
                    </div>
                  </div>
                )}
                {videoError && (
                  <div className="text-red-500 text-xs mt-1 flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {videoError}
                  </div>
                )}
              </div>
            </div>
          </div>

                           <button
            className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-none rounded-lg text-sm sm:text-base font-semibold cursor-pointer shadow-lg transition-all duration-300 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:-translate-y-1 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-indigo-500/20 hover:border-indigo-400/30" 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <FaSpinner className="animate-spin text-sm sm:text-base" />
                Creating Account...
              </div>
            ) : (
              'Create Coach Account'
            )}
          </button>

          <div className="text-center">
                         <button 
              className="bg-transparent border-none text-indigo-600 font-medium cursor-pointer text-xs sm:text-sm transition-all duration-300 hover:text-indigo-800 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded flex items-center justify-center gap-2 mx-auto" 
               type="button" 
               onClick={onBack}
             >
              <FaArrowLeft className="text-xs" />
               Already have an account? Sign in
             </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="relative p-6 border-b border-gray-100">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
                Registration Successful! 🎉
              </h3>
              <p className="text-center text-gray-600 text-sm">
                Welcome to Luminnary! Your profile has been submitted for verification.
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-4">
                {/* Verification Process */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 text-sm mb-1">Verification Process</h4>
                      <p className="text-blue-700 text-xs leading-relaxed">
                        Our admin team will review your profile and verify your credentials. This usually takes 24-48 hours.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Email Notification */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-900 text-sm mb-1">Email Notifications</h4>
                      <p className="text-purple-700 text-xs leading-relaxed">
                        You'll receive email updates about your verification status. Please check your inbox regularly, including spam folder.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-emerald-900 text-sm mb-1">What's Next?</h4>
                      <p className="text-emerald-700 text-xs leading-relaxed">
                        Once approved, you'll be able to create courses, connect with families, and start your coaching journey!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Got it, thanks!
                </button>
              </div>
              <p className="text-center text-gray-500 text-xs mt-3">
                Need help? Contact us at <span className="text-indigo-600 font-medium">support@luminnary.com</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterCoach;