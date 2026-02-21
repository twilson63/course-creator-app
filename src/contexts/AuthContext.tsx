/**
 * Auth Context
 *
 * Provides authentication state and methods to React components.
 * Handles session persistence via localStorage.
 *
 * @module src/contexts/AuthContext
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { login as loginApi } from '@/lib/auth/login';
import { signup as signupApi } from '@/lib/auth/signup';
import { validateSession } from '@/lib/auth/session';

/** Storage key for session token */
const SESSION_KEY = 'course_creator_session';

/**
 * User object returned by auth
 */
export interface AuthUser {
  id: string;
  email: string;
}

/**
 * Auth context value
 */
interface AuthContextValue {
  /** Current user, or null if not logged in */
  user: AuthUser | null;
  /** True while checking session on mount */
  loading: boolean;
  /** Error message from last auth operation */
  error: string | null;
  /** Log in with email/password */
  login: (email: string, password: string) => Promise<boolean>;
  /** Sign up with email/password */
  signup: (email: string, password: string) => Promise<boolean>;
  /** Log out current user */
  logout: () => void;
  /** Clear any error message */
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Auth Provider Component
 *
 * Wrap your app with this to provide auth state.
 *
 * @example
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem(SESSION_KEY);
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const result = await validateSession(token);
        if (result.ok) {
          // Session is valid, but we don't have email here
          // Just set user with id (email will be fetched when needed)
          setUser({ id: result.data.userId, email: '' });
        } else {
          // Invalid session, clear it
          localStorage.removeItem(SESSION_KEY);
        }
      } catch {
        // Session validation failed, clear it
        localStorage.removeItem(SESSION_KEY);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setError(null);
    setLoading(true);

    try {
      const result = await loginApi(email, password);
      if (result.ok) {
        setUser(result.data.user);
        localStorage.setItem(SESSION_KEY, result.data.session.token);
        setLoading(false);
        return true;
      } else {
        setError(result.error);
        setLoading(false);
        return false;
      }
    } catch (err) {
      setError(String(err));
      setLoading(false);
      return false;
    }
  }, []);

  const signup = useCallback(async (email: string, password: string): Promise<boolean> => {
    setError(null);
    setLoading(true);

    try {
      const result = await signupApi(email, password);
      if (result.ok) {
        setUser(result.data.user);
        localStorage.setItem(SESSION_KEY, result.data.session.token);
        setLoading(false);
        return true;
      } else {
        setError(result.error);
        setLoading(false);
        return false;
      }
    } catch (err) {
      setError(String(err));
      setLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        signup,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 *
 * @returns Auth context value
 * @throws Error if used outside AuthProvider
 *
 * @example
 * const { user, login, logout } = useAuth();
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}