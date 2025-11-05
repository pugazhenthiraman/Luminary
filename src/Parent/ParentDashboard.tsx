import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import WalletPlansModal, { type WalletPlan } from '../components/WalletPlansModal';
import WalletPaymentModal from '../components/WalletPaymentModal';
import { getCourses as getPublicCourses } from '../api/courses';
import { testAllThumbnails } from '../utils/thumbnailUtils';
import { getChildren, getEnrollments, getUpcomingSessions, getSchedule } from '../api/parent';
import creditsApi from '../api/credits';

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
  // Dashboard-level Wallet modals (so we can show over any tab)
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<WalletPlan | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  
  // Credit balance state
  const [creditsBalance, setCreditsBalance] = useState<number>(0);
  
  const navigate = useNavigate();
  
  // Use Zustand auth store
  const { user, isAuthenticated, logout: logoutFromStore } = useAuthStore();

  // Function to refresh children data
  const refreshChildrenData = useCallback(async () => {
    if (!isAuthenticated || !user || user.role !== 'PARENT') return;
    
    try {
      const childrenResponse = await getChildren();
      const childrenData = childrenResponse.data?.data || [];
      
      // Update parentData with new children
      setParentData(prev => prev ? {
        ...prev,
        children: childrenData
      } : null);
      
      setChildren(childrenData);
    } catch (error) {
      console.error('[ParentDashboard] Error refreshing children data:', error);
    }
  }, [isAuthenticated, user]);

  // Function to fetch and update credit balance
  const refreshCreditBalance = useCallback(async () => {
    if (!isAuthenticated || !user || user.role !== 'PARENT') return;
    
    try {
      const balanceResponse = await creditsApi.getBalance(user.id);
      const balance = balanceResponse?.creditBalance?.balance || balanceResponse?.balance || 0;
      setCreditsBalance(Number(balance));
    } catch (error) {
      console.error('[ParentDashboard] Error fetching credit balance:', error);
      setCreditsBalance(0);
    }
  }, [isAuthenticated, user]);

  // Function to refresh enrollments list
  const refreshEnrollments = useCallback(async () => {
    if (!isAuthenticated || !user || user.role !== 'PARENT') return;
    
    try {
      const enrollmentsRes = await getEnrollments();
      const enrollmentsData = enrollmentsRes.data?.data || [];
      setEnrollments(enrollmentsData);
      console.log('[ParentDashboard] Refreshed enrollments:', enrollmentsData.length);
    } catch (error) {
      console.error('[ParentDashboard] Error refreshing enrollments:', error);
      setEnrollments([]);
    }
  }, [isAuthenticated, user]);

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
        
        // Also fetch credit balance
        await refreshCreditBalance();
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

  // On first dashboard view per user, show plans popup ONLY if no plan selected/purchased
  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'PARENT') return;
    
    const checkAndShowPlansModal = async () => {
      try {
        // Check if user has any credit balance or purchases
        const [balanceResponse, purchasesResponse] = await Promise.allSettled([
          creditsApi.getBalance(user.id),
          creditsApi.getPurchases(user.id)
        ]);

        let hasCredits = false;
        let hasPurchases = false;

        // Check credit balance
        if (balanceResponse.status === 'fulfilled') {
          const balance = balanceResponse.value?.balance || 0;
          hasCredits = balance > 0;
        }

        // Check purchase history
        if (purchasesResponse.status === 'fulfilled') {
          const purchases = purchasesResponse.value?.purchases || [];
          hasPurchases = purchases.length > 0;
        }

        // Only show popup if user has NO credits AND NO purchase history
        if (!hasCredits && !hasPurchases) {
          const key = `walletPlansShown:${user.id}`;
          const shown = localStorage.getItem(key);
          const afterLoginFlag = localStorage.getItem('showWalletPlansAfterLogin');
          
          if (!shown || afterLoginFlag === 'true') {
            // Show plans modal over the current dashboard tab
            setShowPlansModal(true);
            localStorage.setItem(key, 'true');
            if (afterLoginFlag === 'true') {
              localStorage.removeItem('showWalletPlansAfterLogin');
            }
          }
        }
      } catch (error) {
        console.error('[ParentDashboard] Error checking credit status:', error);
        // If API fails, don't show popup to avoid annoyance
      }
    };

    checkAndShowPlansModal();
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
            program: c.program || undefined, // Optional field
            credits: Number(c.creditCost || c.price || 0), // Use creditCost first
            timezone: c.timezone || 'UTC',
            createdAt: c.createdAt || new Date().toISOString(), // Add createdAt for date filtering
            weeklySchedule: Array.isArray(c.weeklySchedule) ? c.weeklySchedule : [],
            thumbnail: c.thumbnail || '',
            introVideo: c.videoUrl || '',
            level: c.level || 'BEGINNER',
            duration: c.courseDuration || `${c.duration} weeks`,
            totalSessions: c.totalSessions || 0,
            // Add missing fields for display
            ageRanges: Array.isArray(c.ageRanges) ? c.ageRanges : [],
            location: c.location || '',
            locationType: c.locationType || '',
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
        return <Courses courses={availableCourses as any} parentData={parentData!} loading={coursesLoading} onTabChange={handleTabChange} onBalanceChange={refreshCreditBalance} onEnrollmentSuccess={refreshEnrollments} enrollments={enrollments} />;
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
        return <Profile parentData={parentData as any} onChildrenChange={refreshChildrenData} onTabChange={handleTabChange} />;
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
        // Clicking wallet should keep user on current tab and just open the plans modal
        onWalletClick={() => setShowPlansModal(true)}
        onOpenPlans={() => setShowPlansModal(true)}
        creditsBalance={creditsBalance}
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
                {/* Plans modal shown over any tab */}
                <WalletPlansModal
                  isOpen={showPlansModal}
                  onClose={() => setShowPlansModal(false)}
                  onBuy={(plan) => { setShowPlansModal(false); setSelectedPlan(plan); setPaymentOpen(true); }}
                />
                {/* Payment modal for selected plan */}
                <WalletPaymentModal
                  isOpen={paymentOpen}
                  plan={selectedPlan as any}
                  onSuccess={({ creditsAdded }) => {
                    // Refresh the credit balance after successful payment
                    refreshCreditBalance();
                    // Note: Don't close modal here, let the success message show first
                  }}
                  onClose={() => {
                    setPaymentOpen(false);
                    setSelectedPlan(null);
                  }}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ParentDashboard;
