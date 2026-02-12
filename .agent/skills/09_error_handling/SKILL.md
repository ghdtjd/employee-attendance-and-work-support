---
name: Error Handling & Debugging
description: Implement comprehensive error handling, logging, and debugging strategies for production applications
---

# Error Handling & Debugging Skill

Build resilient applications with proper error handling and debugging capabilities.

## When to Use This Skill

- Implementing error boundaries
- Setting up error tracking
- Debugging production issues
- Creating error recovery flows
- Logging and monitoring

---

## Client-Side Error Handling

### Error Boundaries (React)

```tsx
'use client'

import React from 'react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error tracking service
    console.error('Error caught by boundary:', error, errorInfo)
    
    // Send to Sentry, LogRocket, etc.
    if (typeof window !== 'undefined') {
      window.Sentry?.captureException(error, { contexts: { react: errorInfo } })
    }
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      )
    }
    
    return this.props.children
  }
}

// Usage
export default function App() {
  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  )
}
```

### Global Error Handler

```tsx
// app/global-error.tsx (Next.js App Router)
'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  )
}

// app/error.tsx (Page-level error)
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])
  
  return (
    <div>
      <h2>Error: {error.message}</h2>
      <button onClick={reset}>Reset</button>
    </div>
  )
}
```

---

## API Error Handling

### Standardized Error Response

```typescript
// lib/api-error.ts
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details?: any) {
    super(message, 422, 'VALIDATION_ERROR', details)
  }
}

export class UnauthorizedError extends APIError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND')
  }
}
```

### Error Handler Middleware

```typescript
// lib/error-handler.ts
import { NextResponse } from 'next/server'
import { APIError } from './api-error'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

export function handleAPIError(error: unknown) {
  console.error('API Error:', error)
  
  // Custom API Errors
  if (error instanceof APIError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details
      },
      { status: error.statusCode }
    )
  }
  
  // Validation Errors (Zod)
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.flatten()
      },
      { status: 422 }
    )
  }
  
  // Prisma Errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Resource already exists', code: 'DUPLICATE' },
        { status: 409 }
      )
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Resource not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }
  }
  
  // Generic Server Error
  return NextResponse.json(
    { error: 'Internal server error', code: 'INTERNAL_ERROR' },
    { status: 500 }
  )
}

// Usage in route
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.email) {
      throw new ValidationError('Email is required')
    }
    
    // ... rest of logic
  } catch (error) {
    return handleAPIError(error)
  }
}
```

---

## Logging

### Structured Logging

```typescript
// lib/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() }
    }
  },
  timestamp: pino.stdTimeFunctions.isoTime
})

// Usage
logger.info({ userId: '123', action: 'login' }, 'User logged in')
logger.error({ error, userId }, 'Payment failed')
logger.warn({ threshold: 100, current: 95 }, 'Approaching rate limit')
```

### Request Logging Middleware

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export function middleware(request: NextRequest) {
  const start = Date.now()
  
  const response = NextResponse.next()
  
  // Log after response
  const duration = Date.now() - start
  
  logger.info({
    method: request.method,
    url: request.url,
    status: response.status,
    duration,
    userAgent: request.headers.get('user-agent')
  }, 'Request processed')
  
  return response
}
```

---

## Error Tracking (Sentry)

### Setup

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  beforeSend(event, hint) {
    // Filter out certain errors
    if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
      return null
    }
    return event
  }
})
```

### Manual Error Reporting

```typescript
import * as Sentry from '@sentry/nextjs'

try {
  await processPayment(amount)
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: 'payment',
      amount: amount.toString()
    },
    extra: {
      userId: user.id,
      email: user.email
    }
  })
  
  throw error
}
```

---

## Debugging Strategies

### Console Debugging

```typescript
// Better than console.log
console.table([{ name: 'Alice', age: 25 }, { name: 'Bob', age: 30 }])

console.group('User Login')
console.log('Email:', email)
console.log('Timestamp:', new Date())
console.groupEnd()

console.time('API Call')
await fetchData()
console.timeEnd('API Call')

// Conditional logging
const debug = (msg: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] ${msg}`, data)
  }
}
```

### React DevTools

```tsx
// Add display names for debugging
export const UserCard = memo(function UserCard({ user }) {
  return <div>{user.name}</div>
})

// Debug props changes
export function DebugProps({ children, ...props }) {
  useEffect(() => {
    console.log('Props changed:', props)
  })
  
  return children
}
```

### Network Debugging

```typescript
// Log all fetch requests
const originalFetch = window.fetch
window.fetch = async (...args) => {
  console.log('Fetch:', args[0])
  const response = await originalFetch(...args)
  console.log('Response:', response.status)
  return response
}
```

---

## Retry Logic

```typescript
// Exponential backoff retry
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      
      const backoff = delay * Math.pow(2, i)
      console.log(`Retry ${i + 1}/${maxRetries} after ${backoff}ms`)
      await new Promise(resolve => setTimeout(resolve, backoff))
    }
  }
  
  throw new Error('Max retries exceeded')
}

// Usage
const data = await fetchWithRetry(() => fetch('/api/data').then(r => r.json()))
```

---

## Graceful Degradation

```tsx
'use client'

import { useState, useEffect } from 'react'

export function FeatureWithFallback() {
  const [isSupported, setIsSupported] = useState(true)
  
  useEffect(() => {
    // Check if browser supports feature
    if (!window.IntersectionObserver) {
      setIsSupported(false)
    }
  }, [])
  
  if (!isSupported) {
    return <SimpleFallbackComponent />
  }
  
  return <EnhancedComponent />
}
```

---

## Common Pitfalls

❌ **Swallowing errors**: Always log or report errors
❌ **Generic error messages**: Provide actionable error messages
❌ **No error boundaries**: React errors will crash the app
❌ **Not monitoring production**: Set up error tracking from day 1
❌ **Logging sensitive data**: Never log passwords or tokens

---

## Related Skills

- [API Development & Integration](#)
- [Testing & Quality Assurance](#)
- [Deployment & DevOps](#)
