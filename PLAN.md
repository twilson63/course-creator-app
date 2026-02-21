# Course Creator Web App - Implementation Plan

A multi-tenant web application that converts video transcripts into interactive courses, built on onhyper.io and hyper-micro.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React / Next.js SPA on onhyper.io |
| Backend | hyper-micro (deployed on Railway) |
| Data | LMDB via hyper-micro Data API |
| Storage | S3-compatible via hyper-micro Storage API |
| LLM | Ollama Cloud (via onhyper.io API keys) |
| Publishing | ZenBin.org |
| UI Components | ui.sh (Tailwind-based) |

### API Configuration

```
Base URL: https://desirable-beauty-production-d4d8.up.railway.app
API Key: hm_5b93ba083e2ffa0dfb700f3cabc4149c
Authorization: Bearer <api-key>
```

### ZenBin Publishing

```
POST https://zenbin.org/v1/pages/{id}
Body: { encoding: "base64", html: "...", title: "..." }
Response: { url: "https://zenbin.org/p/{id}" }
```

---

## Development Principles

1. **Test-Driven**: Write tests alongside code. All tests must pass before commit.
2. **Inline Documentation**: Document functions, components, and modules inline.
3. **Success Criteria**: Each task has verifiable success criteria.
4. **Incremental Commits**: Small, focused commits with clear messages.

---

## Phase 1: Project Setup & Infrastructure

### Task 1.1: Initialize Frontend Project
**Description**: Create Next.js SPA project structure

**Steps**:
1. Create Next.js project with React 18
2. Configure for SPA mode (no SSR for onhyper.io compatibility)
3. Set up Tailwind CSS
4. Configure environment variables
5. Set up project folder structure

**Files to Create**:
```
course-creator-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   └── .gitkeep
│   ├── lib/
│   │   ├── api.ts
│   │   └── hyper-micro.ts
│   └── types/
│       └── index.ts
├── public/
├── tests/
├── .env.local
├── next.config.js
├── tailwind.config.js
└── package.json
```

**Success Criteria**:
- [ ] `npm run dev` starts development server
- [ ] `npm run build` completes without errors
- [ ] Tailwind classes work in components
- [ ] Environment variables load correctly

**Tests**:
- Unit test: Config loads environment variables
- Unit test: API base URL configured correctly

---

### Task 1.2: Set Up Testing Infrastructure
**Description**: Configure Jest and React Testing Library

**Steps**:
1. Install Jest, React Testing Library, @testing-library/jest-dom
2. Create jest.config.js
3. Create jest.setup.js with custom matchers
4. Add test scripts to package.json
5. Create sample test to verify setup

**Success Criteria**:
- [ ] `npm test` runs all tests
- [ ] `npm test -- --coverage` generates coverage report
- [ ] Sample component test passes

**Tests**:
- Integration test: Test runner executes successfully
- Unit test: Sample component renders

---

### Task 1.3: Create Hyper-Micro API Client
**Description**: Build typed API client for hyper-micro backend

**Steps**:
1. Create HTTP client with authorization header
2. Implement Data API methods (CRUD)
3. Implement Storage API methods (upload, download, list)
4. Add error handling and retry logic
5. Add TypeScript types for all API responses

**Files**:
- `src/lib/hyper-micro.ts` - API client
- `src/types/api.ts` - API types

**Success Criteria**:
- [ ] API client connects to hyper-micro backend
- [ ] Authorization header sent correctly
- [ ] Can create and retrieve documents
- [ ] Can upload and download files

**Tests**:
- Unit test: Authorization header configured
- Integration test: Create document via API
- Integration test: Retrieve document via API
- Integration test: Upload file via API

---

### Task 1.4: Set Up Database Schema
**Description**: Create database and initial collections in hyper-micro

**Steps**:
1. Create `users` database
2. Create `courses` database
3. Create `transcripts` storage bucket
4. Create `generated-html` storage bucket
5. Document schema structure

**Data Schema**:

