import React, { useEffect, useRef, useState } from 'react';
import { FaCoins, FaHistory, FaArrowRight, FaCheckCircle, FaTimes, FaCalendarAlt, FaBook, FaShoppingCart, FaPlus, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import WalletPaymentModal from '../../components/WalletPaymentModal';
import creditsApi from '../../api/credits';
import { useAuthStore } from '../../stores/useAuthStore';

interface WalletProps {
  onTabChange: (tab: string) => void;
  openPlansSignal?: number; // when incremented, open the plans modal
}

// Mock transaction history - will be replaced with real data from API
const HISTORY = [
  // August
  { id: 'h1', type: 'enroll', title: 'Art Basics', delta: -5, date: '2025-08-12' },
  { id: 'h2', type: 'purchase', title: 'Medium Plan', delta: +30, date: '2025-08-09' },
  { id: 'h3', type: 'enroll', title: 'Math Club', delta: -3, date: '2025-08-03' },
  // July
  { id: 'h4', type: 'enroll', title: 'Science Lab', delta: -6, date: '2025-07-12' },
  { id: 'h5', type: 'purchase', title: 'Basic Plan', delta: +15, date: '2025-07-05' },
  // June
  { id: 'h6', type: 'enroll', title: 'Robotics Club', delta: -8, date: '2025-06-20' },
  { id: 'h7', type: 'purchase', title: 'Family Plan', delta: +70, date: '2025-06-10' },
] as const;

type MonthKey = string; // 'YYYY-MM'
const monthKey = (dateStr: string): MonthKey => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
const monthLabel = (key: MonthKey) => {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, (m - 1), 1);
  return d.toLocaleString(undefined, { month: 'short', year: 'numeric' });
};
type SelectedMonth = MonthKey | 'ALL';
const displayMonth = (k: SelectedMonth) => (k === 'ALL' ? 'All Time' : monthLabel(k));
const buildMonthRange = (start: Date, end: Date): MonthKey[] => {
  // inclusive range, newest first
  const keys: MonthKey[] = [];
  const cursor = new Date(end.getFullYear(), end.getMonth(), 1);
  const min = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cursor >= min) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
    keys.push(key);
    cursor.setMonth(cursor.getMonth() - 1);
  }
  return keys;
};
const buildLastNMonths = (end: Date, count: number): MonthKey[] => {
  const keys: MonthKey[] = [];
  const cursor = new Date(end.getFullYear(), end.getMonth(), 1);
  for (let i = 0; i < count; i += 1) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
    keys.push(key);
    cursor.setMonth(cursor.getMonth() - 1);
  }
  return keys;
};

