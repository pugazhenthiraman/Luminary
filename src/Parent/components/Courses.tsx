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
  import CourseCard from "../../components/CourseCard";
import { showSuccessToast, showErrorToast } from '../../components/Toast';
import { getCoachDetails, getCoachDetailsByCourse } from '../../api/coach';
import PaymentModal from '../../components/PaymentModel';
import childrenApi from '../../api/children';
import ChildDetailsModal from '../../components/ChildDetailsModal';

// Course interface
export interface Course {
  id: string;
  title: string;
  description: string;
  benefits: string;
  category: string;
  program: 'morning' | 'afternoon' | 'evening';
  credits: number;
  timezone: string;
  weeklySchedule: {
    day: string;
    isActive: boolean;
    timeSlots: {
      startTime: string;
      endTime: string;
      sessions: number;
      sessionDuration: number;
      bufferTime: number;
    }[];
  }[];
  thumbnail: string;
  introVideo?: string;
  coach: {
    id: string;
    name: string;
    avatar: string;
    rating?: number;
    totalReviews?: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    domain?: string;
    experience?: string;
    address?: string;
    languages?: string[];
    courses?: any[];
  };
}

// Minimal type definitions to fix errors
export interface CoursesProps {
  courses: Course[];
  parentData: any;
  loading?: boolean;
}

export interface CoachData {
  id: string;
  firstName: string;
  lastName: string;
  name?: string;
  bio?: string;
  avatarUrl?: string;
  specializations?: string[];
  certifications?: string[];
  languages?: string[];
  status?: string;
  email?: string;
  phone?: string;
  address?: string;
  registrationDate?: string;
  experience?: string;
  duration?: string;
  courses?: any[];
  adminNotes?: string;
  rating?: number;
  totalStudents?: number;
  education?: any[];
  hourlyRate?: number;
  courseTitle?: string;
  courseCategory?: string;
  courseCredits?: number;
  totalReviews?: number;
}

export interface EnrollmentData {
  courseId: string;
  selectedChildren: string[];
  totalPrice: number;
  paymentMethod?: {
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    cardholderName?: string;
  };
}

// Minimal child type for enrollment UI
interface ChildItem {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender?: string;
  currentGrade?: string;
  schoolName?: string;
}

export interface PaymentStep {
  step: 'children' | 'payment' | 'confirmation';
  title: string;
  description: string;
}

const priceRanges = [
  { value: 'all', label: 'All Prices' },
  { value: 'free', label: 'Free ($0)' },
  { value: 'low', label: 'Low ($1-50)' },
  { value: 'medium', label: 'Medium ($51-150)' },
  { value: 'high', label: 'High ($151-300)' },
  { value: 'premium', label: 'Premium ($300+)' }
];

