# Course Creator Web App

A multi-tenant web application that converts video transcripts into interactive courses.

## Overview

This application allows educators to:
1. Create an account
2. Upload a video URL and transcript
3. Use AI to generate a structured course
4. Refine the course through natural language prompts
5. Publish and share the course

## Tech Stack

- **Frontend**: React 19 / Next.js 16 SPA
- **Backend**: hyper-micro (LMDB + S3-compatible storage)
- **LLM**: Ollama Cloud via onhyper.io
- **Publishing**: ZenBin.org
- **UI**: Tailwind CSS + ui.sh components

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Project Structure

```
src/
├── app/              # Next.js pages
├── components/       # React components
│   ├── auth/         # Authentication components
│   ├── course/       # Course management
│   ├── dashboard/    # Dashboard components
│   ├── studio/       # Edit studio
│   └── ui/           # Shared UI components
├── contexts/         # React contexts
├── hooks/            # Custom hooks
├── lib/              # Utilities and API clients
│   ├── api/          # API client
│   ├── auth/         # Authentication logic
│   ├── course/       # Course utilities
│   ├── llm/          # LLM integration
│   └── publish/      # Publishing logic
└── types/            # TypeScript types
```

## Documentation

- [Implementation Plan](./PLAN.md) - Detailed tasks and success criteria
- [User Guide](./docs/USER_GUIDE.md) - End-user documentation

## License

MIT