const Wallet: React.FC<WalletProps> = ({ onTabChange, openPlansSignal }) => {
  const { user } = useAuthStore();
  const [plans, setPlans] = useState<any[]>([]);
  const [openPlanId, setOpenPlanId] = useState<string | null>(null);
  const activePlan = plans.find(p => p.id === openPlanId);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('medium');
  const lastSignal = useRef<number | undefined>(undefined);
  const [balance, setBalance] = useState<number>(0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // Show a rolling 12 months selector, including months without transactions
  const allMonths = buildLastNMonths(new Date(), 12);
  const [selectedMonth, setSelectedMonth] = useState<SelectedMonth>(allMonths[0] || 'ALL');
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'PURCHASES' | 'USED'>('ALL');
  const [monthModalOpen, setMonthModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  
  // Build actual transaction data from API
  const monthItems = transactions
    .filter(h => {
      if (selectedMonth === 'ALL') return true;
      const hMonth = monthKey(h.createdAt || h.date);
      return hMonth === selectedMonth;
    })
    .filter(h => {
      if (historyFilter === 'ALL') return true;
      if (historyFilter === 'PURCHASES') return h.delta > 0 || h.amount > 0 || h.type === 'PURCHASE';
      return h.delta < 0 || h.amount < 0 || h.type === 'SPENT';
    })
    .sort((a, b) => new Date((b.createdAt || b.date)).getTime() - new Date((a.createdAt || a.date)).getTime());
  
  const totalPages = Math.max(1, Math.ceil(monthItems.length / itemsPerPage));
  const paginatedItems = monthItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const monthInflow = monthItems.filter(h => h.delta > 0 || (h.amount > 0 && h.type === 'PURCHASE')).reduce((s, x) => s + (x.delta || Math.abs(x.amount || 0)), 0);
  const monthOutflow = Math.abs(monthItems.filter(h => h.delta < 0 || (h.amount < 0 && h.type === 'SPENT')).reduce((s, x) => s + (x.delta || Math.abs(x.amount || 0)), 0));

  // Load credit balance from backend
  useEffect(() => {
    const loadBalance = async () => {
      if (!user?.id) return;
      setBalanceLoading(true);
      try {
        const balanceResponse = await creditsApi.getBalance(user.id);
        const balanceValue = balanceResponse?.creditBalance?.balance || balanceResponse?.balance || 0;
        setBalance(Number(balanceValue));
      } catch (error) {
        console.error('Failed to load credit balance:', error);
        setBalance(0);
      } finally {
        setBalanceLoading(false);
      }
    };
    
    loadBalance();
  }, [user?.id]);

  // Load credit transactions from backend
  useEffect(() => {
    const loadTransactions = async () => {
      if (!user?.id) return;
      setTransactionsLoading(true);
      try {
        const response = await creditsApi.getTransactions(user.id, {
          page: 1,
          limit: 100 // Get enough transactions for the last 12 months
        });
        
        const transactionsData = response?.transactions || [];
        
        // Transform API transactions to display format
        const transformedTransactions = transactionsData.map((t: any) => ({
          id: t.id,
          title: t.description || `Credit ${t.type?.toLowerCase() || 'transaction'}`,
          delta: t.type === 'PURCHASE' || t.type === 'BONUS' || t.type === 'REFUND' ? Math.abs(Number(t.amount)) : -Math.abs(Number(t.amount)),
          amount: Number(t.amount),
          type: t.type,
          createdAt: t.createdAt || t.date,
          date: t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : t.date
        }));
        
        setTransactions(transformedTransactions);
      } catch (error) {
        console.error('Failed to load credit transactions:', error);
        setTransactions([]);
      } finally {
        setTransactionsLoading(false);
      }
    };
    
    loadTransactions();
  }, [user?.id]);

  // Load credit packages from database
  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setIsLoadingPlans(true);
      const response = await creditsApi.getPackages(true as any); // Get only active packages
      const packages = response?.packages || [];
      
      const mappedPlans = packages.map((pkg: any) => ({
        id: pkg.id,
        name: pkg.name,
        price: Number(pkg.price),
        credits: Number(pkg.credits),
        bonusCredits: Number(pkg.bonusCredits || 0),
        popular: pkg.isPopular,
      }));
      
      setPlans(mappedPlans);
      
      // Set initial selection to popular plan or first plan
      if (mappedPlans.length > 0) {
        const popularPlan = mappedPlans.find(p => p.popular) || mappedPlans[0];
        setSelectedPlanId(popularPlan.id);
      }
    } catch (error) {
      console.error('Failed to load credit packages:', error);
    } finally {
      setIsLoadingPlans(false);
    }
  };

  useEffect(() => {
    // Reset pagination on filter/month change
    setCurrentPage(1);
  }, [selectedMonth, historyFilter]);

  // Open plans modal whenever the signal increments (from header or first-visit)
  useEffect(() => {
    if (typeof openPlansSignal === 'number' && openPlansSignal !== lastSignal.current) {
      if (plans.length > 0) {
        const firstPlan = plans.find(p => p.popular) || plans[0];
        setOpenPlanId(firstPlan.id);
        setSelectedPlanId(firstPlan.id);
      }
      lastSignal.current = openPlansSignal;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openPlansSignal, plans]);

  // Sync selected card when modal opens with a specific plan
  useEffect(() => {
    if (openPlanId) setSelectedPlanId(openPlanId);
  }, [openPlanId]);

  // Auto-scroll to selected plan
  useEffect(() => {
    if (selectedPlanId && scrollContainerRef.current) {
      const selectedCard = scrollContainerRef.current.querySelector(`[data-plan-id="${selectedPlanId}"]`);
      if (selectedCard) {
        selectedCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedPlanId]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleBuyNow = (planId: string) => {
    const plan = plans.find(p => p.id === planId) || null;
    setSelectedPlan(plan);
    setPaymentOpen(true);
  };

  const handlePaymentSuccess = async ({ creditsAdded }: { creditsAdded: number }) => {
    // Update local balance immediately
    setBalance((b) => b + creditsAdded);
    
    // Also refresh from backend to ensure accuracy
    if (user?.id) {
      try {
        const balanceResponse = await creditsApi.getBalance(user.id);
        const balanceValue = balanceResponse?.creditBalance?.balance || balanceResponse?.balance || 0;
        setBalance(Number(balanceValue));
        
        // Reload transactions to show the new purchase
        const transactionsResponse = await creditsApi.getTransactions(user.id, {
          page: 1,
          limit: 100
        });
        const transactionsData = transactionsResponse?.transactions || [];
        const transformedTransactions = transactionsData.map((t: any) => ({
          id: t.id,
          title: t.description || `Credit ${t.type?.toLowerCase() || 'transaction'}`,
          delta: t.type === 'PURCHASE' || t.type === 'BONUS' || t.type === 'REFUND' ? Math.abs(Number(t.amount)) : -Math.abs(Number(t.amount)),
          amount: Number(t.amount),
          type: t.type,
          createdAt: t.createdAt || t.date,
          date: t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : t.date
        }));
        setTransactions(transformedTransactions);
      } catch (error) {
        console.error('Failed to refresh credit balance:', error);
      }
    }
  };

  // Close plans modal on Escape and lock body scroll while open
  useEffect(() => {
    if (!activePlan) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenPlanId(null); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [activePlan]);

  return (
    <div className="space-y-6">
      {/* Top hero card */}
  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 text-white shadow-xl">
        <div className="relative z-10 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-white/90 text-sm">Credits Wallet</p>
              <h2 className="text-xl sm:text-3xl font-extrabold mt-1">Flexible Payment Options</h2>
              <p className="mt-2 text-white/90 max-w-xl text-sm">
                Choose between credit plans or purchase individual classes directly.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 sm:px-4 py-2 rounded-xl bg-white/15 backdrop-blur text-white flex items-center gap-2">
                <FaCoins />
                <span className="font-semibold">
                  {balanceLoading ? '...' : `${balance} Credits`}
                </span>
              </div>
            </div>
          </div>
        </div>
  <svg className="absolute -right-10 -top-10 w-40 h-40 sm:w-52 sm:h-52 text-white/10 pointer-events-none z-0" viewBox="0 0 200 200" fill="currentColor" aria-hidden>
          <circle cx="100" cy="100" r="100" />
        </svg>
      </div>

      {/* Balance Summary & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-1">
          <div className="rounded-2xl p-6 bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-white/20">
                <FaCoins className="text-2xl" />
              </div>
              <div>
                <p className="text-sm opacity-90">Current Balance</p>
                <p className="text-3xl font-extrabold">
                  {balanceLoading ? '...' : `${balance}`} Credits
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/15 rounded-lg p-3">
                <p className="text-white/80">Added</p>
                <p className="text-white font-bold">+{monthInflow} cr</p>
              </div>
              <div className="bg-white/15 rounded-lg p-3">
                <p className="text-white/80">Used</p>
                <p className="text-white font-bold">-{monthOutflow} cr</p>
              </div>
            </div>
            
            {/* Quick Action Buttons */}
            <div className="mt-4 pt-4 border-t border-white/20 space-y-2">
              <button
                onClick={() => {
                  if (plans.length > 0) {
                    const firstPlan = plans.find(p => p.popular) || plans[0];
                    setSelectedPlanId(firstPlan.id);
                    setOpenPlanId(firstPlan.id);
                  }
                }}
                className="w-full px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <FaPlus className="text-xs" />
                Add Credits
              </button>
              <button
                onClick={() => onTabChange('courses')}
                className="w-full px-3 py-2 rounded-lg bg-white text-violet-700 hover:bg-violet-50 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <FaBook className="text-xs" />
                Use Credits
              </button>
            </div>
          </div>
        </div>

        {/* Quick Filter Controls */}
        <div className="col-span-1 lg:col-span-2 flex items-center">
          <div className="w-full rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Activity Filters</h3>
                <p className="text-sm text-gray-600">View and filter your credit transactions</p>
              </div>
              <button
                onClick={() => setMonthModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-violet-200 bg-violet-50 text-violet-900 hover:bg-violet-100 hover:border-violet-300 transition text-sm font-medium shadow-sm"
                aria-haspopup="dialog"
              >
                <FaCalendarAlt />
                <span>Select Month</span>
                <span className="px-2 py-0.5 rounded-full bg-violet-600 text-white text-xs font-semibold">{displayMonth(selectedMonth)}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* History (timeline + filters) */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FaHistory /> Credit Activity
            </h3>
            <p className="text-sm text-gray-600 mt-1">Track purchases and usage over time</p>
          </div>
          <div className="inline-flex rounded-lg bg-gray-100 p-1">
            {(['ALL','PURCHASES','USED'] as const).map(f => (
              <button
                key={f}
                onClick={() => setHistoryFilter(f)}
                className={`px-3 py-1.5 text-sm rounded-md transition ${historyFilter===f ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
              >{f === 'ALL' ? 'All' : f === 'PURCHASES' ? 'Purchases' : 'Used'}</button>
            ))}
          </div>
        </div>
        <div className="p-5">
          {transactionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading transaction history...</p>
              </div>
            </div>
          ) : monthItems.length === 0 ? (
            selectedMonth === 'ALL' ? (
      <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center">
                <p className="text-gray-700 font-medium">No activity yet</p>
                <p className="text-sm text-gray-500 mt-1">Make your first purchase to get started.</p>
                <div className="mt-3">
                  <button
                    onClick={() => {
                      if (plans.length > 0) {
                        const firstPlan = plans.find(p => p.popular) || plans[0];
                        setOpenPlanId(firstPlan.id);
                        setSelectedPlanId(firstPlan.id);
                      }
                    }}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition text-sm"
                  >
                    Get a Plan
                  </button>
                </div>
              </div>
            ) : (
      <div className="rounded-xl border-2 border-dashed border-violet-200 bg-violet-50 p-6 text-center text-violet-900">
                <p className="font-semibold">No transactions in {displayMonth(selectedMonth)}</p>
                <p className="text-sm opacity-80 mt-1">Try changing filters or view your entire history.</p>
                <div className="mt-3">
                  <button
                    onClick={() => setSelectedMonth('ALL')}
        className="inline-flex items-center px-4 py-2 rounded-lg border border-violet-300 bg-white text-violet-700 hover:bg-violet-50 transition text-sm"
                  >
                    View All Time
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200" aria-hidden />
              <ul className="space-y-5">
                {paginatedItems.map((h) => (
                  <li key={h.id} className="relative pl-10">
                    <div className={`absolute left-1.5 top-1 w-4 h-4 rounded-full border-2 ${h.delta>0 ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`} />
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{h.title}</p>
                        <p className="text-xs text-gray-500">{new Date(h.createdAt || h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      <div className={`text-sm font-bold ${h.delta > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {h.delta > 0 ? `+${h.delta}` : h.delta} cr
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {/* Pagination (project style) */}
        {monthItems.length > 0 && (
          <div className="flex justify-center px-5 pb-3">
            <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">
        <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                aria-label="Previous"
              >&lt;</button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
          className={`px-3 py-2 border-t border-b border-gray-300 bg-white text-gray-700 hover:bg-violet-50 ${currentPage === i + 1 ? 'font-bold bg-violet-100' : ''}`}
                  aria-current={currentPage === i + 1 ? 'page' : undefined}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                aria-label="Next"
              >&gt;</button>
            </nav>
          </div>
        )}
  <div className="px-5 pb-5 text-xs sm:text-sm text-gray-500">Showing {historyFilter.toLowerCase()} for {displayMonth(selectedMonth)}</div>
      </div>

      {/* Month selection modal - distinct design */}
      {monthModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMonthModalOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white shadow-xl overflow-hidden" role="dialog" aria-modal="true" aria-label="Select Month">
            <div className="relative h-20 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600">
              <button
                className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white pointer-events-auto"
                onClick={() => setMonthModalOpen(false)}
                aria-label="Close month selector"
                title="Close"
              >
                <FaTimes />
              </button>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <h3 className="text-white font-extrabold text-lg sm:text-xl">Select a Month</h3>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="mb-3">
                <button
                  onClick={() => { setSelectedMonth('ALL'); setMonthModalOpen(false); }}
                  className={`px-3 py-3 rounded-xl border transition text-sm mr-2 ${selectedMonth === 'ALL' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold' : 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50'}`}
                >
                  All Time
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {allMonths.map((m) => (
                  <button
                    key={m}
                    onClick={() => { setSelectedMonth(m); setMonthModalOpen(false); }}
                    className={`px-3 py-3 rounded-xl border transition text-sm ${selectedMonth === m ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold' : 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50'}`}
                  >
                    {monthLabel(m)}
                  </button>
                ))}
              </div>
              <div className="mt-4 text-xs text-gray-500">Showing available months from your activity.</div>
            </div>
          </div>
        </div>
      )}

      {/* Plans modal - redesigned */}
      {activePlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6">
          <div className="absolute inset-0 bg-black/60 z-0" onClick={() => setOpenPlanId(null)} />
          <div className="relative z-10 w-full max-w-6xl rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[92vh] flex flex-col" role="dialog" aria-modal="true">
            <div className="relative h-28 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600">
              <button
                type="button"
                className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white pointer-events-auto"
                onClick={() => setOpenPlanId(null)}
                aria-label="Close"
                title="Close"
              >
                <FaTimes />
              </button>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-white">
                  <h3 className="text-2xl sm:text-3xl font-extrabold">Pick your plan</h3>
                  <p className="text-white/90 text-sm mt-1">Pick a plan. Pay securely. Credits appear instantly.</p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto">
              {isLoadingPlans ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading plans...</p>
                  </div>
                </div>
              ) : plans.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-600">No credit plans available at the moment.</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Slider Container with Scroll */}
                  <div 
                    ref={scrollContainerRef}
                    className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide pb-4"
                  >
                    {plans.map((p) => {
                      const planType = p.name.toLowerCase().includes('basic') ? 'basic' : 
                                      p.name.toLowerCase().includes('family') ? 'family' : 'medium';
                      const totalCredits = p.credits + p.bonusCredits;
                      
                      return (
                        <div
                          key={p.id}
                          data-plan-id={p.id}
                          onClick={() => setSelectedPlanId(p.id)}
                          className={`relative cursor-pointer rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-200 overflow-hidden snap-center flex-shrink-0 min-w-[280px] sm:min-w-[320px] ${selectedPlanId===p.id ? 'ring-2 ring-indigo-500 scale-[1.01]' : ''}`}
                        >
                          {p.popular && (
                            <span className="absolute top-3 right-3 z-10 text-xs font-semibold bg-blue-600 text-white px-2 py-1 rounded-full">
                              Popular
                            </span>
                          )}
                          <div className={`h-28 bg-gradient-to-br ${
                            planType === 'basic' ? 'from-violet-500 to-fuchsia-600' : 
                            planType === 'medium' ? 'from-purple-500 to-violet-600' : 
                            'from-rose-500 to-pink-600'
                          }`}></div>
                          <div className="-mt-8 pb-6 px-5">
                            <div className="w-24 h-24 mx-auto rounded-full bg-white shadow-lg border flex items-center justify-center text-2xl font-extrabold text-gray-900">
                              ${p.price}
                            </div>
                            <h4 className="mt-3 text-xl font-bold text-center">{p.name}</h4>
                            <ul className="mt-4 space-y-2 text-sm">
                              <li className="flex gap-2 items-start">
                                <FaCheckCircle className="text-emerald-500 mt-0.5" /> 
                                {totalCredits} credits included
                                {p.bonusCredits > 0 && <span className="text-yellow-600 font-semibold"> +{p.bonusCredits} bonus</span>}
                              </li>
                              <li className="flex gap-2 items-start">
                                <FaCheckCircle className="text-emerald-500 mt-0.5" /> Use across any course
                              </li>
                              <li className="flex gap-2 items-start">
                                <FaCheckCircle className="text-emerald-500 mt-0.5" /> Instant wallet top-up
                              </li>
                              <li className="flex gap-2 items-start">
                                <FaCheckCircle className="text-emerald-500 mt-0.5" /> 
                                {planType === 'basic' ? 'One-time access' : 
                                 planType === 'medium' ? '2-3 classes' : 
                                 '5-6+ classes'}
                              </li>
                            </ul>
                            <button
                              onClick={() => { setOpenPlanId(null); handleBuyNow(p.id); }}
                              className={`mt-5 w-full inline-flex justify-center px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                planType === 'family' ? 'bg-pink-600 hover:bg-pink-700 text-white' : 
                                'bg-violet-600 hover:bg-violet-700 text-white'
                              }`}
                            >
                              Buy Now
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Navigation Buttons (show only if more than 3 plans) */}
                  {plans.length > 3 && (
                    <>
                      <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg z-20 transition-all hover:scale-110"
                        aria-label="Scroll left"
                      >
                        <FaChevronLeft className="text-gray-700" />
                      </button>
                      <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg z-20 transition-all hover:scale-110"
                        aria-label="Scroll right"
                      >
                        <FaChevronRight className="text-gray-700" />
                      </button>
                    </>
                  )}
                </div>
              )}
              {plans.length > 0 && (
                <div className="mt-6 p-4 rounded-xl bg-gray-50 border text-xs text-gray-600">Payments are processed by Stripe. Your card details never touch our servers.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stripe Payment Modal for Wallet Plans */}
      <WalletPaymentModal
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        plan={selectedPlan}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default Wallet;