```typescript
// users/{user_id}
interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

// courses/{course_id}
interface Course {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  video_url: string;
  transcript_key?: string; // storage key
  course_json?: CourseJSON;
  zenbin_id?: string;
  zenbin_url?: string;
  status: 'draft' | 'processing' | 'ready' | 'published';
  created_at: string;
  updated_at: string;
}
```

**Success Criteria**:
- [ ] Can query users database
- [ ] Can query courses database
- [ ] Can list transcripts bucket
- [ ] Can list generated-html bucket

**Tests**:
- Integration test: Users database accessible
- Integration test: Courses database accessible
- Integration test: Storage buckets accessible

---

## Phase 2: Authentication System

### Task 2.1: Implement Password Hashing
**Description**: Create secure password hashing utilities

**Steps**:
1. Install bcryptjs or use Web Crypto API
2. Create hash function with salt
3. Create verify function
4. Add timing-safe comparison

**Files**:
- `src/lib/auth/password.ts`

**Success Criteria**:
- [ ] Passwords hashed with bcrypt/salt
- [ ] Verification works correctly
- [ ] Hashing is consistent across calls

**Tests**:
- Unit test: Hash password returns valid hash
- Unit test: Verify correct password returns true
- Unit test: Verify wrong password returns false
- Unit test: Different passwords produce different hashes

---

### Task 2.2: Implement Session Management
**Description**: Create session tokens and management

**Steps**:
1. Generate secure session tokens
2. Store sessions in hyper-micro
3. Create session middleware
4. Set token expiration (30 days)
5. Implement session cleanup

**Files**:
- `src/lib/auth/session.ts`
- `src/lib/auth/middleware.ts`

**Success Criteria**:
- [ ] Sessions created on login
- [ ] Sessions validated on protected routes
- [ ] Expired sessions rejected
- [ ] Sessions can be revoked (logout)

**Tests**:
- Unit test: Create session returns valid token
- Unit test: Validate session returns user
- Unit test: Expired session returns null
- Unit test: Logout revokes session

---

### Task 2.3: Build Signup Flow
**Description**: Create user registration functionality

**Steps**:
1. Create signup form component
2. Validate email format
3. Validate password strength
4. Check for existing email
5. Create user record
6. Auto-login after signup

**Files**:
- `src/components/auth/SignupForm.tsx`
- `src/app/signup/page.tsx`
- `src/lib/auth/signup.ts`

**Success Criteria**:
- [ ] Valid email required
- [ ] Password minimum 8 characters
- [ ] Duplicate emails rejected
- [ ] User created in database
- [ ] Session created after signup

**Tests**:
- Unit test: Email validation works
- Unit test: Password validation works
- Integration test: Can signup with valid data
- Integration test: Cannot signup with duplicate email
- E2E test: Signup flow completes

---

### Task 2.4: Build Login Flow
**Description**: Create user login functionality

**Steps**:
1. Create login form component
2. Verify credentials
3. Create session on success
4. Redirect to dashboard
5. Handle login errors

**Files**:
- `src/components/auth/LoginForm.tsx`
- `src/app/login/page.tsx`
- `src/lib/auth/login.ts`

**Success Criteria**:
- [ ] Can login with valid credentials
- [ ] Invalid credentials show error
- [ ] Session persists across page reloads
- [ ] Redirect to dashboard on success

**Tests**:
- Integration test: Login with valid credentials
- Integration test: Login with invalid credentials fails
- Unit test: Session stored after login
- E2E test: Login flow completes

---

### Task 2.5: Build Logout Flow
**Description**: Create user logout functionality

**Steps**:
1. Create logout button component
2. Clear session from storage
3. Revoke session in database
4. Redirect to login page

**Files**:
- `src/components/auth/LogoutButton.tsx`
- `src/lib/auth/logout.ts`

**Success Criteria**:
- [ ] Session cleared on logout
- [ ] Redirect to login page
- [ ] Protected routes inaccessible after logout

**Tests**:
- Integration test: Logout clears session
- E2E test: Logout flow completes

---

### Task 2.6: Create Auth Context
**Description**: React context for authentication state

**Steps**:
1. Create AuthContext with provider
2. Track current user state
3. Provide login/logout/signup methods
4. Auto-restore session on app load
5. Create useAuth hook

