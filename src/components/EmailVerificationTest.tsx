import React, { useState } from 'react';
import EmailVerification from './EmailVerification';


/**
 * Test component to verify EmailVerification integration
 * This can be temporarily added to test the email verification flow
 */
const EmailVerificationTest: React.FC = () => {
  const [showVerification, setShowVerification] = useState(false);
  const [testData, setTestData] = useState({
    email: 'test@example.com',
    firstName: 'Test',
    userType: 'parent' as 'parent' | 'coach'
  });


  const handleVerificationSuccess = (userData: any) => {
    console.log('Verification successful:', userData);
    alert('Email verification successful! Check console for details.');
    setShowVerification(false);
  };


  const handleBack = () => {
    console.log('Back button clicked');
    setShowVerification(false);
  };


  const handleInputChange = (field: string, value: string) => {
    setTestData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  if (showVerification) {
    return (
      <EmailVerification
        email={testData.email}
        firstName={testData.firstName}
        userType={testData.userType}
        onVerificationSuccess={handleVerificationSuccess}
        onBack={handleBack}
      />
    );
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Email Verification Test
        </h2>
       
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Email
            </label>
            <input
              type="email"
              value={testData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter test email"
            />
          </div>
         
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              value={testData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter first name"
            />
          </div>
         
          <div>
            <label
              htmlFor="userType"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              User Type
            </label>
            <select
              id="userType"
              value={testData.userType}
              onChange={(e) => handleInputChange('userType', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="parent">Parent</option>
              <option value="coach">Coach</option>
            </select>
          </div>
         
          <button
            onClick={() => setShowVerification(true)}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Test Email Verification
          </button>
        </div>
       
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">Test Instructions:</h3>
          <ol className="text-sm text-gray-600 space-y-1">
            <li>1. Enter test email and name above</li>
            <li>2. Click "Test Email Verification"</li>
            <li>3. You'll see the verification component</li>
            <li>4. Test the UI and functionality</li>
            <li>5. Use back button to return here</li>
          </ol>
        </div>
       
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> This is a test component. For actual verification,
            you need a real email that received a verification code from the backend.
          </p>
        </div>
      </div>
    </div>
  );
};


export default EmailVerificationTest;



