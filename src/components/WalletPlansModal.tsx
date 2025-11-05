import React, { useEffect, useState, useRef } from 'react';
import { FaCheckCircle, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import creditsApi from '../api/credits';

export type WalletPlan = {
  id: string;
  name: string;
  price: number;
  credits: number;
  bonusCredits: number;
  popular?: boolean;
  description?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onBuy: (plan: WalletPlan) => void;
  initialPlanId?: string;
};

const WalletPlansModal: React.FC<Props> = ({ isOpen, onClose, onBuy, initialPlanId }) => {
  const [plans, setPlans] = useState<WalletPlan[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(initialPlanId || null);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Fetch packages from database
  useEffect(() => {
    if (isOpen) {
      loadPackages();
    }
  }, [isOpen]);

  const loadPackages = async () => {
    try {
      setIsLoading(true);
      const response = await creditsApi.getPackages(true as any); // Get only active packages
      const packages = response?.packages || [];
      
      // Map to WalletPlan format
      const mappedPlans: WalletPlan[] = packages.map((pkg: any) => ({
        id: pkg.id,
        name: pkg.name,
        price: Number(pkg.price),
        credits: Number(pkg.credits),
        bonusCredits: Number(pkg.bonusCredits || 0),
        popular: pkg.isPopular,
        description: pkg.description,
      }));
      
      setPlans(mappedPlans);
      
      // Set initial selection
      if (!selectedId && mappedPlans.length > 0) {
        const popularPlan = mappedPlans.find(p => p.popular) || mappedPlans[0];
        setSelectedId(popularPlan.id);
      }
    } catch (error) {
      console.error('Failed to load credit packages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  // Auto-scroll to selected plan
  useEffect(() => {
    if (selectedId && scrollContainerRef.current) {
      const selectedCard = scrollContainerRef.current.querySelector(`[data-plan-id="${selectedId}"]`);
      if (selectedCard) {
        selectedCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedId]);

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

  const getTotalCredits = (plan: WalletPlan) => plan.credits + plan.bonusCredits;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6">
      <div className="absolute inset-0 bg-black/60 z-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-6xl rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[92vh] flex flex-col" role="dialog" aria-modal="true">
        <div className="relative h-28 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600">
          <button
            type="button"
            className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white pointer-events-auto"
            onClick={onClose}
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
          {isLoading ? (
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
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {plans.map((p) => {
                  const totalCredits = getTotalCredits(p);
                  const planId = p.name.toLowerCase().includes('basic') ? 'basic' : 
                                 p.name.toLowerCase().includes('family') ? 'family' : 'medium';
                  
                  return (
                    <div
                      key={p.id}
                      data-plan-id={p.id}
                      onClick={() => setSelectedId(p.id)}
                      className={`relative cursor-pointer rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-200 overflow-hidden snap-center flex-shrink-0 min-w-[280px] sm:min-w-[320px] ${selectedId === p.id ? 'ring-2 ring-indigo-500 scale-[1.01]' : ''}`}
                    >
                      {p.popular && (
                        <span className="absolute top-3 right-3 z-10 text-xs font-semibold bg-blue-600 text-white px-2 py-1 rounded-full">
                          Popular
                        </span>
                      )}
                      <div className={`h-28 bg-gradient-to-br ${
                        planId === 'basic' ? 'from-violet-500 to-fuchsia-600' : 
                        planId === 'medium' ? 'from-purple-500 to-violet-600' : 
                        'from-rose-500 to-pink-600'
                      }`}></div>
                      <div className="-mt-8 pb-6 px-5">
                        <div className="w-24 h-24 mx-auto rounded-full bg-white shadow-lg border flex items-center justify-center text-2xl font-extrabold text-gray-900">
                          ${p.price}
                        </div>
                        <h4 className="mt-3 text-xl font-bold text-center">{p.name}</h4>
                        {p.description && p.description.length <= 50 && (
                          <p className="text-xs text-gray-500 text-center mt-1 line-clamp-2">{p.description}</p>
                        )}
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
                            {planId === 'basic' ? 'One-time access' : 
                             planId === 'medium' ? '2-3 classes' : 
                             '5-6+ classes'}
                          </li>
                        </ul>
                        <button
                          onClick={() => onBuy(p)}
                          className={`mt-5 w-full inline-flex justify-center px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            planId === 'family' ? 'bg-pink-600 hover:bg-pink-700 text-white' : 
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
            <div className="mt-6 p-4 rounded-xl bg-gray-50 border text-xs text-gray-600">
              Payments are processed by Stripe. Your card details never touch our servers.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletPlansModal;
