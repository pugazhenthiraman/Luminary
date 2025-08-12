import React, { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaBook, 
  FaPlay, 
  FaCalendarAlt, 
  FaClock, 
  FaGraduationCap,
  FaDollarSign,
  FaVideo,
  FaSpinner,
  FaExclamationTriangle,
  FaEye,
  FaEdit,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaFileAlt,
  FaGlobe,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { getCourseById } from '../../api/courses';
import { showErrorToast } from '../../components/Toast';
import { getGradient } from '../../utils/getGradient';

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

interface CourseDetails {
  id: string | number;
  title: string;
  description?: string;
  benefits?: string;
  category: string;
  creditCost?: number;
  price?: number;
  courseDuration?: string;
  duration?: string;
  thumbnail?: string;
  videoUrl?: string;
  weeklySchedule?: DaySchedule[];
  createdAt: string;
  updatedAt?: string;
  status?: string;
  isActive?: boolean;
  rejectionReason?: string;
  coach?: {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    avatar?: string;
    phone?: string;
    languages?: string[];
  };
  enrollmentCount?: number;
  maxEnrollments?: number;
  timezone?: string;
}

interface CoachCourseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string | number | null;
  onEdit?: (courseId: string | number) => void;
}

const CoachCourseDetailsModal: React.FC<CoachCourseDetailsModalProps> = ({
  isOpen,
  onClose,
  courseId,
  onEdit
}) => {
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch course details when modal opens
  useEffect(() => {
    if (isOpen && courseId) {
      fetchCourseDetails();
    }
  }, [isOpen, courseId]);

  // Handle ESC key and prevent body scroll
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const fetchCourseDetails = async () => {
    if (!courseId) return;

    setLoading(true);
    setError(null);
    setCourseDetails(null);

    try {
      console.log(`[CoachCourseModal] Fetching course details for ID: ${courseId}`);
      console.log(`[CoachCourseModal] API Endpoint: GET /api/v1/courses/${courseId}`);
      
      const response = await getCourseById(String(courseId));
      console.log('[CoachCourseModal] API Response:', response);

      // Handle different response structures
      let courseData: CourseDetails;
      if (response.data?.success && response.data?.data) {
        // Backend returns { success: true, data: courseData }
        courseData = response.data.data;
      } else if (response.data?.data) {
        // Backend returns { data: courseData }
        courseData = response.data.data;
      } else if (response.data) {
        // Direct course data
        courseData = response.data;
      } else {
        throw new Error('Invalid API response structure');
      }

      // Validate required fields
      if (!courseData.id || !courseData.title) {
        throw new Error('Missing required course data (id or title)');
      }

      console.log('[CoachCourseModal] Course data loaded successfully:', courseData);
      setCourseDetails(courseData);

    } catch (err: any) {
      console.error('[CoachCourseModal] Failed to load course details:', err);
      console.error('[CoachCourseModal] Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Failed to load course details. Please try again.';
      
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeDisplay = (time: string): string => {
    if (!time) return '';
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    return `${displayHour}:${minute || '00'} ${period}`;
  };

  const getStatusBadge = (status?: string, isActive?: boolean) => {
    let statusText = 'pending';
    let colorClass = 'bg-yellow-100 text-yellow-800';
    let icon = <FaHourglassHalf className="w-4 h-4" />;

    if (status) {
      const normalizedStatus = status.toLowerCase();
      if (normalizedStatus === 'approved' || normalizedStatus === 'active') {
        statusText = 'approved';
        colorClass = 'bg-green-100 text-green-800';
        icon = <FaCheckCircle className="w-4 h-4" />;
      } else if (normalizedStatus === 'rejected') {
        statusText = 'rejected';
        colorClass = 'bg-red-100 text-red-800';
        icon = <FaTimesCircle className="w-4 h-4" />;
      }
    } else if (isActive === true) {
      statusText = 'active';
      colorClass = 'bg-green-100 text-green-800';
      icon = <FaCheckCircle className="w-4 h-4" />;
    } else if (isActive === false) {
      statusText = 'inactive';
      colorClass = 'bg-gray-100 text-gray-800';
      icon = <FaTimesCircle className="w-4 h-4" />;
    }

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
        {icon}
        <span className="ml-1">{statusText.charAt(0).toUpperCase() + statusText.slice(1)}</span>
      </span>
    );
  };

  const handleVideoPlay = () => {
    if (courseDetails?.videoUrl) {
      window.open(courseDetails.videoUrl, '_blank');
    }
  };

  const handleEditCourse = () => {
    if (courseDetails && onEdit) {
      onEdit(courseDetails.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <FaBook className="text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Course Details</h2>
                <p className="text-blue-100 text-sm">Detailed information about your course</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {courseDetails && onEdit && (
                <button
                  onClick={handleEditCourse}
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-200"
                  title="Edit course"
                >
                  <FaEdit className="text-sm" />
                  <span className="hidden sm:inline">Edit Course</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all duration-200"
                title="Close modal"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4 mx-auto" />
                <p className="text-gray-600 text-lg">Loading course details...</p>
                <p className="text-gray-500 text-sm mt-2">Fetching data from API...</p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center max-w-md">
                <FaExclamationTriangle className="text-4xl text-red-500 mb-4 mx-auto" />
                <p className="text-gray-600 text-lg mb-2">Failed to load course details</p>
                <p className="text-gray-500 text-sm mb-4">{error}</p>
                <button 
                  onClick={fetchCourseDetails}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {courseDetails && !loading && !error && (
            <div className="p-6 space-y-8">
              
              {/* Status Banner */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <FaGraduationCap className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Course Status</h3>
                      <p className="text-sm text-gray-600">
                        Created on {new Date(courseDetails.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(courseDetails.status, courseDetails.isActive)}
                </div>
                {courseDetails.rejectionReason && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>Rejection Reason:</strong> {courseDetails.rejectionReason}
                    </p>
                  </div>
                )}
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column - Media Assets */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Course Thumbnail/Video */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <FaVideo className="text-blue-600 mr-2" />
                        Media Assets
                      </h3>
                    </div>
                    
                    {/* Course Thumbnail */}
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Course Thumbnail</h4>
                      <div className="relative">
                        {courseDetails.thumbnail ? (
                          <img
                            src={courseDetails.thumbnail}
                            alt={courseDetails.title}
                            className="w-full h-48 object-cover rounded-lg border border-gray-200"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <FaVideo className="text-3xl text-gray-400 mb-2 mx-auto" />
                              <p className="text-sm text-gray-500">No thumbnail uploaded</p>
                              <p className="text-xs text-gray-400 mt-1">Thumbnail helps students identify your course</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Introduction Video */}
                    <div className="p-4 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Introduction Video</h4>
                      {courseDetails.videoUrl ? (
                        <div className="relative">
                          <div className="w-full h-32 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 flex items-center justify-center">
                            <button 
                              onClick={handleVideoPlay}
                              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                              <FaPlay className="text-sm" />
                              <span>Play Introduction Video</span>
                            </button>
                          </div>
                          <div className="mt-2 p-2 bg-green-50 rounded text-center">
                            <p className="text-xs text-green-700">✓ Introduction video available</p>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <FaPlay className="text-2xl text-gray-400 mb-2 mx-auto" />
                            <p className="text-sm text-gray-500">No introduction video</p>
                            <p className="text-xs text-gray-400 mt-1">Video helps students understand your course better</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Course Statistics */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FaDollarSign className="text-green-600 mr-2" />
                      Course Statistics
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Price</span>
                        <span className="font-semibold text-green-600">
                          ${courseDetails.creditCost ?? courseDetails.price ?? 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Duration</span>
                        <span className="font-semibold">
                          {courseDetails.courseDuration || courseDetails.duration || (
                            <span className="text-gray-400 italic">Not specified</span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Enrollments</span>
                        <span className="font-semibold">
                          {courseDetails.enrollmentCount ?? 0}
                          {courseDetails.maxEnrollments && ` / ${courseDetails.maxEnrollments}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Timezone</span>
                        <span className="font-semibold">
                          {courseDetails.timezone || (
                            <span className="text-gray-400 italic">Not set</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Course Details */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Course Details Section */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center">
                        <FaBook className="text-blue-600 mr-2" />
                        Course Details
                      </h3>
                    </div>
                    
                    {/* Course Title */}
                    <div className="mb-6">
                      <h4 className="text-2xl font-bold text-gray-900 mb-2">{courseDetails.title}</h4>
                    </div>
                    
                    {/* Course Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-100">
                        <FaBook className="text-blue-600 text-xl mb-2 mx-auto" />
                        <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">Category</p>
                        <p className="font-semibold text-gray-900 capitalize mt-1">
                          {courseDetails.category ? courseDetails.category.replace('-', ' ') : (
                            <span className="text-gray-400 italic text-sm">Not specified</span>
                          )}
                        </p>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-4 text-center border border-green-100">
                        <FaClock className="text-green-600 text-xl mb-2 mx-auto" />
                        <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">Duration</p>
                        <p className="font-semibold text-gray-900 mt-1">
                          {courseDetails.courseDuration || courseDetails.duration || (
                            <span className="text-gray-400 italic text-sm">Not set</span>
                          )}
                        </p>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-100">
                        <FaDollarSign className="text-purple-600 text-xl mb-2 mx-auto" />
                        <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">Credits/Price</p>
                        <p className="font-semibold text-gray-900 mt-1">
                          ${courseDetails.creditCost ?? courseDetails.price ?? 0}
                        </p>
                      </div>
                    </div>

                    {/* Course Description */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <FaFileAlt className="text-gray-600 mr-2" />
                        Course Description
                      </h4>
                      {courseDetails.description ? (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <p className="text-gray-700 leading-relaxed">{courseDetails.description}</p>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300 text-center">
                          <FaFileAlt className="text-2xl text-gray-400 mb-2 mx-auto" />
                          <p className="text-gray-500 font-medium">No description provided</p>
                          <p className="text-xs text-gray-400 mt-1">A detailed description helps students understand what they'll learn</p>
                        </div>
                      )}
                    </div>

                    {/* Course Benefits */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <FaCheckCircle className="text-green-600 mr-2" />
                        What Students Will Learn
                      </h4>
                      {courseDetails.benefits ? (
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <p className="text-gray-700 leading-relaxed">{courseDetails.benefits}</p>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300 text-center">
                          <FaCheckCircle className="text-2xl text-gray-400 mb-2 mx-auto" />
                          <p className="text-gray-500 font-medium">No learning outcomes specified</p>
                          <p className="text-xs text-gray-400 mt-1">Highlight the key benefits and skills students will gain</p>
                        </div>
                      )}
                    </div>

                    {/* Additional Course Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                        <h5 className="font-medium text-indigo-900 mb-2 flex items-center">
                          <FaGraduationCap className="mr-2" />
                          Program Type
                        </h5>
                        <p className="text-sm text-indigo-700">
                          {courseDetails.program || (
                            <span className="text-gray-400 italic">Not specified</span>
                          )}
                        </p>
                      </div>
                      
                      <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                        <h5 className="font-medium text-orange-900 mb-2 flex items-center">
                          <FaMapMarkerAlt className="mr-2" />
                          Timezone
                        </h5>
                        <p className="text-sm text-orange-700">
                          {courseDetails.timezone || (
                            <span className="text-gray-400 italic">Not set</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Schedule & Availability Section */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <FaCalendarAlt className="text-blue-600 mr-2" />
                      Schedule & Availability
                    </h3>
                    
                    {courseDetails.weeklySchedule && courseDetails.weeklySchedule.some(day => day.isActive) ? (
                      <div className="space-y-4">
                        {/* Active Days Summary */}
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 mb-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-blue-900">Weekly Schedule</h4>
                              <p className="text-sm text-blue-700 mt-1">
                                {courseDetails.weeklySchedule.filter(day => day.isActive).length} day(s) per week
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-blue-600 font-medium">
                                Total Sessions: {courseDetails.weeklySchedule
                                  .filter(day => day.isActive)
                                  .reduce((total, day) => total + day.timeSlots.length, 0)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Detailed Schedule */}
                        <div className="space-y-3">
                          {courseDetails.weeklySchedule
                            .filter(day => day.isActive && day.timeSlots.length > 0)
                            .map((day, index) => (
                              <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-semibold text-gray-900 flex items-center">
                                    <FaCalendarAlt className="text-blue-500 mr-2 text-sm" />
                                    {day.day.replace('S', '').slice(0, -1)}
                                  </h4>
                                  <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded">
                                    {day.timeSlots.length} session{day.timeSlots.length > 1 ? 's' : ''}
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {day.timeSlots.map((slot, slotIndex) => (
                                    <div key={slotIndex} className="bg-white rounded-lg p-3 border border-gray-100">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                          <FaClock className="text-gray-400 text-sm" />
                                          <span className="font-medium text-gray-900">
                                            {formatTimeDisplay(slot.startTime)} - {formatTimeDisplay(slot.endTime)}
                                          </span>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-sm text-gray-600">
                                            <span className="font-medium">{slot.sessionDuration} min</span>
                                            {slot.sessions > 1 && (
                                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                × {slot.sessions} sessions
                                              </span>
                                            )}
                                          </div>
                                          {slot.bufferTime > 0 && (
                                            <div className="text-xs text-gray-500 mt-1">
                                              Buffer: {slot.bufferTime} min
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                        </div>

                        {/* Timezone Information */}
                        {courseDetails.timezone && (
                          <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                            <div className="flex items-center space-x-2">
                              <FaGlobe className="text-indigo-600 text-sm" />
                              <span className="text-sm font-medium text-indigo-900">Timezone:</span>
                              <span className="text-sm text-indigo-700">{courseDetails.timezone}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="bg-gray-50 rounded-lg p-8 border-2 border-dashed border-gray-300">
                          <FaCalendarAlt className="text-4xl text-gray-400 mb-4 mx-auto" />
                          <h4 className="text-lg font-medium text-gray-600 mb-2">No Schedule Set</h4>
                          <p className="text-gray-500 mb-4">
                            Weekly schedule and availability have not been configured yet.
                          </p>
                          <div className="bg-white rounded-lg p-4 border border-gray-200 text-left">
                            <h5 className="font-medium text-gray-700 mb-2">To set up your schedule:</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Select available days of the week</li>
                              <li>• Set time slots for each day</li>
                              <li>• Configure session duration and buffer time</li>
                              <li>• Choose your timezone</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoachCourseDetailsModal;
