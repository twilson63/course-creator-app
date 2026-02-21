# Course Creator Web App

A multi-tenant web application that converts video transcripts into interactive courses using AI.

## Features

### ✅ Implemented

- **Authentication** - Password-based signup/login with secure session management
- **Course Creation** - Upload video URLs with transcripts, AI-generated courses
- **Edit Studio** - Visual editor with:
  - Sidebar navigation
  - Step preview with markdown rendering
  - Video embeds (YouTube, Vimeo, Loom, Descript)
  - Prompt-based refinement
  - JSON viewer
- **Publishing** - One-click publish to ZenBin with shareable links
- **Dashboard** - Course list with filtering and search
- **Polish** - Toast notifications, error boundaries, loading states

## Tech Stack

- **Frontend**: React 19 / Next.js 16
- **Backend**: hyper-micro (LMDB + S3-compatible storage)
- **LLM**: OpenAI-compatible API (Ollama Cloud)
- **Publishing**: ZenBin permanent hosting
- **Styling**: Tailwind CSS
- **Testing**: Vitest (400+ tests)

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Environment Variables

```env
# Hyper Micro Backend
NEXT_PUBLIC_HYPER_MICRO_URL=http://localhost:6363

# LLM API
LLM_API_URL=https://api.openai.com/v1
LLM_API_KEY=your-api-key
LLM_MODEL=gpt-4

# ZenBin Publishing
NEXT_PUBLIC_ZENBIN_URL=https://zenbin.io
```

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
│   ├── auth/         # Login, signup, auth context
│   ├── course/       # Course form, publish modal, share link
│   ├── dashboard/    # Course card, list, filtering
│   ├── studio/       # Edit studio, sidebar, previews
│   └── ui/           # Toast, error boundary, spinner, skeleton
├── contexts/         # AuthContext
├── lib/              # Core libraries
│   ├── api/          # Hyper Micro client
│   ├── auth/         # Password hashing, sessions
│   ├── course/       # Generator, pipeline, types
│   ├── llm/          # LLM client, prompts
│   └── publish/      # ZenBin client
└── types/            # TypeScript definitions
```

## Key Components

### Course Generator

Transform transcripts into structured courses:

```typescript
import { createCourseGenerator } from '@/lib/course/generator';

const generator = createCourseGenerator();
const course = await generator.generateFromTranscript(transcript);
```

### Publishing

Publish to permanent hosting:

```typescript
import { publishCourse } from '@/lib/publish/zenbin';

const result = await publishCourse(html);
console.log(result.url); // https://zenbin.io/abc123
```

### UI Components

```typescript
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Spinner, Skeleton } from '@/components/ui';
```

## Documentation

- [API: Course Generator](./src/lib/course/README.md)
- [API: ZenBin Publishing](./src/lib/publish/README.md)
- [Implementation Plan](./PLAN.md) - Detailed tasks and progress

## Test Coverage

- **412 tests passing**
- Unit tests for all components
- Integration tests for auth flow
- Course generation pipeline tests

## License

MIT