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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Track your children's learning progress and upcoming sessions.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
            <span className="text-sm font-medium">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Modern Metrics Grid - Matching Coach Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Enrollments */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Enrollments</p>
              <p className="text-3xl font-bold mt-1">{enrollments.length}</p>
              <p className="text-blue-200 text-sm mt-1">+{activeEnrollments.length} active</p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <FaGraduationCap className="text-white text-xl" />
            </div>
          </div>
        </div>

        {/* Total Children */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Children</p>
              <p className="text-3xl font-bold mt-1">{parentData.children.length}</p>
              <p className="text-green-200 text-sm mt-1">Registered students</p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <FaUsers className="text-white text-xl" />
            </div>
          </div>
        </div>

        {/* Total Credits */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Credits</p>
              <p className="text-3xl font-bold mt-1">${totalCredits.toFixed(0)}</p>
              <p className="text-purple-200 text-sm mt-1">+{Math.round(totalCredits * 0.1)} this month</p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <FaDollarSign className="text-white text-xl" />
            </div>
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Rating</p>
              <p className="text-3xl font-bold mt-1">{averageRating}</p>
              <p className="text-orange-200 text-sm mt-1">Based on {totalReviews} reviews</p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <FaStar className="text-white text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => onTabChange('courses')}
            className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 group"
          >
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-200">
              <FaBook className="text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Browse Courses</p>
              <p className="text-sm text-gray-600">Find new courses for your children</p>
            </div>
          </button>

          <button 
            onClick={() => onTabChange('enrollments')}
            className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 group"
          >
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center group-hover:bg-green-600 transition-colors duration-200">
              <FaGraduationCap className="text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">View Progress</p>
              <p className="text-sm text-gray-600">Track enrollment progress</p>
            </div>
          </button>

          <button 
            onClick={() => onTabChange('enrollments')}
            className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200 group"
          >
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors duration-200">
              <FaCalendarAlt className="text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">View Schedule</p>
              <p className="text-sm text-gray-600">Check upcoming sessions</p>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Enrollments */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Active Enrollments</h2>
            <button 
              onClick={() => onTabChange('enrollments')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
            >
              View All <FaArrowRight className="ml-1 text-xs" />
            </button>
          </div>
          <div className="space-y-4">
            {activeEnrollments.slice(0, 3).map((enrollment) => (
              <div key={enrollment.id} className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{enrollment.courseTitle}</h3>
                    <p className="text-sm text-gray-600 mt-1">{enrollment.childName}</p>
                    <div className="flex items-center mt-2 space-x-4">
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
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{enrollment.progress}%</div>
                    <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
                      <div 
                        className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${enrollment.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Next: {formatDate(enrollment.nextSession)}</span>
                    <span>{enrollment.coachName}</span>
                  </div>
                </div>
              </div>
            ))}
            {activeEnrollments.length === 0 && (
              <div className="text-center py-8">
                <FaBook className="text-gray-300 text-4xl mx-auto mb-3" />
                <p className="text-gray-500">No active enrollments</p>
                <button 
                  onClick={() => onTabChange('courses')}
                  className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Browse courses
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Sessions</h2>
            <button 
              onClick={() => onTabChange('enrollments')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
            >
              View All <FaArrowRight className="ml-1 text-xs" />
            </button>
          </div>
          <div className="space-y-4">
            {upcomingSessions.slice(0, 3).map((session) => (
              <div key={session.id} className="p-4 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{session.courseTitle}</h3>
                    <p className="text-sm text-gray-600 mt-1">{session.childName}</p>
                    <p className="text-sm text-purple-600 mt-1">{session.topic}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDate(session.date)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatTime(session.time)}
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{session.coachName}</span>
                    <div className="flex space-x-2">
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200" aria-label="View session details">
                        <FaEye className="text-xs" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200" aria-label="Join session">
                        <FaPlay className="text-xs" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {upcomingSessions.length === 0 && (
              <div className="text-center py-8">
                <FaCalendarAlt className="text-gray-300 text-4xl mx-auto mb-3" />
                <p className="text-gray-500">No upcoming sessions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview; 