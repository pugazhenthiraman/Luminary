import React, { useEffect, useState } from 'react';
import { getGradient } from '../../utils/getGradient';
import { getCourses as getAdminCourses, approveCourse as approveAdminCourse, rejectCourse as rejectAdminCourse, getCoaches, deactivateCourse, activateCourseFromRejected, freezePendingCourse, unfreezePendingCourse, activateDeactivatedCourse } from '../../api/admin';
import Avatar from '../../components/Avatar';
import CourseDetailsModal from '../../components/CourseDetailsModal';
// Reuse the CourseSubmission shape from the modal via declaration merging
type ModalCourseSubmission = Parameters<React.ComponentProps<typeof CourseDetailsModal>['onApprove']>[0] extends number ? React.ComponentProps<typeof CourseDetailsModal>['selectedCourse'] extends infer T ? T : never : never;
import CoachDetailsModal from '../../components/CoachDetailsModal';
import { 
  FaEye, 
  FaCheck, 
  FaTimes, 
  FaClock, 
  FaUser, 
  FaBook, 
  FaCalendarAlt,
  FaVideo,
  FaStar,
  FaFilter,
  FaSearch,
  FaSort,
  FaDownload,
  FaPlay,
  FaSpinner,
  FaFileAlt,
  FaSnowflake,
  FaUndo,
  FaPlayCircle,
  FaPauseCircle,
  FaFire
} from 'react-icons/fa';
import { showErrorToast, showSuccessToast } from '../../components/Toast';

interface CourseSubmission {
  id: number;
  coachName: string;
  coachEmail: string;
  coachPhoto: string;
  coachPhone?: string;
  courseTitle: string;
  courseDescription: string;
  category: string;
  price: string; // align with CourseDetailsModal
  duration: number; // align with CourseDetailsModal
  lessons: number;
  thumbnail: string;
  videoUrl?: string;
  weeklySchedule: Array<{
    day: string;
    isActive: boolean;
    timeSlots: Array<{
      startTime: string;
      endTime: string;
    }>;
  }>;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  isFrozen?: boolean;
  isActive?: boolean;
}

