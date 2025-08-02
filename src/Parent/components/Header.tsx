import React from 'react';
import { FaBars, FaUser, FaSignOutAlt } from 'react-icons/fa';

interface ParentUser {
  id: string;
  email: string;
  name: string;
  role: string;
  children: Array<{
    id: string;
    name: string;
    age: number;
    grade: string;
  }>;
}

interface HeaderProps {
  user: ParentUser;
  onLogout: () => void;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onToggleSidebar }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - Menu button and title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label="Toggle sidebar"
          >
            <FaBars className="text-gray-600 text-xl" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Parent Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome back, {user.name}</p>
          </div>
        </div>

        {/* Right side - User menu */}

      </div>
    </header>
  );
};

export default Header; 