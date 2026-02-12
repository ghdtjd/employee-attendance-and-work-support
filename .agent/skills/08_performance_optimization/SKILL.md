---
name: Performance Optimization
description: Optimize web application performance through code splitting, caching, lazy loading, and Core Web Vitals improvements
---

# Performance Optimization Skill

Maximize web application performance for better user experience and SEO.

## When to Use This Skill

- Slow page load times
- Poor Core Web Vitals scores
- Large bundle sizes
- Inefficient rendering
- API response optimization

---

## Core Web Vitals

| Metric | Good | Needs Improvement | Poor | What It Measures |
|--------|------|-------------------|------|------------------|
| LCP (Largest Contentful Paint) | ≤ 2.5s | 2.5s - 4s | > 4s | Loading performance |
| FID (First Input Delay) | ≤ 100ms | 100ms - 300ms | > 300ms | Interactivity |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | 0.1 - 0.25 | > 0.25 | Visual stability |

---

## Bundle Size Optimization

### 1. Analyze Bundle

```bash
# Next.js bundle analyzer
npm install @next/bundle-analyzer

# next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // your config
})

# Run analysis
ANALYZE=true npm run build
```

### 2. Code Splitting

```tsx
// Dynamic imports with loading state
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false // Disable SSR for client-only components
})

// Lazy load routes
const Dashboard = dynamic(() => import('./Dashboard'))

export default function App() {
  return <Dashboard />
}
```

### 3. Tree Shaking

```typescript
// ❌ Bad: Imports entire library
import _ from 'lodash'
const result = _.debounce(fn, 300)

// ✅ Good: Import only what you need
import { debounce } from 'lodash-es'
const result = debounce(fn, 300)

// Or use specific imports
import debounce from 'lodash/debounce'
```

---

## Image Optimization

```tsx
import Image from 'next/image'

// Automatic optimization
export function ProductImage() {
  return (
    <Image
      src="/product.jpg"
      alt="Product"
      width={800}
      height={600}
      quality={85}              // 85 is optimal (default: 75)
      priority                  // Preload critical images
      placeholder="blur"        // Show blur while loading
      blurDataURL="data:..."    // Low-quality placeholder
      sizes="(max-width: 768px) 100vw, 50vw" // Responsive sizing
    />
  )
}

// Lazy load below-the-fold images
export function GalleryImage() {
  return (
    <Image
      src="/gallery-1.jpg"
      alt="Gallery"
      width={400}
      height={300}
      loading="lazy"  // Browser native lazy loading
    />
  )
}
```

---

## Caching Strategies

### 1. Static Generation with Revalidation

```tsx
// Regenerate page every 60 seconds
export const revalidate = 60

export default async function NewsPage() {
  const news = await fetchNews()
  return <NewsList news={news} />
}
```

### 2. Client-Side Caching (SWR)

```tsx
'use client'

import useSWR from 'swr'

export function UserProfile({ userId }) {
  const { data, error, isLoading } = useSWR(
    `/api/users/${userId}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 10000, // Cache for 10s
    }
  )
  
  if (isLoading) return <Skeleton />
  return <div>{data.name}</div>
}
```

### 3. API Response Caching

```typescript
// app/api/posts/route.ts
export async function GET() {
  const posts = await db.post.findMany()
  
  return NextResponse.json(posts, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
    }
  })
}
```

---

## React Performance

### 1. Memoization

```tsx
import { memo, useMemo, useCallback } from 'react'

// Memo component (skip re-renders if props unchanged)
const ExpensiveChild = memo(function ExpensiveChild({ data }) {
  return <div>{/* Heavy rendering */}</div>
})

// Memo computed values
function ParentComponent({ items }) {
  const sortedItems = useMemo(() => {
    return items.sort((a, b) => a.name.localeCompare(b.name))
  }, [items])
  
  const handleClick = useCallback((id) => {
    console.log('Clicked:', id)
  }, [])
  
  return <ExpensiveChild data={sortedItems} onClick={handleClick} />
}
```

### 2. Virtualization (Large Lists)

```tsx
'use client'

import { FixedSizeList } from 'react-window'

export function VirtualizedList({ items }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          {items[index].name}
        </div>
      )}
    </FixedSizeList>
  )
}
```

---

## Database Query Optimization

```typescript
// ❌ Bad: N+1 query
const users = await prisma.user.findMany()
for (const user of users) {
  const posts = await prisma.post.findMany({ where: { authorId: user.id } })
  console.log(user.name, posts.length)
}

// ✅ Good: Single query with include
const users = await prisma.user.findMany({
  include: {
    _count: {
      select: { posts: true }
    }
  }
})
users.forEach(user => console.log(user.name, user._count.posts))

// Add database indexes
// prisma/schema.prisma
model Post {
  id       String @id
  authorId String
  
  @@index([authorId])  // Index for frequent queries
  @@index([published, createdAt]) // Composite index
}
```

---

## Lazy Loading

### Route-Based

```tsx
// app/dashboard/page.tsx
import dynamic from 'next/dynamic'

const Analytics = dynamic(() => import('@/components/Analytics'))
const Reports = dynamic(() => import('@/components/Reports'))

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Analytics />
      <Reports />
    </div>
  )
}
```

### On-Demand

```tsx
'use client'

import { useState } from 'react'

export function HeavyFeatureButton() {
  const [Component, setComponent] = useState(null)
  
  async function loadComponent() {
    const mod = await import('./HeavyFeature')
    setComponent(() => mod.default)
  }
  
  return (
    <div>
      {!Component && (
        <button onClick={loadComponent}>Load Feature</button>
      )}
      {Component && <Component />}
    </div>
  )
}
```

---

## Prefetching

```tsx
import Link from 'next/link'

// Automatic prefetch on hover
<Link href="/dashboard" prefetch>
  Dashboard
</Link>

// Manual prefetch
'use client'

import { useRouter } from 'next/navigation'

export function PrefetchButton() {
  const router = useRouter()
  
  return (
    <button
      onMouseEnter={() => router.prefetch('/dashboard')}
      onClick={() => router.push('/dashboard')}
    >
      Go to Dashboard
    </button>
  )
}
```

---

## Monitoring Performance

```typescript
// Monitor client-side performance
'use client'

import { useEffect } from 'react'

export function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log(entry.name, entry.value)
        
        // Send to analytics
        if (entry.name === 'LCP') {
          analytics.track('LCP', { value: entry.value })
        }
      }
    })
    
    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
    
    return () => observer.disconnect()
  }, [])
  
  return null
}
```

---

## Common Pitfalls

❌ **Not measuring**: Always measure before optimizing
❌ **Premature optimization**: Optimize based on data, not assumptions
❌ **Ignoring mobile**: Test on real mobile devices
❌ **Large dependencies**: Check bundle size before adding libraries
❌ **No lazy loading**: Defer heavy components

---

## Related Skills

- [React & Next.js Development](#)
- [Database Design & Management](#)
- [Deployment & DevOps](#)
