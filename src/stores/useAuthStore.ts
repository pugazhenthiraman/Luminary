import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'PARENT' | 'COACH' | 'ADMIN';
  isVerified: boolean;
  lastLogin?: string;
  // Location fields
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  // Optional nested coach payload
  coach?: {
    id?: string | number;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
    isFrozen?: boolean;
  };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // Session block overlay (e.g., admin deactivated while online)
  sessionBlock: {
    active: boolean;
    message: string;
  };
  
  // Actions
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: Partial<User>) => void;
  blockSession: (message?: string) => void;
  clearSessionBlock: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      sessionBlock: { active: false, message: '' },

      login: (user, accessToken, refreshToken) => {
        console.log('🔐 useAuthStore login called with:', {
          user: { id: user.id, email: user.email, role: user.role },
          accessToken: accessToken ? 'Present' : 'Missing',
          refreshToken: refreshToken ? 'Present' : 'Missing'
        });
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
          sessionBlock: { active: false, message: '' },
        });
        console.log('✅ useAuthStore state updated - user is now authenticated');
      },

      logout: () => {
        console.log('🚪 useAuthStore logout called');
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          sessionBlock: { active: false, message: '' },
        });
        console.log('✅ useAuthStore state cleared - user is now logged out');
      },

      setLoading: (isLoading) => set({ isLoading }),

      updateUser: (updatedUser) => set((state) => ({
        user: state.user ? { ...state.user, ...updatedUser } : null,
      })),

      blockSession: (message) => set({ sessionBlock: { active: true, message: message || 'Your account has been deactivated by Admin.' } }),
      clearSessionBlock: () => set({ sessionBlock: { active: false, message: '' } }),
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({ 
        user: state.user, 
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        sessionBlock: state.sessionBlock,
      }),
    }
  )
);