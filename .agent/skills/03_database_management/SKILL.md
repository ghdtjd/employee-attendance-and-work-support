---
name: Database Design & Management
description: Design efficient database schemas, write optimized queries, and manage migrations for SQL and NoSQL databases
---

# Database Design & Management Skill

Complete guide for database design, optimization, and management in web applications.

## When to Use This Skill

- Designing new database schemas
- Optimizing slow queries
- Creating database migrations
- Choosing between SQL and NoSQL
- Implementing database indexing

---

## Database Selection

| Use Case | Best Choice | Examples |
|----------|-------------|----------|
| Structured data, ACID | SQL | PostgreSQL, MySQL |
| Document storage | NoSQL Document | MongoDB, Firestore |
| Key-value cache | NoSQL Key-Value | Redis, Memcached |
| Graph relationships | NoSQL Graph | Neo4j |
| Time-series data | Specialized | TimescaleDB, InfluxDB |

---

## Schema Design (Prisma + PostgreSQL)

### 1. Project Setup

```bash
npm install prisma @prisma/client
npx prisma init
```

### 2. Schema Definition

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  passwordHash  String
  role          Role      @default(USER)
  posts         Post[]
  comments      Comment[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([email])
}

model Post {
  id          String    @id @default(cuid())
  title       String
  content     String    @db.Text
  published   Boolean   @default(false)
  authorId    String
  author      User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments    Comment[]
  tags        Tag[]     @relation("PostTags")
  viewCount   Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([authorId])
  @@index([published, createdAt])
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  postId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  
  @@index([postId])
  @@index([authorId])
}

model Tag {
  id    String @id @default(cuid())
  name  String @unique
  posts Post[] @relation("PostTags")
}

enum Role {
  USER
  ADMIN
  MODERATOR
}
```

### 3. Normalization Principles

**1NF (First Normal Form)**
- ✅ Each column contains atomic values
- ✅ No repeating groups

**2NF (Second Normal Form)**
- ✅ Meets 1NF
- ✅ No partial dependencies

**3NF (Third Normal Form)**
- ✅ Meets 2NF
- ✅ No transitive dependencies

**Example: Denormalization for Performance**

```prisma
model Post {
  id            String   @id @default(cuid())
  title         String
  authorId      String
  author        User     @relation(fields: [authorId], references: [id])
  
  // Denormalized for performance (cache author name)
  authorName    String
  
  viewCount     Int      @default(0)
  commentCount  Int      @default(0) // Denormalized count
}
```

Use sparingly when read performance outweighs update complexity.

---

## Migrations

### Create Migration

```bash
# Generate migration
npx prisma migrate dev --name add_user_preferences

# Apply to production
npx prisma migrate deploy
```

### Migration Best Practices

✅ **Test migrations locally first**
✅ **Always implement rollback strategy**
✅ **Backup before production migrations**
✅ **Use transactions for multiple changes**
✅ **Add indexes for foreign keys**

### Example Migration

```sql
-- 001_add_user_preferences.sql
BEGIN;

-- Add new table
CREATE TABLE user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'light',
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

COMMIT;
```

---

## Querying with Prisma

### Basic Queries

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Find all
const users = await prisma.user.findMany()

// Find one
const user = await prisma.user.findUnique({
  where: { id: '123' }
})

// Find with relations
const userWithPosts = await prisma.user.findUnique({
  where: { id: '123' },
  include: { posts: true }
})

// Create
const newUser = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    passwordHash: hashedPassword
  }
})

// Update
const updated = await prisma.user.update({
  where: { id: '123' },
  data: { name: 'Jane Doe' }
})

// Delete
await prisma.user.delete({
  where: { id: '123' }
})
```

### Advanced Queries

