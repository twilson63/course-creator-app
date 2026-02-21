# SPA Refactoring Plan

## Goal
Convert the Next.js app to a static SPA deployable to onhyper.io, with API proxies on hyper-micro.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    onhyper.io (SPA)                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Static HTML/CSS/JS (Next.js export)                │   │
│  │  - Client-side routing                              │   │
│  │  - All React components                             │   │
│  │  - API calls via window.ONHYPER.proxyBase           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 hyper-micro (API Backend)                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  /api/auth/*          - Authentication              │   │
│  │  /api/courses/*       - Course CRUD                 │   │
│  │  /api/users/*         - User management             │   │
│  │  /proxy/llm/*         - LLM API proxy               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Tasks

### Phase 1: API Routes Migration
- [ ] Create hyper-micro API proxy endpoints
- [ ] Move auth logic to hyper-micro
- [ ] Move course CRUD to hyper-micro
- [ ] Add LLM proxy to hyper-micro
- [ ] Update frontend to use new API base URL

### Phase 2: Client-Side Routing
- [ ] Replace `/courses/[id]/edit` with query param `/edit?id=xxx`
- [ ] Add client-side router component
- [ ] Convert all pages to `'use client'`
- [ ] Remove server components

### Phase 3: Static Export Configuration
- [ ] Update next.config.ts for static export
- [ ] Remove API routes from Next.js app
- [ ] Configure environment variables for runtime
- [ ] Add build script for onhyper deployment

### Phase 4: Deployment
- [ ] Build static export
- [ ] Upload HTML/CSS/JS to onhyper.io
- [ ] Test all functionality
- [ ] Update documentation

## API Endpoints Needed on Hyper-Micro

### Auth
- `POST /api/auth/signup` - Create user
- `POST /api/auth/login` - Authenticate
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - List courses
- `POST /api/courses` - Create course
- `GET /api/courses/:id` - Get course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### LLM Proxy
- `POST /api/llm/generate` - Generate course JSON
- `POST /api/llm/refine` - Refine course
- `POST /api/llm/html` - Generate HTML

## File Changes

### Remove
- `src/app/api/health/route.ts`
- `src/app/courses/[id]/edit/`

### Modify
- `next.config.ts` - Add static export
- `src/app/courses/*/page.tsx` - Use client components
- `src/lib/api/*.ts` - Update API base URL
- `src/contexts/AuthContext.tsx` - Client-only

### Add
- `src/hooks/useRouter.ts` - Client-side routing
- `src/components/App.tsx` - Main SPA router
- `hyper-api/` - Hyper-micro API scripts

## Estimated Effort
- Phase 1: 2-3 hours
- Phase 2: 1-2 hours
- Phase 3: 1 hour
- Phase 4: 1 hour

**Total: 5-7 hours**