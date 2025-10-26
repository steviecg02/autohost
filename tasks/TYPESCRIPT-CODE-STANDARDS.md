# TypeScript/React Code Standards (Quick Reference)

**Purpose:** Production-grade TypeScript/React standards for frontend repositories. This is the TL;DR version.

---

## ✅ Code Quality Checklist (PR Requirements)

Before merging ANY pull request, verify:

- [ ] **TypeScript strict mode** enabled (`"strict": true`)
- [ ] **No `any` types** - use proper types or `unknown`
- [ ] **No `eslint-disable` without explanation**
- [ ] **Tests written** (80% coverage minimum, 90% for business logic)
- [ ] **No console.log** - use proper logging
- [ ] **Components < 200 lines** - break up large components
- [ ] **Functions < 50 lines, complexity < 10**
- [ ] **No hardcoded API URLs or secrets** - use environment variables
- [ ] **Pre-commit hooks pass** (ESLint, Prettier, TypeScript, tests)

---

## 🏗️ Architecture Patterns (Non-Negotiable)

### Component Structure

```
✅ components/          - Reusable UI components
✅ pages/              - Route-level pages (Next.js)
✅ hooks/              - Custom React hooks
✅ services/           - API clients, business logic
✅ utils/              - Pure utility functions
✅ types/              - TypeScript type definitions
✅ contexts/           - React contexts (state management)

❌ NEVER mix API calls with component rendering
❌ NEVER put business logic in components
```

### Component Design

```typescript
// ✅ CORRECT - Separation of concerns
// services/userService.ts
export async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
}

// components/UserProfile.tsx
export function UserProfile({ userId }: { userId: string }) {
  const { data, error } = useSWR(`/api/users/${userId}`, () => fetchUser(userId));
  if (error) return <Error />;
  if (!data) return <Loading />;
  return <div>{data.name}</div>;
}

// ❌ WRONG - API call in component
export function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)  // API logic in component!
      .then(res => res.json())
      .then(setUser);
  }, [userId]);

  return <div>{user?.name}</div>;
}
```

---

## 📝 TypeScript Standards

### Strict Mode (Required)

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### No `any` - Use Proper Types

```typescript
// ❌ NEVER use any
function processData(data: any): any {
  return data.map((item: any) => item.value);
}

// ✅ Use proper types
interface DataItem {
  value: string;
  id: number;
}

function processData(data: DataItem[]): string[] {
  return data.map((item) => item.value);
}

// ✅ Use unknown if type truly unknown
function parseJSON(json: string): unknown {
  return JSON.parse(json);
}

// Then narrow the type
const result = parseJSON(json);
if (isUser(result)) {
  // result is now User
  console.log(result.name);
}
```

### Type Guards

```typescript
// Define type guards for runtime validation
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'email' in obj &&
    typeof obj.email === 'string'
  );
}

// Use with API responses
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  const data: unknown = await response.json();

  if (!isUser(data)) {
    throw new Error('Invalid user data from API');
  }

  return data; // TypeScript knows this is User
}
```

---

## ⚛️ React Best Practices

### Component Patterns

```typescript
// ✅ CORRECT - Functional component with TypeScript
interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
}

export function UserCard({ user, onEdit }: UserCardProps) {
  const handleClick = () => {
    onEdit?.(user);
  };

  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      {onEdit && <button onClick={handleClick}>Edit</button>}
    </div>
  );
}

// ❌ WRONG - Missing types, inline styles, no separation
export function UserCard({ user, onEdit }: any) {
  return (
    <div style={{ padding: '20px', border: '1px solid black' }}>
      <h3>{user.name}</h3>
      <button onClick={() => onEdit(user)}>Edit</button>
    </div>
  );
}
```

### Custom Hooks

