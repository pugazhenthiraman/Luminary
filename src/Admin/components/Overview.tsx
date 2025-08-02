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
  FaDollarSign
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your platform.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
            <span className="text-sm font-medium">Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                </div>
                <div className={`w-12 h-12 ${metric.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="text-white text-xl" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                {metric.changeType === 'increase' ? (
                  <FaArrowUp className="text-green-500 text-sm mr-1" />
                ) : (
                  <FaArrowDown className="text-red-500 text-sm mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.abs(metric.change)}%
                </span>
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className={`p-4 rounded-lg border ${getActivityColor(activity.type)}`}>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">{activity.timestamp}</span>
                      {activity.user && (
                        <span className="text-xs text-gray-500">by {activity.user}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Stats</h2>
          <div className="space-y-6">
            {/* Approval Rate */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FaUserCheck className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Approval Rate</p>
                  <p className="text-xs text-gray-500">Last 30 days</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">87.5%</p>
                <p className="text-xs text-green-600">+2.3%</p>
              </div>
            </div>

            {/* Average Rating */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <FaStar className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Avg. Course Rating</p>
                  <p className="text-xs text-gray-500">All courses</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">4.6</p>
                <p className="text-xs text-green-600">+0.2</p>
              </div>
            </div>

            {/* Active Sessions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaCalendarAlt className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Active Sessions</p>
                  <p className="text-xs text-gray-500">Currently running</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">156</p>
                <p className="text-xs text-green-600">+12</p>
              </div>
            </div>

            {/* Revenue Growth */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FaChartLine className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Revenue Growth</p>
                  <p className="text-xs text-gray-500">This month</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">+15.3%</p>
                <p className="text-xs text-green-600">$6,420</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 group">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-200">
              <FaUserCheck className="text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Review Coach Applications</p>
              <p className="text-sm text-gray-600">12 pending approvals</p>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 group">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center group-hover:bg-green-600 transition-colors duration-200">
              <FaBook className="text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Review Course Submissions</p>
              <p className="text-sm text-gray-600">8 pending reviews</p>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200 group">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors duration-200">
              <FaChartLine className="text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">View Analytics</p>
              <p className="text-sm text-gray-600">Detailed insights</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Overview; 