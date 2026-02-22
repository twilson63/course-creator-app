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
import { isProxyBaseUrl, withOnHyperHeaders } from '@/lib/onhyper-proxy';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeDocumentPayload<T>(payload: unknown): HyperDocument<T> {
  if (isObject(payload) && 'key' in payload && 'value' in payload) {
    return payload as unknown as HyperDocument<T>;
  }

  if (isObject(payload) && 'doc' in payload && isObject(payload.doc) && 'key' in payload.doc && 'value' in payload.doc) {
    return payload.doc as unknown as HyperDocument<T>;
  }

  return payload as unknown as HyperDocument<T>;
}

function normalizeGetPayload<T>(payload: unknown): T {
  if (isObject(payload) && 'value' in payload) {
    return payload.value as T;
  }

  if (isObject(payload) && 'doc' in payload && isObject(payload.doc) && 'value' in payload.doc) {
    return payload.doc.value as T;
  }

  return payload as T;
}

function normalizeListPayload<T>(payload: unknown): HyperDocument<T>[] {
  if (Array.isArray(payload)) {
    return payload as HyperDocument<T>[];
  }

  if (isObject(payload) && Array.isArray(payload.docs)) {
    return payload.docs as HyperDocument<T>[];
  }

  if (isObject(payload) && Array.isArray(payload.data)) {
    return payload.data as HyperDocument<T>[];
  }

  return [];
}

// ============================================================================
// Configuration
// ============================================================================

const HYPER_MICRO_URL = process.env.NEXT_PUBLIC_HYPER_MICRO_URL || '/proxy/hyper-micro';
const HYPER_MICRO_KEY = process.env.NEXT_PUBLIC_HYPER_MICRO_KEY || '';

if (!HYPER_MICRO_URL || !HYPER_MICRO_KEY) {
  if (!isProxyBaseUrl(HYPER_MICRO_URL)) {
    console.warn('Hyper-Micro configuration missing. Set NEXT_PUBLIC_HYPER_MICRO_URL and NEXT_PUBLIC_HYPER_MICRO_KEY');
  }
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
    const headers = withOnHyperHeaders(
      {
        'Content-Type': 'application/json',
      },
      HYPER_MICRO_URL
    );

    if (HYPER_MICRO_KEY && !isProxyBaseUrl(HYPER_MICRO_URL)) {
      headers.Authorization = `Bearer ${HYPER_MICRO_KEY}`;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => null);

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
    const result = await request<string[] | { databases?: string[]; data?: string[] }>('/api/dbs');
    if (!result.ok) {
      return {
        ok: false,
        status: result.status,
        error: result.error,
      };
    }

    const payload = result.data;
    if (Array.isArray(payload)) {
      return result as ApiResponse<string[]>;
    }

    if (isObject(payload)) {
      return {
        ...result,
        data: Array.isArray(payload.databases)
          ? payload.databases
          : Array.isArray(payload.data)
          ? payload.data
          : [],
      };
    }

    return { ...result, data: [] };
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
    const result = await request<HyperDocument<T>>(`/api/dbs/${db}/docs`, {
      method: 'POST',
      body: JSON.stringify({ key, value }),
    });

    if (!result.ok) {
      return result;
    }

    return {
      ...result,
      data: normalizeDocumentPayload<T>(result.data),
    };
  },

  /**
   * Get a document from a database
   *
   * @param db - Database name
   * @param key - Document key
   * @returns Document value
   */
  async getDocument<T>(db: string, key: string): Promise<ApiResponse<T>> {
    const result = await request<T>(`/api/dbs/${db}/docs/${encodeURIComponent(key)}`);
    if (!result.ok) {
      return result;
    }

    return {
      ...result,
      data: normalizeGetPayload<T>(result.data),
    };
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
    const result = await request<HyperDocument<T>>(`/api/dbs/${db}/docs/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });

    if (!result.ok) {
      return result;
    }

    return {
      ...result,
      data: normalizeDocumentPayload<T>(result.data),
    };
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
    const result = await request<HyperDocument<T>[]>(`/api/dbs/${db}/docs`);
    if (!result.ok) {
      return result;
    }

    return {
      ...result,
      data: normalizeListPayload<T>(result.data),
    };
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
      const headers = withOnHyperHeaders(
        {
          'Content-Type': contentType,
        },
        HYPER_MICRO_URL
      );

      if (HYPER_MICRO_KEY && !isProxyBaseUrl(HYPER_MICRO_URL)) {
        headers.Authorization = `Bearer ${HYPER_MICRO_KEY}`;
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers,
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
      const headers = withOnHyperHeaders({}, HYPER_MICRO_URL);
      if (HYPER_MICRO_KEY && !isProxyBaseUrl(HYPER_MICRO_URL)) {
        headers.Authorization = `Bearer ${HYPER_MICRO_KEY}`;
      }

      const response = await fetch(url, {
        headers,
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
