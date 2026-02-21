/**
 * ZenBin Publishing Service
 *
 * Publishes HTML content to ZenBin for permanent hosting.
 *
 * @module src/lib/publish/zenbin
 */

/**
 * Options for ZenBin publishing
 */
export interface PublishOptions {
  /** Maximum retry attempts on ID conflict */
  maxRetries?: number;
  /** Custom ID (optional, auto-generated if not provided) */
  id?: string;
}

/**
 * Result from publishing to ZenBin
 */
export interface PublishResult {
  /** Unique ID for the published content */
  id: string;
  /** Full URL to the published content */
  url: string;
}

/**
 * ZenBin API Client
 *
 * Handles publishing HTML content to ZenBin with automatic retry on conflicts.
 */
export class ZenBinClient {
  private baseUrl: string;

  /**
   * Create a new ZenBin client
   *
   * @param baseUrl - ZenBin API base URL (default: https://zenbin.io)
   */
  constructor(baseUrl: string = 'https://zenbin.io') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  /**
   * Publish HTML content to ZenBin
   *
   * @param html - HTML content to publish
   * @param options - Publishing options
   * @returns Publish result with ID and URL
   */
  async publish(html: string, options: PublishOptions = {}): Promise<PublishResult> {
    const maxRetries = options.maxRetries ?? 5;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const id = options.id || generateCourseId();
      const content = encodeHTML(html);

      try {
        const response = await fetch(`${this.baseUrl}/api/bin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id, content }),
        });

        if (response.ok) {
          const data = await response.json();
          return {
            id: data.id || id,
            url: `${this.baseUrl}/${data.id || id}`,
          };
        }

        // Handle conflict (ID already exists)
        if (response.status === 409) {
          lastError = new Error(`ID conflict: ${id}`);
          continue; // Retry with new ID
        }

        // Other errors
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Publish failed: ${errorData.error || response.statusText}`);
      } catch (error) {
        if (error instanceof Error) {
          lastError = error;
        }
        // Only retry on conflicts
        if (!lastError?.message.includes('conflict')) {
          throw lastError;
        }
      }
    }

    throw new Error(`Failed to publish after ${maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Get published content by ID
   *
   * @param id - ZenBin content ID
   * @returns Published content or null if not found
   */
  async get(id: string): Promise<{ id: string; content: string } | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/bin/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to get content: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        id: data.id || id,
        content: data.content,
      };
    } catch (error) {
      console.error('Failed to get ZenBin content:', error);
      return null;
    }
  }
}

/**
 * Generate a unique course ID
 *
 * Creates a URL-safe base64-encoded random ID.
 *
 * @returns Unique ID string
 */
export function generateCourseId(): string {
  // Generate 16 random bytes (128 bits)
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // Convert to base64 and make URL-safe
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Encode HTML content to base64
 *
 * @param html - HTML content to encode
 * @returns Base64-encoded string
 */
export function encodeHTML(html: string): string {
  // Handle UTF-8 encoding
  const encoder = new TextEncoder();
  const bytes = encoder.encode(html);
  const binary = String.fromCharCode(...bytes);
  return btoa(binary);
}

// Default client instance
const defaultClient = new ZenBinClient();

/**
 * Publish HTML content using the default client
 *
 * @param html - HTML content to publish
 * @param options - Publishing options
 * @returns Publish result with ID and URL
 */
export async function publishCourse(
  html: string,
  options?: PublishOptions
): Promise<PublishResult> {
  return defaultClient.publish(html, options);
}