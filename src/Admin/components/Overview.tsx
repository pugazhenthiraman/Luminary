import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FaClipboardList,
  FaSpinner
} from 'react-icons/fa';
import { getDashboard, getAdminActivities } from '../../api/admin';

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

interface DashboardData {
  totalUsers: number;
  totalCoaches: number;
  totalCourses: number;
  totalSessions: number;
  totalRevenue: number;
  pendingCoachApprovals: number;
  pendingCourseApprovals: number;
  recentActivity: any[];
  monthlyStats: {
    newUsers: number;
    newCoaches: number;
    newCourses: number;
    revenue: number;
  };
}

interface OverviewProps {
  onTabChange?: (tab: string) => void;
}

const Overview: React.FC<OverviewProps> = ({ onTabChange }) => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getDashboard();
      const data = response.data?.data?.dashboard || response.data?.dashboard;
      
      if (data) {
        setDashboardData(data);
        
        // Process recent activities
        const activities: RecentActivity[] = (data.recentActivity || []).slice(0, 4).map((activity: any) => ({
          id: activity.id.toString(),
          type: activity.status === 'APPROVED' ? 'coach_approved' : 'new_registration',
          title: activity.status === 'APPROVED' ? 'Coach Approved' : 'New Coach Registration',
          description: `${activity.user?.firstName || ''} ${activity.user?.lastName || ''}`,
          timestamp: formatTimestamp(activity.createdAt),
          user: 'Admin' // Show Admin as the approver, not the coach's name
        }));
        
        setRecentActivities(activities);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculatePercentageChange = (current: number, monthly: number): number => {
    if (!monthly || monthly === 0) return 0;
    return Number(((monthly / current) * 100).toFixed(1));
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  };

  const metrics: DashboardMetric[] = dashboardData ? [
    {
      title: 'Total Coaches',
      value: formatNumber(dashboardData.totalCoaches || 0),
      change: calculatePercentageChange(dashboardData.totalCoaches, dashboardData.monthlyStats?.newCoaches || 0),
      changeType: 'increase',
      icon: FaUsers,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Courses',
      value: formatNumber(dashboardData.totalCourses || 0),
      change: calculatePercentageChange(dashboardData.totalCourses, dashboardData.monthlyStats?.newCourses || 0),
      changeType: 'increase',
      icon: FaBook,
      color: 'bg-green-500'
    },
    {
      title: 'Pending Approvals',
      value: formatNumber((dashboardData.pendingCoachApprovals || 0) + (dashboardData.pendingCourseApprovals || 0)),
      change: -5.1,
      changeType: 'decrease',
      icon: FaClock,
      color: 'bg-yellow-500'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(dashboardData.totalRevenue || 0),
      change: calculatePercentageChange(dashboardData.totalRevenue, dashboardData.monthlyStats?.revenue || 0),
      changeType: 'increase',
      icon: FaDollarSign,
      color: 'bg-purple-500'
    }
  ] : [];

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

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Welcome back! Here's what's happening with your platform.</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <FaSpinner className="animate-spin text-blue-600 text-4xl mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Welcome back! Here's what's happening with your platform.</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
              <button 
                onClick={() => {
                  if (onTabChange) {
                    onTabChange('coach-approval');
                  } else {
                    navigate('/admin/dashboard');
                  }
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-all duration-200"
              >
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
                      <p className="text-xs text-gray-500 mt-1">By {activity.user}</p>
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
                    <p className="text-sm font-medium text-blue-900">Approved Coaches</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {dashboardData ? formatNumber(dashboardData.totalCoaches - (dashboardData.pendingCoachApprovals || 0) - (dashboardData.pendingCourseApprovals || 0)) : '0'}
                    </p>
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
                    <p className="text-2xl font-bold text-yellow-600">
                      {dashboardData ? formatNumber((dashboardData.pendingCoachApprovals || 0) + (dashboardData.pendingCourseApprovals || 0)) : '0'}
                    </p>
                  </div>
                  <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
                    <FaClock className="text-yellow-600 text-lg" />
                  </div>
                </div>
              </div>

              {/* Total Sessions */}
              <div className="bg-green-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-green-900">Total Sessions</p>
                    <p className="text-2xl font-bold text-green-600">
                      {dashboardData ? formatNumber(dashboardData.totalSessions || 0) : '0'}
                    </p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                    <FaCalendarAlt className="text-green-600 text-lg" />
                  </div>
                </div>
              </div>

              {/* Revenue This Month */}
              <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-purple-900">Revenue This Month</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {dashboardData ? formatCurrency(dashboardData.monthlyStats?.revenue || 0) : '$0'}
                    </p>
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
        {/* Total Users */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData ? formatNumber(dashboardData.totalUsers || 0) : '0'}
              </p>
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
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData ? formatNumber(dashboardData.totalCourses || 0) : '0'}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
              <FaBook className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        {/* Monthly New Users */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600">New Users This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData ? formatNumber(dashboardData.monthlyStats?.newUsers || 0) : '0'}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg flex-shrink-0">
              <FaChartLine className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData ? formatCurrency(dashboardData.totalRevenue || 0) : '$0'}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg flex-shrink-0">
              <FaDollarSign className="text-orange-600 text-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview; 