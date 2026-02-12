---
name: API Development & Integration
description: Design and implement RESTful APIs with proper authentication, validation, error handling, and documentation
---

# API Development & Integration Skill

Complete guide for building robust, scalable REST APIs following industry best practices.

## When to Use This Skill

- Creating backend APIs
- Integrating third-party APIs
- Implementing API authentication
- Documenting API endpoints
- Handling API errors and validation

---

## API Design Principles

### REST Resource Naming Conventions

```
✅ Good:
GET    /api/users
GET    /api/users/{id}
POST   /api/users
PUT    /api/users/{id}
DELETE /api/users/{id}
GET    /api/users/{id}/posts

❌ Bad:
GET    /api/getUsers
POST   /api/createUser
GET    /api/user-posts/{id}
```

### HTTP Status Codes

| Code | Usage | Example |
|------|-------|---------|
| 200 | Success | GET successful |
| 201 | Created | POST creates resource |
| 204 | No Content | DELETE successful |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Valid token, no permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource |
| 422 | Validation Error | Invalid data format |
| 500 | Server Error | Unexpected error |

---

## Next.js API Routes (App Router)

### Basic Route Handler

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const users = await db.user.findMany()
    
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation
    if (!body.email || !body.name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      )
    }
    
    const user = await db.user.create({ data: body })
    
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    if (error.code === 'P2002') { // Unique constraint
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
```

### Dynamic Routes

```typescript
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'

interface Props {
  params: { id: string }
}

export async function GET(
  request: NextRequest,
  { params }: Props
) {
  const user = await db.user.findUnique({
    where: { id: params.id }
  })
  
  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    )
  }
  
  return NextResponse.json(user)
}

export async function PUT(
  request: NextRequest,
  { params }: Props
) {
  const body = await request.json()
  
  const user = await db.user.update({
    where: { id: params.id },
    data: body
  })
  
  return NextResponse.json(user)
}

export async function DELETE(
  request: NextRequest,
  { params }: Props
) {
  await db.user.delete({
    where: { id: params.id }
  })
  
  return NextResponse.json(null, { status: 204 })
}
```

---

## Request Validation

### Using Zod

```typescript
// lib/schemas.ts
import { z } from 'zod'

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  age: z.number().min(0).max(150).optional(),
  role: z.enum(['user', 'admin']).default('user')
})

export type CreateUserInput = z.infer<typeof createUserSchema>

// app/api/users/route.ts
import { createUserSchema } from '@/lib/schemas'

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // Validate
  const result = createUserSchema.safeParse(body)
  
  if (!result.success) {
    return NextResponse.json(
      { 
        error: 'Validation failed',
        details: result.error.flatten()
      },
      { status: 422 }
    )
  }
  
  const user = await db.user.create({ data: result.data })
  return NextResponse.json(user, { status: 201 })
}
```

---

## Authentication

### JWT Authentication Middleware

```typescript
// lib/auth.ts
import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export function getAuthUser(request: NextRequest): JWTPayload | null {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.substring(7)
  return verifyToken(token)
}

// app/api/protected/route.ts
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = getAuthUser(request)
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  // Access user.userId, user.email, user.role
  return NextResponse.json({ message: 'Protected data', user })
}
```

### Login Endpoint

```typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()
  
  // Find user
  const user = await db.user.findUnique({ where: { email } })
  
  if (!user) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  }
  
  // Verify password
  const isValid = await bcrypt.compare(password, user.passwordHash)
  
  if (!isValid) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  }
  
  // Generate token
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
  
  return NextResponse.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  })
}
```

---

## Error Handling

### Standardized Error Response

```typescript
// lib/api-error.ts
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// lib/error-handler.ts
import { NextResponse } from 'next/server'
import { APIError } from './api-error'
import { ZodError } from 'zod'

