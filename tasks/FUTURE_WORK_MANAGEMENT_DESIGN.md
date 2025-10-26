# Future Task: Work Management & Automation System Design

**Status**: Not Started - Future Work
**Priority**: P2 (After Phase 1 authentication is working)
**Blocked By**: Need Phase 1 authentication + visualizations working first

---

## Why This Task Exists

We have **two planning documents** with ideas about work management:

1. [docs/planning/architecture-work-management.md](../docs/planning/architecture-work-management.md) - Initial brainstorming
2. Chat output (pasted below) - Additional thinking about tasks/workflows/projects

**Problem**: These are **vague proposals**, not actual requirements. They were created without:

- Real use cases from actual STR operations
- Clear understanding of what Stephen actually needs day-to-day
- Validation that the proposed complexity is necessary
- Integration with existing product vision

**Result**: We're designing in a vacuum. Not helpful.

---

## What Needs to Happen (Future)

### Step 1: Define Real Use Cases (With Stephen)

**Don't start with architecture. Start with problems.**

Sit down and map out actual workflows from your STR business:

**Example questions to answer**:

- What do you currently do manually that you want automated?
- What decisions do you make daily/weekly that could be AI-assisted?
- What repetitive tasks eat up your time?
- What data do you look at to make pricing decisions?
- What triggers you to take action? (new reservation, price drop, review, etc.)
- What approvals do you need in the loop vs. what can run fully automated?

**Output**: 5-10 concrete use cases like:

- "Every Sunday at 6am, I want AI to analyze my listings and recommend price changes. If change < 10%, auto-apply. If > 10%, notify me for approval."
- "When a new reservation comes in, I want to see guest risk score and auto-send welcome email unless flagged high-risk."
- "Weekly on Monday, I want a report showing: occupancy %, revenue vs. forecast, upcoming gaps, competitor price changes."

### Step 2: Design Simplest Solution That Works

**Based on real use cases**, design the minimal system:

**Questions to answer**:

- Do we actually need "tasks" as a concept, or just "scheduled jobs" + "AI recommendations"?
- Do we need "workflows" or just "event handlers" (new reservation → do X, Y, Z)?
- Do we need "projects" at all for Phase 1? (probably not)
- What's the simplest way to handle AI recommendations? (probably just a table: `recommendations(org_id, type, data, status, created_at)`)
- What's the simplest automation? (cron jobs that call AI, create recommendations, send notifications)

**Avoid**:

- Complex workflow orchestration engines (Temporal, Airflow) until you prove you need them
- Separate services for every concept (work-service, agent-service, automation-service) - start in org-service
- Over-engineering "tasks" and "workflows" when simple CRUD + cron might work

### Step 3: Prototype with One Use Case

**Pick the highest value use case** (probably pricing analysis) and build it end-to-end:

1. Background job runs (cron in org-service or sync-airbnb)
2. Calls AI with listing data + market data
3. AI returns recommendation
4. Store recommendation in database
5. UI shows recommendation
6. User approves/rejects
7. On approve, update listing price via sync-airbnb

**This will reveal**:

- Do we actually need tasks/workflows, or is this simple enough?
- Where does AI logic live? (org-service, sync-airbnb, separate service?)
- How do we handle approvals? (API endpoint, UI flow)
- How do we trigger price updates? (API call to sync-airbnb)

### Step 4: Iterate Based on What You Learn

After building one use case, evaluate:

- Was it too simple? Do we need more structure?
- Was it too complex? Can we simplify?
- What patterns emerged that we can generalize?
- What service boundaries make sense now that we've built something real?

**Then decide**: Do we need work-service? Do we need formal "tasks" and "workflows"? Or can we keep it simple?

---

## Existing Documents (For Reference)

When we DO tackle this task, here are the existing docs to reference:

### 1. Architecture Brainstorming

**[docs/planning/architecture-work-management.md](../docs/planning/architecture-work-management.md)**

Contains initial ideas about:

