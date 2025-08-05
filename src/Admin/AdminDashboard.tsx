import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showSuccessToast, showErrorToast } from '../components/Toast';
import { FaCheck, FaTimes, FaEye, FaSignOutAlt, FaUser, FaEnvelope, FaPhone, FaGraduationCap, FaClock, FaCheckCircle, FaTimesCircle, FaSpinner, FaGlobe, FaPlay, FaFileAlt, FaBars } from 'react-icons/fa';
import { coachStorage, CoachData } from '../utils/coachStorage';
import AdminSidebar from './components/Sidebar';
import Overview from './components/Overview';
import CourseApproval from './components/CourseApproval';

// Add dummy coach data for demonstration
const dummyCoaches = [
  {
    id: 'coach_1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1-555-0123',
    password: 'hashed_password_123',
    driverLicense: 'DL123456789',
    experience: '5',
    duration: 'Mathematics',
    address: '123 Oak Street, New York, NY 10001',
    languages: ['English', 'Spanish'],
    courses: ['Algebra', 'Calculus', 'Geometry'],
    status: 'pending' as const,
    registrationDate: '2024-01-15T10:30:00.000Z',
    adminNotes: ''
  },
  {
    id: 'coach_2',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@email.com',
    phone: '+1-555-0124',
    password: 'hashed_password_456',
    driverLicense: 'DL987654321',
    experience: '8',
    duration: 'Computer Science',
    address: '456 Pine Avenue, San Francisco, CA 94102',
    languages: ['English', 'Mandarin'],
    courses: ['Python Programming', 'Web Development', 'Data Structures'],
    status: 'approved' as const,
    registrationDate: '2024-01-10T14:20:00.000Z',
    adminNotes: 'Excellent qualifications and experience'
  },
  {
    id: 'coach_3',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: 'emily.rodriguez@email.com',
    phone: '+1-555-0125',
    password: 'hashed_password_789',
    driverLicense: 'DL456789123',
    experience: '3',
    duration: 'English Literature',
    address: '789 Maple Drive, Chicago, IL 60601',
    languages: ['English', 'French'],
    courses: ['Creative Writing', 'Shakespeare', 'Modern Literature'],
    status: 'pending' as const,
    registrationDate: '2024-01-18T09:15:00.000Z',
    adminNotes: ''
  },
  {
    id: 'coach_4',
    firstName: 'David',
    lastName: 'Thompson',
    email: 'david.thompson@email.com',
    phone: '+1-555-0126',
    password: 'hashed_password_101',
    driverLicense: 'DL789123456',
    experience: '12',
    duration: 'Physics',
    address: '321 Elm Street, Boston, MA 02101',
    languages: ['English'],
    courses: ['Mechanics', 'Thermodynamics', 'Quantum Physics'],
    status: 'rejected' as const,
    registrationDate: '2024-01-05T16:45:00.000Z',
    adminNotes: 'Insufficient documentation provided'
  },
  {
    id: 'coach_5',
    firstName: 'Lisa',
    lastName: 'Wang',
    email: 'lisa.wang@email.com',
    phone: '+1-555-0127',
    password: 'hashed_password_202',
    driverLicense: 'DL321654987',
    experience: '6',
    duration: 'Chemistry',
    address: '654 Birch Road, Seattle, WA 98101',
    languages: ['English', 'Mandarin', 'Korean'],
    courses: ['Organic Chemistry', 'Biochemistry', 'Analytical Chemistry'],
    status: 'approved' as const,
    registrationDate: '2024-01-12T11:30:00.000Z',
    adminNotes: 'Strong academic background and teaching experience'
  },
  {
    id: 'coach_6',
    firstName: 'James',
    lastName: 'Wilson',
    email: 'james.wilson@email.com',
    phone: '+1-555-0128',
    password: 'hashed_password_303',
    driverLicense: 'DL147258369',
    experience: '4',
    duration: 'History',
    address: '987 Cedar Lane, Austin, TX 73301',
    languages: ['English', 'German'],
    courses: ['World History', 'American History', 'European History'],
    status: 'pending' as const,
    registrationDate: '2024-01-20T13:20:00.000Z',
    adminNotes: ''
  },
  {
    id: 'coach_7',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@email.com',
    phone: '+1-555-0129',
    password: 'hashed_password_404',
    driverLicense: 'DL963852741',
    experience: '7',
    duration: 'Biology',
    address: '147 Willow Way, Miami, FL 33101',
    languages: ['English', 'Spanish', 'Portuguese'],
    courses: ['Cell Biology', 'Genetics', 'Ecology'],
    status: 'pending' as const,
    registrationDate: '2024-01-22T08:45:00.000Z',
    adminNotes: ''
  },
  {
    id: 'coach_8',
    firstName: 'Robert',
    lastName: 'Anderson',
    email: 'robert.anderson@email.com',
    phone: '+1-555-0130',
    password: 'hashed_password_505',
    driverLicense: 'DL852963741',
    experience: '9',
    duration: 'Economics',
    address: '258 Spruce Street, Denver, CO 80201',
    languages: ['English', 'French', 'Italian'],
    courses: ['Microeconomics', 'Macroeconomics', 'Statistics'],
    status: 'approved' as const,
    registrationDate: '2024-01-08T15:10:00.000Z',
    adminNotes: 'PhD in Economics with excellent teaching record'
  },
  {
    id: 'coach_9',
    firstName: 'Jennifer',
    lastName: 'Davis',
    email: 'jennifer.davis@email.com',
    phone: '+1-555-0131',
    password: 'hashed_password_606',
    driverLicense: 'DL741852963',
    experience: '6',
    duration: 'Psychology',
    address: '369 Willow Road, Philadelphia, PA 19101',
    languages: ['English', 'German'],
    courses: ['Cognitive Psychology', 'Social Psychology', 'Clinical Psychology'],
    status: 'pending' as const,
    registrationDate: '2024-01-25T12:00:00.000Z',
    adminNotes: ''
  },
  {
    id: 'coach_10',
    firstName: 'Christopher',
    lastName: 'Miller',
    email: 'christopher.miller@email.com',
    phone: '+1-555-0132',
    password: 'hashed_password_707',
    driverLicense: 'DL369258147',
    experience: '4',
    duration: 'Art History',
    address: '741 Poplar Boulevard, San Antonio, TX 78201',
    languages: ['English', 'Italian'],
    courses: ['Renaissance Art', 'Modern Art', 'Art Theory'],
    status: 'approved' as const,
    registrationDate: '2024-01-06T10:15:00.000Z',
    adminNotes: 'Museum curator with teaching experience'
  },
  {
    id: 'coach_11',
    firstName: 'Amanda',
    lastName: 'Taylor',
    email: 'amanda.taylor@email.com',
    phone: '+1-555-0133',
    password: 'hashed_password_808',
    driverLicense: 'DL258147369',
    experience: '7',
    duration: 'Music Theory',
    address: '852 Cherry Street, San Diego, CA 92101',
    languages: ['English', 'French'],
    courses: ['Classical Music', 'Jazz Theory', 'Composition'],
    status: 'pending' as const,
    registrationDate: '2024-01-28T14:30:00.000Z',
    adminNotes: ''
  },
  {
    id: 'coach_12',
    firstName: 'Daniel',
    lastName: 'Brown',
    email: 'daniel.brown@email.com',
    phone: '+1-555-0134',
    password: 'hashed_password_909',
    driverLicense: 'DL147369258',
    experience: '5',
    duration: 'Philosophy',
    address: '963 Ash Avenue, Dallas, TX 75201',
    languages: ['English', 'Greek'],
    courses: ['Ethics', 'Logic', 'Metaphysics'],
    status: 'rejected' as const,
    registrationDate: '2024-01-16T09:45:00.000Z',
    adminNotes: 'Insufficient teaching experience'
  },
  {
    id: 'coach_13',
    firstName: 'Jessica',
    lastName: 'Martinez',
    email: 'jessica.martinez@email.com',
    phone: '+1-555-0135',
    password: 'hashed_password_1010',
    driverLicense: 'DL963147258',
    experience: '6',
    duration: 'Environmental Science',
    address: '159 Oak Drive, San Jose, CA 95101',
    languages: ['English', 'Spanish'],
    courses: ['Climate Change', 'Sustainability', 'Ecosystems'],
    status: 'pending' as const,
    registrationDate: '2024-01-30T11:20:00.000Z',
    adminNotes: ''
  },
  {
    id: 'coach_14',
    firstName: 'Kevin',
    lastName: 'Johnson',
    email: 'kevin.johnson@email.com',
    phone: '+1-555-0136',
    password: 'hashed_password_1111',
    driverLicense: 'DL852741963',
    experience: '8',
    duration: 'Computer Engineering',
    address: '741 Maple Lane, Portland, OR 97201',
    languages: ['English', 'Japanese'],
    courses: ['Digital Logic', 'Computer Architecture', 'Embedded Systems'],
    status: 'approved' as const,
    registrationDate: '2024-01-04T16:20:00.000Z',
    adminNotes: 'Industry experience in semiconductor design'
  },
  {
    id: 'coach_15',
    firstName: 'Rachel',
    lastName: 'Lee',
    email: 'rachel.lee@email.com',
    phone: '+1-555-0137',
    password: 'hashed_password_1212',
    driverLicense: 'DL741963852',
    experience: '3',
    duration: 'Linguistics',
    address: '963 Cedar Road, Las Vegas, NV 89101',
    languages: ['English', 'Korean', 'Chinese'],
    courses: ['Syntax', 'Phonetics', 'Language Acquisition'],
    status: 'rejected' as const,
    registrationDate: '2024-01-19T13:45:00.000Z',
    adminNotes: 'Application incomplete - missing references'
  },
  {
    id: 'coach_16',
    firstName: 'Thomas',
    lastName: 'Wilson',
    email: 'thomas.wilson@email.com',
    phone: '+1-555-0138',
    password: 'hashed_password_1313',
    driverLicense: 'DL963852741',
    experience: '10',
    duration: 'Mechanical Engineering',
    address: '147 Birch Street, Columbus, OH 43201',
    languages: ['English', 'German'],
    courses: ['Thermodynamics', 'Fluid Mechanics', 'Machine Design'],
    status: 'pending' as const,
    registrationDate: '2024-01-31T10:00:00.000Z',
    adminNotes: ''
  },
  {
    id: 'coach_17',
    firstName: 'Nicole',
    lastName: 'Garcia',
    email: 'nicole.garcia@email.com',
    phone: '+1-555-0139',
    password: 'hashed_password_1414',
    driverLicense: 'DL258963741',
    experience: '5',
    duration: 'Sociology',
    address: '258 Willow Avenue, Charlotte, NC 28201',
    languages: ['English', 'Spanish'],
    courses: ['Social Theory', 'Research Methods', 'Urban Sociology'],
    status: 'approved' as const,
    registrationDate: '2024-01-02T14:30:00.000Z',
    adminNotes: 'Strong research background'
  },
  {
    id: 'coach_18',
    firstName: 'Andrew',
    lastName: 'Clark',
    email: 'andrew.clark@email.com',
    phone: '+1-555-0140',
    password: 'hashed_password_1515',
    driverLicense: 'DL741258963',
    experience: '7',
    duration: 'Political Science',
    address: '369 Spruce Drive, Detroit, MI 48201',
    languages: ['English', 'French'],
    courses: ['International Relations', 'Comparative Politics', 'Political Theory'],
    status: 'rejected' as const,
    registrationDate: '2024-01-17T11:15:00.000Z',
    adminNotes: 'Background check pending'
  },
  {
    id: 'coach_19',
    firstName: 'Samantha',
    lastName: 'White',
    email: 'samantha.white@email.com',
    phone: '+1-555-0141',
    password: 'hashed_password_1616',
    driverLicense: 'DL963741258',
    experience: '4',
    duration: 'Anthropology',
    address: '741 Oak Lane, Memphis, TN 38101',
    languages: ['English', 'Portuguese'],
    courses: ['Cultural Anthropology', 'Archaeology', 'Ethnography'],
    status: 'pending' as const,
    registrationDate: '2024-01-29T15:45:00.000Z',
    adminNotes: ''
  },
  {
    id: 'coach_20',
    firstName: 'Ryan',
    lastName: 'Thompson',
    email: 'ryan.thompson@email.com',
    phone: '+1-555-0142',
    password: 'hashed_password_1717',
    driverLicense: 'DL258741963',
    experience: '6',
    duration: 'Geology',
    address: '852 Cherry Road, Baltimore, MD 21201',
    languages: ['English'],
    courses: ['Mineralogy', 'Structural Geology', 'Paleontology'],
    status: 'approved' as const,
    registrationDate: '2024-01-01T09:30:00.000Z',
    adminNotes: 'Field experience in multiple countries'
  }
];

