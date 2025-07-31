import React from 'react';
import { 
  FaPlus, 
  FaClock, 
  FaEdit 
} from 'react-icons/fa';

interface Session {
  id: number;
  student: string;
  course: string;
  time: string;
  duration: string;
  status: string;
}

interface ScheduleProps {
  upcomingSessions: Session[];
}

const Schedule: React.FC<ScheduleProps> = ({ upcomingSessions }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Schedule</h2>
          <p className="text-gray-600 mt-1">Manage your teaching sessions and availability</p>
        </div>
        <button className="mt-4 sm:mt-0 flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-200">
          <FaPlus className="text-sm" />
          <span>Add Session</span>
        </button>
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center py-2 text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }, (_, i) => {
            const day = i + 1;
            const hasSession = [3, 7, 12, 15, 18, 22, 25, 28].includes(day);
            return (
              <div
                key={i}
                className={`aspect-square p-2 border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
                  hasSession ? 'bg-blue-50 border-blue-300' : ''
                }`}
              >
                <div className="text-sm font-medium text-gray-800">{day}</div>
                {hasSession && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Sessions</h3>
        <div className="space-y-4">
          {upcomingSessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaClock className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">{session.student}</h4>
                  <p className="text-sm text-gray-600">{session.course}</p>
                  <p className="text-sm text-gray-500">{session.time} • {session.duration}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  session.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {session.status}
                </span>
                <button 
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  title="Edit session"
                >
                  <FaEdit />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Schedule; 