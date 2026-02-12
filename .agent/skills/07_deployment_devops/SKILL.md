---
name: Deployment & DevOps
description: Deploy web applications to production using modern platforms, CI/CD pipelines, and container orchestration
---

# Deployment & DevOps Skill

Deploy and manage web applications in production environments.

## When to Use This Skill

- Deploying to production
- Setting up CI/CD pipelines
- Configuring environment variables
- Setting up Docker containers
- Managing cloud infrastructure

---

## Deployment Platforms

| Platform | Best For | Pricing |
|----------|----------|---------|
| Vercel | Next.js, static sites | Free tier available |
| Railway | Full-stack apps | $5/month |
| AWS | Enterprise, scalability | Pay-as-you-go |
| Render | Simple deployments | Free tier available |
| Fly.io | Global edge deployment | Pay-as-you-go |

---

## Vercel Deployment (Next.js)

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Deploy

```bash
# First deployment
vercel

# Production deployment
vercel --prod
```

### 3. Environment Variables

```bash
# Add environment variable
vercel env add DATABASE_URL

# Or use Vercel dashboard: Settings → Environment Variables
```

### 4. vercel.json Configuration

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "DATABASE_URL": "@database-url"
  }
}
```

---

## Docker Containerization

### Dockerfile for Next.js

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/myapp
      - NEXTAUTH_SECRET=your-secret
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  postgres_data:
```

### .dockerignore

```
node_modules
.next
.git
.env*.local
*.log
```

---

## CI/CD with GitHub Actions

### Complete Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Log in to Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
      
      - name: Deploy to production
        run: |
          # Add your deployment command here
          # e.g., SSH into server and pull new image
          echo "Deploying to production..."
```

---

## Environment Management

### .env Files Structure

```
.env.local          # Local development (git ignored)
.env.development    # Development defaults
.env.production     # Production defaults (no secrets!)
.env.example        # Template for new developers
```

### .env.example

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/myapp

# Authentication
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# API Keys (get from providers)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Optional
REDIS_URL=redis://localhost:6379
```

### Loading in Next.js

```typescript
// lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
})

export const env = envSchema.parse(process.env)
```

---

## Database Migrations in Production

```bash
# Railway / Render
# Add to build command:
"prisma migrate deploy && next build"

# Or separate migration step
npm run migrate:deploy
npm run build

# Rollback strategy
# Keep previous migration files
# Test rollback in staging first
prisma migrate resolve --rolled-back [migration_name]
```

---

## Monitoring & Logging

### Error Tracking (Sentry)

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})

// Use in components
try {
  await riskyOperation()
} catch (error) {
  Sentry.captureException(error)
  throw error
}
```

### Application Logging

```typescript
// lib/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
})

// Usage
logger.info({ userId }, 'User logged in')
logger.error({ error }, 'Failed to process payment')
```

---

## Health Checks

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected'
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Database connection failed'
      },
      { status: 503 }
    )
  }
}
```

---

## Performance Monitoring

```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
```

---

## Common Pitfalls

❌ **Hardcoded secrets**: Always use environment variables
❌ **No health checks**: Implement /health endpoint
❌ **Direct main pushes**: Require PR reviews
❌ **No rollback plan**: Always test rollback procedures
❌ **Missing monitoring**: Set up error tracking from day 1

---

## Related Skills

- [Testing & Quality Assurance](#)
- [Database Design & Management](#)
- [Performance Optimization](#)
- [Error Handling & Debugging](#)
