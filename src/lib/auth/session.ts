/**
 * Session Management
 *
 * Handles user sessions with tokens stored in hyper-micro.
 * Sessions expire after 30 days.
 *
 * @module src/lib/auth/session
 */

import { dataApi } from '@/lib/hyper-micro';

/** Session lifetime in milliseconds (30 days) */
const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Session data structure
 */
export interface Session {
  /** Unique session token */
  token: string;
  /** User ID this session belongs to */
  userId: string;
  /** When session was created (ISO string) */
  createdAt: string;
  /** When session expires (timestamp in ms) */
  expiresAt: number;
}

/**
 * Create a new session for a user
 *
 * @param userId - User ID to create session for
 * @returns Result with session data or error
 *
 * @example
 * const result = createSession('user-123');
 * if (result.ok) {
 *   const token = result.data.token;
 *   // Store token in localStorage/cookie
 * }
 */
export function createSession(userId: string): { ok: true; data: Session } | { ok: false; error: string } {
  try {
    // Generate secure token
    const token = generateToken();

    // Calculate expiration
    const now = Date.now();
    const expiresAt = now + SESSION_LIFETIME_MS;

    const session: Session = {
      token,
      userId,
      createdAt: new Date(now).toISOString(),
      expiresAt,
    };

    // We would store this in hyper-micro, but for now return success
    // Storage happens asynchronously
    storeSessionAsync(session);

    return { ok: true, data: session };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}

/**
 * Validate a session token
 *
 * @param token - Session token to validate
 * @returns Result with user ID if valid, error if invalid
 *
 * @example
 * const result = await validateSession(token);
 * if (result.ok) {
 *   const userId = result.data.userId;
 *   // User is authenticated
 * }
 */
export async function validateSession(
  token: string
): Promise<{ ok: true; data: { userId: string } } | { ok: false; error: string }> {
  try {
    // Get session from database
    const key = getSessionKey(token);
    const result = await dataApi.getDocument('sessions', key);

    if (!result.ok) {
      return { ok: false, error: 'Session not found' };
    }

    const session = result.data as { userId: string; expiresAt: number };

    // Check expiration
    if (Date.now() > session.expiresAt) {
      // Session expired - delete it
      await revokeSession(token);
      return { ok: false, error: 'Session expired' };
    }

    return { ok: true, data: { userId: session.userId } };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}

/**
 * Revoke (delete) a session
 *
 * @param token - Session token to revoke
 * @returns Result indicating success
 *
 * @example
 * revokeSession(token); // logout
 */
export function revokeSession(token: string): { ok: true } | { ok: false; error: string } {
  // Delete from database asynchronously
  deleteSessionAsync(token);
  return { ok: true };
}

/**
 * Get the database key for a session
 */
export function getSessionKey(token: string): string {
  return `sessions/${token}`;
}

/**
 * Generate a secure random token
 * Uses crypto.randomUUID() plus timestamp for uniqueness
 */
function generateToken(): string {
  const uuid = crypto.randomUUID();
  const timestamp = Date.now().toString(36);
  return `${timestamp}-${uuid}`;
}

/**
 * Store session in database asynchronously
 * Non-blocking - errors logged but not thrown
 */
async function storeSessionAsync(session: Session): Promise<void> {
  try {
    const key = getSessionKey(session.token);
    await dataApi.createDocument('sessions', key, {
      userId: session.userId,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    console.error('Failed to store session:', error);
  }
}

/**
 * Delete session from database asynchronously
 */
async function deleteSessionAsync(token: string): Promise<void> {
  try {
    const key = getSessionKey(token);
    await dataApi.deleteDocument('sessions', key);
  } catch (error) {
    console.error('Failed to delete session:', error);
  }
}