import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  name: string;
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

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const userStr = localStorage.getItem('user');
      const activeRole = localStorage.getItem('activeRole');
      
      if (!userStr || activeRole !== 'COACH') {
        navigate('/coach/login');
        return;
      }
      
      try {
        const user = JSON.parse(userStr);
        
        if (user.role === 'COACH') {
          setCoachData(user);
        } else {
          navigate('/coach/login');
        }
      } catch (error) {
        navigate('/coach/login');
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('activeRole');
    navigate('/coach/login');
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

  // Show loading state
  if (isLoading || !coachData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
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
        coachName={coachData.name}
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