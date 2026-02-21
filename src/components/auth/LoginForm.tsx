/**
 * Login Form Component
 *
 * Email/password login form with validation and error handling.
 *
 * @module src/components/auth/LoginForm
 */

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Login Form Props
 */
interface LoginFormProps {
  /** Called when login succeeds */
  onSuccess?: () => void;
  /** Called when user clicks signup link */
  onSignupClick?: () => void;
}

/**
 * Login Form Component
 *
 * @example
 * <LoginForm onSuccess={() => router.push('/dashboard')} />
 */
export function LoginForm({ onSuccess, onSignupClick }: LoginFormProps) {
  const { login, error, clearError, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    // Basic validation
    if (!email) {
      setLocalError('Email is required');
      return;
    }
    if (!password) {
      setLocalError('Password is required');
      return;
    }

    const success = await login(email, password);
    if (success) {
      onSuccess?.();
    }
  };

  const displayError = localError || error;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>

      {displayError && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
          {displayError}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>

      {onSignupClick && (
        <div className="text-center text-sm">
          <span className="text-gray-600">Don&apos;t have an account? </span>
          <button
            type="button"
            onClick={onSignupClick}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Sign up
          </button>
        </div>
      )}
    </form>
  );
}