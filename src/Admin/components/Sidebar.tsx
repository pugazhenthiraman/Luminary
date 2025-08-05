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
              {/* Admin Header */}
              {showSidebar && (
                <div className="mb-4 pb-3 border-b border-gray-200">
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
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800 hover:shadow-md'
                      }`}
                      title={showSidebar ? undefined : item.label}
                      aria-label={item.label}
                    >
                      <div className={`flex-shrink-0 transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-indigo-600'} ${showSidebar ? '' : 'flex justify-center'}`}>
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
                        <div className="absolute -right-0.5 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-l-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Admin Stats */}
              {showSidebar && (
                <div className="mt-6 pt-4 border-t border-gray-200">
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
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar; 