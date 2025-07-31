import React from 'react';
import { 
  FaUsers, 
  FaClipboardCheck, 
  FaChartBar, 
  FaCog, 
  FaSignOutAlt,
  FaHome
} from 'react-icons/fa';

interface SidebarProps {
  activeTab: string;
  showSidebar: boolean;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  adminName: string;
  adminAvatar: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  showSidebar, 
  onTabChange, 
  onLogout,
  adminName,
  adminAvatar
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaHome },
    { id: 'coaches', label: 'Coaches', icon: FaUsers },
    { id: 'applications', label: 'Applications', icon: FaClipboardCheck },
    { id: 'analytics', label: 'Analytics', icon: FaChartBar },
    { id: 'settings', label: 'Settings', icon: FaCog },
  ];

  return (
    <aside className={`${showSidebar ? 'w-64' : 'w-16'} bg-white shadow-lg border-r border-gray-200 fixed top-16 left-0 bottom-0 z-40 transition-all duration-300 ease-in-out flex flex-col`}>
      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={adminAvatar}
              alt={adminName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-200"
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          {showSidebar && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{adminName}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800 hover:shadow-sm'
                }`}
                title={showSidebar ? undefined : item.label}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                )}
                
                <div className={`flex items-center justify-center w-6 h-6 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                }`}>
                  <Icon className="text-sm" />
                </div>
                
                {showSidebar && (
                  <span className={`font-medium transition-all duration-200 ${
                    isActive ? 'text-white' : 'text-gray-700 group-hover:text-gray-900'
                  }`}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Logout Button at Bottom */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={onLogout}
          className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:shadow-sm group`}
          title={showSidebar ? undefined : "Logout"}
        >
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-red-100 text-red-600 group-hover:bg-red-200 transition-all duration-200">
            <FaSignOutAlt className="text-sm" />
          </div>
          {showSidebar && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar; 