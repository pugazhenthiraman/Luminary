import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Overview from './components/Overview';
import Courses from './components/Courses';
import Enrollments from './components/Enrollments';
import Schedule from './components/Schedule';
import Profile from './components/Profile';
import { mockData } from './data/mockData';
import { getCourses as getPublicCourses } from '../api/courses';

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

const ParentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('parentActiveTab') || 'overview';
  });
  const [parentData, setParentData] = useState<ParentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [availableCourses, setAvailableCourses] = useState<any[]>(mockData.verifiedCourses);
  const navigate = useNavigate();
  
  // Use Zustand auth store
  const { user, isAuthenticated, logout: logoutFromStore } = useAuthStore();

  useEffect(() => {
    const checkAuth = () => {
      // Check if user is authenticated and has PARENT role
      if (!isAuthenticated || !user || user.role !== 'PARENT') {
        console.log('ParentDashboard: Authentication check failed');
        console.log('isAuthenticated:', isAuthenticated);
        console.log('user:', user);
        navigate('/login');
        return;
      }

      // Set parent data from authenticated user
      setParentData({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        children: mockData.children // Use mock data for children
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
    localStorage.setItem('parentActiveTab', activeTab);
  }, [activeTab]);

  // Load approved public courses from backend
  useEffect(() => {
    (async () => {
      try {
        const res = await getPublicCourses({ page: 1, limit: 50, sortBy: 'createdAt', sortOrder: 'desc' });
        const apiCourses = (res.data?.data?.courses || []).map((c: any) => ({
          id: String(c.id),
          title: c.title,
          description: c.description || '',
          benefits: c.benefits || '',
          category: c.category,
          program: c.program || 'morning',
          credits: Number(c.creditCost || 0),
          timezone: c.timezone || 'UTC',
          weeklySchedule: Array.isArray(c.weeklySchedule) ? c.weeklySchedule : [],
          thumbnail: c.thumbnail || '',
          introVideo: c.videoUrl || '',
          coach: {
            id: String(c.coach.id),
            name: c.coach.name,
            avatar: c.coach.avatar || ''
          }
        }));
        setAvailableCourses(apiCourses);
      } catch (e) {
        // Keep mock data on failure
      }
    })();
  }, []);

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
  if (!isAuthenticated || !user || user.role !== 'PARENT') {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <Overview
            parentData={parentData as any}
            enrollments={mockData.enrollments as any}
            upcomingSessions={mockData.upcomingSessions as any}
            onTabChange={handleTabChange}
          />
        );
      case 'courses':
        return <Courses courses={availableCourses as any} parentData={parentData!} />;
      case 'enrollments':
        return (
          <Enrollments
            enrollments={mockData.enrollments as any}
            parentData={parentData as any}
          />
        );
      case 'schedule':
        return (
          <Schedule
            schedule={mockData.schedule as any}
            parentData={parentData as any}
          />
        );
      case 'profile':
        return <Profile parentData={parentData as any} />;
      default:
        return (
          <Overview
            parentData={parentData as any}
            enrollments={mockData.enrollments as any}
            upcomingSessions={mockData.upcomingSessions as any}
            onTabChange={handleTabChange}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Header
        user={parentData as any}
        onLogout={handleLogout}
        onToggleSidebar={handleToggleSidebar}
      />

      <div className="flex h-[calc(100vh-64px)] lg:h-[calc(100vh-80px)]">
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          showSidebar={showSidebar}
        />

        {/* Main Content */}
        <main className="flex-1 transition-all duration-500 ease-in-out overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="w-full max-w-7xl mx-auto">
                {renderContent()}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ParentDashboard;
