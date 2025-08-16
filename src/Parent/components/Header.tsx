import React from 'react';
import { FaBars, FaCoins } from 'react-icons/fa';

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
  onWalletClick?: () => void;
  onOpenPlans?: () => void;
  creditsBalance?: number; // optional display only
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onToggleSidebar, onWalletClick, onOpenPlans, creditsBalance }) => {
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

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onWalletClick}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50 text-blue-700 border border-blue-200 hover:from-indigo-100 hover:to-blue-100 transition"
              title="Open Wallet"
            >
              <FaCoins />
              <span className="font-semibold">Wallet</span>
              {typeof creditsBalance === 'number' && (
                <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-md bg-white text-blue-700 border border-blue-200 text-xs font-bold">
                  {creditsBalance} cr
                </span>
              )}
            </button>

            <button
              onClick={onOpenPlans}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 via-fuchsia-500 to-indigo-500 text-white shadow-md hover:shadow-lg hover:opacity-95 transition"
              title="Get a Plan"
            >
              Get Plan
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 