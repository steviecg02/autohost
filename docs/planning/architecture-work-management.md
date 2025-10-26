# Future Architecture: Work Management & Automation System

**Status**: Exploratory - NOT Finalized
**Created**: October 25, 2025
**Source**: Initial brainstorming conversation with Claude AI
**Purpose**: Document initial ideas for task management, workflows, projects, AI agents, and automation

---

## ⚠️ IMPORTANT DISCLAIMER

**This document contains PROPOSALS, not decisions.**

The feature descriptions, properties, and examples below were generated during an exploratory conversation. They have NOT been:

- ❌ Fully reviewed by the product owner
- ❌ Validated against actual business requirements
- ❌ Tested with real use cases
- ❌ Finalized for implementation

**Treat everything here as "ideas to consider" rather than "specifications to implement."**

When building these features:

1. Review this document for context and possibilities
2. Validate requirements with actual business needs
3. Iterate on the design based on real use cases
4. Don't assume any specific implementation is "the right way"

---

## Overview

This document captures INITIAL IDEAS for work management and automation. These features are NOT being implemented yet - they are documented here for future reference and architectural decision-making.

**Core question**: Should these features live in org-service, a separate work-service, or multiple specialized services?

---

## Current Implementation (P0)

**org-service** handles authentication and organizational identity:

- Organizations (tenants - individuals or companies)
- Users (people who log in via Google OAuth)
- Departments (organizational units)
- Roles (positions within departments)
- org_members (links users to orgs with department/role)
- JWT generation and validation

**Key Design Decision**: AI agents are users with roles (not separate entities)

---

## Proposed Future Features

### 1. Tasks System (Proposed)

**What are tasks?**

Individual work items that need to be completed. Tasks are **polymorphic** - they can be:

- Manual tasks (human completes)
- Automated tasks (system executes without human)
- Analysis tasks (AI generates insights/recommendations)
- Decision tasks (require approval/input before proceeding)

**Proposed Task Properties**:

```
- org_id - Which organization owns this task
- department_id - Which department is responsible
- role_id - Which role should handle it
- assigned_to - Specific user (human or AI agent)
- task_type - manual | automated | analysis | decision
- status - pending | in_progress | completed | failed | blocked
- data - JSON context needed to execute the task
- workflow_id - Optional: part of a workflow
- parent_task_id - Optional: subtask of another task
- due_date - When task should be completed
- priority - low | medium | high | urgent
```

**Example Use Cases** (not validated):

- "Analyze pricing for listing ABC-123" → Assigned to AI Revenue Manager role
- "Review and approve price change" → Assigned to human Revenue Manager
- "Update Airbnb listing price to $150" → Automated task
- "Create marketing content for new listing" → Assigned to Marketing department

**UI Implications** (proposed):

- Task inbox (like email) showing pending tasks
- Calendar view of due dates
- Kanban board by status
- Filtering by department/role/assigned user

---

### 2. Workflows System (Proposed)

**What are workflows?**

Sequences of tasks that form a complete process. Workflows orchestrate multiple steps to accomplish a goal.

**Proposed Workflow Properties**:

```
- org_id - Organization owner
- name - "Dynamic Pricing Workflow", "New Listing Onboarding"
- description - What this workflow accomplishes
- status - not_started | running | paused | completed | failed
- steps - Ordered sequence of task definitions
- conditional_logic - Branching based on task outcomes
- trigger_type - manual | scheduled | event
- trigger_config - When/how workflow starts
```

**Proposed Workflow Features**:

- Sequential steps: Task B waits for Task A to complete
- Parallel branches: Multiple tasks execute simultaneously
- Conditional logic: If Task A result = X, do Task B, else do Task C
- Human-in-loop: Pause for approval before continuing
- Error handling: Retry failed tasks, rollback on failure
- Spawn child workflows: Workflow can create other workflows

**Example: Dynamic Pricing Workflow** (proposed, not validated):

