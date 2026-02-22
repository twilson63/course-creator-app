# AGENTS.md

Guidance for coding agents operating in this repository.

## Project Snapshot

- Stack: Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS v4.
- Testing: Vitest + Testing Library + jsdom.
- Linting: ESLint 9 with `eslint-config-next` (`core-web-vitals` + TypeScript rules).
- Package manager: npm (lockfile is `package-lock.json`).
- Source alias: `@/*` maps to `src/*`.

## Setup And Daily Commands

- Install deps: `npm install`
- Run dev server: `npm run dev`
- Build production bundle: `npm run build`
- Build static bundle: `npm run build:static`
- Start production server: `npm run start`
- Serve static bundle with local OnHyper proxy emulation: `npm run serve:local`
- Build + serve static bundle locally: `npm run dev:full`
- Run lint: `npm run lint`
- Run tests in watch mode: `npm test`
- Run tests once (CI style): `npm run test:run`
- Run coverage: `npm run test:coverage`

## Test Execution Cheatsheet (Including Single Test)

- Run one test file: `npm run test:run -- tests/lib/course/generator.test.ts`
- Run one component test file: `npm run test:run -- tests/components/course/CourseForm.test.tsx`
- Run tests matching a name: `npm run test:run -- -t "should generate course JSON from transcript"`
- Run one file and one named test: `npm run test:run -- tests/lib/course/generator.test.ts -t "should handle LLM errors"`
- Watch a single file: `npm test -- tests/lib/course/generator.test.ts`
- Update command with Vitest direct call if needed: `npx vitest run tests/lib/course/generator.test.ts`

## Lint/Type Expectations

- Lint must pass before finalizing changes.
- There is no dedicated `typecheck` script currently.
- Use `npm run build` as the primary strict type gate in this Next.js repo.
- Optional direct check: `npx tsc --noEmit`.
- Keep code compatible with strict TypeScript settings from `tsconfig.json`.

## Repository Structure

- `src/app/*`: App Router routes, layouts, providers.
- `src/components/*`: UI and feature components.
- `src/lib/*`: domain logic, API clients, auth, course pipeline, publish logic.
- `src/types/*`: shared TypeScript types.
- `tests/*`: unit/integration/component tests mirroring source domains.
- `docs/*`: supporting docs.

## Cursor/Copilot Rule Files

- No `.cursorrules` file found.
- No `.cursor/rules/` directory found.
- No `.github/copilot-instructions.md` found.
- If these files are added later, treat them as higher-priority instructions.

## Code Style Guidelines

### Imports

- Order imports in this sequence:
  1) external packages (`react`, `next`, `vitest`, etc.)
  2) aliased internal modules (`@/lib/...`, `@/components/...`, `@/types/...`)
  3) relative imports (`./x`, `../x`)
- Prefer `import type` for type-only imports.
- Keep imports grouped and avoid unused imports.
- Prefer named exports; use default exports only where framework conventions expect them (e.g., route components).

### Formatting

- Follow existing file-local quote style; repository currently has both single and double quote usage.
- Use semicolons consistently.
- Keep lines readable; wrap long JSX props over multiple lines.
- Use trailing commas where TypeScript emits/accepts them in multiline structures.
- Do not introduce a formatter-specific style shift in unrelated lines.

### TypeScript And Types

- `strict` mode is enabled: avoid `any` unless unavoidable and justified.
- Prefer explicit interfaces/types for public module contracts.
- Model result states with discriminated unions (e.g., `{ ok: true } | { ok: false }`) where applicable.
- Keep shared domain types in `src/types`.
- Use narrow literal unions for status-like fields (`'draft' | 'ready' | ...`).
- Avoid unsafe type assertions; validate unknown data at boundaries.

### Naming Conventions

- React components: PascalCase (`CourseForm.tsx`, `ErrorBoundary.tsx`).
- Utility/library files: kebab-case (`course-service.ts`, `hyper-micro.ts`).
- Variables/functions: camelCase.
- Constants: UPPER_SNAKE_CASE for true constants (`DEFAULT_CONFIG`, `DB_NAME`).
- Keep API-persisted snake_case fields when required by backend contracts (`video_url`, `password_hash`).
- Test files: `*.test.ts` / `*.test.tsx` and mirror source location semantics.

### React/Next Conventions

- Add `'use client';` only when client-side hooks/events/browser APIs are required.
- Prefer server components by default in `src/app` when client behavior is unnecessary.
- Keep provider wiring in `src/app/providers.tsx` and layout concerns in `src/app/layout.tsx`.
- For internal navigation, prefer Next primitives as appropriate for project context.

### Error Handling

- Handle errors at service boundaries and return stable shapes.
- Preserve domain-specific error classes when rethrowing (`LLMError`, `LLMRateLimitError`).
- Provide user-safe messages at UI boundaries; avoid leaking raw backend internals.
- Do not silently swallow errors.
- In async flows, always clear loading/submitting state in `finally` blocks.

### Data/API Patterns

- Centralize HTTP interactions in `src/lib/*` clients/services.
- Prefer OnHyper-style proxy endpoints (`/proxy/openai/*`, `/proxy/hyper-micro/*`) over exposing provider keys in browser code.
- Include `X-App-Slug` for proxy calls; derive from `/a/{slug}` when possible instead of hardcoding.
- Keep request/response typing explicit (`ApiResponse<T>`, domain records).
- Validate external/LLM output before use (`validateCourseDefinition` pattern).
- Use `process.env.NEXT_PUBLIC_*` only for client-safe values; avoid putting private provider secrets in client env.
- Avoid hardcoding secrets and never commit credentials.

### Testing Conventions

- Use `describe` blocks by feature/method.
- Name test cases with behavior-focused phrasing (`should ...`).
- Use Vitest mocks (`vi.fn`, `vi.mock`, `vi.clearAllMocks`, `vi.resetAllMocks`) consistently.
- For React tests, use Testing Library queries by role/label/text, favoring accessible selectors.
- Keep `tests/setup.ts` as the global place for cross-test setup and globals.
- Add or update tests with behavior changes; avoid shipping untested logic changes.

### Comments And Documentation

- Keep existing JSDoc/module headers style in library modules.
- Add comments only when logic is non-obvious.
- Prefer self-explanatory names over explanatory comments.
- Update nearby docs/README snippets when command or behavior changes.

## Agent Workflow Expectations

- Make minimal, focused diffs.
- Do not refactor unrelated areas in the same change.
- Preserve backward-compatible contracts unless explicitly changing them.
- Before finishing: run lint + relevant tests (at least the touched scope).
- If full suite is expensive, run targeted tests and state what was run.
- When adding new scripts or conventions, update this file.

## Quick Pre-PR Checklist

- `npm run lint`
- `npm run test:run -- <affected-test-files>`
- `npm run build` (for type/build safety)
- Verify no secrets in changed files.
- Ensure error states and loading states are covered for UI changes.
