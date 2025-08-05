import React from 'react';
import { FaStar } from 'react-icons/fa';

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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Email</label>
                <input
                  type="email"
                  defaultValue={coachData.email}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Experience</label>
                <input
                  type="text"
                  defaultValue={coachData.experience}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="e.g., 5 years teaching"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Specialization</label>
                <input
                  type="text"
                  defaultValue={coachData.specialization}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="e.g., Mathematics, Physics"
                />
              </div>
            </div>
            <button className="mt-4 bg-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm sm:text-base font-medium">
              Save Changes
            </button>
          </div>

          {/* Bio Section */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Bio</h3>
            <textarea
              rows={4}
              placeholder="Tell students about your teaching experience and expertise..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
            />
            <button className="mt-4 bg-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm sm:text-base font-medium">
              Update Bio
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
                <span className="text-sm sm:text-base font-semibold">${coachData.totalEarnings.toLocaleString()}</span>
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