const Courses: React.FC<CoursesProps> = ({ courses, parentData, loading = false }) => {

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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData>({
    courseId: '',
    selectedChildren: [],
    totalPrice: 0
  });
  const [isCoachLoading, setIsCoachLoading] = useState(false);
  const [availableChildren, setAvailableChildren] = useState<ChildItem[]>(Array.isArray(parentData?.children) ? parentData.children : []);
  const [childrenLoading, setChildrenLoading] = useState<boolean>(false);
  const [searchChild, setSearchChild] = useState<string>('');
  const [detailsChild, setDetailsChild] = useState<ChildItem | null>(null);
  const [showChildModal, setShowChildModal] = useState<boolean>(false);

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

  // Normalize to YYYY-MM-DD for consistency
  const toDateInput = (value: any): string => {
    if (!value) return '';
    if (typeof value === 'string') {
      if (value.includes('T')) return value.slice(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
      const d = new Date(value);
      return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
    }
    const d = new Date(value);
    return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
  };

  const cap = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

  // Load children when opening enrollment modal (fresh from backend)
  useEffect(() => {
    const loadChildren = async () => {
      if (!showEnrollmentModal) return;
      setChildrenLoading(true);
      try {
        const res = await childrenApi.getChildren();
        const payload = res?.data;
        const list = (payload?.data?.children ?? payload?.children ?? []) as any[];
        if (Array.isArray(list)) {
          const normalized: ChildItem[] = list.map((c: any) => ({
            id: c.id ?? c._id ?? `${c.firstName ?? ''}-${c.lastName ?? ''}-${c.dateOfBirth ?? ''}`,
            firstName: c.firstName ?? '',
            lastName: c.lastName ?? '',
            dateOfBirth: toDateInput(c.dateOfBirth ?? c.dob ?? ''),
            gender: (c.gender ?? '').toLowerCase(),
            currentGrade: c.currentGrade ?? c.grade ?? '',
            schoolName: c.schoolName ?? c.school ?? ''
          }));
          setAvailableChildren(normalized);
          return;
        }
      } catch (err) {
        // Fallback to parentData if API fails
        setAvailableChildren(Array.isArray(parentData?.children) ? parentData.children : []);
      } finally {
        setChildrenLoading(false);
      }
    };
    loadChildren();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showEnrollmentModal]);

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

  const handleViewCoachDetails = (courseId: string) => {
    console.log('[Parent] handleViewCoachDetails start → courseId:', courseId);

    const course = filteredCourses.find((c) => c.id === courseId);
    if (!course) {
      console.warn('[Parent] Course not found for courseId:', courseId);
      showErrorToast('Course not found');
      return;
    }

    setIsCoachLoading(true);
    console.log('[Parent] Calling API: /parent/coach/by-course/', courseId);
    getCoachDetailsByCourse(courseId)
      .then((response) => {
        console.log('[Parent] Coach API response:', response?.data);
        const api = response?.data?.data || response?.data;
        if (!api) throw new Error('Empty coach data');

        // Normalize API → UI shape
        const normalizedCoach: CoachData = {
          id: String(api.id ?? api.userId ?? course.coach?.id ?? ''),
          firstName: api.firstName ?? '',
          lastName: api.lastName ?? '',
          name:
            (api.firstName || api.lastName)
              ? `${api.firstName ?? ''} ${api.lastName ?? ''}`.trim()
              : (course.coach?.name ?? 'Coach'),
          avatarUrl: api.avatar ?? course.coach?.avatar ?? '',
          bio:
            api.domain || api.experience
              ? `Experienced ${api.domain ?? 'coach'} with ${api.experience ?? '0'} years of experience.`
              : '',
          specializations: api.domain ? [api.domain] : [],
          rating: Number(api.rating ?? 0),
          totalStudents: Number(api.totalReviews ?? 0),
          experience: api.experience ?? '',
          education: [],
          certifications: [],
          languages: Array.isArray(api.languages) ? api.languages : [],
          hourlyRate: Number(api.hourlyRate ?? 0),
          email: api.email ?? '',
          phone: api.phone ?? '',
          address: api.address ?? '',
          status: 'approved',
          registrationDate: new Date().toISOString(),
          duration: 'Flexible',
          courses: Array.isArray(api.courses)
            ? api.courses.map((c: any) => (typeof c === 'string' ? c : c.title ?? 'Untitled'))
            : [],
          courseTitle: course.title,
          courseCategory: course.category,
          courseCredits: course.credits,
          adminNotes: '',
          totalReviews: Number(api.totalReviews ?? 0),
        };

        console.log('[Parent] Normalized coach data:', normalizedCoach);
        setSelectedCoach(normalizedCoach);
        setShowCoachModal(true);
      })
      .catch((err) => {
        console.error('[Parent] Coach API failed, falling back to course.coach:', err);
        // Fallback to course.coach if API fails (still open modal)
        if (course.coach) {
          const fallbackCoach: CoachData = {
            id: String(course.coach.id ?? ''),
            firstName: course.coach.firstName ?? '',
            lastName: course.coach.lastName ?? '',
            name: course.coach.name ?? 'Coach',
            avatarUrl: course.coach.avatar ?? '',
            bio: '',
            specializations: course.coach.domain ? [course.coach.domain] : [],
            rating: Number(course.coach.rating ?? 0),
            totalStudents: Number(course.coach.totalReviews ?? 0),
            experience: course.coach.experience ?? '',
            education: [],
            certifications: [],
            languages: Array.isArray(course.coach.languages) ? course.coach.languages : [],
            hourlyRate: 0,
            email: course.coach.email ?? '',
            phone: course.coach.phone ?? '',
            address: course.coach.address ?? '',
            status: 'approved',
            registrationDate: new Date().toISOString(),
            duration: 'Flexible',
            courses: Array.isArray(course.coach.courses)
              ? course.coach.courses.map((c: any) => (typeof c === 'string' ? c : c.title ?? 'Untitled'))
              : [],
            courseTitle: course.title,
            courseCategory: course.category,
            courseCredits: course.credits,
            adminNotes: '',
            totalReviews: Number(course.coach.totalReviews ?? 0),
          };
          setSelectedCoach(fallbackCoach);
          setShowCoachModal(true);
        } else {
          showErrorToast('Unable to load coach details at the moment');
        }
      })
      .finally(() => setIsCoachLoading(false));
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
      setShowPaymentModal(true);
      setIsProcessingPayment(false);
      return;


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
 const handlePaymentSuccess = (paymentData) => {
    showSuccessToast(`Payment successful! Enrolled ${enrollmentData.selectedChildren.length} child(ren) in ${selectedCourse?.title}`);
    setShowPaymentModal(false);
    setShowEnrollmentModal(false);
    setCurrentStep('children');
    setSelectedCourse(null);
    setEnrollmentData({
      courseId: '',
      selectedChildren: [],
      totalPrice: 0
    });
  };


  const handlePaymentError = (error) => {
    showErrorToast('Payment failed. Please try again.');
    console.error('Payment error:', error);
  };  const resetEnrollmentFlow = () => {


    setShowEnrollmentModal(false);
    setCurrentStep('children');
    setSelectedCourse(null);
    setEnrollmentData({
      courseId: '',
      selectedChildren: [],
      totalPrice: 0
    });
  };

  // Utility: pick a gradient based on course title for variety
  function getGradient(title: string) {
    const gradients = [
      "bg-gradient-to-r from-blue-500 to-purple-600",
      "bg-gradient-to-r from-green-400 to-emerald-500",
      "bg-gradient-to-r from-pink-500 to-yellow-500",
      "bg-gradient-to-r from-indigo-500 to-blue-400",
      "bg-gradient-to-r from-orange-400 to-red-500",
      "bg-gradient-to-r from-teal-400 to-cyan-500",
      "bg-gradient-to-r from-fuchsia-500 to-pink-500"
    ];
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % gradients.length;
    return gradients[idx];
  }

  const categories = ['all', ...Array.from(new Set(courses.map(course => course.category)))];
  
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
      {!loading && filteredCourses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredCourses.map((course, index) => (
          <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
            {/* Course Content (Card) */}
            <CourseCard
              course={{
                ...course,
                thumbnail: course.thumbnail || ""
              }}
              onViewDetails={() => setSelectedCourse(course)}
              onEnroll={() => handleEnroll(course)}
              onViewCoachDetails={handleViewCoachDetails}
              formatProgram={formatProgram}
              formatTime={formatTime}
            />
          </div>
        ))}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8 sm:py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Loading courses...</h3>
          <p className="text-xs sm:text-sm text-gray-500">
            Please wait while we fetch the latest courses for you.
          </p>
        </div>
      )}

      {/* No Results */}
      {!loading && filteredCourses.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <FaBook className="text-gray-300 text-4xl sm:text-6xl mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            {courses.length === 0 ? "No courses available" : "No courses found"}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mb-4">
            {courses.length === 0 
              ? "There are currently no courses available. Please check back later."
              : "Try adjusting your search terms or filters to find more courses."
            }
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
              setSelectedPriceRange("all");
              setSelectedDateRange("all");
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Coach Details Modal */}
      {showCoachModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-2 sm:p-4">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <FaUser className="text-white text-lg sm:text-xl" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Coach Profile</h2>
                    <p className="text-xs sm:text-sm text-gray-600">Complete information about this coach</p>
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

            {/* Loading state */}
            {isCoachLoading ? (
              <div className="p-8 sm:p-12 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
                  <div className="text-gray-600 text-sm">Loading coach details...</div>
                </div>
              </div>
            ) : (
              selectedCoach && (
                <div className="p-4 sm:p-6 space-y-6">
                  {/* Hero */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 sm:p-8 text-center">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-4 sm:mb-5 rounded-full border-4 border-white shadow-md flex items-center justify-center overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600">
                      {selectedCoach.avatarUrl ? (
                        <img src={selectedCoach.avatarUrl} alt={selectedCoach.name || 'Coach'} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-2xl sm:text-3xl font-bold">
                          {(selectedCoach.name || 'C').charAt(0)}
                        </span>
                      )}
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{selectedCoach.name || 'Coach'}</h1>
                    {selectedCoach.bio && (
                      <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">{selectedCoach.bio}</p>
                    )}
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Contact */}
                    <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FaEnvelope className="text-blue-600" /> Contact
                      </h3>
                      <div className="space-y-3 text-sm sm:text-base">
                        <div className="flex items-start gap-3">
                          <FaEnvelope className="text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-gray-600 text-xs sm:text-sm">Email</p>
                            <p className="font-medium text-gray-900 break-all">{selectedCoach.email || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <FaPhone className="text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-gray-600 text-xs sm:text-sm">Phone</p>
                            <p className="font-medium text-gray-900 break-words">{selectedCoach.phone || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <FaMapMarkerAlt className="text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-gray-600 text-xs sm:text-sm">Address</p>
                            <p className="font-medium text-gray-900 break-words">{selectedCoach.address || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Professional */}
                    <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FaBriefcase className="text-green-600" /> Professional
                      </h3>
                      <div className="space-y-3 text-sm sm:text-base">
                        <div>
                          <p className="text-gray-600 text-xs sm:text-sm">Domain</p>
                          <p className="font-medium text-gray-900">{selectedCoach.specializations?.[0] || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs sm:text-sm">Experience</p>
                          <p className="font-medium text-gray-900">{selectedCoach.experience || 'N/A'}</p>
                        </div>
                        {!!selectedCoach.languages?.length && (
                          <div>
                            <p className="text-gray-600 text-xs sm:text-sm mb-2">Languages</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedCoach.languages.map((lang, idx) => (
                                <span key={idx} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs sm:text-sm border border-purple-200">
                                  {lang}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Courses Taught */}
                  <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FaBook className="text-indigo-600" /> Courses Taught
                    </h3>
                    {selectedCoach.courses && selectedCoach.courses.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedCoach.courses.map((c, idx) => (
                          <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <p className="font-medium text-gray-900 text-sm sm:text-base">
                              {typeof c === 'string' ? c : c.title || 'Untitled Course'}
                            </p>
                            {typeof c === 'object' && c.category && (
                              <p className="text-xs text-gray-500 mt-1">Category: {c.category}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">No courses listed.</p>
                    )}
                  </div>
                </div>
              )
            )}
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
                    {(selectedCourse.thumbnail && selectedCourse.thumbnail !== "") ? (
                      <div className="relative">
                        <img
                          src={selectedCourse.thumbnail}
                          alt={selectedCourse.title}
                          className="w-full h-48 sm:h-60 lg:h-80 object-cover rounded-xl shadow-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-xl flex items-center justify-center">
                          <button 
                            onClick={() => {
                              if (selectedCourse.introVideo) {
                                window.open(selectedCourse.introVideo, '_blank');
                              } else {
                                showErrorToast('No introduction video available for this course');
                              }
                            }}
                            className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-900 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg flex items-center gap-2 sm:gap-3 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                          >
                            <FaPlay className="text-sm sm:text-lg" />
                            <span className="hidden sm:inline">Watch Introduction Video</span>
                            <span className="sm:hidden">Watch Video</span>
                          </button>
                        </div>
                        {!selectedCourse.introVideo && (
                          <div className="absolute bottom-2 left-0 w-full text-center">
                            <span className="text-xs text-white bg-black bg-opacity-40 px-2 py-1 rounded">No introduction video available</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={`relative w-full h-48 sm:h-60 lg:h-80 rounded-xl shadow-lg flex items-center justify-center text-white text-2xl font-bold select-none ${getGradient(selectedCourse.title)}`}>
                        <span className="mx-auto text-center w-full">{selectedCourse.title}</span>
                        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-xl flex items-center justify-center">
                          <button 
                            onClick={() => {
                              if (selectedCourse.introVideo) {
                                window.open(selectedCourse.introVideo, '_blank');
                              } else {
                                showErrorToast('No introduction video available for this course');
                              }
                            }}
                            className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-900 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg flex items-center gap-2 sm:gap-3 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                          >
                            <FaPlay className="text-sm sm:text-lg" />
                            <span className="hidden sm:inline">Watch Introduction Video</span>
                            <span className="sm:hidden">Watch Video</span>
                          </button>
                        </div>
                        {!selectedCourse.introVideo && (
                          <div className="absolute bottom-2 left-0 w-full text-center">
                            <span className="text-xs text-white bg-black bg-opacity-40 px-2 py-1 rounded">No introduction video available</span>
                          </div>
                        )}
                      </div>
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
                        {selectedCourse.coach.avatar && selectedCourse.coach.avatar !== "" ? (
                          <img
                            src={selectedCourse.coach.avatar}
                            alt={selectedCourse.coach.name}
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-white shadow-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-bold text-lg sm:text-xl">
                              {selectedCourse.coach.name?.charAt(0).toUpperCase() || 'C'}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{selectedCourse.coach.name}</h3>
                          <p className="text-sm sm:text-base text-gray-600">Course Instructor</p>
                          {selectedCourse.coach.domain && (
                            <p className="text-xs text-gray-500">Specialization: {selectedCourse.coach.domain}</p>
                          )}
                          {selectedCourse.coach.experience && (
                            <p className="text-xs text-gray-500">Experience: {selectedCourse.coach.experience} years</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewCoachDetails(selectedCourse.id)}
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
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-8 border border-blue-100">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FaBook className="text-blue-600 text-sm sm:text-base" />
                    Course Overview
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-12">
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
                  
                  {availableChildren && availableChildren.length > 0 ? (
                    <div className="space-y-3">
                      {/* Search */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={searchChild}
                          onChange={(e) => setSearchChild(e.target.value)}
                          placeholder="Search children by name, grade, school..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                          aria-label="Search children"
                        />
                      </div>

                      <label className="block text-sm font-medium text-gray-700 mt-1">
                        Choose children to enroll in this course:
                      </label>
                      <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2 sm:p-3">
                        {availableChildren
                          .filter((c) => {
                            if (!searchChild) return true;
                            const q = searchChild.toLowerCase();
                            return (
                              `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
                              (c.currentGrade || '').toLowerCase().includes(q) ||
                              (c.schoolName || '').toLowerCase().includes(q)
                            );
                          })
                          .map((child) => {
                              const isSelected = enrollmentData.selectedChildren.includes(child.id);
                              const age = calculateAge(child.dateOfBirth);
                              return (
                                <div key={child.id} className="flex items-start justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                                  <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => handleChildSelection(child.id)}
                                      className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-gray-900 text-sm sm:text-base break-words">
                                        {child.firstName} {child.lastName}
                                      </div>
                                      <div className="text-xs sm:text-sm text-gray-500 break-words">
                                        ({age} years old • {child.currentGrade || 'N/A'})
                                      </div>
                                    </div>
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => { setDetailsChild(child); setShowChildModal(true); }}
                                    className="text-xs text-indigo-600 hover:text-indigo-700 px-2 py-1 border border-indigo-200 rounded"
                                  >
                                    View details
                                  </button>
                                </div>
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
      {/* Payment Modal */}
      <div>
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        course={selectedCourse}
        selectedChildren={
          enrollmentData.selectedChildren
            .map(childId => availableChildren.find(child => child.id === childId))
            .filter(Boolean) as any
        }
        totalAmount={selectedCourse?.credits && enrollmentData.selectedChildren.length > 0 ? Math.max(selectedCourse.credits * enrollmentData.selectedChildren.length * 25, 1) : 1}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
      {/* Child Details Modal */}
      <ChildDetailsModal
        isOpen={showChildModal}
        onClose={() => setShowChildModal(false)}
        child={detailsChild}
      />
      </div>
    </div>
    
  );
};

export default Courses;