**Files**:
- `src/contexts/AuthContext.tsx`
- `src/hooks/useAuth.ts`

**Success Criteria**:
- [ ] Auth state available in all components
- [ ] Session restored on page reload
- [ ] Loading states handled

**Tests**:
- Unit test: AuthContext provides user state
- Unit test: useAuth hook works
- Integration test: Session restoration works

---

## Phase 3: Course Creation Core

### Task 3.1: Create Course Type Definitions
**Description**: TypeScript types for course data structure

**Steps**:
1. Define CourseMeta interface
2. Define CourseStep interface
3. Define CourseJSON interface
4. Define CourseCheckpoint interface
5. Create validation schemas

**Files**:
- `src/types/course.ts`
- `src/lib/course/validation.ts`

**Success Criteria**:
- [ ] Types match course-creator CLI schema
- [ ] Validation catches invalid data
- [ ] Types exported for use in components

**Tests**:
- Unit test: Valid course JSON passes validation
- Unit test: Invalid course JSON fails validation

---

### Task 3.2: Build Course Form Component
**Description**: Form for creating/editing course metadata

**Steps**:
1. Create CourseForm component
2. Add fields: title, description, video URL
3. Add transcript upload input
4. Add form validation
5. Handle submit

**Files**:
- `src/components/course/CourseForm.tsx`
- `src/components/course/TranscriptUpload.tsx`

**Success Criteria**:
- [ ] All metadata fields editable
- [ ] Video URL validated (YouTube, Loom, Vimeo, Descript)
- [ ] Transcript file upload works
- [ ] Form validation shows errors

**Tests**:
- Unit test: Form renders all fields
- Unit test: Video URL validation
- Unit test: Form submit creates course

---

### Task 3.3: Implement Transcript Upload
**Description**: Upload and store transcript files

**Steps**:
1. Create file upload handler
2. Validate file type (txt, md, json)
3. Upload to hyper-micro storage
4. Store reference in course record
5. Handle upload errors

**Files**:
- `src/lib/course/transcript.ts`
- `src/components/course/TranscriptUpload.tsx`

**Success Criteria**:
- [ ] File uploads to storage bucket
- [ ] Storage key saved to course
- [ ] File size limit enforced (1MB)
- [ ] Error handling for failed uploads

**Tests**:
- Integration test: Upload transcript file
- Integration test: Retrieve uploaded file
- Unit test: File type validation

---

### Task 3.4: Create LLM Service Client
**Description**: Client for Ollama Cloud API via onhyper.io

**Steps**:
1. Create LLM API client
2. Define prompt templates
3. Implement JSON generation prompt
4. Implement HTML generation prompt
5. Add error handling and retries

**Files**:
- `src/lib/llm/client.ts`
- `src/lib/llm/prompts.ts`

**Prompt Templates**:

```typescript
// Prompt 1: Transcript → JSON
const TRANSCRIPT_TO_JSON_PROMPT = `
You are a course creator. Read this transcript from a video and create a course structure.

Video URL: {video_url}
Transcript:
{transcript}

Create a JSON file with the following structure:
{
  "meta": { "title", "description", "author", "estimatedTime", "difficulty" },
  "steps": [{ "id", "title", "videoUrl", "videoTimestamp", "videoEndTimestamp", "content", "estimatedTime", "checkpoint" }],
  "resources": [{ "label", "url" }]
}

Break the transcript into logical learning steps with timestamps.
Return ONLY valid JSON.
`;

// Prompt 2: JSON → HTML
const JSON_TO_HTML_PROMPT = `
You are a course HTML generator. Create a standalone HTML page for this course.

Course JSON:
{course_json}

Create a responsive HTML page with:
- Video player synced to timestamps
- Step navigation with checkboxes
- Progress tracking
- Clean, modern design with Tailwind CSS classes

Return ONLY the HTML, no markdown code blocks.
`;
```

**Success Criteria**:
- [ ] LLM API client connects successfully
- [ ] Transcript-to-JSON prompt produces valid JSON
- [ ] JSON-to-HTML prompt produces valid HTML
- [ ] Errors handled gracefully

