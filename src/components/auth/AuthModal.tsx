/**
 * Auth Modal Component
 *
 * Modal that shows login or signup form with toggle.
 *
 * @module src/components/auth/AuthModal
 */

'use client';

import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

/**
 * Auth Modal Props
 */
interface AuthModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Called when modal should close */
  onClose: () => void;
  /** Called after successful auth */
  onSuccess?: () => void;
  /** Initial mode to show */
  initialMode?: 'login' | 'signup';
}

/**
 * Auth Modal Component
 *
 * @example
 * <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
 */
export function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onClose();
    onSuccess?.();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </h2>

          {/* Form */}
          {mode === 'login' ? (
            <LoginForm
              onSuccess={handleSuccess}
              onSignupClick={() => setMode('signup')}
            />
          ) : (
            <SignupForm
              onSuccess={handleSuccess}
              onLoginClick={() => setMode('login')}
            />
          )}
        </div>
      </div>
    </div>
  );
}