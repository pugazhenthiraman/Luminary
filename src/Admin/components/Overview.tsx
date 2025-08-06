import React, { useEffect, useState } from 'react';
import { FaUsers, FaBook, FaUserPlus, FaEye, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { getAdminStats } from '../../api/admin';

interface RecentActivity {
  id: string;
  type: 'coach_approved' | 'coach_rejected' | 'new_registration' | 'coach_submitted';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
}

interface DashboardStats {
  totalCoaches: number;
  approvedCoaches: number;
  pendingCoaches: number;
  rejectedCoaches: number;
  totalParents: number;
  totalSessions: number;
  totalRevenue: number;
}

const Overview: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await getAdminStats();
        console.log('Dashboard stats response:', res);
        console.log('Dashboard stats data:', res.data);
        // Access the data from the correct path based on API response
        setStats(res.data.data);
        setError(null);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
        setError('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading dashboard stats...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!stats) return null;

  // Mock recent activity data
  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'coach_approved',
      title: 'Coach Approved',
      description: 'John Doe - Mathematics Expert',
      timestamp: '2 minutes ago',
      user: 'John Doe'
    },
    {
      id: '2',
      type: 'coach_rejected',
      title: 'Coach Rejected',
      description: 'Alex Smith - Insufficient documentation',
      timestamp: '1 hour ago',
      user: 'Alex Smith'
    },
    {
      id: '3',
      type: 'new_registration',
      title: 'New Coach Registration',
      description: 'Sarah Wilson - Physics Specialist',
      timestamp: '3 hours ago',
      user: 'Sarah Wilson'
    },
    {
      id: '4',
      type: 'coach_submitted',
      title: 'Coach Submitted for Review',
      description: 'Mike Chen - Computer Science',
      timestamp: '5 hours ago',
      user: 'Mike Chen'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'coach_approved':
        return <FaCheckCircle className="text-green-600" />;
      case 'coach_rejected':
        return <FaTimesCircle className="text-red-600" />;
      case 'new_registration':
        return <FaUserPlus className="text-blue-600" />;
      case 'coach_submitted':
        return <FaClock className="text-yellow-600" />;
      default:
        return <FaEye className="text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'coach_approved':
        return 'bg-green-50 border-green-200';
      case 'coach_rejected':
        return 'bg-red-50 border-red-200';
      case 'new_registration':
        return 'bg-blue-50 border-blue-200';
      case 'coach_submitted':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
        <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 text-sm sm:text-base">Platform overview and quick actions.</p>
      </div>

      {/* Stats Cards - Based on Actual API Response */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaUsers className="text-blue-600 text-2xl" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalCoaches || 0}</div>
              <div className="text-sm font-medium text-gray-600">Total Coaches</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <FaCheckCircle className="text-green-600 text-2xl" />
                  </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.approvedCoaches || 0}</div>
              <div className="text-sm font-medium text-gray-600">Approved Coaches</div>
                  </div>
                </div>
              </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FaClock className="text-yellow-600 text-2xl" />
                  </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.pendingCoaches || 0}</div>
              <div className="text-sm font-medium text-gray-600">Pending Coaches</div>
                  </div>
                </div>
              </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FaBook className="text-purple-600 text-2xl" />
                      </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalSessions || 0}</div>
              <div className="text-sm font-medium text-gray-600">Total Sessions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <FaTimesCircle className="text-red-600 text-2xl" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.rejectedCoaches || 0}</div>
              <div className="text-sm font-medium text-gray-600">Rejected Coaches</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <FaUsers className="text-orange-600 text-2xl" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalParents || 0}</div>
              <div className="text-sm font-medium text-gray-600">Total Parents</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <FaUsers className="text-indigo-600 text-2xl" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">${stats.totalRevenue || 0}</div>
              <div className="text-sm font-medium text-gray-600">Total Revenue</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            <FaClock className="text-sm" />
            <span className="font-medium">Review Pending Coaches</span>
          </button>
          <button className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors">
            <FaBook className="text-sm" />
            <span className="font-medium">Review Pending Courses</span>
          </button>
          <button className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors">
            <FaUsers className="text-sm" />
            <span className="font-medium">View All Coaches</span>
          </button>
          <button className="flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors">
            <FaEye className="text-sm" />
            <span className="font-medium">View All Courses</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </button>
        </div>

          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className={`flex items-start space-x-3 p-4 rounded-lg border ${getActivityColor(activity.type)}`}>
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{activity.title}</h3>
                    <span className="text-xs text-gray-500 flex-shrink-0">{activity.timestamp}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                  {activity.user && (
                    <p className="text-xs text-gray-500 mt-1">by {activity.user}</p>
                  )}
            </div>
            </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview; 