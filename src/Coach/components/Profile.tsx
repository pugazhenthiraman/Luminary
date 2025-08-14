import React, { useMemo } from 'react';
import { FaStar } from 'react-icons/fa';
import { useAuthStore } from '../../stores/useAuthStore';

interface CoachData {
  name: string;
  email: string;
  avatar: string;
  rating: number;
  totalStudents: number;
  totalCourses: number;
  totalEarnings: number;
  experience: string;
  specialization: string;
}

interface ProfileProps {
  coachData: CoachData;
}

const Profile: React.FC<ProfileProps> = ({ coachData }) => {
  const { user } = useAuthStore();
  const coachStatus: string = (user as any)?.coach?.status || (user as any)?.status || 'PENDING';
  const isFrozen: boolean = Boolean((user as any)?.coach?.isFrozen || (user as any)?.isFrozen);
  const canEdit = coachStatus?.toUpperCase() === 'PENDING' && !isFrozen;
  const lockMessage = useMemo(() => {
    if (coachStatus?.toUpperCase() !== 'PENDING') {
      return 'Profile editing is available only while your application is Pending.';
    }
    if (isFrozen) {
      return 'Your profile has been frozen by Admin during review. You can view but cannot edit until it is unfrozen.';
    }
    return '';
  }, [coachStatus, isFrozen]);

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Profile</h2>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Manage your personal information and settings</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Profile Info */}
        <div className="xl:col-span-2 space-y-4 sm:space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Full Name</label>
                <input
                  type="text"
                  defaultValue={coachData.name}
                  disabled={!canEdit}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base ${!canEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Email</label>
                <input
                  type="email"
                  defaultValue={coachData.email}
                  disabled={!canEdit}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base ${!canEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Experience</label>
                <input
                  type="text"
                  defaultValue={coachData.experience}
                  disabled={!canEdit}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base ${!canEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="e.g., 5 years teaching"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Specialization</label>
                <input
                  type="text"
                  defaultValue={coachData.specialization}
                  disabled={!canEdit}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base ${!canEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="e.g., Mathematics, Physics"
                />
              </div>
            </div>
            <button disabled={!canEdit} className={`mt-4 px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors duration-200 text-sm sm:text-base font-medium ${canEdit ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}>
              {canEdit ? 'Save Changes' : 'Editing Locked'}
            </button>
            {!canEdit && (
              <p className="mt-2 text-sm text-gray-600">{lockMessage}</p>
            )}
          </div>

          {/* Bio Section */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Bio</h3>
            <textarea
              rows={4}
              placeholder="Tell students about your teaching experience and expertise..."
              disabled={!canEdit}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base ${!canEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
            <button disabled={!canEdit} className={`mt-4 px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors duration-200 text-sm sm:text-base font-medium ${canEdit ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}>
              {canEdit ? 'Update Bio' : 'Editing Locked'}
            </button>
          </div>
        </div>

        {/* Profile Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 text-center">
            <img
              src={coachData.avatar}
              alt={coachData.name}
              className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full mx-auto mb-3 sm:mb-4 object-cover"
            />
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2">{coachData.name}</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{coachData.specialization}</p>
            <div className="flex items-center justify-center space-x-1 text-yellow-500 mb-3 sm:mb-4">
              <FaStar className="text-sm sm:text-base" />
              <span className="text-sm sm:text-base font-medium">{coachData.rating}</span>
              <span className="text-gray-500 text-xs sm:text-sm">(89 reviews)</span>
            </div>
            <button className="w-full bg-gray-100 text-gray-700 py-2 sm:py-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm sm:text-base font-medium">
              Change Photo
            </button>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Quick Stats</h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base text-gray-600">Total Students</span>
                <span className="text-sm sm:text-base font-semibold">{coachData.totalStudents}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base text-gray-600">Total Courses</span>
                <span className="text-sm sm:text-base font-semibold">{coachData.totalCourses}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base text-gray-600">Total Earnings</span>
                <span className="text-sm sm:text-base font-semibold">${(coachData.totalEarnings ?? 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base text-gray-600">Experience</span>
                <span className="text-sm sm:text-base font-semibold">{coachData.experience}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;