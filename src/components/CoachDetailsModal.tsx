
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

  console.log("CoachDetailsModal rendering UI for:", coach.firstName, coach.lastName);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[98vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 sm:p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center">
                <FaUser className="text-base sm:text-2xl" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-xl lg:text-2xl font-bold truncate">{coach.firstName} {coach.lastName}</h3>
                <p className="text-blue-100 flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${coach.status === 'approved' ? 'bg-green-500 text-white' : coach.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'}`}>
                    <span className="ml-1 capitalize">{coach.status}</span>
                  </span>
                  <span className="text-xs sm:text-sm">Applied on {formatDate(coach.registrationDate)}</span>
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-all duration-200 flex-shrink-0" title="Close"><FaTimes className="text-lg sm:text-xl" /></button>
          </div>
        </div>
        {/* Coach Information Card - Improved Layout */}
        <div className="p-4 sm:p-6">
          <div className="bg-blue-50 rounded-xl p-4 sm:p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
                {coach.firstName.charAt(0)}{coach.lastName.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{coach.firstName} {coach.lastName}</h2>
                <div className="flex items-center gap-2 mb-1">
                  <FaEnvelope className="text-blue-600 text-sm" />
                  <span className="text-sm text-gray-700">{coach.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaPhone className="text-green-600 text-sm" />
                  <span className="text-sm text-gray-700">{coach.phone}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${coach.status === 'approved' ? 'bg-green-100 text-green-800' : coach.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{coach.status.charAt(0).toUpperCase() + coach.status.slice(1)}</span>
              <span className="text-xs text-gray-500">Applied on {formatDate(coach.registrationDate)}</span>
            </div>
          </div>
        </div>
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(98vh-220px)]">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              <div className="bg-white rounded-xl shadow-md p-3 sm:p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 sm:p-3 bg-blue-100 rounded-lg"><FaGraduationCap className="text-blue-600 text-base sm:text-xl" /></div>
                  <div className="ml-3 sm:ml-4"><p className="text-xs sm:text-sm font-medium text-gray-600">Teaching Domain</p><p className="text-base sm:text-xl font-bold text-gray-900">{coach.duration}</p></div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-3 sm:p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg"><FaClock className="text-yellow-600 text-base sm:text-xl" /></div>
                  <div className="ml-3 sm:ml-4"><p className="text-xs sm:text-sm font-medium text-gray-600">Experience</p><p className="text-base sm:text-xl font-bold text-gray-900">{coach.experience} years</p></div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-3 sm:p-6 border border-gray-200 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center">
                  <div className="p-2 sm:p-3 bg-green-100 rounded-lg"><FaGlobe className="text-green-600 text-base sm:text-xl" /></div>
                  <div className="ml-3 sm:ml-4"><p className="text-xs sm:text-sm font-medium text-gray-600">Languages</p><p className="text-base sm:text-xl font-bold text-gray-900">{coach.languages.length}</p></div>
                </div>
              </div>
            </div>
            {/* Personal Information */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h4 className="text-base sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center"><FaUser className="text-blue-600 mr-2" />Personal Information</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3 sm:space-y-4">
                  <div><label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Full Name</label><p className="text-sm sm:text-base text-gray-900 font-medium">{coach.firstName} {coach.lastName}</p></div>
                  <div><label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Email Address</label><p className="text-sm sm:text-base text-gray-900 break-all">{coach.email}</p></div>
                  <div><label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Phone Number</label><p className="text-sm sm:text-base text-gray-900">{coach.phone}</p></div>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div><label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Address</label><p className="text-sm sm:text-base text-gray-900">{coach.address || 'Not provided'}</p></div>
                  <div><label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Driver License</label><p className="text-sm sm:text-base text-gray-900">{coach.driverLicense || 'Not provided'}</p></div>
                  <div><label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Languages</label><div className="flex flex-wrap gap-1 sm:gap-2 mt-1">{coach.languages.map((lang, index) => (<span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm font-medium">{lang}</span>))}</div></div>
                </div>
              </div>
            </div>
            {/* Professional Information */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h4 className="text-base sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center"><FaGraduationCap className="text-blue-600 mr-2" />Professional Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div><label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Teaching Domain</label><p className="text-sm sm:text-base text-gray-900 font-medium">{coach.duration}</p></div>
                <div><label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Years of Experience</label><p className="text-sm sm:text-base text-gray-900 font-medium">{coach.experience} years</p></div>
              </div>
            </div>
            {/* Future Sections - Resume & Video */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h4 className="text-base sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center"><FaFileAlt className="text-blue-600 mr-2" />Additional Materials</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200"><div className="flex items-center mb-3"><div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3"><FaFileAlt className="text-blue-600 text-base sm:text-xl" /></div><div><p className="text-sm font-medium text-gray-700">Resume</p><p className="text-xs text-gray-500">PDF Document</p></div></div><div className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-500">Not uploaded yet</p></div></div>
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200"><div className="flex items-center mb-3"><div className="w-8 h-8 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center mr-3"><FaPlay className="text-red-600 text-base sm:text-xl" /></div><div><p className="text-sm font-medium text-gray-700">Introduction Video</p><p className="text-xs text-gray-500">MP4 Video</p></div></div><div className="relative bg-gray-200 rounded-lg overflow-hidden aspect-video"><div className="absolute inset-0 flex items-center justify-center"><div className="w-10 h-10 sm:w-16 sm:h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg"><FaPlay className="text-white text-base sm:text-xl ml-1" /></div></div><div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 sm:p-3"><p className="text-white text-xs font-medium">Introduction Video</p><p className="text-white/80 text-xs">Not uploaded yet</p></div></div></div>
              </div>
            </div>
            {/* Actions */}
            {showActions && coach.status === 'pending' && (
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-200"><h4 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center"><FaCheck className="text-green-600 mr-2" />Review Decision</h4><div className="flex flex-col sm:flex-row gap-4 sm:gap-10 justify-center"><button onClick={() => onApprove && onApprove(coach.id)} disabled={isLoading} className="w-full sm:w-40 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-5 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 font-medium text-sm shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2">{isLoading ? (<span>Loading...</span>) : (<><span>Approve</span></>)}</button><button onClick={() => confirmReject && confirmReject(coach.id)} disabled={isLoading} className="w-full sm:w-40 bg-gradient-to-r from-rose-500 to-rose-600 text-white py-3 px-5 rounded-lg hover:from-rose-600 hover:to-rose-700 transition-all duration-200 disabled:opacity-50 font-medium text-sm shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2">{isLoading ? (<span>Loading...</span>) : (<><span>Reject</span></>)}</button></div></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachDetailsModal;
