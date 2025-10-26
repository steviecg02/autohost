# AI Session Context

## Start Here

1. Read [README.md](README.md) for project overview
2. Read [docs/product/](docs/product/) to understand the platform:
   - **PRODUCT_STORY.md** - Why this exists, market opportunity
   - **SYSTEM_ARCHITECTURE.md** - Technical architecture
   - **MY_STORY.md** - Founder context

## Current State

**Foundation complete!** TypeScript enforcement + auth feature built.

- ✅ Complete linting/formatting pipeline + pre-commit hooks
- ✅ GitHub Actions CI/CD
- ✅ Login/Signup modals with validation
- ✅ 22/22 tests passing
- ✅ Mobile-responsive web design

**Next:** Build out feature pages following the structure below.

## Repository Structure

When building new pages/features, follow this structure:

```
app/                              # Pages & routing (Next.js App Router)
├── [route]/page.tsx              # Create page at /[route]
├── [route]/layout.tsx            # Optional: custom layout for section
└── [route]/[dynamic]/page.tsx    # Dynamic routes like /org/departments/[id]

components/                       # Reusable React components
├── [feature]/                    # Feature-specific components (e.g., components/org/)
├── ui/                          # Generic primitives (Button, Card, Input, etc.)
└── layout/                      # Layout components (Header, Sidebar, MobileNav)

lib/                             # Utilities & business logic
├── api.ts                       # API client
└── validation.ts                # Validation functions

hooks/                           # Custom React hooks
├── useAuth.ts
└── use[Feature].ts              # Feature-specific hooks

types/                           # TypeScript type definitions
├── auth.ts                      # Already exists
└── [feature].ts                 # Create per feature (e.g., types/org.ts)

[feature].test.tsx               # Tests live next to components
```

**When asked to build a page:**

1. Create folder in `app/` matching the route
2. Add `page.tsx` for the page component
3. Create components in `components/[feature]/`
4. Add types in `types/[feature].ts`
5. Write tests alongside components
6. Follow UI-first approach with dummy data

## Key Principles

1. **You can't automate chaos, but you can automate structure**
   - Org Service forces clarity first
   - Users define their business structure
   - Automation and AI follow that structure

2. **AI agents ARE the departments**
   - Not employees, but entire departments
   - Embedded expertise from $10k+ worth of courses
   - Revenue Intelligence, Marketing Intelligence, Guest Intelligence, Operations Intelligence

3. **Data consolidation enables everything**
   - All data flows into Data Consolidation Engine
   - Single source of truth makes intelligent decisions possible

4. **Everything is flexible**
   - No prescribed org structure
   - No pre-defined dashboards
   - Build UI that adapts to user-defined business structure

## Development Approach

- **Ask before implementing** - Don't assume what to build
- **UI-first with dummy data** - Build components, define data contracts, backend implements
- **TypeScript everywhere** - Strict mode, complete types
- **Progressive enhancement** - Build partial features, add real data incrementally

## Available Resources

**docs/competitive-analysis/**

- Analysis of competitor tools (RankBreeze, IntelliHost)
- User will provide access when relevant (e.g., when building visualizations)

## Remember

This isn't about replacing tools. It's about **replacing the need for operational staff entirely** while embedding expertise that would cost $10k+ in courses and consultants.

The goal: Businesses that truly run themselves.
