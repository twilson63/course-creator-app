/**
 * Root Providers Component
 *
 * Wraps the app with all necessary context providers.
 * This is a client component.
 *
 * @module src/app/providers
 */

'use client';

import { AuthProvider } from '@/contexts/AuthContext';

/**
 * Root Providers
 *
 * Provides all context providers to children.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}