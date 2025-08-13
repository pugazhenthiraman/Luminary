import React from 'react';
import { FaUser, FaTimes, FaGraduationCap, FaClock, FaGlobe, FaFileAlt, FaPlay, FaCheck, FaEnvelope, FaPhone } from 'react-icons/fa';
import { CoachData } from '../Admin/components/CoachApproval';

interface CoachDetailsModalProps {
  coach: CoachData;
  show: boolean;
  onClose: () => void;
  onApprove?: (coachId: string) => void;
  onReject?: (coachId: string) => void;
  isLoading?: boolean;
  showActions?: boolean;
  confirmReject?: (coachId: string) => void;
}

const CoachDetailsModal: React.FC<CoachDetailsModalProps> = ({
  coach,
  show,
  onClose,
  onApprove,
  onReject,
  isLoading = false,
  showActions = false,
  confirmReject,
}) => {
  console.log("CoachDetailsModal render:", { show, coach: coach?.firstName, coachId: coach?.id });
  
  if (!show || !coach) {
    console.log("CoachDetailsModal not showing:", { show, hasCoach: !!coach });
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] sm:max-h-[98vh] overflow-hidden touch-pan-y">
        {/* Mobile drag indicator */}
        <div className="sm:hidden w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-2"></div>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 sm:p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <FaUser className="text-sm sm:text-2xl" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-xl lg:text-2xl font-bold truncate">{coach.firstName} {coach.lastName}</h3>
                <p className="text-blue-100 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${coach.status === 'approved' ? 'bg-green-500 text-white' : coach.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'}`}>
                    <span className="ml-1 capitalize">{coach.status}</span>
                  </span>
                  <span className="text-xs sm:text-sm">Applied on {formatDate(coach.registrationDate)}</span>
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-all duration-200 flex-shrink-0 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center" 
              title="Close"
              aria-label="Close modal"
            >
              <FaTimes className="text-lg sm:text-xl" />
            </button>
          </div>
        </div>

        {/* Coach Information Card - Perfect Mobile, Fixed Desktop */}
        <div className="p-3 sm:p-6">
          <div className="bg-blue-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
            {/* Mobile: Stack vertically, Desktop: Side by side */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
              
              {/* Coach Info Section */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 flex-1">
                {/* Avatar */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl sm:text-3xl font-bold flex-shrink-0 mx-auto sm:mx-0">
                  {coach.firstName.charAt(0)}{coach.lastName.charAt(0)}
                </div>
                
                {/* Contact Details - Better desktop spacing */}
                <div className="flex-1 space-y-2 sm:space-y-3">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 text-center sm:text-left mb-2 sm:mb-3">{coach.firstName} {coach.lastName}</h2>
                  
                  {/* Email - Better desktop spacing */}
                  <div className="flex items-center gap-3 justify-center sm:justify-start py-1 sm:py-2">
                    <FaEnvelope className="text-blue-600 text-sm flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-700 break-all text-center sm:text-left">{coach.email}</span>
                  </div>
                  
                  {/* Phone - Better desktop spacing */}
                  <div className="flex items-center gap-3 justify-center sm:justify-start py-1 sm:py-2">
                    <FaPhone className="text-green-600 text-sm flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-700 text-center sm:text-left font-mono">{coach.phone}</span>
                  </div>
                </div>
              </div>
              
              {/* Status Section */}
              <div className="flex flex-row sm:flex-col gap-3 sm:gap-2 items-center sm:items-end justify-center sm:justify-start">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${coach.status === 'approved' ? 'bg-green-100 text-green-800' : coach.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                  {coach.status.charAt(0).toUpperCase() + coach.status.slice(1)}
                </span>
                <span className="text-xs text-gray-500 whitespace-nowrap text-center sm:text-right">Applied on {formatDate(coach.registrationDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content - Mobile optimized scrolling */}
        <div className="overflow-y-auto max-h-[calc(98vh-200px)] sm:max-h-[calc(98vh-220px)]">
          <div className="p-3 sm:p-6 space-y-3 sm:space-y-6 pb-6">
            
            {/* Quick Stats - Updated for real API data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              <div className="bg-white rounded-xl shadow-md p-3 sm:p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 sm:p-3 bg-blue-100 rounded-lg"><FaGraduationCap className="text-blue-600 text-base sm:text-xl" /></div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Specialization</p>
                    <p className="text-base sm:text-xl font-bold text-gray-900">{coach.specializations?.[0] || 'General'}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-3 sm:p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg"><FaClock className="text-yellow-600 text-base sm:text-xl" /></div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Experience</p>
                    <p className="text-base sm:text-xl font-bold text-gray-900">{coach.experience?.split(' ')[0] || '0'} years</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-3 sm:p-6 border border-gray-200 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center">
                  <div className="p-2 sm:p-3 bg-green-100 rounded-lg"><FaGlobe className="text-green-600 text-base sm:text-xl" /></div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Languages</p>
                    <p className="text-base sm:text-xl font-bold text-gray-900">{coach.languages?.length || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section - New */}
            {coach.bio && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-blue-100">
                <h4 className="text-base sm:text-xl font-bold text-gray-900 mb-3 flex items-center">
                  <FaUser className="text-blue-600 mr-2" />About
                </h4>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{coach.bio}</p>
              </div>
            )}

            {/* Courses Section - Updated */}
            {coach.courses && coach.courses.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-200">
                <h4 className="text-base sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                  <FaGraduationCap className="text-blue-600 mr-2" />Teaching Courses
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {coach.courses.map((course, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-sm sm:text-base font-medium text-gray-900">{course}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Information - Fixed Desktop Width */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-8">
              <h4 className="text-base sm:text-xl font-bold text-gray-900 mb-4 sm:mb-8 flex items-center">
                <FaUser className="text-blue-600 mr-2" />Contact Information
              </h4>
              
              {/* Mobile: Single column, Desktop: Single wide column for better spacing */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-12">
                
                {/* Left Column - Wider cards */}
                <div className="space-y-5 sm:space-y-6">
                  <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-3">Full Name</label>
                    <p className="text-sm sm:text-lg text-gray-900 font-medium">{coach.firstName} {coach.lastName}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <FaEnvelope className="text-blue-600 mr-2 text-xs" />Email Address
                    </label>
                    <p className="text-sm sm:text-lg text-gray-900 break-all leading-relaxed font-medium">{coach.email}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <FaPhone className="text-green-600 mr-2 text-xs" />Phone Number
                    </label>
                    <p className="text-sm sm:text-lg text-gray-900 font-mono tracking-wide font-medium">{coach.phone}</p>
                  </div>
                </div>
                
                {/* Right Column - Wider cards */}
                <div className="space-y-5 sm:space-y-6">
                  <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-3">Address</label>
                    <p className="text-sm sm:text-lg text-gray-900 leading-relaxed font-medium">{coach.address || 'Not provided'}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <FaGlobe className="text-blue-600 mr-2 text-xs" />Languages
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {coach.languages?.map((lang, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-3">Rating & Reviews</label>
                    <div className="flex items-center gap-3">
                      <span className="text-sm sm:text-lg text-gray-900 font-medium">{coach.rating || 0}/5</span>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-lg ${i < (coach.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">({coach.totalReviews || 0} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            {showActions && coach.status === 'pending' && (
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-200">
                <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <FaCheck className="text-green-600 mr-2" />Review Decision
                </h4>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 justify-center">
                  <button 
                    onClick={() => onApprove && onApprove(coach.id)} 
                    disabled={isLoading} 
                    className="w-full sm:w-40 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-5 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 font-medium text-sm shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    {isLoading ? <span>Loading...</span> : <span>Approve</span>}
                  </button>
                  <button 
                    onClick={() => confirmReject && confirmReject(coach.id)} 
                    disabled={isLoading} 
                    className="w-full sm:w-40 bg-gradient-to-r from-rose-500 to-rose-600 text-white py-3 px-5 rounded-lg hover:from-rose-600 hover:to-rose-700 transition-all duration-200 disabled:opacity-50 font-medium text-sm shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    {isLoading ? <span>Loading...</span> : <span>Reject</span>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachDetailsModal;
