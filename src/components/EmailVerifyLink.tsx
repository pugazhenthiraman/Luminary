import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { showSuccessToast, showErrorToast } from './Toast';

const EmailVerifyLink: React.FC = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { handleVerifyEmailToken } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Verifying your email...');

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }
      const res = await handleVerifyEmailToken(token);
      if (!isMounted) return;
      if (res?.success) {
        setStatus('success');
        setMessage(res?.message || 'Email verified successfully');
        showSuccessToast('Email verified successfully');
        setTimeout(() => navigate('/'), 1500);
      } else {
        setStatus('error');
        const msg = res?.message || 'Email verification failed';
        setMessage(msg);
        showErrorToast(msg);
      }
    })();
    return () => { isMounted = false; };
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-200">
        {status === 'loading' && (
          <>
            <FaSpinner className="animate-spin text-indigo-600 text-3xl mx-auto mb-4" />
            <div className="text-gray-700 font-medium">{message}</div>
          </>
        )}
        {status === 'success' && (
          <>
            <FaCheckCircle className="text-green-600 text-3xl mx-auto mb-4" />
            <div className="text-gray-800 font-semibold mb-1">Email Verified</div>
            <div className="text-gray-600">Redirecting...</div>
          </>
        )}
        {status === 'error' && (
          <>
            <FaTimesCircle className="text-red-600 text-3xl mx-auto mb-4" />
            <div className="text-gray-800 font-semibold mb-1">Verification failed</div>
            <div className="text-gray-600">{message}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerifyLink;