**Tests**:
- Unit test: Prompt templates generate correctly
- Integration test: LLM returns valid response
- Integration test: Invalid transcript handled

---

### Task 3.5: Implement Course Generation Pipeline
**Description**: End-to-end course creation flow

**Steps**:
1. Create course generation service
2. Call LLM with transcript → get JSON
3. Parse and validate JSON
4. Call LLM with JSON → get HTML
5. Save JSON and HTML to course record
6. Update course status

**Files**:
- `src/lib/course/generator.ts`
- `src/lib/course/pipeline.ts`

**Success Criteria**:
- [ ] Pipeline processes transcript end-to-end
- [ ] JSON validated before HTML generation
- [ ] Course status updated during processing
- [ ] Errors show user-friendly messages

**Tests**:
- Integration test: Full pipeline completes
- Unit test: JSON parsing handles errors
- Unit test: Status updates correctly

---

## Phase 4: Edit Studio

### Task 4.1: Build Edit Studio Layout
**Description**: Main editing interface for courses

**Steps**:
1. Create EditStudio component
2. Add sidebar with course metadata
3. Add main content area for steps
4. Add step navigation
5. Add prompt input for refinement

**Files**:
- `src/components/studio/EditStudio.tsx`
- `src/components/studio/Sidebar.tsx`
- `src/components/studio/StepList.tsx`
- `src/app/courses/[id]/edit/page.tsx`

**Success Criteria**:
- [ ] Layout responsive on desktop/tablet
- [ ] Steps listed in order
- [ ] Active step highlighted
- [ ] Prompt input always visible

**Tests**:
- Unit test: Layout renders correctly
- Unit test: Steps display in order
- E2E test: Navigation between steps

---

### Task 4.2: Build Step Preview Component
**Description**: Read-only preview of step content

**Steps**:
1. Create StepPreview component
2. Display step title and timestamp
3. Render markdown content
4. Show video preview at timestamp
5. Display checkpoint

**Files**:
- `src/components/studio/StepPreview.tsx`
- `src/components/studio/VideoPreview.tsx`

**Success Criteria**:
- [ ] Markdown renders correctly
- [ ] Video shows at correct timestamp
- [ ] Timestamps clickable
- [ ] Checkpoint visible

**Tests**:
- Unit test: Markdown renders
- Unit test: Video timestamp parsed correctly

---

### Task 4.3: Build Prompt-Based Editing
**Description**: Edit course via natural language prompts

**Steps**:
1. Create PromptInput component
2. Send prompt + current JSON to LLM
3. LLM returns updated JSON
4. Show diff preview
5. Accept or reject changes

**Files**:
- `src/components/studio/PromptInput.tsx`
- `src/components/studio/DiffPreview.tsx`
- `src/lib/course/refine.ts`

**Success Criteria**:
- [ ] Prompts sent with course context
- [ ] LLM returns valid updated JSON
- [ ] Changes shown before applying
- [ ] User can accept/reject

**Tests**:
- Integration test: Prompt updates JSON
- Unit test: Diff detection works
- E2E test: User accepts changes

---

### Task 4.4: Build Course JSON Viewer
**Description**: View course structure and metadata

**Steps**:
1. Create CourseJSONViewer component
2. Display meta section
3. Display steps list with titles
4. Display resources list
5. Add copy-to-clipboard

**Files**:
- `src/components/studio/CourseJSONViewer.tsx`

**Success Criteria**:
- [ ] JSON displayed in readable format
- [ ] Collapsible sections
- [ ] Copy button works

**Tests**:
- Unit test: JSON renders correctly
- Unit test: Copy to clipboard works

---

## Phase 5: Publishing

### Task 5.1: Implement ZenBin Publishing
**Description**: Publish HTML courses to ZenBin

**Steps**:
1. Create ZenBin API client
2. Generate unique course ID
3. Encode HTML as base64
4. POST to ZenBin API
5. Handle conflicts (retry with new ID)
6. Save ZenBin URL to course

**Files**:
- `src/lib/publish/zenbin.ts`
- `src/components/course/PublishButton.tsx`

