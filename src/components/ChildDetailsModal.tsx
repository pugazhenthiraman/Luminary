import React from 'react';

interface ChildDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  child?: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender?: string;
    currentGrade?: string;
    schoolName?: string;
    specialNeeds?: string;
    interests?: string[];
  } | null;
}

const ChildDetailsModal: React.FC<ChildDetailsModalProps> = ({ isOpen, onClose, child }) => {
  if (!isOpen || !child) return null;

  const fullName = `${child.firstName} ${child.lastName}`.trim();

  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const cap = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-semibold">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{fullName}</h3>
              <p className="text-xs sm:text-sm text-gray-600 truncate">Child details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
            aria-label="Close child details"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="text-xs text-gray-500">Date of Birth</div>
              <div className="text-sm font-medium text-gray-900">{child.dateOfBirth} ({calculateAge(child.dateOfBirth)} yrs)</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="text-xs text-gray-500">Gender</div>
              <div className="text-sm font-medium text-gray-900">{cap(child.gender)}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="text-xs text-gray-500">Grade</div>
              <div className="text-sm font-medium text-gray-900">{child.currentGrade || 'N/A'}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="text-xs text-gray-500">School</div>
              <div className="text-sm font-medium text-gray-900">{child.schoolName || 'N/A'}</div>
            </div>
          </div>

          {(child.specialNeeds || (child.interests && child.interests.length)) && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              {child.specialNeeds && (
                <div className="mb-3">
                  <div className="text-xs text-gray-500">Special Needs</div>
                  <div className="text-sm text-gray-800 whitespace-pre-wrap">{child.specialNeeds}</div>
                </div>
              )}
              {child.interests && child.interests.length > 0 && (
                <div>
                  <div className="text-xs text-gray-500 mb-2">Interests</div>
                  <div className="flex flex-wrap gap-2">
                    {child.interests.map((i, idx) => (
                      <span key={idx} className="px-2 py-1 rounded-full text-xs bg-indigo-50 text-indigo-700 border border-indigo-200">{i}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildDetailsModal;
