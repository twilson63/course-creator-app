/**
 * User Service
 *
 * Service for managing users and authentication using hyper-micro.
 *
 * @module src/lib/services/user-service
 */

import { hyperClient } from '@/lib/api/hyper-micro';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { createSession, getSession, deleteSession } from './session-service';

const DB_NAME = 'users';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SafeUser {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

export interface SignupInput {
  id: string;
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  user: SafeUser;
  sessionToken: string;
}

/**
 * User Service
 */
export const userService = {
  /**
   * Create a new user (signup)
   */
  async signup(input: SignupInput): Promise<SafeUser> {
    // Check if email exists
    const existing = await this.findByEmail(input.email);
    if (existing) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(input.password);

    const now = new Date().toISOString();
    const user: UserRecord = {
      id: input.id,
      email: input.email.toLowerCase(),
      passwordHash,
      name: input.name,
      createdAt: now,
      updatedAt: now,
    };

    await hyperClient.createDocument(DB_NAME, user.id, user);

    return this.toSafeUser(user);
  },

  /**
   * Login user
   */
  async login(input: LoginInput): Promise<LoginResult> {
    const user = await this.findByEmail(input.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      throw new Error('Invalid email or password');
    }

    // Create session
    const session = await createSession(user.id);

    return {
      user: this.toSafeUser(user),
      sessionToken: session.token,
    };
  },

  /**
   * Logout user
   */
  async logout(sessionToken: string): Promise<void> {
    await deleteSession(sessionToken);
  },

  /**
   * Get current user from session
   */
  async getCurrentUser(sessionToken: string): Promise<SafeUser | null> {
    const session = await getSession(sessionToken);
    if (!session) {
      return null;
    }

    const user = await this.getById(session.userId);
    return user ? this.toSafeUser(user) : null;
  },

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<UserRecord | null> {
    const doc = await hyperClient.getDocument<UserRecord>(DB_NAME, id);
    return doc?.value || null;
  },

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<UserRecord | null> {
    const normalizedEmail = email.toLowerCase();
    const docs = await hyperClient.queryDocuments<UserRecord>(
      DB_NAME,
      (doc) => doc.value.email === normalizedEmail
    );
    return docs[0]?.value || null;
  },

  /**
   * Update user
   */
  async update(id: string, data: Partial<Pick<UserRecord, 'name'>>): Promise<SafeUser> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('User not found');
    }

    const updated: UserRecord = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await hyperClient.updateDocument(DB_NAME, id, updated);
    return this.toSafeUser(updated);
  },

  /**
   * Delete user
   */
  async delete(id: string): Promise<void> {
    await hyperClient.deleteDocument(DB_NAME, id);
  },

  /**
   * Convert to safe user (without password)
   */
  toSafeUser(user: UserRecord): SafeUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  },
};