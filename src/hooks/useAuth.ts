import { useState } from "react";

// Coach credentials for demo
const COACH_CREDENTIALS = {
  email: "pugazhenthi962003@gmail.com",
  password: "@Pugal2003"
};

// Mock coach data
const COACH_DATA = {
  id: "coach-001",
  email: "pugazhenthi962003@gmail.com",
  name: "Pugazhenthi",
  role: "COACH",
  isVerified: true
};

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulate login
  const login = async ({ email, password, role }: any) => {
    setIsLoading(true);
    setError(null);
    await new Promise((res) => setTimeout(res, 800));
    setIsLoading(false);

    // Coach authentication is now handled directly in the login component
    // This hook is kept for other authentication scenarios

    // Check for admin credentials
    if (email === "admin@gmail.com" && password === "@Admin123") {
      const adminData = {
        id: 'admin-001',
        email: 'admin@gmail.com',
        name: 'Admin User',
        role: 'ADMIN',
        isVerified: true
      };
      localStorage.setItem('user', JSON.stringify(adminData));
      localStorage.setItem('activeRole', 'ADMIN');
      return { success: true };
    }

    // Fake logic: accept any email/password, but require role selection for demo
    if (email === "verify@demo.com") {
      setError("email_not_verified");
      return { success: false };
    }
    if (email && password) {
      if (email === "multi@demo.com") {
        return { success: true, requiresRoleSelection: true, availableRoles: ["ENDUSER", "EXPERT"] };
      }
      return { success: true };
    }
    setError("Invalid credentials");
    return { success: false };
  };

  const forgotPassword = async (email: string, role: string) => {
    setIsLoading(true);
    setError(null);
    await new Promise((res) => setTimeout(res, 800));
    setIsLoading(false);
    if (email) return true;
    setError("Email not found");
    return false;
  };

  const resetPassword = async (token: string, newPassword: string, email: string, role: string) => {
    setIsLoading(true);
    setError(null);
    await new Promise((res) => setTimeout(res, 800));
    setIsLoading(false);
    if (token && newPassword && email) return true;
    setError("Reset failed");
    return false;
  };

  const verifyEmail = async (email: string, code: string) => {
    setIsLoading(true);
    setError(null);
    await new Promise((res) => setTimeout(res, 800));
    setIsLoading(false);
    if (code === "123456") {
      return { success: true, user: { availableRoles: ["ENDUSER"] } };
    }
    setError("Invalid code");
    return { success: false };
  };

  const selectRole = async (role: string) => {
    setIsLoading(true);
    setError(null);
    await new Promise((res) => setTimeout(res, 800));
    setIsLoading(false);
    return true;
  };

  const clearError = () => setError(null);

  return {
    isLoading,
    error,
    login,
    forgotPassword,
    resetPassword,
    verifyEmail,
    selectRole,
    clearError,
  };
}