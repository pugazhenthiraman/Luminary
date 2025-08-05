import React, { useState, useMemo } from 'react';
import { 
  FaGraduationCap, 
  FaCalendarAlt, 
  FaStar, 
  FaBook, 
  FaUser,
  FaChartLine,
  FaEye,
  FaTimes,
  FaPlay,
  FaDownload,
  FaComments,
  FaSearch,
  FaFilter,
  FaClock,
  FaDollarSign,
  FaCreditCard,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowRight,
  FaCalendarCheck,
  FaUserGraduate,
  FaTrophy,
  FaVideo,
  FaFileAlt,
  FaCheck,
  FaEnvelope,
  FaPhone
} from 'react-icons/fa';
import { Enrollment } from '../data/mockData';

interface ParentUser {
  id: string;
  email: string;
  name: string;
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

interface EnrollmentsProps {
  enrollments: Enrollment[];
  parentData: ParentUser;
}

const Enrollments: React.FC<EnrollmentsProps> = ({ enrollments, parentData }) => {
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<any>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joiningSession, setJoiningSession] = useState<Enrollment | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedChild, setSelectedChild] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

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

  // Filter enrollments
  const filteredEnrollments = useMemo(() => {
    let filtered = enrollments.filter(enrollment => {
      const matchesStatus = filterStatus === 'all' || enrollment.status === filterStatus;
      const matchesChild = selectedChild === 'all' || enrollment.childId === selectedChild;
      const matchesSearch = searchTerm === '' || 
        enrollment.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.coachName.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Date filtering
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const enrollmentDate = new Date(enrollment.enrollmentDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - enrollmentDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        switch (dateFilter) {
          case 'today':
            matchesDate = diffDays === 0;
            break;
          case 'week':
            matchesDate = diffDays <= 7;
            break;
          case 'month':
            matchesDate = diffDays <= 30;
            break;
          case 'quarter':
            matchesDate = diffDays <= 90;
            break;
        }
      }
      
      return matchesStatus && matchesChild && matchesSearch && matchesDate;
    });

    // Sort by most recent enrollment date by default
    filtered.sort((a, b) => new Date(b.enrollmentDate).getTime() - new Date(a.enrollmentDate).getTime());

    return filtered;
  }, [enrollments, filterStatus, selectedChild, searchTerm, dateFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <FaPlay className="text-green-600" />;
      case 'completed':
        return <FaCheckCircle className="text-blue-600" />;
      case 'cancelled':
        return <FaExclamationTriangle className="text-red-600" />;
      default:
        return <FaClock className="text-gray-600" />;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (progress >= 60) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    return 'bg-gradient-to-r from-red-500 to-pink-500';
  };

  const getProgressTextColor = (progress: number) => {
    if (progress >= 80) return 'text-green-700';
    if (progress >= 60) return 'text-yellow-700';
    return 'text-red-700';
  };

  const handleViewDetails = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
  };

  // Mock coach data
  const mockCoachData = {
    id: 'coach-1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@luminary.com',
    phone: '+1 (555) 123-4567',
    specialization: 'Mathematics & Science',
    experience: '8 years',
    rating: 4.8,
    totalStudents: 45,
    bio: 'Experienced educator passionate about making learning engaging and accessible. Specializes in mathematics and science with a focus on hands-on learning experiences.',
    education: 'Master\'s in Education, Stanford University',
    certifications: ['Certified Math Teacher', 'Science Education Specialist', 'Online Teaching Certificate'],
    languages: ['English', 'Spanish'],
    availability: 'Mon-Fri: 9 AM - 6 PM, Sat: 10 AM - 2 PM',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  };

  const handleJoinSession = (enrollment: Enrollment) => {
    setJoiningSession(enrollment);
    setShowJoinModal(true);
  };

  const handleDownloadCertificate = (enrollment: Enrollment) => {
    // Simulate certificate download
    const link = document.createElement('a');
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(`Certificate of Completion\n\nCourse: ${enrollment.courseTitle}\nStudent: ${enrollment.childName}\nCoach: ${enrollment.coachName}\nCompletion Date: ${new Date().toLocaleDateString()}\nGrade: ${enrollment.grade}\n\nCongratulations on completing this course!`);
    link.download = `${enrollment.courseTitle}_Certificate.txt`;
    link.click();
  };

  const handleContactCoach = (enrollment: Enrollment) => {
    setSelectedCoach(mockCoachData);
  };

  const clearAllFilters = () => {
    setFilterStatus('all');
    setSelectedChild('all');
    setSearchTerm('');
    setDateFilter('all');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filterStatus !== 'all') count++;
    if (selectedChild !== 'all') count++;
    if (searchTerm !== '') count++;
    if (dateFilter !== 'all') count++;
    return count;
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            My Enrollments
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mb-6">
            Track your children's course progress and manage their learning journey.
          </p>
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 sm:px-6 py-3 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold">{enrollments.length}</div>
              <div className="text-sm opacity-90">Total</div>
        </div>
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 sm:px-6 py-3 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold">
              {enrollments.filter(e => e.status === 'active').length}
            </div>
            <div className="text-sm opacity-90">Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Search Bar */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
            <input
              type="text"
              placeholder="Search courses, children, or coaches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Filters</h3>
            <div className="flex items-center gap-2">
              {getActiveFiltersCount() > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  {getActiveFiltersCount()} active
                </span>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <FaFilter className="text-sm" />
                {showFilters ? 'Hide' : 'Show'} Filters
              </button>
            </div>
          </div>

                     {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
               {/* Status Filter */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                 <select
                   value={filterStatus}
                   onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  title="Filter by enrollment status"
                 >
                   <option value="all">All Status</option>
                   <option value="active">Active</option>
                   <option value="completed">Completed</option>
                   <option value="cancelled">Cancelled</option>
                 </select>
               </div>

               {/* Child Filter */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Child</label>
                 <select
                   value={selectedChild}
                   onChange={(e) => setSelectedChild(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  title="Filter by child"
                 >
                   <option value="all">All Children</option>
                   {parentData.children.map(child => (
                     <option key={child.id} value={child.id}>
                       {child.firstName} {child.lastName} ({calculateAge(child.dateOfBirth)})
                     </option>
                   ))}
                 </select>
               </div>

               {/* Date Filter */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Enrollment Date</label>
                 <select
                   value={dateFilter}
                   onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  title="Filter by enrollment date"
                 >
                   <option value="all">All Time</option>
                   <option value="today">Today</option>
                   <option value="week">This Week</option>
                   <option value="month">This Month</option>
                   <option value="quarter">This Quarter</option>
                 </select>
               </div>

               {/* Clear Filters */}
               <div className="flex items-end">
                 <button
                   onClick={clearAllFilters}
                   className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                 >
                   Clear All
                 </button>
               </div>
             </div>
           )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredEnrollments.length} of {enrollments.length} enrollments
        </p>
        {getActiveFiltersCount() > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Enrollments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {filteredEnrollments.map((enrollment, index) => (
          <div 
            key={enrollment.id} 
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden animate-in slide-in-from-left duration-500"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Header with Status */}
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2 break-words">
                    {enrollment.courseTitle}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <FaUserGraduate className="text-indigo-500 text-sm" />
                      <span className="truncate">{enrollment.childName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaUser className="text-green-500 text-sm" />
                      <span className="truncate">{enrollment.coachName}</span>
                    </div>
                  </div>
                </div>
                <div className={`flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full border text-xs sm:text-sm ${getStatusColor(enrollment.status)} flex-shrink-0`}>
                  {getStatusIcon(enrollment.status)}
                  <span className="font-medium">
                    {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Progress Section */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Course Progress</span>
                  <span className={`text-sm font-bold ${getProgressTextColor(enrollment.progress)}`}>
                    {enrollment.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                  <div
                    className={`h-2 sm:h-3 rounded-full transition-all duration-300 ${getProgressColor(enrollment.progress)}`}
                    style={{ width: `${enrollment.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <div className="text-base sm:text-lg font-bold text-blue-600">
                    {enrollment.completedSessions}/{enrollment.totalSessions}
                  </div>
                  <div className="text-xs text-gray-600">Sessions</div>
                </div>
                <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
                  <div className="text-base sm:text-lg font-bold text-green-600">{enrollment.grade}</div>
                  <div className="text-xs text-gray-600">Grade</div>
                </div>
                <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-100">
                  <div className="text-base sm:text-lg font-bold text-purple-600">
                    ${(enrollment.progress * 0.99).toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-600">Credits</div>
                </div>
              </div>

              {/* Course Info */}
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-2">
                    <FaCalendarCheck className="text-indigo-500 text-sm" />
                    <span className="hidden sm:inline">Enrolled</span>
                  </span>
                  <span className="font-medium text-xs sm:text-sm">{formatDate(enrollment.enrollmentDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-2">
                    <FaClock className="text-green-500 text-sm" />
                    <span className="hidden sm:inline">Next Session</span>
                  </span>
                  <span className="font-medium text-xs sm:text-sm">{formatDate(enrollment.nextSession)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-2">
                    <FaDollarSign className="text-purple-500 text-sm" />
                    <span className="hidden sm:inline">Total Amount</span>
                  </span>
                  <span className="font-medium text-sm sm:text-lg font-bold text-purple-600">
                    ${(enrollment.totalSessions * 99).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleViewDetails(enrollment)}
                  className="flex-1 px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center gap-1"
                >
                  <FaEye className="text-sm" />
                  Details
                </button>
                {enrollment.status === 'active' && (
                  <button
                    onClick={() => handleJoinSession(enrollment)}
                    className="flex-1 px-3 py-2 text-sm text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-1"
                  >
                    <FaVideo className="text-sm" />
                    Join
                  </button>
                )}
                {enrollment.status === 'completed' && (
                  <button
                    onClick={() => handleDownloadCertificate(enrollment)}
                    className="flex-1 px-3 py-2 text-sm text-white bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg hover:from-purple-600 hover:to-violet-700 transition-all duration-200 flex items-center justify-center gap-1"
                  >
                    <FaTrophy className="text-sm" />
                    Certificate
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Enrollments */}
      {filteredEnrollments.length === 0 && (
        <div className="text-center py-12 sm:py-16">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <FaGraduationCap className="text-gray-400 text-2xl sm:text-3xl" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No enrollments found</h3>
          <p className="text-gray-500 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base">
            {enrollments.length === 0 
              ? "You haven't enrolled in any courses yet. Start your children's learning journey today!"
              : "No enrollments match your current filters. Try adjusting your search criteria."
            }
          </p>
          {enrollments.length === 0 && (
            <button className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium text-sm sm:text-base">
              <FaBook className="text-sm" />
              Browse Available Courses
            </button>
          )}
        </div>
      )}

      {/* Enrollment Detail Modal */}
      {selectedEnrollment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-2 sm:mx-4">
            <div className="p-4 sm:p-8">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-3xl font-bold text-gray-900 truncate">Enrollment Details</h2>
                </div>
                <button
                  onClick={() => setSelectedEnrollment(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 flex-shrink-0"
                  aria-label="Close modal"
                >
                  <FaTimes className="text-lg sm:text-xl" />
                </button>
              </div>

              <div className="space-y-6 sm:space-y-8">
                {/* Course Header */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 sm:p-6 border border-indigo-100">
                  <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-3 break-words">
                    {selectedEnrollment.courseTitle}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <FaUserGraduate className="text-indigo-500 text-sm" />
                      <span className="text-gray-600">Student:</span>
                      <span className="font-medium truncate">{selectedEnrollment.childName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaUser className="text-green-500 text-sm" />
                      <span className="text-gray-600">Coach:</span>
                      <span className="font-medium truncate">{selectedEnrollment.coachName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaCreditCard className="text-purple-500 text-sm" />
                      <span className="text-gray-600">Credits:</span>
                      <span className="font-medium">{selectedEnrollment.totalSessions * 99}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Overview */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                    <FaChartLine className="text-blue-500 text-sm sm:text-base" />
                    Progress Overview
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">{selectedEnrollment.progress}%</div>
                      <div className="text-xs sm:text-sm text-gray-600">Overall Progress</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">{selectedEnrollment.grade}</div>
                      <div className="text-xs sm:text-sm text-gray-600">Current Grade</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">
                        ${(selectedEnrollment.progress * 0.99).toFixed(0)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Credits Earned</div>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Progress Bar</span>
                      <span className="text-sm font-bold text-gray-900">{selectedEnrollment.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4">
                      <div
                        className={`h-3 sm:h-4 rounded-full transition-all duration-300 ${getProgressColor(selectedEnrollment.progress)}`}
                        style={{ width: `${selectedEnrollment.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Session Details */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                    <FaCalendarAlt className="text-green-500 text-sm sm:text-base" />
                    Session Details
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-gray-900">{selectedEnrollment.totalSessions}</div>
                      <div className="text-xs sm:text-sm text-gray-600">Total Sessions</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-green-600">{selectedEnrollment.completedSessions}</div>
                      <div className="text-xs sm:text-sm text-gray-600">Completed</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-yellow-50 rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                        {selectedEnrollment.totalSessions - selectedEnrollment.completedSessions}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Remaining</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                      <div className="text-lg sm:text-2xl font-bold text-blue-600">{formatDate(selectedEnrollment.nextSession)}</div>
                      <div className="text-xs sm:text-sm text-gray-600">Next Session</div>
                    </div>
                  </div>
                </div>

                {/* Coach Feedback */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FaComments className="text-blue-500 text-sm sm:text-base" />
                    Coach Feedback
                  </h4>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 sm:p-4 border border-blue-100">
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base break-words">{selectedEnrollment.feedback}</p>
                  </div>
                </div>

                {/* Enrollment Info */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FaFileAlt className="text-purple-500 text-sm sm:text-base" />
                    Enrollment Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 text-sm">Enrollment Date:</span>
                      <span className="font-medium text-sm">{formatDate(selectedEnrollment.enrollmentDate)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 text-sm">Status:</span>
                      <span className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full ${getStatusColor(selectedEnrollment.status)}`}>
                        {selectedEnrollment.status.charAt(0).toUpperCase() + selectedEnrollment.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedEnrollment(null)}
                    className="flex-1 px-4 sm:px-6 py-2 sm:py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium text-sm sm:text-base"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleContactCoach(selectedEnrollment)}
                    className="flex-1 px-4 sm:px-6 py-2 sm:py-3 text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <FaComments className="text-sm" />
                    Contact Coach
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coach Details Modal */}
      {selectedCoach && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-2 sm:mx-4">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Coach Details</h2>
                <button
                  onClick={() => setSelectedCoach(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  aria-label="Close modal"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Coach Header */}
                <div className="flex items-center space-x-4">
                  <img 
                    src={selectedCoach.avatar} 
                    alt={selectedCoach.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-blue-100"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedCoach.name}</h3>
                    <p className="text-gray-600">{selectedCoach.specialization}</p>
                    <div className="flex items-center mt-1">
                      <FaStar className="text-yellow-400 text-sm" />
                      <span className="text-sm font-medium text-gray-700 ml-1">{selectedCoach.rating}</span>
                      <span className="text-sm text-gray-500 ml-2">({selectedCoach.totalStudents} students)</span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <FaEnvelope className="text-blue-500 mr-2" />
                      <span>{selectedCoach.email}</span>
                    </div>
                    <div className="flex items-center">
                      <FaPhone className="text-green-500 mr-2" />
                      <span>{selectedCoach.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">{selectedCoach.bio}</p>
                </div>

                {/* Education & Experience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Education</h4>
                    <p className="text-gray-700 text-sm">{selectedCoach.education}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Experience</h4>
                    <p className="text-gray-700 text-sm">{selectedCoach.experience}</p>
                  </div>
                </div>

                {/* Certifications */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Certifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCoach.certifications.map((cert: string, index: number) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCoach.languages.map((lang: string, index: number) => (
                      <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Availability</h4>
                  <p className="text-gray-700 text-sm">{selectedCoach.availability}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedCoach(null)}
                    className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      window.open(`mailto:${selectedCoach.email}?subject=Course Inquiry`);
                      setSelectedCoach(null);
                    }}
                    className="flex-1 px-4 py-2 text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-sm flex items-center justify-center gap-2"
                  >
                    <FaEnvelope className="text-sm" />
                    Send Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Join Session Modal */}
      {showJoinModal && joiningSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full mx-2 sm:mx-4">
            <div className="p-4 sm:p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaVideo className="text-white text-2xl" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Join Session</h2>
                <p className="text-gray-600 text-sm mb-6">
                  Ready to join your session for <strong>{joiningSession.courseTitle}</strong>?
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Course:</span>
                      <span className="font-medium">{joiningSession.courseTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Student:</span>
                      <span className="font-medium">{joiningSession.childName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Coach:</span>
                      <span className="font-medium">{joiningSession.coachName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Next Session:</span>
                      <span className="font-medium">{formatDate(joiningSession.nextSession)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowJoinModal(false);
                      setJoiningSession(null);
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Simulate joining session
                      alert(`Joining session for ${joiningSession.courseTitle}...\n\nThis would typically open a video call or redirect to the session platform.`);
                      setShowJoinModal(false);
                      setJoiningSession(null);
                    }}
                    className="flex-1 px-4 py-2 text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 text-sm flex items-center justify-center gap-2"
                  >
                    <FaVideo className="text-sm" />
                    Join Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Enrollments; 