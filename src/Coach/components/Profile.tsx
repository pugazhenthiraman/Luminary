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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Profile</h2>
        <p className="text-gray-600 mt-1">Manage your personal information and settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  defaultValue={coachData.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  defaultValue={coachData.email}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                <input
                  type="text"
                  defaultValue={coachData.experience}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                <input
                  type="text"
                  defaultValue={coachData.specialization}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
              Save Changes
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Bio</h3>
            <textarea
              rows={4}
              placeholder="Tell students about your teaching experience and expertise..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
              Update Bio
            </button>
          </div>
        </div>

        {/* Profile Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
            <img
              src={coachData.avatar}
              alt={coachData.name}
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
            />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{coachData.name}</h3>
            <p className="text-gray-600 mb-4">{coachData.specialization}</p>
            <div className="flex items-center justify-center space-x-1 text-yellow-500 mb-4">
              <FaStar />
              <span className="text-sm font-medium">{coachData.rating}</span>
              <span className="text-gray-500 text-sm">(89 reviews)</span>
            </div>
            <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200">
              Change Photo
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Students</span>
                <span className="font-semibold">{coachData.totalStudents}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Courses</span>
                <span className="font-semibold">{coachData.totalCourses}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Earnings</span>
                <span className="font-semibold">${coachData.totalEarnings.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Experience</span>
                <span className="font-semibold">{coachData.experience}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 