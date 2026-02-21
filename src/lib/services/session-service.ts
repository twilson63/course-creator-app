/**
 * Session Service
 *
 * Service for managing sessions using hyper-micro.
 *
 * @module src/lib/services/session-service
 */

import { hyperClient } from '@/lib/api/hyper-micro';

const DB_NAME = 'sessions';

export interface SessionRecord {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

const SESSION_DURATION_DAYS = 30;
const SESSION_DURATION_MS = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;

/**
 * Generate a random session token
 */
function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Session Service
 */
export const sessionService = {
  /**
   * Create a new session
   */
  async create(userId: string): Promise<SessionRecord> {
    const token = generateToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS);

    const session: SessionRecord = {
      token,
      userId,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    await hyperClient.createDocument(DB_NAME, token, session);
    return session;
  },

  /**
   * Get a session by token
   */
  async get(token: string): Promise<SessionRecord | null> {
    const doc = await hyperClient.getDocument<SessionRecord>(DB_NAME, token);
    const session = doc?.value;

    if (!session) {
      return null;
    }

    // Check expiration
    if (new Date(session.expiresAt) < new Date()) {
      await this.delete(token);
      return null;
    }

    return session;
  },

  /**
   * Delete a session
   */
  async delete(token: string): Promise<void> {
    await hyperClient.deleteDocument(DB_NAME, token);
  },

  /**
   * Delete all sessions for a user
   */
  async deleteByUserId(userId: string): Promise<void> {
    const docs = await hyperClient.queryDocuments<SessionRecord>(
      DB_NAME,
      (doc) => doc.value.userId === userId
    );

    await Promise.all(
      docs.map((doc) => hyperClient.deleteDocument(DB_NAME, doc.key))
    );
  },

  /**
   * Clean up expired sessions
   */
  async cleanup(): Promise<number> {
    const now = new Date().toISOString();
    const docs = await hyperClient.queryDocuments<SessionRecord>(
      DB_NAME,
      (doc) => doc.value.expiresAt < now
    );

    await Promise.all(
      docs.map((doc) => hyperClient.deleteDocument(DB_NAME, doc.key))
    );

    return docs.length;
  },
};

// Aliases for convenience
export const createSession = sessionService.create;
export const getSession = sessionService.get;
export const deleteSession = sessionService.delete;