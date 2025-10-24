import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchReapplicationData, resubmitApplication } from '../api/auth';
import { showSuccessToast, showErrorToast } from '../components/Toast';
import { FaSpinner, FaExclamationCircle, FaCheckCircle, FaEye, FaEyeSlash, FaTimes, FaChevronDown, FaArrowLeft, FaUpload, FaFile, FaFilePdf, FaFileVideo, FaFileImage } from 'react-icons/fa';
import ISO6391 from 'iso-639-1';
import CustomPhoneInput from '../components/PhoneInput';

interface CoachData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  domain: string;
  experienceDescription: string;
  address: string;
  languages: string[];
  hourlyRate?: number;
  bio?: string;
  licenseFileUrl?: string;
  resumeFileUrl?: string;
  introVideoUrl?: string;
  idVerificationFileUrl?: string;
}

const ReapplyCoach: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coachData, setCoachData] = useState<CoachData | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  // Form state - matching RegisterCoach.tsx exactly
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    domain: '',
    experience: '',  // experienceDescription
    street: '',
    city: '',
    state: '',
    linkedIn: '',
    instagram: '',
  });

  // Language selection state - matching RegisterCoach
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [languageSearch, setLanguageSearch] = useState('');
  const [languageError, setLanguageError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const languagesPerPage = 20;
  const [dropdownPosition, setDropdownPosition] = useState<'above' | 'below'>('below');

  // Ref for language dropdown
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  // File upload state - matching RegisterCoach
  const [uploadedFiles, setUploadedFiles] = useState({
    photo: null as File | null,
    license: null as File | null,
    resume: null as File | null,
    video: null as File | null,
    idVerification: null as File | null
  });

  // Existing file URLs from previous submission
  const [existingFiles, setExistingFiles] = useState({
    license: '',
    resume: '',
    video: '',
    idVerification: ''
  });

  // File error states
  const [photoError, setPhotoError] = useState('');
  const [resumeError, setResumeError] = useState('');
  const [videoError, setVideoError] = useState('');
  const [idVerificationError, setIdVerificationError] = useState('');
  const [licenseError, setLicenseError] = useState('');

  // File size limits (matching RegisterCoach)
  const RESUME_MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const VIDEO_MAX_SIZE = 50 * 1024 * 1024; // 50MB
  const LICENSE_MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ID_VERIFICATION_MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const PHOTO_MAX_SIZE = 5 * 1024 * 1024; // 5MB

  // Validation states
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [domainError, setDomainError] = useState('');
  const [experienceError, setExperienceError] = useState('');
  const [streetError, setStreetError] = useState('');
  const [cityError, setCityError] = useState('');
  const [stateError, setStateError] = useState('');
  const [linkedInError, setLinkedInError] = useState('');
  const [instagramError, setInstagramError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Get all languages (matching RegisterCoach)
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

  // Fetch coach data on component mount
  useEffect(() => {
    if (!token) {
      setError('Invalid reapplication link');
      setLoading(false);
      return;
    }

    fetchReapplicationData(token)
      .then((response) => {
        const data = response.data.data;
        setCoachData(data.coach);
        setRejectionReason(data.rejectionReason);
        setExpiresAt(data.expiresAt);

        // Split address into street, city, state
        const addressParts = data.coach.address ? data.coach.address.split(',').map((s: string) => s.trim()) : ['', '', ''];
        const street = addressParts[0] || '';
        const city = addressParts[1] || '';
        const state = addressParts[2] || '';

        // Pre-fill form
        setForm({
          firstName: data.coach.firstName || '',
          lastName: data.coach.lastName || '',
          email: data.coach.email || '',
          phone: data.coach.phone || '',
          domain: data.coach.domain || '',
          experience: data.coach.experienceDescription || '',
          street,
          city,
          state,
          linkedIn: '', // Not stored in backend
          instagram: '', // Not stored in backend
        });

        // Pre-fill languages
        setSelectedLanguages(data.coach.languages || []);

        // Store existing file URLs
        setExistingFiles({
          license: data.coach.licenseFileUrl || '',
          resume: data.coach.resumeFileUrl || '',
          video: data.coach.introVideoUrl || '',
          idVerification: data.coach.idVerificationFileUrl || ''
        });

        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch reapplication data:', err);
        setError(err.response?.data?.message || 'Failed to load application data. The link may be expired or invalid.');
        setLoading(false);
      });
  }, [token]);

  // Language selection handlers (matching RegisterCoach)
  const handleLanguageSelect = (language: string) => {
    if (!selectedLanguages.includes(language)) {
      setSelectedLanguages([...selectedLanguages, language]);
      setLanguageError('');
    }
    setLanguageSearch('');
    setShowLanguageDropdown(false);
    setCurrentPage(1);
  };

  const handleLanguageRemove = (language: string) => {
    setSelectedLanguages(selectedLanguages.filter(lang => lang !== language));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
    };

    if (showLanguageDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageDropdown]);

  // File handlers (matching RegisterCoach)
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > PHOTO_MAX_SIZE) {
        setPhotoError('Photo size must be less than 5MB');
        e.target.value = '';
        return;
      }
      const allowedTypes = ['.jpg', '.jpeg', '.png', '.webp'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        setPhotoError('Please upload a valid image file (JPG, PNG, WEBP)');
        e.target.value = '';
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
        setLicenseError('License file size must be less than 5MB.');
        e.target.value = '';
      } else {
        setLicenseError('');
        setUploadedFiles(prev => ({ ...prev, license: file }));
      }
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > RESUME_MAX_SIZE) {
        setResumeError('Resume file size must be less than 10MB.');
        e.target.value = '';
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
        e.target.value = '';
      } else {
        setVideoError('');
        setUploadedFiles(prev => ({ ...prev, video: file }));
      }
    }
  };

  const handleIdVerificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > ID_VERIFICATION_MAX_SIZE) {
        setIdVerificationError('ID verification file size must be less than 5MB.');
        e.target.value = '';
        return;
      }
      const allowedTypes = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        setIdVerificationError('Please upload a valid file (JPG, PNG, WEBP, PDF)');
        e.target.value = '';
        return;
      }
      setIdVerificationError('');
      setUploadedFiles(prev => ({ ...prev, idVerification: file }));
    }
  };

  // Remove file functions
  const removeFile = (fileType: 'photo' | 'license' | 'resume' | 'video' | 'idVerification') => {
    setUploadedFiles(prev => ({ ...prev, [fileType]: null }));
    const inputId = fileType === 'photo' ? 'photo-upload' :
                   fileType === 'license' ? 'license-upload' :
                   fileType === 'resume' ? 'resume-upload' :
                   fileType === 'video' ? 'video-upload' : 'id-verification-upload';
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) input.value = '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    // Clear errors on change
    switch(name) {
      case 'firstName': setFirstNameError(''); break;
      case 'lastName': setLastNameError(''); break;
      case 'domain': setDomainError(''); break;
      case 'experience': setExperienceError(''); break;
      case 'street': setStreetError(''); break;
      case 'city': setCityError(''); break;
      case 'state': setStateError(''); break;
      case 'linkedIn': setLinkedInError(''); break;
      case 'instagram': setInstagramError(''); break;
    }
  };

  const handlePhoneChange = (value: string, country: any) => {
    setForm(prev => ({ ...prev, phone: value }));
  };

  const handlePhoneValidationChange = (isValid: boolean, errorMessage: string) => {
    setPhoneError(errorMessage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const errors: string[] = [];

    if (!form.firstName.trim()) errors.push('First name is required');
    if (!form.lastName.trim()) errors.push('Last name is required');
    if (!form.domain.trim()) errors.push('Teaching domain is required');
    if (!form.experience.trim()) errors.push('Experience description is required');
    if (!form.street.trim()) errors.push('Street address is required');
    if (!form.city.trim()) errors.push('City is required');
    if (!form.state.trim()) errors.push('State is required');
    if (selectedLanguages.length === 0) errors.push('At least one language is required');

    if (errors.length > 0) {
      showErrorToast(errors.slice(0, 3).map((err, idx) => `${idx + 1}. ${err}`).join('\n'));
      return;
    }

    setSubmitting(true);

    try {
      // Combine address fields (matching RegisterCoach)
      const fullAddress = `${form.street.trim()}, ${form.city.trim()}, ${form.state.trim()}`;

      // Prepare data with FormData for file uploads (matching RegisterCoach)
      const formData = new FormData();
      
      formData.append('token', token!);
      formData.append('firstName', form.firstName.trim());
      formData.append('lastName', form.lastName.trim());
      formData.append('phone', form.phone);
      formData.append('domain', form.domain.trim());
      formData.append('experience', form.experience.trim()); // Backend maps to experienceDescription
      formData.append('address', fullAddress);
      formData.append('languages', JSON.stringify(selectedLanguages));
      
      if (form.linkedIn.trim()) formData.append('linkedIn', form.linkedIn.trim());
      if (form.instagram.trim()) formData.append('instagram', form.instagram.trim());

      // Add files if new ones were uploaded
      if (uploadedFiles.license) formData.append('license', uploadedFiles.license);
      if (uploadedFiles.resume) formData.append('resume', uploadedFiles.resume);
      if (uploadedFiles.video) formData.append('video', uploadedFiles.video);
      if (uploadedFiles.idVerification) formData.append('idVerification', uploadedFiles.idVerification);

      // Make API call with FormData
      await resubmitApplication(token!, formData);

      showSuccessToast('Application resubmitted successfully!');
      
      // Redirect to success page after 2 seconds
      setTimeout(() => {
        navigate('/reapply-success');
      }, 2000);
    } catch (err: any) {
      console.error('Failed to resubmit application:', err);
      showErrorToast(err.response?.data?.message || 'Failed to resubmit application');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-5xl text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading your application...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
          <FaExclamationCircle className="text-6xl text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid or Expired Link</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Update Your Coach Application</h1>
            <button
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Back to Home"
            >
              <FaArrowLeft className="text-xl" />
            </button>
          </div>
          <p className="text-gray-600">
            Please review the feedback below and update your application details as needed.
          </p>
        </div>

        {/* Feedback Box */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 rounded-lg p-6 mb-6 shadow-md">
          <div className="flex items-start">
            <FaExclamationCircle className="text-orange-600 text-2xl mr-4 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Admin Feedback:</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{rejectionReason}</p>
            </div>
          </div>
        </div>

        {/* Expiry Notice */}
        {expiresAt && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>⏰ Link Expires:</strong> {new Date(expiresAt).toLocaleString()}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {firstNameError && <p className="text-red-500 text-sm mt-1">{firstNameError}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {lastNameError && <p className="text-red-500 text-sm mt-1">{lastNameError}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-gray-500 text-xs">(Cannot be changed)</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <CustomPhoneInput
                  value={form.phone}
                  onChange={handlePhoneChange}
                  onValidationChange={handlePhoneValidationChange}
                />
                {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Information</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teaching Domain <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="domain"
                  value={form.domain}
                  onChange={handleInputChange}
                  placeholder="e.g., Mathematics, Science, Programming, English"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {domainError && <p className="text-red-500 text-sm mt-1">{domainError}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="experience"
                  value={form.experience}
                  onChange={handleInputChange}
                  placeholder="Describe your teaching experience, qualifications, expertise, grades taught, and teaching methods..."
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-sm text-gray-500 mt-1">{form.experience.length} characters</p>
                {experienceError && <p className="text-red-500 text-sm mt-1">{experienceError}</p>}
              </div>

              {/* Address Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="street"
                  value={form.street}
                  onChange={handleInputChange}
                  placeholder="123 Main Street"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {streetError && <p className="text-red-500 text-sm mt-1">{streetError}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {cityError && <p className="text-red-500 text-sm mt-1">{cityError}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {stateError && <p className="text-red-500 text-sm mt-1">{stateError}</p>}
                </div>
              </div>

              {/* Languages - Matching RegisterCoach dropdown */}
              <div className="relative" ref={languageDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages <span className="text-red-500">*</span>
                </label>
                <div
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer bg-white hover:border-blue-400 transition-colors"
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">
                      {selectedLanguages.length > 0 ? `${selectedLanguages.length} language(s) selected` : 'Select languages'}
                    </span>
                    <FaChevronDown className={`text-gray-400 transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Selected Languages Display */}
                {selectedLanguages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedLanguages.map((lang) => (
                      <span
                        key={lang}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {lang}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLanguageRemove(lang);
                          }}
                          className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                        >
                          <FaTimes />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Language Dropdown */}
                {showLanguageDropdown && (
                  <div className={`absolute ${dropdownPosition === 'above' ? 'bottom-full mb-1' : 'top-full mt-1'} left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden`}>
                    <div className="p-3 border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="Search languages..."
                        value={languageSearch}
                        onChange={(e) => {
                          setLanguageSearch(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto">
                      {currentLanguages.map((language) => (
                        <div
                          key={language}
                          onClick={() => handleLanguageSelect(language)}
                          className={`px-4 py-2 hover:bg-blue-50 cursor-pointer ${
                            selectedLanguages.includes(language) ? 'bg-blue-100 text-blue-800 font-medium' : 'text-gray-700'
                          }`}
                        >
                          {language}
                          {selectedLanguages.includes(language) && <span className="ml-2">✓</span>}
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="p-3 border-t border-gray-200 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentPage(Math.max(1, currentPage - 1));
                          }}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <span className="text-sm text-gray-600">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentPage(Math.min(totalPages, currentPage + 1));
                          }}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {languageError && <p className="text-red-500 text-sm mt-1">{languageError}</p>}
              </div>

              {/* Social Media Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn Profile (Optional)
                  </label>
                  <input
                    type="url"
                    name="linkedIn"
                    value={form.linkedIn}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {linkedInError && <p className="text-red-500 text-sm mt-1">{linkedInError}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram Profile (Optional)
                  </label>
                  <input
                    type="url"
                    name="instagram"
                    value={form.instagram}
                    onChange={handleInputChange}
                    placeholder="https://instagram.com/yourprofile"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {instagramError && <p className="text-red-500 text-sm mt-1">{instagramError}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* File Uploads Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Documents & Files</h2>
            
            {/* License/Certification */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teaching License or Certification (Optional)
              </label>
              {existingFiles.license && !uploadedFiles.license && (
                <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✓ Existing file: <a href={existingFiles.license} target="_blank" rel="noopener noreferrer" className="underline">View current file</a>
                  </p>
                  <p className="text-xs text-green-700 mt-1">Upload a new file below to replace it</p>
                </div>
              )}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                {uploadedFiles.license ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FaFile className="text-blue-600 text-2xl mr-3" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">{uploadedFiles.license.name}</p>
                        <p className="text-xs text-gray-500">{(uploadedFiles.license.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile('license')}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <>
                    <FaUpload className="text-gray-400 text-3xl mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Click to upload license or drag and drop</p>
                    <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG (Max 5MB)</p>
                    <input
                      id="license-upload"
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleDriverLicenseChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('license-upload')?.click()}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Choose File
                    </button>
                  </>
                )}
              </div>
              {licenseError && <p className="text-red-500 text-sm mt-1">{licenseError}</p>}
            </div>

            {/* Resume */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resume/CV (Optional)
              </label>
              {existingFiles.resume && !uploadedFiles.resume && (
                <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✓ Existing file: <a href={existingFiles.resume} target="_blank" rel="noopener noreferrer" className="underline">View current file</a>
                  </p>
                  <p className="text-xs text-green-700 mt-1">Upload a new file below to replace it</p>
                </div>
              )}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                {uploadedFiles.resume ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FaFilePdf className="text-red-600 text-2xl mr-3" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">{uploadedFiles.resume.name}</p>
                        <p className="text-xs text-gray-500">{(uploadedFiles.resume.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile('resume')}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <>
                    <FaUpload className="text-gray-400 text-3xl mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Click to upload resume or drag and drop</p>
                    <p className="text-xs text-gray-500">PDF, DOC, DOCX (Max 10MB)</p>
                    <input
                      id="resume-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('resume-upload')?.click()}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Choose File
                    </button>
                  </>
                )}
              </div>
              {resumeError && <p className="text-red-500 text-sm mt-1">{resumeError}</p>}
            </div>

            {/* Introduction Video */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Introduction Video (Optional)
              </label>
              {existingFiles.video && !uploadedFiles.video && (
                <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✓ Existing file: <a href={existingFiles.video} target="_blank" rel="noopener noreferrer" className="underline">View current video</a>
                  </p>
                  <p className="text-xs text-green-700 mt-1">Upload a new file below to replace it</p>
                </div>
              )}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                {uploadedFiles.video ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FaFileVideo className="text-purple-600 text-2xl mr-3" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">{uploadedFiles.video.name}</p>
                        <p className="text-xs text-gray-500">{(uploadedFiles.video.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile('video')}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <>
                    <FaUpload className="text-gray-400 text-3xl mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Click to upload video or drag and drop</p>
                    <p className="text-xs text-gray-500">MP4, MOV, AVI (Max 50MB)</p>
                    <input
                      id="video-upload"
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('video-upload')?.click()}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Choose File
                    </button>
                  </>
                )}
              </div>
              {videoError && <p className="text-red-500 text-sm mt-1">{videoError}</p>}
            </div>

            {/* ID Verification */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Verification (Government-issued ID) (Optional)
              </label>
              {existingFiles.idVerification && !uploadedFiles.idVerification && (
                <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✓ Existing file: <a href={existingFiles.idVerification} target="_blank" rel="noopener noreferrer" className="underline">View current ID</a>
                  </p>
                  <p className="text-xs text-green-700 mt-1">Upload a new file below to replace it</p>
                </div>
              )}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                {uploadedFiles.idVerification ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FaFileImage className="text-indigo-600 text-2xl mr-3" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">{uploadedFiles.idVerification.name}</p>
                        <p className="text-xs text-gray-500">{(uploadedFiles.idVerification.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile('idVerification')}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <>
                    <FaUpload className="text-gray-400 text-3xl mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Click to upload ID or drag and drop</p>
                    <p className="text-xs text-gray-500">JPG, PNG, PDF (Max 5MB)</p>
                    <input
                      id="id-verification-upload"
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleIdVerificationChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('id-verification-upload')?.click()}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Choose File
                    </button>
                  </>
                )}
              </div>
              {idVerificationError && <p className="text-red-500 text-sm mt-1">{idVerificationError}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                disabled={submitting}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Resubmitting...
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    Resubmit Application
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReapplyCoach;
