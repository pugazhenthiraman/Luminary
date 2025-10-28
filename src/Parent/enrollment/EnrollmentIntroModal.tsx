import React from 'react';
import { FaTimes, FaBook } from 'react-icons/fa';

export interface IntroCourseInfo {
  id: string;
  title: string;
  description?: string;
  credits: number;
  thumbnail?: string;
  introVideo?: string;
  coach: { name: string; email?: string; phone?: string; status?: string };
  category?: string;
  // Optional presentation extras
  lengthText?: string; // e.g. "10h 38m"
  rating?: { value: number; count: number };
  originalPrice?: number; // for showing discount row
  price?: number; // current price
  isMostPopular?: boolean;
  createdAt?: string | Date;
}

interface Props {
  open: boolean;
  onClose: () => void;
  course: IntroCourseInfo | null;
  onContinue: () => void;
  creditsAvailable?: number;
  onBuyWithCredit?: () => void;
  onBuyWithMoney?: () => void;
  onAddToCart?: () => void;
  onAddToWishlist?: () => void;
  onPreview?: () => void;
}

const fallbackGradients = [
  'bg-gradient-to-r from-blue-500 to-purple-600',
  'bg-gradient-to-r from-green-400 to-emerald-500',
  'bg-gradient-to-r from-pink-500 to-yellow-500',
  'bg-gradient-to-r from-indigo-500 to-blue-400',
  'bg-gradient-to-r from-orange-400 to-red-500',
  'bg-gradient-to-r from-teal-400 to-cyan-500',
  'bg-gradient-to-r from-fuchsia-500 to-pink-500',
];

function pickGradient(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash);
  return fallbackGradients[Math.abs(hash) % fallbackGradients.length];
}

const EnrollmentIntroModal: React.FC<Props> = ({ open, onClose, course, onContinue, creditsAvailable, onBuyWithCredit }) => {
  if (!open || !course) return null;
  const gradient = pickGradient(course.title || course.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-2 sm:p-4">
  <div className="bg-white rounded-xl w-full max-w-xl shadow-2xl max-h-[88vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 text-white rounded-lg flex items-center justify-center">
                <FaBook />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Start Enrollment</h2>
                <p className="text-xs text-gray-600">Review before selecting children</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg" aria-label="Close">
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        {/* Body */}
  <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* Hero image */}
      <div className="relative rounded-lg overflow-hidden border border-gray-200">
            {course.thumbnail ? (
        <img src={course.thumbnail} alt={course.title} className="w-full h-28 sm:h-36 object-cover" />
            ) : (
        <div className={`w-full h-28 sm:h-36 ${gradient} flex items-center justify-center text-white text-xl sm:text-2xl font-bold`}>
                {course.title}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-snug text-center">{course.title}</h1>
            {!!course.description && (
              <p className="text-gray-700 text-sm line-clamp-2 text-center">{course.description}</p>
            )}

            {/* Meta row: format + length */}
            {course.lengthText && (
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-gray-700">
                <span>{course.lengthText}</span>
              </div>
            )}

            {/* removed big credit pill */}

            {/* BY only */}
            <div className="grid grid-cols-1 gap-3 items-stretch">
              <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                <div className="text-[10px] text-gray-500 tracking-wide mb-1">BY</div>
                <button className="text-blue-600 font-medium text-sm hover:underline">{course.coach?.name || 'Coach'}</button>
              </div>
            </div>

            {/* Credits required (courses only use credits, not USD) */}
            {typeof course.credits === 'number' && course.credits > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-600 mb-1">Required Credits</div>
                <div className="text-2xl font-bold text-yellow-600">{course.credits} Credits</div>
              </div>
            )}

            {/* Credits available (optional) */}
            {typeof creditsAvailable === 'number' && (
              <div className="text-sm text-gray-700">Credits available: <span className="font-semibold">{creditsAvailable}</span></div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="space-y-2">
            <button
              onClick={onBuyWithCredit || onContinue}
              className="w-full py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2"
            >
              Continue with Credits
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 rounded-full bg-white border border-gray-300 text-gray-900 text-sm font-semibold hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentIntroModal;
