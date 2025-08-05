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
        
 
      </div>
    </header>
  );
};

export default Header; 