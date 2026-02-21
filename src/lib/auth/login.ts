/**
 * Login Flow
 *
 * Handles user authentication with email/password.
 *
 * @module src/lib/auth/login
 */

import { verifyPassword } from './password';
import { createSession } from './session';
import { dataApi } from '@/lib/hyper-micro';
import { validateEmail } from './signup';

/**
 * Result of login attempt
 */
export type LoginResult =
  | { ok: true; data: { user: { id: string; email: string }; session: { token: string } } }
  | { ok: false; error: string };

/**
 * Log in an existing user
 *
 * @param email - User email
 * @param password - Plain text password
 * @returns Result with user and session, or error
 *
 * @example
 * const result = await login('user@example.com', 'password');
 * if (result.ok) {
 *   // Authentication successful
 *   const token = result.data.session.token;
 * }
 */
export async function login(email: string, password: string): Promise<LoginResult> {
  // Validate email format
  if (!validateEmail(email)) {
    return { ok: false, error: 'Invalid email format' };
  }

  // Check password is provided
  if (!password) {
    return { ok: false, error: 'Password is required' };
  }

  // Normalize email
  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Look up user by email
    const userResult = await dataApi.getDocument('users', normalizedEmail);

    if (!userResult.ok || !userResult.data) {
      return { ok: false, error: 'Invalid credentials' };
    }

    const user = userResult.data as { id: string; email: string; password_hash: string };

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      return { ok: false, error: 'Invalid credentials' };
    }

    // Create session
    const sessionResult = createSession(user.id);
    if (!sessionResult.ok) {
      return { ok: false, error: 'Failed to create session' };
    }

    return {
      ok: true,
      data: {
        user: { id: user.id, email: user.email },
        session: { token: sessionResult.data.token },
      },
    };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}