**Success Criteria**:
- [ ] HTML encoded correctly
- [ ] Unique IDs generated
- [ ] Conflicts handled with retry
- [ ] URL saved to course record

**Tests**:
- Integration test: Publish to ZenBin
- Integration test: Handle ID conflict
- Unit test: Base64 encoding works

---

### Task 5.2: Build Publish Flow UI
**Description**: User interface for publishing courses

**Steps**:
1. Create PublishModal component
2. Show preview of course
3. Add publish button
4. Show progress indicator
5. Display success with share link
6. Add copy link button

**Files**:
- `src/components/course/PublishModal.tsx`
- `src/components/course/ShareLink.tsx`

**Success Criteria**:
- [ ] Modal shows before publishing
- [ ] Progress shown during publish
- [ ] Success shows shareable link
- [ ] Link can be copied

**Tests**:
- Unit test: Modal renders
- E2E test: Publish flow completes
- E2E test: Link copied to clipboard

---

## Phase 6: Dashboard & Course Management

### Task 6.1: Build Dashboard Page
**Description**: Main dashboard showing user's courses

**Steps**:
1. Create Dashboard component
2. Fetch user's courses
3. Display course cards
4. Add create new course button
5. Add status indicators

**Files**:
- `src/app/dashboard/page.tsx`
- `src/components/dashboard/CourseCard.tsx`
- `src/components/dashboard/CourseList.tsx`

**Success Criteria**:
- [ ] All courses displayed
- [ ] Status shown (draft, ready, published)
- [ ] Click navigates to edit/view
- [ ] Create button works

**Tests**:
- Integration test: Courses load
- Unit test: Course card displays correctly
- E2E test: Navigate to course

---

### Task 6.2: Build Course List Component
**Description**: List of courses with filtering

**Steps**:
1. Create CourseList component
2. Add status filter tabs
3. Add search input
4. Implement pagination or infinite scroll
5. Handle empty state

**Files**:
- `src/components/dashboard/CourseList.tsx`
- `src/components/dashboard/StatusFilter.tsx`

**Success Criteria**:
- [ ] Filter by status works
- [ ] Search filters courses
- [ ] Empty state shows message
- [ ] Performance acceptable with many courses

**Tests**:
- Unit test: Filter works
- Unit test: Search works
- Unit test: Empty state displays

---

### Task 6.3: Build Course Delete Flow
**Description**: Delete courses with confirmation

**Steps**:
1. Add delete button to course card
2. Create confirmation modal
3. Delete from database
4. Remove from list
5. Handle errors

**Files**:
- `src/components/course/DeleteModal.tsx`
- `src/lib/course/delete.ts`

**Success Criteria**:
- [ ] Confirmation required
- [ ] Course deleted from database
- [ ] List updated immediately
- [ ] Errors shown to user

**Tests**:
- Integration test: Delete course
- E2E test: Delete flow with confirmation

---

## Phase 7: Polish & Documentation

### Task 7.1: Add Error Handling & Toasts
**Description**: Global error handling and notifications

**Steps**:
1. Create Toast component
2. Create ErrorBoundary component
3. Add toast notifications for actions
4. Handle API errors gracefully
5. Add retry mechanisms

**Files**:
- `src/components/ui/Toast.tsx`
- `src/components/ui/ErrorBoundary.tsx`
- `src/lib/utils/notifications.ts`

**Success Criteria**:
- [ ] All actions show feedback
- [ ] Errors don't crash app
- [ ] Toasts dismissible
- [ ] Errors logged

**Tests**:
- Unit test: Toast renders
- Unit test: ErrorBoundary catches errors

---

### Task 7.2: Add Loading States
**Description**: Loading indicators throughout the app

**Steps**:
1. Create Spinner component
2. Create Skeleton components
3. Add loading states to all async operations
4. Add Suspense boundaries

**Files**:
- `src/components/ui/Spinner.tsx`
- `src/components/ui/Skeleton.tsx`
- `src/components/ui/LoadingPage.tsx`

**Success Criteria**:
- [ ] No blank screens during loading
- [ ] Skeleton states match content
- [ ] Responsive loading indicators

**Tests**:
- Unit test: Spinner renders
- Unit test: Skeleton renders

