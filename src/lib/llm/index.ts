/**
 * LLM Module
 *
 * @module src/lib/llm
 */

export { LLMClient, llmClient, LLMError, LLMRateLimitError } from './client';
export type { LLMConfig } from './client';
export {
  TRANSCRIPT_TO_JSON_PROMPT,
  JSON_TO_HTML_PROMPT,
  REFINE_COURSE_PROMPT,
  formatTranscriptPrompt,
  formatHtmlPrompt,
  formatRefinePrompt,
  getTranscriptPrompts,
  getHtmlPrompts,
  getRefinePrompts,
} from './prompts';