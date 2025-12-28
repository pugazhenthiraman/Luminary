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
import childrenApi from '../../api/children';
import { paymentAPI } from '../../api/payment';
import ChildDetailsModal from '../../components/ChildDetailsModal';
import creditsApi from '../../api/credits';
import EnrollmentFlow from '../enrollment/EnrollmentFlow';
import EnrollmentIntroModal from '../enrollment/EnrollmentIntroModal';
import { getCourseById } from '../../api/courses';
import { useAuthStore } from '../../stores/useAuthStore';
import { getCourseReviews, createCourseReview, updateCourseReview, deleteCourseReview, checkCanReview } from '../../api/reviews';
import ReviewDisplay from '../../components/ReviewDisplay';
import ReviewForm from '../../components/ReviewForm';
import WalletPlansModal, { type WalletPlan } from '../../components/WalletPlansModal';
import WalletPaymentModal from '../../components/WalletPaymentModal';
import LocationSelector from '../../components/LocationSelector';

// Course interface
export interface Course {
  id: string;
  title: string;
  description: string;
  benefits: string;
  category: string;
  program?: 'morning' | 'afternoon' | 'evening';
  credits: number;
  timezone: string;
  createdAt?: string;
  // Additional fields for course details
  ageRanges?: string[];
  location?: string;
  locationType?: string;
  // Location fields
  city?: string;
  state?: string;
  zipcode?: string;
  distance?: number;
  distanceKm?: number;
  distanceFormatted?: string;
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
  status?: string;
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
  onEnroll?: (course: Course) => void;
  onTabChange?: (tab: string) => void;
  onBalanceChange?: () => void;
  onEnrollmentSuccess?: () => void;
  enrollments?: any[];
  onCoursesRefresh?: () => void;
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
  { value: 'all', label: 'All Credits' },
  { value: 'low', label: '1-5 Credits' },
  { value: 'medium', label: '6-10 Credits' },
  { value: 'high', label: '11-15 Credits' },
  { value: 'premium', label: '16+ Credits' }
];

