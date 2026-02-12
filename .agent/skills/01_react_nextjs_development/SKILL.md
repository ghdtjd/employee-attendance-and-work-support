---
name: React & Next.js Development
description: Build modern React and Next.js applications with best practices, including App Router, Server Components, and state management patterns
---

# React & Next.js Development Skill

Complete guide for developing modern React and Next.js applications following 2024+ best practices.

## When to Use This Skill

- Creating new React components
- Setting up Next.js projects
- Implementing state management
- Choosing between Server and Client Components
- Optimizing React performance

---

## Prerequisites

- Node.js 18+ installed
- Understanding of JavaScript/TypeScript
- Basic React concepts (components, props, state)

---

## Next.js Project Setup

### 1. Create New Project

```bash
# Using Next.js 14+ with App Router
npx create-next-app@latest my-app

# Configuration options:
# ✅ TypeScript
# ✅ ESLint
# ✅ Tailwind CSS
# ✅ App Router (recommended)
# ✅ Server Actions
```

### 2. Project Structure

```
my-app/
├── app/                    # App Router (Next.js 13+)
│   ├── layout.tsx          # Root layout (Server Component)
│   ├── page.tsx            # Home page
│   ├── api/                # API routes
│   │   └── route.ts
│   └── [dynamic]/          # Dynamic routes
│       └── page.tsx
├── components/             # Reusable components
│   ├── ui/                 # UI components
│   └── features/           # Feature components
├── lib/                    # Utilities
│   ├── utils.ts
│   └── api.ts
├── public/                 # Static assets
└── styles/                 # Global styles
```

---

## Server vs Client Components

### Decision Matrix

| Feature | Server Component ✅ | Client Component 🔵 |
|---------|---------------------|---------------------|
| Data fetching | ✅ Preferred | Use SWR/React Query |
| Event handlers | ❌ | ✅ Required |
| useState/useEffect | ❌ | ✅ Required |
| SEO | ✅ Better | Works with SSR |
| Bundle size | ✅ Zero JS | Adds to bundle |

### Server Component Example

```tsx
// app/posts/page.tsx
import { getPosts } from '@/lib/api'

// This is a Server Component by default
export default async function PostsPage() {
  // Data fetched on server
  const posts = await getPosts()
  
  return (
    <div>
      <h1>Posts</h1>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  )
}
```

### Client Component Example

```tsx
'use client' // Required directive

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  )
}
```

---

## State Management Patterns

### 1. Local State (useState)
Use for component-specific state

```tsx
'use client'

export function SearchBox() {
  const [query, setQuery] = useState('')
  
  return (
    <input
      value={query}
      onChange={e => setQuery(e.target.value)}
    />
  )
}
```

### 2. URL State (useSearchParams)
Use for shareable state

```tsx
'use client'

import { useSearchParams, useRouter } from 'next/navigation'

export function FilterBar() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const filter = searchParams.get('filter') || 'all'
  
  const setFilter = (newFilter: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('filter', newFilter)
    router.push(`?${params.toString()}`)
  }
  
  return (
    <select value={filter} onChange={e => setFilter(e.target.value)}>
      <option value="all">All</option>
      <option value="active">Active</option>
    </select>
  )
}
```

### 3. Global State (Context)
Use for app-wide state

```tsx
// contexts/theme-context.tsx
'use client'

import { createContext, useContext, useState } from 'react'

const ThemeContext = createContext<{
  theme: 'light' | 'dark'
  toggleTheme: () => void
} | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
```

### 4. Server State (React Query / SWR)
Use for API data

```tsx
'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function UserProfile({ userId }: { userId: string }) {
  const { data, error, isLoading } = useSWR(
    `/api/users/${userId}`,
    fetcher
  )
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading user</div>
  
  return <div>{data.name}</div>
}
```

---

## Component Patterns

### 1. Composition Pattern

```tsx
// components/ui/card.tsx
export function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="card-header">{children}</div>
}

export function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="card-body">{children}</div>
}

// Usage
<Card>
  <CardHeader>
    <h2>Title</h2>
  </CardHeader>
  <CardBody>
    <p>Content</p>
  </CardBody>
</Card>
```

### 2. Render Props Pattern

```tsx
interface LoadingWrapperProps<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
  children: (data: T) => React.ReactNode
}

export function LoadingWrapper<T>({
  data,
  isLoading,
  error,
  children
}: LoadingWrapperProps<T>) {
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!data) return null
  
  return <>{children(data)}</>
}

// Usage
<LoadingWrapper data={user} isLoading={loading} error={error}>
  {user => <div>{user.name}</div>}
</LoadingWrapper>
```

### 3. Custom Hooks Pattern

```tsx
// hooks/useLocalStorage.ts
import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : initialValue
  })
  
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])
  
  return [value, setValue] as const
}

// Usage
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light')
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Toggle Theme
    </button>
  )
}
```

---

## Data Fetching Strategies

### 1. Server-Side Rendering (SSR)

```tsx
// app/products/[id]/page.tsx
interface Props {
  params: { id: string }
}

export default async function ProductPage({ params }: Props) {
  // Fetched on every request
  const product = await fetch(`https://api.example.com/products/${params.id}`, {
    cache: 'no-store' // Disable caching
  }).then(r => r.json())
  
  return <div>{product.name}</div>
}
```

### 2. Static Site Generation (SSG)

```tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts').then(r => r.json())
  
  return posts.map((post: any) => ({
    slug: post.slug
  }))
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await fetch(`https://api.example.com/posts/${params.slug}`).then(r => r.json())
  
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  )
}
```

### 3. Incremental Static Regeneration (ISR)

```tsx
// Revalidate every 60 seconds
export const revalidate = 60

export default async function NewsPage() {
  const news = await fetch('https://api.example.com/news').then(r => r.json())
  
  return <div>{/* Display news */}</div>
}
```

---

## Performance Optimization

### 1. Code Splitting

```tsx
import dynamic from 'next/dynamic'

// Lazy load heavy component
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false // Disable SSR for this component
})

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <HeavyChart />
    </div>
  )
}
```

### 2. Image Optimization

```tsx
import Image from 'next/image'

export function ProductImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={600}
      priority // Load immediately
      placeholder="blur" // Show blur while loading
      blurDataURL="data:image/jpeg..." // Low-quality placeholder
    />
  )
}
```

### 3. Memoization

```tsx
'use client'

import { useMemo, useCallback } from 'react'

export function ExpensiveList({ items }: { items: Item[] }) {
  // Memoize expensive calculation
  const sortedItems = useMemo(() => {
    return items.sort((a, b) => a.name.localeCompare(b.name))
  }, [items])
  
  // Memoize callback
  const handleClick = useCallback((id: string) => {
    console.log('Clicked:', id)
  }, [])
  
  return (
    <ul>
      {sortedItems.map(item => (
        <li key={item.id} onClick={() => handleClick(item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  )
}
```

---

## Common Pitfalls

❌ **Using Client Components everywhere**: Default to Server Components, only use Client when needed

❌ **Fetching in useEffect**: Use Server Components or SWR/React Query instead

❌ **Not handling loading states**: Always show loading UI for async operations

❌ **Ignoring TypeScript errors**: Fix all type errors before deploying

❌ **Over-using Context**: Use URL state or props when possible

---

## Related Skills

- [API Development & Integration](#) - For backend API design
- [Testing & Quality Assurance](#) - For testing React components
- [Deployment & DevOps](#) - For deploying Next.js apps
- [Performance Optimization](#) - For advanced optimization techniques

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Patterns.dev](https://patterns.dev) - React patterns
