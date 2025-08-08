import React, { useState, useMemo, useEffect } from 'react';
import { 
  FaSearch, 
  FaFilter, 
  FaBook,
  FaUser,
  FaCalendarAlt,
  FaEye,
  FaGraduationCap,
  FaTimes,
  FaChild,
  FaCheck,
  FaPlay,
  FaClock,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaStar,
  FaUsers,
  FaLanguage,
  FaBriefcase,
  FaCreditCard,
  FaLock,
  FaShieldAlt,
  FaArrowLeft,
  FaArrowRight,
  FaQuestionCircle,
  FaChevronRight
} from 'react-icons/fa';
import { Course } from '../data/mockData';
import { showSuccessToast, showErrorToast } from '../../components/Toast';
import { coachStorage, CoachData } from '../../utils/coachStorage';

interface ParentUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  children: Array<{
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    currentGrade: string;
    schoolName: string;
  }>;
}

interface CoursesProps {
  courses: Course[];
  parentData: ParentUser;
}

interface EnrollmentData {
  courseId: string;
  selectedChildren: string[];
  totalPrice: number;
  paymentMethod?: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
  };
}

interface PaymentStep {
  step: 'children' | 'payment' | 'confirmation';
  title: string;
  description: string;
}

const Courses: React.FC<CoursesProps> = ({ courses, parentData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<CoachData | null>(null);
  const [currentStep, setCurrentStep] = useState<'children' | 'payment' | 'confirmation'>('children');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData>({
    courseId: '',
    selectedChildren: [],
    totalPrice: 0
  });

  // Payment steps configuration
  const paymentSteps: PaymentStep[] = [
    {
      step: 'children',
      title: 'Select Children',
      description: 'Choose which children to enroll in this course'
    },
    {
      step: 'payment',
      title: 'Payment Information',
      description: 'Enter your payment details securely'
    },
    {
      step: 'confirmation',
      title: 'Confirmation',
      description: 'Review and confirm your enrollment'
    }
  ];

  // Initialize sample coach data for testing
  useEffect(() => {
    // Clear existing coach data for testing (remove this in production)
    coachStorage.clearAllData();
    
    // Check if we already have coach data
    const existingCoaches = coachStorage.getAllCoaches();
    if (existingCoaches.length === 0) {
      // Add sample coach data with IDs that match the course data
      const sampleCoaches = [
        {
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@example.com',
          phone: '+1 (555) 123-4567',
          password: 'password123',
          experience: 'Mathematics Education Specialist',
          duration: '8 years',
          address: '123 Education Street, Boston, MA 02101',
          languages: ['English', 'Spanish'],
          courses: ['Advanced Mathematics for Grade 8', 'Algebra Fundamentals', 'Geometry Mastery']
        },
        {
          firstName: 'Emily',
          lastName: 'Chen',
          email: 'emily.chen@example.com',
          phone: '+1 (555) 234-5678',
          password: 'password123',
          experience: 'Creative Writing Instructor',
          duration: '5 years',
          address: '456 Creative Lane, San Francisco, CA 94102',
          languages: ['English', 'Mandarin'],
          courses: ['Creative Writing Workshop', 'Poetry for Young Writers', 'Storytelling Skills']
        },
        {
          firstName: 'David',
          lastName: 'Rodriguez',
          email: 'david.rodriguez@example.com',
          phone: '+1 (555) 345-6789',
          password: 'password123',
          experience: 'Computer Science Educator',
          duration: '6 years',
          address: '789 Tech Avenue, Austin, TX 73301',
          languages: ['English', 'Spanish'],
          courses: ['Coding Fundamentals for Kids', 'Python Programming', 'Web Development Basics']
        }
      ];

      // Add coaches with specific IDs that match the course data
      sampleCoaches.forEach((coach, index) => {
        const coachId = `c${index + 1}`; // This will create c1, c2, c3
        coachStorage.addCoachWithId(coach, coachId);
      });
    }
  }, []);

  // Initialize mock child data for parent
  useEffect(() => {
    const initializeMockChildren = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.role === 'PARENT' && (!user.children || user.children.length === 0)) {
            // Add 4 mock children
            const mockChildren = [
              {
                id: 'ch1',
                firstName: 'Emma',
                lastName: 'Johnson',
                dateOfBirth: '2012-03-15',
                gender: 'Female',
                currentGrade: 'Grade 6',
                schoolName: 'Springfield Elementary School'
              },
              {
                id: 'ch2',
                firstName: 'Alex',
                lastName: 'Johnson',
                dateOfBirth: '2014-07-22',
                gender: 'Male',
                currentGrade: 'Grade 4',
                schoolName: 'Springfield Elementary School'
              },
              {
                id: 'ch3',
                firstName: 'Sophia',
                lastName: 'Johnson',
                dateOfBirth: '2016-11-08',
                gender: 'Female',
                currentGrade: 'Grade 2',
                schoolName: 'Springfield Elementary School'
              },
              {
                id: 'ch4',
                firstName: 'Lucas',
                lastName: 'Johnson',
                dateOfBirth: '2018-05-12',
                gender: 'Male',
                currentGrade: 'Kindergarten',
                schoolName: 'Springfield Elementary School'
              }
            ];

            // Update user with mock children
            const updatedUser = {
              ...user,
              children: mockChildren
            };

            // Save to localStorage
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            // Update parent data in component state if it exists
            if (parentData) {
              // This will trigger a re-render with the new children
              window.location.reload();
            }
          }
        } catch (error) {
          console.error('Error initializing mock children:', error);
        }
      }
    };

    initializeMockChildren();
  }, [parentData]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(courses.map(course => course.category))];
    return ['all', ...cats];
  }, [courses]);

  // Price range options
  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: 'free', label: 'Free ($0)' },
    { value: 'low', label: 'Low ($1-50)' },
    { value: 'medium', label: 'Medium ($51-150)' },
    { value: 'high', label: 'High ($151-300)' },
    { value: 'premium', label: 'Premium ($300+)' }
  ];

  // Date range options
  const dateRanges = [
    { value: 'all', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  // Sort options
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low-high', label: 'Price: Low to High' },
    { value: 'price-high-low', label: 'Price: High to Low' },
    { value: 'title', label: 'Sort by Title' },
    { value: 'category', label: 'Sort by Category' },
    { value: 'rating', label: 'Sort by Rating' }
  ];

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let filtered = courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.coach.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
      
      // Price range filtering (using credits as proxy for price)
      const coursePrice = course.credits * 99; // Mock price calculation
      let matchesPriceRange = true;
      if (selectedPriceRange !== 'all') {
        switch (selectedPriceRange) {
          case 'free':
            matchesPriceRange = coursePrice === 0;
            break;
          case 'low':
            matchesPriceRange = coursePrice >= 1 && coursePrice <= 50;
            break;
          case 'medium':
            matchesPriceRange = coursePrice >= 51 && coursePrice <= 150;
            break;
          case 'high':
            matchesPriceRange = coursePrice >= 151 && coursePrice <= 300;
            break;
          case 'premium':
            matchesPriceRange = coursePrice > 300;
            break;
        }
      }

      // Date range filtering (mock implementation)
      const courseDate = new Date(course.id); // Using course ID as creation date
      const now = new Date();
      let matchesDateRange = true;
      if (selectedDateRange !== 'all') {
        switch (selectedDateRange) {
          case 'today':
            matchesDateRange = courseDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDateRange = courseDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDateRange = courseDate >= monthAgo;
            break;
          case 'quarter':
            const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            matchesDateRange = courseDate >= quarterAgo;
            break;
          case 'year':
            const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            matchesDateRange = courseDate >= yearAgo;
            break;
        }
      }

      return matchesSearch && matchesCategory && matchesPriceRange && matchesDateRange;
    });

    // Sort courses
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.id).getTime() - new Date(a.id).getTime();
        case 'oldest':
          return new Date(a.id).getTime() - new Date(b.id).getTime();
        case 'price-low-high':
          return (a.credits * 99) - (b.credits * 99);
        case 'price-high-low':
          return (b.credits * 99) - (a.credits * 99);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'rating':
          return (b.credits * 0.8) - (a.credits * 0.8); // Mock rating based on credits
        default:
          return 0;
      }
    });

    return filtered;
  }, [courses, searchTerm, selectedCategory, selectedPriceRange, selectedDateRange, sortBy]);

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatProgram = (program: string) => {
    return program.charAt(0).toUpperCase() + program.slice(1);
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedPriceRange('all');
    setSelectedDateRange('all');
    setSearchTerm('');
    setSortBy('newest');
  };

  const clearFilter = (filterType: 'category' | 'price' | 'date' | 'search' | 'sort') => {
    switch (filterType) {
      case 'category':
        setSelectedCategory('all');
        break;
      case 'price':
        setSelectedPriceRange('all');
        break;
      case 'date':
        setSelectedDateRange('all');
        break;
      case 'search':
        setSearchTerm('');
        break;
      case 'sort':
        setSortBy('newest');
        break;
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (selectedPriceRange !== 'all') count++;
    if (selectedDateRange !== 'all') count++;
    if (searchTerm) count++;
    if (sortBy !== 'newest') count++;
    return count;
  };

  const getActiveFilters = () => {
    const filters: Array<{ type: string; label: string; value: string }> = [];
    if (selectedCategory !== 'all') filters.push({ type: 'category', label: selectedCategory, value: selectedCategory });
    if (selectedPriceRange !== 'all') filters.push({ type: 'price', label: priceRanges.find(p => p.value === selectedPriceRange)?.label || selectedPriceRange, value: selectedPriceRange });
    if (selectedDateRange !== 'all') filters.push({ type: 'date', label: dateRanges.find(d => d.value === selectedDateRange)?.label || selectedDateRange, value: selectedDateRange });
    if (searchTerm) filters.push({ type: 'search', label: `"${searchTerm}"`, value: searchTerm });
    if (sortBy !== 'newest') filters.push({ type: 'sort', label: sortOptions.find(s => s.value === sortBy)?.label || sortBy, value: sortBy });
    return filters;
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleEnroll = (course: Course) => {
    setSelectedCourse(course);
    setEnrollmentData({
      courseId: course.id,
      selectedChildren: [],
      totalPrice: 0
    });
    setShowEnrollmentModal(true);
  };

  const handleChildSelection = (childId: string) => {
    setEnrollmentData(prev => {
      const isSelected = prev.selectedChildren.includes(childId);
      const newSelectedChildren = isSelected 
        ? prev.selectedChildren.filter(id => id !== childId)
        : [...prev.selectedChildren, childId];
      
      // For now, we'll use a fixed price since it's not in the course data
      const totalPrice = newSelectedChildren.length * 299; // Default price
      
      return {
        ...prev,
        selectedChildren: newSelectedChildren,
        totalPrice
      };
    });
  };

  const handleConfirmEnrollment = () => {
    if (enrollmentData.selectedChildren.length === 0) {
      showErrorToast('Please select at least one child to enroll');
      return;
    }

    // Simulate enrollment process
    showSuccessToast(`Successfully enrolled ${enrollmentData.selectedChildren.length} child(ren) in ${selectedCourse?.title}`);
    setShowEnrollmentModal(false);
    setSelectedCourse(null);
    setEnrollmentData({
      courseId: '',
      selectedChildren: [],
      totalPrice: 0
    });
  };

  const handleViewCoachDetails = (coachId: string) => {
    const coachData = coachStorage.getCoachById(coachId);
    if (coachData) {
      setSelectedCoach(coachData);
      setShowCoachModal(true);
    } else {
      showErrorToast('Coach details not found');
    }
  };

  const handleNextStep = () => {
    if (currentStep === 'children') {
      if (enrollmentData.selectedChildren.length === 0) {
        showErrorToast('Please select at least one child to enroll');
        return;
      }
      setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      // Validate payment information
      if (!enrollmentData.paymentMethod?.cardNumber || 
          !enrollmentData.paymentMethod?.expiryDate || 
          !enrollmentData.paymentMethod?.cvv || 
          !enrollmentData.paymentMethod?.cardholderName) {
        showErrorToast('Please fill in all payment information');
        return;
      }
      setCurrentStep('confirmation');
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 'payment') {
      setCurrentStep('children');
    } else if (currentStep === 'confirmation') {
      setCurrentStep('payment');
    }
  };

  const handlePaymentMethodChange = (field: string, value: string) => {
    setEnrollmentData(prev => {
      const currentPaymentMethod = prev.paymentMethod || {
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: ''
      };
      
      return {
        ...prev,
        paymentMethod: {
          ...currentPaymentMethod,
          [field]: value
        }
      };
    });
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts: string[] = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const processPayment = async () => {
    setIsProcessingPayment(true);
    
    try {
      // Simulate Stripe payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would:
      // 1. Create a payment intent with Stripe
      // 2. Process the payment
      // 3. Handle success/failure
      
      showSuccessToast('Payment processed successfully! Enrollment confirmed.');
      setShowEnrollmentModal(false);
      setCurrentStep('children');
      setSelectedCourse(null);
      setEnrollmentData({
        courseId: '',
        selectedChildren: [],
        totalPrice: 0
      });
    } catch (error) {
      showErrorToast('Payment failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const resetEnrollmentFlow = () => {
    setShowEnrollmentModal(false);
    setCurrentStep('children');
    setSelectedCourse(null);
    setEnrollmentData({
      courseId: '',
      selectedChildren: [],
      totalPrice: 0
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">
            Available Courses
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            Browse courses created by our expert coaches and enroll your children.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-xs sm:text-sm font-medium px-3 py-1 rounded-full border border-green-200">
            {courses.length} Courses Available
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
            <input
              type="text"
              placeholder="Search courses, coaches, or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
            {searchTerm && (
              <button
                onClick={() => clearFilter('search')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                aria-label="Clear search"
              >
                <FaTimes className="text-sm" />
              </button>
            )}
          </div>

          {/* Filter Toggle and Sort */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 border rounded-lg transition-all duration-200 text-sm sm:text-base ${
                getActiveFiltersCount() > 0 
                  ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaFilter className="text-gray-600 text-sm sm:text-base" />
              <span className="hidden sm:inline">Filters</span>
              {getActiveFiltersCount() > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {getActiveFiltersCount()}
                </span>
              )}
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              aria-label="Sort courses"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {getActiveFiltersCount() > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">Active Filters:</h3>
              <button
                onClick={clearAllFilters}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors duration-200"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {getActiveFilters().map((filter, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs sm:text-sm border border-blue-200"
                >
                  <span>{filter.label}</span>
                  <button
                    onClick={() => clearFilter(filter.type as any)}
                    className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
                    aria-label={`Clear ${filter.type} filter`}
                  >
                    <FaTimes className="text-xs" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  aria-label="Filter by category"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  aria-label="Filter by price range"
                >
                  {priceRanges.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  value={selectedDateRange}
                  onChange={(e) => setSelectedDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  aria-label="Filter by date range"
                >
                  {dateRanges.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear All Filters */}
              <div className="flex items-end">
                <button
                  onClick={clearAllFilters}
                  className="w-full px-4 py-2 text-xs sm:text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-xs sm:text-sm text-gray-600">
          Showing {filteredCourses.length} of {courses.length} courses
        </p>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredCourses.map((course, index) => (
          <div 
            key={course.id} 
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden hover:scale-[1.02] animate-in slide-in-from-bottom duration-500"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Course Thumbnail */}
            <div className="relative h-40 sm:h-48 bg-gray-200">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              {course.introVideo && (
                <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                  <div className="bg-black bg-opacity-50 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                    <FaPlay className="text-xs" />
                    <span className="hidden sm:inline">Intro Video</span>
                  </div>
                </div>
              )}
            </div>

            {/* Course Content */}
            <div className="p-4 sm:p-6">
              {/* Course Title and Coach */}
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                {course.title}
              </h3>
              <div className="flex items-center space-x-2 mb-3">
                <img
                  src={course.coach.avatar}
                  alt={course.coach.name}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
                />
                <span className="text-xs sm:text-sm text-gray-600 truncate">{course.coach.name}</span>
                <button
                  onClick={() => handleViewCoachDetails(course.coach.id)}
                  className="text-blue-600 hover:text-blue-700 text-xs font-medium hover:scale-105 transition-all duration-200"
                >
                  View Profile
                </button>
              </div>

              {/* Course Description */}
              <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-2">
                {course.description}
              </p>

              {/* Key Info Row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    {course.category}
                  </span>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                    {formatProgram(course.program)}
                  </span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                    {course.credits} Credits
                  </span>
                </div>
              </div>

              {/* Schedule Preview */}
              <div className="mb-4">
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                  <FaCalendarAlt className="text-indigo-600 text-xs sm:text-sm" />
                  <span className="truncate">
                    {course.weeklySchedule
                      .filter(day => day.isActive)
                      .slice(0, 2)
                      .map((day, index) => (
                        <span key={index}>
                          {day.day.slice(0, -1)} {day.timeSlots[0] && formatTime(day.timeSlots[0].startTime)}
                          {index < Math.min(2, course.weeklySchedule.filter(d => d.isActive).length - 1) && ', '}
                        </span>
                      ))}
                    {course.weeklySchedule.filter(day => day.isActive).length > 2 && (
                      <span className="text-blue-600">+{course.weeklySchedule.filter(day => day.isActive).length - 2} more</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewCoachDetails(course.coach.id)}
                  className="flex-1 px-2 sm:px-3 py-2 text-xs sm:text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 hover:scale-105"
                >
                  <FaEye className="inline mr-1 text-xs sm:text-sm" />
                  <span className="hidden sm:inline">Coach</span>
                  <span className="sm:hidden">Coach</span>
                </button>
                <button
                  onClick={() => handleEnroll(course)}
                  className="flex-1 px-2 sm:px-4 py-2 text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
                >
                  <FaGraduationCap className="inline mr-1 text-xs sm:text-sm" />
                  Enroll
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <FaBook className="text-gray-300 text-4xl sm:text-6xl mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-xs sm:text-sm text-gray-500 mb-4">
            Try adjusting your search terms or filters to find more courses.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedPriceRange('all');
              setSelectedDateRange('all');
            }}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base hover:scale-105 transition-all duration-200"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Coach Details Modal */}
      {showCoachModal && selectedCoach && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-2 sm:p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[95vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden border-4 border-purple-200 shadow-lg">
                    {selectedCoach.photo ? (
                      <img src={selectedCoach.photo} alt="Coach" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <FaUser className="text-white text-2xl sm:text-4xl" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{selectedCoach.firstName} {selectedCoach.lastName}</h2>
                    <p className="text-xs sm:text-sm text-gray-600">Professional Coach</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCoachModal(false)}
                  className="p-2 sm:p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  aria-label="Close modal"
                >
                  <FaTimes className="text-lg sm:text-xl" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* Contact & Profile Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <span className="block text-xs text-gray-500 font-medium mb-1">Email</span>
                    <span className="block text-sm font-semibold text-gray-900 break-all">{selectedCoach.email}</span>
                  </div>
                  <div className="mb-4">
                    <span className="block text-xs text-gray-500 font-medium mb-1">Phone</span>
                    <span className="block text-sm font-semibold text-gray-900">{selectedCoach.phone}</span>
                  </div>
                  <div className="mb-4">
                    <span className="block text-xs text-gray-500 font-medium mb-1">Address</span>
                    <span className="block text-sm font-semibold text-gray-900">{selectedCoach.address}</span>
                  </div>
                  <div className="mb-4">
                    <span className="block text-xs text-gray-500 font-medium mb-1">Languages</span>
                    <span className="block text-sm font-semibold text-gray-900">
                      {selectedCoach.languages && selectedCoach.languages.length > 0 ? selectedCoach.languages.join(', ') : 'N/A'}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="mb-4">
                    <span className="block text-xs text-gray-500 font-medium mb-1">Years of Experience</span>
                    <span className="block text-sm font-semibold text-gray-900">{selectedCoach.experience}</span>
                  </div>
                  <div className="mb-4">
                    <span className="block text-xs text-gray-500 font-medium mb-1">Area of Expertise</span>
                    <span className="block text-sm font-semibold text-gray-900">{selectedCoach.domain}</span>
                  </div>
                  <div className="mb-4">
                    <span className="block text-xs text-gray-500 font-medium mb-1">Resume/CV</span>
                    {selectedCoach.resume ? (
                      <a href={selectedCoach.resume} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm font-semibold">View Resume</a>
                    ) : (
                      <span className="block text-sm text-gray-500">Not uploaded</span>
                    )}
                  </div>
                  <div className="mb-4">
                    <span className="block text-xs text-gray-500 font-medium mb-1">Introduction Video</span>
                    {selectedCoach.video ? (
                      <a href={selectedCoach.video} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm font-semibold">Watch Video</a>
                    ) : (
                      <span className="block text-sm text-gray-500">Not uploaded</span>
                    )}
                  </div>
                  {/* Add more fields as needed */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 rounded-t-xl z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <FaBook className="text-white text-lg sm:text-xl" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Course Details</h2>
                    <p className="text-xs sm:text-sm text-gray-600">Complete information about this course</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="p-2 sm:p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  aria-label="Close modal"
                >
                  <FaTimes className="text-lg sm:text-xl" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {/* Hero Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
                {/* Course Thumbnail/Video */}
                <div className="lg:col-span-1">
                  <div className="relative">
                    {selectedCourse.introVideo ? (
                      <div className="relative">
                        <img
                          src={selectedCourse.thumbnail}
                          alt={selectedCourse.title}
                          className="w-full h-48 sm:h-60 lg:h-80 object-cover rounded-xl shadow-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-xl flex items-center justify-center">
                          <button 
                            onClick={() => {
                              // In a real app, this would open the video player
                              window.open(selectedCourse.introVideo, '_blank');
                            }}
                            className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-900 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg flex items-center gap-2 sm:gap-3 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                          >
                            <FaPlay className="text-sm sm:text-lg" />
                            <span className="hidden sm:inline">Watch Introduction Video</span>
                            <span className="sm:hidden">Watch Video</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={selectedCourse.thumbnail}
                        alt={selectedCourse.title}
                        className="w-full h-48 sm:h-60 lg:h-80 object-cover rounded-xl shadow-lg"
                      />
                    )}
                  </div>
                </div>

                {/* Course Info */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                  <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                      {selectedCourse.title}
                    </h1>
                    <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed">
                      {selectedCourse.description}
                    </p>
                  </div>

                  {/* Coach Info */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 sm:p-6 border border-indigo-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <img
                          src={selectedCourse.coach.avatar}
                          alt={selectedCourse.coach.name}
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-white shadow-lg"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{selectedCourse.coach.name}</h3>
                          <p className="text-sm sm:text-base text-gray-600">Course Instructor</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewCoachDetails(selectedCourse.coach.id)}
                        className="px-3 sm:px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200 font-medium text-sm sm:text-base"
                      >
                        <FaUser className="inline mr-1" />
                        View Profile
                      </button>
                    </div>
                  </div>

                  {/* Course Benefits */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 sm:p-6 border border-green-100">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <FaBook className="text-green-600 text-sm sm:text-base" />
                      What Your Child Will Gain
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg">
                      {selectedCourse.benefits}
                    </p>
                  </div>
                </div>
              </div>

              {/* Course Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
                {/* Course Overview */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-blue-100">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FaBook className="text-blue-600 text-sm sm:text-base" />
                    Course Overview
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                        <div className="text-xs sm:text-sm text-blue-600 font-medium mb-1">Category</div>
                        <div className="font-semibold text-gray-900 text-sm sm:text-base">{selectedCourse.category}</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                        <div className="text-xs sm:text-sm text-green-600 font-medium mb-1">Program</div>
                        <div className="font-semibold text-gray-900 text-sm sm:text-base">{formatProgram(selectedCourse.program)}</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                        <div className="text-xs sm:text-sm text-purple-600 font-medium mb-1">Credits</div>
                        <div className="font-semibold text-gray-900 text-sm sm:text-base">{selectedCourse.credits}</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                        <div className="text-xs sm:text-sm text-orange-600 font-medium mb-1">Timezone</div>
                        <div className="font-semibold text-gray-900 text-sm sm:text-base">{selectedCourse.timezone}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weekly Schedule */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 sm:p-6 border border-green-100">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FaCalendarAlt className="text-green-600 text-sm sm:text-base" />
                    Weekly Schedule
                  </h3>
                  <div className="space-y-3">
                    {selectedCourse.weeklySchedule
                      .filter(day => day.isActive)
                      .map((day, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-green-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <FaCalendarAlt className="text-green-600 text-sm sm:text-base" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 text-sm sm:text-base">{day.day.slice(0, -1)}</div>
                              {day.timeSlots.map((slot, slotIndex) => (
                                <div key={slotIndex} className="text-xs sm:text-sm text-gray-600">
                                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)} ({slot.sessionDuration} min)
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Course Description */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 sm:p-6 border border-indigo-100 mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaBook className="text-indigo-600 text-sm sm:text-base" />
                  Course Description
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg">
                  {selectedCourse.description}
                </p>
              </div>

              {/* Enrollment CTA */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 sm:p-6 border border-indigo-100">
                <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Ready to Enroll?</h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      Join this amazing course and help your child develop new skills
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <button
                      onClick={() => setSelectedCourse(null)}
                      className="px-4 sm:px-6 py-2 sm:py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleEnroll(selectedCourse);
                        setSelectedCourse(null);
                      }}
                      className="px-6 sm:px-8 py-3 sm:py-4 text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2 text-sm sm:text-base"
                    >
                      <FaGraduationCap />
                      Enroll Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enrollment Modal */}
      {showEnrollmentModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3 truncate">
                    <FaGraduationCap className="text-indigo-600 text-lg sm:text-xl flex-shrink-0" />
                    Enroll in Course
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2 truncate">{paymentSteps.find(step => step.step === currentStep)?.description}</p>
                </div>
                <button
                  onClick={resetEnrollmentFlow}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-white rounded-lg flex-shrink-0 ml-2"
                  aria-label="Close enrollment modal"
                >
                  <FaTimes className="text-lg sm:text-xl" />
                </button>
              </div>
              
              {/* Progress Steps */}
              <div className="mt-4 sm:mt-6">
                <div className="flex items-center justify-between">
                  {paymentSteps.map((step, index) => {
                    const isActive = step.step === currentStep;
                    const isCompleted = paymentSteps.findIndex(s => s.step === currentStep) > index;
                    
                    return (
                      <div key={step.step} className="flex flex-col items-center space-y-1 flex-1">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium flex-shrink-0 ${
                          isActive 
                            ? 'bg-indigo-600 text-white' 
                            : isCompleted 
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {isCompleted ? <FaCheck className="text-xs" /> : index + 1}
                        </div>
                        <div className="text-center min-w-0 flex-1">
                          <p className={`text-xs sm:text-sm font-medium truncate ${
                            isActive ? 'text-indigo-600' : 'text-gray-500'
                          }`}>
                            {step.title}
                          </p>
                        </div>
                        {index < paymentSteps.length - 1 && (
                          <div className={`w-8 h-0.5 mx-2 flex-shrink-0 ${
                            isCompleted ? 'bg-green-500' : 'bg-gray-200'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6">
              {/* Course Info */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base break-words">{selectedCourse.title}</h3>
                <div className="flex flex-col space-y-1 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-600">
                  <span className="break-words">Coach: {selectedCourse.coach.name}</span>
                  <span className="font-semibold text-blue-600 flex-shrink-0">Course Credits: {selectedCourse.credits}</span>
                </div>
              </div>

              {/* Step Content */}
              {currentStep === 'children' && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaChild className="text-indigo-600 flex-shrink-0" />
                    Select Children to Enroll
                  </h4>
                  
                  {parentData.children && parentData.children.length > 0 ? (
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Choose children to enroll in this course:
                      </label>
                      <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                        {parentData.children.map((child) => {
                          const isSelected = enrollmentData.selectedChildren.includes(child.id);
                          const age = calculateAge(child.dateOfBirth);
                          
                          return (
                            <label
                              key={child.id}
                              className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleChildSelection(child.id)}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 flex-shrink-0 mt-0.5"
                              />
                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-gray-900 text-sm sm:text-base block break-words">
                                  {child.firstName} {child.lastName}
                                </span>
                                <span className="text-xs sm:text-sm text-gray-500 block break-words">
                                  ({age} years old • {child.currentGrade})
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                      {enrollmentData.selectedChildren.length > 0 && (
                        <div className="mt-3 p-3 bg-indigo-50 rounded-lg">
                          <p className="text-sm text-indigo-800">
                            <strong>Selected:</strong> {enrollmentData.selectedChildren.length} child{enrollmentData.selectedChildren.length > 1 ? 'ren' : ''}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FaChild className="text-gray-300 text-4xl mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No children found</h3>
                      <p className="text-gray-500 text-sm">
                        Please add children to your profile before enrolling in courses.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Enrollment Summary */}
              {enrollmentData.selectedChildren.length > 0 && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 sm:p-6 mb-6 border border-indigo-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <FaChild className="text-indigo-600 text-sm" />
                        </div>
                        <p className="text-sm font-medium text-gray-700 break-words">
                          {enrollmentData.selectedChildren.length} child{enrollmentData.selectedChildren.length !== 1 ? 'ren' : ''} selected
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 ml-10 break-words">
                        Course Credits: {selectedCourse.credits} per child
                      </p>
                    </div>
                    <div className="flex justify-center sm:justify-end flex-shrink-0">
                      <div className="bg-white rounded-lg p-4 shadow-sm text-center">
                        <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          {enrollmentData.selectedChildren.length * selectedCourse.credits} Credits
                        </p>
                        <p className="text-sm text-gray-600 font-medium">Total Credits</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Payment Step */}
              {currentStep === 'payment' && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaCreditCard className="text-indigo-600" />
                    Payment Information
                  </h4>
                  
                  {/* Stripe-like Payment Form */}
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    {/* Payment Header */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <FaShieldAlt className="text-green-600 text-sm" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-900 text-sm sm:text-base">Secure Payment</h5>
                            <p className="text-xs sm:text-sm text-gray-600">Powered by Stripe</p>
                          </div>
                        </div>
                    
                      </div>
                    </div>

                    {/* Payment Form */}
                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                      {/* Card Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card number
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <div className="w-6 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-sm flex items-center justify-center">
                              <span className="text-white text-xs font-bold">••</span>
                            </div>
                          </div>
                          <input
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            value={enrollmentData.paymentMethod?.cardNumber || ''}
                            onChange={(e) => handlePaymentMethodChange('cardNumber', formatCardNumber(e.target.value))}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-base sm:text-lg"
                            maxLength={19}
                          />
                        </div>
                      </div>

                      {/* Card Details Row */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Expiry Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry date
                          </label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={enrollmentData.paymentMethod?.expiryDate || ''}
                            onChange={(e) => handlePaymentMethodChange('expiryDate', formatExpiryDate(e.target.value))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                            maxLength={5}
                          />
                        </div>

                        {/* CVV */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVC
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="123"
                              value={enrollmentData.paymentMethod?.cvv || ''}
                              onChange={(e) => handlePaymentMethodChange('cvv', e.target.value.replace(/\D/g, ''))}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                              maxLength={4}
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <FaQuestionCircle className="text-gray-400 text-sm" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cardholder Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name on card
                        </label>
                        <input
                          type="text"
                          placeholder="John Doe"
                          value={enrollmentData.paymentMethod?.cardholderName || ''}
                          onChange={(e) => handlePaymentMethodChange('cardholderName', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Payment Summary */}
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Course enrollment</span>
                          <span className="text-sm font-medium text-gray-900">
                            ${selectedCourse?.credits ? selectedCourse.credits * enrollmentData.selectedChildren.length : 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-lg font-semibold text-gray-900">
                          <span>Total</span>
                          <span>${selectedCourse?.credits ? selectedCourse.credits * enrollmentData.selectedChildren.length : 0}</span>
                        </div>
                      </div>

                      {/* Security Notice */}
                      <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <FaLock className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium">Your payment is secure</p>
                          <p className="text-blue-700">We use industry-standard encryption to protect your payment information.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {/* Confirmation Step */}
              {currentStep === 'confirmation' && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaCheck className="text-green-600" />
                    Confirm Enrollment
                  </h4>
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 sm:p-6 border border-green-100 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <FaCheck className="text-green-600 text-xl" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900">Ready to Enroll!</h5>
                        <p className="text-sm text-gray-600">Please review your enrollment details below</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* Course Details */}
                    <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
                      <h5 className="font-semibold text-gray-900 mb-3">Course Information</h5>
                      <div className="space-y-2 text-sm sm:text-base">
                        <p><span className="text-gray-600">Course:</span> {selectedCourse.title}</p>
                        <p><span className="text-gray-600">Coach:</span> {selectedCourse.coach.name}</p>
                        <p><span className="text-gray-600">Credits:</span> {selectedCourse.credits} per child</p>
                        <p><span className="text-gray-600">Children:</span> {enrollmentData.selectedChildren.length}</p>
                      </div>
                    </div>

                    {/* Payment Details */}
                    <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
                      <h5 className="font-semibold text-gray-900 mb-3">Payment Details</h5>
                      <div className="space-y-2 text-sm sm:text-base">
                        <p><span className="text-gray-600">Card:</span> **** **** **** {enrollmentData.paymentMethod?.cardNumber?.slice(-4)}</p>
                        <p><span className="text-gray-600">Name:</span> {enrollmentData.paymentMethod?.cardholderName}</p>
                        <p><span className="text-gray-600">Total:</span> ${(enrollmentData.selectedChildren.length * selectedCourse.credits * 99).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-row items-center justify-between space-x-3">
                <button
                  onClick={currentStep === 'children' ? resetEnrollmentFlow : handlePreviousStep}
                  className="px-4 sm:px-6 py-2 sm:py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium flex items-center gap-2 text-sm sm:text-base"
                >
                  <FaArrowLeft />
                  {currentStep === 'children' ? 'Cancel' : 'Back'}
                </button>
                
                {currentStep === 'children' && (
                  <button
                    onClick={handleNextStep}
                    disabled={enrollmentData.selectedChildren.length === 0}
                    className="px-4 sm:px-6 py-2 sm:py-3 text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg hover:shadow-xl text-sm sm:text-base"
                  >
                    Next
                    <FaArrowRight />
                  </button>
                )}
                
                {currentStep === 'payment' && (
                  <button
                    onClick={handleNextStep}
                    disabled={!enrollmentData.paymentMethod?.cardNumber || !enrollmentData.paymentMethod?.expiryDate || !enrollmentData.paymentMethod?.cvv || !enrollmentData.paymentMethod?.cardholderName}
                    className="px-4 sm:px-6 py-2 sm:py-3 text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg hover:shadow-xl text-sm sm:text-base"
                  >
                    Review
                    <FaArrowRight />
                  </button>
                )}
                
                {currentStep === 'confirmation' && (
                  <button
                    onClick={processPayment}
                    disabled={isProcessingPayment}
                    className="px-4 sm:px-6 py-2 sm:py-3 text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg hover:shadow-xl text-sm sm:text-base"
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaCreditCard />
                        Pay & Enroll
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses; 