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
import { getCourses } from '../api/courses';
import axiosInstance from '../api/axiosInstance';

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
  const [apiCourses, setApiCourses] = useState<any[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const navigate = useNavigate();
  
  // Use Zustand auth store
  const { user, accessToken, isAuthenticated, logout: logoutFromStore } = useAuthStore();

  const extractCoachIdFromToken = (token?: string): string | null => {
    if (!token || typeof token !== 'string') return null;
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payload = parts[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      const decoded = JSON.parse(decodeURIComponent(
        atob(payload)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      ));
      const possible = (
        decoded?.coachId ||
        decoded?.coach_id ||
        decoded?.coachUUID ||
        decoded?.coachUuid ||
        decoded?.cid ||
        decoded?.coach?.id ||
        decoded?.coach?.uuid ||
        null
      );
      return typeof possible === 'string' ? possible : null;
    } catch {
      return null;
    }
  };

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      // Check if user is authenticated and has COACH role
      if (!isAuthenticated || !user || user.role !== 'COACH') {
        console.log('CoachDashboard: Authentication check failed');
        console.log('isAuthenticated:', isAuthenticated);
        console.log('user:', user);
        navigate('/loginCoach');
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

  // Fetch courses for this coach when Courses tab becomes active
  useEffect(() => {
    const fetchCourses = async () => {
      if (activeTab !== 'courses' || !user) return;

      // Determine correct coachId from user payload (could be nested)
      // Try multiple sources for coachId
      // Extract coachId from token and ensure it is always an integer
      const coachIdFromToken = extractCoachIdFromToken(accessToken || undefined);
      let coachIdCandidate = coachIdFromToken
        ?? (user as any)?.coachId
        ?? (user as any)?.coach?.id
        ?? (user as any)?.coachUUID
        ?? (user as any)?.coachUuid
        ?? user.id;
      // Always convert to integer, even if already a number
      const coachIdInt = parseInt(coachIdCandidate as string, 10);
      console.log('Sending coachId as:', coachIdInt, typeof coachIdInt);
      try {
        setCoursesLoading(true);
        const resp = await axiosInstance.get(`/courses`, { params: { coachId: coachIdInt } });
        const root = resp.data;
        const payload = root?.data;
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.courses)
            ? payload.courses
            : Array.isArray(root?.courses)
              ? root.courses
              : Array.isArray(root)
                ? root
                : [];
        // Normalize to the shape expected by Courses component
        const normalized = (Array.isArray(list) ? list : []).map((c: any) => {
          const rawStatus = (typeof c.status === 'string') ? c.status.toLowerCase() : undefined;
          const isActive = Boolean(c.isActive);
          const status = rawStatus ?? (isActive ? 'approved' : 'pending');
          return {
          id: c.id || c._id,
          title: c.title || c.name || 'Untitled',
          thumbnail: c.thumbnail || c.imageUrl || '',
          students: c.studentsCount || c.enrolledCount || 0,
          rating: c.rating || 0,
          price: Number(c.creditCost ?? c.price ?? 0),
          status,
          isActive,
          isFrozen: Boolean((c as any).isFrozen),
          category: c.category || 'Uncategorized',
          duration: c.courseDuration || c.duration || '—',
          lessons: c.lessonsCount || c.lessons || 0,
          weeklySchedule: c.weeklySchedule || [],
          videoThumbnail: c.videoThumbnail || '',
          hasVideo: Boolean(c.videoUrl)
          };
        });
        setApiCourses(normalized);
      } catch (e) {
        console.error('Failed to load courses for coach:', e);
        setApiCourses([]);
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCourses();
  }, [activeTab, user]);

  const handleLogout = () => {
    logoutFromStore();
    navigate('/loginCoach');
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

  // TS safety: ensure coachData is set after auth check
  if (!coachData) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview 
          coachData={{
            name: `${coachData.firstName} ${coachData.lastName}`,
            totalStudents: 0,
            totalCourses: apiCourses.length,
            totalEarnings: 0,
            rating: 0,
          }} 
          recentActivity={[]} 
          upcomingSessions={[]}
          onTabChange={handleTabChange}
        />;
      case 'courses':
        return <Courses courses={apiCourses} />;
      case 'videos':
        return <Videos />;
      case 'schedule':
        return <Schedule />;
      case 'analytics':
        return <Analytics />;
      case 'profile':
        return <Profile coachData={{
          name: `${coachData.firstName} ${coachData.lastName}`,
          email: coachData.email,
          avatar: '',
          rating: 0,
          totalStudents: 0,
          totalCourses: apiCourses.length,
          totalEarnings: 0,
          experience: '',
          specialization: '',
        }} />;
      default:
        return <Overview 
          coachData={{
            name: `${coachData.firstName} ${coachData.lastName}`,
            totalStudents: 0,
            totalCourses: apiCourses.length,
            totalEarnings: 0,
            rating: 0,
          }} 
          recentActivity={[]} 
          upcomingSessions={[]}
          onTabChange={handleTabChange}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        coachName={`${coachData.firstName} ${coachData.lastName}`}
        avatar={''}
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