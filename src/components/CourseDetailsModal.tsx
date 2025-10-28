import React from 'react';
import { 
  FaBook, 
  FaTimes, 
  FaCheck, 
  FaClock, 
  FaUser, 
  FaGraduationCap,
  FaCalendarAlt,
  FaPlay,
  FaSpinner,
  FaFileAlt,
  FaEnvelope,
  FaPhone,
  FaLanguage,
  FaPauseCircle,
  FaSnowflake
} from 'react-icons/fa';
import Avatar from './Avatar';
import { getGradient } from '../utils/getGradient';
import { getCoaches } from '../api/admin';

interface CourseSubmission {
  id: number;
  coachName: string;
  coachEmail: string;
  coachPhoto: string;
  coachPhone?: string;
  coachLanguages?: string[];
  courseTitle: string;
  courseDescription: string;
  benefits?: string; // Add benefits field
  category: string;
  price: string; // Kept for backward compatibility
  creditCost?: string | number; // New credit cost field
  duration: number;
  courseDuration?: string;
  thumbnail: string;
  videoUrl?: string;
  location?: string; // Add location field
  locationType?: string; // Add locationType field
  timezone?: string; // Add timezone field
  ageRanges?: string[]; // Add ageRanges field
  program?: string; // Add program field (optional)
  weeklySchedule: Array<{
    day: string;
    isActive: boolean;
    timeSlots: Array<{
      id: string;
      startTime: string;
      endTime: string;
      sessions: number;
      bufferTime: number;
      sessionDuration: number;
    }>;
  }>;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  isFrozen?: boolean;
  isActive?: boolean;
}

interface CourseDetailsModalProps {
  selectedCourse: CourseSubmission | null;
  showModal: boolean;
  onClose: () => void;
  onApprove: (courseId: number) => void;
  onReject: () => void;
  isLoading: boolean;
  formatTimeDisplay: (time: string) => string;
  getStatusBadge: (status: string, opts?: { isFrozen?: boolean; isActive?: boolean }) => React.ReactNode;
  onViewCoachDetails?: (coachEmail: string) => void;
  onFreezePending?: (courseId: number) => void;
  onUnfreezePending?: (courseId: number) => void;
  onDeactivateApproved?: (courseId: number) => void;
  onActivateDeactivated?: (courseId: number) => void;
  isFreezing?: boolean;
  isUnfreezing?: boolean;
  isDeactivating?: boolean;
  isActivating?: boolean;
}