- Tasks system (proposed)
- Workflows system (proposed)
- Projects system (proposed)
- AI agents (proposed as "users with roles")
- Automation system (proposed)
- Service boundary questions

**Status**: Exploratory, NOT finalized, contains some questionable ideas (like AI agents as users)

### 2. Additional Chat Context (From Another Session)

<details>
<summary>Click to expand chat output about work management features</summary>

```
Future Architecture Design - Work Management & Automation System
Status: Architectural Planning Created: October 22, 2025 Purpose: Document planned features for work management, automation, and AI agents to determine service boundaries

Current Scope (P0 - org-service)
org-service handles authentication and organizational identity:

Organizations (tenants - individuals or companies)
Users (people who log in)
Departments (organizational units - marketing, revenue management, operations, etc.)
Roles (positions within departments - manager, analyst, owner, etc.)
org_members (junction table linking users to orgs with their department/role)
JWT generation and validation
Google OAuth integration
Key Design Decision: AI agents are just users with roles (not a separate entity type)

Future Features Needing Architectural Decisions
1. Tasks System
What are tasks?

Individual work items that need to be completed
Can be assigned to humans, AI agents, or automation
Polymorphic in nature:
Manual tasks (human completes)
Automated tasks (system executes)
Analysis tasks (AI generates insights/recommendations)
Decision tasks (require approval/input)
Task Properties:

Belongs to an organization (org_id)
Assigned to a department/role
Can be assigned to specific user (human or AI agent)
Has status (pending, in_progress, completed, failed)
Contains data/context needed to execute
Can be standalone or part of a workflow
Examples:

"Analyze pricing for listing XYZ" (assigned to AI Revenue Manager role)
"Review and approve price change" (assigned to human Revenue Manager)
"Update Airbnb listing price to $150" (assigned to automation)
"Create marketing content for new listing" (assigned to Marketing department)
2. Workflows System
What are workflows?

Sequences of tasks that form a process
Orchestrate multiple steps to accomplish a goal
Can involve multiple departments/roles
Can branch based on task outcomes
Can be triggered by events, schedules, or manually
Workflow Properties:

Belongs to an organization (org_id)
Contains ordered/conditional sequence of tasks
Has state (not started, running, paused, completed, failed)
Can spawn child tasks dynamically
May require approvals at certain steps
Examples:

Example 1: Dynamic Pricing Workflow

Task: Sync latest data from Airbnb (automation)
Task: Analyze market trends and competition (AI agent)
Task: Generate pricing recommendation (AI agent)
Task: Review and approve recommendation (human or auto-approve)
Task: Update listing prices (automation)
Task: Monitor performance (AI agent)
Example 2: New Listing Onboarding Workflow

Task: Import listing details from Airbnb (automation)
Task: Generate property description (AI content writer)
Task: Create photography schedule (assign to Operations)
Task: Review and publish listing (assign to Marketing Manager)
3. Projects System
What are projects?

Collections of workflows and tasks grouped together
Higher-level organizational unit for complex initiatives
May span multiple departments
Have timelines, milestones, dependencies
Project Properties:

Belongs to an organization (org_id)
Contains multiple workflows
Can have subtasks not in workflows
Has timeline (start date, end date, milestones)
Involves multiple team members across departments
Examples:

"Q4 Revenue Optimization Initiative"
Contains: pricing workflows, marketing campaigns, operational improvements
"New Market Expansion - Miami"
Contains: market analysis, property acquisition, listing setup workflows
4. AI Agents
What are AI agents?

Users with roles that can be assigned tasks
Make decisions based on data analysis
Can trigger workflows or complete tasks autonomously
Analyze data from sync services (Airbnb, Hostaway, etc.)
Generate recommendations or execute actions
Key Design: AI agents are roles in org-service, not separate entities

Agent Types (Roles):

AI Revenue Manager (pricing optimization)
AI Marketing Analyst (campaign performance)
AI Content Writer (listing descriptions, emails)
AI Operations Coordinator (scheduling, logistics)
Agent Capabilities:

Get assigned tasks (just like human users)
Access data from sync services via JWT authentication
Analyze data and make decisions
Create new tasks or trigger workflows
Complete tasks autonomously or request human approval
5. Automation System
What is automation?

Scheduled or event-driven task execution
Completes tasks without human intervention
Can be part of workflows or standalone
Responds to triggers (time-based, event-based, data-based)
Automation Types:

Scheduled: Run at specific times (daily sync, weekly reports)
Event-driven: Triggered by external events (new reservation, price change)
Workflow-embedded: Part of a workflow sequence
Conditional: Executes when conditions are met (occupancy < 50%, price change > 10%)
Examples:

"Sync Airbnb data every 4 hours" (scheduled)
"Send confirmation email when new reservation created" (event-driven)
"Auto-approve price changes under 5%" (conditional)
"Generate weekly performance report every Monday" (scheduled)
6. Sync Services (Existing Context)
Purpose: Integration points that collect data from external platforms

Current Sync Services:

sync-airbnb: Listings, reservations, pricing, reviews, performance metrics
sync-hostaway: Multi-platform aggregation, channel management
Future Sync Services:

sync-vrbo, sync-booking, etc.
How They Work:

Each sync service has its own database
Each account table has org_id linking to org-service
Authenticate using org-service JWTs
Provide APIs for querying synced data
Multi-tenancy enforced by org_id filtering
Role in Architecture:

Data ingestion layer - brings in external data
Provides the INPUT for AI agents to analyze
Provides the TARGET for automation to update (write back changes)
Use Case Examples
Use Case 1: Property Management Company (Complex)
Organization Structure:

1 organization (PropCo Inc)
3 departments: Marketing, Revenue Management, Operations
10 human users across departments
5 AI agents (revenue manager, content writer, market analyst, etc.)
50 Airbnb listings across multiple properties
Workflow Example: Dynamic Pricing for Portfolio

Sync service pulls daily data (occupancy, competitor prices, views)
AI Revenue Manager analyzes trends for all listings
Creates tasks: "Review pricing for Listing ABC" (for each listing needing adjustment)
Human Revenue Manager reviews AI recommendations on dashboard
Approves recommendations or overrides
Automation updates prices on Airbnb via API
AI monitors results and adjusts strategy
Use Case 2: Solo User (Simple)
Organization Structure:

1 organization (personal)
1 department (default: "Owner")
1 human user (owner role)
2 AI agents (revenue manager, content helper)
2 Airbnb listings
Workflow Example: Weekly Price Optimization

Scheduled task: "Analyze pricing" runs every Sunday
AI Revenue Manager generates recommendations
Auto-approve if change < 10%, otherwise notify owner
Automation updates prices
Owner gets summary email
Architectural Questions to Resolve
Question 1: Service Boundaries
Where should these live?

Option A: Monolithic (all in org-service)

Tasks, workflows, projects, automation logic all in org-service
Simpler initially
Risk: org-service becomes bloated
Option B: work-service (separate service)

Tasks, workflows, projects in new work-service
References org_id, department_id, role_id from org-service
Validates JWTs from org-service
Cleaner separation of concerns
Option C: Multiple services

work-service: Tasks, workflows, projects
agent-service: AI agent execution engine
automation-service: Scheduled/event-driven automation
More complex but better separation
Question 2: AI Agent Execution
Where does AI agent logic run?

In work-service alongside task management?
Separate agent-service that picks up tasks from work-service?
Embedded in each sync service?
Question 3: Automation Engine
Where does automation run?

Part of work-service (tasks marked as automated)?
Separate automation-service that executes tasks?
Embedded in each service that needs automation?
Question 4: Data Access Patterns
How do agents/automation access data?

Query sync services directly via API?
Sync services push data to work-service?
Shared database access?
Event bus/message queue?
Current Architecture (For Context)
┌─────────────────┐
│  org-service    │  (FastAPI, PostgreSQL)
│  - Auth/OAuth   │
│  - Organizations│  Port: 8000
│  - Users        │  JWT: HS256
│  - Departments  │
│  - Roles        │
└─────────────────┘
         │ JWT
         ↓
┌─────────────────┐     ┌──────────────────┐
│ sync-airbnb     │     │ sync-hostaway    │
│ - Listings      │     │ - Multi-channel  │
│ - Reservations  │     │ - API keys       │
│ - org_id FK     │     │ - org_id FK      │
└─────────────────┘     └──────────────────┘
Future Architecture (to be determined):

Where does work-service fit?
Where does agent execution happen?
Where does automation run?
How do services communicate?
Technical Constraints
Multi-tenancy: ALL queries must filter by org_id
Authentication: All services validate JWTs from org-service
Service-to-service: Internal endpoints use API keys
Database: Each service has its own PostgreSQL database
Stack: FastAPI, SQLAlchemy Core, Alembic, Python 3.11+
Next Steps
Get architectural guidance on service boundaries
Define service interfaces (APIs, events, data contracts)
Design database schemas for work-service (tasks, workflows, projects)
Implement P0 org-service (orgs, users, departments, roles) FIRST
Build out work-service after architecture is decided
Integrate AI agents (determine execution model)
Add automation engine (scheduled + event-driven)
Questions for Architectural Review
Should tasks/workflows/projects live in org-service or separate work-service?
Should AI agent execution be a separate service or embedded in work-service?
Should automation be a separate service or part of work-service?
How should services communicate? (REST APIs, events, message queue, gRPC?)
Should we use an event bus for async communication between services?
How do we handle distributed transactions (saga pattern, 2PC, eventual consistency)?
Should workflows use a dedicated orchestration engine (Temporal, Airflow) or custom logic?
How do AI agents discover and execute tasks? (polling, webhooks, message queue?)
```

