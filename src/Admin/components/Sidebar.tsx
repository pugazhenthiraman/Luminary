import React from 'react';
import { 
  FaHome, 
  FaUserCheck, 
  FaBookOpen, 
  FaChartLine, 
  FaCog,
  FaUsers,
  FaClipboardList
} from 'react-icons/fa';

interface AdminSidebarProps {
  activeTab: string;
  showSidebar: boolean;
  onTabChange: (tab: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, showSidebar, onTabChange }) => {
  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: FaHome },
    { id: 'coach-approval', label: 'Coach Approval', icon: FaUserCheck },
    { id: 'course-approval', label: 'Course Approval', icon: FaBookOpen },
    { id: 'analytics', label: 'Analytics', icon: FaChartLine },
    { id: 'users', label: 'User Management', icon: FaUsers },
    { id: 'reports', label: 'Reports', icon: FaClipboardList },
    { id: 'settings', label: 'Settings', icon: FaCog },
  ];

  return (
    <aside className={`${showSidebar ? 'w-64' : 'w-16'} bg-white shadow-sm border-r border-gray-200 transition-all duration-300 min-h-screen`}>
      <nav className="p-4">
        {/* Admin Header */}
        {showSidebar && (
          <div className="mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <FaCog className="text-white text-sm" />
              </div>
              <div>
                <h2 className="text-gray-900 font-bold text-lg">Admin Panel</h2>
                <p className="text-gray-500 text-xs">System Management</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
                title={showSidebar ? undefined : item.label}
              >
                <Icon className="text-lg flex-shrink-0" />
                {showSidebar && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Admin Stats */}
        {showSidebar && (
          <div className="mt-8 pt-4 border-t border-gray-200">
            <div className="space-y-2">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-xs">Pending Coaches</span>
                  <span className="bg-yellow-500 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">12</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-xs">Pending Courses</span>
                  <span className="bg-red-500 text-red-900 text-xs font-bold px-2 py-1 rounded-full">8</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
};

export default AdminSidebar; 