export function handleError(error: unknown) {
  console.error('API Error:', error)
  
  // Custom API errors
  if (error instanceof APIError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    )
  }
  
  // Validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', details: error.flatten() },
      { status: 422 }
    )
  }
  
  // Prisma errors
  if (error?.code === 'P2002') {
    return NextResponse.json(
      { error: 'Resource already exists' },
      { status: 409 }
    )
  }
  
  // Default server error
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}

// Usage in route
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.email) {
      throw new APIError('Email is required', 400, 'MISSING_EMAIL')
    }
    
    // ... rest of logic
  } catch (error) {
    return handleError(error)
  }
}
```

---

## Pagination

```typescript
// app/api/posts/route.ts
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const skip = (page - 1) * limit
  
  const [posts, total] = await Promise.all([
    db.post.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    db.post.count()
  ])
  
  return NextResponse.json({
    data: posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  })
}
```

---

## Rate Limiting

```typescript
// lib/rate-limit.ts
import { NextRequest, NextResponse } from 'next/server'

const rateLimit = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(
  request: NextRequest,
  limit: number = 10,
  windowMs: number = 60000 // 1 minute
): NextResponse | null {
  const ip = request.ip || 'unknown'
  const now = Date.now()
  
  const record = rateLimit.get(ip)
  
  if (!record || now > record.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + windowMs })
    return null
  }
  
  if (record.count >= limit) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { 
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((record.resetAt - now) / 1000))
        }
      }
    )
  }
  
  record.count++
  return null
}

// Usage
export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request, 5, 60000)
  if (rateLimitResponse) return rateLimitResponse
  
  // ... rest of handler
}
```

---

## API Client (Frontend)

```typescript
// lib/api-client.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

class APIClient {
  private token: string | null = null
  
  setToken(token: string) {
    this.token = token
  }
  
  clearToken() {
    this.token = null
  }
  
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = new Headers(options.headers)
    
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`)
    }
    
    headers.set('Content-Type', 'application/json')
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'API request failed')
    }
    
    if (response.status === 204) {
      return null as T
    }
    
    return response.json()
  }
  
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }
  
  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
  
  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }
  
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new APIClient()

// Usage
import { apiClient } from '@/lib/api-client'

// Login
const { token, user } = await apiClient.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
})
apiClient.setToken(token)

// Authenticated request
const posts = await apiClient.get('/posts')

// Create
const newPost = await apiClient.post('/posts', { title: 'Hello' })

// Update
const updated = await apiClient.put(`/posts/${id}`, { title: 'Updated' })

// Delete
await apiClient.delete(`/posts/${id}`)
```

---

## API Documentation with OpenAPI

```typescript
// app/api/docs/route.ts
import { NextResponse } from 'next/server'

const openAPISpec = {
  openapi: '3.0.0',
  info: {
    title: 'My API',
    version: '1.0.0',
    description: 'API documentation'
  },
  servers: [
    { url: 'http://localhost:3000/api', description: 'Development' },
    { url: 'https://api.example.com', description: 'Production' }
  ],
  paths: {
    '/users': {
      get: {
        summary: 'List users',
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/User' }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create user',
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateUser' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          name: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      CreateUser: {
        type: 'object',
        required: ['email', 'name'],
        properties: {
          email: { type: 'string', format: 'email' },
          name: { type: 'string', minLength: 2, maxLength: 100 }
        }
      }
    }
  }
}

export async function GET() {
  return NextResponse.json(openAPISpec)
}
```

---

## Common Pitfalls

❌ **Exposing sensitive data**: Never return passwords or internal IDs
❌ **No input validation**: Always validate and sanitize user input
❌ **Generic error messages**: Provide helpful error details (in dev)
❌ **Missing authentication**: Protect endpoints that require auth
❌ **No rate limiting**: Prevent abuse with rate limits

---

## Related Skills

- [Authentication & Authorization](#) - For auth implementation
- [Database Design & Management](#) - For data layer
- [Testing & Quality Assurance](#) - For API testing
- [Error Handling & Debugging](#) - For error management
