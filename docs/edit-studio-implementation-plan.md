# Edit Studio Implementation Plan

## Goal

Implement a complete post-generation editing workflow so users can:

- edit course title/description/metadata
- add, edit, and delete sections (steps)
- edit helpful resources
- use the prompt input to refine course JSON with AI
- generate/publish HTML and persist publish metadata

## Current Gaps

- `EditStudio` is mostly read-only and does not persist updates.
- Prompt input in `EditStudio` is placeholder-only (`TODO`).
- Publish flow exists as utilities/components but is not wired in edit flow.
- `edit` page currently reads only `definition` and has no save/update behavior.

## Implementation Milestones

### Milestone 1: Persisted Edit State

1. Load full course record in `src/app/edit/page.tsx` (not only definition).
2. Maintain a local editable `CourseDefinition` state.
3. Add save/update function to write `course_json`, `definition`, `title`, `description`, `updated_at`.
4. Surface save/loading/error status in editor.

### Milestone 2: Manual Course Editing

1. Add editable metadata panel (title, description, author, difficulty, estimated time).
2. Add resources editor (label/url add/remove).
3. Add step management:
   - select step
   - edit title/content/timestamps/checkpoint
   - add new step
   - delete step
4. Keep UX simple and safe (disabled states while saving).

### Milestone 3: Prompt Refinement (Chat Input)

1. Wire prompt input to `refineCourse` flow.
2. Show progress while refinement runs.
3. Apply refined JSON to current draft state.
4. Save refined result back to DB.
5. Show actionable errors on failure.

### Milestone 4: HTML Generation + Publish

1. Generate HTML from current course JSON (`createCourseGenerator().generateHTML`).
2. Add publish action (`publishCourse`) in edit flow.
3. Persist publish metadata:
   - `generated_html`
   - `zenbin_id`
   - `zenbin_url`
   - `status = 'published'`
4. Show published URL and copy/open affordance.

## Technical Notes

- Use existing `dataApi` from `src/lib/hyper-micro.ts`.
- Reuse existing `src/lib/course/refine.ts` and `src/lib/publish/zenbin.ts`.
- Keep course record compatibility with `CourseRecord` in `src/types/course.ts`.
- Avoid introducing server-only secrets in frontend code; continue using `/proxy/*` paths.

## Validation Checklist

- `npm run build:static`
- `npm run test:run -- tests/lib/course/pipeline.test.ts`
- `npm run test:run -- tests/components/course/CourseForm.test.tsx`
- Smoke test local flow:
  - create course from transcript
  - edit title/steps/resources
  - refine via prompt
  - publish and verify URL

## Execution Strategy With Sub-Agents

1. Sub-agent A: data-loading/persistence wiring in `edit` page.
2. Sub-agent B: editor UI controls for metadata/resources/steps.
3. Sub-agent C: prompt refinement + publish wiring and persistence.

Each sub-agent runs focused scope and verifies affected commands before handoff.
