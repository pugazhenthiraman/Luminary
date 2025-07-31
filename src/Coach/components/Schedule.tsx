import React, { useState, useMemo } from 'react';
import { 
  FaPlus, 
  FaClock, 
  FaEdit, 
  FaTrash, 
  FaCheck, 
  FaTimes, 
  FaCalendarAlt,
  FaVideo,
  FaPhone,
  FaUser,
  FaBook,
  FaCog,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaSearch,
  FaBell,
  FaClock as FaClockIcon,
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendar,
  FaDollarSign,
  FaUsers,
  FaSave,
  FaEye
} from 'react-icons/fa';

interface Session {
  id: number;
  student: string;
  studentEmail: string;
  course: string;
  date: string;
  time: string;
  duration: number; // in minutes
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  type: 'one-on-one' | 'group' | 'assessment';
  meetingLink?: string;
  notes?: string;
  price: number;
  paymentStatus: 'paid' | 'pending' | 'refunded';
}

interface Availability {
  day: string;
  slots: Array<{
    start: string;
    end: string;
    isAvailable: boolean;
  }>;
}

interface NewSession {
  student: string;
  studentEmail: string;
  course: string;
  date: string;
  time: string;
  duration: number;
  type: 'one-on-one' | 'group' | 'assessment';
  price: number;
  notes: string;
}

