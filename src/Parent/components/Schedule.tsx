import React, { useState, ReactElement } from 'react';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaUser, 
  FaCheckCircle,
  FaTimes,
  FaExclamationTriangle,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaList,
  FaCalendar,
  FaUserGraduate,
  FaChartLine,
  FaPercentage,
  FaCalendarCheck,
  FaCalendarTimes,
  FaClock as FaClockIcon,
  FaComments,
  FaBook
} from 'react-icons/fa';
import { Session } from '../data/mockData';

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

interface AttendanceRecord {
  id: string;
  childId: string;
  childName: string;
  courseTitle: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  time: string;
  duration: string;
  coachName: string;
  notes?: string;
}

interface AttendanceProps {
  schedule: Session[];
  parentData: ParentUser;
}

const Attendance: React.FC<AttendanceProps> = ({ schedule, parentData }) => {
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceRecord | null>(null);
  const [selectedChild, setSelectedChild] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Convert sessions to attendance records (mock data)
  const attendanceRecords: AttendanceRecord[] = schedule.map(session => ({
    id: session.id,
    childId: parentData.children.find(c => `${c.firstName} ${c.lastName}` === session.childName)?.id || '',
    childName: session.childName,
    courseTitle: session.courseTitle,
    date: session.date,
    status: session.status === 'completed' ? 'present' : 
           session.status === 'cancelled' ? 'absent' : 
           Math.random() > 0.8 ? 'late' : 'present',
    time: session.time,
    duration: session.duration,
    coachName: session.coachName,
    notes: Math.random() > 0.7 ? 'Good participation today!' : undefined
  }));

  const filteredAttendance = attendanceRecords.filter(record => {
    const matchesChild = selectedChild === 'all' || record.childId === selectedChild;
    const matchesDate = selectedDate === 'all' || record.date === selectedDate;
    return matchesChild && matchesDate;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'late':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'excused':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <FaCheckCircle className="text-green-600" />;
      case 'absent':
        return <FaTimes className="text-red-600" />;
      case 'late':
        return <FaExclamationTriangle className="text-yellow-600" />;
      case 'excused':
        return <FaCalendarTimes className="text-blue-600" />;
      default:
        return <FaClockIcon className="text-gray-600" />;
    }
  };

  const handleViewDetails = (record: AttendanceRecord) => {
    setSelectedAttendance(record);
  };

  // Calculate attendance statistics
  const getAttendanceStats = () => {
    const totalSessions = attendanceRecords.length;
    const present = attendanceRecords.filter(r => r.status === 'present').length;
    const absent = attendanceRecords.filter(r => r.status === 'absent').length;
    const late = attendanceRecords.filter(r => r.status === 'late').length;
    const excused = attendanceRecords.filter(r => r.status === 'excused').length;
    
    return {
      total: totalSessions,
      present,
      absent,
      late,
      excused,
      attendanceRate: totalSessions > 0 ? Math.round((present / totalSessions) * 100) : 0
    };
  };

  const stats = getAttendanceStats();

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getAttendanceForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return attendanceRecords.filter(record => record.date === dateString);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days: ReactElement[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-1 sm:p-2"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const attendanceForDay = getAttendanceForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate === date.toISOString().split('T')[0];

      days.push(
        <div
          key={day}
          className={`p-1 sm:p-2 min-h-[80px] sm:min-h-[120px] border border-gray-200 hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${
            isToday ? 'bg-blue-50 border-blue-300' : ''
          } ${isSelected ? 'bg-indigo-50 border-indigo-300' : ''}`}
          onClick={() => setSelectedDate(date.toISOString().split('T')[0])}
        >
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <span className={`text-xs sm:text-sm font-medium ${
              isToday ? 'text-blue-600' : isSelected ? 'text-indigo-600' : 'text-gray-900'
            }`}>
              {day}
            </span>
            {attendanceForDay.length > 0 && (
              <span className="bg-indigo-100 text-indigo-800 text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded-full">
                {attendanceForDay.length}
              </span>
            )}
          </div>
          
          <div className="space-y-0.5 sm:space-y-1">
            {attendanceForDay.slice(0, 2).map((record) => (
              <div
                key={record.id}
                className={`text-xs p-0.5 sm:p-1 rounded border ${
                  record.status === 'present' ? 'bg-green-100 border-green-200' :
                  record.status === 'absent' ? 'bg-red-100 border-red-200' :
                  record.status === 'late' ? 'bg-yellow-100 border-yellow-200' :
                  'bg-blue-100 border-blue-200'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails(record);
                }}
              >
                <div className="font-medium truncate text-xs">{record.courseTitle}</div>
                <div className="text-gray-600 text-xs">{record.status}</div>
              </div>
            ))}
            {attendanceForDay.length > 2 && (
              <div className="text-xs text-gray-500 text-center">
                +{attendanceForDay.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  // Get unique dates for filter
  const uniqueDates = [...new Set(attendanceRecords.map(r => r.date))].sort();

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Attendance
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Track your children's attendance and participation in learning sessions.
          </p>
        </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:space-x-3">
            <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-sm font-medium px-3 sm:px-4 py-2 rounded-full border border-green-200">
            {stats.attendanceRate}% Attendance Rate
          </span>
          <div className="flex bg-white border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('calendar')}
                className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200 ${
                viewMode === 'calendar'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
                <FaCalendar className="inline mr-1 text-xs sm:text-sm" />
                <span className="hidden sm:inline">Calendar</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
                className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200 ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
                <FaList className="inline mr-1 text-xs sm:text-sm" />
                <span className="hidden sm:inline">List</span>
            </button>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 sm:p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs sm:text-sm font-medium">Present</p>
              <p className="text-xl sm:text-3xl font-bold mt-1">{stats.present}</p>
              <p className="text-green-200 text-xs sm:text-sm mt-1">Sessions attended</p>
            </div>
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <FaCheckCircle className="text-white text-sm sm:text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-3 sm:p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-xs sm:text-sm font-medium">Absent</p>
              <p className="text-xl sm:text-3xl font-bold mt-1">{stats.absent}</p>
              <p className="text-red-200 text-xs sm:text-sm mt-1">Sessions missed</p>
            </div>
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <FaTimes className="text-white text-sm sm:text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-3 sm:p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-xs sm:text-sm font-medium">Late</p>
              <p className="text-xl sm:text-3xl font-bold mt-1">{stats.late}</p>
              <p className="text-yellow-200 text-xs sm:text-sm mt-1">Late arrivals</p>
            </div>
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <FaExclamationTriangle className="text-white text-sm sm:text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 sm:p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs sm:text-sm font-medium">Attendance Rate</p>
              <p className="text-xl sm:text-3xl font-bold mt-1">{stats.attendanceRate}%</p>
              <p className="text-blue-200 text-xs sm:text-sm mt-1">Overall performance</p>
            </div>
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <FaPercentage className="text-white text-sm sm:text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Child Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Child</label>
            <select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              title="Filter by child"
            >
              <option value="all">All Children</option>
              {parentData.children.map(child => (
                <option key={child.id} value={child.id}>
                  {child.firstName} {child.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              title="Filter by date"
            >
              <option value="all">All Dates</option>
              {uniqueDates.map(date => (
                <option key={date} value={date}>
                  {formatDate(date)}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedChild('all');
                setSelectedDate('all');
              }}
              className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Calendar Header */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center justify-center sm:justify-start space-x-2 sm:space-x-4">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors duration-200"
                  aria-label="Previous month"
                >
                  <FaChevronLeft className="text-sm sm:text-base" />
                </button>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 text-center sm:text-left">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors duration-200"
                  aria-label="Next month"
                >
                  <FaChevronRight className="text-sm sm:text-base" />
                </button>
              </div>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-3 sm:px-4 py-2 text-sm text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors duration-200"
              >
                Today
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-2 sm:p-6">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2 sm:mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-3 sm:space-y-4">
          {filteredAttendance.map((record, index) => (
            <div 
              key={record.id} 
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden animate-in slide-in-from-left duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Attendance Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                      <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                        <div className={`p-2 rounded-lg ${getStatusColor(record.status)}`}>
                          {getStatusIcon(record.status)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 line-clamp-2 break-words">
                            {record.courseTitle}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">{record.childName}</p>
                        </div>
                      </div>
                      <span className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(record.status)} flex-shrink-0`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </div>

                    {/* Attendance Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center space-x-3 text-sm">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FaCalendarAlt className="text-blue-600 text-xs sm:text-sm" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-gray-500 text-xs sm:text-sm">Date</span>
                            <div className="font-medium text-gray-900 text-sm break-words">{formatDate(record.date)}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FaClock className="text-green-600 text-xs sm:text-sm" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-gray-500 text-xs sm:text-sm">Time</span>
                            <div className="font-medium text-gray-900 text-sm">{formatTime(record.time)}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FaClock className="text-purple-600 text-xs sm:text-sm" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-gray-500 text-xs sm:text-sm">Duration</span>
                            <div className="font-medium text-gray-900 text-sm">{record.duration}</div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center space-x-3 text-sm">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FaUser className="text-indigo-600 text-xs sm:text-sm" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-gray-500 text-xs sm:text-sm">Coach</span>
                            <div className="font-medium text-gray-900 text-sm truncate">{record.coachName}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FaUserGraduate className="text-orange-600 text-xs sm:text-sm" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-gray-500 text-xs sm:text-sm">Student</span>
                            <div className="font-medium text-gray-900 text-sm truncate">{record.childName}</div>
                          </div>
                        </div>
                        {record.notes && (
                          <div className="flex items-center space-x-3 text-sm">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FaComments className="text-teal-600 text-xs sm:text-sm" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-gray-500 text-xs sm:text-sm">Notes</span>
                              <div className="font-medium text-gray-900 text-sm break-words">{record.notes}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleViewDetails(record)}
                        className="px-3 sm:px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200 flex items-center space-x-2"
                      >
                        <FaEye className="text-sm" />
                        <span>Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Attendance Records */}
      {filteredAttendance.length === 0 && (
        <div className="text-center py-8 sm:py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <FaCalendarCheck className="text-indigo-600 text-xl sm:text-2xl" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">No attendance records found</h3>
          <p className="text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base">
            {attendanceRecords.length === 0 
              ? "No attendance records are available yet. Attendance will be tracked once your children start attending sessions."
              : "No attendance records match your current filters. Try adjusting your search criteria."
            }
          </p>
        </div>
      )}

      {/* Attendance Detail Modal */}
      {selectedAttendance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl mx-2 sm:mx-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 sm:p-8 rounded-t-2xl sm:rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-3xl font-bold mb-2 truncate">Attendance Record</h2>
                  <p className="text-indigo-100 text-sm sm:text-base">Detailed attendance information for this session</p>
                </div>
                <button
                  onClick={() => setSelectedAttendance(null)}
                  className="p-2 sm:p-3 text-white hover:bg-white hover:bg-opacity-20 transition-colors duration-200 rounded-xl flex-shrink-0"
                  aria-label="Close modal"
                >
                  <FaTimes className="text-lg sm:text-xl" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-8">
              {/* Course & Student Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
                {/* Course Information */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <FaBook className="text-white text-lg sm:text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">Course Details</h3>
                      <p className="text-gray-600 text-sm">Session information</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-blue-100">
                      <span className="text-gray-600 font-medium text-sm">Course Title:</span>
                      <span className="font-bold text-gray-900 text-sm break-words">{selectedAttendance.courseTitle}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-blue-100">
                      <span className="text-gray-600 font-medium text-sm">Coach:</span>
                      <span className="font-bold text-gray-900 text-sm truncate">{selectedAttendance.coachName}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 font-medium text-sm">Duration:</span>
                      <span className="font-bold text-gray-900 text-sm">{selectedAttendance.duration}</span>
                    </div>
                  </div>
                </div>

                {/* Student Information */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-green-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <FaUserGraduate className="text-white text-lg sm:text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">Student Details</h3>
                      <p className="text-gray-600 text-sm">Attendance information</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-green-100">
                      <span className="text-gray-600 font-medium text-sm">Student Name:</span>
                      <span className="font-bold text-gray-900 text-sm truncate">{selectedAttendance.childName}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-green-100">
                      <span className="text-gray-600 font-medium text-sm">Date:</span>
                      <span className="font-bold text-gray-900 text-sm break-words">{formatDate(selectedAttendance.date)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 font-medium text-sm">Time:</span>
                      <span className="font-bold text-gray-900 text-sm">{formatTime(selectedAttendance.time)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance Status */}
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-100 mb-6 sm:mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    {getStatusIcon(selectedAttendance.status)}
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Attendance Status</h3>
                    <p className="text-gray-600 text-sm">Session participation record</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <span className="text-gray-600 font-medium text-sm">Status:</span>
                    <span className={`ml-3 px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-bold rounded-full border ${getStatusColor(selectedAttendance.status)}`}>
                      {selectedAttendance.status.charAt(0).toUpperCase() + selectedAttendance.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-center sm:text-right">
                    <div className="text-lg sm:text-2xl font-bold text-purple-600">
                      {selectedAttendance.status === 'present' ? '✓ Present' : 
                       selectedAttendance.status === 'absent' ? '✗ Absent' :
                       selectedAttendance.status === 'late' ? '⚠ Late' : '📅 Excused'}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      {selectedAttendance.status === 'present' ? 'Successfully attended' :
                       selectedAttendance.status === 'absent' ? 'Did not attend' :
                       selectedAttendance.status === 'late' ? 'Arrived late' : 'Absence excused'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Coach Notes */}
              {selectedAttendance.notes && (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-yellow-100 mb-6 sm:mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                      <FaComments className="text-white text-lg sm:text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">Coach Notes</h3>
                      <p className="text-gray-600 text-sm">Feedback and observations</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-3 sm:p-4 border border-yellow-200">
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base break-words">{selectedAttendance.notes}</p>
                  </div>
                </div>
              )}

              {/* Session Summary */}
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 mb-6 sm:mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-500 rounded-xl flex items-center justify-center">
                    <FaCalendarAlt className="text-white text-lg sm:text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Session Summary</h3>
                    <p className="text-gray-600 text-sm">Key session details</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="text-center p-3 sm:p-4 bg-white rounded-xl border border-gray-200">
                    <div className="text-lg sm:text-2xl font-bold text-blue-600 mb-1 break-words">{formatDate(selectedAttendance.date)}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Session Date</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-white rounded-xl border border-gray-200">
                    <div className="text-lg sm:text-2xl font-bold text-green-600 mb-1">{formatTime(selectedAttendance.time)}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Start Time</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-white rounded-xl border border-gray-200">
                    <div className="text-lg sm:text-2xl font-bold text-purple-600 mb-1">{selectedAttendance.duration}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Duration</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setSelectedAttendance(null)}
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold text-sm sm:text-lg"
                >
                  Close Details
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement contact coach functionality
                    console.log('Contacting coach for:', selectedAttendance.courseTitle);
                  }}
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold text-sm sm:text-lg shadow-lg hover:shadow-xl"
                >
                  Contact Coach
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance; 