/**
 * Test setup file
 * Configures testing utilities and custom matchers
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables for tests
process.env.NEXT_PUBLIC_HYPER_MICRO_URL = 'http://localhost:3001';
process.env.NEXT_PUBLIC_HYPER_MICRO_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_LLM_API_URL = 'http://localhost:3002/api/llm';
process.env.NEXT_PUBLIC_LLM_API_KEY = 'test-llm-key';
process.env.NEXT_PUBLIC_ZENBIN_URL = 'http://localhost:3003';
process.env.NEXT_PUBLIC_APP_NAME = 'Course Creator';

// Mock fetch globally
vi.stubGlobal('fetch', vi.fn());