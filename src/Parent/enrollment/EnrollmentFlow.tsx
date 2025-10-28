import React from 'react';
import { FaGraduationCap, FaTimes, FaCheck, FaChild, FaCreditCard, FaLock, FaQuestionCircle, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

export interface ChildItem {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender?: string;
  currentGrade?: string;
  schoolName?: string;
}

export interface CourseInfo {
  id: string;
  title: string;
  credits: number;
  coach: { name: string };
}

export type Step = 'children' | 'payment' | 'confirmation';

export interface PaymentMethod {
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
}

export interface EnrollmentState {
  courseId: string;
  selectedChildren: string[];
  totalPrice: number;
  paymentMethod?: PaymentMethod;
}

export interface PaymentStepDef {
  step: Step;
  title: string;
  description: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  course: CourseInfo | null;
  availableChildren: ChildItem[];
  childrenLoading?: boolean;
  state: EnrollmentState;
  step: Step;
  steps: PaymentStepDef[];
  onToggleChild: (childId: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  onPaymentChange: (field: keyof PaymentMethod, value: string) => void;
  canProceedPayment?: boolean;
  isProcessing?: boolean;
  onProcessPayment: () => void;
  onViewChild?: (child: ChildItem) => void;
  enrolledChildIds?: string[];
}

function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

const EnrollmentFlow: React.FC<Props> = ({
  open,
  onClose,
  course,
  availableChildren,
  childrenLoading = false,
  state,
  step,
  steps,
  onToggleChild,
  onNext,
  onPrev,
  onReset,
  onPaymentChange,
  canProceedPayment = false,
  isProcessing = false,
  onProcessPayment,
  onViewChild,
  enrolledChildIds = [],
}) => {
  if (!open || !course) return null;

  const [query, setQuery] = React.useState("");

  const selectedCount = state.selectedChildren.length;
  const unitCredits = Number.isFinite(course.credits) ? course.credits : 0;
  const totalCredits = unitCredits * selectedCount;
  const totalAmount = (Number.isFinite(state.totalPrice) && state.totalPrice > 0) ? state.totalPrice : totalCredits;
  
  // Calculate actual unit credits from total if needed (for backwards compatibility)
  const displayedUnitCredits = unitCredits > 0 
    ? unitCredits 
    : (selectedCount > 0 && totalAmount > 0 ? Math.round(totalAmount / selectedCount) : 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header (compact, left-aligned) */}
        <div className="px-4 py-3 sm:px-5 sm:py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <FaGraduationCap className="text-indigo-600" />
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">Enroll in Course</h2>
                <p className="text-[11px] sm:text-xs text-gray-600 truncate">Choose which children to enroll in this course</p>
              </div>
            </div>
            <button onClick={onReset} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white rounded-lg" aria-label="Close enrollment modal">
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* Course Info (hidden on payment step) */}
          {step !== 'payment' && (
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-4">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base break-words">{course.title}</h3>
              <div className="flex flex-col space-y-1 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-600">
                <span className="break-words">Coach: {course.coach.name}</span>
                <span className="font-semibold text-blue-600 flex-shrink-0">Course Credits: {displayedUnitCredits || course.credits}</span>
              </div>
            </div>
          )}

          {/* Children step */}
          {step === 'children' && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FaChild className="text-indigo-600 flex-shrink-0" />
                Select Children to Enroll
              </h4>

              {/* Child search */}
              <div className="mb-3">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search child by name..."
                  className="w-full sm:w-80 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>

              {childrenLoading ? (
                <div className="text-center text-gray-600 text-sm">Loading children...</div>
              ) : availableChildren && availableChildren.length > 0 ? (
                <div className="space-y-3">
                  <div className="h-60 overflow-y-auto border border-gray-200 rounded-lg p-2 sm:p-3">
                    {availableChildren
                      .filter(c =>
                        !query || `${c.firstName} ${c.lastName}`.toLowerCase().includes(query.toLowerCase())
                      )
                      .map(child => {
                      const isSelected = state.selectedChildren.includes(child.id);
                      const isEnrolled = enrolledChildIds.includes(child.id);
                      const age = calculateAge(child.dateOfBirth);
                      return (
                        <div key={child.id} className={`flex items-start justify-between p-2 rounded-lg transition-colors duration-200 ${isEnrolled ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'}`}>
                          <label className={`flex items-start gap-3 ${isEnrolled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => !isEnrolled && onToggleChild(child.id)}
                              disabled={isEnrolled}
                              className={`mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 flex-shrink-0 ${isEnrolled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="font-medium text-gray-900 text-sm sm:text-base break-words">
                                  {child.firstName} {child.lastName}
                                </div>
                                {isEnrolled && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                                    Already Enrolled
                                  </span>
                                )}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-500 break-words">
                                ({age} years old • {child.currentGrade || 'N/A'})
                              </div>
                            </div>
                          </label>
                          <button type="button" onClick={() => onViewChild?.(child)} className="text-xs text-indigo-600 hover:text-indigo-700 px-2 py-1 border border-indigo-200 rounded">
                            View details
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <p className="text-sm text-indigo-900">
                        <strong>Selected:</strong> {selectedCount} child{selectedCount > 1 ? 'ren' : ''}
                      </p>
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
                        <span className="text-sm text-indigo-900 bg-white/70 px-2 py-1 rounded-md border border-indigo-200">
                          Per child: <strong>{displayedUnitCredits}</strong> Credits
                        </span>
                        <span className="text-indigo-900 bg-white px-3 py-1.5 rounded-md border border-indigo-200 shadow-sm">
                          <span className="text-xs mr-1 align-middle">Total</span>
                          <span className="text-xl sm:text-2xl font-extrabold align-middle">{totalAmount}</span>
                          <span className="text-xs ml-1 align-middle">Credits</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaChild className="text-gray-300 text-4xl mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No children found</h3>
                  <p className="text-gray-500 text-sm">Please add children to your profile before enrolling in courses.</p>
                </div>
              )}
            </div>
          )}

          {/* Payment step - REMOVED: Courses only use credits, not direct Stripe payments */}

          {/* Confirmation step - REMOVED: Not needed for credit-based enrollment */}
        </div>

        <div className="px-4 py-3 sm:px-5 sm:py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-row items-center justify-between space-x-3">
            <button onClick={step === 'children' ? onReset : onPrev} className="px-4 py-2 sm:px-5 sm:py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium flex items-center gap-2 text-sm">
              <FaArrowLeft />
              {step === 'children' ? 'Cancel' : 'Back'}
            </button>

            {step === 'children' && (
              <button
                onClick={onProcessPayment}
                disabled={selectedCount === 0 || isProcessing}
                className="ml-auto px-4 py-2 sm:px-5 sm:py-2.5 text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-md text-sm"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Enrolling...
                  </>
                ) : (
                  <>
                    Confirm Enrollment
                    <FaArrowRight />
                  </>
                )}
              </button>
            )}

            {/* No footer button for payment/confirmation steps; removed for credit-based enrollment */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentFlow;
