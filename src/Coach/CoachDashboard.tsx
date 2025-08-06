import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Overview from './components/Overview';
import Courses from './components/Courses';
import Videos from './components/Videos';
import Schedule from './components/Schedule';
import Analytics from './components/Analytics';
import Profile from './components/Profile';
import { mockData } from './data/mockData';

interface CoachUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isVerified: boolean;
}

const CoachDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('coachActiveTab') || 'overview';
  });
  const [coachData, setCoachData] = useState<CoachUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const navigate = useNavigate();
  
  // Use Zustand auth store
  const { user, isAuthenticated, logout: logoutFromStore } = useAuthStore();

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      // Check if user is authenticated and has COACH role
      if (!isAuthenticated || !user || user.role !== 'COACH') {
        console.log('CoachDashboard: Authentication check failed');
        console.log('isAuthenticated:', isAuthenticated);
        console.log('user:', user);
        navigate('/login');
        return;
      }
      
      // Set coach data from authenticated user
      setCoachData({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified
      });
      
      setIsLoading(false);
    };

    checkAuth();
  }, [isAuthenticated, user, navigate]);

  const handleLogout = () => {
    logoutFromStore();
    navigate('/login');
  };

  const handleToggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('coachActiveTab', activeTab);
  }, [activeTab]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated || !user || user.role !== 'COACH') {
    return null;
  }

  // Merge basic user data with extended coach data for components
  const extendedCoachData = {
    ...mockData.extendedCoachData,
    id: coachData.id,
    role: coachData.role,
    isVerified: coachData.isVerified
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview 
          coachData={mockData.extendedCoachData} 
          recentActivity={mockData.recentActivity} 
          upcomingSessions={mockData.upcomingSessions}
          onTabChange={handleTabChange}
        />;
      case 'courses':
        return <Courses courses={mockData.courses} />;
      case 'videos':
        return <Videos />;
      case 'schedule':
        return <Schedule />;
      case 'analytics':
        return <Analytics />;
      case 'profile':
        return <Profile coachData={mockData.extendedCoachData} />;
      default:
        return <Overview 
          coachData={mockData.extendedCoachData} 
          recentActivity={mockData.recentActivity} 
          upcomingSessions={mockData.upcomingSessions}
          onTabChange={handleTabChange}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        coachName={`${coachData.firstName} ${coachData.lastName}`}
        avatar={mockData.extendedCoachData.avatar}
        showSidebar={showSidebar}
        onToggleSidebar={handleToggleSidebar}
        onLogout={handleLogout}
      />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          showSidebar={showSidebar}
          onTabChange={handleTabChange}
        />

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default CoachDashboard; 