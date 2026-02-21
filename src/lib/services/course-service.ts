/**
 * Course Service
 *
 * Service for managing courses using hyper-micro.
 *
 * @module src/lib/services/course-service
 */

import { hyperClient } from '@/lib/api/hyper-micro';
import type { CourseDefinition } from '@/types/course';

const DB_NAME = 'courses';

export type CourseStatus = 'draft' | 'ready' | 'published';

export interface CourseRecord {
  id: string;
  userId: string;
  status: CourseStatus;
  videoUrl?: string;
  transcript?: string;
  definition?: CourseDefinition;
  generatedHtml?: string;
  zenbinId?: string;
  zenbinUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseInput {
  id: string;
  userId: string;
  videoUrl?: string;
  transcript?: string;
}

export interface UpdateCourseInput {
  status?: CourseStatus;
  videoUrl?: string;
  transcript?: string;
  definition?: CourseDefinition;
  generatedHtml?: string;
  zenbinId?: string;
  zenbinUrl?: string;
}

/**
 * Course Service
 */
export const courseService = {
  /**
   * Create a new course
   */
  async create(input: CreateCourseInput): Promise<CourseRecord> {
    const now = new Date().toISOString();
    const course: CourseRecord = {
      ...input,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };

    await hyperClient.createDocument(DB_NAME, input.id, course);
    return course;
  },

  /**
   * Get a course by ID
   */
  async getById(id: string): Promise<CourseRecord | null> {
    const doc = await hyperClient.getDocument<CourseRecord>(DB_NAME, id);
    return doc?.value || null;
  },

  /**
   * Get all courses for a user
   */
  async getByUserId(userId: string): Promise<CourseRecord[]> {
    const docs = await hyperClient.queryDocuments<CourseRecord>(
      DB_NAME,
      (doc) => doc.value.userId === userId
    );
    return docs.map((d) => d.value).sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  /**
   * Update a course
   */
  async update(id: string, input: UpdateCourseInput): Promise<CourseRecord> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Course not found');
    }

    const updated: CourseRecord = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };

    await hyperClient.updateDocument(DB_NAME, id, updated);
    return updated;
  },

  /**
   * Delete a course
   */
  async delete(id: string): Promise<void> {
    await hyperClient.deleteDocument(DB_NAME, id);
  },

  /**
   * List all courses (admin)
   */
  async listAll(): Promise<CourseRecord[]> {
    const docs = await hyperClient.listDocuments<CourseRecord>(DB_NAME);
    return docs.map((d) => d.value).sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },
};