# Course Generator API

> AI-powered course generation from video transcripts

## Overview

The `CourseGenerator` class uses LLM APIs to transform video transcripts into structured course content.

## Installation

```typescript
import { createCourseGenerator } from '@/lib/course/generator';
```

## Usage

### Basic Course Generation

```typescript
const generator = createCourseGenerator();

// Generate course from transcript
const course = await generator.generateFromTranscript(
  'Welcome to this tutorial on React hooks...'
);

console.log(course.meta.title);        // "Understanding React Hooks"
console.log(course.steps.length);      // Number of steps
console.log(course.steps[0].title);    // First step title
```

### Generate HTML Output

```typescript
// Convert course to HTML
const html = await generator.generateHTML(course);
```

### Refine Existing Course

```typescript
// Refine course with natural language prompt
const refined = await generator.refineCourse(course, 'Add more detail to step 2');
```

## Configuration

Configure via environment variables:

```env
LLM_API_URL=https://api.openai.com/v1
LLM_API_KEY=sk-xxx
LLM_MODEL=gpt-4
```

## Course Definition

```typescript
interface CourseDefinition {
  meta: {
    title: string;
    description?: string;
    author?: string;
    estimatedTime?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
  };
  steps: CourseStep[];
  resources?: CourseResource[];
}

interface CourseStep {
  id: string;
  title: string;
  content: string;
  videoTimestamp?: string;
  checkpoints?: string[];
  estimatedTime?: string;
}
```

## Error Handling

```typescript
try {
  const course = await generator.generateFromTranscript(transcript);
} catch (error) {
  if (error instanceof LLMError) {
    console.error('LLM API error:', error.message);
    console.error('Status:', error.status);
  }
}
```

## Pipeline

For step-by-step processing with status tracking:

```typescript
import { CoursePipeline } from '@/lib/course/pipeline';

const pipeline = new CoursePipeline();

pipeline.on('status', (status) => {
  console.log('Status:', status); // 'generating-json' | 'validating-json' | ...
});

const course = await pipeline.run(transcript);
```

## See Also

- [LLM Client](/src/lib/llm/README.md) - Low-level LLM API client
- [Course Types](/src/types/course.ts) - TypeScript definitions