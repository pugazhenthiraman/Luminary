import React from 'react';
import { 
  FaGraduationCap, 
  FaCalendarAlt, 
  FaChartLine, 
  FaStar,
  FaBook,
  FaUserGraduate,
  FaClock,
  FaArrowRight,
  FaPlay,
  FaEye,
  FaCoins,
  FaUsers,
  FaDollarSign,
  FaTrophy
} from 'react-icons/fa';
import { Enrollment, Session } from '../data/mockData';

interface ParentUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
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

interface OverviewProps {
  parentData: ParentUser;
  enrollments: Enrollment[];
  upcomingSessions: Session[];
  onTabChange: (tab: string) => void;
}

const Overview: React.FC<OverviewProps> = ({ parentData, enrollments, upcomingSessions, onTabChange }) => {
  const activeEnrollments = enrollments.filter(e => e.status === 'active');
  const totalProgress = activeEnrollments.length > 0 
    ? Math.round(activeEnrollments.reduce((sum, e) => sum + e.progress, 0) / activeEnrollments.length)
    : 0;

  // Calculate total credits earned
  const totalCredits = enrollments.reduce((sum, enrollment) => {
    return sum + (enrollment.progress * 0.99);
  }, 0);

  // Calculate average rating (mock data)
  const averageRating = 4.8;
  const totalReviews = 23;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
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

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            Welcome back! Track your children's learning progress and upcoming sessions.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">

        </div>
      </div>

      {/* Modern Metrics Grid - Fully Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {/* Total Enrollments */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-blue-100 text-xs sm:text-sm font-medium">Total Enrollments</p>
              <p className="text-2xl sm:text-3xl font-bold mt-1">{enrollments.length}</p>
              <p className="text-blue-200 text-xs sm:text-sm mt-1">+{activeEnrollments.length} active</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center group-hover:bg-opacity-30 transition-all duration-300">
              <FaGraduationCap className="text-white text-lg sm:text-xl" />
            </div>
          </div>
        </div>

        {/* Total Children */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-green-100 text-xs sm:text-sm font-medium">Total Children</p>
              <p className="text-2xl sm:text-3xl font-bold mt-1">{parentData.children.length}</p>
              <p className="text-green-200 text-xs sm:text-sm mt-1">Registered students</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center group-hover:bg-opacity-30 transition-all duration-300">
              <FaUsers className="text-white text-lg sm:text-xl" />
            </div>
          </div>
        </div>

        {/* Total Credits */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-purple-100 text-xs sm:text-sm font-medium">Total Credits</p>
              <p className="text-2xl sm:text-3xl font-bold mt-1">${totalCredits.toFixed(0)}</p>
              <p className="text-purple-200 text-xs sm:text-sm mt-1">+{Math.round(totalCredits * 0.1)} this month</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center group-hover:bg-opacity-30 transition-all duration-300">
              <FaDollarSign className="text-white text-lg sm:text-xl" />
            </div>
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-orange-100 text-xs sm:text-sm font-medium">Rating</p>
              <p className="text-2xl sm:text-3xl font-bold mt-1">{averageRating}</p>
              <p className="text-orange-200 text-xs sm:text-sm mt-1">Based on {totalReviews} reviews</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center group-hover:bg-opacity-30 transition-all duration-300">
              <FaStar className="text-white text-lg sm:text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Responsive Grid */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <button 
            onClick={() => onTabChange('courses')}
            className="flex items-center space-x-3 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg transition-all duration-300 group hover:scale-105 hover:shadow-md"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-300">
              <FaBook className="text-white text-sm sm:text-base" />
            </div>
            <div className="text-left flex-1">
              <p className="font-medium text-gray-900 text-sm sm:text-base">Browse Courses</p>
              <p className="text-xs sm:text-sm text-gray-600">Find new courses for your children</p>
            </div>
          </button>

          <button 
            onClick={() => onTabChange('enrollments')}
            className="flex items-center space-x-3 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-lg transition-all duration-300 group hover:scale-105 hover:shadow-md"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover:from-green-600 group-hover:to-green-700 transition-all duration-300">
              <FaGraduationCap className="text-white text-sm sm:text-base" />
            </div>
            <div className="text-left flex-1">
              <p className="font-medium text-gray-900 text-sm sm:text-base">View Progress</p>
              <p className="text-xs sm:text-sm text-gray-600">Track enrollment progress</p>
            </div>
          </button>

          <button 
            onClick={() => onTabChange('schedule')}
            className="flex items-center space-x-3 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-lg transition-all duration-300 group hover:scale-105 hover:shadow-md sm:col-span-2 lg:col-span-1"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:from-purple-600 group-hover:to-purple-700 transition-all duration-300">
              <FaCalendarAlt className="text-white text-sm sm:text-base" />
            </div>
            <div className="text-left flex-1">
              <p className="font-medium text-gray-900 text-sm sm:text-base">View Schedule</p>
              <p className="text-xs sm:text-sm text-gray-600">Check upcoming sessions</p>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content Grid - Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Active Enrollments */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Active Enrollments</h2>
            <button 
              onClick={() => onTabChange('enrollments')}
              className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium flex items-center hover:scale-105 transition-all duration-200"
            >
              View All <FaArrowRight className="ml-1 text-xs" />
            </button>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {activeEnrollments.slice(0, 3).map((enrollment, index) => (
              <div 
                key={enrollment.id} 
                className="p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-300 hover:scale-[1.02] animate-in slide-in-from-left duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{enrollment.courseTitle}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">{enrollment.childName}</p>
                    <div className="flex items-center mt-2 space-x-3 sm:space-x-4">
                      <div className="flex items-center space-x-1">
                        <FaBook className="text-gray-400 text-xs" />
                        <span className="text-xs text-gray-500">
                          {enrollment.completedSessions}/{enrollment.totalSessions} sessions
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FaStar className="text-yellow-400 text-xs" />
                        <span className="text-xs text-gray-500">{enrollment.grade}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <div className="text-xs sm:text-sm font-medium text-gray-900">{enrollment.progress}%</div>
                    <div className="w-12 sm:w-16 h-2 bg-gray-200 rounded-full mt-1">
                      <div 
                        className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${enrollment.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Next: {formatDate(enrollment.nextSession)}</span>
                    <span className="truncate ml-2">{enrollment.coachName}</span>
                  </div>
                </div>
              </div>
            ))}
            {activeEnrollments.length === 0 && (
              <div className="text-center py-6 sm:py-8">
                <FaBook className="text-gray-300 text-3xl sm:text-4xl mx-auto mb-3" />
                <p className="text-gray-500 text-sm sm:text-base">No active enrollments</p>
                <button 
                  onClick={() => onTabChange('courses')}
                  className="mt-2 text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium hover:scale-105 transition-all duration-200"
                >
                  Browse courses
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Upcoming Sessions</h2>
            <button 
              onClick={() => onTabChange('schedule')}
              className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium flex items-center hover:scale-105 transition-all duration-200"
            >
              View All <FaArrowRight className="ml-1 text-xs" />
            </button>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {upcomingSessions.slice(0, 3).map((session, index) => (
              <div 
                key={session.id} 
                className="p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all duration-300 hover:scale-[1.02] animate-in slide-in-from-right duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{session.courseTitle}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">{session.childName}</p>
                    <p className="text-xs sm:text-sm text-purple-600 mt-1 truncate">{session.topic}</p>
                  </div>
                  <div className="text-right ml-3">
                    <div className="text-xs sm:text-sm font-medium text-gray-900">
                      {formatDate(session.date)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      {formatTime(session.time)}
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 truncate">{session.coachName}</span>
                    <div className="flex space-x-2 ml-2">
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:scale-110" aria-label="View session details">
                        <FaEye className="text-xs" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:scale-110" aria-label="Join session">
                        <FaPlay className="text-xs" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {upcomingSessions.length === 0 && (
              <div className="text-center py-6 sm:py-8">
                <FaCalendarAlt className="text-gray-300 text-3xl sm:text-4xl mx-auto mb-3" />
                <p className="text-gray-500 text-sm sm:text-base">No upcoming sessions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview; 