```typescript
// ✅ CORRECT - Reusable hook with proper typing
interface UseUserOptions {
  suspense?: boolean;
  revalidateOnFocus?: boolean;
}

export function useUser(userId: string, options?: UseUserOptions) {
  const { data, error, mutate } = useSWR<User>(
    `/api/users/${userId}`,
    () => fetchUser(userId),
    options
  );

  return {
    user: data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate
  };
}

// Usage in component
function UserProfile({ userId }: { userId: string }) {
  const { user, isLoading, isError } = useUser(userId);

  if (isLoading) return <Loading />;
  if (isError) return <Error />;
  return <div>{user.name}</div>;
}
```

### State Management

```typescript
// ✅ CORRECT - Typed context
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Usage
function ProfileButton() {
  const { user, logout } = useAuth();  // Fully typed
  return <button onClick={logout}>{user.name}</button>;
}
```

---

## 🧪 Testing Standards

### Coverage Targets

- **Minimum Overall:** 80%
- **Business Logic:** 90%
- **Test Types:**
  - Unit tests: Components, hooks, utilities
  - Integration tests: API interactions, state management
  - E2E tests: User flows (Playwright/Cypress)

### Component Testing

```typescript
// ✅ CORRECT - Test behaviors, not implementation
import { render, screen, fireEvent } from '@testing-library/react';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  const mockUser: User = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com'
  };

  it('displays user name', () => {
    render(<UserCard user={mockUser} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('calls onEdit when edit button clicked', () => {
    const onEdit = jest.fn();
    render(<UserCard user={mockUser} onEdit={onEdit} />);

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith(mockUser);
  });

  it('hides edit button when onEdit not provided', () => {
    render(<UserCard user={mockUser} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
```

### Hook Testing

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useUser } from './useUser';

describe('useUser', () => {
  it('fetches user data', async () => {
    const { result } = renderHook(() => useUser('123'));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.user).toEqual({
        id: '123',
        name: 'John Doe',
      });
    });

    expect(result.current.isLoading).toBe(false);
  });
});
```

---

## ⚡ Performance Patterns

### Memoization

```typescript
// ✅ Use React.memo for expensive components
export const UserList = React.memo(function UserList({ users }: { users: User[] }) {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
});

// ✅ Use useMemo for expensive calculations
function Dashboard({ data }: { data: DataPoint[] }) {
  const summary = useMemo(() => {
    return calculateExpensiveSummary(data);
  }, [data]);

  return <SummaryView summary={summary} />;
}

