import React, { useState } from 'react';
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
  FaPlay
} from 'react-icons/fa';

interface CourseSubmission {
  id: string;
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
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'coach' | 'category'>('date');

  // Mock data - replace with actual API calls
  const [courses, setCourses] = useState<CourseSubmission[]>([
    {
      id: '1',
      coachName: 'Sarah Johnson',
      coachEmail: 'sarah.johnson@email.com',
      coachPhoto: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      courseTitle: 'Advanced JavaScript Programming',
      courseDescription: 'Master modern JavaScript concepts including ES6+, async programming, and advanced patterns. Perfect for developers looking to level up their skills.',
      category: 'Technology & STEM',
      price: 85,
      duration: '12 weeks',
      lessons: 24,
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=240&fit=crop',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      weeklySchedule: [
        { day: 'MONDAYS', isActive: true, timeSlots: [{ startTime: '09:00', endTime: '10:00' }] },
        { day: 'WEDNESDAYS', isActive: true, timeSlots: [{ startTime: '14:00', endTime: '15:00' }] },
        { day: 'FRIDAYS', isActive: true, timeSlots: [{ startTime: '16:00', endTime: '17:00' }] }
      ],
      submittedAt: '2024-01-15T10:30:00Z',
      status: 'pending'
    },
    {
      id: '2',
      coachName: 'Michael Chen',
      coachEmail: 'michael.chen@email.com',
      coachPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      courseTitle: 'Creative Writing Workshop',
      courseDescription: 'Develop your creative writing skills through interactive workshops, peer feedback, and expert guidance.',
      category: 'Creative Arts',
      price: 65,
      duration: '8 weeks',
      lessons: 16,
      thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=240&fit=crop',
      weeklySchedule: [
        { day: 'TUESDAYS', isActive: true, timeSlots: [{ startTime: '18:00', endTime: '19:30' }] },
        { day: 'THURSDAYS', isActive: true, timeSlots: [{ startTime: '18:00', endTime: '19:30' }] }
      ],
      submittedAt: '2024-01-14T15:45:00Z',
      status: 'pending'
    }
  ]);

  const filteredCourses = courses.filter(course => {
    const matchesStatus = filterStatus === 'all' || course.status === filterStatus;
    const matchesSearch = course.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.coachName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      case 'coach':
        return a.coachName.localeCompare(b.coachName);
      case 'category':
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });

  const handleApprove = (courseId: string) => {
    setCourses(prev => prev.map(course => 
      course.id === courseId ? { ...course, status: 'approved' as const } : course
    ));
    setShowModal(false);
  };

  const handleReject = (courseId: string, reason: string) => {
    setCourses(prev => prev.map(course => 
      course.id === courseId ? { ...course, status: 'rejected' as const, rejectionReason: reason } : course
    ));
    setShowModal(false);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Approval</h1>
          <p className="text-gray-600 mt-1">Review and manage course submissions from coaches</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
            <span className="text-sm font-medium">{filteredCourses.length} courses</span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses, coaches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Sort courses"
            >
              <option value="date">Sort by Date</option>
              <option value="coach">Sort by Coach</option>
              <option value="category">Sort by Category</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title="Filter options"
              aria-label="Filter options"
            >
              <FaFilter />
            </button>
            <button 
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title="Sort options"
              aria-label="Sort options"
            >
              <FaSort />
            </button>
          </div>
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
            {/* Course Thumbnail */}
            <div className="relative">
              <img
                src={course.thumbnail}
                alt={course.courseTitle}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-3 right-3">
                {getStatusBadge(course.status)}
              </div>
              <div className="absolute bottom-3 left-3">
                <span className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                  ${course.price}
                </span>
              </div>
                             {course.videoUrl && (
                 <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                   <button 
                     className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center"
                     title="Play course video"
                     aria-label="Play course video"
                   >
                     <FaPlay className="text-gray-800 text-lg" />
                   </button>
                 </div>
               )}
            </div>

            {/* Course Content */}
            <div className="p-6">
              {/* Coach Info */}
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={course.coachPhoto}
                  alt={course.coachName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{course.coachName}</h3>
                  <p className="text-sm text-gray-500">{course.coachEmail}</p>
                </div>
              </div>

              {/* Course Details */}
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-800 line-clamp-2">{course.courseTitle}</h4>
                <p className="text-sm text-gray-600 line-clamp-3">{course.courseDescription}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                    {course.category}
                  </span>
                  <span>{course.duration} • {course.lessons} lessons</span>
                </div>

                {/* Schedule Preview */}
                {course.weeklySchedule.some(day => day.isActive) && (
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <FaCalendarAlt className="text-gray-400 text-sm" />
                      <span className="text-xs font-medium text-gray-700">Schedule</span>
                    </div>
                    <div className="space-y-1">
                      {course.weeklySchedule
                        .filter(day => day.isActive)
                        .slice(0, 2)
                        .map((day, index) => (
                          <div key={day.day} className="flex items-center justify-between text-xs text-gray-600">
                            <span className="font-medium">{day.day}</span>
                            <div className="flex items-center space-x-1">
                              {day.timeSlots.slice(0, 1).map((slot, slotIndex) => (
                                <span key={slotIndex} className="bg-gray-100 px-2 py-1 rounded text-xs">
                                  {formatTimeDisplay(slot.startTime)} - {formatTimeDisplay(slot.endTime)}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Submission Date */}
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <FaClock className="text-gray-400" />
                  <span>Submitted {new Date(course.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center space-x-2">
                <button
                  onClick={() => {
                    setSelectedCourse(course);
                    setShowModal(true);
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                >
                  <FaEye className="text-sm" />
                  <span className="text-sm font-medium">View Details</span>
                </button>
                
                {course.status === 'pending' && (
                  <>
                                         <button
                       onClick={() => handleApprove(course.id)}
                       className="flex items-center justify-center space-x-2 bg-green-50 text-green-600 py-2 px-3 rounded-lg hover:bg-green-100 transition-colors duration-200"
                       title="Approve course"
                       aria-label="Approve course"
                     >
                       <FaCheck className="text-sm" />
                     </button>
                     <button
                       onClick={() => {
                         setSelectedCourse(course);
                         setShowModal(true);
                       }}
                       className="flex items-center justify-center space-x-2 bg-red-50 text-red-600 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors duration-200"
                       title="Reject course"
                       aria-label="Reject course"
                     >
                       <FaTimes className="text-sm" />
                     </button>
                  </>
                )}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Course Details</h2>
                                 <button
                   onClick={() => setShowModal(false)}
                   className="text-gray-400 hover:text-gray-600"
                   title="Close modal"
                   aria-label="Close modal"
                 >
                   <FaTimes className="text-xl" />
                 </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Course Info */}
                <div className="space-y-6">
                  {/* Course Thumbnail */}
                  <div className="relative">
                    <img
                      src={selectedCourse.thumbnail}
                      alt={selectedCourse.courseTitle}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                                         {selectedCourse.videoUrl && (
                       <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
                         <button 
                           className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center"
                           title="Play course video"
                           aria-label="Play course video"
                         >
                           <FaPlay className="text-gray-800 text-xl" />
                         </button>
                       </div>
                     )}
                  </div>

                  {/* Course Details */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedCourse.courseTitle}</h3>
                      <p className="text-gray-600">{selectedCourse.courseDescription}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-sm text-gray-500">Category</span>
                        <p className="font-medium">{selectedCourse.category}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-sm text-gray-500">Price</span>
                        <p className="font-medium">${selectedCourse.price}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-sm text-gray-500">Duration</span>
                        <p className="font-medium">{selectedCourse.duration}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-sm text-gray-500">Lessons</span>
                        <p className="font-medium">{selectedCourse.lessons}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Coach Info & Schedule */}
                <div className="space-y-6">
                  {/* Coach Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Coach Information</h4>
                    <div className="flex items-center space-x-3">
                      <img
                        src={selectedCourse.coachPhoto}
                        alt={selectedCourse.coachName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h5 className="font-medium text-gray-900">{selectedCourse.coachName}</h5>
                        <p className="text-sm text-gray-500">{selectedCourse.coachEmail}</p>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Schedule */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Weekly Schedule</h4>
                    <div className="space-y-2">
                      {selectedCourse.weeklySchedule.map((day) => (
                        <div key={day.day} className={`p-3 rounded-lg ${day.isActive ? 'bg-white' : 'bg-gray-100'}`}>
                          <div className="flex items-center justify-between">
                            <span className={`font-medium ${day.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                              {day.day}
                            </span>
                            <span className={`text-sm ${day.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                              {day.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          {day.isActive && day.timeSlots.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {day.timeSlots.map((slot, index) => (
                                <div key={index} className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
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
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Submission Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Submitted:</span>
                        <span>{new Date(selectedCourse.submittedAt).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        {getStatusBadge(selectedCourse.status)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              {selectedCourse.status === 'pending' && (
                <div className="mt-8 flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReject(selectedCourse.id, 'Course does not meet our quality standards')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                  >
                    Reject Course
                  </button>
                  <button
                    onClick={() => handleApprove(selectedCourse.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    Approve Course
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseApproval; 