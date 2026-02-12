---
name: Testing & Quality Assurance
description: Implement comprehensive testing strategies including unit, integration, and E2E tests for web applications
---

# Testing & Quality Assurance Skill

Build confidence in your code through comprehensive testing strategies.

## When to Use This Skill

- Writing new features
- Refactoring existing code
- Setting up CI/CD pipelines
- Debugging production issues
- Ensuring code quality

---

## Testing Pyramid

```
        /\
       /E2E\        (Few, slow, expensive)
      /------\
     /Integration\ (Some, medium speed)
    /------------\
   /  Unit Tests  \ (Many, fast, cheap)
  /----------------\
```

---

## Unit Testing (Vitest)

### Setup

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom happy-dom
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
  },
})

// vitest.setup.ts
import '@testing-library/jest-dom'
```

### Component Testing

```typescript
// components/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../Button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
  
  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    
    await userEvent.click(screen.getByText('Click'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
  
  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### API Testing

```typescript
// lib/__tests__/api-client.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { apiClient } from '../api-client'

global.fetch = vi.fn()

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('makes GET request', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: 'test' })
    })
    
    const result = await apiClient.get('/users')
    
    expect(fetch).toHaveBeenCalledWith('/api/users', {
      method: 'GET',
      headers: expect.any(Headers)
    })
    expect(result).toEqual({ data: 'test' })
  })
  
  it('throws on error', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Not found' })
    })
    
    await expect(apiClient.get('/users')).rejects.toThrow('Not found')
  })
})
```

---

## Integration Testing (Playwright)

### Setup

```bash
npm install -D @playwright/test
npx playwright install
```

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### E2E Tests

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('user can sign up', async ({ page }) => {
    await page.goto('/signup')
    
    await page.fill('[name="name"]', 'Test User')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('text=Welcome, Test User')).toBeVisible()
  })
  
  test('user can login', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('[name="email"]', 'existing@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL('/dashboard')
  })
  
  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('[name="email"]', 'wrong@example.com')
    await page.fill('[name="password"]', 'wrongpass')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Invalid credentials')).toBeVisible()
  })
})
```

---

## Test-Driven Development (TDD)

### Red-Green-Refactor

```typescript
// 1. RED: Write failing test first
describe('sum', () => {
  it('adds two numbers', () => {
    expect(sum(2, 3)).toBe(5)
  })
})

// 2. GREEN: Write minimal code to pass
function sum(a: number, b: number) {
  return a + b
}

// 3. REFACTOR: Improve code quality
function sum(...numbers: number[]): number {
  return numbers.reduce((acc, num) => acc + num, 0)
}
```

---

## Mocking

```typescript
// Mock API calls
vi.mock('../lib/api', () => ({
  fetchUser: vi.fn()
}))

import { fetchUser } from '../lib/api'

test('displays user data', async () => {
  fetchUser.mockResolvedValue({ name: 'John', email: 'john@example.com' })
  
  render(<UserProfile userId="123" />)
  
  await waitFor(() => {
    expect(screen.getByText('John')).toBeInTheDocument()
  })
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}))
```

---

## Code Coverage

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  }
}
```

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['**/*.test.{ts,tsx}', '**/__tests__/**'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    }
  }
})
```

---

## CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm test
      
      - name: Run E2E tests
        run: npx playwright test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## Common Pitfalls

❌ **Testing implementation details**: Test behavior, not internals
❌ **No test isolation**: Each test should be independent
❌ **Slow tests**: Keep unit tests fast (<100ms each)
❌ **Low coverage**: Aim for 80%+ code coverage
❌ **Flaky tests**: Fix non-deterministic tests immediately

---

## Related Skills

- [React & Next.js Development](#)
- [API Development & Integration](#)
- [Deployment & DevOps](#)
