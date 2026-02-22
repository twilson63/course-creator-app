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
# Create .env.local (see env template below)

# Start Next.js dev server
npm run dev

# OR build static app + run local OnHyper emulation
npm run dev:full

# Run tests
npm test

# Build for production
npm run build
```

## Environment Variables

```env
# Optional: explicit app slug header for proxy calls.
# If omitted, slug is derived from /a/{slug} URL at runtime.
NEXT_PUBLIC_ONHYPER_APP_SLUG=course-creator-4473b404

# Use true when deploying to subdomain (*.onhyper.io) so assets resolve from root.
NEXT_PUBLIC_ONHYPER_USE_SUBDOMAIN=true

# Optional overrides for local direct APIs (defaults use /proxy/*).
NEXT_PUBLIC_HYPER_MICRO_URL=/proxy/hypermicro
NEXT_PUBLIC_LLM_API_URL=/proxy/openrouter/v1

# Optional direct API credentials (not needed when using /proxy/*)
NEXT_PUBLIC_HYPER_MICRO_KEY=
NEXT_PUBLIC_LLM_API_KEY=

# LLM tuning
NEXT_PUBLIC_LLM_MODEL=gpt-4
NEXT_PUBLIC_LLM_MAX_RETRIES=3
NEXT_PUBLIC_LLM_TIMEOUT=120000

# Optional OpenRouter passthrough key for local proxy
OPENROUTER_API_KEY=
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Publish destination
NEXT_PUBLIC_ZENBIN_URL=https://zenbin.org

# Local OnHyper emulation server settings
ONHYPER_APP_SLUG=course-creator-4473b404
HYPER_MICRO_TARGET=http://localhost:6363
HYPER_MICRO_API_KEY=

# OpenAI behavior for local /proxy/openai route
# mock (default) or passthrough
OPENAI_PROXY_MODE=mock
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_API_KEY=

# OnHyper deployment auth
ONHYPER_TOKEN=
```

## Local OnHyper Emulation

Use this to run static assets and emulate OnHyper proxy behavior locally.

1. Build static output: `npm run build:static`
2. Start local server: `npm run serve:local`
3. Open `http://localhost:4173/a/course-creator-4473b404`

Supported local proxy routes:

- `POST /proxy/openrouter/v1/chat/completions` (mocked response by default)
- `POST /proxy/openai/v1/chat/completions` (mocked response by default)
- `/proxy/hypermicro/*` (and `/proxy/hyper-micro/*`) forwarded to `HYPER_MICRO_TARGET`

To use real OpenAI in local proxy mode, set:

- `OPENAI_PROXY_MODE=passthrough`
- `OPENAI_API_KEY=<your_key>`

To use real OpenRouter in local proxy mode, set:

- `OPENAI_PROXY_MODE=passthrough`
- `NEXT_PUBLIC_LLM_API_URL=/proxy/openrouter/v1`
- `OPENROUTER_API_KEY=<your_key>`

## OnHyper Publish (ZIP)

Use deployment scripts with `ONHYPER_TOKEN`:

1. Configure provider secrets: `npm run onhyper:configure`
2. Build + zip upload + publish: `npm run onhyper:publish`

The local proxy enforces `X-App-Slug` and checks it against `ONHYPER_APP_SLUG`.

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