```
1. Task: Sync latest data from Airbnb (automation)
   ↓
2. Task: Analyze market trends (AI Revenue Manager)
   ↓
3. Task: Generate pricing recommendation (AI calculates)
   ↓
4. Decision: Auto-approve if change < 10%, else human approval
   ↓
5. Task: Update listing prices (automation)
   ↓
6. Task: Monitor performance for 7 days (AI)
```

**UI Implications** (proposed):

- Workflow builder (drag-and-drop visual editor)
- Workflow status dashboard
- Logs showing which step is running
- Ability to pause/resume/cancel workflows

---

### 3. Projects System (Proposed)

**What are projects?**

Collections of workflows and tasks grouped together for complex initiatives.

**Proposed Project Properties**:

```
- org_id - Organization owner
- name - "Q4 Revenue Optimization", "Miami Market Expansion"
- description - High-level goal
- start_date, end_date - Timeline
- milestones - Key dates/deliverables
- workflows - Associated workflows
- standalone_tasks - Tasks not in workflows
- team_members - Users across multiple departments
- status - planning | active | on_hold | completed
```

**Example Project** (proposed, not validated):

```
Project: Q4 Revenue Optimization Initiative
- Contains workflows: Dynamic Pricing, Gap Filling, Event-Based Pricing
- Timeline: Oct 1 - Dec 31
- Team: Revenue Manager, Performance Analyst, AI agents
- Milestones: +10% RevPAN by Nov 1, +15% by Dec 1
```

**UI Implications** (proposed):

- Project dashboard (Gantt chart, timeline view)
- Resource allocation across projects
- Progress tracking (% complete)
- Cross-project dependencies

---

### 4. AI Agents (Proposed Approach)

**What are AI agents?**

Users with roles that can be assigned tasks and make decisions autonomously.

**Design Proposal**: AI agents ARE users in org-service with specific roles. They are not a separate entity type.

**Proposed Implementation**:

1. Create user with type = "ai_agent"
2. Assign to department (Revenue, Marketing, Operations)
3. Assign role (Manager, Analyst, Coordinator)
4. AI agent appears in task assignment dropdowns
5. When task assigned to AI agent, agent execution service picks it up

**Example Agent Types** (not finalized):

- AI Revenue Manager (pricing optimization, gap filling)
- AI Marketing Analyst (campaign performance, content creation)
- AI Content Writer (listing descriptions, email templates)
- AI Operations Coordinator (scheduling, logistics)

**Proposed Agent Capabilities**:

- Get assigned tasks (just like humans)
- Access data from sync services (via JWT with their role)
- Analyze data and make decisions
- Create new tasks or trigger workflows
- Complete tasks autonomously OR request human approval

**Data Access** (proposed):

- AI agent has JWT with org_id, department_id, role_id
- Can query sync-airbnb, sync-hostaway for data
- Can read/write tasks assigned to their role
- Cannot access data outside their org

**UI Implications** (proposed):

- AI agent management page (create/configure agents)
- View AI agent activity log
- Override AI decisions
- Adjust AI confidence thresholds

---

### 5. Automation System (Proposed)

**What is automation?**

Scheduled or event-driven task execution without human intervention.

**Proposed Automation Types**:

**A. Scheduled Automation**

- Run at specific times
- Examples: "Sync Airbnb data every 4 hours", "Generate weekly report every Monday 9am"
- Implemented with cron-like scheduler

**B. Event-Driven Automation**

- Triggered by external events
- Examples: "Send confirmation email when new reservation created", "Alert on negative review"
- Implemented with webhooks/message queue

**C. Workflow-Embedded Automation**

- Part of a workflow sequence
- Example: "After AI generates pricing, automatically update if change < 5%"

**D. Conditional Automation**

- Executes when conditions are met
- Example: "If occupancy < 50% for next month, trigger gap-filling workflow"
- Evaluated on schedule or event

**Proposed Automation Properties**:

```
- org_id - Organization owner
- name - "Hourly Airbnb Sync"
- type - scheduled | event | conditional
- trigger_config - When to run (cron, event name, condition)
- task_template - What task to create/execute
- is_active - Can be paused without deleting
```

