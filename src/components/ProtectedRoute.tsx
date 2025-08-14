import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'PARENT' | 'COACH' | 'ADMIN';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, sessionBlock } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Debug logs
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);
  console.log('ProtectedRoute - user:', user);
  console.log('ProtectedRoute - requiredRole:', requiredRole);
  console.log('ProtectedRoute - isHydrated:', isHydrated);

  // Wait for Zustand to hydrate from localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 100); // Small delay to ensure state is hydrated

    return () => clearTimeout(timer);
  }, []);

  // Show loading while hydrating
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to appropriate login based on required role
  if (!isAuthenticated) {
    console.log('ProtectedRoute - Redirecting to login (not authenticated)');
    console.log('ProtectedRoute - Current path:', location.pathname);
    console.log('ProtectedRoute - Required role:', requiredRole);
    
    // Redirect to appropriate login page based on required role
    switch (requiredRole) {
      case 'ADMIN':
        return <Navigate to="/admin/login" replace />;
      case 'COACH':
        return <Navigate to="/loginCoach" replace />;
      case 'PARENT':
        return <Navigate to="/loginParent" replace />;
      default:
        return <Navigate to="/loginParent" replace />;
    }
  }

  // If session is blocked (e.g., deactivated while online), prevent navigation to protected routes
  if (sessionBlock?.active) {
    // For simplicity, redirect to the dashboard where overlay is shown
    if (requiredRole === 'COACH') {
      return <Navigate to="/coach/dashboard" replace />;
    }
  }

  // If role is required and user doesn't have it, redirect to appropriate dashboard
  if (requiredRole && user?.role !== requiredRole) {
    console.log('ProtectedRoute - Role mismatch. User role:', user?.role, 'Required role:', requiredRole);
    switch (user?.role) {
      case 'PARENT':
        return <Navigate to="/parent/dashboard" replace />;
      case 'COACH':
        return <Navigate to="/coach/dashboard" replace />;
      case 'ADMIN':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/loginParent" replace />;
    }
  }

  console.log('ProtectedRoute - Rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;