</details>

**Status**: More detailed than the other doc, but still not grounded in real requirements

---

## What NOT to Do

❌ **Don't design the architecture now** - We don't have real requirements yet
❌ **Don't build tasks/workflows/projects yet** - We don't know if we need them
❌ **Don't audit the existing docs against each other** - They're both speculative
❌ **Don't try to reconcile conflicts** - There's nothing solid to reconcile

---

## What to Do NOW

✅ **Finish Phase 1 authentication** (Google OAuth + JWT)
✅ **Build visualizations for Airbnb data** (listings, metrics, reservations)
✅ **Use the platform yourself** for a few weeks
✅ **Notice what you wish was automated** - those become real use cases

**THEN** come back to this task with actual requirements.

---

## When to Tackle This Task

**Trigger**: After you've been using the platform for 2-4 weeks and have a clear list of:

- "I wish this was automated..."
- "I want AI to help me with..."
- "Every week I do X manually, and I hate it..."

**At that point**:

1. Open this task file
2. Document 5-10 real use cases
3. Design the simplest solution that solves them
4. Prototype one use case end-to-end
5. Evaluate whether you need formal "work management" or just simple CRUD + cron

---

## Reference Documents

- [docs/planning/architecture-authentication-security.md](../docs/planning/architecture-authentication-security.md) - ✅ Well-defined, ready to implement
- [docs/planning/architecture-work-management.md](../docs/planning/architecture-work-management.md) - ⚠️ Speculative, not ready
- [docs/product/PLATFORM_VISION.md](../docs/product/PLATFORM_VISION.md) - Product vision (high-level)
- [docs/product/PRODUCT_STORY.md](../docs/product/PRODUCT_STORY.md) - Market opportunity

---

## Final Note

**Building without real requirements leads to overengineering.**

We've already seen this with org-service - you built departments, roles, org_members tables before knowing if you needed them. Now we're stripping it back to just OAuth + JWT.

Don't repeat that mistake with work management. Build it when you know what you actually need.
