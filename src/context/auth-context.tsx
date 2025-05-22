'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  refreshAuthToken,
} from '@/store/slices/authSlice';
import { User } from '@/types';
import { persistor } from '@/store/index';
import { isTokenExpired, willTokenExpireSoon } from '@/utils/tokenUtils';

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
};

type RegisterData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  roles: string[];
  phone: string;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const { user, isLoading, error } = useAppSelector((state) => state.auth);

  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const validateSession = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
          if (user) {
            await dispatch(logoutUser());
          }
          return;
        }

        // Check if token is expired or about to expire
        if (isTokenExpired(token)) {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              await dispatch(refreshAuthToken()).unwrap();
              return; // Successfully refreshed, no need to get user
            } catch (refreshError) {
              console.log('Token refresh failed', refreshError);
              await dispatch(logoutUser());
              return;
            }
          } else {
            // No refresh token available, log out
            await dispatch(logoutUser());
            return;
          }
        }

        // If token is valid but will expire soon, try to refresh proactively
        if (willTokenExpireSoon(token)) {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              await dispatch(refreshAuthToken()).unwrap();
              return;
            } catch (refreshError) {
              console.log('Proactive refresh failed', refreshError);
              // Continue with current token since it's still valid
            }
          }
        }

        // Finally, verify the user data matches our token
        if (!user) {
          await dispatch(getCurrentUser()).unwrap();
        }
      } catch (error) {
        console.log('Session validation error', error);
      } finally {
        if (isInitializing) {
          setIsInitializing(false);
        }
      }
    };

    // Initial validation
    validateSession();

    // Set up interval for checking token (every 5 minutes)
    interval = setInterval(validateSession, 5 * 60 * 1000);

    // Listen for storage events
    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key === 'token' ||
        event.key === 'refreshToken' ||
        event.key === 'user'
      ) {
        validateSession();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [dispatch, user, isInitializing]);

  const login = async (email: string, password: string) => {
    try {
      await dispatch(loginUser({ email, password })).unwrap();
      router.push('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      await dispatch(registerUser(userData)).unwrap();
      await router.push('/dashboard');
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const logout = async () => {
    try {
      // First, dispatch logout action to clear auth state and localStorage
      await dispatch(logoutUser()).unwrap();

      // Then purge all persisted Redux states
      await persistor.purge();

      // Redirect to login page
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      // Even if logout fails, still attempt to clear state and redirect
      await persistor.purge();
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
