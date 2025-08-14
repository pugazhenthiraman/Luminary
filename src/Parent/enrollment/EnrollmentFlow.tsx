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
}) => {
  if (!open || !course) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3 truncate">
                <FaGraduationCap className="text-indigo-600 text-lg sm:text-xl flex-shrink-0" />
                Enroll in Course
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-2 truncate">{steps.find(s => s.step === step)?.description}</p>
            </div>
            <button onClick={onReset} className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-white rounded-lg flex-shrink-0 ml-2" aria-label="Close enrollment modal">
              <FaTimes className="text-lg sm:text-xl" />
            </button>
          </div>
          {/* Steps */}
          <div className="mt-4 sm:mt-6">
            <div className="flex items-center justify-between">
              {steps.map((s, index) => {
                const isActive = s.step === step;
                const isCompleted = steps.findIndex(st => st.step === step) > index;
                return (
                  <div key={s.step} className="flex flex-col items-center space-y-1 flex-1">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium flex-shrink-0 ${isActive ? 'bg-indigo-600 text-white' : isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {isCompleted ? <FaCheck className="text-xs" /> : index + 1}
                    </div>
                    <div className="text-center min-w-0 flex-1">
                      <p className={`text-xs sm:text-sm font-medium truncate ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}>{s.title}</p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-8 h-0.5 mx-2 flex-shrink-0 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* Course Info */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base break-words">{course.title}</h3>
            <div className="flex flex-col space-y-1 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-600">
              <span className="break-words">Coach: {course.coach.name}</span>
              <span className="font-semibold text-blue-600 flex-shrink-0">Course Credits: {course.credits}</span>
            </div>
          </div>

          {/* Children step */}
          {step === 'children' && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaChild className="text-indigo-600 flex-shrink-0" />
                Select Children to Enroll
              </h4>

              {childrenLoading ? (
                <div className="text-center text-gray-600 text-sm">Loading children...</div>
              ) : availableChildren && availableChildren.length > 0 ? (
                <div className="space-y-3">
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2 sm:p-3">
                    {availableChildren.map(child => {
                      const isSelected = state.selectedChildren.includes(child.id);
                      const age = calculateAge(child.dateOfBirth);
                      return (
                        <div key={child.id} className="flex items-start justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => onToggleChild(child.id)}
                              className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 text-sm sm:text-base break-words">
                                {child.firstName} {child.lastName}
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
                  {state.selectedChildren.length > 0 && (
                    <div className="mt-3 p-3 bg-indigo-50 rounded-lg">
                      <p className="text-sm text-indigo-800">
                        <strong>Selected:</strong> {state.selectedChildren.length} child{state.selectedChildren.length > 1 ? 'ren' : ''}
                      </p>
                    </div>
                  )}
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

          {/* Payment step */}
          {step === 'payment' && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaCreditCard className="text-indigo-600" />
                Payment Information
              </h4>

              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <FaLock className="text-green-600 text-sm" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 text-sm sm:text-base">Secure Payment</h5>
                      <p className="text-xs sm:text-sm text-gray-600">Powered by Stripe</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Card number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={state.paymentMethod?.cardNumber || ''}
                      onChange={(e) => onPaymentChange('cardNumber', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-base sm:text-lg"
                      maxLength={19}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expiry date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={state.paymentMethod?.expiryDate || ''}
                        onChange={(e) => onPaymentChange('expiryDate', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CVC</label>
                      <input
                        type="text"
                        placeholder="123"
                        value={state.paymentMethod?.cvv || ''}
                        onChange={(e) => onPaymentChange('cvv', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                        maxLength={4}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name on card</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={state.paymentMethod?.cardholderName || ''}
                      onChange={(e) => onPaymentChange('cardholderName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Course enrollment</span>
                      <span className="text-sm font-medium text-gray-900">
                        ${'{'}course.credits ? course.credits * state.selectedChildren.length : 0{'}'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-lg font-semibold text-gray-900">
                      <span>Total</span>
                      <span>${'{'}course.credits ? course.credits * state.selectedChildren.length : 0{'}'}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <FaLock className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Your payment is secure</p>
                      <p className="text-blue-700">We use industry-standard encryption to protect your payment information.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation step */}
          {step === 'confirmation' && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaCheck className="text-green-600" />
                Confirm Enrollment
              </h4>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 sm:p-6 border border-green-100 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <FaCheck className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">Ready to Enroll!</h5>
                    <p className="text-sm text-gray-600">Please review your enrollment details below</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
                  <h5 className="font-semibold text-gray-900 mb-3">Course Information</h5>
                  <div className="space-y-2 text-sm sm:text-base">
                    <p><span className="text-gray-600">Course:</span> {course.title}</p>
                    <p><span className="text-gray-600">Coach:</span> {course.coach.name}</p>
                    <p><span className="text-gray-600">Credits:</span> {course.credits} per child</p>
                    <p><span className="text-gray-600">Children:</span> {state.selectedChildren.length}</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
                  <h5 className="font-semibold text-gray-900 mb-3">Payment Details</h5>
                  <div className="space-y-2 text-sm sm:text-base">
                    <p><span className="text-gray-600">Card:</span> **** **** **** {state.paymentMethod?.cardNumber?.slice(-4)}</p>
                    <p><span className="text-gray-600">Name:</span> {state.paymentMethod?.cardholderName}</p>
                    <p><span className="text-gray-600">Total:</span> ${(state.selectedChildren.length * course.credits * 99).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-row items-center justify-between space-x-3">
            <button onClick={step === 'children' ? onReset : onPrev} className="px-4 sm:px-6 py-2 sm:py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium flex items-center gap-2 text-sm sm:text-base">
              <FaArrowLeft />
              {step === 'children' ? 'Cancel' : 'Back'}
            </button>

            {(() => {
              const currentIndex = steps.findIndex(s => s.step === step);
              const hasNext = currentIndex >= 0 && currentIndex < steps.length - 1;
              return hasNext;
            })() && (
              <button onClick={onNext} disabled={state.selectedChildren.length === 0} className="px-4 sm:px-6 py-2 sm:py-3 text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg hover:shadow-xl text-sm sm:text-base">
                Next
                <FaArrowRight />
              </button>
            )}

            {step === 'payment' && (
              <button onClick={onNext} disabled={!canProceedPayment} className="px-4 sm:px-6 py-2 sm:py-3 text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg hover:shadow-xl text-sm sm:text-base">
                Review
                <FaArrowRight />
              </button>
            )}

            {step === 'confirmation' && (
              <button onClick={onProcessPayment} disabled={isProcessing} className="px-4 sm:px-6 py-2 sm:py-3 text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg hover:shadow-xl text-sm sm:text-base">
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaCreditCard />
                    Pay & Enroll
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentFlow;
