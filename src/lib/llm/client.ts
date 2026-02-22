/**
 * LLM API Client
 *
 * Client for interacting with LLM APIs (OpenAI-compatible).
 * Handles JSON generation, HTML generation, and course refinement.
 *
 * @module src/lib/llm/client
 */

import type { CourseDefinition } from '@/types/course';
import {
  isProxyBaseUrl,
  resolveOnHyperProxyBaseUrl,
  withOnHyperHeaders,
} from '@/lib/onhyper-proxy';
import {
  getTranscriptPrompts,
  getHtmlPrompts,
  getRefinePrompts,
} from './prompts';

/**
 * LLM API configuration
 */
export interface LLMConfig {
  /** API base URL */
  baseUrl: string;
  /** API key */
  apiKey: string;
  /** Model to use */
  model?: string;
  /** Maximum retries */
  maxRetries?: number;
  /** Request timeout in ms */
  timeout?: number;
}

/**
 * LLM response
 */
interface LLMResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Custom error for LLM issues
 */
export class LLMError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

/**
 * Rate limit error (429)
 */
export class LLMRateLimitError extends LLMError {
  constructor(
    public readonly retryAfter?: number,
    details?: unknown
  ) {
    super('Rate limit exceeded', 429, details);
    this.name = 'LLMRateLimitError';
  }
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Partial<LLMConfig> = {
  model: 'gpt-4',
  maxRetries: 3,
  timeout: 120000, // 2 minutes
};

/**
 * LLM Client class
 */
export class LLMClient {
  private baseUrl: string;
  private apiKey: string;
  private model: string;
  private maxRetries: number;
  private timeout: number;

  constructor(
    baseUrl: string,
    apiKey: string,
    config?: Partial<LLMConfig>
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
    this.model = config?.model || DEFAULT_CONFIG.model || 'gpt-4';
    this.maxRetries = config?.maxRetries ?? DEFAULT_CONFIG.maxRetries ?? 3;
    this.timeout = config?.timeout ?? DEFAULT_CONFIG.timeout ?? 120000;
  }

  /**
   * Make a completion request
   */
  private async complete(
    systemPrompt: string,
    userPrompt: string,
    retryCount = 0
  ): Promise<string> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      const baseUrl = resolveOnHyperProxyBaseUrl(this.baseUrl);
      const headers = withOnHyperHeaders(
        {
          'Content-Type': 'application/json',
        },
        baseUrl
      );

      if (this.apiKey && !isProxyBaseUrl(baseUrl)) {
        headers.Authorization = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 4096,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          const retryAfter = response.headers.get('retry-after');
          throw new LLMRateLimitError(
            retryAfter ? parseInt(retryAfter) : undefined
          );
        }

        const errorData = await response.json().catch(() => ({}));
        throw new LLMError(
          errorData.error?.message || `LLM API error: ${response.status}`,
          response.status,
          errorData
        );
      }

      const data: LLMResponse = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new LLMError('No content in LLM response');
      }

      return content;
    } catch (error) {
      // Don't retry on rate limit
      if (error instanceof LLMRateLimitError) {
        throw error;
      }

      // Retry on transient errors
      if (retryCount < this.maxRetries - 1) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.complete(systemPrompt, userPrompt, retryCount + 1);
      }

      if (error instanceof LLMError) {
        throw error;
      }

      throw new LLMError(
        error instanceof Error ? error.message : 'Unknown LLM error'
      );
    }
  }

  /**
   * Strip markdown code blocks from response
   */
  private stripCodeBlocks(content: string): string {
    // Remove ```json or ```html code blocks
    return content
      .replace(/^```(?:json|html)?\s*\n?/i, '')
      .replace(/\n?```\s*$/i, '')
      .trim();
  }

  /**
   * Generate course JSON from transcript
   *
   * @param transcript - Video transcript
   * @param videoUrl - Optional video URL
   * @returns Course definition
   */
  async generateJSON(transcript: string, videoUrl?: string): Promise<CourseDefinition> {
    const { system, user } = getTranscriptPrompts(videoUrl || '', transcript);
    const content = await this.complete(system, user);

    // Strip any markdown code blocks
    const cleanContent = this.stripCodeBlocks(content);

    try {
      const json = JSON.parse(cleanContent);
      return json as CourseDefinition;
    } catch {
      throw new LLMError('Invalid JSON response from LLM');
    }
  }

  /**
   * Generate HTML from course JSON
   *
   * @param courseJson - Course definition
   * @returns HTML string
   */
  async generateHTML(courseJson: CourseDefinition): Promise<string> {
    const { system, user } = getHtmlPrompts(courseJson);
    const content = await this.complete(system, user);

    // Strip any markdown code blocks
    return this.stripCodeBlocks(content);
  }

  /**
   * Refine course JSON based on user prompt
   *
   * @param courseJson - Current course definition
   * @param userPrompt - User's refinement request
   * @returns Updated course definition
   */
  async refineJSON(
    courseJson: CourseDefinition,
    userPrompt: string
  ): Promise<CourseDefinition> {
    const { system, user } = getRefinePrompts(courseJson, userPrompt);
    const content = await this.complete(system, user);

    // Strip any markdown code blocks
    const cleanContent = this.stripCodeBlocks(content);

    try {
      const json = JSON.parse(cleanContent);
      return json as CourseDefinition;
    } catch {
      throw new LLMError('Invalid JSON response from LLM');
    }
  }
}

/**
 * Default LLM client instance
 * Uses environment variables for configuration
 */
export const llmClient = new LLMClient(
  process.env.NEXT_PUBLIC_LLM_API_URL || '/proxy/openrouter/v1',
  process.env.NEXT_PUBLIC_LLM_API_KEY || '',
  {
    model: process.env.NEXT_PUBLIC_LLM_MODEL,
    maxRetries: parseInt(process.env.NEXT_PUBLIC_LLM_MAX_RETRIES || '3'),
    timeout: parseInt(process.env.NEXT_PUBLIC_LLM_TIMEOUT || '120000'),
  }
);
