import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaArrowRight } from 'react-icons/fa';

const ReapplySuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full">
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <FaCheckCircle className="text-5xl text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Application Resubmitted Successfully! 🎉
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for updating your coach application
          </p>
        </div>

        {/* What's Next */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">What Happens Next?</h2>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                1
              </div>
              <div>
                <p className="font-medium">Admin Review</p>
                <p className="text-sm text-gray-600">
                  Our admin team will review your updated application within 24-48 hours.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                2
              </div>
              <div>
                <p className="font-medium">Email Notification</p>
                <p className="text-sm text-gray-600">
                  You'll receive an email once your application has been reviewed.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                3
              </div>
              <div>
                <p className="font-medium">Get Started</p>
                <p className="text-sm text-gray-600">
                  If approved, you'll get access to your coach dashboard and can start creating courses!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            <strong>📧 Check Your Email:</strong> Please keep an eye on your inbox (including spam folder) for updates on your application status.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            Go to Home
            <FaArrowRight />
          </button>
        </div>

        {/* Contact Support */}
        <div className="text-center mt-6 text-sm text-gray-600">
          Have questions? Contact us at{' '}
          <a href="mailto:support@luminary.com" className="text-blue-600 hover:underline font-medium">
            support@luminary.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default ReapplySuccess;