**UI Implications** (proposed):

- Automation management page (create/edit/pause)
- Automation execution logs
- Error notifications
- Success metrics (last run, success rate)

---

### 6. Sync Services (Existing Context)

**Purpose**: Integration points that collect data from external platforms

**Current Services**:

- **sync-airbnb**: Listings, reservations, pricing, reviews, performance metrics
- **sync-hostaway**: Multi-platform aggregation, channel management

**How They Relate to Work System**:

- **INPUT for AI agents**: AI analyzes synced data to make decisions
- **TARGET for automation**: Automation updates external systems (e.g., change Airbnb price)
- **TRIGGER for workflows**: New reservation event triggers guest communication workflow

**Proposed Data Flow**:

```
Airbnb (external)
  ↓ sync-airbnb pulls data
sync-airbnb database (org-specific data)
  ↓ AI agent queries via JWT
AI Revenue Manager (analyzes)
  ↓ creates task
Task: "Update pricing to $150"
  ↓ automation executes
sync-airbnb pushes update
  ↓
Airbnb (external) - price updated
```

---

## Use Case Examples (Proposed, Not Validated)

### Solo User (Simple)

**Organization Structure**:

- 1 organization (personal)
- 1 department ("Owner")
- 1 human user (owner role)
- 2 AI agents (revenue manager, content helper)
- 2 Airbnb listings

**Proposed Workflow: Weekly Price Optimization**

```
Trigger: Scheduled (every Sunday 9am)
  ↓
Task: "Analyze pricing" (assigned to AI Revenue Manager)
  ↓
AI generates recommendations
  ↓
Decision: Auto-approve if change < 10%, else notify owner
  ↓
Task: "Update prices" (automation)
  ↓
Owner receives summary email
```

---

### Property Management Company (Complex)

**Organization Structure**:

- 1 organization (PropCo Inc)
- 3 departments: Marketing, Revenue Management, Operations
- 10 human users across departments
- 5 AI agents (assigned to different roles)
- 50 Airbnb listings

**Proposed Workflow: Portfolio Dynamic Pricing**

```
Trigger: Scheduled (daily 6am)
  ↓
Task: "Sync data for all 50 listings" (automation)
  ↓
Parallel: For each listing segment (luxury, budget, mid-range)
  Task: "Analyze trends" (AI Revenue Manager)
  ↓
  Task: "Generate pricing recommendations" (AI)
  ↓
Decision: Human Revenue Manager reviews batch of changes
  ↓
Task: "Apply approved changes" (automation)
  ↓
Task: "Monitor performance" (AI runs for 7 days, alerts on issues)
```

---

## Architectural Questions (Unresolved)

### Question 1: Service Boundaries

**Where should these features live?**

**Option A: All in org-service (Monolithic)**

- Tasks, workflows, projects, automation all in org-service
- ✅ Simpler initially
- ✅ Fewer services to manage
- ❌ org-service becomes bloated over time
- ❌ Harder to scale independently

**Option B: Separate work-service**

- Tasks, workflows, projects in new work-service
- ✅ Clean separation of concerns (identity vs work)
- ✅ Can scale independently
- ✅ org-service stays focused on auth
- ❌ More complex service mesh
- ❌ Need service-to-service communication

**Option C: Multiple specialized services**

- task-service: Task management
- workflow-service: Workflow orchestration
- automation-service: Scheduled/event automation
- ✅ Each service has single responsibility
- ✅ Can use specialized tools (Temporal for workflows)
- ❌ Most complex architecture
- ❌ Operational overhead

**Proposed Recommendation** (not decided): Start with Option B (work-service), split into Option C if needed later.

---

### Question 2: AI Agent Execution

**Where does AI agent logic run?**

**Option A: In work-service**

- work-service picks up tasks assigned to AI agents
- Executes AI logic inline
- ✅ Simple
- ❌ Couples work management with AI execution

**Option B: Separate agent-service**

