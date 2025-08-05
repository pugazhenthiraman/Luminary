import { useState } from "react";
import { login, register, logout as logoutApi } from "../api/auth";
import { useAuthStore } from "../stores/useAuthStore";

interface AuthResult {
  user?: any;
  [key: string]: any;
}

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { logout: logoutFromStore } = useAuthStore();

  const handleLogin = async (credentials: any): Promise<AuthResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await login(credentials);
      return response.data;
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Login failed"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: any, userType: string = 'parent'): Promise<AuthResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await register(data, userType);
      return response.data;
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Registration failed"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
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

  return { handleLogin, handleRegister, handleLogout, loading, error };
}