---

### Task 7.3: Write API Documentation
**Description**: Document all API integrations

**Steps**:
1. Document hyper-micro API client
2. Document ZenBin API client
3. Document LLM API client
4. Create API usage examples
5. Add to README

**Files**:
- `src/lib/hyper-micro/README.md`
- `src/lib/publish/README.md`
- `src/lib/llm/README.md`

**Success Criteria**:
- [ ] All API methods documented
- [ ] Examples provided
- [ ] Error handling documented

---

### Task 7.4: Write Component Documentation
**Description**: Document all React components

**Steps**:
1. Add JSDoc to all components
2. Document props with TypeScript
3. Add usage examples
4. Document state management
5. Create component index

**Files**:
- `src/components/README.md`
- Inline JSDoc in all components

**Success Criteria**:
- [ ] All components have JSDoc
- [ ] Props documented
- [ ] Examples in docs

---

### Task 7.5: Write User Guide
**Description**: End-user documentation

**Steps**:
1. Write getting started guide
2. Document course creation flow
3. Document edit studio
4. Document publishing
5. Add FAQ section

**Files**:
- `docs/USER_GUIDE.md`
- `docs/FAQ.md`

**Success Criteria**:
- [ ] Guide covers all features
- [ ] Screenshots included
- [ ] FAQ addresses common issues

---

## Phase 8: Deployment

### Task 8.1: Configure onhyper.io Deployment
**Description**: Set up deployment to onhyper.io

**Steps**:
1. Set up environment variables
2. Configure API keys
3. Set up hyper-micro connection
4. Test production build
5. Deploy

**Success Criteria**:
- [ ] App deploys successfully
- [ ] Environment variables set
- [ ] API connections work
- [ ] HTTPS enforced

**Tests**:
- E2E test: Production app loads
- E2E test: Signup works
- E2E test: Course creation works

---

### Task 8.2: Production Testing
**Description**: Final testing in production environment

**Steps**:
1. Test full user flow
2. Test all API integrations
3. Test LLM generation
4. Test ZenBin publishing
5. Test error handling

**Success Criteria**:
- [ ] All E2E tests pass
- [ ] Performance acceptable
- [ ] No console errors
- [ ] All features working

**Tests**:
- E2E test: Full signup to publish flow
- Performance test: Page load times
- Accessibility test: WCAG compliance

---

## Task Execution Checklist

For each task, complete in this order:

1. **[ ] Write the tests first** (TDD approach)
2. **[ ] Implement the code**
3. **[ ] Run tests - all must pass**
4. **[ ] Add inline documentation**
5. **[ ] Commit with clear message**
6. **[ ] Update task status in this document**

---

## Progress Tracking

| Phase | Tasks | Completed | Status |
|-------|-------|-----------|--------|
| 1. Project Setup | 4 | 0 | Not Started |
| 2. Authentication | 6 | 0 | Not Started |
| 3. Course Creation | 5 | 0 | Not Started |
| 4. Edit Studio | 4 | 0 | Not Started |
| 5. Publishing | 2 | 0 | Not Started |
| 6. Dashboard | 3 | 0 | Not Started |
| 7. Polish & Docs | 5 | 0 | Not Started |
| 8. Deployment | 2 | 0 | Not Started |

**Total Tasks: 31**

---

## Quick Reference

### Environment Variables
```
# .env.local
NEXT_PUBLIC_HYPER_MICRO_URL=https://desirable-beauty-production-d4d8.up.railway.app
NEXT_PUBLIC_HYPER_MICRO_KEY=hm_5b93ba083e2ffa0dfb700f3cabc4149c
NEXT_PUBLIC_LLM_API_URL=https://onhyper.io/api/llm
NEXT_PUBLIC_LLM_API_KEY=<from-onhyper>
NEXT_PUBLIC_ZENBIN_URL=https://zenbin.org
```

### Key Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm test         # Run all tests
npm run lint     # Lint code
```

### Git Commit Convention
```
feat: add user authentication
fix: resolve session timeout issue
docs: update API documentation
test: add integration tests for course creation
refactor: improve error handling
```