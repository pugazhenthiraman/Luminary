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
  FaLanguage
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
  category: string;
  price: string;
  duration: number;
  thumbnail: string;
  videoUrl?: string;
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
}

interface CourseDetailsModalProps {
  selectedCourse: CourseSubmission | null;
  showModal: boolean;
  onClose: () => void;
  onApprove: (courseId: number) => void;
  onReject: () => void;
  isLoading: boolean;
  formatTimeDisplay: (time: string) => string;
  getStatusBadge: (status: string) => JSX.Element;
  onViewCoachDetails?: (coachEmail: string) => void;
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
  onViewCoachDetails
}) => {
  const [coachPhone, setCoachPhone] = React.useState<string | null>(null);
  const [coachPhoneLoading, setCoachPhoneLoading] = React.useState(false);

  if (!showModal || !selectedCourse) return null;

  // Fetch coach phone number from coaches API
  React.useEffect(() => {
    const fetchCoachPhone = async () => {
      if (!selectedCourse?.coachEmail) return;
      
      setCoachPhoneLoading(true);
      try {
        const response = await getCoaches();
        console.log('Coaches API Response:', response);
        
        // Handle the API response structure
        let coaches = [];
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
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Fixed Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-4 shadow-lg flex-shrink-0">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <FaBook className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Course Review</h2>
              <p className="text-blue-100 text-sm">Detailed course information and approval</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all duration-200"
            title="Close modal"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-32">
          
          {/* Status Banner */}
          <div className={`p-4 rounded-xl border-l-4 bg-white shadow-sm mb-6 ${
            selectedCourse.status === 'pending' ? 'border-yellow-400' :
            selectedCourse.status === 'approved' ? 'border-green-400' :
            'border-red-400'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedCourse.status === 'pending' ? 'bg-yellow-100' :
                  selectedCourse.status === 'approved' ? 'bg-green-100' :
                  'bg-red-100'
                }`}>
                  {selectedCourse.status === 'pending' && <FaClock className="text-yellow-600" />}
                  {selectedCourse.status === 'approved' && <FaCheck className="text-green-600" />}
                  {selectedCourse.status === 'rejected' && <FaTimes className="text-red-600" />}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 capitalize">{selectedCourse.status} Course</h3>
                  <p className="text-sm text-gray-600">
                    Submitted on {new Date(selectedCourse.submittedAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              {getStatusBadge(selectedCourse.status)}
            </div>
          </div>

          {/* Main Content Grid - Better Space Utilization */}
          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            
            {/* Left Column - Course Visual & Pricing (1/4) */}
            <div className="lg:col-span-1 xl:col-span-1 space-y-6">
              {/* Course Thumbnail */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                      <button className="w-16 h-16 sm:w-20 sm:h-20 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg">
                        <FaPlay className="text-gray-800 text-xl sm:text-2xl ml-1" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing Section - Below Thumbnail */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="text-center">
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">${selectedCourse.price}</h3>
                  <p className="text-gray-600 text-sm">Course Price</p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100 text-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <FaBook className="text-blue-600 text-sm" />
                    </div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">Category</p>
                    <p className="font-semibold text-gray-900 text-sm capitalize">{selectedCourse.category.replace('-', ' ')}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg border border-green-100 text-center">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <FaClock className="text-green-600 text-sm" />
                    </div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">Duration</p>
                    <p className="font-semibold text-gray-900 text-sm">{selectedCourse.duration} weeks</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column - Course & Coach Details (2/4) */}
            <div className="lg:col-span-2 xl:col-span-2 space-y-6">
              {/* Course Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center text-lg">
                  <FaGraduationCap className="text-indigo-600 mr-3" />
                  Course Information
                </h4>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">{selectedCourse.courseTitle}</h3>
                    <p className="text-gray-600 leading-relaxed">{selectedCourse.courseDescription}</p>
                  </div>
                </div>
              </div>

              {/* Coach Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center text-lg">
                  <FaUser className="text-green-600 mr-3" />
                  Coach Information
                </h4>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-100">
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
                      className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-3"
                    >
                      <FaUser />
                      <span>View Coach Details</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Submission Details */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center text-lg">
                  <FaFileAlt className="text-purple-600 mr-3" />
                  Submission Details
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">Submitted Date:</span>
                    <span className="font-semibold text-gray-900 text-right">
                      {new Date(selectedCourse.submittedAt).toLocaleDateString('en-US', {
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">Current Status:</span>
                    <div>{getStatusBadge(selectedCourse.status)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Schedule (1/4) */}
            <div className="xl:col-span-1 space-y-6">
              {/* Weekly Schedule */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center text-lg">
                  <FaCalendarAlt className="text-orange-600 mr-3" />
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
      {selectedCourse.status === 'pending' && (
        <div className="bg-white border-t border-gray-200 p-4 sm:p-6 flex-shrink-0 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-2xl mx-auto">
              <button
                onClick={() => onApprove(selectedCourse.id)}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center gap-3 sm:gap-4"
              >
                {isLoading ? (
                  <FaSpinner className="animate-spin text-xl sm:text-2xl" />
                ) : (
                  <>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <FaCheck className="text-sm sm:text-lg" />
                    </div>
                    <span>Approve Course</span>
                  </>
                )}
              </button>
              <button
                onClick={onReject}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-rose-500 to-rose-600 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-xl hover:from-rose-600 hover:to-rose-700 transition-all duration-200 disabled:opacity-50 font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center gap-3 sm:gap-4"
              >
                {isLoading ? (
                  <FaSpinner className="animate-spin text-xl sm:text-2xl" />
                ) : (
                  <>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <FaTimes className="text-sm sm:text-lg" />
                    </div>
                    <span>Reject Course</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetailsModal;
