# SPA Refactoring Plan

## Goal
Convert the Next.js app to a static SPA deployable to onhyper.io, with API backend on hyper-micro.

## Status: COMPLETE ✅

All phases complete! The app is now live at: **https://onhyper.io/a/course-creator-30c2a685**

**Deployment Method**: ZIP upload via `POST /api/apps/:id/zip`
- 63 files uploaded successfully
- Next.js static export with pushstate routing
- Client-side routing works on subdomain URLs

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

### Phase 4: Deployment ✅ COMPLETE
- [x] Build static export (`npm run build` → `/out`)
- [x] Create ZIP of output directory
- [x] Upload via `POST /api/apps/:id/zip` endpoint
- [x] Test all functionality

## Deployment Details

**ZIP Upload**:
```bash
cd out && zip -r ../course-creator.zip . && cd ..
curl -X POST https://onhyper.io/api/apps/{app_id}/zip \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@course-creator.zip"
```

**Result**: 63 files uploaded, app live at https://onhyper.io/a/course-creator-30c2a685

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

## Completed! 🎉

The Course Creator app is now deployed to onhyper.io via ZIP upload. This is the recommended deployment method for Next.js static exports on onhyper.io.

**Live URL**: https://onhyper.io/a/course-creator-30c2a685

## Estimated Effort
- Phase 1: ✅ Done
- Phase 2: ✅ Done
- Phase 3: ✅ Done
- Phase 4: ✅ Done (Total time: ~2 hours)