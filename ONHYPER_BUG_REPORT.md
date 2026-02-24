# OnHyper Path Transformation Bug Report

## Summary
OnHyper's HTML transformation incorrectly modifies **already-relative paths**, breaking Next.js static exports.

## Current Behavior (Broken)
When serving HTML at `/a/{slug}/`, OnHyper transforms relative paths starting with `_next/` by prepending `../`:

| Input (uploaded HTML) | Output (server response) |
|----------------------|-------------------------|
| `href="_next/static/..."` | `href="../_next/static/..."` |
| `src="_next/static/..."` | `src="../_next/static/..."` |

This breaks resolution:
- User visits: `https://onhyper.io/a/course-creator-30c2a685/`
- Browser sees: `<base href="./">` → resolves to `/a/course-creator-30c2a685/`
- Browser requests: `../_next/static/chunks/main.js`
- **Result**: `/a/_next/static/...` (404 - slug is stripped!)

## Expected Behavior
OnHyper should **only transform absolute paths** (starting with `/`), NOT relative paths:

| Path Type | Should Transform? | Example |
|-----------|------------------|---------|
| Absolute (`/_next/...`) | ✅ Yes | → `./_next/...` or `./{slug}/_next/...` |
| Relative (`_next/...`) | ❌ No | Leave as-is |
| Relative with `../` (`../_next/...`) | ❌ No | Leave as-is |

## Evidence

### Local Build (Correct)
```html
<!DOCTYPE html><!--mDJHOUMsFVvasAfGHuFEg--><html lang="en"><head><base href="./">
<link rel="stylesheet" href="_next/static/chunks/5aa949fab1f00130.css">
<script src="_next/static/chunks/0bbdcb40191360f0.js"></script>
```

### Server Response (Broken)
```html
<!DOCTYPE html><!--mDJHOUMsFVvasAfGHuFEg--><html lang="en"><head><!--TRANSFORMED--><base href="./">
<link rel="stylesheet" href="../_next/static/chunks/5aa949fab1f00130.css">
<script src="../_next/static/chunks/0bbdcb40191360f0.js"></script>
```

Note the `<!--TRANSFORMED-->` comment added by OnHyper's middleware.

### Browser Network Errors
```
Failed: /a/_next/static/chunks/5aa949fab1f00130.css (404)
Failed: /a/_next/static/chunks/c00459ac8825e2d8.js (404)
...all 10 JS/CSS files fail
```

## Proposed Fix

In the OnHyper HTML transformation middleware, only prepend `../` to paths that **start with `/`**:

```javascript
// Pseudo-code for the fix
function transformPath(path, depth) {
  // Only transform ABSOLUTE paths (starting with /)
  if (path.startsWith('/')) {
    return '../'.repeat(depth) + path.slice(1);
  }
  // Leave relative paths UNCHANGED
  return path;
}
```

## Context

- **App ID**: `38fae46a-8bd5-4104-892e-20aff3882493`
- **Slug**: `course-creator-30c2a685`
- **Live URL**: https://onhyper.io/a/course-creator-30c2a685
- **Workaround Attempted**: Post-processing HTML to use relative paths (`_next/...` instead of `/_next/...`)
- **Result**: OnHyper still transforms these relative paths

## Impact

This bug prevents **any Next.js static export** from working on OnHyper, as Next.js always generates `_next/` paths that need to remain relative.

---

**Submitted**: 2026-02-21
**Reporter**: Rakis / twilson63