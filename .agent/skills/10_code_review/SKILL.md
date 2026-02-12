---
name: Code Review & Best Practices
description: Conduct thorough code reviews using industry best practices, clean code principles, and systematic checklists
---

# Code Review & Best Practices Skill

Ensure code quality through systematic code reviews and adherence to best practices.

## When to Use This Skill

- Reviewing pull requests
- Establishing coding standards
- Onboarding new developers
- Refactoring legacy code
- Maintaining code quality

---

## Code Review Checklist

### ✅ Functionality

- [ ] Code meets requirements
- [ ] Edge cases are handled
- [ ] Error scenarios are covered
- [ ] No security vulnerabilities
- [ ] Performance is acceptable

### ✅ Code Quality

- [ ] Clear and descriptive naming
- [ ] Functions are single-purpose
- [ ] No code duplication (DRY)
- [ ] Proper abstraction level
- [ ] Comments explain "why", not "what"

### ✅ Testing

- [ ] Unit tests included
- [ ] Tests cover edge cases
- [ ] Tests are maintainable
- [ ] Integration tests where needed

### ✅ Security

- [ ] Input validation present
- [ ] No hardcoded secrets
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] Authentication checked

### ✅ Performance

- [ ] No N+1 queries
- [ ] Efficient algorithms used
- [ ] Appropriate caching
- [ ] No unnecessary re-renders

---

## Clean Code Principles

### 1. Naming Conventions

```typescript
// ❌ Bad: Unclear names
const d = new Date()
const u = await db.user.findFirst()
function calc(a, b) { return a + b }

// ✅ Good: Descriptive names
const createdAt = new Date()
const currentUser = await db.user.findFirst()
function calculateTotalPrice(basePrice, taxRate) {
  return basePrice * (1 + taxRate)
}
```

### 2. Function Size

```typescript
// ❌ Bad: Too long, multiple responsibilities
function processOrder(orderId) {
  // Fetch order (10 lines)
  // Validate inventory (15 lines)
  // Calculate shipping (20 lines)
  // Process payment (25 lines)
  // Send notifications (15 lines)
  // Update database (10 lines)
}

// ✅ Good: Small, focused functions
async function processOrder(orderId: string) {
  const order = await fetchOrder(orderId)
  await validateInventory(order)
  const shipping = calculateShipping(order)
  await processPayment(order, shipping)
  await sendOrderConfirmation(order)
  await updateOrderStatus(orderId, 'completed')
}
```

### 3. DRY (Don't Repeat Yourself)

```typescript
// ❌ Bad: Duplication
async function getUser(id: string) {
  const user = await db.user.findUnique({ where: { id } })
  if (!user) throw new Error('User not found')
  return user
}

async function getPost(id: string) {
  const post = await db.post.findUnique({ where: { id } })
  if (!post) throw new Error('Post not found')
  return post
}

// ✅ Good: Reusable helper
async function findOrFail<T>(
  model: any,
  id: string,
  resourceName: string
): Promise<T> {
  const resource = await model.findUnique({ where: { id } })
  if (!resource) throw new NotFoundError(resourceName)
  return resource
}

const user = await findOrFail(db.user, id, 'User')
const post = await findOrFail(db.post, id, 'Post')
```

### 4. Single Responsibility Principle

```typescript
// ❌ Bad: Multiple responsibilities
class UserService {
  async createUser(data) {
    // Validate
    if (!data.email) throw new Error('Email required')
    
    // Save to database
    const user = await db.user.create({ data })
    
    // Send email
    await sendEmail(user.email, 'Welcome!')
    
    // Log
    console.log('User created:', user.id)
    
    return user
  }
}

// ✅ Good: Separation of concerns
class UserService {
  constructor(
    private userRepo: UserRepository,
    private emailService: EmailService,
    private logger: Logger
  ) {}
  
  async createUser(data: CreateUserInput): Promise<User> {
    const validated = this.validate(data)
    const user = await this.userRepo.create(validated)
    await this.emailService.sendWelcome(user.email)
    this.logger.info('User created', { userId: user.id })
    return user
  }
}
```

---

## Code Review Guidelines

### Providing Feedback

```markdown
**File**: components/UserCard.tsx
**Line**: 42
**Severity**: Minor

**Issue**: Component re-renders unnecessarily when parent updates

**Suggestion**: Wrap component with React.memo to prevent re-renders when props don't change

**Example**:
\`\`\`tsx
export const UserCard = memo(function UserCard({ user }) {
  return <div>{user.name}</div>
})
\`\`\`
```

### Severity Levels

| Level | When to Use |
|-------|-------------|
| **Critical** | Security vulnerabilities, data loss, app crashes |
| **Major** | Performance issues, broken functionality, bad UX |
| **Minor** | Code style, small optimizations, readability |
| **Suggestion** | Nice-to-have improvements, alternative approaches |

