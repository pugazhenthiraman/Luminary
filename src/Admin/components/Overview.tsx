import React from 'react';
import { 
  FaUsers, 
  FaBook, 
  FaUserCheck, 
  FaClock, 
  FaChartLine, 
  FaArrowUp, 
  FaArrowDown,
  FaEye,
  FaCalendarAlt,
  FaStar,
  FaDollarSign,
  FaCheck,
  FaClipboardList
} from 'react-icons/fa';

interface DashboardMetric {
  title: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ComponentType<any>;
  color: string;
}

interface RecentActivity {
  id: string;
  type: 'coach_approved' | 'course_approved' | 'course_rejected' | 'new_registration';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
}

const Overview: React.FC = () => {
  const metrics: DashboardMetric[] = [
    {
      title: 'Total Coaches',
      value: '1,247',
      change: 12.5,
      changeType: 'increase',
      icon: FaUsers,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Courses',
      value: '892',
      change: 8.2,
      changeType: 'increase',
      icon: FaBook,
      color: 'bg-green-500'
    },
    {
      title: 'Pending Approvals',
      value: '23',
      change: -5.1,
      changeType: 'decrease',
      icon: FaClock,
      color: 'bg-yellow-500'
    },
    {
      title: 'Total Revenue',
      value: '$45,230',
      change: 15.3,
      changeType: 'increase',
      icon: FaDollarSign,
      color: 'bg-purple-500'
    }
  ];

  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'course_approved',
      title: 'Course Approved',
      description: 'Advanced JavaScript Programming by Sarah Johnson',
      timestamp: '2 hours ago',
      user: 'Sarah Johnson'
    },
    {
      id: '2',
      type: 'coach_approved',
      title: 'Coach Approved',
      description: 'Michael Chen - Creative Writing Workshop',
      timestamp: '4 hours ago',
      user: 'Michael Chen'
    },
    {
      id: '3',
      type: 'course_rejected',
      title: 'Course Rejected',
      description: 'Basic Math Fundamentals by David Wilson',
      timestamp: '6 hours ago',
      user: 'David Wilson'
    },
    {
      id: '4',
      type: 'new_registration',
      title: 'New Coach Registration',
      description: 'Emily Rodriguez - Music Theory Expert',
      timestamp: '8 hours ago',
      user: 'Emily Rodriguez'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'coach_approved':
        return <FaUserCheck className="text-green-600" />;
      case 'course_approved':
        return <FaBook className="text-blue-600" />;
      case 'course_rejected':
        return <FaBook className="text-red-600" />;
      case 'new_registration':
        return <FaUsers className="text-purple-600" />;
      default:
        return <FaEye className="text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'coach_approved':
        return 'bg-green-50 border-green-200';
      case 'course_approved':
        return 'bg-blue-50 border-blue-200';
      case 'course_rejected':
        return 'bg-red-50 border-red-200';
      case 'new_registration':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Welcome back! Here's what's happening with your platform.</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-md p-3 sm:p-6 border border-gray-200">
              <div className="flex items-center">
                <div className={`p-2 sm:p-3 ${metric.color} rounded-lg`}>
                  <Icon className="text-white text-lg sm:text-xl" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{metric.value}</p>
                  <div className="flex items-center mt-1">
                    {metric.changeType === 'increase' ? (
                      <FaArrowUp className="text-green-500 text-xs" />
                    ) : (
                      <FaArrowDown className="text-red-500 text-xs" />
                    )}
                    <span className={`text-xs font-medium ml-1 ${
                      metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {Math.abs(metric.change)}%
                    </span>
                    <span className="text-xs text-gray-500 ml-1">from last month</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activities and Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-200">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Activities</h2>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All
              </button>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className={`flex items-start space-x-3 p-3 sm:p-4 rounded-lg border ${getActivityColor(activity.type)}`}>
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{activity.title}</h3>
                      <span className="text-xs text-gray-500 flex-shrink-0">{activity.timestamp}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{activity.description}</p>
                    {activity.user && (
                      <p className="text-xs text-gray-500 mt-1">by {activity.user}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Quick Stats</h2>
            
            <div className="space-y-4 sm:space-y-6">
              {/* Today's Approvals */}
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-blue-900">Today's Approvals</p>
                    <p className="text-2xl font-bold text-blue-600">8</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <FaCheck className="text-blue-600 text-lg" />
                  </div>
                </div>
              </div>

              {/* Pending Reviews */}
              <div className="bg-yellow-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-yellow-900">Pending Reviews</p>
                    <p className="text-2xl font-bold text-yellow-600">15</p>
                  </div>
                  <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
                    <FaClock className="text-yellow-600 text-lg" />
                  </div>
                </div>
              </div>

              {/* Average Rating */}
              <div className="bg-green-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-green-900">Average Rating</p>
                    <div className="flex items-center mt-1">
                      <p className="text-2xl font-bold text-green-600 mr-2">4.8</p>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar key={star} className="text-yellow-400 text-sm" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                    <FaStar className="text-green-600 text-lg" />
                  </div>
                </div>
              </div>

              {/* Revenue This Month */}
              <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-purple-900">Revenue This Month</p>
                    <p className="text-2xl font-bold text-purple-600">$12,450</p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                    <FaDollarSign className="text-purple-600 text-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {/* Active Coaches */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600">Active Coaches</p>
              <p className="text-2xl font-bold text-gray-900">1,156</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg flex-shrink-0">
              <FaUsers className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        {/* Total Courses */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">892</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
              <FaBook className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">87%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg flex-shrink-0">
              <FaChartLine className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>

        {/* Support Tickets */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600">Support Tickets</p>
              <p className="text-2xl font-bold text-gray-900">23</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg flex-shrink-0">
              <FaClipboardList className="text-orange-600 text-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview; 