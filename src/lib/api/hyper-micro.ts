/**
 * Hyper-Micro API Client
 *
 * Client for interacting with hyper-micro data and storage APIs.
 *
 * @module src/lib/api/hyper-micro
 */

const API_KEY = process.env.NEXT_PUBLIC_HYPER_MICRO_KEY || '';
const BASE_URL = process.env.NEXT_PUBLIC_HYPER_MICRO_URL || '';

interface HyperMicroResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

interface Document<T> {
  key: string;
  value: T;
}

/**
 * Hyper-Micro API Client
 */
export class HyperMicroClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl?: string, apiKey?: string) {
    this.baseUrl = baseUrl || BASE_URL;
    this.apiKey = apiKey || API_KEY;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // ==================== DATABASE OPERATIONS ====================

  /**
   * Create a new database
   */
  async createDatabase(name: string): Promise<HyperMicroResponse<void>> {
    return this.request(`/api/dbs/${name}`, { method: 'POST' });
  }

  /**
   * List all databases
   */
  async listDatabases(): Promise<string[]> {
    return this.request('/api/dbs');
  }

  /**
   * Delete a database
   */
  async deleteDatabase(name: string): Promise<HyperMicroResponse<void>> {
    return this.request(`/api/dbs/${name}`, { method: 'DELETE' });
  }

  // ==================== DOCUMENT OPERATIONS ====================

  /**
   * Create a document
   */
  async createDocument<T>(
    db: string,
    key: string,
    value: T
  ): Promise<Document<T>> {
    return this.request(`/api/dbs/${db}/docs`, {
      method: 'POST',
      body: JSON.stringify({ key, value }),
    });
  }

  /**
   * Get a document by key
   */
  async getDocument<T>(db: string, key: string): Promise<Document<T> | null> {
    try {
      return await this.request(`/api/dbs/${db}/docs/${encodeURIComponent(key)}`);
    } catch (error) {
      if ((error as Error).message.includes('not found')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Update a document
   */
  async updateDocument<T>(
    db: string,
    key: string,
    value: T
  ): Promise<Document<T>> {
    return this.request(`/api/dbs/${db}/docs/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  }

  /**
   * Delete a document
   */
  async deleteDocument(db: string, key: string): Promise<void> {
    return this.request(`/api/dbs/${db}/docs/${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });
  }

  /**
   * List all documents in a database
   */
  async listDocuments<T>(db: string): Promise<Document<T>[]> {
    return this.request(`/api/dbs/${db}/docs`);
  }

  /**
   * Query documents by filter function
   */
  async queryDocuments<T>(
    db: string,
    filter: (doc: Document<T>) => boolean
  ): Promise<Document<T>[]> {
    const docs = await this.listDocuments<T>(db);
    return docs.filter(filter);
  }

  // ==================== STORAGE OPERATIONS ====================

  /**
   * Upload a file to storage
   */
  async uploadFile(
    bucket: string,
    key: string,
    file: File | Blob | ArrayBuffer,
    contentType?: string
  ): Promise<{ ok: boolean; key: string }> {
    const response = await fetch(
      `${this.baseUrl}/api/storage/${bucket}/${encodeURIComponent(key)}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': contentType || 'application/octet-stream',
        },
        body: file as BodyInit,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    return { ok: true, key };
  }

  /**
   * Download a file from storage
   */
  async downloadFile(bucket: string, key: string): Promise<Blob> {
    const response = await fetch(
      `${this.baseUrl}/api/storage/${bucket}/${encodeURIComponent(key)}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    return response.blob();
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(bucket: string, key: string): Promise<void> {
    await this.request(`/api/storage/${bucket}/${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });
  }

  /**
   * List files in a bucket
   */
  async listFiles(bucket: string): Promise<string[]> {
    return this.request(`/api/storage/${bucket}`);
  }
}

// Default client instance
export const hyperClient = new HyperMicroClient();