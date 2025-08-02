import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Overview from './components/Overview';
import Courses from './components/Courses';
import Enrollments from './components/Enrollments';
import Schedule from './components/Schedule';
import Profile from './components/Profile';
import { mockData } from './data/mockData';

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

const ParentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [parentData, setParentData] = useState<ParentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const userStr = localStorage.getItem('user');
      const activeRole = localStorage.getItem('activeRole');

      if (!userStr || activeRole !== 'PARENT') {
        navigate('/parent/login');
        return;
      }

      try {
        const user = JSON.parse(userStr);
        if (user.role === 'PARENT') {
          setParentData(user);
        } else {
          navigate('/parent/login');
        }
      } catch (error) {
        navigate('/parent/login');
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('activeRole');
    navigate('/parent/login');
  };

  const handleToggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <Overview
            parentData={parentData!}
            enrollments={mockData.enrollments}
            upcomingSessions={mockData.upcomingSessions}
            onTabChange={handleTabChange}
          />
        );
      case 'courses':
        return (
          <Courses
            courses={mockData.verifiedCourses}
            parentData={parentData!}
          />
        );
      case 'enrollments':
        return (
          <Enrollments
            enrollments={mockData.enrollments}
            parentData={parentData!}
          />
        );
      case 'schedule':
        return (
          <Schedule
            schedule={mockData.schedule}
            parentData={parentData!}
          />
        );
      case 'profile':
        return <Profile parentData={parentData!} />;
      default:
        return (
          <Overview
            parentData={parentData!}
            enrollments={mockData.enrollments}
            upcomingSessions={mockData.upcomingSessions}
            onTabChange={handleTabChange}
          />
        );
    }
  };

  if (isLoading || !parentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        user={parentData}
        onLogout={handleLogout}
        onToggleSidebar={handleToggleSidebar}
      />

      <div className="flex h-[calc(100vh-64px)]">
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          showSidebar={showSidebar}
        />

        {/* Main Content */}
        <main className="flex-1 transition-all duration-300">
          <div className="p-4 h-full overflow-y-auto flex justify-center">
            <div className="w-full max-w-6xl">{renderContent()}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ParentDashboard;
