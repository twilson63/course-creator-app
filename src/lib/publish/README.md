# ZenBin Publishing API

> Publish content to permanent, decentralized hosting

## Overview

ZenBin provides permanent hosting for HTML content. Each publish creates a unique URL that never expires.

## Installation

```typescript
import { ZenBinClient, publishCourse } from '@/lib/publish/zenbin';
```

## Usage

### Quick Publish

```typescript
import { publishCourse } from '@/lib/publish/zenbin';

const html = '<html><body><h1>My Course</h1></body></html>';

const result = await publishCourse(html);
console.log(result.url); // https://zenbin.io/abc123
console.log(result.id);  // abc123
```

### With Custom Base URL

```typescript
import { ZenBinClient } from '@/lib/publish/zenbin';

const client = new ZenBinClient('https://custom.zenbin.io');
const result = await client.publish(html);
```

### With Options

```typescript
const result = await publishCourse(html, {
  maxRetries: 5,    // Max retry attempts on ID conflict
  id: 'custom-id',  // Custom ID (optional)
});
```

## Auto-Retry on Conflict

If the auto-generated ID already exists, the client automatically retries with a new ID:

```typescript
// Automatic retry on 409 Conflict
const result = await client.publish(html, { maxRetries: 5 });
```

## ID Generation

IDs are URL-safe base64-encoded random strings:

```typescript
import { generateCourseId } from '@/lib/publish/zenbin';

const id = generateCourseId();
// Example: 'abc123XYZ_abc123'
```

## HTML Encoding

HTML is encoded to UTF-8 base64 before publishing:

```typescript
import { encodeHTML } from '@/lib/publish/zenbin';

const base64 = encodeHTML('<html>...</html>');
```

## Retrieving Content

```typescript
const client = new ZenBinClient();
const content = await client.get('abc123');

if (content) {
  console.log(content.id);      // 'abc123'
  console.log(content.content); // Base64-encoded HTML
}
```

## Error Handling

```typescript
try {
  const result = await publishCourse(html);
} catch (error) {
  if (error instanceof Error) {
    console.error('Publish failed:', error.message);
  }
}
```

## Configuration

No configuration required. Uses zenbin.io by default.

## API Reference

### `publishCourse(html, options?)`

Publish HTML content to ZenBin.

- `html` - HTML content string
- `options.maxRetries` - Max retry attempts (default: 5)
- `options.id` - Custom ID (optional)

Returns: `Promise<{ id: string; url: string }>`

### `ZenBinClient`

Create a client with custom settings.

```typescript
const client = new ZenBinClient(baseUrl?);
await client.publish(html, options?);
await client.get(id);
```

### `generateCourseId()`

Generate a unique, URL-safe ID.

### `encodeHTML(html)`

Encode HTML to UTF-8 base64.