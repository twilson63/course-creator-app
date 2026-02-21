# SPA Refactoring Plan

## Goal
Convert the Next.js app to a static SPA deployable to onhyper.io, with API backend on hyper-micro.

## Status: Phase 3 Blocked ⚠️

Phase 1 and 2 are complete. However, **Phase 3 (Static Export)** has a limitation:

**Problem**: Next.js generates multiple JS chunks with relative paths (`/_next/static/...`). onhyper.io's app hosting expects a single HTML/CSS/JS file, not a multi-file static site.

**Solutions**:
1. **Vercel Deployment** ✅ Recommended - Full Next.js support, dynamic routes work
2. **Single-File Bundle** - Use parcel/rollup to create a single HTML file (needs refactoring)
3. **Hyper-Micro Storage** - Upload `/out` folder to storage bucket (needs URL rewriting)

---

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
│  │  Database: users ✅                                  │   │
│  │  Database: courses ✅                                │   │
│  │  Database: sessions ✅                               │   │
│  │  Storage: course-creator ✅ (for static files)       │   │
│  │                                                      │   │
│  │  POST /api/dbs/:db/docs - Create document           │   │
│  │  GET /api/dbs/:db/docs/:id - Get document           │   │
│  │  PUT /api/dbs/:db/docs/:id - Update document        │   │
│  │  DELETE /api/dbs/:db/docs/:id - Delete document     │   │
│  │  GET /api/dbs/:db/docs - List documents             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Completed Tasks

### Phase 1: Setup Hyper-Micro Databases ✅ COMPLETE
- [x] Understand hyper-micro API structure
- [x] Create `users` database
- [x] Create `courses` database
- [x] Create `sessions` database
- [x] Create `course-creator` storage bucket

### Phase 2: Update API Client ✅ COMPLETE
- [x] Create new hyper-micro client (`src/lib/api/hyper-micro.ts`)
- [x] Create course service (`src/lib/services/course-service.ts`)
- [x] Create user service (`src/lib/services/user-service.ts`)
- [x] Create session service (`src/lib/services/session-service.ts`)

### Phase 3: Client-Side Routing ✅ COMPLETE
- [x] Replace `/courses/[id]/edit` with `/edit?id=xxx`
- [x] Convert page to client component
- [x] Remove Next.js API routes
- [x] Configure static export

### Phase 4: Deployment ⏳ IN PROGRESS
- [x] Build static export (`npm run build` → `/out`)
- [ ] Upload to hosting platform
- [ ] Test all functionality

## Files Created

- `src/lib/api/hyper-micro.ts` - Hyper-micro API client
- `src/lib/services/course-service.ts` - Course CRUD
- `src/lib/services/user-service.ts` - Auth/user management
- `src/lib/services/session-service.ts` - Session management
- `src/lib/services/index.ts` - Exports
- `src/app/edit/page.tsx` - Client-side edit page
- `src/app/not-found.tsx` - 404 page for SPA routing

## Files Removed

- `src/app/api/health/route.ts` - Server-side API route
- `src/app/courses/[id]/edit/page.tsx` - Dynamic route

## Build Output

```
npm run build → out/
├── index.html
├── dashboard/index.html
├── edit/index.html
├── 404.html
├── _next/static/chunks/*.js  (multiple JS files)
├── _next/static/chunks/*.css
└── favicon.ico
```

## Next Steps

1. **Deploy to Vercel** (easiest):
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Or update onhyper.io deployment** to support multi-file static sites

## Estimated Effort
- Phase 1: ✅ Done
- Phase 2: ✅ Done
- Phase 3: ✅ Done
- Phase 4: ~1 hour (hosting dependent)