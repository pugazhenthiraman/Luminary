import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Overview from './components/Overview';
import Courses from './components/Courses';
import Enrollments from './components/Enrollments';
import Schedule from './components/Schedule';
import Profile from './components/Profile';
import Wallet from './components/Wallet.tsx';
import { getCourses as getPublicCourses } from '../api/courses';
import { testAllThumbnails } from '../utils/thumbnailUtils';
import { getChildren, getEnrollments, getUpcomingSessions, getSchedule } from '../api/parent';

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
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  // Guards to avoid duplicate fetches in React StrictMode and to lazy-load
  const didInitRef = useRef(false);
  const didLoadParentDataRef = useRef(false);
  const didLoadCoursesRef = useRef(false);
  
  // Parent-specific data states
  const [children, setChildren] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [parentDataLoading, setParentDataLoading] = useState(true);
  const [openPlansSignal, setOpenPlansSignal] = useState(0);
  
  const navigate = useNavigate();
  
  // Use Zustand auth store
  const { user, isAuthenticated, logout: logoutFromStore } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      // Avoid duplicate run in StrictMode; wait until auth is ready
      if (didInitRef.current) return;
      if (!isAuthenticated || !user) return; // wait for auth hydration

      if (user.role !== 'PARENT') {
        navigate('/loginParent');
        return;
      }

      didInitRef.current = true;

      try {
        // Get children data from API
        const childrenResponse = await getChildren();
        const childrenData = childrenResponse.data?.data || [];

        // Set parent data from authenticated user
        setParentData({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          children: childrenData
        });

        setChildren(childrenData);
      } catch (error) {
        console.error('Error loading children data:', error);
        // Set parent data without children if API fails
        setParentData({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          children: []
        });
        setChildren([]);
      } finally {
        setIsLoading(false);
      }
  };

    checkAuth();
  }, [isAuthenticated, user, navigate]);

  // On first dashboard view per user, open Wallet plans modal once
  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'PARENT') return;
    // Key scoped per user
    const key = `walletPlansShown:${user.id}`;
    const shown = localStorage.getItem(key);
    if (!shown) {
      // switch to wallet tab and open plans modal
      setActiveTab('wallet');
      setOpenPlansSignal((s) => s + 1);
      localStorage.setItem(key, 'true');
    }
  }, [isAuthenticated, user]);

  // Load parent-specific data (enrollments, sessions, schedule)
  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'PARENT') return;
    if (didLoadParentDataRef.current) return; // avoid duplicate in StrictMode

    const loadParentData = async () => {
      setParentDataLoading(true);

      try {
        // Load all parent data in parallel
        const [enrollmentsRes, sessionsRes, scheduleRes] = await Promise.allSettled([
          getEnrollments(),
          getUpcomingSessions(),
          getSchedule()
        ]);

        // Handle enrollments
        if (enrollmentsRes.status === 'fulfilled') {
          const enrollmentsData = enrollmentsRes.value.data?.data || [];
          setEnrollments(enrollmentsData);
          console.log('[Parent] Loaded enrollments:', enrollmentsData.length);
        } else {
          console.error('[Parent] Failed to load enrollments:', enrollmentsRes.reason);
          setEnrollments([]);
        }

        // Handle upcoming sessions
        if (sessionsRes.status === 'fulfilled') {
          const sessionsData = sessionsRes.value.data?.data || [];
          setUpcomingSessions(sessionsData);
          console.log('[Parent] Loaded upcoming sessions:', sessionsData.length);
  } else {
          console.error('[Parent] Failed to load upcoming sessions:', sessionsRes.reason);
          setUpcomingSessions([]);
        }
        // Handle schedule
        if (scheduleRes.status === 'fulfilled') {
          const scheduleData = scheduleRes.value.data?.data || [];
          setSchedule(scheduleData);
          console.log('[Parent] Loaded schedule:', scheduleData.length);
        } else {
          console.error('[Parent] Failed to load schedule:', scheduleRes.reason);
          setSchedule([]);
        }

      } catch (error) {
        console.error('[Parent] Error loading parent data:', error);
        setEnrollments([]);
        setUpcomingSessions([]);
        setSchedule([]);
      } finally {
        setParentDataLoading(false);
        didLoadParentDataRef.current = true;
      }
    };

    loadParentData();
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logoutFromStore();
    navigate('/loginParent');
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

  // Lazy-load approved public courses only when the Courses tab is opened
  useEffect(() => {
    if (activeTab !== 'courses') return;
    if (didLoadCoursesRef.current) return;

    (async () => {
      try {
        setCoursesLoading(true);
        const res = await getPublicCourses({ page: 1, limit: 50, sortBy: 'createdAt', sortOrder: 'desc' });
        const apiCourses = (res.data?.data?.courses || []).map((c: any) => {
          // Extract coach information from the nested coach object
          const coach = c.coach || {};
          const coachName = coach.firstName && coach.lastName
            ? `${coach.firstName} ${coach.lastName}`.trim()
            : coach.name || 'Unknown Coach';

          return {
            id: String(c.id),
            title: c.title,
            description: c.description || '',
            benefits: c.benefits || '',
            category: c.category,
            program: c.program || 'morning',
            credits: Number(c.price || 0),
            timezone: c.timezone || 'UTC',
            weeklySchedule: Array.isArray(c.weeklySchedule) ? c.weeklySchedule : [],
            thumbnail: c.thumbnail || '',
            introVideo: c.videoUrl || '',
            level: c.level || 'BEGINNER',
            duration: c.courseDuration || `${c.duration} weeks`,
            totalSessions: c.totalSessions || 0,
            coach: {
              id: String(coach.id || ''),
              name: coachName,
              avatar: coach.avatar || coach.profileImageUrl || '',
              rating: Number(coach.rating || 0),
              totalReviews: Number(coach.totalReviews || 0),
              firstName: coach.firstName || '',
              lastName: coach.lastName || '',
              email: coach.email || '',
              phone: coach.phone || '',
              domain: coach.domain || '',
              experience: coach.experience || '',
              address: coach.address || '',
              languages: Array.isArray(coach.languages) ? coach.languages : [],
              courses: Array.isArray(coach.courses) ? coach.courses : []
            }
          };
        });
        setAvailableCourses(apiCourses);

        // Test all thumbnails
        setTimeout(() => {
          testAllThumbnails(apiCourses);
        }, 1000);

        setCoursesLoading(false);
        didLoadCoursesRef.current = true;
      } catch (e) {
        console.error('[Parent] Failed to load courses from API:', e);
        setAvailableCourses([]);
        setCoursesLoading(false);
      }
    })();
  }, [activeTab]);

  // Show loading while checking authentication or loading parent data
  if (isLoading || parentDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isLoading ? 'Loading dashboard...' : 'Loading your data...'}
          </p>
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
            enrollments={enrollments as any}
            upcomingSessions={upcomingSessions as any}
            onTabChange={handleTabChange}
          />
        );
      case 'wallet':
        return (
          <Wallet
            onTabChange={handleTabChange}
            openPlansSignal={openPlansSignal}
          />
        );
      case 'courses':
        return <Courses courses={availableCourses as any} parentData={parentData!} loading={coursesLoading} />;
      case 'enrollments':
        return (
          <Enrollments
            enrollments={enrollments as any}
            parentData={parentData as any}
          />
        );
      case 'schedule':
        return (
          <Schedule
            schedule={schedule as any}
            parentData={parentData as any}
          />
        );
      case 'profile':
        return <Profile parentData={parentData as any} />;
      default:
        return (
          <Overview
            parentData={parentData as any}
            enrollments={enrollments as any}
            upcomingSessions={upcomingSessions as any}
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
        onWalletClick={() => setActiveTab('wallet')}
        onOpenPlans={() => { setActiveTab('wallet'); setOpenPlansSignal((s) => s + 1); }}
        creditsBalance={42}
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