- agent-service polls for tasks assigned to AI agents
- Executes AI logic, updates task status
- ✅ Clean separation
- ✅ Can scale AI execution independently
- ❌ More services

**Proposed Recommendation** (not decided): Start with Option A, migrate to Option B when AI becomes complex.

---

### Question 3: Workflow Orchestration

**How to implement workflows?**

**Option A: Custom Logic**

- Store workflow definition in database
- Custom code to execute steps
- ✅ Full control
- ❌ Reinventing the wheel
- ❌ Complex error handling

**Option B: Use Orchestration Engine (Temporal, Airflow)**

- Temporal for durable workflows
- Handles retries, error recovery, state management
- ✅ Production-grade orchestration
- ✅ Built-in monitoring
- ❌ Learning curve
- ❌ Additional infrastructure

**Proposed Recommendation** (not decided): Use Temporal (or similar) - don't build workflow engine from scratch.

---

### Question 4: Data Access Patterns

**How do agents/automation access data?**

**Option A: Direct Database Access**

- work-service queries sync-airbnb database directly
- ✅ Fast
- ❌ Tight coupling
- ❌ Breaks service boundaries

**Option B: API Calls**

- work-service calls sync-airbnb API with JWT
- ✅ Proper service boundaries
- ✅ Authentication/authorization enforced
- ❌ Slower (HTTP overhead)

**Option C: Message Queue/Event Bus**

- sync-airbnb publishes events (new reservation, price change)
- work-service subscribes and reacts
- ✅ Loosely coupled
- ✅ Scalable
- ❌ Eventual consistency

**Proposed Recommendation** (not decided): Option B (API calls) for now, Option C (events) when scaling.

---

## Technical Constraints

1. **Multi-tenancy**: ALL queries must filter by org_id
2. **Authentication**: All services validate JWTs from org-service
3. **Service-to-service**: Internal endpoints use API keys (Phase 1) or mTLS (Phase 2)
4. **Database**: Each service has its own PostgreSQL database
5. **Stack**: FastAPI, SQLAlchemy Core, Alembic, Python 3.11+

---

## Proposed Roadmap (Not Finalized)

### Phase 1 (Current - P0)

- ✅ org-service with orgs, users, departments, roles
- ✅ JWT authentication across services
- ✅ Document future architecture (this doc)

### Phase 2 (Work Management Basics)

- ⏳ Finalize requirements for tasks system
- ⏳ Decide: org-service vs work-service
- ⏳ Implement tasks system
- ⏳ Basic task inbox UI

### Phase 3 (Workflows & Automation)

- ⏳ Finalize workflow requirements
- ⏳ Choose orchestration tool (Temporal vs custom)
- ⏳ Implement workflows system
- ⏳ Scheduled automation

### Phase 4 (AI Agents)

- ⏳ Finalize AI agent architecture
- ⏳ AI agent execution engine
- ⏳ Agent configuration UI

### Phase 5 (Projects & Advanced Features)

- ⏳ Projects system
- ⏳ Advanced features TBD

---

## Next Steps

**Before implementing ANY of this**:

1. ✅ Review this document
2. ⏳ Validate use cases against actual business needs
3. ⏳ Answer architectural questions (service boundaries, etc.)
4. ⏳ Create detailed requirements for Phase 2
5. ⏳ Get approval on approach before building

**Current Priority**:

- Complete P0 org-service implementation
- Answer architectural questions
- Finalize requirements before coding

---

## Questions for Review

1. Should tasks/workflows/projects live in org-service or separate work-service?
2. Should AI agent execution be separate service or embedded in work-service?
3. Should automation be separate service or part of work-service?
4. Use Temporal for workflows or build custom?
5. How should services communicate? (REST APIs, message queue, both?)
6. Should we use event bus for async communication?
7. How to handle distributed transactions? (Saga pattern, eventual consistency?)
8. Are the proposed task properties the right ones?
9. Are the example workflows realistic?
10. What's missing from this analysis?

---

**Remember**: Everything in this document is a PROPOSAL. Validate, iterate, and decide before implementing.
