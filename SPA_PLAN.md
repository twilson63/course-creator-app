# SPA Refactoring Plan

## Goal
Convert the Next.js app to a static SPA deployable to onhyper.io, with API backend on hyper-micro.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    onhyper.io (SPA)                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Static HTML/CSS/JS (Next.js export)                │   │
│  │  - Client-side routing                              │   │
│  │  - All React components                             │   │
│  │  - Calls hyper-micro API directly                   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 hyper-micro (API Backend)                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Database: users                                    │   │
│  │  Database: courses                                  │   │
│  │  Database: sessions                                 │   │
│  │                                                      │   │
│  │  POST /api/dbs/:db/docs - Create document           │   │
│  │  GET /api/dbs/:db/docs/:id - Get document           │   │
│  │  PUT /api/dbs/:db/docs/:id - Update document        │   │
│  │  DELETE /api/dbs/:db/docs/:id - Delete document     │   │
│  │  GET /api/dbs/:db/docs - List documents             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Tasks

### Phase 1: Setup Hyper-Micro Databases ✅ IN PROGRESS
- [x] Understand hyper-micro API structure
- [ ] Create `users` database
- [ ] Create `courses` database
- [ ] Create `sessions` database
- [ ] Test CRUD operations

### Phase 2: Update API Client
- [ ] Create new hyper-micro client
- [ ] Update auth to use hyper-micro
- [ ] Update courses to use hyper-micro
- [ ] Keep LLM calls to onhyper.io proxy

### Phase 3: Client-Side Routing
- [ ] Replace `/courses/[id]/edit` with `/edit?id=xxx`
- [ ] Add client-side router hook
- [ ] Convert pages to client components
- [ ] Remove Next.js API routes

### Phase 4: Static Export & Deploy
- [ ] Configure next.config.ts for export
- [ ] Build static export
- [ ] Upload to onhyper.io
- [ ] Test all functionality

## Hyper-Micro API Pattern

```typescript
// Create document
POST /api/dbs/courses/docs
{ "key": "course-123", "value": { title: "...", ... } }

// Get document
GET /api/dbs/courses/docs/course-123

// Update document
PUT /api/dbs/courses/docs/course-123
{ "value": { title: "...", ... } }

// Delete document
DELETE /api/dbs/courses/docs/course-123

// List documents
GET /api/dbs/courses/docs
```

## Estimated Effort
- Phase 1: 1 hour
- Phase 2: 2 hours
- Phase 3: 2 hours
- Phase 4: 1 hour

**Total: 6 hours**