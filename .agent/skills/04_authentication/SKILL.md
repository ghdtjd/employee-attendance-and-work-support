---
name: Authentication & Authorization
description: Implement secure user authentication, session management, and role-based access control using modern patterns
---

# Authentication & Authorization Skill

Comprehensive guide for implementing secure authentication and authorization in web applications.

## When to Use This Skill

- Adding user login/signup
- Protecting API routes
- Implementing role-based access
- Managing user sessions
- Handling OAuth providers

---

## Authentication Strategies

| Strategy | Use Case | Pros | Cons |
|----------|----------|------|------|
| JWT | Stateless APIs, microservices | Scalable, no server storage | Can't invalidate easily |
| Session Cookies | Traditional web apps | Easy to invalidate | Requires server storage |
| OAuth 2.0 | Social login (Google, GitHub) | No password management | Dependencies on providers |

---

## NextAuth.js Setup (Recommended)

### 1. Installation

```bash
npm install next-auth @next-auth/prisma-adapter
```

### 2. API Route Configuration

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Email/Password
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        
        if (!user || !user.passwordHash) {
          throw new Error('Invalid credentials')
        }
        
        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )
        
        if (!isValid) {
          throw new Error('Invalid credentials')
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    }),
    
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error'
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

### 3. Prisma Schema

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  passwordHash  String?
  role          Role      @default(USER)
  accounts      Account[]
  sessions      Session[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum Role {
  USER
  ADMIN
  MODERATOR
}
```

---

## Authentication in Components

### Server Components

```tsx
// app/dashboard/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }
  
  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
      <p>Email: {session.user.email}</p>
      <p>Role: {session.user.role}</p>
    </div>
  )
}
```

### Client Components

```tsx
'use client'

import { useSession, signIn, signOut } from 'next-auth/react'

export function UserButton() {
  const { data: session, status } = useSession()
  
  if (status === 'loading') {
    return <div>Loading...</div>
  }
  
  if (!session) {
    return <button onClick={() => signIn()}>Sign In</button>
  }
  
  return (
    <div>
      <p>Signed in as {session.user.email}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  )
}
```

### Session Provider

```tsx
// app/layout.tsx
import { SessionProvider } from 'next-auth/react'

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
```

---

## Protecting API Routes

```typescript
// app/api/protected/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  // Access session.user.id, session.user.role, etc.
  return NextResponse.json({
    message: 'Protected data',
    user: session.user
  })
}
```

---

## Role-Based Access Control (RBAC)

### Middleware Protection

```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const path = req.nextUrl.pathname
      
      // Admin-only routes
      if (path.startsWith('/admin')) {
        return token?.role === 'ADMIN'
      }
      
      // Moderator or Admin
      if (path.startsWith('/moderate')) {
        return ['ADMIN', 'MODERATOR'].includes(token?.role as string)
      }
      
      // Any authenticated user
      return !!token
    }
  }
})

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/moderate/:path*']
}
```

### Permission Helper

```typescript
// lib/permissions.ts
export const permissions = {
  USER: ['read:own', 'write:own'],
  MODERATOR: ['read:own', 'write:own', 'read:all', 'delete:reported'],
  ADMIN: ['read:own', 'write:own', 'read:all', 'write:all', 'delete:all']
}

export function hasPermission(role: string, permission: string): boolean {
  return permissions[role]?.includes(permission) || false
}

// Usage in API
export async function DELETE(request: NextRequest, { params }: Props) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  if (!hasPermission(session.user.role, 'delete:all')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  // Proceed with deletion
  await prisma.post.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
```

---

## Login/Signup Forms

### Signup Form

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    })
    
    if (!res.ok) {
      const data = await res.json()
      setError(data.error)
      return
    }
    
    // Auto-sign in after signup
    const { signIn } = await import('next-auth/react')
    await signIn('credentials', { email, password, redirect: false })
    
    router.push('/dashboard')
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit">Sign Up</button>
    </form>
  )
}
```

### Signup API Route

```typescript
// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()
    
    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }
    
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }
    
    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash
      }
    })
    
    return NextResponse.json(
      { success: true, userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
```

---

## Password Reset Flow

### Request Reset

```tsx
// app/forgot-password/page.tsx
'use client'

import { useState } from 'react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    
    // Always show success (security: don't reveal if email exists)
    setSent(true)
  }
  
  if (sent) {
    return <p>If that email exists, we sent a reset link.</p>
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Your email"
        required
      />
      <button type="submit">Send Reset Link</button>
    </form>
  )
}
```

---

## Common Pitfalls

❌ **Storing passwords in plain text**: Always hash passwords with bcrypt
❌ **Not validating tokens**: Always verify JWT signatures
❌ **Weak session expiry**: Set reasonable session timeouts
❌ **No rate limiting**: Protect login endpoints from brute force
❌ **Exposing user enumeration**: Don't reveal if email exists

---

## Related Skills

- [API Development & Integration](#) - For auth API endpoints
- [Database Design & Management](#) - For user schema
- [Testing & Quality Assurance](#) - For security testing
- [Error Handling & Debugging](#) - For auth error handling
