import React from 'react';
import { FaBars } from 'react-icons/fa';

interface ParentUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  children: Array<{
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    currentGrade: string;
    schoolName: string;
  }>;
}

interface HeaderProps {
  user: ParentUser;
  onLogout: () => void;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onToggleSidebar }) => {
  return (
    <header className="bg-white shadow-lg border-b-2 border-gray-100 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Left side - Menu button and title */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Toggle sidebar"
              title="Toggle sidebar"
            >
              <FaBars className="text-gray-600 text-lg sm:text-xl" />
            </button>
            
            <div className="hidden sm:flex items-center space-x-3">
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">
                  Parent Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  Welcome back, {user.firstName} {user.lastName}
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Empty for now */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Future: Add notifications or other header actions here if needed */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 