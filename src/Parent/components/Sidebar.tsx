import React from 'react';
import {
  FaHome,
  FaBook,
  FaGraduationCap,
  FaCalendarAlt,
  FaUser,
  FaTimes,
  FaUsers,
} from 'react-icons/fa';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  showSidebar: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, showSidebar }) => {
  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: FaHome },
    { id: 'courses', label: 'Available Courses', icon: FaBook },
    { id: 'enrollments', label: 'My Enrollments', icon: FaGraduationCap },
    { id: 'schedule', label: 'Attendance', icon: FaCalendarAlt },
    { id: 'profile', label: 'Profile', icon: FaUser },
  ];

  return (
    <aside
      className={`${showSidebar ? 'w-64' : 'w-16'} bg-white shadow-sm border-r border-gray-200 transition-all duration-300 h-full`}
    >
      <nav className="p-3 h-full overflow-y-auto">
        {/* Parent Header */}
        <div className="mb-4 pb-3 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <FaUsers className="text-white text-sm" />
            </div>
            <div>
              <h2 className="text-gray-900 font-bold text-lg">Parent Panel</h2>
              <p className="text-gray-500 text-xs">Family Management</p>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
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
      </nav>
    </aside>
  );
};

export default Sidebar;
