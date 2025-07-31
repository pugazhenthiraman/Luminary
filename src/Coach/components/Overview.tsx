import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaPlus, 
  FaBook, 
  FaVideo, 
  FaCalendarAlt, 
  FaStar, 
  FaClock, 
  FaUsers, 
  FaDollarSign 
} from 'react-icons/fa';

interface OverviewProps {
  coachData: {
    name: string;
    totalStudents: number;
    totalCourses: number;
    totalEarnings: number;
    rating: number;
  };
  recentActivity: Array<{
    id: number;
    title: string;
    description: string;
    time: string;
    icon: any;
  }>;
  upcomingSessions: Array<{
    id: number;
    student: string;
    course: string;
    time: string;
    duration: string;
    status: string;
  }>;
  onTabChange?: (tab: string) => void;
}

const Overview: React.FC<OverviewProps> = ({ coachData, recentActivity, upcomingSessions, onTabChange }) => {
  const navigate = useNavigate();

  const handleCreateCourse = () => {
    if (onTabChange) {
      onTabChange('courses');
    }
  };

  const handleUploadVideo = () => {
    if (onTabChange) {
      onTabChange('videos');
    }
  };

  const handleScheduleSession = () => {
    if (onTabChange) {
      onTabChange('schedule');
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Trained Students</p>
              <p className="text-3xl font-bold">{coachData.totalStudents}</p>
              <p className="text-blue-100 text-sm">+12% this month</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <FaUsers className="text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Courses</p>
              <p className="text-3xl font-bold">{coachData.totalCourses}</p>
              <p className="text-green-100 text-sm">+2 this month</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <FaBook className="text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Earnings</p>
              <p className="text-3xl font-bold">${coachData.totalEarnings.toLocaleString()}</p>
              <p className="text-purple-100 text-sm">+18% this month</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <FaDollarSign className="text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Rating</p>
              <p className="text-3xl font-bold">{coachData.rating}</p>
              <p className="text-orange-100 text-sm">Based on 89 reviews</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <FaStar className="text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={handleCreateCourse}
            className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          >
            <FaPlus className="text-lg" />
            <span className="font-medium">Create Course</span>
          </button>
          <button 
            onClick={handleUploadVideo}
            className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105"
          >
            <FaVideo className="text-lg" />
            <span className="font-medium">Upload Video</span>
          </button>
          <button 
            onClick={handleScheduleSession}
            className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 transform hover:scale-105"
          >
            <FaCalendarAlt className="text-lg" />
            <span className="font-medium">Schedule Session</span>
          </button>
        </div>
      </div>

      {/* Recent Activity & Upcoming Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <activity.icon className="text-indigo-600 text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Sessions</h3>
          <div className="space-y-4">
            {upcomingSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaClock className="text-blue-600 text-sm" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{session.student}</p>
                    <p className="text-xs text-gray-600">{session.course}</p>
                    <p className="text-xs text-gray-500">{session.time} • {session.duration}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    session.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {session.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview; 