const Schedule: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [showAddSession, setShowAddSession] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'calendar' | 'list'>('calendar');

  // New session form state
  const [newSession, setNewSession] = useState<NewSession>({
    student: '',
    studentEmail: '',
    course: '',
    date: '',
    time: '',
    duration: 60,
    type: 'one-on-one',
    price: 0,
    notes: ''
  });

  // Mock data for sessions
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: 1,
      student: 'Emma Wilson',
      studentEmail: 'emma.wilson@email.com',
      course: 'Advanced Calculus',
      date: '2024-01-15',
      time: '14:00',
      duration: 60,
      status: 'confirmed',
      type: 'one-on-one',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      notes: 'Focus on derivatives and integrals',
      price: 75,
      paymentStatus: 'paid'
    },
    {
      id: 2,
      student: 'Michael Chen',
      studentEmail: 'michael.chen@email.com',
      course: 'Physics Fundamentals',
      date: '2024-01-15',
      time: '16:00',
      duration: 45,
      status: 'scheduled',
      type: 'group',
      price: 50,
      paymentStatus: 'paid'
    },
    {
      id: 3,
      student: 'Alex Rodriguez',
      studentEmail: 'alex.rodriguez@email.com',
      course: 'Algebra Mastery',
      date: '2024-01-16',
      time: '10:00',
      duration: 60,
      status: 'completed',
      type: 'one-on-one',
      notes: 'Excellent progress on quadratic equations',
      price: 75,
      paymentStatus: 'paid'
    },
    {
      id: 4,
      student: 'Sarah Johnson',
      studentEmail: 'sarah.johnson@email.com',
      course: 'Chemistry Basics',
      date: '2024-01-16',
      time: '15:30',
      duration: 90,
      status: 'cancelled',
      type: 'assessment',
      price: 100,
      paymentStatus: 'refunded'
    }
  ]);

  // Mock availability data
  const availability: Availability[] = [
    {
      day: 'Monday',
      slots: [
        { start: '09:00', end: '10:00', isAvailable: true },
        { start: '10:00', end: '11:00', isAvailable: true },
        { start: '11:00', end: '12:00', isAvailable: false },
        { start: '14:00', end: '15:00', isAvailable: true },
        { start: '15:00', end: '16:00', isAvailable: true },
        { start: '16:00', end: '17:00', isAvailable: true }
      ]
    },
    {
      day: 'Tuesday',
      slots: [
        { start: '09:00', end: '10:00', isAvailable: true },
        { start: '10:00', end: '11:00', isAvailable: true },
        { start: '11:00', end: '12:00', isAvailable: true },
        { start: '14:00', end: '15:00', isAvailable: false },
        { start: '15:00', end: '16:00', isAvailable: true },
        { start: '16:00', end: '17:00', isAvailable: true }
      ]
    }
  ];

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay };
  };

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getSessionsForDate = (date: string) => {
    return sessions.filter(session => session.date === date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'no-show': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'one-on-one': return <FaUser className="text-blue-500" />;
      case 'group': return <FaUsers className="text-green-500" />;
      case 'assessment': return <FaBook className="text-purple-500" />;
      default: return <FaUser className="text-gray-500" />;
    }
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const matchesStatus = filterStatus === 'all' || session.status === filterStatus;
      const matchesSearch = searchTerm === '' || 
        session.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.course.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [filterStatus, searchTerm, sessions]);

  const todaySessions = useMemo(() => {
    const today = formatDate(new Date());
    return sessions.filter(session => session.date === today);
  }, [sessions]);

  const upcomingSessions = useMemo(() => {
    const today = new Date();
    return sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= today && session.status !== 'completed';
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [sessions]);

  // Actions
  const handleAddSession = () => {
    if (newSession.student && newSession.course && newSession.date && newSession.time) {
      const session: Session = {
        id: Date.now(),
        ...newSession,
        status: 'scheduled',
        paymentStatus: 'pending'
      };
      setSessions([...sessions, session]);
      setNewSession({
        student: '',
        studentEmail: '',
        course: '',
        date: '',
        time: '',
        duration: 60,
        type: 'one-on-one',
        price: 0,
        notes: ''
      });
      setShowAddSession(false);
    }
  };

  const handleDeleteSession = (id: number) => {
    setSessions(sessions.filter(session => session.id !== id));
  };

  const handleStatusChange = (id: number, status: Session['status']) => {
    setSessions(sessions.map(session => 
      session.id === id ? { ...session, status } : session
    ));
  };

  const renderCompactCalendar = () => {
    if (viewMode === 'month') {
      const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
      const days = [];
      
      // Add empty cells for days before the first day of the month
      for (let i = 0; i < startingDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-20 p-1 border border-gray-200 bg-gray-50"></div>);
      }
      
      // Add days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateStr = formatDate(date);
        const daySessions = getSessionsForDate(dateStr);
        const isToday = formatDate(new Date()) === dateStr;
        const isSelected = formatDate(selectedDate) === dateStr;
        
        days.push(
          <div
            key={day}
            className={`h-20 p-1 border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
              isToday ? 'bg-blue-50 border-blue-300' : ''
            } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setSelectedDate(date)}
          >
            <div className="text-xs font-medium text-gray-800 mb-1">{day}</div>
            <div className="space-y-0.5">
              {daySessions.slice(0, 2).map(session => (
                <div
                  key={session.id}
                  className={`text-xs p-1 rounded truncate ${getStatusColor(session.status)}`}
                  title={`${session.student} - ${session.course}`}
                >
                  {session.student}
                </div>
              ))}
              {daySessions.length > 2 && (
                <div className="text-xs text-gray-500">+{daySessions.length - 2}</div>
              )}
            </div>
          </div>
        );
      }
      
      return (
        <div className="grid grid-cols-7 gap-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
            <div key={day} className="text-center py-2 text-xs font-medium text-gray-600 bg-gray-50">
              {day}
            </div>
          ))}
          {days}
        </div>
      );
    }
    
    return null;
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);
    
    return (
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map(day => {
          const dateStr = formatDate(day);
          const daySessions = getSessionsForDate(dateStr);
          const isToday = formatDate(new Date()) === dateStr;
          
          return (
            <div key={dateStr} className={`border rounded-lg p-2 ${isToday ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}>
              <div className="text-center mb-2">
                <div className="text-xs font-medium text-gray-600">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-sm font-bold ${isToday ? 'text-blue-600' : 'text-gray-800'}`}>
                  {day.getDate()}
                </div>
              </div>
              
              <div className="space-y-1">
                {daySessions.slice(0, 3).map(session => (
                  <div key={session.id} className="text-xs p-1 bg-white rounded border border-gray-200 truncate" title={`${session.student} - ${session.course}`}>
                    <div className="font-medium text-gray-800 truncate">{session.student}</div>
                    <div className="text-gray-500 truncate">{session.time}</div>
                  </div>
                ))}
                {daySessions.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">+{daySessions.length - 3}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Schedule</h2>
          <p className="text-sm text-gray-600">Manage your teaching sessions</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAvailability(true)}
            className="flex items-center space-x-2 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 text-sm"
          >
            <FaCog className="text-xs" />
            <span>Availability</span>
          </button>
          <button
            onClick={() => setShowAddSession(true)}
            className="flex items-center space-x-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm"
          >
            <FaPlus className="text-xs" />
          <span>Add Session</span>
        </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Today</p>
              <p className="text-lg font-bold text-gray-800">{todaySessions.length}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaCalendarDay className="text-blue-600 text-sm" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">This Week</p>
              <p className="text-lg font-bold text-gray-800">{upcomingSessions.length}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <FaCalendarWeek className="text-green-600 text-sm" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Completed</p>
              <p className="text-lg font-bold text-gray-800">
                {sessions.filter(s => s.status === 'completed').length}
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <FaCheck className="text-purple-600 text-sm" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Pending</p>
              <p className="text-lg font-bold text-gray-800">
                {sessions.filter(s => s.status === 'scheduled').length}
              </p>
            </div>
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <FaClockIcon className="text-orange-600 text-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
            activeTab === 'calendar' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Calendar
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
            activeTab === 'list' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          List View
        </button>
      </div>

      {activeTab === 'calendar' && (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          {/* Calendar Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const newDate = new Date(currentDate);
                  if (viewMode === 'month') {
                    newDate.setMonth(newDate.getMonth() - 1);
                  } else {
                    newDate.setDate(newDate.getDate() - 7);
                  }
                  setCurrentDate(newDate);
                }}
                className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors duration-200"
              >
                <FaChevronLeft className="text-sm" />
              </button>
              
              <h3 className="text-sm font-semibold text-gray-800">
                {currentDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric'
                })}
              </h3>
              
              <button
                onClick={() => {
                  const newDate = new Date(currentDate);
                  if (viewMode === 'month') {
                    newDate.setMonth(newDate.getMonth() + 1);
                  } else {
                    newDate.setDate(newDate.getDate() + 7);
                  }
                  setCurrentDate(newDate);
                }}
                className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors duration-200"
              >
                <FaChevronRight className="text-sm" />
              </button>
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setViewMode('week')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ${
                  viewMode === 'week' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Switch to week view"
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ${
                  viewMode === 'month' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Switch to month view"
              >
                Month
              </button>
            </div>
          </div>

          {/* Calendar View */}
          {viewMode === 'month' ? renderCompactCalendar() : renderWeekView()}
        </div>
      )}

      {activeTab === 'list' && (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          {/* List Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-4">
            <h3 className="text-sm font-semibold text-gray-800">All Sessions</h3>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-6 pr-3 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                title="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </select>
            </div>
          </div>
          
          {/* Sessions List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredSessions.map(session => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    {getTypeIcon(session.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-semibold text-gray-800 truncate">{session.student}</h4>
                      <span className="text-xs text-gray-500">{session.studentEmail}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3 text-xs text-gray-600">
                      <span className="flex items-center space-x-1">
                        <FaBook className="text-xs" />
                        <span className="truncate">{session.course}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <FaCalendarAlt className="text-xs" />
                        <span>{new Date(session.date).toLocaleDateString()}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <FaClock className="text-xs" />
                        <span>{session.time} ({session.duration}min)</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <FaDollarSign className="text-xs" />
                        <span>${session.price}</span>
                      </span>
                    </div>
                    
                    {session.notes && (
                      <p className="text-xs text-gray-500 mt-1 italic truncate">"{session.notes}"</p>
                    )}
        </div>
      </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}>
                    {session.status}
                  </span>
                  
                  <div className="flex items-center space-x-1">
                    {session.meetingLink && (
                      <a
                        href={session.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors duration-200"
                        title="Join meeting"
                      >
                        <FaVideo className="text-xs" />
                      </a>
                    )}
                    
                    <button 
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors duration-200"
                      title="Edit session"
                    >
                      <FaEdit className="text-xs" />
                    </button>
                    
                    <button 
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors duration-200"
                      title="Delete session"
                      onClick={() => handleDeleteSession(session.id)}
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredSessions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FaCalendarAlt className="text-2xl mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No sessions found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Session Modal */}
      {showAddSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Session</h3>
            
        <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                <input
                  type="text"
                  value={newSession.student}
                  onChange={(e) => setNewSession({...newSession, student: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter student name"
                  title="Student name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Email</label>
                <input
                  type="email"
                  value={newSession.studentEmail}
                  onChange={(e) => setNewSession({...newSession, studentEmail: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter student email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <input
                  type="text"
                  value={newSession.course}
                  onChange={(e) => setNewSession({...newSession, course: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter course name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newSession.date}
                    onChange={(e) => setNewSession({...newSession, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={newSession.time}
                    onChange={(e) => setNewSession({...newSession, time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    value={newSession.duration}
                    onChange={(e) => setNewSession({...newSession, duration: parseInt(e.target.value) || 60})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="15"
                    step="15"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    value={newSession.price}
                    onChange={(e) => setNewSession({...newSession, price: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Type</label>
                <select
                  value={newSession.type}
                  onChange={(e) => setNewSession({...newSession, type: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="one-on-one">One-on-One</option>
                  <option value="group">Group</option>
                  <option value="assessment">Assessment</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={newSession.notes}
                  onChange={(e) => setNewSession({...newSession, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Add session notes..."
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddSession(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddSession}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                Add Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Availability Modal */}
      {showAvailability && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Manage Availability</h3>
            
            <div className="space-y-4">
              {availability.map((day) => (
                <div key={day.day} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3">{day.day}</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {day.slots.map((slot, index) => (
                      <button
                        key={index}
                        className={`p-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                          slot.isAvailable
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {slot.start} - {slot.end}
                      </button>
                    ))}
              </div>
            </div>
          ))}
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAvailability(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200">
                Save Availability
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule; 
