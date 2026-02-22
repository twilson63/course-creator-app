/**
 * LLM Prompt Templates
 *
 * Prompt templates for course generation and refinement.
 *
 * @module src/lib/llm/prompts
 */

import type { CourseDefinition } from '@/types/course';

/**
 * System prompt for transcript-to-JSON conversion
 */
export const TRANSCRIPT_TO_JSON_PROMPT = `You are a course creator. Read the transcript from a video and create a structured course in JSON format.

Break the transcript into logical learning steps. Each step should:
- Have a clear title
- Include a timestamp from the video
- Have informative content in markdown format
- Optionally include a checkpoint for comprehension

Return ONLY valid JSON with no markdown code blocks. The JSON must have this structure:
{
  "meta": {
    "title": "Course title",
    "description": "Course description (2-3 sentences)",
    "author": "Author name (if mentioned in transcript)",
    "estimatedTime": "Estimated time to complete",
    "difficulty": "beginner" | "intermediate" | "advanced"
  },
  "steps": [
    {
      "id": "unique-step-id",
      "title": "Step title",
      "videoUrl": "Video URL if provided",
      "videoTimestamp": "Start time (format: M:SS or H:MM:SS)",
      "content": "Step content in markdown format",
      "estimatedTime": "Time for this step",
      "checkpoint": {
        "label": "Checkpoint question or confirmation",
        "hint": "Optional hint"
      }
    }
  ],
  "resources": [
    {
      "label": "Resource name",
      "url": "Resource URL"
    }
  ]
}`;

/**
 * User prompt template for transcript-to-JSON conversion
 */
export const TRANSCRIPT_USER_TEMPLATE = `Video URL: {video_url}

Transcript:
{transcript}

Create the course JSON now. Remember: return ONLY valid JSON, no markdown code blocks.`;

/**
 * System prompt for JSON-to-HTML conversion
 */
export const JSON_TO_HTML_PROMPT = `You are a course HTML generator. Create a standalone, responsive HTML page for the given course JSON.

Requirements:
- Use Tailwind CSS classes (assume Tailwind is available)
- Include a video player that syncs with step timestamps
- IMPORTANT: YouTube/Vimeo/Loom/Descript URLs are NOT direct MP4 files. Do NOT use <video><source src="https://youtube...">.
- For YouTube/Vimeo/Loom/Descript, use <iframe> embed URLs.
- For YouTube, convert watch/share URLs into embed format: https://www.youtube.com/embed/{id}?start={seconds}
- Prefer YouTube embeds on https://www.youtube-nocookie.com/embed/{id} and include iframe attributes: allowfullscreen, referrerpolicy="strict-origin-when-cross-origin", and allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share".
- Always include a visible fallback link labeled "Watch on YouTube" pointing to https://www.youtube.com/watch?v={id}.
- Only use <video> tag for direct media files (mp4/webm/ogg)
- Create step-by-step navigation with checkboxes for completion
- Track progress (store in localStorage)
- Use clean, modern design with good typography
- Make it fully responsive (mobile-friendly)
- Include all resources as links at the bottom

Return ONLY the HTML code, no markdown code blocks or explanations.`;

/**
 * User prompt template for JSON-to-HTML conversion
 */
export const HTML_USER_TEMPLATE = `Course JSON:
{course_json}

Create the HTML page now. Remember: return ONLY valid HTML, no markdown code blocks.`;

/**
 * System prompt for course refinement
 */
export const REFINE_COURSE_PROMPT = `You are a course editor. The user wants to refine an existing course. You will receive the current course JSON and the user's request.

Apply the requested changes while maintaining:
- Valid JSON structure
- Consistent step IDs
- Proper markdown formatting in content
- Accurate timestamps if mentioned

Return ONLY the updated valid JSON, no markdown code blocks or explanations.`;

/**
 * User prompt template for refinement
 */
export const REFINE_USER_TEMPLATE = `Current Course JSON:
{course_json}

User Request: {user_prompt}

Return the updated course JSON now. Remember: return ONLY valid JSON, no markdown code blocks.`;

/**
 * Format transcript prompt with video URL and content
 *
 * @param videoUrl - Video URL
 * @param transcript - Transcript content
 * @returns Formatted prompt
 */
export function formatTranscriptPrompt(videoUrl: string, transcript: string): string {
  return TRANSCRIPT_USER_TEMPLATE
    .replace('{video_url}', videoUrl || 'Not provided')
    .replace('{transcript}', transcript);
}

/**
 * Format HTML generation prompt with course JSON
 *
 * @param courseJson - Course definition
 * @returns Formatted prompt
 */
export function formatHtmlPrompt(courseJson: CourseDefinition): string {
  return HTML_USER_TEMPLATE.replace(
    '{course_json}',
    JSON.stringify(courseJson, null, 2)
  );
}

/**
 * Format refinement prompt with current JSON and user request
 *
 * @param courseJson - Current course definition
 * @param userPrompt - User's refinement request
 * @returns Formatted prompt
 */
export function formatRefinePrompt(courseJson: CourseDefinition, userPrompt: string): string {
  return REFINE_USER_TEMPLATE
    .replace('{course_json}', JSON.stringify(courseJson, null, 2))
    .replace('{user_prompt}', userPrompt);
}

/**
 * Get the full prompt for transcript-to-JSON
 *
 * @param videoUrl - Video URL
 * @param transcript - Transcript content
 * @returns System and user prompts
 */
export function getTranscriptPrompts(videoUrl: string, transcript: string): {
  system: string;
  user: string;
} {
  return {
    system: TRANSCRIPT_TO_JSON_PROMPT,
    user: formatTranscriptPrompt(videoUrl, transcript),
  };
}

/**
 * Get the full prompt for JSON-to-HTML
 *
 * @param courseJson - Course definition
 * @returns System and user prompts
 */
export function getHtmlPrompts(courseJson: CourseDefinition): {
  system: string;
  user: string;
} {
  return {
    system: JSON_TO_HTML_PROMPT,
    user: formatHtmlPrompt(courseJson),
  };
}

/**
 * Get the full prompt for course refinement
 *
 * @param courseJson - Current course definition
 * @param userPrompt - User's refinement request
 * @returns System and user prompts
 */
export function getRefinePrompts(courseJson: CourseDefinition, userPrompt: string): {
  system: string;
  user: string;
} {
  return {
    system: REFINE_COURSE_PROMPT,
    user: formatRefinePrompt(courseJson, userPrompt),
  };
}
