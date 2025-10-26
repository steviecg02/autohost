# UI Shell & Layout Implementation

**Status**: Not Started
**Priority**: P1 (Before building visualizations)
**Goal**: Build navigation structure and page layout before adding real content

---

## What to Build

### 1. Main Layout Component

**Location**: `components/layout/MainLayout.tsx` or `app/layout.tsx`

**Components**:

- Header/top nav (logo, user menu, notifications)
- Sidebar navigation (collapsible on mobile)
- Main content area (where pages render)
- Footer (optional)

**Responsive Behavior**:

- Desktop: Sidebar always visible
- Mobile: Sidebar collapses to hamburger menu
- Tailwind breakpoints: `md:` for desktop, default for mobile

---

### 2. Navigation Structure

**Sidebar Links** (to be defined based on actual needs):

```
Dashboard
├── Overview / Home
├── Listings
├── Reservations
├── Performance / Metrics
├── Calendar
├── Messages (future)
├── Settings
└── Logout
```

**Routes to Create** (empty placeholders for now):

- `/dashboard` - Main dashboard
- `/listings` - Airbnb listings view
- `/reservations` - Reservations view
- `/metrics` - Performance metrics
- `/calendar` - Calendar view
- `/settings` - User settings

---

### 3. Empty Page Components

Create placeholder pages that use the layout:

**Example**: `app/listings/page.tsx`

```tsx
export default function ListingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Listings</h1>
      <p className="mt-2 text-gray-600">Coming soon...</p>
    </div>
  );
}
```

Do this for all routes so navigation works.

---

## Implementation Options

### Option 1: Use a Template (Faster)

**Sources**:

- Tailwind UI (paid, but high quality)
- shadcn/ui examples (free)
- Headless UI examples (free)

**Pros**:

- 1-2 hours of work
- Production-ready components
- Responsive out of the box

**Cons**:

- May need customization
- License restrictions (check if using paid templates)

### Option 2: Build from Scratch (More Control)

**Components to Build**:

- Header component
- Sidebar component
- Mobile menu component
- Page wrapper component

**Pros**:

- Full control
- Exactly what you need
- No license issues

**Cons**:

- 2-4 hours of work
- Need to handle responsive behavior manually

---

## Design Decisions Needed

Before building, decide:

1. **What pages do you need?**
   - Dashboard, Listings, Reservations, Metrics, Calendar, Settings?
   - What else?

2. **What goes in the header?**
   - Logo
   - User profile/avatar
   - Notifications icon
   - Search bar?

3. **What goes in the sidebar?**
   - Just navigation links?
   - Filters or quick actions?
   - Org switcher (for multi-org future)?

4. **Mobile behavior**:
   - Hamburger menu that slides in?
   - Bottom tab bar (mobile app style)?
   - Full-screen menu overlay?

---

## Recommended Approach

**Step 1**: Define Navigation Structure

- List all pages you'll need
- Decide route paths
- Decide what goes in sidebar vs. header

**Step 2**: Pick Layout Approach

- Use template OR build minimal yourself
- Get header + sidebar working

**Step 3**: Create Empty Pages

- One component per route
- All use same layout
- Just placeholder text for now

**Step 4**: Test Navigation

- Click through all links
- Test on mobile (Chrome DevTools responsive mode)
- Make sure layout doesn't break

**Step 5**: Start Building First Visualization

- Pick one page (probably `/metrics` for Airbnb data)
- Replace placeholder with real content
- Fill in other pages as needed

---

## When to Start

**After**: Phase 1 authentication is working (Google OAuth + JWT)

**Before**: Building any visualizations or real content

**Why**: You need to know where to put things. Building visualizations without a layout means you'll have to refactor them later when you add navigation.

---

## Reference

For layout examples and patterns:

- Tailwind UI: https://tailwindui.com/components/application-ui/application-shells
- shadcn/ui: https://ui.shadcn.com/examples/dashboard
- Radix UI: https://www.radix-ui.com/primitives (primitives you're already using)

---

## Next Steps

1. **Define pages/routes** - What do you actually need?
2. **Pick layout approach** - Template or custom?
3. **Build the shell** - Header, sidebar, empty pages
4. **Test navigation** - Make sure it all works
5. **Start filling in content** - Begin with highest priority visualization