const CourseDetailsModal: React.FC<CourseDetailsModalProps> = ({
  selectedCourse,
  showModal,
  onClose,
  onApprove,
  onReject,
  isLoading,
  formatTimeDisplay,
  getStatusBadge,
  onViewCoachDetails,
  onFreezePending,
  onUnfreezePending,
  onDeactivateApproved,
  onActivateDeactivated,
  isFreezing,
  isUnfreezing,
  isDeactivating,
  isActivating
}) => {
  const [coachPhone, setCoachPhone] = React.useState<string | null>(null);
  const [coachPhoneLoading, setCoachPhoneLoading] = React.useState(false);

  if (!showModal || !selectedCourse) return null;

  // Compute display status for the banner/title based on extra flags
  const displayStatus = (() => {
    const s = (selectedCourse.status || '').toLowerCase();
    if ((s === 'approved' || s === 'active') && selectedCourse.isActive === false) return 'deactivated';
    if (s === 'pending' && selectedCourse.isFrozen) return 'frozen';
    return s;
  })();

  // Fetch coach phone number from coaches API
  React.useEffect(() => {
    const fetchCoachPhone = async () => {
      if (!selectedCourse?.coachEmail) return;
      
      setCoachPhoneLoading(true);
      try {
        const response = await getCoaches();
        console.log('Coaches API Response:', response);
        
        // Handle the API response structure
  let coaches: any[] = [];
        if (response.data && response.data.data && response.data.data.coaches) {
          coaches = response.data.data.coaches;
        }
        
        // Find the coach by email
        const coach = coaches.find((c: any) => c.email === selectedCourse.coachEmail);
        
        if (coach && coach.phone) {
          console.log('Found coach phone:', coach.phone);
          setCoachPhone(coach.phone);
        } else {
          console.log('Coach phone not found for email:', selectedCourse.coachEmail);
          setCoachPhone(null);
        }
      } catch (error) {
        console.error('Error fetching coach phone:', error);
        setCoachPhone(null);
      } finally {
        setCoachPhoneLoading(false);
      }
    };

    if (showModal && selectedCourse) {
      fetchCoachPhone();
    }
  }, [showModal, selectedCourse?.coachEmail]);

  // Prevent background scrolling when modal is open
  React.useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  // Handle ESC key to close modal
  React.useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showModal) {
        onClose();
      }
    };

    if (showModal) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showModal, onClose]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] flex flex-col overflow-hidden border border-gray-100">
        {/* Fixed Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-6 shadow-lg flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-lg">
                <FaBook className="text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Course Review</h2>
                <p className="text-blue-100 text-sm mt-1">Detailed course information and approval</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
              title="Close modal"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50/30">
          <div className="max-w-7xl mx-auto p-6 pb-32">
          
      {/* Status Banner */}
      <div className={`p-6 rounded-2xl border-2 bg-gradient-to-r mb-8 shadow-lg ${
        displayStatus === 'pending' ? 'border-yellow-300 from-yellow-50 to-amber-50' :
        displayStatus === 'approved' ? 'border-green-300 from-green-50 to-emerald-50' :
        displayStatus === 'deactivated' ? 'border-gray-300 from-gray-50 to-slate-50' :
        displayStatus === 'frozen' ? 'border-sky-300 from-sky-50 to-cyan-50' :
        'border-red-300 from-red-50 to-rose-50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${
          displayStatus === 'pending' ? 'bg-yellow-100' :
          displayStatus === 'approved' ? 'bg-green-100' :
          displayStatus === 'deactivated' ? 'bg-gray-100' :
          displayStatus === 'frozen' ? 'bg-sky-100' :
          'bg-red-100'
                }`}>
          {displayStatus === 'pending' && <FaClock className="text-yellow-600 text-xl" />}
          {displayStatus === 'approved' && <FaCheck className="text-green-600 text-xl" />}
          {displayStatus === 'rejected' && <FaTimes className="text-red-600 text-xl" />}
                  {displayStatus === 'deactivated' && <FaPauseCircle className="text-gray-600 text-xl" />}
                  {displayStatus === 'frozen' && <FaSnowflake className="text-sky-600 text-xl" />}
                </div>
                <div>
          <h3 className="font-bold text-gray-900 capitalize text-xl">{displayStatus} Course</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Submitted on {new Date(selectedCourse.submittedAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              {getStatusBadge(selectedCourse.status, { isFrozen: selectedCourse.isFrozen, isActive: selectedCourse.isActive })}
            </div>
          </div>

          {/* Main Content Grid - Better Space Utilization */}
          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            
            {/* Left Column - Course Visual & Pricing (1/4) */}
            <div className="lg:col-span-1 xl:col-span-1 space-y-6">
              {/* Course Thumbnail */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
                <div className="relative">
                  {selectedCourse.thumbnail ? (
                    <img
                      src={selectedCourse.thumbnail}
                      alt={selectedCourse.courseTitle}
                      className="w-full h-64 sm:h-80 object-cover"
                    />
                  ) : (
                    <div className={`w-full h-64 sm:h-80 flex items-center justify-center text-white text-xl font-bold ${getGradient(selectedCourse.courseTitle)}`}>
                      <div className="text-center">
                        <FaBook className="text-4xl sm:text-6xl mb-4 mx-auto" />
                        <p className="text-sm sm:text-lg px-4">{selectedCourse.courseTitle}</p>
                      </div>
                    </div>
                  )}
          {selectedCourse.videoUrl && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <button className="w-16 h-16 sm:w-20 sm:h-20 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg" aria-label="Play preview video" title="Play preview video">
                        <FaPlay className="text-gray-800 text-xl sm:text-2xl ml-1" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing Section - Below Thumbnail */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    {selectedCourse.creditCost ?? selectedCourse.price} Credits
                  </h3>
                  <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Credit Cost</p>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-100 text-center shadow-sm">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md">
                      <FaBook className="text-blue-600 text-lg" />
                    </div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-1">Category</p>
                    <p className="font-bold text-gray-900 text-sm capitalize">{selectedCourse.category.replace('-', ' ')}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-100 text-center shadow-sm">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md">
                      <FaClock className="text-green-600 text-lg" />
                    </div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-1">Duration</p>
                    <p className="font-bold text-gray-900 text-sm">{selectedCourse.courseDuration || `${selectedCourse.duration} weeks`}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column - Course & Coach Details (2/4) */}
            <div className="lg:col-span-2 xl:col-span-2 space-y-6">
              {/* Course Information */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                <h4 className="font-bold text-gray-900 mb-6 flex items-center text-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md mr-4">
                    <FaGraduationCap className="text-white text-xl" />
                  </div>
                  Course Information
                </h4>
                <div className="space-y-5">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{selectedCourse.courseTitle}</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">{selectedCourse.courseDescription}</p>
                    
                    {/* Benefits */}
                    {selectedCourse.benefits && (
                      <div className="mt-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100 shadow-sm">
                        <h5 className="font-bold text-gray-900 mb-2 flex items-center">
                          <FaCheck className="text-blue-600 mr-2" />
                          Benefits
                        </h5>
                        <p className="text-gray-700 leading-relaxed">{selectedCourse.benefits}</p>
                      </div>
                    )}
                    
                    {/* Additional Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                      {selectedCourse.location && (
                        <div className="p-4 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl border-2 border-teal-100 shadow-sm">
                          <div className="flex items-center mb-2">
                            <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
                              <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Location</p>
                          </div>
                          <p className="font-bold text-gray-900 text-sm">{selectedCourse.location}</p>
                          {selectedCourse.locationType && (
                            <p className="text-xs text-teal-600 mt-1 font-medium">{selectedCourse.locationType}</p>
                          )}
                        </div>
                      )}
                      {selectedCourse.timezone && (
                        <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-100 shadow-sm">
                          <div className="flex items-center mb-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                              <FaClock className="text-purple-600 text-sm" />
                            </div>
                            <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Timezone</p>
                          </div>
                          <p className="font-bold text-gray-900 text-sm">{selectedCourse.timezone}</p>
                        </div>
                      )}
                      {selectedCourse.ageRanges && selectedCourse.ageRanges.length > 0 && (
                        <div className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border-2 border-pink-100 shadow-sm">
                          <div className="flex items-center mb-2">
                            <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center mr-3">
                              <FaUser className="text-pink-600 text-sm" />
                            </div>
                            <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Age Ranges</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedCourse.ageRanges.map((range, idx) => (
                              <span key={idx} className="inline-block bg-white text-pink-700 px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
                                {range}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Coach Information */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                <h4 className="font-bold text-gray-900 mb-6 flex items-center text-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md mr-4">
                    <FaUser className="text-white text-xl" />
                  </div>
                  Coach Information
                </h4>
                <div className="space-y-5">
                  <div className="flex items-start space-x-4 p-5 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border-2 border-gray-100 shadow-sm">
                    <Avatar
                      name={selectedCourse.coachName}
                      imageUrl={selectedCourse.coachPhoto}
                      size={80}
                      className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0"
                    />
                    <div className="flex-1 space-y-3 min-w-0">
                      <div>
                        <h5 className="font-bold text-gray-900 text-lg sm:text-xl">{selectedCourse.coachName}</h5>
                        <div className="space-y-2 mt-3">
                          <p className="text-gray-600 flex items-center">
                            <FaEnvelope className="text-gray-400 mr-3 flex-shrink-0" />
                            <span className="break-all">{selectedCourse.coachEmail}</span>
                          </p>
                          {/* Phone number fetched from coaches API */}
                          <p className="text-gray-600 flex items-center">
                            <FaPhone className="text-gray-400 mr-3 flex-shrink-0" />
                            <span>
                              {coachPhoneLoading ? (
                                <span className="flex items-center">
                                  <FaSpinner className="animate-spin mr-2 text-sm" />
                                  Loading...
                                </span>
                              ) : (
                                coachPhone || 'Not provided'
                              )}
                            </span>
                          </p>
                          {selectedCourse.coachLanguages && selectedCourse.coachLanguages.length > 0 && (
                            <div className="flex items-start">
                              <FaLanguage className="text-gray-400 mr-3 mt-1 flex-shrink-0" />
                              <div className="flex flex-wrap gap-2">
                                {selectedCourse.coachLanguages.map((language, index) => (
                                  <span
                                    key={index}
                                    className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                                  >
                                    {language}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* View Coach Details Button */}
                  {onViewCoachDetails && (
                    <button
                      onClick={() => onViewCoachDetails(selectedCourse.coachEmail)}
                      className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-3"
                    >
                      <FaUser />
                      <span>View Coach Details</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Submission Details */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                <h4 className="font-bold text-gray-900 mb-6 flex items-center text-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md mr-4">
                    <FaFileAlt className="text-white text-xl" />
                  </div>
                  Submission Details
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border-2 border-gray-100 shadow-sm">
                    <span className="text-gray-600 font-semibold">Submitted Date:</span>
                    <span className="font-bold text-gray-900 text-right">
                      {new Date(selectedCourse.submittedAt).toLocaleDateString('en-US', {
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border-2 border-gray-100 shadow-sm">
                    <span className="text-gray-600 font-semibold">Current Status:</span>
                    <div>{getStatusBadge(selectedCourse.status, { isFrozen: selectedCourse.isFrozen, isActive: selectedCourse.isActive })}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Schedule (1/4) */}
            <div className="xl:col-span-1 space-y-6">
              {/* Weekly Schedule */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
                <h4 className="font-bold text-gray-900 mb-6 flex items-center text-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md mr-4">
                    <FaCalendarAlt className="text-white text-xl" />
                  </div>
                  Weekly Schedule
                </h4>
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {selectedCourse.weeklySchedule.map((day) => {
                    const [isExpanded, setIsExpanded] = React.useState(false);
                    const activeSlots = day.timeSlots.length;
                    
                    return (
                      <div key={day.day} className={`rounded-lg border-2 transition-all duration-200 overflow-hidden ${
                        day.isActive 
                          ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50' 
                          : 'border-gray-200 bg-gray-50'
                      }`}>
                        {/* Day Header - Always Visible */}
                        <div 
                          className={`p-3 cursor-pointer relative ${day.isActive && activeSlots > 0 ? 'hover:bg-green-100' : ''}`}
                          onClick={() => day.isActive && activeSlots > 0 && setIsExpanded(!isExpanded)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                              <span className={`font-semibold text-sm truncate ${day.isActive ? 'text-green-900' : 'text-gray-500'}`}>
                                {day.day}
                              </span>
                              {day.isActive && activeSlots > 0 && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium whitespace-nowrap">
                                  {activeSlots} session{activeSlots > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                              <div className={`flex items-center space-x-1 text-xs ${
                                day.isActive ? 'text-green-600' : 'text-gray-400'
                              }`}>
                                {day.isActive ? (
                                  <>
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="font-medium hidden sm:inline">Active</span>
                                  </>
                                ) : (
                                  <>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                    <span className="hidden sm:inline">Inactive</span>
                                  </>
                                )}
                              </div>
                              {day.isActive && activeSlots > 0 && (
                                <div className={`transform transition-transform duration-200 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Quick Preview - Show first 2 time slots when collapsed */}
                          {day.isActive && activeSlots > 0 && !isExpanded && (
                            <div className="mt-2 space-y-1">
                              {day.timeSlots.slice(0, 2).map((slot, index) => (
                                <div key={slot.id} className="flex items-center justify-between text-xs bg-white/70 px-2 py-1.5 rounded border border-green-100">
                                  <span className="font-medium text-gray-700 truncate flex-1 mr-2">
                                    {formatTimeDisplay(slot.startTime)} - {formatTimeDisplay(slot.endTime)}
                                  </span>
                                  <span className="text-gray-500 flex-shrink-0">{slot.sessionDuration}min</span>
                                </div>
                              ))}
                              {activeSlots > 2 && (
                                <div className="text-xs text-center text-gray-500 py-1">
                                  +{activeSlots - 2} more (click to expand)
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Expanded Details - Show when clicked */}
                        {day.isActive && activeSlots > 0 && isExpanded && (
                          <div className="px-3 pb-3 border-t border-green-200 bg-white/50">
                            <div className="mt-2 space-y-2">
                              <h6 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                                All Sessions ({activeSlots})
                              </h6>
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {day.timeSlots.map((slot, index) => (
                                  <div key={slot.id} className="bg-white p-2.5 rounded-lg border border-green-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-1.5">
                                      <span className="text-xs font-medium text-gray-600">Session {index + 1}</span>
                                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                        {slot.sessions} sessions
                                      </span>
                                    </div>
                                    <div className="space-y-1 text-xs">
                                      <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Time:</span>
                                        <span className="font-medium text-gray-900 text-right">
                                          {formatTimeDisplay(slot.startTime)} - {formatTimeDisplay(slot.endTime)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Duration:</span>
                                        <span className="font-medium text-gray-900">{slot.sessionDuration} min</span>
                                      </div>
                                      {slot.bufferTime > 0 && (
                                        <div className="flex justify-between items-center">
                                          <span className="text-gray-500">Buffer:</span>
                                          <span className="font-medium text-gray-700">{slot.bufferTime} min</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Rejection Reason Display (if rejected) */}
          {selectedCourse.status === 'rejected' && selectedCourse.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mt-6">
              <h4 className="font-semibold text-red-900 mb-3 flex items-center text-lg">
                <FaTimes className="text-red-600 mr-3" />
                Rejection Reason
              </h4>
              <p className="text-red-800">{selectedCourse.rejectionReason}</p>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Action Buttons at Bottom */}
      <div className="bg-gradient-to-r from-white to-gray-50 border-t-2 border-gray-200 p-6 flex-shrink-0 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap items-stretch sm:justify-center">
            {selectedCourse.status === 'pending' && !selectedCourse.isFrozen && (
              <>
                <button
                  onClick={() => onApprove(selectedCourse.id)}
                  disabled={isLoading}
                  className="flex-1 sm:flex-none min-w-[180px] bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 px-8 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 font-bold text-base shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center gap-3"
                >
                  {isLoading ? <FaSpinner className="animate-spin" /> : (<><FaCheck /> <span>Approve</span></>)}
                </button>
                <button
                  onClick={onReject}
                  disabled={isLoading}
                  className="flex-1 sm:flex-none min-w-[180px] bg-gradient-to-r from-rose-500 to-rose-600 text-white py-4 px-8 rounded-xl hover:from-rose-600 hover:to-rose-700 transition-all duration-300 disabled:opacity-50 font-bold text-base shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center gap-3"
                >
                  {isLoading ? <FaSpinner className="animate-spin" /> : (<><FaTimes /> <span>Reject</span></>)}
                </button>
                <button
                  onClick={() => onFreezePending && onFreezePending(selectedCourse.id)}
                  disabled={!!isFreezing}
                  className="flex-1 sm:flex-none min-w-[180px] bg-gradient-to-r from-sky-50 to-cyan-50 text-sky-800 border-2 border-sky-200 py-4 px-8 rounded-xl disabled:opacity-50 font-bold hover:from-sky-100 hover:to-cyan-100 transition-all shadow-lg"
                  title="Freeze pending course"
                >
                  {isFreezing ? 'Freezing…' : 'Freeze'}
                </button>
              </>
            )}

            {selectedCourse.status === 'pending' && selectedCourse.isFrozen && (
              <button
                onClick={() => onUnfreezePending && onUnfreezePending(selectedCourse.id)}
                disabled={!!isUnfreezing}
                className="flex-1 sm:flex-none min-w-[180px] bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-800 border-2 border-amber-200 py-4 px-8 rounded-xl disabled:opacity-50 font-bold hover:from-amber-100 hover:to-yellow-100 transition-all shadow-lg"
                title="Unfreeze pending course"
              >
                {isUnfreezing ? 'Unfreezing…' : 'Unfreeze'}
              </button>
            )}

            {selectedCourse.status === 'approved' && (selectedCourse.isActive !== false) && (
              <button
                onClick={() => onDeactivateApproved && onDeactivateApproved(selectedCourse.id)}
                disabled={!!isDeactivating}
                className="flex-1 sm:flex-none min-w-[180px] bg-gradient-to-r from-amber-600 to-amber-700 text-white py-4 px-8 rounded-xl disabled:opacity-50 font-bold hover:from-amber-700 hover:to-amber-800 transition-all shadow-xl"
                title="Deactivate course"
              >
                {isDeactivating ? 'Deactivating…' : 'Deactivate'}
              </button>
            )}

            {selectedCourse.status === 'approved' && (selectedCourse.isActive === false) && (
              <button
                onClick={() => onActivateDeactivated && onActivateDeactivated(selectedCourse.id)}
                disabled={!!isActivating}
                className="flex-1 sm:flex-none min-w-[180px] bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 px-8 rounded-xl disabled:opacity-50 font-bold hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-xl"
                title="Activate course"
              >
                {isActivating ? 'Activating…' : 'Activate'}
              </button>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default CourseDetailsModal;
