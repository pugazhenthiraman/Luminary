import React from 'react';
import { 
  FaHome, 
  FaBook, 
  FaVideo, 
  FaCalendarAlt, 
  FaChartLine, 
  FaUser, 
  FaCog 
} from 'react-icons/fa';

interface SidebarProps {
  activeTab: string;
  showSidebar: boolean;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, showSidebar, onTabChange }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: FaHome },
    { id: 'courses', label: 'Courses', icon: FaBook },
    { id: 'videos', label: 'Videos', icon: FaVideo },
    { id: 'schedule', label: 'Attendance', icon: FaCalendarAlt },
    // { id: 'analytics', label: 'Analytics', icon: FaChartLine },
    // { id: 'profile', label: 'Profile', icon: FaUser },
    { id: 'settings', label: 'Profile', icon: FaCog },
  ];

  return (
    <aside className={`${showSidebar ? 'w-64' : 'w-16'} bg-white shadow-sm border-r border-gray-200 transition-all duration-300 min-h-screen`}>
      <nav className="p-4">
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
      </nav>
    </aside>
  );
};

export default Sidebar; 