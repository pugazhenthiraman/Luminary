import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  FaTimes, 
  FaUpload, 
  FaCalendarAlt, 
  FaClock, 
  FaDollarSign,
  FaBook,
  FaStar,
  FaVideo,
  FaCheck,
  FaExclamationTriangle,
  FaPlus
} from 'react-icons/fa';

import { toast } from 'react-toastify';

interface CreateCourseFormProps {
  onClose: () => void;
  onSubmit: (courseData: CourseFormData) => void;
  initialData?: Partial<CourseFormData>;
  isEditing?: boolean;
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  sessions: number;
  sessionDuration: number;
  bufferTime: number;
}

interface DaySchedule {
  day: string;
  isActive: boolean;
  timeSlots: TimeSlot[];
}

interface CourseFormData {
  title: string;
  description: string;
  benefits: string;
  category: string;
  program: 'morning' | 'afternoon' | 'evening';
  credits: number;
  timezone: string;
  introVideo?: File;
  weeklySchedule: DaySchedule[];
  thumbnail?: File;
}

const CreateCourseForm: React.FC<CreateCourseFormProps> = ({ onClose, onSubmit, initialData, isEditing = false }) => {
  const [formData, setFormData] = useState<CourseFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    benefits: initialData?.benefits || '',
    category: initialData?.category || '',
    program: initialData?.program || 'morning',
    credits: initialData?.credits || 0,
    timezone: initialData?.timezone || '',
    weeklySchedule: initialData?.weeklySchedule || [
      { day: 'SUNDAYS', isActive: false, timeSlots: [] },
      { day: 'MONDAYS', isActive: false, timeSlots: [] },
      { day: 'TUESDAYS', isActive: false, timeSlots: [] },
      { day: 'WEDNESDAYS', isActive: false, timeSlots: [] },
      { day: 'THURSDAYS', isActive: false, timeSlots: [] },
      { day: 'FRIDAYS', isActive: false, timeSlots: [] },
      { day: 'SATURDAYS', isActive: false, timeSlots: [] }
    ]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [uploadedThumbnail, setUploadedThumbnail] = useState<File | null>(null);
  const [isTimezoneDropdownOpen, setIsTimezoneDropdownOpen] = useState(false);
  const [timezoneSearchTerm, setTimezoneSearchTerm] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [openTimeDropdown, setOpenTimeDropdown] = useState<{dayIndex: number, slotId: string, type: 'start' | 'end'} | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{top: number, left: number, width: number} | null>(null);

  const videoRef = useRef<HTMLInputElement>(null);
  const thumbnailRef = useRef<HTMLInputElement>(null);
  const timezoneDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const timeDropdownRef = useRef<HTMLDivElement>(null);
  const timezoneButtonRef = useRef<HTMLButtonElement>(null);
  const categoryButtonRef = useRef<HTMLButtonElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  // Category data
  const categories = [
    { value: 'academic-enrichment', label: 'Academic Enrichment' },
    { value: 'creative-arts', label: 'Creative Arts' },
    { value: 'life-skills', label: 'Life Skills' },
    { value: 'performing-arts', label: 'Performing Arts' },
    { value: 'sports-physical', label: 'Sports & Physical Activity' },
    { value: 'technology-stem', label: 'Technology & STEM' },
    { value: 'mindfulness-wellbeing', label: 'Mindfulness & Wellbeing' },
    { value: 'languages-communication', label: 'Languages & Communication' }
  ];

  // Timezone data
  const timezones = [
    { value: 'UTC', label: 'Coordinated Universal Time (UTC)', region: 'Other', flag: '🌍' },
    { value: 'EST', label: 'Eastern Time (EST/EDT)', region: 'North America', flag: '🇺🇸' },
    { value: 'CST', label: 'Central Time (CST/CDT)', region: 'North America', flag: '🇺🇸' },
    { value: 'MST', label: 'Mountain Time (MST/MDT)', region: 'North America', flag: '🇺🇸' },
    { value: 'PST', label: 'Pacific Time (PST/PDT)', region: 'North America', flag: '🇺🇸' },
    { value: 'AKST', label: 'Alaska Time (AKST/AKDT)', region: 'North America', flag: '🇺🇸' },
    { value: 'HST', label: 'Hawaii Time (HST/HDT)', region: 'North America', flag: '🇺🇸' },
    { value: 'GMT', label: 'Greenwich Mean Time (GMT)', region: 'Europe', flag: '🇬🇧' },
    { value: 'CET', label: 'Central European Time (CET/CEST)', region: 'Europe', flag: '🇪🇺' },
    { value: 'EET', label: 'Eastern European Time (EET/EEST)', region: 'Europe', flag: '🇪🇺' },
    { value: 'WET', label: 'Western European Time (WET/WEST)', region: 'Europe', flag: '🇪🇺' },
    { value: 'JST', label: 'Japan Standard Time (JST)', region: 'Asia', flag: '🇯🇵' },
    { value: 'CST_CN', label: 'China Standard Time (CST)', region: 'Asia', flag: '🇨🇳' },
    { value: 'IST', label: 'India Standard Time (IST)', region: 'Asia', flag: '🇮🇳' },
    { value: 'KST', label: 'Korea Standard Time (KST)', region: 'Asia', flag: '🇰🇷' },
    { value: 'SGT', label: 'Singapore Time (SGT)', region: 'Asia', flag: '🇸🇬' },
    { value: 'AEST', label: 'Australian Eastern Time (AEST/AEDT)', region: 'Australia & Pacific', flag: '🇦🇺' },
    { value: 'ACST', label: 'Australian Central Time (ACST/ACDT)', region: 'Australia & Pacific', flag: '🇦🇺' },
    { value: 'AWST', label: 'Australian Western Time (AWST)', region: 'Australia & Pacific', flag: '🇦🇺' },
    { value: 'NZT', label: 'New Zealand Time (NZST/NZDT)', region: 'Australia & Pacific', flag: '🇳🇿' },
    { value: 'SAST', label: 'South Africa Standard Time (SAST)', region: 'Other', flag: '🇿🇦' },
    { value: 'BRT', label: 'Brazil Time (BRT/BRST)', region: 'Other', flag: '🇧🇷' }
  ];

  // Filter categories based on search term
  const filteredCategories = categories.filter(cat => 
    cat.label.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  // Filter timezones based on search term
  const filteredTimezones = timezones.filter(tz => 
    tz.label.toLowerCase().includes(timezoneSearchTerm.toLowerCase()) ||
    tz.region.toLowerCase().includes(timezoneSearchTerm.toLowerCase())
  );

  // Group timezones by region
  const groupedTimezones = filteredTimezones.reduce((groups, tz) => {
    if (!groups[tz.region]) {
      groups[tz.region] = [];
    }
    groups[tz.region].push(tz);
    return groups;
  }, {} as Record<string, typeof timezones>);

  // Get selected category display
  const selectedCategory = categories.find(cat => cat.value === formData.category);

  // Get selected timezone display
  const selectedTimezone = timezones.find(tz => tz.value === formData.timezone);

  // Handle scroll to update dropdown position
  const handleScroll = () => {
    if (isTimezoneDropdownOpen && timezoneButtonRef.current) {
      const rect = timezoneButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width
      });
    }
  };

  // Handle click outside dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Check if click is outside category dropdown
      if (isCategoryDropdownOpen && categoryButtonRef.current && !categoryButtonRef.current.contains(target)) {
        // Check if click is on the portal dropdown
        const portalDropdown = document.querySelector('[data-portal-dropdown="category"]');
        if (!portalDropdown?.contains(target)) {
          setIsCategoryDropdownOpen(false);
          setCategorySearchTerm('');
        }
      }
      
      // Check if click is outside timezone dropdown
      if (isTimezoneDropdownOpen && timezoneButtonRef.current && !timezoneButtonRef.current.contains(target)) {
        // Check if click is on the portal dropdown
        const portalDropdown = document.querySelector('[data-portal-dropdown="timezone"]');
        if (!portalDropdown?.contains(target)) {
          setIsTimezoneDropdownOpen(false);
          setTimezoneSearchTerm('');
          setDropdownPosition(null);
        }
      }
      
      // Check if click is outside time dropdowns
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(target)) {
        setOpenTimeDropdown(null);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCategoryDropdownOpen(false);
        setIsTimezoneDropdownOpen(false);
        setOpenTimeDropdown(null);
        setCategorySearchTerm('');
        setTimezoneSearchTerm('');
        setDropdownPosition(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    
    // Add scroll listener to modal container
    if (modalContainerRef.current) {
      modalContainerRef.current.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
      
      // Remove scroll listener from modal container
      if (modalContainerRef.current) {
        modalContainerRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isTimezoneDropdownOpen, handleScroll]);

  const handleCategorySelect = (categoryValue: string) => {
    setFormData(prev => ({ ...prev, category: categoryValue }));
    setIsCategoryDropdownOpen(false);
    setCategorySearchTerm('');
    
    if (errors.category) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.category;
        return newErrors;
      });
    }
  };

  const handleTimezoneSelect = (timezoneValue: string) => {
    setFormData(prev => ({ ...prev, timezone: timezoneValue }));
    setIsTimezoneDropdownOpen(false);
    setTimezoneSearchTerm('');
    setDropdownPosition(null);
    
    if (errors.timezone) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.timezone;
        return newErrors;
      });
    }
  };

  // Time options for dropdown
  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    const displayTime = i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`;
    return { value: `${hour}:00`, label: displayTime };
  });

  const handleTimeSelect = (dayIndex: number, slotId: string, type: 'start' | 'end', timeValue: string) => {
    updateTimeSlot(dayIndex, slotId, type === 'start' ? 'startTime' : 'endTime', timeValue);
    setOpenTimeDropdown(null);
  };

  const formatTimeDisplay = (time: string) => {
    const [hour] = time.split(':');
    const hourNum = parseInt(hour);
    return hourNum === 0 ? '12:00 AM' : hourNum < 12 ? `${hourNum}:00 AM` : hourNum === 12 ? '12:00 PM' : `${hourNum - 12}:00 PM`;
  };


  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const missingFields: string[] = [];

    if (!formData.title.trim()) {
      newErrors.title = 'Course title is required';
      missingFields.push('Course Title');
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Course description is required';
      missingFields.push('Course Description');
    }

    if (!formData.benefits.trim()) {
      newErrors.benefits = 'Course benefits are required';
      missingFields.push('Course Benefits');
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Course category is required';
      missingFields.push('Course Category');
    }

    if (!formData.timezone.trim()) {
      newErrors.timezone = 'Please select your timezone';
      missingFields.push('Timezone');
    }

    if (formData.credits <= 0) {
      newErrors.credits = 'Course credits must be greater than 0';
      missingFields.push('Course Credits');
    }

    // Check if at least one day is active in the weekly schedule
    const hasActiveDay = formData.weeklySchedule.some(day => day.isActive);
    if (!hasActiveDay) {
      newErrors.weeklySchedule = 'At least one day must be selected for availability';
      missingFields.push('Weekly Schedule');
    }

    // Check if active days have time slots
    const activeDaysWithoutSlots = formData.weeklySchedule.filter(day => 
      day.isActive && day.timeSlots.length === 0
    );
    if (activeDaysWithoutSlots.length > 0) {
      newErrors.weeklySchedule = 'Active days must have at least one time slot';
      missingFields.push('Time Slots');
    }

    setErrors(newErrors);

    // Show toast notification for validation errors
    if (missingFields.length > 0) {
      let toastMessage = '';
      if (missingFields.length === 1) {
        toastMessage = `Please fill in: ${missingFields[0]}`;
      } else if (missingFields.length === 2) {
        toastMessage = `Please fill in: ${missingFields[0]} and ${missingFields[1]}`;
      } else {
        toastMessage = `Please fill in: ${missingFields.slice(0, -1).join(', ')}, and ${missingFields[missingFields.length - 1]}`;
      }
      
      toast.error(
        <div className="flex items-center space-x-2">
          <FaExclamationTriangle className="text-red-500" />
          <span>{toastMessage}</span>
        </div>,
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CourseFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleCreditsChange = (value: string) => {
    // Allow empty string or valid numbers
    if (value === '' || value === '0') {
      setFormData(prev => ({ ...prev, credits: 0 }));
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0) {
        setFormData(prev => ({ ...prev, credits: numValue }));
      }
    }
    
    if (errors.credits) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.credits;
        return newErrors;
      });
    }
  };

  const handleFileUpload = (type: 'video' | 'thumbnail', file: File) => {
    const maxSize = type === 'video' ? 100 * 1024 * 1024 : 5 * 1024 * 1024; // 100MB for video, 5MB for thumbnail
    
    if (file.size > maxSize) {
      toast.error(
        <div className="flex items-center space-x-2">
          <FaExclamationTriangle className="text-red-500" />
          <span>{type === 'video' ? 'Video' : 'Thumbnail'} file size must be less than {type === 'video' ? '100MB' : '5MB'}</span>
        </div>,
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
      return;
    }

    if (type === 'video') {
      setUploadedVideo(file);
      setFormData(prev => ({ ...prev, introVideo: file }));
      toast.success(
        <div className="flex items-center space-x-2">
          <FaCheck className="text-green-500" />
          <span>Video uploaded successfully!</span>
        </div>,
        {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } else {
      setUploadedThumbnail(file);
      setFormData(prev => ({ ...prev, thumbnail: file }));
      toast.success(
        <div className="flex items-center space-x-2">
          <FaCheck className="text-green-500" />
          <span>Thumbnail uploaded successfully!</span>
        </div>,
        {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    }
  };

  const handleRemoveFile = (type: 'video' | 'thumbnail') => {
    if (type === 'video') {
      setUploadedVideo(null);
      setFormData(prev => ({ ...prev, introVideo: undefined }));
      toast.info(
        <div className="flex items-center space-x-2">
          <FaTimes className="text-blue-500" />
          <span>Video removed</span>
        </div>,
        {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } else {
      setUploadedThumbnail(null);
      setFormData(prev => ({ ...prev, thumbnail: undefined }));
      toast.info(
        <div className="flex items-center space-x-2">
          <FaTimes className="text-blue-500" />
          <span>Thumbnail removed</span>
        </div>,
        {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    }
  };



  const toggleDayActive = (dayIndex: number) => {
    setFormData(prev => ({
      ...prev,
      weeklySchedule: prev.weeklySchedule.map((day, index) => 
        index === dayIndex ? { ...day, isActive: !day.isActive } : day
      )
    }));
  };

  const addTimeSlot = (dayIndex: number) => {
    const newTimeSlot: TimeSlot = {
      id: Date.now().toString(),
      startTime: '09:00',
      endTime: '17:00',
      sessions: 12,
      sessionDuration: 30,
      bufferTime: 10
    };

    setFormData(prev => ({
      ...prev,
      weeklySchedule: prev.weeklySchedule.map((day, index) => 
        index === dayIndex ? { ...day, timeSlots: [...day.timeSlots, newTimeSlot] } : day
      )
    }));
  };

  const removeTimeSlot = (dayIndex: number, timeSlotId: string) => {
    setFormData(prev => ({
      ...prev,
      weeklySchedule: prev.weeklySchedule.map((day, index) => 
        index === dayIndex ? { ...day, timeSlots: day.timeSlots.filter(slot => slot.id !== timeSlotId) } : day
      )
    }));
  };

  const updateTimeSlot = (dayIndex: number, timeSlotId: string, field: keyof TimeSlot, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      weeklySchedule: prev.weeklySchedule.map((day, index) => 
        index === dayIndex ? {
          ...day,
          timeSlots: day.timeSlots.map(slot => 
            slot.id === timeSlotId ? { ...slot, [field]: value } : slot
          )
        } : day
      )
    }));
  };

  const calculateSessions = (startTime: string, endTime: string, sessionDuration: number, bufferTime: number) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    const sessionWithBuffer = sessionDuration + bufferTime;
    return Math.floor(totalMinutes / sessionWithBuffer);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      toast.success(
        <div className="flex items-center space-x-2">
          <FaCheck className="text-green-500" />
          <span>{isEditing ? 'Course updated successfully!' : 'Course created successfully!'}</span>
        </div>,
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
      onClose();
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error(
        <div className="flex items-center space-x-2">
          <FaExclamationTriangle className="text-red-500" />
          <span>Failed to create course. Please try again.</span>
        </div>,
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

    return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9998] p-4">
      <div ref={modalContainerRef} className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-visible border border-gray-100">
        {/* Header */}
        <div className="relative px-8 py-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FaBook className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                  {isEditing ? 'Edit Course' : 'Create New Course'}
                </h2>
                <p className="text-gray-600 mt-1 font-medium">
                  {isEditing ? 'Update your course details and content' : 'Design and launch your educational content'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 flex items-center justify-center"
              aria-label="Close form"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div 
          className="overflow-y-auto max-h-[calc(95vh-140px)] overflow-x-visible"
          onScroll={handleScroll}
        >
          <form onSubmit={handleSubmit} className="p-8 space-y-10">
            {/* Basic Information Section */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                  <h3 className="text-xl font-bold text-gray-900">Course Details</h3>
                </div>
                <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                  Step 1 of 3
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Course Title */}
                  <div className="group">
                                          <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center justify-between">
                        <span>Course Title</span>
                        <span className="text-red-500 text-lg font-bold">*</span>
                      </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className={`w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-base bg-white group-hover:border-gray-300 ${
                          errors.title ? 'border-red-300 focus:ring-red-100 focus:border-red-500' : ''
                        }`}
                        placeholder="e.g., Advanced JavaScript Mastery"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      </div>
                    </div>
                    {errors.title && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm flex items-center space-x-2">
                          <FaExclamationTriangle className="text-red-500" />
                          <span>{errors.title}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Course Description */}
                  <div className="group">
                                          <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center justify-between">
                        <span>Course Description</span>
                        <span className="text-red-500 text-lg font-bold">*</span>
                      </label>
                    <div className="relative">
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={4}
                        className={`w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 resize-none text-base bg-white group-hover:border-gray-300 ${
                          errors.description ? 'border-red-300 focus:ring-red-100 focus:border-red-500' : ''
                        }`}
                        placeholder="Comprehensive overview of what students will learn..."
                      />
                    </div>
                    {errors.description && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm flex items-center space-x-2">
                          <FaExclamationTriangle className="text-red-500" />
                          <span>{errors.description}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Course Benefits */}
                  <div className="group">
                                          <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center justify-between">
                        <span>Course Benefits</span>
                        <span className="text-red-500 text-lg font-bold">*</span>
                      </label>
                    <div className="relative">
                      <textarea
                        value={formData.benefits}
                        onChange={(e) => handleInputChange('benefits', e.target.value)}
                        rows={3}
                        className={`w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 resize-none text-base bg-white group-hover:border-gray-300 ${
                          errors.benefits ? 'border-red-300 focus:ring-red-100 focus:border-red-500' : ''
                        }`}
                        placeholder="Key skills and knowledge students will acquire..."
                      />
                    </div>
                    {errors.benefits && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm flex items-center space-x-2">
                          <FaExclamationTriangle className="text-red-500" />
                          <span>{errors.benefits}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Course Category */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center justify-between">
                      <span>Course Category</span>
                      <span className="text-red-500 text-lg font-bold">*</span>
                    </label>
                    <div className="relative" ref={categoryDropdownRef}>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        </div>
                        <button
                          ref={categoryButtonRef}
                          type="button"
                          onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                          className={`w-full pl-8 pr-12 py-4 bg-gradient-to-r from-white to-gray-50 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-left text-base font-medium shadow-sm ${
                            isCategoryDropdownOpen 
                              ? 'border-blue-500 ring-blue-100' 
                              : 'border-gray-200 group-hover:border-gray-300 group-hover:from-white group-hover:to-blue-50'
                          } ${errors.category ? 'border-red-300 focus:ring-red-100 focus:border-red-500' : ''}`}
                          aria-label="Select course category"
                        >
                          {selectedCategory ? (
                            <span className="text-gray-700 font-semibold">{selectedCategory.label}</span>
                          ) : (
                            <span className="text-gray-500">Choose a category for your course</span>
                          )}
                        </button>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shadow-sm transition-all duration-200 ${
                            isCategoryDropdownOpen 
                              ? 'bg-gradient-to-br from-blue-600 to-blue-700 rotate-180' 
                              : 'bg-gradient-to-br from-blue-500 to-blue-600'
                          }`}>
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Category Dropdown */}
                      {isCategoryDropdownOpen && createPortal(
                        <div 
                          data-portal-dropdown="category"
                          className="fixed bg-white border-2 border-blue-200 rounded-xl shadow-xl z-[99999] min-w-[400px]"
                          style={{
                            top: categoryButtonRef.current ? Math.min(categoryButtonRef.current.getBoundingClientRect().bottom + 8, window.innerHeight - 300) : 0,
                            left: categoryButtonRef.current ? categoryButtonRef.current.getBoundingClientRect().left : 0,
                            width: categoryButtonRef.current ? categoryButtonRef.current.getBoundingClientRect().width : 'auto',
                            maxHeight: '300px'
                          }}
                        >
                          {/* Search Input */}
                          <div className="p-4 border-b border-gray-100">
                            <div className="relative">
                                                             <input
                                 type="text"
                                 placeholder="Search categories..."
                                 value={categorySearchTerm}
                                 onChange={(e) => setCategorySearchTerm(e.target.value)}
                                 className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                 autoFocus
                               />
                              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                          </div>

                          {/* Category Options */}
                          <div className="overflow-y-auto" style={{ maxHeight: '200px' }}>
                            {filteredCategories.map((category) => (
                                                             <button
                                 key={category.value}
                                 type="button"
                                 onClick={() => handleCategorySelect(category.value)}
                                 className={`w-full p-3 text-left hover:bg-blue-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0 flex items-center justify-between ${
                                   formData.category === category.value ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                                 }`}
                               >
                                 <span className="font-medium">{category.label}</span>
                                 {formData.category === category.value && (
                                   <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                     <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                   </svg>
                                 )}
                               </button>
                            ))}
                            {filteredCategories.length === 0 && (
                              <div className="px-4 py-8 text-center text-gray-500">
                                <p>No categories found matching "{categorySearchTerm}"</p>
                              </div>
                            )}
                          </div>
                        </div>,
                        document.body
                      )}
                    </div>
                    {errors.category && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm flex items-center space-x-2">
                          <FaExclamationTriangle className="text-red-500" />
                          <span>{errors.category}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Program Schedule */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center justify-between">
                      <span>Program Schedule</span>
                      <span className="text-red-500 text-lg font-bold">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.program}
                        onChange={(e) => handleInputChange('program', e.target.value)}
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-base bg-white group-hover:border-gray-300 appearance-none"
                        aria-label="Select program schedule"
                      >
                        <option value="morning">Morning Session</option>
                        <option value="afternoon">Afternoon Session </option>
                        <option value="evening">Evening Session </option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Course Credits */}
                  <div className="group">
                                          <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center justify-between">
                        <span>Course Credits</span>
                        <span className="text-red-500 text-lg font-bold">*</span>
                      </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-5">
                        <FaDollarSign className="text-gray-400 text-lg" />
                      </div>
                      <input
                        type="number"
                        value={formData.credits === 0 ? '' : formData.credits}
                        onChange={(e) => handleCreditsChange(e.target.value)}
                        className={`w-full pl-12 pr-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-base bg-white group-hover:border-gray-300 ${
                          errors.credits ? 'border-red-300 focus:ring-red-100 focus:border-red-500' : ''
                        }`}
                        placeholder="99.99"
                        min="0"
                        step="0.01"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                        <span className="text-gray-400 text-sm">USD</span>
                      </div>
                    </div>
                    {errors.credits && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm flex items-center space-x-2">
                          <FaExclamationTriangle className="text-red-500" />
                          <span>{errors.credits}</span>
                        </p>
                      </div>
                    )}
                  </div>


                
                </div>
              </div>
            </div>

            {/* Media Files Section */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
                  <h3 className="text-xl font-bold text-gray-900">Media Assets</h3>
                </div>
                <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                  Step 2 of 3
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Course Thumbnail */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center justify-between">
                    <span>Course Thumbnail</span>
                    <span className="text-gray-500 text-xs font-medium">Optional</span>
                  </label>
                  <div className="relative">
                    <div
                      onClick={() => thumbnailRef.current?.click()}
                      className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-green-400 hover:bg-green-50 transition-all duration-300 cursor-pointer group"
                    >
                      {uploadedThumbnail ? (
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                            <FaCheck className="text-green-600 text-2xl" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{uploadedThumbnail.name}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {(uploadedThumbnail.size / 1024 / 1024).toFixed(2)} MB • Image uploaded
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-green-100 transition-all duration-300 shadow-sm">
                            <FaUpload className="text-gray-400 group-hover:text-green-600 text-2xl transition-all duration-300" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-all duration-300">
                              Upload Course Thumbnail
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              PNG, JPG • Max 5MB • 1200x630px recommended
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Remove Button */}
                    {uploadedThumbnail && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFile('thumbnail')}
                        className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
                        aria-label="Remove thumbnail"
                      >
                        <FaTimes className="text-sm" />
                      </button>
                    )}
                  </div>
                  <input
                    ref={thumbnailRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload('thumbnail', e.target.files[0])}
                    className="hidden"
                    aria-label="Upload course thumbnail"
                  />
                </div>

                {/* Course Intro Video */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center justify-between">
                    <span>Course Introduction Video</span>
                    <span className="text-gray-500 text-xs font-medium">Optional</span>
                  </label>
                  <div className="relative">
                    <div
                      onClick={() => videoRef.current?.click()}
                      className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-green-400 hover:bg-green-50 transition-all duration-300 cursor-pointer group"
                    >
                      {uploadedVideo ? (
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                            <FaVideo className="text-green-600 text-2xl" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{uploadedVideo.name}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {(uploadedVideo.size / 1024 / 1024).toFixed(2)} MB • Video uploaded
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-green-100 transition-all duration-300 shadow-sm">
                            <FaVideo className="text-gray-400 group-hover:text-green-600 text-2xl transition-all duration-300" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-all duration-300">
                              Upload Introduction Video
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              MP4, MOV • Max 100MB • 2-3 minutes recommended
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Remove Button */}
                    {uploadedVideo && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFile('video')}
                        className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
                        aria-label="Remove video"
                      >
                        <FaTimes className="text-sm" />
                      </button>
                    )}
                  </div>
                  <input
                    ref={videoRef}
                    type="file"
                    accept="video/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload('video', e.target.files[0])}
                    className="hidden"
                    aria-label="Upload course intro video"
                  />
                </div>
              </div>
            </div>

            {/* Time Slots Section */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
                  <h3 className="text-xl font-bold text-gray-900">Schedule & Availability</h3>
                </div>
                <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                  Step 3 of 3
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 border border-purple-100">
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Weekly Availability</h4>
                  <p className="text-sm text-gray-600">Set your availability for each day of the week</p>
                </div>

                {/* Timezone Selection */}
                <div className="mb-8 p-6 bg-white/90 backdrop-blur-sm rounded-xl border border-purple-200 shadow-sm relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <FaClock className="text-white text-lg" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-800">Timezone</h5>
                        <p className="text-sm text-gray-600">Select your local timezone for scheduling</p>
                      </div>
                    </div>
                    <span className="text-red-500 text-lg font-bold">*</span>
                  </div>
                  
                  <div className="relative" ref={timezoneDropdownRef}>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      </div>
                      <button
                        ref={timezoneButtonRef}
                        type="button"
                        onClick={() => {
                          if (!isTimezoneDropdownOpen && timezoneButtonRef.current) {
                            const rect = timezoneButtonRef.current.getBoundingClientRect();
                            setDropdownPosition({
                              top: rect.bottom + window.scrollY + 8,
                              left: rect.left + window.scrollX,
                              width: rect.width
                            });
                          }
                          setIsTimezoneDropdownOpen(!isTimezoneDropdownOpen);
                        }}
                        className={`w-full pl-8 pr-12 py-4 bg-gradient-to-r from-white to-gray-50 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all duration-300 text-left text-base font-medium shadow-sm ${
                          isTimezoneDropdownOpen 
                            ? 'border-purple-500 ring-purple-100' 
                            : 'border-purple-200 group-hover:border-purple-300 group-hover:from-white group-hover:to-purple-50'
                        } ${errors.timezone ? 'border-red-300 focus:ring-red-100 focus:border-red-500' : ''}`}
                        aria-label="Select timezone"
                      >
                        {selectedTimezone ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{selectedTimezone.flag}</span>
                            <span className="text-gray-700">{selectedTimezone.label}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">Choose your timezone</span>
                        )}
                      </button>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shadow-sm transition-all duration-200 ${
                          isTimezoneDropdownOpen 
                            ? 'bg-gradient-to-br from-purple-600 to-purple-700 rotate-180' 
                            : 'bg-gradient-to-br from-purple-500 to-purple-600'
                        }`}>
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Custom Dropdown */}
                    {isTimezoneDropdownOpen && dropdownPosition && createPortal(
                      <div 
                        data-portal-dropdown="timezone"
                        className="fixed bg-white border-2 border-purple-200 rounded-xl shadow-xl z-[99999] max-h-80 overflow-hidden"
                        style={{
                          top: `${dropdownPosition.top}px`,
                          left: `${dropdownPosition.left}px`,
                          width: `${dropdownPosition.width}px`
                        }}
                      >
                        {/* Search Input */}
                        <div className="p-4 border-b border-gray-100">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Search timezones..."
                              value={timezoneSearchTerm}
                              onChange={(e) => setTimezoneSearchTerm(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                              autoFocus
                            />
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                        </div>

                        {/* Timezone Options */}
                        <div className="max-h-64 overflow-y-auto">
                          {Object.entries(groupedTimezones).map(([region, regionTimezones]) => (
                            <div key={region}>
                              <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                {region}
                              </div>
                              {regionTimezones.map((timezone) => (
                                <button
                                  key={timezone.value}
                                  type="button"
                                  onClick={() => handleTimezoneSelect(timezone.value)}
                                  className={`w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors duration-150 flex items-center space-x-3 ${
                                    formData.timezone === timezone.value ? 'bg-purple-100 text-purple-700' : 'text-gray-700'
                                  }`}
                                >
                                  <span className="text-lg">{timezone.flag}</span>
                                  <span className="text-sm font-medium">{timezone.label}</span>
                                  {formData.timezone === timezone.value && (
                                    <svg className="ml-auto w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </button>
                              ))}
                            </div>
                          ))}
                          {filteredTimezones.length === 0 && (
                            <div className="px-4 py-8 text-center text-gray-500">
                              <p>No timezones found matching "{timezoneSearchTerm}"</p>
                            </div>
                          )}
                        </div>
                      </div>,
                      document.body
                    )}
                  </div>
                  {errors.timezone && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm flex items-center space-x-2">
                        <FaExclamationTriangle className="text-red-500" />
                        <span>{errors.timezone}</span>
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-200 shadow-sm">
                  <div className="space-y-4">
                    {formData.weeklySchedule.map((daySchedule, dayIndex) => (
                      <div key={daySchedule.day} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        {/* Day Toggle and Name */}
                        <div className="flex items-center space-x-4">
                          <button
                            type="button"
                            onClick={() => toggleDayActive(dayIndex)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                              daySchedule.isActive ? 'bg-purple-600' : 'bg-gray-200'
                            }`}
                            aria-label={`Toggle ${daySchedule.day} availability`}
                            title={`Toggle ${daySchedule.day} availability`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                daySchedule.isActive ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <span className="font-semibold text-gray-800">{daySchedule.day}</span>
                        </div>

                        {/* Day Content */}
                        <div className="flex-1 ml-6">
                          {daySchedule.isActive ? (
                            <div className="space-y-3">
                              {daySchedule.timeSlots.length === 0 ? (
                                <button
                                  type="button"
                                  onClick={() => addTimeSlot(dayIndex)}
                                  className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-lg transition-all duration-200 border border-purple-200 hover:border-purple-300"
                                >
                                  <FaPlus className="text-sm" />
                                  <span>Add Time Slot</span>
                                </button>
                              ) : (
                                <div className="space-y-3">
                                  {daySchedule.timeSlots.map((timeSlot, slotIndex) => (
                                    <div key={timeSlot.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                                      {/* Time Range */}
                                      <div className="flex items-center space-x-3">
                                        {/* Start Time Dropdown */}
                                        <div className="relative" ref={timeDropdownRef}>
                                          <button
                                            type="button"
                                            onClick={() => setOpenTimeDropdown(openTimeDropdown?.dayIndex === dayIndex && openTimeDropdown?.slotId === timeSlot.id && openTimeDropdown?.type === 'start' ? null : { dayIndex, slotId: timeSlot.id, type: 'start' })}
                                            className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 min-w-[100px] shadow-sm hover:border-gray-300 flex items-center justify-between"
                                            aria-label="Start time"
                                          >
                                            <span>{formatTimeDisplay(timeSlot.startTime)}</span>
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                          </button>
                                          
                                          {openTimeDropdown?.dayIndex === dayIndex && openTimeDropdown?.slotId === timeSlot.id && openTimeDropdown?.type === 'start' && (
                                            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] max-h-48 overflow-y-auto min-w-[120px]">
                                              {timeOptions.map(option => (
                                                <button
                                                  key={option.value}
                                                  type="button"
                                                  onClick={() => handleTimeSelect(dayIndex, timeSlot.id, 'start', option.value)}
                                                  className={`w-full px-3 py-2 text-left text-sm hover:bg-purple-50 transition-colors ${
                                                    timeSlot.startTime === option.value ? 'bg-purple-100 text-purple-700' : 'text-gray-700'
                                                  }`}
                                                >
                                                  {option.label}
                                                </button>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                        
                                        <span className="text-gray-400 font-medium">to</span>
                                        
                                        {/* End Time Dropdown */}
                                        <div className="relative">
                                          <button
                                            type="button"
                                            onClick={() => setOpenTimeDropdown(openTimeDropdown?.dayIndex === dayIndex && openTimeDropdown?.slotId === timeSlot.id && openTimeDropdown?.type === 'end' ? null : { dayIndex, slotId: timeSlot.id, type: 'end' })}
                                            className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 min-w-[100px] shadow-sm hover:border-gray-300 flex items-center justify-between"
                                            aria-label="End time"
                                          >
                                            <span>{formatTimeDisplay(timeSlot.endTime)}</span>
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                          </button>
                                          
                                          {openTimeDropdown?.dayIndex === dayIndex && openTimeDropdown?.slotId === timeSlot.id && openTimeDropdown?.type === 'end' && (
                                            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] max-h-48 overflow-y-auto min-w-[120px]">
                                              {timeOptions.map(option => (
                                                <button
                                                  key={option.value}
                                                  type="button"
                                                  onClick={() => handleTimeSelect(dayIndex, timeSlot.id, 'end', option.value)}
                                                  className={`w-full px-3 py-2 text-left text-sm hover:bg-purple-50 transition-colors ${
                                                    timeSlot.endTime === option.value ? 'bg-purple-100 text-purple-700' : 'text-gray-700'
                                                  }`}
                                                >
                                                  {option.label}
                                                </button>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Session Details */}
                                      <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                                        <FaClock className="text-gray-400 text-xs" />
                                        <span className="font-medium">
                                          {calculateSessions(timeSlot.startTime, timeSlot.endTime, timeSlot.sessionDuration, timeSlot.bufferTime)} sessions • {timeSlot.sessionDuration} min + {timeSlot.bufferTime} min buffer
                                        </span>
                                      </div>

                                      {/* Remove Button */}
                                      <button
                                        type="button"
                                        onClick={() => removeTimeSlot(dayIndex, timeSlot.id)}
                                        className="w-6 h-6 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors"
                                        aria-label="Remove time slot"
                                        title="Remove time slot"
                                      >
                                        <FaTimes className="text-xs" />
                                      </button>
                                    </div>
                                  ))}
                                  
                                  {/* Add Another Time Slot Button */}
                                  <button
                                    type="button"
                                    onClick={() => addTimeSlot(dayIndex)}
                                    className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium"
                                  >
                                    <FaPlus className="text-sm" />
                                    <span>Add Time Slot</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500">Unavailable</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {errors.weeklySchedule && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm flex items-center space-x-2">
                      <FaExclamationTriangle className="text-red-500" />
                      <span>{errors.weeklySchedule}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
                         <div className="flex items-center justify-center pt-10 border-t border-gray-200">
               
               
               <div className="flex items-center space-x-8">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-4 text-red-600 hover:text-red-800 hover:bg-red-500 rounded-xl transition-all duration-300 font-semibold border border-red-200 hover:border-red-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>{isEditing ? 'Updating Course...' : 'Creating Course...'}</span>
                    </>
                  ) : (
                    <>
                      <FaBook className="text-lg" />
                      <span>{isEditing ? 'Update Course' : 'Create Course'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCourseForm; 