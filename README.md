# HostOS UI

The user interface for an operating system that creates businesses that run themselves.

## What This Is

This is the frontend for an intelligent platform that combines structure, automation, AI agents, data consolidation, and embedded expertise to eliminate the need for operational staff.

Not analytics. Not dashboards. A complete operating system for operationally-intensive businesses.

## Understanding the Platform

Read these documents to understand what you're building:

- **[docs/product/PRODUCT_STORY.md](docs/product/PRODUCT_STORY.md)** - Why this exists, the problem it solves, market opportunity
- **[docs/product/SYSTEM_ARCHITECTURE.md](docs/product/SYSTEM_ARCHITECTURE.md)** - Complete technical architecture and components
- **[docs/product/MY_STORY.md](docs/product/MY_STORY.md)** - Founder's journey and context

## Current State

**Foundation complete!** TypeScript standards enforcement + auth feature implemented.

- ✅ Complete linting & formatting pipeline
- ✅ Pre-commit hooks (auto-format, type-check, lint)
- ✅ GitHub Actions CI/CD workflow
- ✅ Login/Signup modals with validation
- ✅ 22/22 tests passing with >80% coverage
- ✅ Mobile-responsive web design

## Mobile Support

**Current:** Mobile-responsive website

- Works in mobile browsers (Safari, Chrome on phones)
- Responsive layouts using Tailwind's mobile-first breakpoints
- Touch-friendly UI components (44x44px minimum hit targets)
- Adapts to all screen sizes (phone, tablet, desktop)

**Required:** Native mobile app (React Native)

- **Critical need:** Push notifications for operational alerts and approvals
- iOS Safari does NOT support web push notifications (Apple restriction)
- React Native provides reliable push notifications on both iOS and Android
- Separate `hostos-mobile` repository (planned per architecture)
- Shares TypeScript types and business logic with this web app
- Provides native features: push notifications, offline mode, camera access
- Single codebase for both iOS and Android

**Why React Native instead of Swift/Kotlin?**

- Write once in TypeScript, deploy to iOS + Android
- Share code/types with this Next.js web app
- 90-95% code reuse between platforms
- One developer can build both iOS and Android apps
- Faster than maintaining separate Swift (iOS) + Kotlin (Android) codebases

## Tech Stack

**Core:**

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode - all strict flags enabled)
- **Styling**: Tailwind CSS 4
- **Components**: Radix UI primitives
- **State Management**: @tanstack/react-query
- **Icons**: Lucide React

**Quality & Testing:**

- **Testing**: Jest + React Testing Library
- **Linting**: ESLint + TypeScript ESLint
- **Formatting**: Prettier (with Tailwind plugin)
- **Pre-commit**: Husky + lint-staged
- **CI/CD**: GitHub Actions

## Setup

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

## Available Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Auto-fix ESLint issues
pnpm format           # Format all files with Prettier
pnpm format:check     # Check if files are formatted
pnpm type-check       # Run TypeScript compiler

# Testing
pnpm test             # Run all tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage report

# All Checks (runs in CI)
pnpm check            # Run format, lint, type-check, and test:coverage
```

## Development Standards

This project enforces production-grade TypeScript standards:

### Pre-commit Hooks

Every commit automatically runs:

- ✅ Prettier formatting
- ✅ ESLint auto-fix
- ✅ TypeScript type checking
- ✅ Tests for changed files

**Bad code cannot be committed.** The hooks will block commits with errors.

### Code Quality Rules

- **No `any` types** - Use proper types or `unknown`
- **Strict TypeScript** - All strict compiler flags enabled
- **Test coverage** - 80% minimum (90% for business logic)
- **Function size** - Components < 200 lines, functions < 50 lines
- **Complexity** - Cyclomatic complexity < 10

See [tasks/TYPESCRIPT-CODE-STANDARDS.md](tasks/TYPESCRIPT-CODE-STANDARDS.md) for complete standards.

## Repository Structure

This repository follows Next.js App Router conventions:

```
hostos-ui/
├── app/                          # Pages & routing (Next.js App Router)
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page (/)
│   ├── dashboard/                # /dashboard
│   ├── org/                      # /org (Org Service pages)
│   │   ├── departments/          # /org/departments
│   │   └── roles/                # /org/roles
│   ├── automation/               # /automation
│   ├── agents/                   # /agents (AI agents)
│   └── settings/                 # /settings
│
├── components/                   # Reusable React components
│   ├── auth/                     # Auth components
│   ├── ui/                       # Generic UI primitives (Button, Card, etc.)
│   └── layout/                   # Layout components (Header, Sidebar, etc.)
│
├── lib/                          # Utilities & business logic
│   ├── api.ts                    # API client
│   └── validation.ts             # Validation functions
│
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts
│   └── useOrg.ts
│
├── types/                        # TypeScript type definitions
│   ├── auth.ts                   # Auth types
│   └── org.ts                    # Org service types
│
└── tests/                        # Test files live next to components
    └── *.test.tsx
```

**When adding a new page:**

1. Create folder in `app/` matching the route
2. Add `page.tsx` for the page component
3. Add `layout.tsx` if it needs a custom layout
4. Create components in `components/[feature]/`
5. Add types in `types/[feature].ts`
6. Write tests alongside components

## Development Approach

This project uses a UI-first development approach:

1. Build components with dummy data first
2. Define clear TypeScript data contracts
3. Backend implements those contracts (no guessing)
4. Replace dummy data with real API calls incrementally
5. Write tests for all components and business logic

## Architecture Overview

The platform consists of:

- **Org Service** - Business structure (Departments → Roles → Tasks → Steps)
- **Automation Framework** - Event-driven + schedule-driven execution
- **AI Agent System** - Intelligent departments with embedded expertise
- **Data Consolidation Engine** - Single source of truth across integrations
- **Sync Services** - Data pipeline (PMS, OTAs, market data, financial)
- **Notification Service** - Mobile connectivity and approvals
- **Visualization Layer** - Decision intelligence

See [SYSTEM_ARCHITECTURE.md](docs/product/SYSTEM_ARCHITECTURE.md) for complete details.

## Key Principle

**You can't automate chaos, but you can automate structure.**

The platform forces clarity first (Org Service), then enables automation and AI to follow that structure.
