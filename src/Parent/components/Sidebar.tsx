import React from 'react';
import {
  FaHome,
  FaBook,
  FaGraduationCap,
  FaCalendarAlt,
  FaUser,
  FaTimes,
  FaUsers,
  FaChartLine,
  FaCog,
  FaSignOutAlt,
} from 'react-icons/fa';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  showSidebar: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, showSidebar }) => {
  const navItems = [
    { 
      id: 'overview', 
      label: 'Dashboard Overview', 
      icon: FaHome
    },
    { 
      id: 'courses', 
      label: 'Available Courses', 
      icon: FaBook
    },
    { 
      id: 'enrollments', 
      label: 'My Enrollments', 
      icon: FaGraduationCap
    },
    { 
      id: 'schedule', 
      label: 'Attendance', 
      icon: FaCalendarAlt
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: FaUser
    },
  ];

  const quickActions = [
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: FaChartLine,
      description: 'View detailed reports'
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: FaCog,
      description: 'Account preferences'
    },
  ];

  return (
    <>
      {/* Mobile backdrop overlay */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity duration-300 ease-in-out"
          onClick={() => onTabChange(activeTab)} // Close sidebar when clicking backdrop
        />
      )}
      
      <aside
        className={`${showSidebar ? 'w-64 lg:w-72' : 'w-12'} bg-white shadow-xl border-r-2 border-gray-100 transition-all duration-500 ease-in-out h-full overflow-hidden relative z-40`}
      >
        <div className="flex flex-col h-full">
          {/* Navigation Section */}
          <div className="flex-1 overflow-y-auto">
            <div className={`${showSidebar ? 'p-3 space-y-3' : 'p-1.5 space-y-2'}`}>
              {/* Main Navigation */}
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => onTabChange(item.id)}
                      className={`w-full flex items-center ${showSidebar ? 'space-x-3 px-3 py-3' : 'justify-center px-1.5 py-2'} rounded-xl transition-all duration-300 ease-in-out group relative overflow-hidden ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800 hover:shadow-md'
                      }`}
                      title={showSidebar ? undefined : item.label}
                      aria-label={item.label}
                    >
                      <div className={`flex-shrink-0 transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'} ${showSidebar ? '' : 'flex justify-center'}`}>
                        <Icon className={`${showSidebar ? 'text-lg' : 'text-lg'}`} />
                      </div>
                      <div className={`flex-1 min-w-0 text-left transition-all duration-300 ease-in-out ${showSidebar ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}>
                        <span className={`font-medium text-sm transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-700'}`}>
                          {item.label}
                        </span>
                      </div>
                      {isActive && showSidebar && (
                        <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      )}
                      {isActive && !showSidebar && (
                        <div className="absolute -right-0.5 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-l-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
