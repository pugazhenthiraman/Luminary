import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

interface AuthRedirectProps {
  children: React.ReactNode;
  allowedRoles?: ('PARENT' | 'COACH' | 'ADMIN')[];
  isLoginAttempt?: boolean; // New prop to track login attempts
}

const AuthRedirect: React.FC<AuthRedirectProps> = ({ children, allowedRoles = [], isLoginAttempt = false }) => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [shouldRedirect, setShouldRedirect] = useState(true);

  useEffect(() => {
    console.log('🔍 AuthRedirect useEffect triggered:', {
      isLoginAttempt,
      isAuthenticated,
      user: user ? { id: user.id, email: user.email, role: user.role } : null,
      shouldRedirect
    });

    // If this is a login attempt, NEVER redirect - let the login component handle everything
    if (isLoginAttempt) {
      console.log('🚫 Login attempt detected, completely preventing any redirects');
      setShouldRedirect(false);
      return;
    }

    // Check if we're already on a login page to prevent unnecessary redirects
    const currentPath = window.location.pathname;
    const isOnLoginPage = currentPath.includes('/login') || currentPath.includes('/admin/login') || currentPath.includes('/register');
    
    if (isOnLoginPage) {
      console.log('🚫 Already on login page or registration page, preventing redirects');
      setShouldRedirect(false);
      return;
    }

    // Only redirect if NOT a login attempt AND user is authenticated AND not on login page
    if (!isLoginAttempt && isAuthenticated && user && !isOnLoginPage) {
      console.log('✅ User is authenticated and not in login attempt, redirecting to dashboard for role:', user.role);
      // If user is authenticated, redirect to their appropriate dashboard
      switch (user.role) {
        case 'ADMIN':
          console.log('🔄 Redirecting to admin dashboard');
          navigate('/admin/dashboard');
          break;
        case 'COACH':
          console.log('🔄 Redirecting to coach dashboard');
          navigate('/coach/dashboard');
          break;
        case 'PARENT':
          console.log('🔄 Redirecting to parent dashboard');
          navigate('/parent/dashboard');
          break;
        default:
          console.log('🔄 Redirecting to parent login');
          navigate('/loginParent');
          break;
      }
    } else {
      console.log('❌ Not redirecting - conditions not met:', {
        isLoginAttempt,
        isAuthenticated,
        hasUser: !!user,
        isOnLoginPage
      });
    }
  }, [isAuthenticated, user, navigate, isLoginAttempt]);

  // Only log render decisions if not in login attempt to reduce noise
  if (!isLoginAttempt) {
    console.log('🎯 AuthRedirect render decision:', {
      isAuthenticated,
      isLoginAttempt,
      shouldRedirect,
      willShowChildren: !isAuthenticated || isLoginAttempt
    });
  }

  // CRITICAL: If this is a login attempt, ALWAYS show children and NEVER redirect
  if (isLoginAttempt) {
    console.log('📱 Showing login form (login attempt) - NO REDIRECTS ALLOWED');
    return <>{children}</>;
  }

  // If not authenticated, show the children (login form)
  if (!isAuthenticated) {
    console.log('📱 Showing login form (not authenticated)');
    return <>{children}</>;
  }

  // If authenticated and should redirect, show loading while redirecting
  // BUT only if this is NOT a login attempt
  if (!isLoginAttempt && shouldRedirect && isAuthenticated && user) {
    console.log('⏳ Showing loading screen while redirecting');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  console.log('📱 Showing children as fallback');
  return <>{children}</>;
};

export default AuthRedirect;
