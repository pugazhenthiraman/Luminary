import React from 'react';
import { FaBell, FaSearch } from 'react-icons/fa';

interface HeaderProps {
  adminName: string;
  avatar: string;
  showSidebar: boolean;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  adminName, 
  avatar, 
  showSidebar, 
  onToggleSidebar
}) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50 h-16 backdrop-blur-sm bg-white/95">
      <div className="flex items-center justify-between px-6 py-4 h-full">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
            title="Toggle sidebar"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back, {adminName}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search coaches..."
              className="block w-64 pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Notifications */}
          <button 
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200 relative group"
            title="Notifications"
          >
            <FaBell className="text-lg group-hover:scale-110 transition-transform duration-200" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <img
                src={avatar}
                alt={adminName}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200 group-hover:ring-blue-300 transition-all duration-200"
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-800">{adminName}</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 