const Courses: React.FC<CoursesProps> = ({ courses, parentData, loading = false, onEnroll: externalOnEnroll, onTabChange, onBalanceChange, onEnrollmentSuccess, enrollments = [] }) => {
  const { user } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedLocationType, setSelectedLocationType] = useState('all'); // all, online, in-person, hybrid
  // Initialize sortBy based on available location (check both localStorage and user profile)
  const [sortBy, setSortBy] = useState(() => {
    // Check localStorage first
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        const location = JSON.parse(savedLocation);
        if (location.zipcode) {
          return 'distance'; // Default to distance when location is set
        }
      } catch (e) {
        // Ignore error
      }
    }
    // Check user profile (if available at mount)
    // Note: user might not be loaded yet, so we'll also check in useEffect
    return 'newest'; // Default to newest if no location
  });
  const [showFilters, setShowFilters] = useState(false);
  // Location states
  const [userZipcode, setUserZipcode] = useState<string>('');
  const [userCity, setUserCity] = useState<string>('');
  const [userState, setUserState] = useState<string>('TX');
  const [searchRadius, setSearchRadius] = useState<number>(10);
  
  // Load location from localStorage on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    const savedRadius = localStorage.getItem('searchRadius');
    
    if (savedLocation) {
      try {
        const location = JSON.parse(savedLocation);
        if (location.zipcode) {
          setUserZipcode(location.zipcode);
          setUserCity(location.city || '');
          setUserState(location.state || 'TX');
          // When location is set, default to distance sorting (nearest first)
          setSortBy('distance');
        }
      } catch (e) {
        console.error('Error loading saved location:', e);
      }
    }
    
    // Also check user profile for location
    if (!savedLocation && user?.zipcode) {
      setUserZipcode(user.zipcode);
      setUserCity(user.city || '');
      setUserState(user.state || 'TX');
      // When location from profile is set, default to distance sorting
      setSortBy('distance');
    }
    
    if (savedRadius) {
      const radiusValue = parseInt(savedRadius, 10);
      // Accept -1 for "> 25 miles" or valid numeric radius
      if (!isNaN(radiusValue) && ([5, 10, 15, 20, 25, -1].includes(radiusValue))) {
        setSearchRadius(radiusValue);
      }
    }
  }, [user]);
  
  // Trigger course reload when location changes
  useEffect(() => {
    if (userZipcode && onTabChange) {
      // Dispatch event to trigger reload in ParentDashboard
      window.dispatchEvent(new Event('locationChanged'));
    }
  }, [userZipcode, searchRadius]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  // Course chosen for enrollment (separate from detail view)
  const [enrollCourse, setEnrollCourse] = useState<Course | null>(null);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [parentCredits, setParentCredits] = useState<number>(0);
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<CoachData | null>(null);
  const [currentStep] = useState<'children'>('children');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  // Restored state for enrollment flow and coach modal
  const [availableChildren, setAvailableChildren] = useState<ChildItem[]>([]);
  const [childrenLoading, setChildrenLoading] = useState<boolean>(false);
  const [searchChild, setSearchChild] = useState<string>('');
  const [enrolledChildIds, setEnrolledChildIds] = useState<string[]>([]);
  const [detailsChild, setDetailsChild] = useState<ChildItem | null>(null);
  const [showChildModal, setShowChildModal] = useState<boolean>(false);
  const [isCoachLoading, setIsCoachLoading] = useState<boolean>(false);
  const [isLoadingIntroData, setIsLoadingIntroData] = useState<boolean>(false);
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData>({
    courseId: '',
    selectedChildren: [],
    totalPrice: 0
  });
  // Credit-related states
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);
  const [creditBalanceLoading, setCreditBalanceLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<WalletPlan | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  // Review states
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  // Enrollment success state
  const [enrollmentSuccess, setEnrollmentSuccess] = useState<{
    show: boolean;
    courseTitle: string;
    childrenCount: number;
    creditsUsed: number;
    newBalance: number;
  }>({
    show: false,
    courseTitle: '',
    childrenCount: 0,
    creditsUsed: 0,
    newBalance: 0
  });
  const [totalReviews, setTotalReviews] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [canReview, setCanReview] = useState<boolean | null>(null);
  const [reviewErrorMessage, setReviewErrorMessage] = useState<string>('');
  
  // Payment steps configuration
  // For now, only enable children selection; payment & confirmation kept for later
  const paymentSteps: PaymentStep[] = [
    {
      step: 'children',
      title: 'Select Children',
      description: 'Choose which children to enroll in this course'
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
    { value: 'rating', label: 'Sort by Rating' },
    { value: 'distance', label: 'Distance: Nearest First' }
  ];

  // Location type options
  const locationTypeOptions = [
    { value: 'all', label: 'All Locations' },
    { value: 'in-person', label: 'In-Person' },
    { value: 'online', label: 'Online' },
    { value: 'hybrid', label: 'Hybrid' }
  ];

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let filtered = courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.coach.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
      
      // Location type filtering
      const matchesLocationType = selectedLocationType === 'all' || course.locationType === selectedLocationType;
      
      // Credit range filtering (using credits directly)
      const courseCredits = course.credits || 0;
      let matchesPriceRange = true;
      if (selectedPriceRange !== 'all') {
        switch (selectedPriceRange) {
          case 'low':
            matchesPriceRange = courseCredits >= 1 && courseCredits <= 5;
            break;
          case 'medium':
            matchesPriceRange = courseCredits >= 6 && courseCredits <= 10;
            break;
          case 'high':
            matchesPriceRange = courseCredits >= 11 && courseCredits <= 15;
            break;
          case 'premium':
            matchesPriceRange = courseCredits >= 16;
            break;
        }
      }

      // Date range filtering (using createdAt field)
      let matchesDateRange = true;
      if (selectedDateRange !== 'all' && course.createdAt) {
        const courseDate = new Date(course.createdAt);
        const now = new Date();
        
        // Only apply filter if courseDate is valid
        if (!isNaN(courseDate.getTime())) {
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
      }

      return matchesSearch && matchesCategory && matchesLocationType && matchesPriceRange && matchesDateRange;
    });

    // Sort courses
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          // Sort by createdAt, newest first
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        case 'oldest':
          // Sort by createdAt, oldest first
          const dateA2 = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateA2 - dateB2;
        case 'price-low-high':
          return (a.credits || 0) - (b.credits || 0);
        case 'price-high-low':
          return (b.credits || 0) - (a.credits || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'rating':
          // This would need actual rating data - for now sort by credits as proxy
          return (b.credits || 0) - (a.credits || 0);
        case 'distance':
          // Sort by distance (nearest first - ascending order)
          const distA = a.distance !== undefined && a.distance !== null ? a.distance : Infinity;
          const distB = b.distance !== undefined && b.distance !== null ? b.distance : Infinity;
          // Ascending order: lower distance first (nearest first)
          return distA - distB;
        default:
          return 0;
      }
    });

    return filtered;
  }, [courses, searchTerm, selectedCategory, selectedLocationType, selectedPriceRange, selectedDateRange, sortBy]);

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatProgram = (program: string | undefined) => {
    if (!program) return 'All Day';
    return program.charAt(0).toUpperCase() + program.slice(1);
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedLocationType('all');
    setSelectedPriceRange('all');
    setSelectedDateRange('all');
    setSearchTerm('');
    setSortBy('newest');
  };

  const clearFilter = (filterType: 'category' | 'location' | 'price' | 'date' | 'search' | 'sort') => {
    switch (filterType) {
      case 'category':
        setSelectedCategory('all');
        break;
      case 'location':
        setSelectedLocationType('all');
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
    if (selectedLocationType !== 'all') count++;
    if (selectedPriceRange !== 'all') count++;
    if (selectedDateRange !== 'all') count++;
    if (searchTerm) count++;
    if (sortBy !== 'newest') count++;
    if (userZipcode) count++; // Location search is a filter
    return count;
  };

  const getActiveFilters = () => {
    const filters: Array<{ type: string; label: string; value: string }> = [];
    if (selectedCategory !== 'all') filters.push({ type: 'category', label: selectedCategory, value: selectedCategory });
    if (selectedLocationType !== 'all') filters.push({ type: 'location', label: locationTypeOptions.find(l => l.value === selectedLocationType)?.label || selectedLocationType, value: selectedLocationType });
    if (selectedPriceRange !== 'all') filters.push({ type: 'price', label: priceRanges.find(p => p.value === selectedPriceRange)?.label || selectedPriceRange, value: selectedPriceRange });
    if (selectedDateRange !== 'all') filters.push({ type: 'date', label: dateRanges.find(d => d.value === selectedDateRange)?.label || selectedDateRange, value: selectedDateRange });
    if (searchTerm) filters.push({ type: 'search', label: `"${searchTerm}"`, value: searchTerm });
    if (userZipcode) filters.push({ type: 'location', label: `${userCity || 'Location'} (${userZipcode})`, value: userZipcode });
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
          
          // Track which children are already enrolled in the current course
          let enrolledIds: string[] = [];
          if (enrollCourse?.id && enrollments.length > 0) {
            const courseId = enrollCourse.id;
            enrolledIds = enrollments
              .filter(e => e.courseId === courseId || e.courseId === String(courseId))
              .map(e => e.childId);
          }
          
          setEnrolledChildIds(enrolledIds);
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
  }, [showEnrollmentModal, enrollCourse?.id, enrollments]);

  // Load credit balance on component mount
  useEffect(() => {
    const loadCreditBalance = async () => {
      if (!user?.id) return;
      setCreditBalanceLoading(true);
      try {
        const balance = await creditsApi.getBalance(user.id);
        setParentCredits(balance?.creditBalance?.balance || 0);
      } catch (error) {
        console.error('Failed to load credit balance:', error);
        setParentCredits(0);
      } finally {
        setCreditBalanceLoading(false);
      }
    };
    loadCreditBalance();
  }, [user?.id]);

  const handleEnroll = (course: Course) => {
    // If external onEnroll is provided (for public browsing), use it
    if (externalOnEnroll) {
      externalOnEnroll(course);
      return;
    }
    
    // First show the new image/preview intro modal
    setEnrollCourse(course);
    setEnrollmentData({
      courseId: course.id,
      selectedChildren: [],
      totalPrice: 0
    });
    setShowIntroModal(true);
  };

  const proceedFromIntro = () => {
    // Calculate required credits
    const requiredCredits = enrollCourse ? enrollCourse.credits : 0;
    
    // Check if user has enough credits
    if (parentCredits < requiredCredits) {
      showErrorToast(`Insufficient credits. You need ${requiredCredits} credits but only have ${parentCredits}. Please purchase a credit package.`);
      setShowBuyCreditsModal(true);
      setShowIntroModal(false);
      return;
    }
    
    // Close intro and open the children selection modal
    setShowIntroModal(false);
    setShowEnrollmentModal(true);
  };

  const handleChildSelection = (childId: string) => {
    setEnrollmentData(prev => {
      const isSelected = prev.selectedChildren.includes(childId);
      const newSelectedChildren = isSelected 
        ? prev.selectedChildren.filter(id => id !== childId)
        : [...prev.selectedChildren, childId];
      
      // Calculate total credits required (not dollar price)
      const unitCredits = (enrollCourse?.credits || 0);
      const totalCreditsNeeded = newSelectedChildren.length * unitCredits;
      
      // Store as totalPrice for compatibility with existing code
      // But it actually represents credits
      return {
        ...prev,
        selectedChildren: newSelectedChildren,
        totalPrice: totalCreditsNeeded
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
    if (enrollmentData.selectedChildren.length === 0) {
      showErrorToast('Please select at least one child to enroll');
      return;
    }
    
    // Check credits before proceeding
    const totalCreditsNeeded = (enrollCourse?.credits || 0) * enrollmentData.selectedChildren.length;
    if (parentCredits < totalCreditsNeeded) {
      showErrorToast(`Insufficient credits. Required: ${totalCreditsNeeded}, Available: ${parentCredits}. Please purchase more credits.`);
      setShowBuyCreditsModal(true);
      return;
    }
    
    // Proceed directly to enrollment (no payment step needed for credit-based)
    processPayment();
  };

  const handlePreviousStep = () => {
    // Go back to children selection (not needed with credit-based flow)
    // This is kept for compatibility with EnrollmentFlow component
    // setCurrentStep removed - we only have 'children' step
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

  const processPayment = async (paymentFormData?: any) => {
    if (!enrollCourse || !enrollmentData.selectedChildren.length || !user?.id) {
      console.error('❌ Missing course, children data, or user ID');
      return;
    }

    setIsProcessingPayment(true);
    console.log('🚀 Starting credit-based enrollment...');
    console.log('📚 Course:', enrollCourse);
    console.log('👶 Selected children:', enrollmentData.selectedChildren);
    console.log('💳 Credit balance:', parentCredits);

    try {
      // Calculate total credit cost
      const creditCostPerChild = enrollCourse.credits;
      const totalCreditCost = creditCostPerChild * enrollmentData.selectedChildren.length;
      
      // Verify sufficient credits again
      if (parentCredits < totalCreditCost) {
        throw new Error(`Insufficient credits. Required: ${totalCreditCost}, Available: ${parentCredits}`);
      }

      // Enroll using credits API
      console.log('📡 Calling creditsApi.enrollWithCredits...');
      const enrollmentResponse = await creditsApi.enrollWithCredits(user.id, {
        courseId: Number(enrollCourse.id),
        childrenIds: enrollmentData.selectedChildren
      });

      console.log('✅ Enrollment response:', enrollmentResponse);

      if (enrollmentResponse.success) {
        console.log('🎉 Enrollment successful!');
        
        // Update credit balance in state
        const newBalance = enrollmentResponse.data?.creditBalance?.balance || 
                          (parentCredits - totalCreditCost);
        setParentCredits(newBalance);
        
        // Refresh the credit balance in the header
        if (onBalanceChange) {
          onBalanceChange();
        }
        
        // Refresh the enrollments list
        if (onEnrollmentSuccess) {
          onEnrollmentSuccess();
        }
        
        // Show success modal instead of toast
        setEnrollmentSuccess({
          show: true,
          courseTitle: enrollCourse.title,
          childrenCount: enrollmentData.selectedChildren.length,
          creditsUsed: totalCreditCost,
          newBalance: newBalance
        });
        
        // Reset enrollment flow
        resetEnrollmentFlow();
      } else {
        throw new Error(enrollmentResponse.message || "Enrollment failed");
      }
    } catch (err: any) {
      console.error('❌ Enrollment error:', err);
      console.error('❌ Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      
      // Extract error message from response
      let errorMessage = err.response?.data?.message || err.message || "Enrollment failed. Please try again.";
      
      // If insufficient credits, show a user-friendly message with buy credits option
      if (errorMessage.includes('Insufficient credits')) {
        // Parse the credit requirements from the error message
        const match = errorMessage.match(/Required: (\d+), Available: (\d+)/);
        if (match) {
          const required = parseInt(match[1]);
          const available = parseInt(match[2]);
          const needed = required - available;
          // Format message for toast (newline characters won't work in toast, use HTML line breaks)
          errorMessage = `Insufficient Credits - You need ${needed} more credits (Required: ${required}, You have: ${available})`;
        } else {
          errorMessage = `Insufficient Credits - ${errorMessage}`;
        }
        showErrorToast(errorMessage);
        setShowBuyCreditsModal(true);
      } else if (errorMessage.includes('Already enrolled')) {
        // Extract child names from error message
        const match = errorMessage.match(/Already enrolled: (.+) is\/are already enrolled/);
        if (match) {
          errorMessage = `${match[1]} ${match[1].includes('are') ? 'are' : 'is'} already enrolled in this course`;
        }
        showErrorToast(errorMessage);
      } else {
        showErrorToast(errorMessage);
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };
  const resetEnrollmentFlow = () => {
    setShowEnrollmentModal(false);
    setShowIntroModal(false);
    setEnrollCourse(null);
    // Do not touch selectedCourse here; it's for the detail modal
    setEnrollmentData({
      courseId: '',
      selectedChildren: [],
      totalPrice: 0
    });
    
    // After enrollment, if viewing course details, refresh can-review check
    if (selectedCourse) {
      checkUserCanReview(selectedCourse.id);
    }
  };

  // Load reviews when course detail opens
  useEffect(() => {
    if (selectedCourse) {
      loadCourseReviews(selectedCourse.id);
      checkUserCanReview(selectedCourse.id);
    }
  }, [selectedCourse]);

  const loadCourseReviews = async (courseId: string) => {
    setLoadingReviews(true);
    try {
      const response = await getCourseReviews(courseId, { page: 1, limit: 20 });
      setReviews(response.data.data.reviews);
      setAverageRating(response.data.data.rating.average);
      setTotalReviews(response.data.data.rating.total);
    } catch (error) {
      console.error('Failed to load reviews:', error);
      setReviews([]);
      setAverageRating(0);
      setTotalReviews(0);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Check if user can review this course (must be enrolled)
  const checkUserCanReview = async (courseId: string) => {
    try {
      const response = await checkCanReview(courseId);
      const data = response.data?.data || response.data;
      setCanReview(data.canReview || false);
      setReviewErrorMessage(data.reason || '');
    } catch (error) {
      console.error('Failed to check review eligibility:', error);
      setCanReview(false);
      setReviewErrorMessage('Unable to check review eligibility. Please log in and enroll in the course.');
    }
  };

  const handleSubmitReview = async (data: { rating: number; comment: string; childId?: string }) => {
    if (!selectedCourse) return;
    
    try {
      if (editingReview) {
        await updateCourseReview(editingReview.id, data);
        setEditingReview(null);
      } else {
        await createCourseReview(selectedCourse.id, data);
      }
      
      setShowReviewForm(false);
      loadCourseReviews(selectedCourse.id);
    } catch (error: any) {
      console.error('Review submission error:', error);
      const message = error.response?.data?.message || error.message || 'Failed to submit review';
      
      // If enrollment is required, show the message and don't close the form
      if (message.includes('enroll') || message.includes('Enrollment')) {
        showErrorToast(message);
        setShowReviewForm(true); // Keep form open
      } else {
        showErrorToast(message);
        setShowReviewForm(false);
      }
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!selectedCourse) return;
    
    if (window.confirm('Are you sure you want to delete this review?')) {
      await deleteCourseReview(reviewId);
      loadCourseReviews(selectedCourse.id);
    }
  };

  const handleEditReview = (review: any) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  // Checkout actions are triggered from the Next button after children selection

  // Backup (disabled): credit-based checkout and modal rendering kept for later
  /*
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [creditBalance, setCreditBalance] = useState<number>(0);
  const buyWithCredits = async () => { ... };
  */

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

  // Load live credits balance for parent (if available) on mount
  useEffect(() => {
    const loadCredits = async () => {
      try {
        const { user } = useAuthStore.getState();
        if (!user?.id) return;
        const bal = await creditsApi.getBalance(user.id);
        const creditValue = typeof (bal as any)?.balance === 'number' ? (bal as any).balance : (typeof bal === 'number' ? bal : undefined);
        setParentCredits(creditValue);
      } catch (e) {
        // silent fail; keep placeholder
      }
    };
    loadCredits();
  }, []);

  // When intro opens, fetch latest course details and coach info
  useEffect(() => {
    const prefetch = async () => {
      if (!showIntroModal || !enrollCourse) return;
      setIsLoadingIntroData(true);
      try {
        // Fetch full course details
        const res = await getCourseById(enrollCourse.id);
        const cd = res?.data?.data || res?.data;
        if (cd) {
          // Merge into enrollCourse for fresh details (price/thumbnail/introVideo etc.)
          setEnrollCourse(prev => prev ? { ...prev, ...cd, coach: { ...prev.coach, ...cd.coach } } : cd);
        }
        // Also ensure coach info via parent endpoint (email/phone/status)
        try {
          const coachRes = await getCoachDetailsByCourse(enrollCourse.id);
          const coachData = coachRes?.data?.data;
          if (coachData) {
            setEnrollCourse(prev => prev ? { ...prev, coach: {
              ...prev.coach,
              name: coachData.name || coachData.firstName + ' ' + (coachData.lastName || ''),
              email: coachData.email || prev.coach?.email,
              phone: coachData.phone || prev.coach?.phone,
              status: coachData.status || prev.coach?.status
            } } : prev);
          }
        } catch {}
      } catch (e) {
        // ignore
      } finally {
        setIsLoadingIntroData(false);
      }
    };
    prefetch();
  }, [showIntroModal, enrollCourse?.id]);

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

      {/* Location Selector */}
      <LocationSelector
        zipcode={userZipcode}
        city={userCity}
        state={userState}
        onLocationChange={(location) => {
          setUserZipcode(location.zipcode || '');
          setUserCity(location.city || '');
          setUserState(location.state || 'TX');
        }}
        onRadiusChange={(radius) => {
          setSearchRadius(radius);
        }}
        defaultRadius={searchRadius}
      />

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
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Credit Range</label>
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

              {/* Location Type Filter */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Location Type</label>
                <select
                  value={selectedLocationType}
                  onChange={(e) => setSelectedLocationType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  aria-label="Filter by location type"
                >
                  {locationTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
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
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Instructor Profile</h2>
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
                  <div className="grid grid-cols-1 gap-4 sm:gap-6">
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
                        <div className="text-xs sm:text-sm text-purple-600 font-medium mb-1">Credits</div>
                        <div className="font-semibold text-gray-900 text-sm sm:text-base">{selectedCourse.credits}</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                        <div className="text-xs sm:text-sm text-orange-600 font-medium mb-1">Timezone</div>
                        <div className="font-semibold text-gray-900 text-sm sm:text-base">{selectedCourse.timezone}</div>
                      </div>
                      {(selectedCourse as any).ageRanges && (selectedCourse as any).ageRanges.length > 0 && (
                        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm xl:col-span-2">
                          <div className="text-xs sm:text-sm text-pink-600 font-medium mb-2">Age Ranges</div>
                          <div className="flex flex-wrap gap-2">
                            {(selectedCourse as any).ageRanges.map((range: string, idx: number) => (
                              <span key={idx} className="inline-block bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                                {range}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {(selectedCourse as any).location && (
                        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm xl:col-span-2">
                          <div className="text-xs sm:text-sm text-teal-600 font-medium mb-1">
                            {(selectedCourse as any).locationType ? (
                              (selectedCourse as any).locationType.charAt(0).toUpperCase() + (selectedCourse as any).locationType.slice(1).replace('-', ' ')
                            ) : 'Location'}
                          </div>
                          <div className="font-semibold text-gray-900 text-sm sm:text-base truncate" title={(selectedCourse as any).location}>
                            {(selectedCourse as any).location}
                          </div>
                        </div>
                      )}
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

              {/* Reviews Section */}
              <div className="mt-8 border-t border-gray-200 pt-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
                  {useAuthStore.getState().user && (
                    <div className="flex items-center gap-3">
                      {canReview === false && reviewErrorMessage && (
                        <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
                          <span className="flex items-center gap-1">
                            <FaClock className="mr-1" />
                            {reviewErrorMessage}
                          </span>
                        </div>
                      )}
                      {canReview === true && (
                        <button
                          onClick={() => setShowReviewForm(true)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
                        >
                          Write a Review
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {loadingReviews ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading reviews...</p>
                  </div>
                ) : (
                  <ReviewDisplay
                    reviews={reviews}
                    averageRating={averageRating}
                    totalReviews={totalReviews}
                    currentUserId={useAuthStore.getState().user?.id}
                    onEdit={handleEditReview}
                    onDelete={handleDeleteReview}
                    showEditDelete={true}
                  />
                )}
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

      {/* Enrollment Modal (modularized) */}
      <EnrollmentFlow
        open={showEnrollmentModal && !!enrollCourse}
        onClose={resetEnrollmentFlow}
        course={enrollCourse ? { id: enrollCourse.id, title: enrollCourse.title, credits: enrollCourse.credits, coach: { name: enrollCourse.coach?.name || '' } } : null}
        availableChildren={availableChildren}
        childrenLoading={childrenLoading}
        state={enrollmentData}
        step={currentStep}
        steps={paymentSteps as any}
        onToggleChild={handleChildSelection}
        onNext={handleNextStep}
        onPrev={handlePreviousStep}
        onReset={resetEnrollmentFlow}
        onPaymentChange={(field, value) => handlePaymentMethodChange(field as any, value)}
        canProceedPayment={!!(enrollmentData.paymentMethod?.cardNumber && enrollmentData.paymentMethod?.expiryDate && enrollmentData.paymentMethod?.cvv && enrollmentData.paymentMethod?.cardholderName)}
        isProcessing={isProcessingPayment}
        onProcessPayment={processPayment}
        onViewChild={(child) => { setDetailsChild(child as any); setShowChildModal(true); }}
        enrolledChildIds={enrolledChildIds}
      />
      {/* New: Intro modal shown before children selection */}
      <EnrollmentIntroModal
        open={showIntroModal && !!enrollCourse}
        onClose={() => { setShowIntroModal(false); setEnrollCourse(null); }}
        onContinue={proceedFromIntro}
        course={enrollCourse ? {
          id: enrollCourse.id,
          title: enrollCourse.title,
          description: enrollCourse.description,
          credits: enrollCourse.credits,
          thumbnail: enrollCourse.thumbnail,
          introVideo: enrollCourse.introVideo,
          coach: { name: enrollCourse.coach?.name || '', email: enrollCourse.coach?.email, phone: enrollCourse.coach?.phone, status: enrollCourse.coach?.status },
          category: enrollCourse.category,
          lengthText: (enrollCourse.weeklySchedule?.[0]?.timeSlots?.[0]?.sessionDuration ? `${enrollCourse.weeklySchedule[0].timeSlots[0].sessionDuration} min/session` : undefined),
          rating: enrollCourse.coach?.totalReviews ? { value: Math.min(5, (enrollCourse.credits * 0.8)), count: enrollCourse.coach.totalReviews } : undefined,
          createdAt: new Date().toISOString(),
          // Don't map price - courses use credits only, not USD
          price: undefined,
        } : null}
        creditsAvailable={typeof parentCredits === 'number' ? parentCredits : undefined}
        onBuyWithCredit={proceedFromIntro}
        onPreview={() => setSelectedCourse(enrollCourse as any)}
      />
  {/* Backup: Checkout Modal (credits-first) kept for later
  <CheckoutModal ... />
  */}

      {/* Child Details Modal */}
      <ChildDetailsModal
        isOpen={showChildModal}
        onClose={() => setShowChildModal(false)}
        child={detailsChild}
      />

      {/* Review Form Modal */}
      {showReviewForm && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-2 sm:p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {editingReview ? 'Edit Your Review' : 'Write a Review'}
                </h2>
                <button
                  onClick={() => {
                    setShowReviewForm(false);
                    setEditingReview(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <ReviewForm
                courseId={selectedCourse.id}
                children={availableChildren}
                onSubmit={handleSubmitReview}
                onCancel={() => {
                  setShowReviewForm(false);
                  setEditingReview(null);
                }}
                initialData={editingReview ? {
                  rating: editingReview.rating,
                  comment: editingReview.comment,
                  childId: editingReview.child?.id
                } : undefined}
                existingReview={!!editingReview}
              />
            </div>
          </div>
        </div>
      )}

      {/* Buy Credits Modal */}
      <WalletPlansModal
        isOpen={showBuyCreditsModal}
        onClose={() => setShowBuyCreditsModal(false)}
        onBuy={(plan) => {
          setShowBuyCreditsModal(false);
          setSelectedPlan(plan);
          setPaymentOpen(true);
        }}
      />

      {/* Payment Modal for Selected Plan */}
      <WalletPaymentModal
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        plan={selectedPlan as any}
        onSuccess={async ({ creditsAdded }) => {
          // Reload credit balance
          if (user?.id) {
            try {
              const balance = await creditsApi.getBalance(user.id);
              setParentCredits(balance?.creditBalance?.balance || 0);
              showSuccessToast(`Successfully added ${creditsAdded} credits to your wallet!`);
            } catch (error) {
              console.error('Failed to reload balance:', error);
            }
          }
          setPaymentOpen(false);
        }}
      />

      {/* Enrollment Success Modal */}
      {enrollmentSuccess.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <FaCheck className="text-green-600 text-3xl" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white text-center">
                Enrollment Successful!
              </h2>
            </div>

            {/* Success Content */}
            <div className="p-6">
              <p className="text-gray-700 text-center mb-6">
                Your child{enrollmentSuccess.childrenCount > 1 ? 'ren have' : ' has'} been successfully enrolled in:
              </p>

              {/* Course Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaBook className="text-white text-xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg truncate">
                      {enrollmentSuccess.courseTitle}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {enrollmentSuccess.childrenCount} child{enrollmentSuccess.childrenCount > 1 ? 'ren' : ''} enrolled
                    </p>
                  </div>
                </div>
              </div>

              {/* Credits Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium">Credits Used</span>
                  <span className="text-red-600 font-bold text-lg">-{enrollmentSuccess.creditsUsed}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-gray-700 font-semibold">Available Credits</span>
                  <span className="text-green-700 font-bold text-xl">{enrollmentSuccess.newBalance}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEnrollmentSuccess({ ...enrollmentSuccess, show: false });
                    onTabChange?.('enrollments');
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <FaGraduationCap className="inline mr-2" />
                  View My Enrollments
                </button>
                <button
                  onClick={() => setEnrollmentSuccess({ ...enrollmentSuccess, show: false })}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <FaTimes className="inline mr-2" />
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    
  );
};

export default Courses;
