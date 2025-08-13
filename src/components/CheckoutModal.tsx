import React from 'react';

type Child = { id: string; firstName: string; lastName: string };
type Coach = { name?: string; avatar?: string };

type Props = {
  open: boolean;
  onClose: () => void;
  course: {
    id: string;
    title: string;
    description: string;
    benefits?: string;
    thumbnail?: string;
    introVideo?: string;
    coach?: Coach;
    credits: number;
  } | null;
  selectedChildren: Child[];
  creditBalance?: number;
  onBuyWithCredits?: () => void;
  onBuyCash?: () => void;
  onAddToCart?: () => void;
};

const CheckoutModal: React.FC<Props> = ({ open, onClose, course, selectedChildren, creditBalance = 0, onBuyWithCredits, onBuyCash, onAddToCart }) => {
  if (!open || !course) return null;

  const childrenLabel = selectedChildren.length
    ? `${selectedChildren.length} child${selectedChildren.length > 1 ? 'ren' : ''}`
    : 'No children selected';

  return (
    <div className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b">
          <div>
            <div className="text-xs text-gray-500">Checkout</div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">{course.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">✕</button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Media */}
          <div className="relative rounded-xl overflow-hidden bg-gray-100">
            {course.thumbnail ? (
              <img src={course.thumbnail} alt={course.title} className="w-full h-48 sm:h-56 object-cover" />
            ) : (
              <div className="w-full h-48 sm:h-56 flex items-center justify-center text-gray-400">No thumbnail</div>
            )}
            <div className="absolute inset-0 flex items-end justify-center p-3 bg-gradient-to-t from-black/40 via-transparent">
              <button
                type="button"
                onClick={() => course.introVideo && window.open(course.introVideo, '_blank')}
                className="px-4 py-2 rounded-full bg-white/90 hover:bg-white text-gray-900 text-sm font-medium shadow"
              >
                Preview
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            {course.benefits && (
              <div>
                <div className="text-xs text-gray-500">Benefits</div>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{course.benefits}</p>
              </div>
            )}
            {course.description && (
              <div>
                <div className="text-xs text-gray-500">About this course</div>
                <p className="text-sm text-gray-700 line-clamp-4">{course.description}</p>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                {course.coach?.avatar ? (
                  <img src={course.coach.avatar} alt={course.coach.name || 'Coach'} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-600 text-sm font-bold">{(course.coach?.name || 'C')[0]}</span>
                )}
              </div>
              <div className="text-sm text-gray-700">By <span className="font-medium">{course.coach?.name || 'Coach'}</span></div>
            </div>
          </div>

          {/* Pricing / Credits */}
          <div className="bg-gray-50 border rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500">Credits required</div>
                <div className="text-base sm:text-lg font-semibold text-gray-900">{course.credits} credit{course.credits === 1 ? '' : 's'} per child</div>
                <div className="text-xs text-gray-500 mt-1">Selected: {childrenLabel}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Your credits</div>
                <div className="text-base sm:text-lg font-semibold text-indigo-700">{creditBalance}</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <button
              onClick={onBuyWithCredits}
              className="col-span-1 sm:col-span-3 py-3 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-semibold"
            >
              Buy for {Math.max(1, course.credits)} credit{course.credits === 1 ? '' : 's'}
            </button>
            <button onClick={onBuyCash} className="py-3 rounded-lg bg-gray-900 hover:bg-black text-white font-semibold">Buy with cash</button>
            <button onClick={onAddToCart} className="py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold">Add to cart</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
