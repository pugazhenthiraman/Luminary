import React from 'react';
import { 
  FaDollarSign, 
  FaUsers, 
  FaEye, 
  FaCheckCircle 
} from 'react-icons/fa';

const Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Analytics</h2>
        <p className="text-gray-600 mt-1">Track your performance and growth</p>
      </div>

      {/* Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Monthly Earnings</h3>
            <FaDollarSign className="text-green-500 text-xl" />
          </div>
          <p className="text-3xl font-bold text-gray-800">$6,240</p>
          <p className="text-green-600 text-sm font-medium">+12.5% from last month</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Student Growth</h3>
            <FaUsers className="text-blue-500 text-xl" />
          </div>
          <p className="text-3xl font-bold text-gray-800">+28</p>
          <p className="text-blue-600 text-sm font-medium">+8.2% from last month</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Course Views</h3>
            <FaEye className="text-purple-500 text-xl" />
          </div>
          <p className="text-3xl font-bold text-gray-800">2,240</p>
          <p className="text-purple-600 text-sm font-medium">+15.3% from last month</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Completion Rate</h3>
            <FaCheckCircle className="text-orange-500 text-xl" />
          </div>
          <p className="text-3xl font-bold text-gray-800">87%</p>
          <p className="text-orange-600 text-sm font-medium">+3.2% from last month</p>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Earnings Trend</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart will be displayed here</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Student Engagement</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 