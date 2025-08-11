import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { showSuccessToast, showErrorToast } from '../components/Toast';
import { FaCheck, FaTimes, FaEye, FaSignOutAlt, FaUser, FaEnvelope, FaPhone, FaGraduationCap, FaClock, FaCheckCircle, FaTimesCircle, FaSpinner, FaGlobe, FaPlay, FaFileAlt, FaBars } from 'react-icons/fa';
import Avatar from '../components/Avatar';
import { coachStorage, CoachData } from '../utils/coachStorage';
import AdminSidebar from './components/Sidebar';
import Overview from './components/Overview';
import CourseApproval from './components/CourseApproval';
import CoachApproval from './components/CoachApproval';

import { getCoaches, approveCoach, rejectCoach } from '../api/admin';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout: logoutFromStore } = useAuthStore();
  const [coaches, setCoaches] = useState<CoachData[]>([]);
  const [selectedCoach, setSelectedCoach] = useState<CoachData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filter, setFilter] = useState(() => {
    return localStorage.getItem('adminFilter') || 'all';
  }); // all, pending, approved, rejected
  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem('adminSearchTerm') || '';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [coachToReject, setCoachToReject] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [activeTab, setActiveTab] = useState(() => {
    // Load active tab from localStorage or default to 'overview'
    return localStorage.getItem('adminActiveTab') || 'overview';
  });
  const [showSidebar, setShowSidebar] = useState(true); // State for sidebar visibility

  // Pagination state for coach approval
  const [currentPage, setCurrentPage] = useState(() => {
    return parseInt(localStorage.getItem('adminCurrentPage') || '1');
  });
  const itemsPerPage = 10;
  
  // Filter coaches based on search term and status
  const filteredCoaches = coaches.filter(coach => {
    const matchesSearch = coach.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coach.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coach.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coach.duration.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filter === 'all' || coach.status === filter;
    return matchesSearch && matchesStatus;
  });
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filter]);

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('adminActiveTab', activeTab);
  }, [activeTab]);

  // Save filter to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('adminFilter', filter);
  }, [filter]);

  // Save search term to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('adminSearchTerm', searchTerm);
  }, [searchTerm]);

  // Save current page to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('adminCurrentPage', currentPage.toString());
  }, [currentPage]);
  
  const paginatedCoaches = filteredCoaches.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredCoaches.length / itemsPerPage);

  // Load coaches from backend API
  const loadCoaches = () => {
    setIsLoading(true);
    getCoaches()
      .then(res => {
        // Map backend fields to frontend CoachData type
        const normalized = ((res.data.data && res.data.data.coaches) || []).map((coach: any) => ({
          id: coach.id,
          firstName: coach.firstName,
          lastName: coach.lastName,
          email: coach.email,
          phone: coach.phone,
          experience: coach.experienceDescription || '', // Backend -> frontend
          duration: coach.domain || '', // Backend -> frontend
          address: coach.address || '',
          languages: coach.languages || [],
          status: coach.status ? coach.status.toLowerCase() : 'pending',
          registrationDate: coach.registrationDate || '',
          adminNotes: coach.adminNotes || '',
        }));
        setCoaches(normalized);
console.log('Loaded coaches:', normalized);
      })
      .catch(() => showErrorToast('Failed to load coaches'))
      .finally(() => setIsLoading(false));
  };

  // Check if user is admin and load coaches
  useEffect(() => {
    // Check if user is authenticated and has ADMIN role
    if (!isAuthenticated || !user || user.role !== 'ADMIN') {
      console.log('AdminDashboard: Authentication check failed');
      console.log('isAuthenticated:', isAuthenticated);
      console.log('user:', user);
      navigate('/admin/login');
      return;
    }

    // Load coaches on component mount
    loadCoaches();

    // Set up periodic refresh every 30 seconds to catch new registrations
    const refreshInterval = setInterval(() => {
      loadCoaches();
    }, 30000); // 30 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [isAuthenticated, user, navigate]);

  const handleApprove = async (coachId: string) => {
    setIsLoading(true);
    try {
      await approveCoach(coachId);
      showSuccessToast('Coach approved successfully!');
      loadCoaches();
    } catch (error) {
      showErrorToast('Failed to approve coach');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (coachId: string) => {
    setIsLoading(true);
    try {
      await rejectCoach(coachId, rejectReason || 'Rejected by admin');
      showSuccessToast('Coach rejected successfully');
      setShowRejectConfirm(false);
      setCoachToReject(null);
      setRejectReason('');
      loadCoaches();
    } catch (error) {
      showErrorToast('Failed to reject coach');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmReject = (coachId: string) => {
    setCoachToReject(coachId);
    setShowRejectConfirm(true);
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleViewDetails = (coach: any) => {
    setSelectedCoach(coach);
    setShowDetails(true);
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <FaCheckCircle className="text-green-600" />;
      case 'rejected': return <FaTimesCircle className="text-red-600" />;
      case 'pending': return <FaClock className="text-yellow-600" />;
      default: return null;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'course-approval':
        return <CourseApproval />;
      case 'coach-approval':
        return <CoachApproval />;
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h2>
              <p className="text-gray-600">This feature is under development.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        {/* Header */}
      <header className="bg-white shadow-lg border-b-2 border-gray-100 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Left side - Menu button and title */}
            <div className="flex items-center space-x-3 sm:space-x-4">
                             <button
                 onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                 aria-label="Toggle sidebar"
                title="Toggle sidebar"
               >
                <FaBars className="text-gray-600 text-lg sm:text-xl" />
               </button>
              
              <div className="hidden sm:flex items-center space-x-3">
                <div className="hidden sm:block">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">
                  {activeTab === 'overview' && 'Dashboard Overview'}
                  {activeTab === 'coach-approval' && 'Coach Approval'}
                  {activeTab === 'course-approval' && 'Course Approval'}
                  {activeTab === 'analytics' && 'Analytics'}
                  {activeTab === 'users' && 'User Management'}
                  {activeTab === 'reports' && 'Reports'}
                  {activeTab === 'settings' && 'Settings'}
                </h1>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    Admin Panel - System Management
                  </p>
              </div>
            </div>
            </div>

            {/* Right side - Live status and logout */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live</span>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('user');
                  navigate('/');
                }}
                className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-sm"
              >
                <FaSignOutAlt className="text-sm" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
            </div>
          </div>
        </header>

      {/* Main Content with Sidebar */}
      <div className="flex h-[calc(100vh-64px)] lg:h-[calc(100vh-80px)]">
        <AdminSidebar
          activeTab={activeTab}
          showSidebar={showSidebar}
          onTabChange={setActiveTab}
        />

        {/* Main Content */}
        <main className="flex-1 transition-all duration-500 ease-in-out overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="w-full max-w-7xl mx-auto">
            {renderContent()}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Coach Details Modal */}
      {showDetails && selectedCoach && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[98vh] overflow-hidden">
                                      {/* Header */}
             <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 sm:p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                 <div className="flex items-center space-x-3 sm:space-x-4">
                   <div className="w-10 h-10 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center">
                     <FaUser className="text-base sm:text-2xl" />
                   </div>
                   <div className="min-w-0 flex-1">
                     <h3 className="text-base sm:text-xl lg:text-2xl font-bold truncate">
                       {selectedCoach.firstName} {selectedCoach.lastName}
                </h3>
                     <p className="text-blue-100 flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                       <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                         selectedCoach.status === 'approved' ? 'bg-green-500 text-white' :
                         selectedCoach.status === 'rejected' ? 'bg-red-500 text-white' :
                         'bg-yellow-500 text-white'
                       }`}>
                         {getStatusIcon(selectedCoach.status)}
                         <span className="ml-1 capitalize">{selectedCoach.status}</span>
                       </span>
                       <span className="text-xs sm:text-sm">
                         Applied on {formatDate(selectedCoach.registrationDate)}
                       </span>
                     </p>
                   </div>
                 </div>
                                 <button
                   onClick={() => setShowDetails(false)}
                   className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-all duration-200 flex-shrink-0"
                   title="Close"
                 >
                   <FaTimes className="text-lg sm:text-xl" />
                 </button>
              </div>
            </div>
            
                         {/* Content */}
             <div className="overflow-y-auto max-h-[calc(98vh-120px)]">
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                                 {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  <div className="bg-white rounded-xl shadow-md p-3 sm:p-6 border border-gray-200">
                     <div className="flex items-center">
                      <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                        <FaGraduationCap className="text-blue-600 text-base sm:text-xl" />
                       </div>
                      <div className="ml-3 sm:ml-4">
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Teaching Domain</p>
                        <p className="text-base sm:text-xl font-bold text-gray-900">{selectedCoach.duration}</p>
                       </div>
                     </div>
                   </div>
                  <div className="bg-white rounded-xl shadow-md p-3 sm:p-6 border border-gray-200">
                     <div className="flex items-center">
                      <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
                        <FaClock className="text-yellow-600 text-base sm:text-xl" />
                       </div>
                      <div className="ml-3 sm:ml-4">
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Experience</p>
                        <p className="text-base sm:text-xl font-bold text-gray-900">{selectedCoach.experience} years</p>
                       </div>
                     </div>
                   </div>
                  <div className="bg-white rounded-xl shadow-md p-3 sm:p-6 border border-gray-200 sm:col-span-2 lg:col-span-1">
                     <div className="flex items-center">
                      <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                        <FaGlobe className="text-green-600 text-base sm:text-xl" />
                       </div>
                      <div className="ml-3 sm:ml-4">
                        <p className="text-xs sm:text-sm font-medium text-gray-600">Languages</p>
                        <p className="text-base sm:text-xl font-bold text-gray-900">{selectedCoach.languages.length}</p>
                       </div>
                     </div>
                   </div>
                 </div>

              {/* Personal Information */}
                 <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                  <h4 className="text-base sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                     <FaUser className="text-blue-600 mr-2" />
                     Personal Information
                   </h4>
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                     <div className="space-y-3 sm:space-y-4">
              <div>
                         <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                         <p className="text-sm sm:text-base text-gray-900 font-medium">{selectedCoach.firstName} {selectedCoach.lastName}</p>
                  </div>
                  <div>
                         <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                        <p className="text-sm sm:text-base text-gray-900 break-all">{selectedCoach.email}</p>
                  </div>
                  <div>
                         <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                         <p className="text-sm sm:text-base text-gray-900">{selectedCoach.phone}</p>
                       </div>
                  </div>
                     <div className="space-y-3 sm:space-y-4">
                  <div>
                         <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Address</label>
                         <p className="text-sm sm:text-base text-gray-900">{selectedCoach.address || 'Not provided'}</p>
                  </div>
                  <div>
                         <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Driver License</label>
                         <p className="text-sm sm:text-base text-gray-900">{selectedCoach.driverLicense || 'Not provided'}</p>
                  </div>
                  <div>
                         <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Languages</label>
                         <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
                           {selectedCoach.languages.map((lang: string, index: number) => (
                             <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm font-medium">
                               {lang}
                             </span>
                           ))}
                         </div>
                       </div>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
                 <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                  <h4 className="text-base sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                     <FaGraduationCap className="text-blue-600 mr-2" />
                     Professional Information
                   </h4>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                       <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Teaching Domain</label>
                       <p className="text-sm sm:text-base text-gray-900 font-medium">{selectedCoach.duration}</p>
                  </div>
                  <div>
                       <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Years of Experience</label>
                       <p className="text-sm sm:text-base text-gray-900 font-medium">{selectedCoach.experience} years</p>
                  </div>
                </div>
              </div>

                                                  {/* Courses Section */}

                                 {/* Future Sections - Resume & Video */}
                 <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                  <h4 className="text-base sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                     <FaFileAlt className="text-blue-600 mr-2" />
                     Additional Materials
                   </h4>
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                     <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                       <div className="flex items-center mb-3">
                        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <FaFileAlt className="text-blue-600 text-base sm:text-xl" />
                         </div>
                         <div>
                           <p className="text-sm font-medium text-gray-700">Resume</p>
                           <p className="text-xs text-gray-500">PDF Document</p>
                         </div>
                       </div>
                       <div className="bg-gray-50 rounded-lg p-3 text-center">
                         <p className="text-xs text-gray-500">Not uploaded yet</p>
                       </div>
                     </div>
                     <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                       <div className="flex items-center mb-3">
                        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                          <FaPlay className="text-red-600 text-base sm:text-xl" />
                         </div>
                         <div>
                           <p className="text-sm font-medium text-gray-700">Introduction Video</p>
                           <p className="text-xs text-gray-500">MP4 Video</p>
                         </div>
                       </div>
                       {/* YouTube-style video thumbnail */}
                       <div className="relative bg-gray-200 rounded-lg overflow-hidden aspect-video">
                         <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 sm:w-16 sm:h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                            <FaPlay className="text-white text-base sm:text-xl ml-1" />
                           </div>
                         </div>
                         <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 sm:p-3">
                           <p className="text-white text-xs font-medium">Introduction Video</p>
                           <p className="text-white/80 text-xs">Not uploaded yet</p>
                         </div>
                       </div>
                     </div>
                   </div>
               </div>

              {/* Actions */}
              {selectedCoach.status === 'pending' && (
                  <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-200">
                    <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center">
                       <FaCheck className="text-green-600 mr-2" />
                       Review Decision
                     </h4>
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 justify-center">
                  <button
                    onClick={() => {
                      handleApprove(selectedCoach.id);
                      setShowDetails(false);
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
                         onClick={() => confirmReject(selectedCoach.id)}
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
                </div>
              )}
              </div>
            </div>
          </div>
                 </div>
       )}

       {/* Reject Confirmation Modal */}
       {showRejectConfirm && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTimes className="text-red-600 text-xl sm:text-2xl" />
               </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Reject Coach</h3>
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for rejecting this coach application.
              </p>
              
              <div className="mb-4">
                <label htmlFor="rejectReason" className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  Rejection Reason
                </label>
                <textarea
                  id="rejectReason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter the reason for rejection..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                 <button
                   onClick={() => {
                     setShowRejectConfirm(false);
                     setCoachToReject(null);
                  setRejectReason('');
                   }}
                className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium text-sm"
                 >
                   Cancel
                 </button>
                 <button
                   onClick={() => coachToReject && handleReject(coachToReject)}
                disabled={isLoading || !rejectReason.trim()}
                className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {isLoading ? <FaSpinner className="animate-spin" /> : 'Confirm Reject'}
                 </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 