---

## TypeScript Best Practices

### 1. Type Safety

```typescript
// ❌ Bad: Using any
function processData(data: any) {
  return data.map((item: any) => item.name)
}

// ✅ Good: Proper types
interface Item {
  id: string
  name: string
}

function processData(data: Item[]): string[] {
  return data.map(item => item.name)
}
```

### 2. Avoid Type Assertions

```typescript
// ❌ Bad: Unsafe assertion
const user = data as User

// ✅ Good: Type guard
function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'email' in data
  )
}

if (isUser(data)) {
  console.log(data.email) // Type-safe
}
```

### 3. Use Discriminated Unions

```typescript
// ✅ Good: Type-safe state handling
type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }

function handleRequest<T>(state: RequestState<T>) {
  switch (state.status) {
    case 'idle':
      return null
    case 'loading':
      return <Spinner />
    case 'success':
      return <Data data={state.data} />
    case 'error':
      return <Error error={state.error} />
  }
}
```

---

## React Best Practices

### 1. Component Structure

```tsx
// Recommended order
export function MyComponent() {
  // 1. Hooks
  const [state, setState] = useState()
  const { data } = useSWR()
  
  // 2. Derived state
  const filteredData = useMemo(() => filter(data), [data])
  
  // 3. Event handlers
  const handleClick = useCallback(() => {
    setState(newValue)
  }, [])
  
  // 4. Effects
  useEffect(() => {
    // Side effects
  }, [])
  
  // 5. Early returns
  if (!data) return <Loading />
  
  // 6. Render
  return (
    <div onClick={handleClick}>
      {filteredData.map(item => (
        <Item key={item.id} {...item} />
      ))}
    </div>
  )
}
```

### 2. Props Destructuring

```tsx
// ❌ Bad
export function UserCard(props) {
  return <div>{props.user.name}</div>
}

// ✅ Good
interface UserCardProps {
  user: User
  onEdit?: () => void
}

export function UserCard({ user, onEdit }: UserCardProps) {
  return (
    <div>
      {user.name}
      {onEdit && <button onClick={onEdit}>Edit</button>}
    </div>
  )
}
```

---

## Git Best Practices

### Commit Messages

```bash
# ❌ Bad
git commit -m "fix"
git commit -m "update code"
git commit -m "changes"

# ✅ Good
git commit -m "fix: resolve login redirect loop"
git commit -m "feat: add user profile page"
git commit -m "refactor: extract payment logic to service"
git commit -m "test: add unit tests for UserCard"

# Format: <type>: <description>
# Types: feat, fix, refactor, docs, test, chore, style
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings

## Screenshots (if applicable)
[Add screenshots]
```

---

## Performance Review

```typescript
// Check for common issues

// ❌ Avoid: Large bundle imports
import _ from 'lodash'

// ✅ Use: Specific imports
import { debounce } from 'lodash-es'

// ❌ Avoid: Inline object/array creation in render
{items.map(item => <Item style={{ color: 'red' }} />)}

// ✅ Use: Memoized values
const itemStyle = { color: 'red' }
{items.map(item => <Item style={itemStyle} />)}

// ❌ Avoid: N+1 queries
for (const user of users) {
  const posts = await db.post.findMany({ where: { authorId: user.id } })
}

// ✅ Use: Batch queries
const users = await db.user.findMany({ include: { posts: true } })
```

---

## Security Review

```typescript
// ❌ Security issues
const query = `SELECT * FROM users WHERE id = ${userId}` // SQL injection
document.innerHTML = userInput // XSS
const password = '12345' // Hardcoded secret

// ✅ Secure alternatives
const user = await db.user.findUnique({ where: { id: userId } })
element.textContent = userInput
const password = process.env.DB_PASSWORD
```

---

## Documentation Standards

```typescript
/**
 * Calculates the total price including tax and shipping
 * 
 * @param basePrice - The base price before tax
 * @param taxRate - Tax rate as decimal (e.g., 0.1 for 10%)
 * @param shippingCost - Flat shipping cost
 * @returns Total price including all fees
 * 
 * @example
 * ```ts
 * const total = calculateTotal(100, 0.1, 10)
 * // Returns: 120
 * ```
 */
export function calculateTotal(
  basePrice: number,
  taxRate: number,
  shippingCost: number
): number {
  return basePrice * (1 + taxRate) + shippingCost
}
```

---

## Common Pitfalls

❌ **Nitpicking style**: Focus on logic, not formatting (use linters)
❌ **Blocking on minor issues**: Approve with suggestions for minor items
❌ **No testing validation**: Always verify tests pass
❌ **Missing context**: Ask "why" if approach is unclear
❌ **Rubber-stamping**: Actually review, don't just approve

---

## Related Skills

- [React & Next.js Development](#)
- [Testing & Quality Assurance](#)
- [Error Handling & Debugging](#)