// ✅ Use useCallback for stable function references
function UserForm({ onSubmit }: { onSubmit: (user: User) => void }) {
  const handleSubmit = useCallback((event: FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onSubmit({
      name: formData.get('name') as string,
      email: formData.get('email') as string
    });
  }, [onSubmit]);

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Code Splitting

```typescript
// ✅ Lazy load routes/heavy components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Analytics = lazy(() => import('./pages/Analytics'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Suspense>
  );
}
```

---

## 🔐 Security Patterns

### Environment Variables

```typescript
// ✅ CORRECT - Type-safe environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_URL: string;
      NEXT_PUBLIC_AUTH_DOMAIN: string;
      DATABASE_URL: string; // Server-only
    }
  }
}

export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
} as const;

// ❌ NEVER hardcode
const API_URL = 'https://api.production.com'; // Don't do this!
```

### Input Sanitization

```typescript
import DOMPurify from 'dompurify';

// ✅ Sanitize user input before rendering
function UserBio({ bio }: { bio: string }) {
  const sanitized = DOMPurify.sanitize(bio);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}

// ✅ Validate on both client and server
import { z } from 'zod';

const UserSchema = z.object({
  email: z.string().email(),
  age: z.number().min(18).max(120),
  name: z.string().min(1).max(100)
});

function validateUser(data: unknown): User {
  return UserSchema.parse(data);  // Throws if invalid
}
```

### XSS Prevention

```typescript
// ❌ DANGEROUS - XSS vulnerability
function SearchResults({ query }: { query: string }) {
  return <div dangerouslySetInnerHTML={{ __html: query }} />;
}

// ✅ SAFE - React escapes by default
function SearchResults({ query }: { query: string }) {
  return <div>Results for: {query}</div>;
}

// ✅ SAFE - Sanitize if HTML needed
function SearchResults({ query }: { query: string }) {
  const sanitized = DOMPurify.sanitize(query);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

---

## 📊 Logging & Error Tracking

### Structured Logging

```typescript
// ✅ CORRECT - Structured logging (no console.log)
import { logger } from '@/lib/logger';

export async function fetchUser(id: string): Promise<User> {
  try {
    logger.info('Fetching user', { userId: id });
    const user = await apiClient.getUser(id);
    logger.info('User fetched successfully', { userId: id });
    return user;
  } catch (error) {
    logger.error('Failed to fetch user', {
      userId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

// ❌ NEVER use console.log in production code
console.log('User:', user); // Don't do this!
```

### Error Boundaries

```typescript
// ✅ Catch rendering errors
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error }: { error: Error }) {
  logger.error('Component error', { error: error.message });
  return <div>Something went wrong. Please refresh.</div>;
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <YourApp />
    </ErrorBoundary>
  );
}
```

---

## 🎨 Code Style

### Component Organization

```typescript
// ✅ CORRECT - Consistent order
import React, { useState, useEffect } from 'react';  // 1. React imports
import { Button } from '@/components/ui';           // 2. Internal imports
import { formatDate } from '@/utils';               // 3. Utility imports
import type { User } from '@/types';                // 4. Type imports

// 5. Types/Interfaces
interface UserProfileProps {
  user: User;
  onEdit: (user: User) => void;
}

// 6. Component
export function UserProfile({ user, onEdit }: UserProfileProps) {
  // 6a. Hooks
  const [isEditing, setIsEditing] = useState(false);

  // 6b. Derived state
  const displayName = user.name || 'Anonymous';

  // 6c. Event handlers
  const handleEdit = () => {
    setIsEditing(true);
    onEdit(user);
  };

  // 6d. Effects
  useEffect(() => {
    logger.info('User profile viewed', { userId: user.id });
  }, [user.id]);

  // 6e. Render
  return (
    <div>
      <h2>{displayName}</h2>
      <Button onClick={handleEdit}>Edit</Button>
    </div>
  );
}
```

### Naming Conventions

```typescript
// ✅ CORRECT naming
const MAX_RETRIES = 3; // Constants: SCREAMING_SNAKE_CASE
type UserRole = 'admin' | 'user'; // Types: PascalCase
interface ApiResponse {} // Interfaces: PascalCase
function fetchUser() {} // Functions: camelCase
const UserCard = () => {}; // Components: PascalCase
const useUserData = () => {}; // Hooks: camelCase with "use" prefix
const isLoading = false; // Booleans: start with is/has/should

// ❌ WRONG
const maxRetries = 3; // Should be SCREAMING_SNAKE_CASE
interface userResponse {} // Should be PascalCase
function FetchUser() {} // Should be camelCase
const usercard = () => {}; // Should be PascalCase
```

---

## 📏 Code Quality Metrics

- **TypeScript strict mode:** Required
- **`any` types:** 0 (use `unknown` if truly unknown)
- **Component size:** < 200 lines (break into smaller components)
- **Function size:** < 50 lines
- **Cyclomatic complexity:** < 10
- **Test coverage:** 80% overall, 90% business logic
- **Bundle size:** Monitor with `next/bundle-analyzer`

---

## 🔧 Enforcement Tools

See [TYPESCRIPT-ENFORCEMENT.md](TYPESCRIPT-ENFORCEMENT.md) for:

- ESLint configuration
- Prettier configuration
- TypeScript configuration
- Pre-commit hooks
- CI/CD pipeline
- Husky + lint-staged setup

---

## 📚 Detailed Examples

For detailed examples and full setup process, see TypeScript-specific enforcement guide.
