/**
 * 404 Not Found Page
 *
 * For SPA routing, this page handles unknown routes.
 * Redirects to home page with current path preserved.
 *
 * @module src/app/not-found
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Check if we have a valid route in sessionStorage
    // This handles SPA routing after page refresh
    const currentPath = window.location.pathname;
    if (currentPath && currentPath !== '/') {
      // Store the intended destination
      sessionStorage.setItem('redirect', currentPath);
    }
    // Redirect to home, which will handle the route client-side
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}