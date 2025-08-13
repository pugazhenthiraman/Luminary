import { useState } from "react";
import { login, register, logout as logoutApi, adminLogin } from "../api/auth";
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
      const errorMessage = err.response?.data?.message || err.message || "Login failed";
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
      const errorMessage = err.response?.data?.message || err.message || "Registration failed";
      setError(errorMessage);
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

  return {
    handleLogin,
    handleAdminLogin,
    handleRegister,
    handleLogout,
    loading,
    error,
    setError
  };
}