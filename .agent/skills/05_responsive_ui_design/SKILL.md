---
name: Responsive UI/UX Design
description: Create modern, accessible, mobile-first user interfaces using CSS, Tailwind, and responsive design principles
---

# Responsive UI/UX Design Skill

Build beautiful, accessible, and responsive user interfaces following modern design standards.

## When to Use This Skill

- Creating responsive layouts
- Implementing accessibility features
- Designing mobile-first interfaces
- Building component libraries
- Optimizing for different screen sizes

---

## Mobile-First Design

### Breakpoint System (Tailwind)

```tsx
// Start with mobile, then scale up
export function ResponsiveGrid() {
  return (
    <div className="
      grid grid-cols-1          // Mobile: 1 column
      sm:grid-cols-2            // Small: 2 columns (640px+)
      md:grid-cols-3            // Medium: 3 columns (768px+)
      lg:grid-cols-4            // Large: 4 columns (1024px+)
      xl:grid-cols-6            // XL: 6 columns (1280px+)
      gap-4                     // Consistent gap
    ">
      {items.map(item => (
        <Card key={item.id} {...item} />
      ))}
    </div>
  )
}
```

### Custom Breakpoints

```typescript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    }
  }
}
```

---

## Accessibility (a11y)

### Semantic HTML

```tsx
// ✅ Good: Semantic structure
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

<main>
  <article>
    <header>
      <h1>Article Title</h1>
      <time dateTime="2024-02-10">February 10, 2024</time>
    </header>
    <section>
      <h2>Section Title</h2>
      <p>Content...</p>
    </section>
  </article>
</main>

// ❌ Bad: Generic divs everywhere
<div className="nav">
  <div className="title">Title</div>
  <div className="content">Content</div>
</div>
```

### ARIA Labels

```tsx
// Icon buttons need labels
<button aria-label="Close modal" onClick={onClose}>
  <XIcon />
</button>

// Form fields
<label htmlFor="email">Email</label>
<input
  id="email"
  type="email"
  aria-describedby="email-hint"
  aria-required="true"
/>
<span id="email-hint">We'll never share your email</span>

// Loading states
<div role="status" aria-live="polite">
  {isLoading ? 'Loading...' : 'Content loaded'}
</div>
```

### Keyboard Navigation

```tsx
'use client'

export function Modal({ isOpen, onClose, children }) {
  useEffect(() => {
    if (!isOpen) return
    
    // Trap focus inside modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])
  
  if (!isOpen) return null
  
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
    >
      <div className="bg-white p-6 rounded-lg">
        {children}
        <button onClick={onClose} autoFocus>
          Close
        </button>
      </div>
    </div>
  )
}
```

---

## Component Patterns

### Card Component

```tsx
// components/ui/card.tsx
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }) {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
}

export function CardTitle({ className, ...props }) {
  return (
    <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  )
}
```

### Button Variants

```tsx
import { cva } from 'class-variance-authority'

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export function Button({ className, variant, size, ...props }) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
```

---

## Dark Mode

```tsx
// app/providers.tsx
'use client'

import { ThemeProvider } from 'next-themes'

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  )
}

// components/theme-toggle.tsx
'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => setMounted(true), [])
  
  if (!mounted) return null
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? '🌞' : '🌙'}
    </button>
  )
}

// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
      }
    }
  }
}

// globals.css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
  }
  
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }
}
```

---

## Animation

```tsx
// Tailwind transitions
<button className="
  transform transition-all duration-200
  hover:scale-105 hover:shadow-lg
  active:scale-95
">
  Click me
</button>

// Framer Motion
'use client'

import { motion } from 'framer-motion'

export function FadeIn({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  )
}

// List animation
export function AnimatedList({ items }) {
  return (
    <motion.ul>
      {items.map((item, i) => (
        <motion.li
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          {item.name}
        </motion.li>
      ))}
    </motion.ul>
  )
}
```

---

## Loading States

```tsx
// Skeleton loader
export function SkeletonCard() {
  return (
    <div className="border rounded-lg p-6 space-y-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  )
}

// Suspense boundaries
import { Suspense } from 'react'

export default function Page() {
  return (
    <div>
      <Header />
      <Suspense fallback={<SkeletonCard />}>
        <AsyncContent />
      </Suspense>
    </div>
  )
}
```

---

## Common Pitfalls

❌ **Not testing on real devices**: Emulators don't catch all issues
❌ **Ignoring accessibility**: Use semantic HTML and ARIA labels
❌ **Fixed widths**: Use responsive units (%, rem, vw)
❌ **No focus indicators**: Always show focus for keyboard users
❌ **Color-only information**: Use icons/text alongside colors

---

## Related Skills

- [React & Next.js Development](#)
- [Performance Optimization](#)
- [Testing & Quality Assurance](#)