const AdminDashboard = () => {
  const navigate = useNavigate();
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

  // Load coaches from dummy data
  const loadCoaches = () => {
    // Use dummy data instead of localStorage for demonstration
    setCoaches(dummyCoaches);
  };

  // Check if user is admin and load coaches
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/');
      return;
    }

    const userData = JSON.parse(user);
    if (userData.role !== 'ADMIN') {
      navigate('/');
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
  }, [navigate]);

  const handleApprove = async (coachId: string) => {
    setIsLoading(true);
    try {
      // Update the dummy data directly
      const updatedCoaches = coaches.map(coach => 
        coach.id === coachId ? { ...coach, status: 'approved' as const } : coach
      );
      setCoaches(updatedCoaches);
        showSuccessToast('Coach approved successfully!');
    } catch (error) {
      showErrorToast('Failed to approve coach');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (coachId: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCoaches(prev => prev.map(coach => 
        coach.id === coachId 
          ? { ...coach, status: 'rejected' as const, adminNotes: rejectReason || 'Rejected by admin' }
          : coach
      ));
      
      showSuccessToast('Coach rejected successfully');
      setShowRejectConfirm(false);
      setCoachToReject(null);
      setRejectReason('');
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
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Coach Approval</h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Review and manage coach applications</p>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                <div className="bg-blue-50 text-blue-700 px-3 sm:px-4 py-2 rounded-lg">
                  <span className="text-xs sm:text-sm font-medium">{filteredCoaches.length} coaches</span>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white rounded-xl shadow-md p-3 sm:p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                    <FaUser className="text-blue-600 text-lg sm:text-xl" />
                  </div>
                  <div className="ml-2 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Total Coaches</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{coaches.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-3 sm:p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
                    <FaClock className="text-yellow-600 text-lg sm:text-xl" />
                  </div>
                  <div className="ml-2 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">
                      {coaches.filter(c => c.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-3 sm:p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                    <FaCheck className="text-green-600 text-lg sm:text-xl" />
                  </div>
                  <div className="ml-2 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">
                      {coaches.filter(c => c.status === 'approved').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-3 sm:p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 sm:p-3 bg-red-100 rounded-lg">
                    <FaTimes className="text-red-600 text-lg sm:text-xl" />
                  </div>
                  <div className="ml-2 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Rejected</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">
                      {coaches.filter(c => c.status === 'rejected').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-200 mb-6 sm:mb-8">
              <div className="flex flex-col space-y-4">
                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-xs sm:text-sm ${
                      filter === 'all' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('pending')}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-xs sm:text-sm ${
                      filter === 'pending' 
                        ? 'bg-yellow-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setFilter('approved')}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-xs sm:text-sm ${
                      filter === 'approved' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Approved
                  </button>
                  <button
                    onClick={() => setFilter('rejected')}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-xs sm:text-sm ${
                      filter === 'rejected' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Rejected
                  </button>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search coaches..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Coaches List - Mobile Responsive */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Coach Applications</h2>
              </div>
              
              {/* Mobile Card View */}
              <div className="block sm:hidden">
                <div className="divide-y divide-gray-200">
                  {paginatedCoaches.map((coach, idx) => (
                    <div key={coach.id} className={`p-4 hover:bg-gray-50${idx !== 0 ? ' mt-4' : ''} rounded-xl shadow-sm bg-white`}> {/* Add margin and card styling */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <FaUser className="text-blue-600" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {coach.firstName} {coach.lastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {coach.registrationDate}
                            </div>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(coach.status)}`}>
                          {getStatusIcon(coach.status)}
                          <span className="ml-1 capitalize">{coach.status}</span>
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <FaEnvelope className="text-gray-400 text-xs flex-shrink-0" />
                          <span className="text-gray-600 truncate">{coach.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FaPhone className="text-gray-400 text-xs flex-shrink-0" />
                          <span className="text-gray-600">{coach.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FaGraduationCap className="text-gray-400 text-xs flex-shrink-0" />
                          <span className="text-gray-600 truncate">{coach.duration}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FaClock className="text-gray-400 text-xs flex-shrink-0" />
                          <span className="text-gray-600">{coach.experience} years experience</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleViewDetails(coach)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                          title="View Details"
                        >
                          <FaEye className="text-sm" />
                        </button>
                        {coach.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(coach.id)}
                              disabled={isLoading}
                              className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors duration-200 disabled:opacity-50"
                              title="Approve"
                            >
                              {isLoading ? <FaSpinner className="animate-spin text-sm" /> : <FaCheck className="text-sm" />}
                            </button>
                            <button
                              onClick={() => confirmReject(coach.id)}
                              disabled={isLoading}
                              className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200 disabled:opacity-50"
                              title="Reject"
                            >
                              {isLoading ? <FaSpinner className="animate-spin text-sm" /> : <FaTimes className="text-sm" />}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Coach
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Domain
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Experience
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedCoaches.map((coach) => (
                      <tr key={coach.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <FaUser className="text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {coach.firstName} {coach.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {coach.registrationDate}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{coach.email}</div>
                          <div className="text-sm text-gray-500">{coach.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{coach.duration}</div>
                          <div className="text-sm text-gray-500">{coach.languages.join(', ')}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{coach.experience} years</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(coach.status)}`}>
                            {getStatusIcon(coach.status)}
                            <span className="ml-1 capitalize">{coach.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewDetails(coach)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            {coach.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(coach.id)}
                                  disabled={isLoading}
                                  className="text-green-600 hover:text-green-900 p-1 disabled:opacity-50"
                                  title="Approve"
                                >
                                  {isLoading ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                                </button>
                                <button
                                  onClick={() => confirmReject(coach.id)}
                                  disabled={isLoading}
                                  className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50"
                                  title="Reject"
                                >
                                  {isLoading ? <FaSpinner className="animate-spin" /> : <FaTimes />}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination for both mobile and desktop */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      aria-label="Previous"
                    >
                      &lt;
                    </button>
                    {[...Array(totalPages)].map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(idx + 1)}
                        className={`px-3 py-2 border-t border-b border-gray-300 bg-white text-gray-700 hover:bg-blue-50 ${currentPage === idx + 1 ? 'font-bold bg-blue-100' : ''}`}
                        aria-current={currentPage === idx + 1 ? 'page' : undefined}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      aria-label="Next"
                    >
                      &gt;
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        );
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
                 <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                  <h4 className="text-base sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                     <FaGraduationCap className="text-blue-600 mr-2" />
                     Courses & Specializations
                   </h4>
                 {selectedCoach.courses.length > 0 ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                       {selectedCoach.courses.map((course: string, index: number) => (
                         <div key={index} className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm">
                       <div className="flex items-center">
                             <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-600 rounded-full mr-2 sm:mr-3"></div>
                             <p className="text-sm sm:text-base text-gray-900 font-medium">{course}</p>
                           </div>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 text-center">
                       <p className="text-sm sm:text-base text-gray-500 italic">No courses specified</p>
                     </div>
                   )}
                 </div>

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