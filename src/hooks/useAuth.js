import { useState } from "react";
import { login, register } from "../api/auth";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await login(credentials);
      // You can handle token storage or user state here
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await register(data);
      // You can handle token storage or user state here
      return response.data;
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Registration failed"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, handleRegister, loading, error };
}