const CourseApproval: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'frozen' | 'deactivated'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'coach' | 'category'>('date');
  const [isLoading, setIsLoading] = useState(false); // loading state
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [approveCtrl, setApproveCtrl] = useState<AbortController | null>(null);
  const [rejectCtrl, setRejectCtrl] = useState<AbortController | null>(null);
  const [deactivateCtrl, setDeactivateCtrl] = useState<AbortController | null>(null);
  const [activateCtrl, setActivateCtrl] = useState<AbortController | null>(null);
  const [freezeCtrl, setFreezeCtrl] = useState<AbortController | null>(null);
  const [unfreezeCtrl, setUnfreezeCtrl] = useState<AbortController | null>(null);
  const [approveTimedOut, setApproveTimedOut] = useState(false);
  const [rejectTimedOut, setRejectTimedOut] = useState(false);
  const [deactivateTimedOut, setDeactivateTimedOut] = useState(false);
  const [activateTimedOut, setActivateTimedOut] = useState(false);
  const [freezeTimedOut, setFreezeTimedOut] = useState(false);
  const [unfreezeTimedOut, setUnfreezeTimedOut] = useState(false);
  const [showAdvancedFilterModal, setShowAdvancedFilterModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('All Prices');
  const [selectedDay, setSelectedDay] = useState<string>('All Days');
  const [priceSort, setPriceSort] = useState<'none' | 'asc' | 'desc'>('none');
  const [adminNotes, setAdminNotes] = useState('');
  // Deactivate/Activate confirmations
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [courseToDeactivate, setCourseToDeactivate] = useState<CourseSubmission | null>(null);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [showActivateConfirm, setShowActivateConfirm] = useState(false);
  const [courseToActivate, setCourseToActivate] = useState<CourseSubmission | null>(null);
  const [activateNote, setActivateNote] = useState('');
  const [showFreezeConfirm, setShowFreezeConfirm] = useState(false);
  const [showUnfreezeConfirm, setShowUnfreezeConfirm] = useState(false);
  const [courseToFreeze, setCourseToFreeze] = useState<CourseSubmission | null>(null);
  const [courseToUnfreeze, setCourseToUnfreeze] = useState<CourseSubmission | null>(null);
  const [isFreezing, setIsFreezing] = useState(false);
  const [isUnfreezing, setIsUnfreezing] = useState(false);
  
  // Coach details modal states
  const [selectedCoachForDetails, setSelectedCoachForDetails] = useState<any>(null);
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [coachLoading, setCoachLoading] = useState(false);

  // Course approval confirmation states
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [courseToApprove, setCourseToApprove] = useState<number | null>(null);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [courseToReject, setCourseToReject] = useState<CourseSubmission | null>(null);


  // Debug: Log current modal state on every render (after state declarations)
  console.log("CourseApproval render - Modal states:", { 
    showCoachModal, 
    hasSelectedCoach: !!selectedCoachForDetails,
    selectedCoachName: selectedCoachForDetails?.firstName 
  });
  // Data from backend
  const [courses, setCourses] = useState<CourseSubmission[]>([]);

  const mapPriceRange = (label: string) => {
    switch (label) {
      case 'Free':
        return '0-0';
      case '$0 - $50':
        return '0-50';
      case '$50 - $100':
        return '50-100';
      case '$100 - $200':
        return '100-200';
      case '$200+':
        return '200-999999';
      default:
        return '';
    }
  };

  const computeSort = () => {
    if (priceSort !== 'none') {
      return { sortBy: 'price', sortOrder: priceSort } as const;
    }
    if (sortBy === 'coach') return { sortBy: 'coachName', sortOrder: 'desc' as const };
    if (sortBy === 'category') return { sortBy: 'category', sortOrder: 'desc' as const };
    return { sortBy: 'submittedAt', sortOrder: 'desc' as const };
  };

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        status: filterStatus,
        search: searchTerm,
        category: selectedCategory !== 'All Categories' ? selectedCategory : undefined,
        priceRange: mapPriceRange(selectedPriceRange) || undefined,
        page: 1,
        limit: 50,
        ...computeSort(),
      };
  const res = await getAdminCourses(params);
      
      // Debug: Log the API response to see the actual data structure
      console.log('API Response:', res.data);
      console.log('Courses data:', res.data?.data?.courses);
      
  const list: any[] = (res.data?.data?.courses || []).map((c: any) => {
        // Debug: Log each course data to see the phone field
        console.log('Course data:', c);
        console.log('Coach nested object:', c.coach);
        console.log('Coach phone from nested object:', c.coach?.phone);
        
        // Extract coach information from the nested coach object
        const coach = c.coach || {};
        
        const phoneNumber = coach.phone || c.coachPhone || c.phone;
        const coachName = coach.firstName && coach.lastName 
          ? `${coach.firstName} ${coach.lastName}`.trim()
          : c.coachName || 'Unknown Coach';
        const coachEmail = coach.email || c.coachEmail || 'No email provided';
        const coachPhoto = c.coachPhoto || coach.photo || coach.profileImage;
        
        console.log('Final extracted data:', { 
          phoneNumber, 
          coachName, 
          coachEmail,
          coachPhoto 
        });
        
        return {
          id: c.id,
          coachName: coachName,
          coachEmail: coachEmail,
          coachPhoto: coachPhoto,
          coachPhone: phoneNumber, // This should now be coach.phone
          courseTitle: c.courseTitle || c.title,
          courseDescription: c.courseDescription || c.description,
          category: c.category,
          price: String(c.price ?? c.creditCost ?? '0'),
          duration: Number(c.duration ?? 0),
          lessons: c.lessons || 0,
          thumbnail: c.thumbnail || c.image || c.coverImage,
          videoUrl: c.videoUrl || c.previewVideo,
          weeklySchedule: (c.weeklySchedule || []).map((d: any, idx: number) => ({
            day: d.day,
            isActive: d.isActive,
            timeSlots: (d.timeSlots || []).map((ts: any, jdx: number) => ({
              id: ts.id || `${d.day}-${ts.startTime}-${jdx}`,
              startTime: ts.startTime,
              endTime: ts.endTime,
              sessions: ts.sessions ?? 0,
              bufferTime: ts.bufferTime ?? 0,
              sessionDuration: ts.sessionDuration ?? 60,
            })),
          })),
          submittedAt: c.submittedAt || c.createdAt,
          status: (c.status || '').toLowerCase(),
          rejectionReason: c.rejectionReason,
          isFrozen: Boolean(c.isFrozen),
          isActive: typeof c.isActive === 'boolean' ? c.isActive : true,
        };
      });
      
      // Debug: Log the final mapped data
      console.log('Mapped courses:', list);
      
      setCourses(list);
    } catch (err) {
      console.error('Failed to load courses', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("useEffect triggered - loadCourses called. Dependencies:", {
      filterStatus, searchTerm, selectedCategory, selectedPriceRange, selectedDay, priceSort, sortBy
    });
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, searchTerm, selectedCategory, selectedPriceRange, selectedDay, priceSort, sortBy]);

  const filteredCourses = courses.filter(course => {
    const statusLower = (course.status || '').toLowerCase();
    const isFrozenCourse = statusLower === 'pending' && course.isFrozen;
    const isDeactivatedCourse = (statusLower === 'approved' || statusLower === 'active') && course.isActive === false;
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'pending' && statusLower === 'pending' && !course.isFrozen) ||
      (filterStatus === 'frozen' && isFrozenCourse) ||
      (filterStatus === 'approved' && (statusLower === 'approved' || statusLower === 'active') && course.isActive !== false) ||
      (filterStatus === 'deactivated' && isDeactivatedCourse) ||
      (filterStatus === 'rejected' && statusLower === 'rejected');
    const matchesSearch = course.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       course.coachName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       course.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       course.price.toString().includes(searchTerm);
    const matchesCategory = selectedCategory === 'All Categories' || course.category === selectedCategory;
    const matchesPrice = true; // To be implemented
    
    // Enhanced Day-based filter - handle different day name formats
    const matchesDay = selectedDay === 'All Days' || course.weeklySchedule.some(day => {
      // Normalize day names for comparison - fix the plural handling
      const normalizeDay = (dayName) => {
        let normalized = dayName.toLowerCase().trim();
        
        // Handle plural forms by removing 's' only at the end
        if (normalized.endsWith('s')) {
          normalized = normalized.slice(0, -1); // Remove last character if it's 's'
        }
        
        // Remove 'day' suffix if present (like 'monday' -> 'mon')
        // But keep the full day name for better matching
        return normalized;
      };
      
      const apiDay = normalizeDay(day.day);
      const selectedDayNormalized = normalizeDay(selectedDay);
      
      const dayMatches = apiDay === selectedDayNormalized;
      const isActive = day.isActive;
      const hasTimeSlots = day.timeSlots && day.timeSlots.length > 0;
      
      // Debug logging for day filter
      if (selectedDay !== 'All Days') {
        console.log(`Course: ${course.courseTitle}, API Day: "${day.day}" -> "${apiDay}", Selected: "${selectedDay}" -> "${selectedDayNormalized}", Matches: ${dayMatches}, Active: ${isActive}, HasSlots: ${hasTimeSlots}`);
      }
      
      return dayMatches && isActive && hasTimeSlots;
    });
    
    // Debug logging for overall filter result
    if (selectedDay !== 'All Days') {
      console.log(`Course: ${course.courseTitle}, MatchesDay: ${matchesDay}`);
    }
    
    return matchesStatus && matchesSearch && matchesCategory && matchesPrice && matchesDay;
  });

  let sortedCourses = [...filteredCourses];
  if (priceSort === 'asc') {
    sortedCourses.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (priceSort === 'desc') {
    sortedCourses.sort((a, b) => Number(b.price) - Number(a.price));
  }

  const confirmApprove = (courseId: number) => {
    setCourseToApprove(courseId);
    setShowApproveConfirm(true);
  };

  const confirmReject = (course: CourseSubmission) => {
    setCourseToReject(course);
    setShowRejectConfirm(true);
  };

  const getAxiosErrorMessage = (err: any, fallback = 'Operation failed') => {
    return err?.response?.data?.message || err?.message || fallback;
  };
  const isCanceledError = (error: any) => (
    error?.code === 'ERR_CANCELED' || error?.message === 'timeout' || error?.message === 'canceled' || error?.name === 'CanceledError'
  );

  const handleApprove = async (courseId: number) => {
    setIsApproving(true);
    const ctrl = new AbortController();
    setApproveCtrl(ctrl);
    const timer = setTimeout(() => {
      try { ctrl.abort('timeout'); } catch {}
    }, 12000);
    try {
      await approveAdminCourse(courseId, adminNotes || undefined, { signal: ctrl.signal, timeout: 15000 });
      setShowModal(false);
      setShowApproveConfirm(false);
      setCourseToApprove(null);
      await loadCourses();
      showSuccessToast('Course approved');
      setApproveTimedOut(false);
    } catch (error: any) {
      if (isCanceledError(error)) {
        setApproveTimedOut(true);
        showErrorToast('Approval timed out or was canceled. Try again.');
      } else {
        showErrorToast(getAxiosErrorMessage(error, 'Failed to approve course'));
      }
    } finally {
      clearTimeout(timer);
      setIsApproving(false);
      setApproveCtrl(null);
    }
  };

  const handleReject = async (courseId: number, reason: string) => {
    setIsRejecting(true);
    const ctrl = new AbortController();
    setRejectCtrl(ctrl);
    const timer = setTimeout(() => { try { ctrl.abort('timeout'); } catch {} }, 12000);
    try {
      await rejectAdminCourse(courseId, reason, adminNotes || undefined, { signal: ctrl.signal, timeout: 15000 });
      setShowModal(false);
      setShowRejectModal(false);
      setShowRejectConfirm(false);
      setCourseToReject(null);
      setRejectReason('');
      await loadCourses();
      showSuccessToast('Course rejected');
      setRejectTimedOut(false);
    } catch (error: any) {
      if (isCanceledError(error)) {
        setRejectTimedOut(true);
        showErrorToast('Rejection timed out or was canceled. Try again.');
      } else {
        showErrorToast(getAxiosErrorMessage(error, 'Failed to reject course'));
      }
    } finally {
      clearTimeout(timer);
      setIsRejecting(false);
      setRejectCtrl(null);
    }
  };

  const handleDeactivate = async (courseId: number, reason?: string) => {
    setIsDeactivating(true);
    const ctrl = new AbortController();
    setDeactivateCtrl(ctrl);
    const timer = setTimeout(() => { try { ctrl.abort('timeout'); } catch {} }, 12000);
    try {
      await deactivateCourse(courseId, reason, { signal: ctrl.signal, timeout: 15000 });
      showSuccessToast('Course deactivated');
  // Reflect in open modal immediately
  setSelectedCourse((prev: any) => (prev && prev.id === courseId) ? { ...prev, isActive: false } : prev);
      await loadCourses();
      setShowDeactivateConfirm(false);
      setCourseToDeactivate(null);
      setDeactivateReason('');
      setDeactivateTimedOut(false);
    } catch (error: any) {
      if (isCanceledError(error)) {
        setDeactivateTimedOut(true);
        showErrorToast('Deactivation timed out or was canceled. Try again.');
      } else {
        showErrorToast(getAxiosErrorMessage(error, 'Failed to deactivate course'));
      }
    } finally {
      clearTimeout(timer);
      setIsDeactivating(false);
      setDeactivateCtrl(null);
    }
  };

  const handleActivateDeactivated = async (courseId: number, note?: string) => {
    setIsActivating(true);
    const ctrl = new AbortController();
    setActivateCtrl(ctrl);
    const timer = setTimeout(() => { try { ctrl.abort('timeout'); } catch {} }, 12000);
    try {
      await activateDeactivatedCourse(courseId, note, { signal: ctrl.signal, timeout: 15000 });
      showSuccessToast('Course activated');
  // Reflect in open modal immediately
  setSelectedCourse((prev: any) => (prev && prev.id === courseId) ? { ...prev, isActive: true } : prev);
      await loadCourses();
      setShowActivateConfirm(false);
      setCourseToActivate(null);
      setActivateNote('');
      setActivateTimedOut(false);
    } catch (error: any) {
      if (isCanceledError(error)) {
        setActivateTimedOut(true);
        showErrorToast('Activation timed out or was canceled. Try again.');
      } else {
        showErrorToast(getAxiosErrorMessage(error, 'Failed to activate course'));
      }
    } finally {
      clearTimeout(timer);
      setIsActivating(false);
      setActivateCtrl(null);
    }
  };

  const handleFreeze = async (courseId: number) => {
    setIsFreezing(true);
    const ctrl = new AbortController();
    setFreezeCtrl(ctrl);
    const timer = setTimeout(() => { try { ctrl.abort('timeout'); } catch {} }, 12000);
    try {
      await freezePendingCourse(courseId, { signal: ctrl.signal, timeout: 15000 });
      showSuccessToast('Course frozen (pending edits disabled)');
  // Reflect in open modal immediately
  setSelectedCourse((prev: any) => (prev && prev.id === courseId) ? { ...prev, isFrozen: true } : prev);
      await loadCourses();
      setShowFreezeConfirm(false);
      setCourseToFreeze(null);
      setFreezeTimedOut(false);
    } catch (e: any) {
      if (isCanceledError(e)) {
        setFreezeTimedOut(true);
        showErrorToast('Freeze timed out. Try again.');
      } else {
        showErrorToast('Failed to freeze course');
      }
    } finally {
      clearTimeout(timer);
      setIsFreezing(false);
      setFreezeCtrl(null);
    }
  };

  const handleUnfreeze = async (courseId: number) => {
    setIsUnfreezing(true);
    const ctrl = new AbortController();
    setUnfreezeCtrl(ctrl);
    const timer = setTimeout(() => { try { ctrl.abort('timeout'); } catch {} }, 12000);
    try {
      await unfreezePendingCourse(courseId, { signal: ctrl.signal, timeout: 15000 });
      showSuccessToast('Course unfrozen (edits allowed)');
  // Reflect in open modal immediately
  setSelectedCourse((prev: any) => (prev && prev.id === courseId) ? { ...prev, isFrozen: false } : prev);
      await loadCourses();
      setShowUnfreezeConfirm(false);
      setCourseToUnfreeze(null);
      setUnfreezeTimedOut(false);
    } catch (e: any) {
      if (isCanceledError(e)) {
        setUnfreezeTimedOut(true);
        showErrorToast('Unfreeze timed out. Try again.');
      } else {
        showErrorToast('Failed to unfreeze course');
      }
    } finally {
      clearTimeout(timer);
      setIsUnfreezing(false);
      setUnfreezeCtrl(null);
    }
  };

  const handleRejectClick = (course: CourseSubmission) => {
    setSelectedCourse(course);
    setShowRejectModal(true);
  };

  // Handle viewing coach details
  // Transform API coach data to match CoachData interface
  const transformCoachData = (apiCoach: any): any => {
    return {
      id: apiCoach.id?.toString() || '',
      firstName: apiCoach.firstName || '',
      lastName: apiCoach.lastName || '',
      email: apiCoach.email || '',
      phone: apiCoach.phone || '',
      experience: apiCoach.experienceDescription || '',
      duration: '', // Not available in API response
      address: apiCoach.address || '',
      languages: apiCoach.languages || [],
      status: apiCoach.status || '',
      registrationDate: apiCoach.registrationDate || '',
      adminNotes: apiCoach.adminNotes || '',
      driverLicense: apiCoach.licenseFileUrl || '',
      courses: [], // Not available in this context
      // Additional fields from API
      domain: apiCoach.domain || '',
      rating: apiCoach.rating || '0',
      totalStudents: apiCoach.totalStudents || 0,
      totalReviews: apiCoach.totalReviews || 0,
      isVerified: apiCoach.isVerified || false,
      approvedAt: apiCoach.approvedAt || null,
      approvedBy: apiCoach.approvedBy || null,
      lastLogin: apiCoach.lastLogin || null,
      introVideoUrl: apiCoach.introVideoUrl || null,
      resumeFileUrl: apiCoach.resumeFileUrl || null
    };
  };

  const handleViewCoachDetails = async (coachEmail: string) => {
    console.log('Fetching coach details for:', coachEmail);
    setCoachLoading(true);
    
    try {
      // Get all coaches and find the one with matching email
      const response = await getCoaches();
      console.log('API Response:', response);
      
      // Handle the actual API response structure
  let coaches: any[] = [];
      
      if (response.data && response.data.data) {
        // The API returns: {success: true, message: '...', data: {coaches: [...], pagination: {...}}}
        if (response.data.data.coaches && Array.isArray(response.data.data.coaches)) {
          coaches = response.data.data.coaches;
        } else if (Array.isArray(response.data.data)) {
          coaches = response.data.data;
        }
      } else if (response.data && response.data.coaches && Array.isArray(response.data.coaches)) {
        coaches = response.data.coaches;
      } else if (response.data && Array.isArray(response.data)) {
        coaches = response.data;
  }
      
      console.log('Coaches array:', coaches);
      
      if (Array.isArray(coaches) && coaches.length > 0) {
        const coach = coaches.find((c: any) => c.email === coachEmail);
        
        if (coach) {
          console.log('Found coach:', coach);
          const transformedCoach = transformCoachData(coach);
          console.log('Transformed coach:', transformedCoach);
          
          // Use React's functional state update to ensure state is set correctly
          setSelectedCoachForDetails(() => {
            console.log('Setting selectedCoachForDetails with functional update');
            return transformedCoach;
          });
          
          setShowCoachModal(() => {
            console.log('Setting showCoachModal to TRUE with functional update');
            return true;
          });
          
          console.log('Coach modal state set to true');
          
          // Force a re-render check
          setTimeout(() => {
            console.log('After timeout - showCoachModal:', showCoachModal);
            console.log('After timeout - selectedCoachForDetails:', selectedCoachForDetails?.firstName);
          }, 100);
        } else {
          console.error('Coach not found with email:', coachEmail);
          console.log('Available coaches:', coaches.map((c: any) => c.email));
        }
      } else {
        console.error('No coaches found or coaches data is not an array:', typeof coaches, coaches);
      }
    } catch (error) {
      console.error('Error fetching coach details:', error);
    } finally {
      setCoachLoading(false);
    }
  };

  const formatTimeDisplay = (time: string) => {
    const [hour] = time.split(':');
    const hourNum = parseInt(hour);
    return hourNum === 0 ? '12:00 AM' : hourNum < 12 ? `${hourNum}:00 AM` : hourNum === 12 ? '12:00 PM' : `${hourNum - 12}:00 PM`;
  };

  const getStatusBadge = (status: string, opts?: { isFrozen?: boolean; isActive?: boolean }) => {
    const s = (status || '').toLowerCase();
    if ((s === 'approved' || s === 'active') && opts?.isActive === false) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">Deactivated</span>;
    }
    if (s === 'pending' && opts?.isFrozen) {
      return (
        <div className="flex items-center gap-1">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800">Frozen</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>
        </div>
      );
    }
    switch (s) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
      case 'approved':
      case 'active':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
      default:
        return null;
    }
  };



  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Course Approval</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Review and manage course submissions from coaches</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <div className="bg-blue-50 text-blue-700 px-3 sm:px-4 py-2 rounded-lg">
            <span className="text-xs sm:text-sm font-medium">
              {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
              {selectedDay !== 'All Days' && (
                <span className="ml-1 text-blue-600">
                  on {selectedDay}
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="space-y-4">
          {/* Status Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'frozen', 'approved', 'deactivated', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors duration-150 ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Search and Filters Row */}
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
            {/* Search - Takes most space */}
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search courses, coaches, price..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            
            {/* Right side filters */}
            <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
              {/* Day Filter */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white w-full sm:w-40"
                  aria-label="Filter by day"
                >
                  <option value="All Days">All Days</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
                
                {/* Clear Day Filter Button */}
                {selectedDay !== 'All Days' && (
                  <button
                    onClick={() => setSelectedDay('All Days')}
                    className="px-2 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 border border-gray-300 hover:border-red-300 flex-shrink-0"
                    title="Clear day filter"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                )}
              </div>
              
              {/* Price Sort Dropdown */}
              <select
                value={priceSort}
                onChange={e => setPriceSort(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white w-full sm:w-40"
                aria-label="Sort by price"
              >
                <option value="none">Sort by Price</option>
                <option value="asc">Price: Low to High</option>
                <option value="desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters Modal */}
      {showAdvancedFilterModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] flex flex-col">
            {/* Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaFilter className="text-blue-600 text-sm sm:text-lg" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Advanced Filters</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Filter courses by multiple criteria</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAdvancedFilterModal(false)}
                  className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 flex items-center justify-center"
                  title="Close filter modal"
                  aria-label="Close filter modal"
                >
                  <FaTimes className="text-sm sm:text-lg" />
                </button>
              </div>
            </div>
            {/* Filter Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {['All Categories', 'Technology & STEM', 'Creative Arts', 'Academic Enrichment', 'Life Skills', 'Sports & Physical', 'Languages & Communication'].map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-2 text-sm border rounded-lg transition-all duration-200 text-left ${
                        selectedCategory === category
                          ? 'border-blue-500 bg-blue-100 text-blue-700'
                          : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">Price Range</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {['All Prices', 'Free', '$0 - $50', '$50 - $100', '$100 - $200', '$200+'].map((price) => (
                    <button
                      key={price}
                      onClick={() => setSelectedPriceRange(price)}
                      className={`px-3 py-2 text-sm border rounded-lg transition-all duration-200 text-left ${
                        selectedPriceRange === price
                          ? 'border-blue-500 bg-blue-100 text-blue-700'
                          : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                      }`}
                    >
                      {price}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Footer */}
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0 flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowAdvancedFilterModal(false)}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium text-xs sm:text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setSelectedCategory('All Categories');
                  setSelectedPriceRange('All Prices');
                }}
                className="px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200 font-medium text-xs sm:text-sm"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowAdvancedFilterModal(false)}
                className="px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 font-medium text-xs sm:text-sm"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {sortedCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
            {/* Course Thumbnail */}
            <div className="relative">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.courseTitle}
                  className="w-full h-40 sm:h-48 object-cover"
                />
              ) : (
                <div className={`w-full h-40 sm:h-48 rounded-xl flex items-center justify-center text-white text-lg sm:text-xl font-bold select-none ${getGradient(course.courseTitle)}`}>
                  {course.courseTitle}
                </div>
              )}
              <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                {getStatusBadge(course.status, { isFrozen: course.isFrozen, isActive: course.isActive })}
              </div>
              {course.isFrozen && (
                <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-sky-100 text-sky-700 border border-sky-200" title="This course is frozen; pending edits are locked">
                    <FaSnowflake className="text-[10px] sm:text-xs" />
                    Frozen
                  </span>
                </div>
              )}
              <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
                <span className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                  ${course.price}
                </span>
              </div>
              {course.videoUrl && (
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                  <button 
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center"
                    title="Play course video"
                    aria-label="Play course video"
                  >
                    <FaPlay className="text-gray-800 text-sm sm:text-lg" />
                  </button>
                </div>
              )}
            </div>

            {/* Course Content */}
            <div className="p-4 sm:p-6">
              {/* Coach Info */}
              <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                <Avatar
                  name={course.coachName}
                  imageUrl={course.coachPhoto}
                  size={40}
                  className="w-8 h-8 sm:w-10 sm:h-10"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{course.coachName}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">{course.coachEmail}</p>
                </div>
              </div>

              {/* Course Details */}
              <div className="space-y-3">
                <h4 className="text-base sm:text-lg font-semibold text-gray-800 line-clamp-2">{course.courseTitle}</h4>
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-3">{course.courseDescription}</p>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium self-start">
                    {course.category}
                  </span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium self-start">
                    {course.duration}
                  </span>
                </div>

                {/* Schedule Preview */}
                {course.weeklySchedule.some(day => day.isActive) && (
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <FaCalendarAlt className="text-gray-400 text-xs sm:text-sm" />
                      <span className="text-xs font-medium text-gray-700">
                        Schedule
                        {selectedDay !== 'All Days' && (
                          <span className="ml-1 text-blue-600 font-semibold">
                            ({selectedDay})
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {/* Helper function to normalize day names for comparison */}
                      {(() => {
                        const normalizeDay = (dayName) => {
                          let normalized = dayName.toLowerCase().trim();
                          
                          // Handle plural forms by removing 's' only at the end
                          if (normalized.endsWith('s')) {
                            normalized = normalized.slice(0, -1); // Remove last character if it's 's'
                          }
                          
                          return normalized;
                        };
                        
                        const selectedDayNormalized = selectedDay !== 'All Days' ? normalizeDay(selectedDay) : null;
                        
                        return (
                          <>
                            {/* Show selected day first if it exists and is active */}
                            {selectedDay !== 'All Days' && course.weeklySchedule
                              .filter(day => normalizeDay(day.day) === selectedDayNormalized && day.isActive)
                              .map((day, index) => (
                                <div key={day.day} className="flex items-center justify-between text-xs bg-blue-50 border border-blue-200 rounded px-2 py-1">
                                  <span className="font-semibold text-blue-800 truncate">{day.day}</span>
                                  <div className="flex items-center space-x-1 ml-2">
                                    {day.timeSlots.slice(0, 1).map((slot, slotIndex) => (
                                      <span key={slotIndex} className="text-xs text-blue-700 font-medium">
                                        {formatTimeDisplay(slot.startTime)}
                                      </span>
                                    ))}
                                    {day.timeSlots.length > 1 && (
                                      <span className="text-xs text-blue-600">
                                        +{day.timeSlots.length - 1}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            
                            {/* Show other active days */}
                            {course.weeklySchedule
                              .filter(day => day.isActive && (selectedDay === 'All Days' || normalizeDay(day.day) !== selectedDayNormalized))
                              .slice(0, selectedDay === 'All Days' ? 2 : 1)
                              .map((day, index) => (
                                <div key={day.day} className="flex items-center justify-between text-xs text-gray-600">
                                  <span className="font-medium truncate">{day.day}</span>
                                  <div className="flex items-center space-x-1 ml-2">
                                    {day.timeSlots.slice(0, 1).map((slot, slotIndex) => (
                                      <span key={slotIndex} className="text-xs">
                                        {formatTimeDisplay(slot.startTime)}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <FaCalendarAlt className="text-xs" />
                    <span>{new Date(course.submittedAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedCourse(course); setShowModal(true); }}
                      className="text-blue-600 hover:text-blue-800 p-1.5 sm:p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200 transition-transform hover:scale-110"
                      title="View details"
                    >
                      <FaEye className="text-sm" />
                    </button>
                    
                    {course.status === 'pending' && !course.isFrozen && (
                      <>
                        <button
                          onClick={() => confirmApprove(course.id)}
                          className="text-green-600 hover:text-green-800 p-1.5 sm:p-2 rounded-lg hover:bg-green-50 transition-colors duration-200"
                          title="Approve Course"
                        >
                          <FaCheck className="text-sm" />
                        </button>
                        <button
                          onClick={() => confirmReject(course)}
                          className="text-red-600 hover:text-red-800 p-1.5 sm:p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                          title="Reject Course"
                        >
                          <FaTimes className="text-sm" />
                        </button>
                      </>
                    )}
                    {course.status === 'pending' && course.isFrozen && (
                      <span className="text-sky-700 text-xs font-semibold" title="Frozen by admin. View only."><FaSnowflake className="inline mr-1" /> Frozen</span>
                    )}
                    {course.status === 'approved' && (
                      <>
            {course.isActive === false ? (
                          <button
              onClick={() => { setCourseToActivate(course); setShowActivateConfirm(true); }}
              className="text-emerald-600 hover:text-emerald-800 p-1.5 sm:p-2 rounded-lg hover:bg-emerald-50 transition-colors duration-200 transition-transform hover:scale-110"
              title="Make course visible (activate)"
                          >
              <FaPlayCircle className="text-sm" />
                          </button>
                        ) : (
                          <button
              onClick={() => { setCourseToDeactivate(course); setShowDeactivateConfirm(true); }}
              className="text-amber-600 hover:text-amber-800 p-1.5 sm:p-2 rounded-lg hover:bg-amber-50 transition-colors duration-200 transition-transform hover:scale-110"
              title="Hide from parents (deactivate)"
                          >
              <FaPauseCircle className="text-sm" />
                          </button>
                        )}
                      </>
                    )}
                    {course.status === 'rejected' && (
                      <>
                        <button
                          onClick={async () => {
                            const ctrl = new AbortController();
                            const timer = setTimeout(() => { try { ctrl.abort('timeout'); } catch {} }, 12000);
                            try {
                              await activateCourseFromRejected(course.id, { signal: ctrl.signal, timeout: 15000 });
                              showSuccessToast('Course moved to Pending');
                              await loadCourses();
                            } catch (e: any) {
                              if (isCanceledError(e)) showErrorToast('Action timed out. Try again.');
                              else showErrorToast('Failed to activate course');
                            } finally {
                              clearTimeout(timer);
                            }
                          }}
                          className="text-yellow-600 hover:text-yellow-800 p-1.5 sm:p-2 rounded-lg hover:bg-yellow-50 transition-colors duration-200"
                          title="Move from Rejected to Pending"
                        >
                          <FaUndo className="text-sm" />
                        </button>
                      </>
                    )}
          {course.status === 'pending' && (
                      <>
            {!course.isFrozen ? (
                          <button
              onClick={() => { setCourseToFreeze(course); setShowFreezeConfirm(true); }}
              className="text-sky-600 hover:text-sky-800 p-1.5 sm:p-2 rounded-lg hover:bg-sky-50 transition-colors duration-200 transition-transform hover:scale-110"
                            title="Freeze Pending Course"
                          >
              <FaSnowflake className="text-sm" />
                          </button>
                        ) : (
                          <button
              onClick={() => { setCourseToUnfreeze(course); setShowUnfreezeConfirm(true); }}
              className="text-amber-600 hover:text-amber-800 p-1.5 sm:p-2 rounded-lg hover:bg-amber-50 transition-colors duration-200 transition-transform hover:scale-110"
                            title="Unfreeze Pending Course"
                          >
              <FaFire className="text-sm" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {sortedCourses.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaBook className="text-gray-400 text-2xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Modern Course Details Modal */}
      {showModal && selectedCourse ? (
        <CourseDetailsModal
          selectedCourse={selectedCourse}
          showModal={showModal}
          onClose={() => setShowModal(false)}
          onApprove={(courseId) => confirmApprove(courseId)}
          onReject={() => confirmReject(selectedCourse)}
          isLoading={isApproving || isRejecting}
          formatTimeDisplay={formatTimeDisplay}
          getStatusBadge={getStatusBadge}
          onViewCoachDetails={(coachEmail) => handleViewCoachDetails(coachEmail)}
          onFreezePending={(id) => { setCourseToFreeze(selectedCourse); setShowFreezeConfirm(true); }}
          onUnfreezePending={(id) => { setCourseToUnfreeze(selectedCourse); setShowUnfreezeConfirm(true); }}
          onDeactivateApproved={(id) => { setCourseToDeactivate(selectedCourse); setShowDeactivateConfirm(true); }}
          onActivateDeactivated={(id) => { setCourseToActivate(selectedCourse); setShowActivateConfirm(true); }}
          isFreezing={isFreezing}
          isUnfreezing={isUnfreezing}
          isDeactivating={isDeactivating}
          isActivating={isActivating}
        />
      ) : null}
      {/* Reject Reason Modal */}
      {showRejectModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-4 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTimes className="text-red-600 text-xl sm:text-2xl" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Reject Course</h3>
              <p className="text-sm text-gray-600">
                Please provide a reason for rejecting "{selectedCourse.courseTitle}"
              </p>
            </div>

            <div className="mb-4 sm:mb-6">
              <label htmlFor="rejectReason" className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason
              </label>
              <textarea
                id="rejectReason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedCourse(null);
                }}
                className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => selectedCourse && handleReject(selectedCourse.id, rejectReason)}
                disabled={!rejectReason.trim()}
                className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Coach Details Modal - Using Existing Beautiful Component */}
      {showCoachModal && selectedCoachForDetails && (
        <CoachDetailsModal
          coach={selectedCoachForDetails as any}
          show={showCoachModal}
          onClose={() => {
            console.log("Closing coach modal");
            setShowCoachModal(false);
            setSelectedCoachForDetails(null);
          }}
          isLoading={coachLoading}
          showActions={false}
        />
      )}

      {/* Approve Confirmation Modal */}
      {showApproveConfirm && courseToApprove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => { setShowApproveConfirm(false); setCourseToApprove(null); }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheck className="text-green-600 text-xl sm:text-2xl" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Approve Course</h3>
              <p className="text-sm text-gray-600 mb-4">Are you sure you want to approve this course?</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <div className="text-xs text-gray-500 mb-2 sm:mb-0">
                {approveTimedOut ? 'Request timed out. You can try again.' : 'This may take up to 10–15 seconds.'}
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => { if (approveCtrl) approveCtrl.abort('canceled'); setShowApproveConfirm(false); setCourseToApprove(null); }} 
                  className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => courseToApprove && handleApprove(courseToApprove)} 
                  disabled={isApproving} 
                  className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isApproving ? <FaSpinner className="animate-spin" /> : (approveTimedOut ? 'Try again' : 'Confirm Approve')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectConfirm && courseToReject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => { setShowRejectConfirm(false); setCourseToReject(null); }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTimes className="text-red-600 text-xl sm:text-2xl" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Reject Course</h3>
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for rejecting "{courseToReject.courseTitle}"
              </p>
            </div>

            <div className="mb-4 sm:mb-6">
              <label htmlFor="rejectReasonConfirm" className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason
              </label>
              <textarea
                id="rejectReasonConfirm"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <div className="text-xs text-gray-500 mb-2 sm:mb-0">
                {rejectTimedOut ? 'Request timed out. You can try again.' : 'This may take up to 10–15 seconds.'}
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => { if (rejectCtrl) rejectCtrl.abort('canceled'); setShowRejectConfirm(false); setCourseToReject(null); setRejectReason(''); }} 
                  className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => courseToReject && handleReject(courseToReject.id, rejectReason)} 
                  disabled={!rejectReason.trim() || isRejecting} 
                  className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRejecting ? <FaSpinner className="animate-spin" /> : (rejectTimedOut ? 'Try again' : 'Confirm Rejection')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      {showDeactivateConfirm && courseToDeactivate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => { setShowDeactivateConfirm(false); setCourseToDeactivate(null); setDeactivateReason(''); }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaPauseCircle className="text-red-600 text-xl sm:text-2xl" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Deactivate Course</h3>
              <p className="text-sm text-gray-600 mb-4">
                Deactivate "{courseToDeactivate.courseTitle}"? Parents will not see this course. The coach will be notified.
              </p>
            </div>

            <div className="mb-4 sm:mb-6">
              <label htmlFor="deactivateReason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason (shared with coach)
              </label>
              <textarea
                id="deactivateReason"
                value={deactivateReason}
                onChange={(e) => setDeactivateReason(e.target.value)}
                placeholder="Briefly explain why this course is deactivated..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <div className="text-xs text-gray-500 mb-2 sm:mb-0">
                {deactivateTimedOut ? 'Request timed out. You can try again.' : 'This may take up to 10–15 seconds.'}
              </div>
              <button 
                onClick={() => { if (deactivateCtrl) deactivateCtrl.abort('canceled'); setShowDeactivateConfirm(false); setCourseToDeactivate(null); setDeactivateReason(''); }} 
                className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium text-sm order-2 sm:order-1"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  if (!courseToDeactivate) return;
                  await handleDeactivate(courseToDeactivate.id, deactivateReason || undefined);
                }} 
                disabled={isDeactivating}
                className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
              >
                {isDeactivating ? <FaSpinner className="animate-spin" /> : (deactivateTimedOut ? 'Try again' : 'Confirm Deactivate')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activate Deactivated Confirmation Modal */}
      {showActivateConfirm && courseToActivate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => { setShowActivateConfirm(false); setCourseToActivate(null); setActivateNote(''); }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUndo className="text-yellow-600 text-xl sm:text-2xl" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Activate Course</h3>
              <p className="text-sm text-gray-600 mb-4">
                Activate "{courseToActivate.courseTitle}"? Parents will be able to see it again.
              </p>
            </div>

            <div className="mb-4 sm:mb-6">
              <label htmlFor="activateNote" className="block text-sm font-medium text-gray-700 mb-2">
                Optional note to coach
              </label>
              <textarea
                id="activateNote"
                value={activateNote}
                onChange={(e) => setActivateNote(e.target.value)}
                placeholder="Add a note (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <div className="text-xs text-gray-500 mb-2 sm:mb-0">
                {activateTimedOut ? 'Request timed out. You can try again.' : 'This may take up to 10–15 seconds.'}
              </div>
              <button 
                onClick={() => { if (activateCtrl) activateCtrl.abort('canceled'); setShowActivateConfirm(false); setCourseToActivate(null); setActivateNote(''); }} 
                className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium text-sm order-2 sm:order-1"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  if (!courseToActivate) return;
                  await handleActivateDeactivated(courseToActivate.id, activateNote || undefined);
                }} 
                disabled={isActivating}
                className="w-full sm:w-auto px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
              >
                {isActivating ? <FaSpinner className="animate-spin" /> : (activateTimedOut ? 'Try again' : 'Confirm Activate')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Freeze Pending Confirmation Modal */}
      {showFreezeConfirm && courseToFreeze && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => { setShowFreezeConfirm(false); setCourseToFreeze(null); }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaSnowflake className="text-sky-600 text-xl sm:text-2xl" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Freeze Pending Course</h3>
              <p className="text-sm text-gray-600 mb-4">Freeze "{courseToFreeze.courseTitle}"? Coach can’t edit while frozen.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <div className="text-xs text-gray-500 mb-2 sm:mb-0">
                {freezeTimedOut ? 'Request timed out. You can try again.' : 'This may take up to 10–15 seconds.'}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { if (freezeCtrl) freezeCtrl.abort('canceled'); setShowFreezeConfirm(false); setCourseToFreeze(null); }}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleFreeze(courseToFreeze.id)}
                  disabled={isFreezing}
                  className="w-full sm:w-auto px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isFreezing ? <FaSpinner className="animate-spin" /> : (freezeTimedOut ? 'Try again' : 'Confirm Freeze')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unfreeze Pending Confirmation Modal */}
      {showUnfreezeConfirm && courseToUnfreeze && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => { setShowUnfreezeConfirm(false); setCourseToUnfreeze(null); }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaFire className="text-amber-600 text-xl sm:text-2xl" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Unfreeze Course</h3>
              <p className="text-sm text-gray-600 mb-4">Unfreeze "{courseToUnfreeze.courseTitle}"? Coach can edit again.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <div className="text-xs text-gray-500 mb-2 sm:mb-0">
                {unfreezeTimedOut ? 'Request timed out. You can try again.' : 'This may take up to 10–15 seconds.'}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { if (unfreezeCtrl) unfreezeCtrl.abort('canceled'); setShowUnfreezeConfirm(false); setCourseToUnfreeze(null); }}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUnfreeze(courseToUnfreeze.id)}
                  disabled={isUnfreezing}
                  className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUnfreezing ? <FaSpinner className="animate-spin" /> : (unfreezeTimedOut ? 'Try again' : 'Confirm Unfreeze')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CourseApproval;