```typescript
// Pagination
const posts = await prisma.post.findMany({
  skip: 20,
  take: 10,
  orderBy: { createdAt: 'desc' }
})

// Filtering
const publishedPosts = await prisma.post.findMany({
  where: {
    published: true,
    author: {
      role: 'ADMIN'
    }
  }
})

// Searching
const results = await prisma.post.findMany({
  where: {
    OR: [
      { title: { contains: 'search', mode: 'insensitive' } },
      { content: { contains: 'search', mode: 'insensitive' } }
    ]
  }
})

// Aggregation
const stats = await prisma.post.aggregate({
  _count: true,
  _avg: { viewCount: true },
  _sum: { viewCount: true }
})

// Group by
const postsByAuthor = await prisma.post.groupBy({
  by: ['authorId'],
  _count: true,
  orderBy: {
    _count: { id: 'desc' }
  }
})
```

---

## Indexing Strategies

### When to Add Indexes

✅ Foreign keys (always)
✅ Columns used in WHERE clauses
✅ Columns used in ORDER BY
✅ Columns used in JOINs

### Index Types

```prisma
model Post {
  id    String @id @default(cuid())
  title String
  slug  String @unique          // Unique index
  views Int
  
  @@index([title])              // Single column
  @@index([published, createdAt]) // Composite
  @@index([title(ops: raw("gin_trgm_ops"))]) // Full-text (PostgreSQL)
}
```

### Monitoring Query Performance

```sql
-- PostgreSQL: Explain query
EXPLAIN ANALYZE
SELECT * FROM posts WHERE published = true ORDER BY created_at DESC LIMIT 10;

-- Check missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY abs(correlation) DESC;
```

---

## Transaction Handling

```typescript
// Prisma transactions
const result = await prisma.$transaction(async (tx) => {
  // Deduct from sender
  const sender = await tx.account.update({
    where: { id: senderId },
    data: { balance: { decrement: amount } }
  })
  
  if (sender.balance < 0) {
    throw new Error('Insufficient funds')
  }
  
  // Add to receiver
  const receiver = await tx.account.update({
    where: { id: receiverId },
    data: { balance: { increment: amount } }
  })
  
  // Create transaction record
  const transaction = await tx.transaction.create({
    data: {
      senderId,
      receiverId,
      amount,
      status: 'COMPLETED'
    }
  })
  
  return { sender, receiver, transaction }
})
```

---

## Caching Strategies

### 1. Application-Level Cache (Redis)

```typescript
import { Redis } from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

async function getCachedUser(userId: string) {
  // Check cache first
  const cached = await redis.get(`user:${userId}`)
  if (cached) return JSON.parse(cached)
  
  // Fetch from database
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { posts: true }
  })
  
  // Cache for 5 minutes
  await redis.set(`user:${userId}`, JSON.stringify(user), 'EX', 300)
  
  return user
}

// Invalidate cache on update
async function updateUser(userId: string, data: any) {
  const user = await prisma.user.update({
    where: { id: userId },
    data
  })
  
  // Invalidate cache
  await redis.del(`user:${userId}`)
  
  return user
}
```

### 2. Query Result Cache

```typescript
// Cached count (update on mutations)
let cachedUserCount: number | null = null
let cacheExpiry: number = 0

async function getUserCount() {
  if (cachedUserCount && Date.now() < cacheExpiry) {
    return cachedUserCount
  }
  
  const count = await prisma.user.count()
  cachedUserCount = count
  cacheExpiry = Date.now() + 60000 // 1 minute
  
  return count
}
```

---

## Common Pitfalls

❌ **No indexes on foreign keys**: Always index foreign key columns
❌ **N+1 queries**: Use `include` or `select` to prevent multiple queries
❌ **Missing transactions**: Use transactions for multi-step operations
❌ **Exposing database errors**: Catch and sanitize errors before returning
❌ **No connection pooling**: Configure connection limits properly

---

## Related Skills

- [API Development & Integration](#) - For API data layer
- [Performance Optimization](#) - For query optimization
- [Testing & Quality Assurance](#) - For database testing
- [Deployment & DevOps](#) - For production database setup
