/**
 * Signup Flow
 *
 * Handles user registration with email/password validation.
 *
 * @module src/lib/auth/signup
 */

import { hashPassword } from './password';
import { createSession } from './session';
import { dataApi } from '@/lib/hyper-micro';

/** Email regex pattern */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Minimum password length */
const MIN_PASSWORD_LENGTH = 8;

/**
 * Result of signup attempt
 */
export type SignupResult =
  | { ok: true; data: { user: { id: string; email: string }; session: { token: string } } }
  | { ok: false; error: string };

/**
 * Validate email format
 *
 * @param email - Email to validate
 * @returns true if valid
 */
export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Validate password strength
 *
 * @param password - Password to validate
 * @returns Object with valid boolean and optional error message
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return { valid: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` };
  }

  return { valid: true };
}

/**
 * Sign up a new user
 *
 * @param email - User email
 * @param password - Plain text password
 * @returns Result with user and session, or error
 *
 * @example
 * const result = await signup('user@example.com', 'securePassword');
 * if (result.ok) {
 *   // User created, session started
 *   const token = result.data.session.token;
 * }
 */
export async function signup(email: string, password: string): Promise<SignupResult> {
  // Validate email
  if (!validateEmail(email)) {
    return { ok: false, error: 'Invalid email format' };
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return { ok: false, error: passwordValidation.error || 'Invalid password' };
  }

  // Normalize email
  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Check if user already exists
    const existingUser = await dataApi.getDocument('users', normalizedEmail);
    if (existingUser.ok) {
      return { ok: false, error: 'An account with this email already exists' };
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate user ID
    const userId = crypto.randomUUID();

    // Create user record
    const user = {
      id: userId,
      email: normalizedEmail,
      password_hash: passwordHash,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Store user (keyed by email for lookup)
    await dataApi.createDocument('users', normalizedEmail, user);

    // Create session
    const sessionResult = createSession(userId);
    if (!sessionResult.ok) {
      return { ok: false, error: 'Failed to create session' };
    }

    return {
      ok: true,
      data: {
        user: { id: userId, email: normalizedEmail },
        session: { token: sessionResult.data.token },
      },
    };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}