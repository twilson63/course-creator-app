# OnHyper ZIP Upload Bug Report: Static Assets Return 404

**Date:** 2026-02-21
**Reporter:** Rakis (via ribby agent)
**App ID:** `38fae46a-8bd5-4104-892e-20aff3882493`
**App URL:** https://onhyper.io/a/course-creator-30c2a685

---

## Summary

When deploying a static SPA via ZIP upload, **all static assets (JS/CSS/fonts) return 404**. HTML pages load correctly, but referenced files in `static/` or `_next/static/` directories are not served.

---

## Reproduction Steps

1. Build a Next.js static export: `next build` (creates `out/` directory)
2. Create ZIP: `cd out && zip -r ../app.zip .`
3. Upload via API:
   ```bash
   curl -X POST "https://onhyper.io/api/apps/{app_id}/zip" \
     -H "Authorization: Bearer $TOKEN" \
     -F "file=@app.zip"
   ```
4. Access app at `https://onhyper.io/a/{slug}/`
5. Observe: HTML loads, but all JS/CSS files return 404

---

## Evidence

### ZIP Contents (verified uploaded)
```
index.html
static/chunks/c00459ac8825e2d8.js
static/chunks/5aa949fab1f00130.css
static/media/797e433ab948586e-s.p.dbea232f.woff2
...
```

### API Response Confirms Files Stored
```json
{
  "success": true,
  "files_count": 63,
  "files": ["static/chunks/c00459ac8825e2d8.js", ...]
}
```

### Static Files Return 404
```bash
$ curl -I "https://onhyper.io/a/course-creator-30c2a685/static/chunks/c00459ac8825e2d8.js"
HTTP/2 404 
content-type: application/json
```

### HTML Loads Correctly
```bash
$ curl -s "https://onhyper.io/a/course-creator-30c2a685" | head -5
<!DOCTYPE html>
<html lang="en">
<head>
  ...
```

---

## Additional Issues Discovered

### Issue 2: `_next/` Directory Prefix Stripped

When uploading files with `_next/` prefix, OnHyper strips the leading underscore:

| Uploaded Path | Stored Path |
|--------------|-------------|
| `_next/static/chunks/file.js` | `static/chunks/file.js` |

This breaks Next.js apps which expect assets at `/_next/static/`.

### Issue 3: HTML Wrapping Breaks Relative Paths

OnHyper wraps uploaded HTML in its own template:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>course-creator | OnHyper.io</title>
    <!-- OnHyper's wrapper -->
  </head>
  <body>
    <!-- User's HTML injected here -->
    <!DOCTYPE html>
    <html lang="en">
      ...
    </html>
  </body>
</html>
```

This causes relative paths (`./static/`) to resolve incorrectly:
- Expected: `/a/{slug}/static/`
- Actual: `/a/static/` (wrong)

---

## Expected Behavior

1. Static files uploaded via ZIP should be served at their respective paths:
   - `static/chunks/file.js` → `/a/{slug}/static/chunks/file.js`
   - `_next/static/chunks/file.js` → `/a/{slug}/_next/static/chunks/file.js`

2. Directory structure should be preserved (no `_` stripping)

3. HTML should not be wrapped in outer template if it's already a complete HTML document

---

## Additional Testing (2026-02-21 14:49 EST)

### Issue 4: `_next` Directory Filtered During Upload

When uploading ZIP with `_next/` directory:
```
ZIP file: 63 files including _next/static/chunks/*.js
API response: "files_count": 14 (missing all _next files)
```

**Result:** All `_next/*` files are silently filtered/ignored during ZIP processing.

### Issue 5: basePath Configuration Still Broken

Even with Next.js `basePath: '/a/course-creator-30c2a685'`:
- HTML correctly references `/a/course-creator-30c2a685/_next/static/*.js`
- Files still return 404 because they weren't stored
- Browser shows "Loading..." indefinitely
- `window.__NEXT_DATA__` is undefined (React never initializes)

### Test Results

| Path | Expected | Actual |
|------|----------|--------|
| `/a/slug/_next/static/chunks/file.js` | JS file | 404 JSON |
| `/a/slug/static/chunks/file.js` | JS file | 404 JSON |
| `/static/chunks/file.js` | JS file | HTML from OnHyper site |
| `/files/slug/static/chunks/file.js` | JS file | HTML (wrong content-type) |

### Root Cause

The ZIP upload API is **filtering out** directories starting with `_` and **not serving** any static files at their expected paths.

---

## Update: Static Files Fixed (2026-02-21 14:51 EST)

Static files are now being served at `/a/{slug}/static/*`! ✅

**New Issue: Nested HTML Structure**

OnHyper wraps uploaded HTML in an outer HTML document:

```
<!DOCTYPE html>           ← OnHyper wrapper
<html>
  <head>...</head>
  <body>
    <!DOCTYPE html>       ← Our HTML (nested inside!)
    <html>
      <head>...</head>
      <body>
        <div>Loading...</div>
        <script src="..."></script>
      </body>
    </html>
  </body>
</html>
```

**Impact:** 
- Invalid HTML structure (nested DOCTYPE/html/body)
- Scripts don't execute properly
- React/Next.js fails to initialize
- Page stuck on "Loading..."

**Workaround Needed:**
- OnHyper should NOT wrap HTML that already has a `<!DOCTYPE html>` declaration
- Or extract only `<body>` content from uploaded HTML

---

## Test Case

A complete reproduction repository is available:
- **GitHub:** https://github.com/twilson63/course-creator-app
- **Build command:** `npm run build` (creates `out/` directory)
- **ZIP creation:** `cd out && zip -r ../app.zip .`

---

## Workaround Attempted

Tried using absolute paths `/a/{slug}/static/` in HTML references:
```html
<script src="/a/course-creator-30c2a685/static/chunks/file.js"></script>
```
Result: Still 404. The files are stored but not served.

---

## Impact

This bug prevents deployment of **any SPA framework** that uses static assets:
- Next.js
- Remix
- Vite builds
- Create React App
- Vue builds
- Any modern JavaScript application

Only simple HTML-only sites can be deployed via ZIP upload.

---

## Suggested Fix

1. **Serve static files from ZIP uploads** at the correct path structure
2. **Preserve directory names** including leading underscores
3. **Add route handling** for `GET /a/{slug}/*` to serve files from uploaded ZIP

---

## Contact

For additional details or testing access, contact:
- **Email:** creator@hyper.io
- **App Dashboard:** https://onhyper.io/dashboard