/**
 * Hyper-Micro API Client
 *
 * Provides typed access to the hyper-micro backend services:
 * - Data API: LMDB-backed document storage
 * - Storage API: S3-compatible file storage
 *
 * @module lib/hyper-micro
 */

import { ApiResponse, HyperDocument } from '@/types';

// ============================================================================
// Configuration
// ============================================================================

const HYPER_MICRO_URL = process.env.NEXT_PUBLIC_HYPER_MICRO_URL || '';
const HYPER_MICRO_KEY = process.env.NEXT_PUBLIC_HYPER_MICRO_KEY || '';

if (!HYPER_MICRO_URL || !HYPER_MICRO_KEY) {
  console.warn('Hyper-Micro configuration missing. Set NEXT_PUBLIC_HYPER_MICRO_URL and NEXT_PUBLIC_HYPER_MICRO_KEY');
}

// ============================================================================
// HTTP Client
// ============================================================================

/**
 * Makes an authenticated request to the hyper-micro API
 *
 * @param path - API path (e.g., '/api/dbs/users/docs')
 * @param options - Fetch options
 * @returns API response
 */
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${HYPER_MICRO_URL}${path}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${HYPER_MICRO_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: data.error || `HTTP ${response.status}`,
      };
    }

    return {
      ok: true,
      status: response.status,
      data,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// ============================================================================
// Data API
// ============================================================================

/**
 * Data API for document storage operations
 */
export const dataApi = {
  /**
   * Create a new database
   *
   * @param name - Database name
   * @returns Success status
   */
  async createDatabase(name: string): Promise<ApiResponse<void>> {
    return request<void>(`/api/dbs/${name}`, { method: 'POST' });
  },

  /**
   * Delete a database
   *
   * @param name - Database name
   * @returns Success status
   */
  async deleteDatabase(name: string): Promise<ApiResponse<void>> {
    return request<void>(`/api/dbs/${name}`, { method: 'DELETE' });
  },

  /**
   * List all databases
   *
   * @returns List of database names
   */
  async listDatabases(): Promise<ApiResponse<string[]>> {
    return request<string[]>('/api/dbs');
  },

  /**
   * Create a document in a database
   *
   * @param db - Database name
   * @param key - Document key
   * @param value - Document value
   * @returns Created document
   */
  async createDocument<T>(db: string, key: string, value: T): Promise<ApiResponse<HyperDocument<T>>> {
    return request<HyperDocument<T>>(`/api/dbs/${db}/docs`, {
      method: 'POST',
      body: JSON.stringify({ key, value }),
    });
  },

  /**
   * Get a document from a database
   *
   * @param db - Database name
   * @param key - Document key
   * @returns Document value
   */
  async getDocument<T>(db: string, key: string): Promise<ApiResponse<T>> {
    return request<T>(`/api/dbs/${db}/docs/${encodeURIComponent(key)}`);
  },

  /**
   * Update a document in a database
   *
   * @param db - Database name
   * @param key - Document key
   * @param value - New document value
   * @returns Updated document
   */
  async updateDocument<T>(db: string, key: string, value: T): Promise<ApiResponse<HyperDocument<T>>> {
    return request<HyperDocument<T>>(`/api/dbs/${db}/docs/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  },

  /**
   * Delete a document from a database
   *
   * @param db - Database name
   * @param key - Document key
   * @returns Success status
   */
  async deleteDocument(db: string, key: string): Promise<ApiResponse<void>> {
    return request<void>(`/api/dbs/${db}/docs/${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });
  },

  /**
   * List all documents in a database
   *
   * @param db - Database name
   * @returns List of documents
   */
  async listDocuments<T>(db: string): Promise<ApiResponse<HyperDocument<T>[]>> {
    return request<HyperDocument<T>[]>(`/api/dbs/${db}/docs`);
  },
};

// ============================================================================
// Storage API
// ============================================================================

/**
 * Storage API for file operations
 */
export const storageApi = {
  /**
   * Create a storage bucket
   *
   * @param name - Bucket name
   * @returns Success status
   */
  async createBucket(name: string): Promise<ApiResponse<void>> {
    return request<void>(`/api/storage/${name}`, { method: 'POST' });
  },

  /**
   * Delete a storage bucket
   *
   * @param name - Bucket name
   * @returns Success status
   */
  async deleteBucket(name: string): Promise<ApiResponse<void>> {
    return request<void>(`/api/storage/${name}`, { method: 'DELETE' });
  },

  /**
   * List all storage buckets
   *
   * @returns List of bucket names
   */
  async listBuckets(): Promise<ApiResponse<string[]>> {
    return request<string[]>('/api/storage');
  },

  /**
   * Upload a file to a bucket
   *
   * @param bucket - Bucket name
   * @param key - File key
   * @param content - File content (string or ArrayBuffer)
   * @param contentType - MIME type
   * @returns Success status
   */
  async upload(
    bucket: string,
    key: string,
    content: string | ArrayBuffer,
    contentType: string = 'text/plain'
  ): Promise<ApiResponse<void>> {
    const url = `${HYPER_MICRO_URL}/api/storage/${bucket}/${encodeURIComponent(key)}`;

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${HYPER_MICRO_KEY}`,
          'Content-Type': contentType,
        },
        body: content,
      });

      if (!response.ok) {
        const data = await response.json();
        return {
          ok: false,
          status: response.status,
          error: data.error || `HTTP ${response.status}`,
        };
      }

      return { ok: true, status: response.status };
    } catch (error) {
      return {
        ok: false,
        status: 0,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  },

  /**
   * Download a file from a bucket
   *
   * @param bucket - Bucket name
   * @param key - File key
   * @returns File content
   */
  async download(bucket: string, key: string): Promise<ApiResponse<string | ArrayBuffer>> {
    const url = `${HYPER_MICRO_URL}/api/storage/${bucket}/${encodeURIComponent(key)}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${HYPER_MICRO_KEY}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        return {
          ok: false,
          status: response.status,
          error: data.error || `HTTP ${response.status}`,
        };
      }

      const contentType = response.headers.get('content-type') || '';
      const content = contentType.includes('application/json')
        ? await response.text()
        : await response.arrayBuffer();

      return { ok: true, status: response.status, data: content };
    } catch (error) {
      return {
        ok: false,
        status: 0,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  },

  /**
   * Delete a file from a bucket
   *
   * @param bucket - Bucket name
   * @param key - File key
   * @returns Success status
   */
  async delete(bucket: string, key: string): Promise<ApiResponse<void>> {
    return request<void>(`/api/storage/${bucket}/${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });
  },

  /**
   * List files in a bucket
   *
   * @param bucket - Bucket name
   * @returns List of file keys
   */
  async listFiles(bucket: string): Promise<ApiResponse<string[]>> {
    return request<string[]>(`/api/storage/${bucket}`);
  },
};

// ============================================================================
// Health Check
// ============================================================================

/**
 * Check if the hyper-micro backend is healthy
 *
 * @returns Health status
 */
export async function healthCheck(): Promise<ApiResponse<{ status: string }>> {
  return request<{ status: string }>('/health');
}

// ============================================================================
// Export
// ============================================================================

export const hyperMicro = {
  data: dataApi,
  storage: storageApi,
  health: healthCheck,
};

export default hyperMicro;