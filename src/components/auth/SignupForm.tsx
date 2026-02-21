/**
 * Signup Form Component
 *
 * Email/password registration form with validation and error handling.
 *
 * @module src/components/auth/SignupForm
 */

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Signup Form Props
 */
interface SignupFormProps {
  /** Called when signup succeeds */
  onSuccess?: () => void;
  /** Called when user clicks login link */
  onLoginClick?: () => void;
}

/**
 * Signup Form Component
 *
 * @example
 * <SignupForm onSuccess={() => router.push('/dashboard')} />
 */
export function SignupForm({ onSuccess, onLoginClick }: SignupFormProps) {
  const { signup, error, clearError, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    const success = await signup(email, password);
    if (success) {
      onSuccess?.();
    }
  };

  const displayError = localError || error;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="signup-email"
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
        <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          placeholder="••••••••"
          autoComplete="new-password"
        />
        <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
      </div>

      <div>
        <label htmlFor="signup-confirm" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <input
          id="signup-confirm"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          placeholder="••••••••"
          autoComplete="new-password"
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
        {loading ? 'Creating account...' : 'Create account'}
      </button>

      {onLoginClick && (
        <div className="text-center text-sm">
          <span className="text-gray-600">Already have an account? </span>
          <button
            type="button"
            onClick={onLoginClick}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Sign in
          </button>
        </div>
      )}
    </form>
  );
}