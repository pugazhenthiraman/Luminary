import React, { useState, useEffect, useCallback, useRef } from 'react';
import { showSuccessToast, showErrorToast } from '../components/Toast';
import { FaEye, FaEyeSlash, FaSpinner, FaChevronDown, FaTimes } from 'react-icons/fa';
import ISO6391 from 'iso-639-1';
import CustomPhoneInput from '../components/PhoneInput';
import { coachStorage } from '../utils/coachStorage';

const RegisterCoach = ({ onBack }: { onBack: () => void }) => {
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

    // Field-specific validation
    const emailError = validateEmail(form.email);
    if (emailError) errors.push(emailError);

    const passwordError = validatePassword(form.password);
    if (passwordError) errors.push(passwordError);

    if (form.password !== form.confirmPassword) {
      errors.push('Passwords do not match');
    }

    // Driver license validation removed - now optional

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => showErrorToast(error));
      return;
    }

    setIsLoading(true);
    
    try {
      // Prepare coach data for storage
      const coachData = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        experience: form.experience,
        duration: form.domain, // Using domain field for duration
        address: form.address,
        languages: selectedLanguages,
        courses: [] // Empty array since we removed course functionality
      };



      // Store coach data using file-like storage
      const success = coachStorage.addCoach(coachData);
      
      if (success) {
        showSuccessToast('Registration successful! Your profile has been submitted for admin approval.');
        setShowSuccessModal(true);
      } else {
        showErrorToast('Registration failed. Email may already be registered.');
      }
      
    } catch (error) {
      showErrorToast('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/10 to-purple-400/10"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-400/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 min-w-80 md:min-w-96 max-w-5xl w-full mx-4 my-8 border border-gray-200">
        <h1 className="text-center mb-6 text-gray-900 text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Join Luminary as Coach
        </h1>
        

        
        <div className="text-center mb-8">
          <p className="text-gray-700 text-base md:text-lg font-medium leading-relaxed max-w-2xl mx-auto mb-3">
            Share your expertise and help families find the perfect coaching experience.
          </p>
          <p className="text-indigo-600 text-sm font-semibold bg-gradient-to-r from-indigo-100 to-purple-100 px-4 py-2 rounded-full inline-block border border-indigo-200/50">
            Complete your profile to get started ✨
          </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>

                <div>
            <label className="block mb-3 font-medium text-gray-700 text-sm">
              Profile Photo <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              {!uploadedFiles.photo ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 cursor-pointer group">
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
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-purple-200 transition-colors duration-300">
                      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Click to upload your photo</p>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP up to 5MB</p>
                      <p className="text-xs text-purple-600 mt-2 font-medium">This will be your profile picture</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-green-200 shadow-lg">
                      <img 
                        src={URL.createObjectURL(uploadedFiles.photo)} 
                        alt="Profile preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile('photo')}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200 shadow-lg"
                      title="Remove photo"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </div>
                  <p className="text-sm text-green-600 font-medium">Profile photo uploaded successfully!</p>
                </div>
              )}
            </div>
            {photoError && (
              <div className="text-red-500 text-xs mt-2 flex items-center gap-1.5">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {photoError}
              </div>
            )}
          </div>
          {/* Personal Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-medium text-gray-700 text-sm">
                First Name <span className="text-red-500">*</span>
              </label>
              <input 
                name="firstName" 
                placeholder="Enter your first name" 
                value={form.firstName} 
                onChange={handleChange}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm transition-all duration-300 focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-md"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-700 text-sm">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input 
                name="lastName" 
                placeholder="Enter your last name" 
                value={form.lastName} 
                onChange={handleChange}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm transition-all duration-300 focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-medium text-gray-700 text-sm">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input 
                  name="email" 
                  type="text"
                  placeholder="Enter your email address" 
                  value={form.email} 
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 border-2 rounded-lg text-sm transition-all duration-300 focus:outline-none focus:bg-white focus:shadow-md ${
                    emailError 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:bg-red-50' 
                      : 'border-gray-200 focus:border-indigo-500'
                  }`}
                />
                {isValidating && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FaSpinner className="animate-spin text-blue-500 text-sm" />
                  </div>
                )}
              </div>
              {emailError && (
                <div className="text-red-500 text-xs mt-1.5 flex items-center gap-1.5">
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
                placeholder="Enter your phone number"
                label="Phone Number"
                required={true}
                error={phoneError}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-medium text-gray-700 text-sm">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input 
                  name="password" 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password" 
                  value={form.password} 
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 pr-10 border-2 rounded-lg text-sm transition-all duration-300 focus:outline-none focus:bg-white focus:shadow-md ${
                    passwordError 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:bg-red-50' 
                      : 'border-gray-200 focus:border-indigo-500'
                  }`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                </button>
              </div>
              {passwordError && (
                <div className="text-red-500 text-xs mt-1.5 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {passwordError}
                </div>
              )}
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-700 text-sm">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input 
                  name="confirmPassword" 
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password" 
                  value={form.confirmPassword} 
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 pr-10 border-2 rounded-lg text-sm transition-all duration-300 focus:outline-none focus:bg-white focus:shadow-md ${
                    confirmPasswordError 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:bg-red-50' 
                      : 'border-gray-200 focus:border-indigo-500'
                  }`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                </button>
              </div>
              {confirmPasswordError && (
                <div className="text-red-500 text-xs mt-1.5 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {confirmPasswordError}
                </div>
              )}
            </div>
          </div>

          {/* Profile Photo Upload */}
    

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-medium text-gray-700 text-sm">
                Domain <span className="text-red-500">*</span>
              </label>
                          <input 
              name="domain" 
              placeholder="e.g.,Cooking, Soccer, Violin, Swimming ... " 
              value={form.domain} 
              onChange={handleChange}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm transition-all duration-300 focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-md"
            />
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-700 text-sm">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea 
                name="address" 
                placeholder="Enter your address" 
                value={form.address} 
                onChange={handleChange}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm transition-all duration-300 focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-md resize-none"
                rows={3}
              />
            </div>
          </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700 text-sm">
                Experience <span className="text-red-500">*</span>
              </label>
            <textarea 
              name="experience" 
              placeholder="Describe your teaching experience, qualifications, and expertise..." 
              value={form.experience} 
              onChange={handleChange}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm transition-all duration-300 focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-md resize-none"
              rows={3}
            />
          </div>

                    {/* Optional Uploads Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Optional Documents</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* License Upload */}
            <div>
                <label className="block mb-3 font-medium text-gray-700 text-sm">
                  License Proof Upload
              </label>
              <div className="relative">
                  {!uploadedFiles.license ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-300 cursor-pointer group">
                <input 
                        type="file" 
                  name="driverLicense" 
                        id="license-upload"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        title="Upload your license proof"
                        onChange={handleDriverLicenseChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        multiple={false}
                      />
                      <div className="space-y-2">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-indigo-200 transition-colors duration-300">
                          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
              </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Click to upload</p>
                          <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG, DOC up to 5MB</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-green-200 bg-green-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
            </div>
            <div>
                            <p className="text-sm font-medium text-green-800 truncate">{uploadedFiles.license.name}</p>
                            <p className="text-xs text-green-600">{(uploadedFiles.license.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('license')}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-100 rounded-lg transition-colors duration-200"
                          title="Remove file"
                        >
                          <FaTimes className="text-sm" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {driverLicenseError && (
                  <div className="text-red-500 text-xs mt-2 flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {driverLicenseError}
                  </div>
                )}
              </div>

              {/* Resume Upload */}
              <div>
                <label className="block mb-3 font-medium text-gray-700 text-sm">
                Resume Upload
              </label>
                <div className="relative">
                  {!uploadedFiles.resume ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 cursor-pointer group">
              <input 
                type="file" 
                name="resume" 
                id="resume-upload"
                title="Upload your resume"
                onChange={handleResumeChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        multiple={false}
                      />
                      <div className="space-y-2">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-blue-200 transition-colors duration-300">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Click to upload</p>
                          <p className="text-xs text-gray-500 mt-1">Any format up to 10MB</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-green-200 bg-green-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-green-800 truncate">{uploadedFiles.resume.name}</p>
                            <p className="text-xs text-green-600">{(uploadedFiles.resume.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('resume')}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-100 rounded-lg transition-colors duration-200"
                          title="Remove file"
                        >
                          <FaTimes className="text-sm" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              {resumeError && (
                  <div className="text-red-500 text-xs mt-2 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {resumeError}
                </div>
              )}
          </div>

              {/* Video Upload */}
            <div>
                <label className="block mb-3 font-medium text-gray-700 text-sm">
                Intro Video Upload
              </label>
                <div className="relative">
                  {!uploadedFiles.video ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 cursor-pointer group">
              <input 
                type="file" 
                name="introVideo" 
                id="introVideo-upload"
                accept="video/*" 
                title="Upload your intro video"
                onChange={handleVideoChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        multiple={false}
                      />
                      <div className="space-y-2">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-purple-200 transition-colors duration-300">
                          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Click to upload</p>
                          <p className="text-xs text-gray-500 mt-1">Video format up to 50MB</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-green-200 bg-green-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-green-800 truncate">{uploadedFiles.video.name}</p>
                            <p className="text-xs text-green-600">{(uploadedFiles.video.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('video')}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-100 rounded-lg transition-colors duration-200"
                          title="Remove file"
                        >
                          <FaTimes className="text-sm" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              {videoError && (
                  <div className="text-red-500 text-xs mt-2 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {videoError}
                </div>
              )}
              </div>
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700 text-sm">
              Language(s) <span className="text-red-500">*</span>
            </label>
                         <div className="relative" ref={languageDropdownRef}>
              <div className={`w-full px-3 py-2.5 border-2 rounded-lg text-sm transition-all duration-300 cursor-pointer ${
                showLanguageDropdown 
                  ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg' 
                  : 'border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 hover:border-indigo-300 hover:from-indigo-50 hover:to-purple-50'
              }`}
                onClick={() => {
                  const newState = !showLanguageDropdown;
                  setShowLanguageDropdown(newState);
                  if (newState) {
                    // Recalculate position when opening
                    setTimeout(calculateDropdownPosition, 0);
                  }
                }}>
                 <div className="flex items-center justify-between">
                   <div className="flex flex-wrap gap-1 min-h-[20px]">
                     {selectedLanguages.length === 0 ? (
                       <span className="text-gray-500">Select languages you can teach in</span>
                     ) : (
                       selectedLanguages.map((lang) => (
                         <span
                           key={lang}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full border border-indigo-200 shadow-sm"
                         >
                           {lang}
                           <button
                             type="button"
                             className="text-indigo-500 hover:text-indigo-700"
                             onClick={(e) => {
                               e.stopPropagation();
                               handleLanguageRemove(lang);
                             }}
                             title={`Remove ${lang}`}
                             aria-label={`Remove ${lang}`}
                           >
                             <FaTimes className="text-xs" />
                           </button>
                         </span>
                       ))
                     )}
                   </div>
                   <FaChevronDown className={`text-gray-400 transition-transform duration-200 ${showLanguageDropdown ? 'rotate-180' : ''}`} />
                 </div>
               </div>
              {showLanguageDropdown && (
                <div className={`absolute z-10 w-full bg-white border-2 border-indigo-200 rounded-xl shadow-2xl max-h-80 overflow-hidden ${
                  dropdownPosition === 'above' 
                    ? 'bottom-full mb-1' 
                    : 'top-full mt-1'
                }`}>
                  <div className="p-3 border-b border-indigo-100 bg-indigo-50">
                    <input
                      type="text"
                      placeholder="Search languages..."
                      value={languageSearch}
                      onChange={handleLanguageSearch}
                      className="w-full px-3 py-2 border-2 border-indigo-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 bg-white shadow-sm"
                      autoFocus
                    />
                  </div>

                  {/* Pagination Controls - Sticky Top */}
                  {filteredLanguages.length > languagesPerPage && (
                    <div className="sticky top-0 z-10 p-2 border-b border-indigo-100 bg-indigo-50 shadow-sm">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={goToPrevPage}
                          disabled={currentPage === 1}
                          className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-white border-2 border-indigo-200 rounded-md hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-indigo-200 shadow-sm"
                        >
                          ← Prev
                        </button>
                        
                        <div className="flex items-center gap-1">
                          {/* Dynamic page numbers based on current page */}
                          {(() => {
                            const pages: React.ReactNode[] = [];
                            const maxVisible = 5;
                            let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                            let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                            
                            // Adjust start if we're near the end
                            if (endPage - startPage < maxVisible - 1) {
                              startPage = Math.max(1, endPage - maxVisible + 1);
                            }
                            
                            // Show first page if not in range
                            if (startPage > 1) {
                              pages.push(
                                <button
                                  key={1}
                                  type="button"
                                  onClick={() => goToPage(1)}
                                  className="w-7 h-7 text-xs font-medium rounded-md transition-all duration-200 text-indigo-700 bg-white border-2 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 shadow-sm"
                                >
                                  1
                                </button>
                              );
                              if (startPage > 2) {
                                pages.push(
                                  <span key="ellipsis1" className="text-xs text-indigo-400 mx-1 font-medium">...</span>
                                );
                              }
                            }
                            
                            // Show current range
                            for (let i = startPage; i <= endPage; i++) {
                              pages.push(
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => goToPage(i)}
                                  className={`w-7 h-7 text-xs font-medium rounded-md transition-all duration-200 shadow-sm ${
                                    currentPage === i
                                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                      : 'text-indigo-700 bg-white border-2 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300'
                                  }`}
                                >
                                  {i}
                                </button>
                              );
                            }
                            
                            // Show last page if not in range
                            if (endPage < totalPages) {
                              if (endPage < totalPages - 1) {
                                pages.push(
                                  <span key="ellipsis2" className="text-xs text-indigo-400 mx-1 font-medium">...</span>
                                );
                              }
                              pages.push(
                                <button
                                  key={totalPages}
                                  type="button"
                                  onClick={() => goToPage(totalPages)}
                                  className="w-7 h-7 text-xs font-medium rounded-md transition-all duration-200 text-indigo-700 bg-white border-2 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 shadow-sm"
                                >
                                  {totalPages}
                                </button>
                              );
                            }
                            
                            return pages;
                          })()}
                        </div>
                        
                        <button
                          type="button"
                          onClick={goToNextPage}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-white border-2 border-indigo-200 rounded-md hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-indigo-200 shadow-sm"
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="max-h-60 overflow-y-auto custom-scrollbar pr-1">
                    {filteredLanguages.length === 0 && languageSearch.length > 0 && (
                      <div className="p-4 text-gray-500 text-sm text-center">
                        <div className="text-gray-400 mb-2">🔍</div>
                        No languages found matching "{languageSearch}"
                      </div>
                    )}
                    {filteredLanguages.length === 0 && languageSearch.length === 0 && (
                      <div className="p-4 text-gray-500 text-sm text-center">
                        <div className="text-gray-400 mb-2">🌍</div>
                        Start typing to search languages
                        <div className="text-xs text-gray-400 mt-1">Showing {allLanguages.length} languages available</div>
                      </div>
                    )}
                    {filteredLanguages.length > 0 && (
                      <div className="p-2 text-xs text-gray-600 text-center border-b border-gray-100 bg-gray-50 font-medium">
                        Showing {currentLanguages.length} of {filteredLanguages.length} languages (Page {currentPage} of {totalPages})
                      </div>
                    )}
                    {currentLanguages.map((lang) => (
                      <div
                        key={lang}
                        className="flex items-center justify-between p-3 cursor-pointer hover:bg-indigo-50 transition-all duration-200 border-b border-gray-100 last:border-b-0 group"
                        onClick={() => handleLanguageSelect(lang)}
                      >
                        <span className="text-gray-800 font-medium text-sm group-hover:text-indigo-900">{lang}</span>
                        <button
                          type="button"
                          className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1.5 rounded-full hover:bg-red-50 flex-shrink-0 group-hover:bg-indigo-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLanguageRemove(lang);
                          }}
                          title={`Remove ${lang}`}
                          aria-label={`Remove ${lang}`}
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {languageError && (
              <div className="text-red-500 text-xs mt-1.5 flex items-center gap-1.5">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {languageError}
              </div>
            )}
          </div>

         

          <button 
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-none rounded-lg text-base font-semibold cursor-pointer shadow-lg transition-all duration-300 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:-translate-y-1 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-indigo-500/20 hover:border-indigo-400/30" 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <FaSpinner className="animate-spin text-base" />
                Registering...
              </div>
            ) : (
              'Join as Coach'
            )}
          </button>

          <div className="text-center">
                         <button 
               className="bg-transparent border-none text-indigo-600 font-medium cursor-pointer text-sm transition-all duration-300 hover:text-indigo-800 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded" 
               type="button" 
               onClick={onBack}
             >
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