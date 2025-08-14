import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';

const SessionBlockOverlay: React.FC = () => {
  const { sessionBlock, clearSessionBlock, logout } = useAuthStore();
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (sessionBlock?.active) {
      setCountdown(10);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null) return prev;
          if (prev <= 1) {
            clearInterval(timer);
            // Auto-logout
            clearSessionBlock();
            logout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setCountdown(null);
    }
  }, [sessionBlock?.active]);

  if (!sessionBlock?.active) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60">
      <div className="bg-white w-11/12 max-w-md rounded-lg shadow-xl p-6 text-center">
        <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-red-600">
            <path fillRule="evenodd" d="M12 2.25c.414 0 .75.336.75.75v6a.75.75 0 01-1.5 0v-6c0-.414.336-.75.75-.75zm0 12a.75.75 0 01.75.75v6a.75.75 0 01-1.5 0v-6c0-.414.336-.75.75-.75z" clipRule="evenodd" />
            <path d="M3.53 7.47a.75.75 0 011.06 0l3.182 3.182a.75.75 0 01-1.06 1.06L3.53 8.53a.75.75 0 010-1.06zm12.698 12.698a.75.75 0 001.06 0l3.182-3.182a.75.75 0 10-1.06-1.06l-3.182 3.182a.75.75 0 000 1.06z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Session Ending</h2>
        <p className="text-gray-700 mb-4">
          {sessionBlock.message || 'Your account is suspended or deactivated by Admin.'}
        </p>
        <p className="text-sm text-gray-500 mb-6">You will be signed out automatically in {countdown ?? 10} seconds.</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => {
              clearSessionBlock();
              logout();
            }}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
          >
            Sign out now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionBlockOverlay;
