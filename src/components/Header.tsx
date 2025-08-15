import React, { useState, useEffect, useRef } from 'react';

import { useAuthStore } from '../stores/useAuthStore';
import { useAuth } from '../hooks/useAuth';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FaUserCircle, FaUser, FaSignOutAlt, FaExchangeAlt, FaHome, FaBars, FaTimes } from 'react-icons/fa';
import UserProfileMenu from './UserProfileMenu';

const isLoggedIn = () => {
  return !!localStorage.getItem('user');
};

const getAvailableRoles = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return [];
    const user = JSON.parse(userStr);
    let roles: string[] = [];
    if (typeof user.role === 'string') {
      roles = user.role.split(',').map((r: string) => r.trim().toUpperCase());
    } else if (Array.isArray(user.role)) {
      roles = user.role.map((r: string) => r.trim().toUpperCase());
    }
    return roles;
  } catch {
    return [];
  }
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showRoleSwitch, setShowRoleSwitch] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  const { isAuthenticated } = useAuthStore();
  const loggedIn = isAuthenticated;
  const roles = getAvailableRoles();
  const currentRole = localStorage.getItem('activeRole') || (roles.length > 0 ? roles[0] : '');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleMouseDownOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleMouseDownOutside);
    return () => {
      document.removeEventListener('mousedown', handleMouseDownOutside);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location.pathname]);

  // Ensure dropdown is closed on mount and login status changes
  useEffect(() => {
    setShowProfileDropdown(false);
    setShowRoleSwitch(false);
    setShowMobileMenu(false);
  }, [loggedIn]);

  const { handleLogout: logoutWithApi } = useAuth();
  const handleLogout = async () => {
    console.log('[Header] Logout button clicked');
    await logoutWithApi();
    // Role-based redirect after logout
    const roles = getAvailableRoles();
    let redirectPath = '/';
    if (roles.includes('ADMIN')) {
      redirectPath = '/admin/login';
    } else if (roles.includes('COACH')) {
      redirectPath = '/loginCoach';
    } else if (roles.includes('PARENT')) {
      redirectPath = '/loginParent';
    }
    navigate(redirectPath);
  };

  const handleSwitchRole = () => {
    setShowRoleSwitch(true);
    setShowProfileDropdown(false);
    setShowMobileMenu(false);
  };

  const handleProfileToggle = () => {
    setShowProfileDropdown(!showProfileDropdown);
    setShowRoleSwitch(false);
    setShowMobileMenu(false);
  };

  const handleMobileMenuToggle = () => {
    setShowMobileMenu(!showMobileMenu);
    setShowProfileDropdown(false);
    setShowRoleSwitch(false);
  };

  const handleHomeClick = () => {
    // Get current active role to determine home route
    const activeRole = localStorage.getItem('activeRole');
    const roles = getAvailableRoles();

    // If no active role is set, use the first available role
    const currentRole = activeRole || (roles.length > 0 ? roles[0] : '');

    // Navigate to role-specific dashboard
    if (currentRole === 'COACH') {
      navigate('/coach/dashboard');
    } else if (currentRole === 'PARENT') {
      navigate('/parent/dashboard');
    } else if (currentRole === 'ADMIN') {
      navigate('/admin/dashboard');
    } else {
      navigate('/');
    }
  };

  const handleProfileClick = () => {
    setShowProfileDropdown(false);
    setShowMobileMenu(false);

    // Get current active role to determine profile route
    const activeRole = localStorage.getItem('activeRole');
    const roles = getAvailableRoles();

    // If no active role is set, use the first available role
    const currentRole = activeRole || (roles.length > 0 ? roles[0] : '');

    // Navigate to role-specific profile page
    if (currentRole === 'COACH') {
      navigate('/coach/profile');
    } else if (currentRole === 'PARENT') {
      navigate('/parent/profile');
    } else if (currentRole === 'ADMIN') {
      navigate('/admin/profile'); // You can create this later if needed
    } else {
      navigate('/profile'); // Fallback
    }
  };

  const handleRoleSelect = (role: string) => {
    localStorage.setItem('activeRole', role);
    setShowRoleSwitch(false);
    setShowProfileDropdown(false);
    setShowMobileMenu(false);
    // Redirect to selected role's dashboard
    if (role === 'COACH') {
      navigate('/coach/dashboard');
    } else if (role === 'PARENT') {
      navigate('/parent/dashboard');
    } else if (role === 'ADMIN') {
      navigate('/admin/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <header className="sticky top-0 w-full bg-white z-50 shadow-xl border-b-2 border-gray-200">
      <div className="w-full h-16 md:h-20 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo - Left Side */}
        <div className="flex-shrink-0">
          {location.pathname.includes('/admin/dashboard') ? (
            // Show icon and name without link when on admin dashboard
            <div className="flex items-center space-x-2 md:space-x-3">
              <img 
                src="/public/icon.png" 
                alt="Luminary Learning Center" 
                className="h-8 w-auto md:h-12 object-contain drop-shadow-lg"
              />
              <span className="text-lg md:text-2xl font-extrabold text-blue-600">Luminary</span>
            </div>
          ) : (
            // Show icon and name with link when not on admin dashboard
            <NavLink to="/" className="flex items-center space-x-2 md:space-x-3 transition-all duration-300 hover:scale-105">
              <img 
                src="/public/icon.png" 
                alt="Luminary Learning Center" 
                className="h-8 w-auto md:h-12 object-contain drop-shadow-lg"
              />
              <span className="text-lg md:text-2xl font-extrabold text-blue-600 hover:text-blue-700">Luminary</span>
            </NavLink>
          )}
        </div>
        
        {/* Desktop Navigation - Hidden on mobile */}
        <nav className="hidden md:flex items-center space-x-2 lg:space-x-6" aria-label="Main navigation">
          {!loggedIn ? (
            <>
              <NavLink 
                to="/" 
                className={({ isActive }) => `flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-300 relative rounded-lg group ${isActive ? 'text-blue-600 bg-blue-50 shadow-md scale-105' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50 hover:scale-105'} ${isActive ? 'after:content-[] after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-gradient-to-r after:from-blue-500 after:to-blue-600 after:rounded-full after:animate-pulse' : 'after:content-[] after:absolute after:bottom-0 after:left-1/2 after:transform after:-translate-x-1/2 after:w-0 after:h-1 after:bg-gradient-to-r after:from-blue-500 after:to-blue-600 after:rounded-full after:transition-all after:duration-300 group-hover:after:w-full group-hover:after:left-0 group-hover:after:transform-none'}`} 
                end
              >
                <FaHome className="text-base transition-transform duration-300 group-hover:scale-110" /> 
                <span className="relative">
                  Home
                </span>
              </NavLink>
              <NavLink 
                to="/loginParent" 
                className={({ isActive }) => `px-3 py-2 text-sm font-medium transition-all duration-300 relative rounded-lg group ${isActive ? 'text-blue-600 bg-blue-50 shadow-md scale-105' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50 hover:scale-105'} ${isActive ? 'after:content-[] after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-gradient-to-r after:from-blue-500 after:to-blue-600 after:rounded-full after:animate-pulse' : 'after:content-[] after:absolute after:bottom-0 after:left-1/2 after:transform after:-translate-x-1/2 after:w-0 after:h-1 after:bg-gradient-to-r after:from-blue-500 after:to-blue-600 after:rounded-full after:transition-all after:duration-300 group-hover:after:w-full group-hover:after:left-0 group-hover:after:transform-none'}`}
              >
                <span className="relative">
                  For Parents
                </span>
              </NavLink>
              <NavLink 
                to="/loginCoach" 
                className={({ isActive }) => `px-3 py-2 text-sm font-medium transition-all duration-300 relative rounded-lg group ${isActive ? 'text-blue-600 bg-blue-50 shadow-md scale-105' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50 hover:scale-105'} ${isActive ? 'after:content-[] after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-gradient-to-r after:from-blue-500 after:to-blue-600 after:rounded-full after:animate-pulse' : 'after:content-[] after:absolute after:bottom-0 after:left-1/2 after:transform after:-translate-x-1/2 after:w-0 after:h-1 after:bg-gradient-to-r after:from-blue-500 after:to-blue-600 after:rounded-full after:transition-all after:duration-300 group-hover:after:w-full group-hover:after:left-0 group-hover:after:transform-none'}`}
              >
                <span className="relative">
                  For Coaches
                </span>
              </NavLink>
              <NavLink 
                to="/admin/login" 
                className={({ isActive }) => `px-3 py-2 text-sm font-medium transition-all duration-300 relative rounded-lg group ${isActive ? 'text-purple-600 bg-purple-50 shadow-md scale-105' : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50 hover:scale-105'} ${isActive ? 'after:content-[] after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-gradient-to-r after:from-purple-500 after:to-purple-600 after:rounded-full after:animate-pulse' : 'after:content-[] after:absolute after:bottom-0 after:left-1/2 after:transform after:-translate-x-1/2 after:w-0 after:h-1 after:bg-gradient-to-r after:from-purple-500 after:to-purple-600 after:rounded-full after:transition-all after:duration-300 group-hover:after:w-full group-hover:after:left-0 group-hover:after:transform-none'}`}
              >
                <span className="relative">
                  Admin
                </span>
              </NavLink>
            </>
          ) : (
            <UserProfileMenu triggerVariant="icon" />
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-2">
          {loggedIn && (
            <div className="relative">
              <UserProfileMenu triggerVariant="icon" />
            </div>
          )}
          {/* Hide hamburger for Parent role (logged in) as it's not needed */}
          {(!loggedIn || currentRole !== 'PARENT') && (
            <button
              ref={hamburgerRef}
              onClick={handleMobileMenuToggle}
              className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-300 hover:scale-105"
              aria-label={showMobileMenu ? "Close mobile menu" : "Open mobile menu"}
              aria-expanded={showMobileMenu}
              aria-controls="mobile-menu"
            >
              {showMobileMenu ? (
                <FaTimes className="text-xl" />
              ) : (
                <FaBars className="text-xl" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
  {showMobileMenu && (!loggedIn || currentRole !== 'PARENT') && (
        <div 
          ref={mobileMenuRef}
          id="mobile-menu"
          className="md:hidden bg-white border-t border-gray-200 shadow-lg animate-in slide-in-from-top-2 duration-200"
        >
          <nav className="px-4 py-4 space-y-2">
            {!loggedIn ? (
              <>
                <NavLink 
                  to="/" 
                  className={({ isActive }) => `flex items-center gap-3 px-4 py-3 text-base font-medium transition-all duration-300 rounded-xl group ${isActive ? 'text-blue-600 bg-blue-50 shadow-md' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'}`} 
                  end
                >
                  <FaHome className="text-lg" /> 
                  <span>Home</span>
                </NavLink>
                <NavLink 
                  to="/loginParent" 
                  className={({ isActive }) => `flex items-center gap-3 px-4 py-3 text-base font-medium transition-all duration-300 rounded-xl ${isActive ? 'text-blue-600 bg-blue-50 shadow-md' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'}`}
                >
                  <span>For Parents</span>
                </NavLink>
                <NavLink 
                  to="/loginCoach" 
                  className={({ isActive }) => `flex items-center gap-3 px-4 py-3 text-base font-medium transition-all duration-300 rounded-xl ${isActive ? 'text-blue-600 bg-blue-50 shadow-md' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'}`}
                >
                  <span>For Coaches</span>
                </NavLink>
                <NavLink 
                  to="/admin/login" 
                  className={({ isActive }) => `flex items-center gap-3 px-4 py-3 text-base font-medium transition-all duration-300 rounded-xl ${isActive ? 'text-purple-600 bg-purple-50 shadow-md' : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'}`}
                >
                  <span>Admin</span>
                </NavLink>
              </>
            ) : (
              <div className="space-y-2">
                {currentRole !== 'PARENT' && (
                  <button 
                    className="flex items-center gap-3 w-full px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl transition-all duration-300 text-left" 
                    onClick={handleProfileClick}
                  >
                    <FaUser className="text-lg" />
                    Profile
                  </button>
                )}
                {roles.length > 1 && (
                  <button 
                    className="flex items-center gap-3 w-full px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl transition-all duration-300 text-left" 
                    onClick={handleSwitchRole}
                  >
                    <FaExchangeAlt className="text-lg" />
                    Switch Role
                  </button>
                )}
                {currentRole !== 'PARENT' && (
                  <button 
                    className="flex items-center gap-3 w-full px-4 py-3 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-300 text-left" 
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt className="text-lg" />
                    Logout
                  </button>
                )}
              </div>
            )}
          </nav>
        </div>
      )}
      
      {/* Role selection modal/dropdown */}
      {showRoleSwitch && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 min-w-80 max-w-md mx-4 text-center animate-in zoom-in-95 duration-200 border-2 border-gray-200">
            <div className="text-xl font-bold text-gray-800 mb-6">Select Your Role</div>
            <div className="flex flex-col gap-4 mb-6">
              {roles.map((role) => (
                <button
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none rounded-xl py-3 px-6 text-lg font-semibold cursor-pointer transition-all duration-300 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transform hover:-translate-y-1 hover:scale-105"
                  key={role}
                  onClick={() => handleRoleSelect(role)}
                >
                  {role === 'ENDUSER' ? 'User' : role.charAt(0) + role.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <button 
              className="bg-gray-100 text-gray-700 border-none rounded-xl py-3 px-6 text-base w-full cursor-pointer font-medium hover:bg-gray-200 transition-all duration-300 hover:scale-105" 
              onClick={() => setShowRoleSwitch(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
