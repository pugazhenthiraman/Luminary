import React from 'react';
import { FaBell, FaSignOutAlt } from 'react-icons/fa';

interface HeaderProps {
  coachName: string;
  avatar: string;
  showSidebar: boolean;
  onToggleSidebar: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  coachName, 
  avatar, 
  showSidebar, 
  onToggleSidebar, 
  onLogout 
}) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title="Toggle sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Coach Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome back, {coachName}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 relative"
            title="Notifications"
          >
            <FaBell className="text-lg" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center space-x-3">
            <img
              src={avatar}
              alt={coachName}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-sm font-medium text-gray-800">{coachName}</span>
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title="Logout"
          >
            <FaSignOutAlt className="text-lg" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 