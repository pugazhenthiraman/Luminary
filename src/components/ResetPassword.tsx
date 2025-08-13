import React, { useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { showSuccessToast, showErrorToast } from './Toast';
import { FaCheckCircle, FaEye, FaEyeSlash, FaLock, FaTimesCircle } from 'react-icons/fa';

const ResetPassword: React.FC = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { handleResetPasswordWithToken, handleCheckNewPasswordSame } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const lastToastRef = useRef<string>('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sameAsOld, setSameAsOld] = useState<boolean | null>(null);
  const sameCheckTimer = useRef<number | null>(null);
  const lastAggregateToast = useRef<string>('');

  const rules = useMemo(() => {
    const minLen = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const matches = password.length > 0 && confirm.length > 0 && password === confirm;
    return { minLen, hasUpper, hasLower, hasNumber, hasSpecial, matches };
  }, [password, confirm]);

  const firstUnmetMessage = useMemo(() => {
    if (!rules.minLen) return 'Password must be at least 8 characters';
    if (!rules.hasUpper) return 'Include at least one uppercase letter';
    if (!rules.hasLower) return 'Include at least one lowercase letter';
    if (!rules.hasNumber) return 'Include at least one number';
    if (!rules.hasSpecial) return 'Include at least one special character (!@#$%^&*)';
    if (confirm && !rules.matches) return 'Passwords do not match';
    return '';
  }, [rules, confirm]);

  const getUnmetRules = () => {
    const unmet: string[] = [];
    if (sameAsOld) unmet.push('New password cannot be the same as old password');
    if (!rules.minLen) unmet.push('At least 8 characters');
    if (!rules.hasUpper) unmet.push('One uppercase letter');
    if (!rules.hasLower) unmet.push('One lowercase letter');
    if (!rules.hasNumber) unmet.push('One number');
    if (!rules.hasSpecial) unmet.push('One special character (!@#$%^&*)');
    if (!rules.matches) unmet.push('Passwords must match');
    return unmet;
  };

  const showAggregateToasterIfNeeded = () => {
    const unmet = getUnmetRules();
    if (unmet.length === 0) {
      lastAggregateToast.current = '';
      return;
    }
    const msg = `Please fix: • ${unmet.join(' • ')}`;
    if (lastAggregateToast.current !== msg) {
      lastAggregateToast.current = msg;
      showErrorToast(msg);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (firstUnmetMessage) {
      showErrorToast(firstUnmetMessage);
      return;
    }
    // Validate not same as old
    const check = await handleCheckNewPasswordSame(token!, password);
    if (check?.data?.same) {
      setSameAsOld(true);
      showErrorToast('New password cannot be the same as old password.');
      return;
    }
    setLoading(true);
    const res = await handleResetPasswordWithToken(token, password);
    setLoading(false);
    if (res?.success) {
      setDone(true);
      showSuccessToast('Password changed successfully.');
    } else {
      // Surface specific server message (e.g., same-as-old password)
      const msg = res?.message || 'Reset failed';
      showErrorToast(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      {!done ? (
        <form onSubmit={submit} className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 border border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 mb-4 text-center">Reset Password</h1>
          <div className="space-y-3">
            {/* New password */}
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="New password"
                value={password}
                onChange={e => {
                  const val = e.target.value;
                  setPassword(val);
                  const msg = firstUnmetMessage;
                  if (msg && lastToastRef.current !== msg) {
                    lastToastRef.current = msg;
                    showErrorToast(msg);
                  }
                  if (!msg) lastToastRef.current = '';
                  // Debounced live check against old password when possible
                  if (token) {
                    if (sameCheckTimer.current) {
                      clearTimeout(sameCheckTimer.current);
                    }
                    sameCheckTimer.current = window.setTimeout(() => {
                      handleCheckNewPasswordSame(token, val).then(r => {
                        const same = !!r?.data?.same;
                        setSameAsOld(same);
                        if (same && lastToastRef.current !== 'same-old') {
                          lastToastRef.current = 'same-old';
                          showErrorToast('New password cannot be the same as old password.');
                        }
                        if (!same && lastToastRef.current === 'same-old') {
                          lastToastRef.current = '';
                        }
                      });
                    }, 300);
                  }
                }}
                onBlur={showAggregateToasterIfNeeded}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg"
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" onClick={() => setShowNew(s => !s)} aria-label="Toggle new password visibility">
                {showNew ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {/* Confirm password */}
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirm}
                onChange={e => {
                  setConfirm(e.target.value);
                  const msg = firstUnmetMessage;
                  if (msg && lastToastRef.current !== msg) {
                    lastToastRef.current = msg;
                    showErrorToast(msg);
                  }
                  if (!msg) lastToastRef.current = '';
                }}
                onBlur={showAggregateToasterIfNeeded}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg"
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" onClick={() => setShowConfirm(s => !s)} aria-label="Toggle confirm password visibility">
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Inline rule checklist */}
          <div className="mt-4 text-sm">
            <ul className="space-y-2">
              <li className={`flex items-center gap-2 ${sameAsOld ? 'text-red-600' : 'text-gray-600'}`}>
                {sameAsOld ? <FaTimesCircle /> : <FaCheckCircle className="opacity-0" />} <span>New password cannot be the same as old password</span>
              </li>
              <li className={`flex items-center gap-2 ${rules.minLen ? 'text-green-600' : 'text-gray-600'}`}>
                {rules.minLen ? <FaCheckCircle /> : <FaTimesCircle />} <span>At least 8 characters</span>
              </li>
              <li className={`flex items-center gap-2 ${rules.hasUpper ? 'text-green-600' : 'text-gray-600'}`}>
                {rules.hasUpper ? <FaCheckCircle /> : <FaTimesCircle />} <span>One uppercase letter</span>
              </li>
              <li className={`flex items-center gap-2 ${rules.hasLower ? 'text-green-600' : 'text-gray-600'}`}>
                {rules.hasLower ? <FaCheckCircle /> : <FaTimesCircle />} <span>One lowercase letter</span>
              </li>
              <li className={`flex items-center gap-2 ${rules.hasNumber ? 'text-green-600' : 'text-gray-600'}`}>
                {rules.hasNumber ? <FaCheckCircle /> : <FaTimesCircle />} <span>One number</span>
              </li>
              <li className={`flex items-center gap-2 ${rules.hasSpecial ? 'text-green-600' : 'text-gray-600'}`}>
                {rules.hasSpecial ? <FaCheckCircle /> : <FaTimesCircle />} <span>One special character (!@#$%^&*)</span>
              </li>
              <li className={`flex items-center gap-2 ${rules.matches ? 'text-green-600' : 'text-gray-600'}`}>
                {rules.matches ? <FaCheckCircle /> : <FaTimesCircle />} <span>Passwords match</span>
              </li>
            </ul>
          </div>

          <button
            disabled={loading || !!firstUnmetMessage || sameAsOld === true}
            className="mt-5 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-3 rounded-lg font-semibold"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      ) : (
        <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 border border-gray-200 text-center">
          <div className="flex justify-center mb-3">
            <FaCheckCircle className="text-green-500 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Password changed</h2>
          <p className="text-gray-700 mb-4">You can now close this tab and return to your app to sign in with your new credentials.</p>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
