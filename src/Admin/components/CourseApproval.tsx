import React, { useEffect, useState } from 'react';
import { getCourses as getAdminCourses, approveCourse as approveAdminCourse, rejectCourse as rejectAdminCourse } from '../../api/admin';
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
  FaFileAlt
} from 'react-icons/fa';

interface CourseSubmission {
  id: number;
  coachName: string;
  coachEmail: string;
  coachPhoto: string;
  courseTitle: string;
  courseDescription: string;
  category: string;
  price: number;
  duration: string;
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
}

const CourseApproval: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<CourseSubmission | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'coach' | 'category'>('date');
  const [isLoading, setIsLoading] = useState(false); // loading state
  const [showAdvancedFilterModal, setShowAdvancedFilterModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('All Prices');
  const [priceSort, setPriceSort] = useState<'none' | 'asc' | 'desc'>('none');
  const [adminNotes, setAdminNotes] = useState('');

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
      const list: CourseSubmission[] = (res.data?.data?.courses || []).map((c: any) => ({
        id: c.id,
        coachName: c.coachName,
        coachEmail: c.coachEmail,
        coachPhoto: c.coachPhoto,
        courseTitle: c.courseTitle,
        courseDescription: c.courseDescription,
        category: c.category,
        price: c.price,
        duration: String(c.duration ?? ''),
        lessons: c.lessons || 0,
        thumbnail: c.thumbnail || '',
        videoUrl: c.videoUrl || '',
        weeklySchedule: c.weeklySchedule || [],
        submittedAt: c.submittedAt,
        status: c.status,
        rejectionReason: c.rejectionReason,
      }));
      setCourses(list);
    } catch (err) {
      console.error('Failed to load courses', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, searchTerm, selectedCategory, selectedPriceRange, priceSort, sortBy]);

  const filteredCourses = courses.filter(course => {
    const matchesStatus = filterStatus === 'all' || course.status === filterStatus;
    const matchesSearch = course.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       course.coachName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       course.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       course.price.toString().includes(searchTerm);
    const matchesCategory = selectedCategory === 'All Categories' || course.category === selectedCategory;
    const matchesPrice = true; // To be implemented
    return matchesStatus && matchesSearch && matchesCategory && matchesPrice;
  });

  let sortedCourses = [...filteredCourses];
  if (priceSort === 'asc') {
    sortedCourses.sort((a, b) => a.price - b.price);
  } else if (priceSort === 'desc') {
    sortedCourses.sort((a, b) => b.price - a.price);
  }

  const handleApprove = async (courseId: number) => {
    setIsLoading(true);
    try {
      await approveAdminCourse(courseId, adminNotes || undefined);
      setShowModal(false);
      await loadCourses();
    } catch (error) {
      console.error('Error approving course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (courseId: number, reason: string) => {
    setIsLoading(true);
    try {
      await rejectAdminCourse(courseId, reason, adminNotes || undefined);
      setShowModal(false);
      setShowRejectModal(false);
      setRejectReason('');
      await loadCourses();
    } catch (error) {
      console.error('Error rejecting course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectClick = (course: CourseSubmission) => {
    setSelectedCourse(course);
    setShowRejectModal(true);
  };

  const formatTimeDisplay = (time: string) => {
    const [hour] = time.split(':');
    const hourNum = parseInt(hour);
    return hourNum === 0 ? '12:00 AM' : hourNum < 12 ? `${hourNum}:00 AM` : hourNum === 12 ? '12:00 PM' : `${hourNum - 12}:00 PM`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
      case 'approved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
      default:
        return null;
    }
  };

  const confirmReject = async (courseId: number) => {
    setIsLoading(true);
    try {
      await handleReject(courseId, rejectReason);
    } catch (error) {
      console.error("Error rejecting course:", error);
    } finally {
      setIsLoading(false);
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
            <span className="text-xs sm:text-sm font-medium">{filteredCourses.length} courses</span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col gap-2 sm:gap-4">
          {/* Status Filter Pills */}
          <div className="flex flex-wrap gap-2 mb-2">
            {['all', 'pending', 'approved', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors duration-150 ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="relative mb-2">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search courses, coaches, price..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          {/* Price Sort Dropdown */}
          <div className="flex flex-col sm:flex-row sm:justify-end">
            <select
              value={priceSort}
              onChange={e => setPriceSort(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full sm:w-48 mt-2 sm:mt-0"
              aria-label="Sort by price"
            >
              <option value="none">Sort by Price</option>
              <option value="asc">Price: Low to High</option>
              <option value="desc">Price: High to Low</option>
            </select>
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
                <div className="w-full h-40 sm:h-48 bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                  No thumbnail
                </div>
              )}
              <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                {getStatusBadge(course.status)}
              </div>
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
                {course.coachPhoto ? (
                  <img
                    src={course.coachPhoto}
                    alt={course.coachName}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs">
                    {(course.coachName || '?').charAt(0)}
                  </div>
                )}
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
                  <span className="text-xs sm:text-sm text-gray-600">{course.duration} • {course.lessons} lessons</span>
                </div>

                {/* Schedule Preview */}
                {course.weeklySchedule.some(day => day.isActive) && (
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <FaCalendarAlt className="text-gray-400 text-xs sm:text-sm" />
                      <span className="text-xs font-medium text-gray-700">Schedule</span>
                    </div>
                    <div className="space-y-1">
                      {course.weeklySchedule
                        .filter(day => day.isActive)
                        .slice(0, 2)
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
                      onClick={() => { setSelectedCourse(course); setShowModal(true); }}
                      className="text-blue-600 hover:text-blue-800 p-1.5 sm:p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                      title="View Details"
                    >
                      <FaEye className="text-sm" />
                    </button>
                    
                    {course.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(course.id)}
                          className="text-green-600 hover:text-green-800 p-1.5 sm:p-2 rounded-lg hover:bg-green-50 transition-colors duration-200"
                          title="Approve Course"
                        >
                          <FaCheck className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleRejectClick(course)}
                          className="text-red-600 hover:text-red-800 p-1.5 sm:p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                          title="Reject Course"
                        >
                          <FaTimes className="text-sm" />
                        </button>
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

      {/* Course Detail Modal */}
      {showModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Course Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                  title="Close modal"
                  aria-label="Close modal"
                >
                  <FaTimes className="text-lg sm:text-xl" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Left Column - Course Info */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Course Thumbnail */}
                  <div className="relative">
                  {selectedCourse.thumbnail ? (
                    <img
                      src={selectedCourse.thumbnail}
                      alt={selectedCourse.courseTitle}
                      className="w-full h-48 sm:h-64 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-48 sm:h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-sm">
                      No thumbnail
                    </div>
                  )}
                    {selectedCourse.videoUrl && (
                      <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
                        <button 
                          className="w-12 h-12 sm:w-16 sm:h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center"
                          title="Play course video"
                          aria-label="Play course video"
                        >
                          <FaPlay className="text-gray-800 text-lg sm:text-xl" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Course Details */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{selectedCourse.courseTitle}</h3>
                      <p className="text-sm sm:text-base text-gray-600">{selectedCourse.courseDescription}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-xs sm:text-sm text-gray-500">Category</span>
                        <p className="font-medium text-sm sm:text-base">{selectedCourse.category}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-xs sm:text-sm text-gray-500">Price</span>
                        <p className="font-medium text-sm sm:text-base">${selectedCourse.price}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-xs sm:text-sm text-gray-500">Duration</span>
                        <p className="font-medium text-sm sm:text-base">{selectedCourse.duration}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-xs sm:text-sm text-gray-500">Lessons</span>
                        <p className="font-medium text-sm sm:text-base">{selectedCourse.lessons}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Coach Info & Schedule */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Coach Information */}
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Coach Information</h4>
                    <div className="flex items-center space-x-3">
                      {selectedCourse.coachPhoto ? (
                        <img
                          src={selectedCourse.coachPhoto}
                          alt={selectedCourse.coachName}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm">
                          {(selectedCourse.coachName || '?').charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h5 className="font-medium text-gray-900 text-sm sm:text-base truncate">{selectedCourse.coachName}</h5>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">{selectedCourse.coachEmail}</p>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Schedule */}
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Weekly Schedule</h4>
                    <div className="space-y-2">
                      {selectedCourse.weeklySchedule.map((day) => (
                        <div key={day.day} className={`p-2 sm:p-3 rounded-lg ${day.isActive ? 'bg-white' : 'bg-gray-100'}`}>
                          <div className="flex items-center justify-between">
                            <span className={`font-medium text-xs sm:text-sm ${day.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                              {day.day}
                            </span>
                            <span className={`text-xs sm:text-sm ${day.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                              {day.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          {day.isActive && day.timeSlots.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {day.timeSlots.map((slot, index) => (
                                <div key={index} className="text-xs sm:text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                  {formatTimeDisplay(slot.startTime)} - {formatTimeDisplay(slot.endTime)}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Submission Info */}
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Submission Details</h4>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Submitted:</span>
                        <span className="text-right">{new Date(selectedCourse.submittedAt).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Status:</span>
                        <div className="text-right">
                          {getStatusBadge(selectedCourse.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              {selectedCourse.status === 'pending' && (
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-4 sm:gap-10 justify-center">
                  <button
                    onClick={() => {
                      handleApprove(selectedCourse.id);
                    }}
                    disabled={isLoading}
                    className="w-full sm:w-40 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-5 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 font-medium text-sm shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <FaSpinner className="animate-spin text-sm" />
                    ) : (
                      <>
                        <FaCheck className="text-sm" />
                        <span>Approve</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCourse(selectedCourse); // Ensure selectedCourse is set for reject modal
                      setShowRejectModal(true);
                    }}
                    disabled={isLoading}
                    className="w-full sm:w-40 bg-gradient-to-r from-rose-500 to-rose-600 text-white py-3 px-5 rounded-lg hover:from-rose-600 hover:to-rose-700 transition-all duration-200 disabled:opacity-50 font-medium text-sm shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <FaSpinner className="animate-spin text-sm" />
                    ) : (
                      <>
                        <FaTimes className="text-sm" />
                        <span>Reject</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Admin Notes Section */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-base font-bold text-gray-900 mb-3 flex items-center">
                  <FaFileAlt className="text-blue-600 mr-2" />
                  Admin Notes
                </h4>
                <div className="space-y-3">
                  <textarea
                    placeholder="Add notes or feedback about this course..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                    rows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm">
                      Save Notes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default CourseApproval; 