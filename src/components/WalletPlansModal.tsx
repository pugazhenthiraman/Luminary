import React, { useEffect } from 'react';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';

export type WalletPlan = {
  id: 'basic' | 'medium' | 'family';
  name: string;
  price: number;
  credits: number;
  popular?: boolean;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onBuy: (plan: WalletPlan) => void;
  initialPlanId?: WalletPlan['id'];
};

const DEFAULT_PLANS: WalletPlan[] = [
  { id: 'basic', name: 'Basic', price: 120, credits: 10 },
  { id: 'medium', name: 'Medium', price: 300, credits: 30, popular: true },
  { id: 'family', name: 'Family', price: 500, credits: 70 },
];

const WalletPlansModal: React.FC<Props> = ({ isOpen, onClose, onBuy, initialPlanId = 'medium' }) => {
  const [selectedId, setSelectedId] = React.useState<WalletPlan['id']>(initialPlanId);

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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {DEFAULT_PLANS.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`relative cursor-pointer rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-200 overflow-hidden ${selectedId===p.id ? 'ring-2 ring-indigo-500 scale-[1.01]' : ''}`}
              >
                {p.popular && (
                  <span className="absolute top-3 right-3 text-xs font-semibold bg-blue-600 text-white px-2 py-1 rounded-full">Popular</span>
                )}
                <div className={`h-28 bg-gradient-to-br ${p.id==='basic' ? 'from-violet-500 to-fuchsia-600' : p.id==='medium' ? 'from-purple-500 to-violet-600' : 'from-rose-500 to-pink-600'}`}></div>
                <div className="-mt-8 pb-6 px-5">
                  <div className="w-24 h-24 mx-auto rounded-full bg-white shadow-lg border flex items-center justify-center text-2xl font-extrabold text-gray-900">${p.price}</div>
                  <h4 className="mt-3 text-xl font-bold text-center">{p.name}</h4>
                  {/* <p className="text-xs text-gray-500 text-center">One-time purchase</p> */}
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex gap-2 items-start"><FaCheckCircle className="text-emerald-500 mt-0.5" /> {p.credits} credits included</li>
                    <li className="flex gap-2 items-start"><FaCheckCircle className="text-emerald-500 mt-0.5" /> Use across any course</li>
                    <li className="flex gap-2 items-start"><FaCheckCircle className="text-emerald-500 mt-0.5" /> Instant wallet top-up</li>
                    <li className="flex gap-2 items-start"><FaCheckCircle className="text-emerald-500 mt-0.5" /> {p.id === 'basic' ? 'One-time access' : p.id === 'medium' ? '2-3 classes' : '5-6+ classes'}</li>
                  </ul>
                  <button
                    onClick={() => onBuy(p)}
                    className={`mt-5 w-full inline-flex justify-center px-4 py-2 rounded-lg text-sm font-semibold transition-all ${p.id==='family' ? 'bg-pink-600 hover:bg-pink-700 text-white' : 'bg-violet-600 hover:bg-violet-700 text-white'}`}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 rounded-xl bg-gray-50 border text-xs text-gray-600">Payments are processed by Stripe. Your card details never touch our servers.</div>
        </div>
      </div>
    </div>
  );
};

export default WalletPlansModal;
