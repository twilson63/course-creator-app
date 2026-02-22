# Deployment Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- onhyper.io account
- OpenAI API key (or compatible LLM)

## Environment Variables

Create `.env.production` with:

```env
# Hyper Micro Backend (onhyper.io)
NEXT_PUBLIC_HYPER_MICRO_URL=https://your-app.onhyper.io

# LLM API
LLM_API_URL=https://api.openai.com/v1
LLM_API_KEY=sk-your-api-key
LLM_MODEL=gpt-4

# ZenBin Publishing
NEXT_PUBLIC_ZENBIN_URL=https://zenbin.org

# App URL
NEXT_PUBLIC_APP_URL=https://your-app.onhyper.io
```

## Deployment Steps

### 1. Build Production App

```bash
npm run build
```

### 2. Test Production Build Locally

```bash
npm run start
```

Verify:
- [ ] App loads at http://localhost:3000
- [ ] Signup works
- [ ] Login works
- [ ] Course creation works
- [ ] Publishing works

### 3. Deploy to onhyper.io

```bash
# Using onhyper CLI (if available)
npx onhyper deploy

# Or via Git push
git push origin main
```

### 4. Verify Production

- [ ] https://your-app.onhyper.io loads
- [ ] HTTPS enforced
- [ ] No console errors
- [ ] All features working

## Post-Deployment Checklist

- [ ] Create test user account
- [ ] Create test course
- [ ] Test video URL input
- [ ] Test course generation
- [ ] Test edit studio
- [ ] Test publish to ZenBin
- [ ] Test share link
- [ ] Test dashboard filtering
- [ ] Test course deletion

## Monitoring

### Health Check Endpoint

The app should respond to `/api/health` with:

```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

### Error Tracking

Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- Vercel Analytics for performance

## Rollback

If issues found:

```bash
# List recent deployments
npx onhyper list

# Rollback to previous
npx onhyper rollback
```

## CI/CD (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npm test
      - run: npm run build
      - run: npx onhyper deploy
        env:
          ONHYPER_TOKEN: ${{ secrets.ONHYPER_TOKEN }}
```
