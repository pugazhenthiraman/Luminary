import { useState } from "react";
import { login, register, logout as logoutApi, adminLogin, refreshToken as refreshApi, getProfile, verifyEmailToken, forgotPassword as forgotPasswordApi, resetPasswordWithToken, checkVerificationStatus, verifyCurrentPassword as verifyCurrentPasswordApi, checkNewPasswordSame as checkNewPasswordSameApi } from "../api/auth";
import { useAuthStore } from "../stores/useAuthStore";

interface AuthResult {
  user?: any;
  accessToken?: string;
  refreshToken?: string;
requiresVerification?: boolean;
  [key: string]: any;
}

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { logout: logoutFromStore, login: loginToStore } = useAuthStore();

  const handleLogin = async (credentials: any): Promise<AuthResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await login(credentials);
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      
      // Backend returns { success, message, data: { user, accessToken, refreshToken } }
      // response.data contains the full response object
      if (response.data && response.data.success && response.data.data) {
        console.log('Returning data from response.data.data:', response.data.data);
        return response.data.data;
      } else if (response.data && response.data.user) {
        // Fallback for direct user data
        console.log('Returning direct user data:', response.data);
        return response.data;
      } else {
        console.error('Unexpected response structure:', response.data);
        return null;
      }
    } catch (err: any) {
      // Handle multiple roles case: backend returns 409 with roles array
      if (err.response?.status === 409) {
        const roles = err.response?.data?.data?.roles || err.response?.data?.roles;
        if (Array.isArray(roles) && roles.length > 0) {
          return { requiresRoleSelection: true, roles } as any;
        }
      }
      // Friendlier messages
      const rawMsg = err.response?.data?.message || err.message || "Login failed";
      let errorMessage = rawMsg;
      if (err.response?.status === 403 && /verify your email/i.test(rawMsg)) {
        errorMessage = 'Please verify your email before logging in. Check your inbox for the 6-digit code.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      }
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (credentials: any): Promise<AuthResult | null> => {
    console.log('🔐 useAuth handleAdminLogin started with credentials:', { email: credentials.email });
    setLoading(true);
    setError(null);
    try {
      const response = await adminLogin(credentials);
      console.log('📡 Admin login API response:', response);
      console.log('📊 Admin login response data:', response.data);
      
      // Backend returns { success, message, data: { user, accessToken, refreshToken } }
      if (response.data && response.data.success && response.data.data) {
        console.log('✅ Admin login successful, returning data:', response.data.data);
        return response.data.data;
      } else if (response.data && response.data.user) {
        // Fallback for direct user data
        console.log('✅ Admin login successful (fallback), returning user data:', response.data);
        return response.data;
      } else {
        console.error('❌ Unexpected admin response structure:', response.data);
        return null;
      }
    } catch (err: any) {
      console.error('💥 Admin login error in useAuth:', err);
      console.log('📊 Error details:', {
        response: err.response?.data,
        status: err.response?.status,
        message: err.message
      });
      const errorMessage = err.response?.data?.message || err.message || "Admin login failed";
      setError(errorMessage);
      console.log('🚨 Setting error state:', errorMessage);
      return null;
    } finally {
      console.log('🏁 Admin login finished, setting loading to false');
      setLoading(false);
    }
  };

  const handleRegister = async (data: any, userType: string = 'parent'): Promise<AuthResult | null> => {
    setLoading(true);
    setError(null);
    try {
      console.log('=== useAuth handleRegister DEBUG ===');
      console.log('Received userType:', userType);
      console.log('Received data:', data);
      
      const response = await register(data, userType);
      
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      console.log('=== END useAuth handleRegister DEBUG ===');
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      } else if (response.data && response.data.user) {
        return response.data;
      } else {
        console.error('Unexpected register response structure:', response.data);
        return null;
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      console.error('Registration error response:', err.response);
      const status = err.response?.status;
      const backendMsg: string = err.response?.data?.message || '';
      const target = err.response?.data?.data?.target || err.response?.data?.target || '';
      let friendly = 'Registration failed';
      if (status === 409) {
        friendly = 'This email is already registered for this role. Please log in or use a different email.';
      } else if (status === 400 && /Duplicate field value/i.test(backendMsg)) {
        // Prisma P2002 path: optionally include which unique hit
        if (/users_email_role_key/i.test(backendMsg) || /email, role/i.test(backendMsg) || /email_role/i.test(target)) {
          friendly = 'An account with this email already exists for this role.';
        } else {
          friendly = 'This email is already in use.';
        }
      } else if (status === 403 && /verify/i.test(backendMsg)) {
        friendly = 'Please verify your email to continue. Check your inbox for the 6-digit code.';
      } else if (status === 422) {
        friendly = 'Some fields are invalid. Please check and try again.';
      } else if (backendMsg) {
        friendly = backendMsg;
      }
      setError(friendly);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const { accessToken } = useAuthStore.getState();
      console.log('[useAuth] accessToken before logout:', accessToken);
      console.log('[useAuth] Calling logoutApi (POST /auth/logout)');
      await logoutApi();
    } catch (err: any) {
      // Even if API call fails, clear local state
      console.error('Logout API error:', err);
    } finally {
      // Always clear local state
      logoutFromStore();
      setLoading(false);
    }
  };

  // New: Refresh access token explicitly (rarely needed since axios interceptor handles this)
  const handleRefresh = async () => {
  const { refreshToken, user, login } = useAuthStore.getState();
    if (!refreshToken) return null;
    try {
      const res = await refreshApi(refreshToken);
      const newAccess = res?.data?.accessToken;
      if (newAccess) {
        if (user) {
          login(user as any, newAccess, refreshToken);
        }
        return newAccess;
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  // New: Get current user profile
  const handleGetProfile = async () => {
    try {
      const res = await getProfile();
      return res?.data?.data || res?.data;
    } catch (e) {
      return null;
    }
  };

  // New: Verify email via token from link
  const handleVerifyEmailToken = async (token: string) => {
    try {
      const res = await verifyEmailToken(token);
      return res?.data;
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Verification failed');
      return null;
    }
  };

  // New: Forgot and reset password helpers
  const handleForgotPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await forgotPasswordApi(email);
      return res?.data;
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Request failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordWithToken = async (token: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await resetPasswordWithToken(token, password);
      return res?.data;
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Reset failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCurrentPassword = async (token: string, currentPassword: string) => {
    try {
      const res = await verifyCurrentPasswordApi(token, currentPassword);
      return res?.data; // { success, data: { match }, message }
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Verification failed');
      return null;
    }
  };

  const handleCheckNewPasswordSame = async (token: string, password: string) => {
    try {
      const res = await checkNewPasswordSameApi(token, password);
      return res?.data; // { success, data: { same } }
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Check failed');
      return null;
    }
  };

  // Optional: Check email existence/verification status
  const handleCheckEmailStatus = async (email: string) => {
    try {
      const res = await checkVerificationStatus(email);
      return res?.data;
    } catch (e: any) {
      // 404 user not found is a valid state we return as null data
      if (e?.response?.status === 404) return { success: false, message: 'User not found' };
      setError(e?.response?.data?.message || e.message || 'Lookup failed');
      return null;
    }
  };

  return {
    handleLogin,
    handleAdminLogin,
    handleRegister,
    handleLogout,
  handleRefresh,
  handleGetProfile,
  handleVerifyEmailToken,
  handleForgotPassword,
  handleResetPasswordWithToken,
  handleCheckEmailStatus,
  handleVerifyCurrentPassword,
  handleCheckNewPasswordSame,
    loading,
    error,
    setError
  };
}