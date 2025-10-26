# System Architecture & Workflows

_The complete technical and business architecture of the STR automation platform_

## Overview

This document defines the comprehensive system architecture for an STR automation platform that replaces fragmented tools with an intelligent, unified system. The platform combines automation with embedded expertise to create businesses that run themselves.

## Core Framework Layer

The foundation that enables everything else - these components work together to orchestrate all platform capabilities.

### Org Service

The structural foundation that forces clarity before automation. You can't automate chaos, but you can automate structure.

- **Hierarchy**: Departments → Roles → Tasks → Steps
- **Defines**: WHO does WHAT and WHEN in the business
- **Purpose**: Foundation for assigning agents and scheduling work
- **Example**: Marketing Department → Campaign Director Role → Weekly Performance Review Task

### Automation Framework

The engine that executes all work, whether triggered by events or schedules.

**Event-Driven Automation**:

- Reservation received → trigger guest vetting workflow
- Review posted → generate personalized response
- Guest message arrives → analyze and respond
- Calendar gap detected → initiate pricing adjustment

**Schedule-Driven Automation**:

- Campaign Director runs weekly performance analysis every Monday 9am
- Revenue Agent adjusts pricing daily at 6am
- Maintenance inspections scheduled quarterly
- Supply inventory checked weekly

**Core Components**:

- Integration Layer: Connections to all external platforms
- Routing Engine: Directs work to appropriate automation or AI agent
- Approval chains: Human-in-loop where needed
- Task orchestration: Multi-step workflows with conditional logic

### AI Agent System

Intelligent agents that bring expertise to every decision.

**Implementation**:

- Users provide their own API keys (OpenAI, Anthropic, etc.)
- Platform crafts prompts with embedded expertise
- Cost passed directly to user's API account
- No markup or platform AI fees

**Expertise Embedding Methods**:

- **Quick Start**: Prompt engineering with SOPs and course content
- **Advanced**: RAG (Retrieval Augmented Generation) for knowledge retrieval
- **Assignment Flexibility**: Agents can be assigned at department, role, or task level

**Key Principle**: Agents aren't employees - they ARE the departments, bringing $10k+ worth of course expertise for fraction of the cost.

### Workflow System

The orchestration layer that combines structure, automation, and intelligence.

**Core Concepts**:

- Combines Org Service + Automation Framework + AI Agents
- Expertise requires workflows - they're interdependent
- Can't have intelligence without defined processes

**Workflow Types**:

- **Event-triggered**: Reservation arrives → vetting → decision → onboarding
- **Schedule-triggered**: Daily pricing review → analysis → adjustments
- **Hybrid**: Check for gaps daily → if found, trigger pricing workflow

**Example Workflow - Guest Reservation**:

1. Event: New reservation request received
2. Guest Intelligence Agent analyzes profile and reviews
3. Revenue Intelligence Agent validates pricing
4. Automation Framework checks for approval requirement
5. If approved, automation sends confirmation and schedules tasks
6. Notification sent to phone app with summary

### Notification Service

Multi-channel alerting system that keeps humans in the loop when needed.

**Channels**:

- Phone app with push notifications
- SMS for urgent items
- Email for reports
- In-app notifications

**Notification Types**:

- **Action Required**: Approve guest message, review unusual booking
- **Issue Alerts**: Listing ranking dropped, negative review received
- **Task Reminders**: Scheduled maintenance due, supplies running low
- **Performance Updates**: Weekly summary, revenue reports

**Phone App Features**:

- Message approval queue with one-tap approve/edit
- Quick action buttons for common tasks
- Issue alerts with context
- Performance metrics at a glance

### Data Consolidation Engine

The intelligence layer that makes all data available everywhere it's needed.

**Functions**:

- Aggregates ALL data from sync services
- Creates single source of truth across entire system
- Makes data available to any agent or automation
- Handles data freshness, caching, and consistency

**Data Sources**:

- All sync services (PMS, OTAs, market data)
- Internal workflows and decisions
- Historical patterns and performance
- External integrations

## Sync Services (Data Pipeline)

The connectors that bring external data into the platform and push actions back out.

### sync-hostaway (PMS Sync)

Primary integration with existing PMS infrastructure.

**Pulls**:

- Reservations with full details
- Customer database and history
- All messages across platforms
- Calendar and availability
- Listing details and settings

**Pushes**:

- Message responses to guests
- Calendar blocks and updates
- Rate adjustments
- Listing modifications

**Real-time**:

- Webhooks for instant updates
- Full bidirectional API communication

### sync-airbnb (OTA Sync)

Direct integration with Airbnb via GraphQL, bypassing PMS limitations.

**Currently Built**:

- GraphQL integration using ListOfMetricsQuery
- Performance tracking (impressions, views, CTR, bookings, conversion)
- Historical data collection

**Dual-Axis Tracking** (Critical Differentiator):

- Tracks BOTH `search_date` (when guest searched) AND `stay_date` (what dates they searched for)
- Enables three critical data views:
  1. **By Search Date**: "When are users searching?" - Track visibility trends over time
  2. **By Stay Date**: "What dates are they searching for?" - Understand future demand
  3. **Search→Stay Matrix**: Combined view showing lead time behavior and booking patterns
- This dual-axis approach is what RankBreeze and IntelliHost both fail to provide

**Data Storage Strategy**:

- Time-series storage by scrape day + stay date for historical trend analysis
- Latest snapshot for future stay dates for forward planning
- Enables answering: "Should I be concerned?", "When should I be concerned?", "What is the market doing?", "How am I doing in search?"

**Potential via GraphQL**:

- Per-night revenue breakdown for accurate monthly tracking
- Full message inbox access and response capability
- Complete reservation details with financials
- Review management and responses

**Strategic Importance**:

- If successful, enables complete PMS replacement for Airbnb-only hosts
- Saves $334/month in Host Away costs
- Provides data PMS doesn't have access to
- RankBreeze and IntelliHost validate market for this approach

### sync-pricelabs (Market Data Sync)

Revenue management data integration.

**Data Retrieved**:

- Market dashboards with trends
- Occupancy rates by season
- ADR (Average Daily Rate) analysis
- Competitive set performance
- Booking pace insights

**Purpose**: Feed Revenue Intelligence Agent with market context for pricing decisions.

### sync-airdna (Market Intelligence Sync)

Comprehensive market analysis data.

**Data Retrieved**:

- Market data and trends
- Custom comp set performance
- STR vs MTR opportunity analysis
- Demand forecasting
- Seasonal patterns

**Purpose**: Enable data-driven decisions on positioning and strategy.

### Future Sync Service Pattern

Standardized approach for additional integrations:

- **sync-vrbo**: Similar to Airbnb service but adapted to VRBO's data
- **sync-booking**: Limited by available API/data
- **sync-[any-pms]**: Standardized integration pattern for any PMS

Each follows same pattern:

1. Pull data via API/scraping
2. Normalize to platform schema
3. Push actions back through API
4. Handle webhooks for real-time updates

## Intelligence Services (AI Agents with Expertise)

The "departments" that make intelligent decisions using consolidated data and embedded expertise.

### Guest Intelligence Agent

The guest services department that never sleeps.

**Data Sources**:

- All guest messages from any sync service
- Guest profiles and verification status
- Reviews (both given and received)
- Booking history and patterns

**Embedded Expertise**:

- Hospitality best practices
- Risk assessment protocols
- Guest psychology
- Communication excellence

**Key Decisions**:

- Accept/decline reservations based on risk profile
- Guest segmentation (medical, pilots, corporate, leisure)
- Risk scoring and red flag identification
- Personalization strategies for each guest

**Critical Function**: Collects 3 essential pieces of information from every guest:

1. Who they are (identity/verification)
2. Why they're visiting (purpose of stay)
3. Local contact information (emergency/issues)

This serves dual purpose: property protection AND marketing database building.

### Revenue Intelligence Agent

The revenue management department that optimizes 24/7.

**Data Sources**:

- All reservations from PMS or OTA syncs
- AirDNA market intelligence
- Price Labs market dashboards
- Historical performance data
- Local events and seasonality

**Embedded Expertise**:

- Revenue management course strategies
- Yield optimization techniques
- Market positioning tactics
- Demand forecasting methods

**Key Decisions**:

- STR vs MTR optimization by season
- Gap filling strategies and pricing
- Event-based pricing adjustments
- Competitive positioning moves
- Minimum stay adjustments

### Marketing Intelligence Agent

The marketing department that creates, deploys, and optimizes campaigns.

**Data Sources**:

- Guest database with segments
- Listing performance metrics
- Conversion data by channel
- Campaign performance history
- Competitor analysis

**Embedded Expertise**:

- [To be provided via your documentation]
- Direct booking strategies
- Channel optimization
- Content creation best practices
- A/B testing methodologies

**Key Decisions**:

- Campaign creation and timing
- Channel selection and budget allocation
- Content generation for different segments
- A/B testing strategies
- Listing optimization for conversion

### Operations Intelligence Agent

The operations department that keeps properties running smoothly.

**Data Sources**:

- Maintenance logs and schedules
- Cleaner reports and performance
- Supply levels and usage patterns
- Vendor performance metrics
- Guest feedback on property condition

**Embedded Expertise**:

- Property management best practices
- Preventive maintenance protocols
- Supply chain optimization
- Vendor management strategies

**Key Decisions**:

- Maintenance scheduling optimization
- Supply reorder timing and quantities
- Cleaner performance interventions
- Vendor selection and replacement
- Emergency response protocols

## Service Expansion Modules

Additional capabilities that extend the platform beyond core STR operations.

### Voice Agent System

24/7 phone support without human intervention.

**Capabilities**:

- Natural conversation with guests
- Access to reservation and property data
- Can invoke automation framework for actions

**Common Scenarios**:

- "Lock not working" → Diagnose issue → Open door remotely
- "No hot water" → Create urgent maintenance ticket → Notify vendor
- "Need late checkout" → Check calendar → Approve/deny with confirmation
- "Where's the wifi password" → Verify guest → Provide information

**Benefits**:

- Reduces call volume to near zero
- 24/7 availability without staff
- Consistent service quality
- Immediate issue resolution

### Financial Management Service

Complete financial operations as a service.

**Core Features**:

- QuickBooks integration and setup
- Chart of accounts configuration for STR
- Invoice generation with per-night breakdown
- Revenue recognition by actual stay dates
- P&L analysis and reporting
- Tax optimization tracking

**Service Offering**:

- Can be offered as managed service to other hosts
- Replace expensive STR bookkeepers
- Automated monthly reporting
- Audit-ready documentation

### Legal Compliance Service

Ensuring legal protection and compliance.

**Components**:

- Rental agreement templates by stay type
- Different agreements for STR/MTR/corporate
- Jurisdiction-specific compliance checking
- Guest agreement workflows
- ID verification requirements
- Insurance documentation management

**Automation**:

- Agreement selection based on stay parameters
- Automatic sending for signature
- Signature required before door code release
- Document storage and retrieval

### Guest Verification System

Comprehensive guest screening and onboarding.

**Process**:

1. Online check-in form sent after booking
2. ID collection and verification
3. Rental agreement customized by conditions
4. Digital signature required
5. Emergency contact collection
6. Door code released upon completion

**Customization**:

- Different requirements by property
- Varied by stay length (STR vs MTR)
- Corporate booking modifications
- International guest considerations

### Cleaning & Maintenance Service

Operations management that could replace or enhance Breezeway.

**Cleaning Management**:

- Digital checklists with photo verification
- Automatic scheduling based on checkouts
- Supply tracking and usage reporting
- Performance scoring and feedback
- Quality control workflows

**Maintenance Coordination**:

- Preventive maintenance scheduling
- Issue tracking and escalation
- Vendor assignment and tracking
- Guest impact coordination
- Cost tracking and analysis

**Supply Management**:

- Inventory tracking by property
- Predictive ordering based on bookings
- Bulk order optimization
- Budget tracking
- Waste reduction analysis

## Tool Philosophy & Market Strategy

How we think about the existing tool landscape and our disruption approach.

### Industry Staples to Leverage

Tools that do their job well and should be integrated:

- **Price Labs**: Best-in-class dynamic pricing - integrate, don't replace
- **AirDNA**: Unmatched market intelligence - pull their data
- **QuickBooks**: Industry standard accounting - integrate deeply
- **MailChimp**: Email marketing excellence - use for campaigns

### Prime Disruption Targets

Where we can deliver 10x better value:

**PMS (Host Away, Guesty, etc.)**:

- Currently $200-500/month per user
- Using maybe 20% of features
- Our approach: Start integrated, gradually replace
- Even self-use saves $334/month
- Market validation: RankBreeze and IntelliHost already using similar approaches

**Ancillary Tools** ($700+/month of redundancy):

- Lock management services ($5/lock/month)
- Basic automation tools (Hospitable)
- Digital guidebooks (TouchStay, Guidebook)
- Simple scrapers and trackers
- Single-purpose tools

### Integration Decision Framework

**Build When**:

- Core to value proposition
- Can deliver 10x better experience
- Data consolidation enables unique value
- Examples: Guest intelligence, listing optimization

**Integrate When**:

- Best-in-class tool exists
- Commodity feature
- Not core differentiator
- Examples: Email delivery, payment processing

**Evaluate Case-by-Case**:

- StayFi (WiFi/email capture)
- Breezeway (operations)
- Your Porter App (maintenance)

## Technical Implementation Notes

High-level technical approach without deep implementation details.

### API Integration Approaches

- **GraphQL Discovery**: Using dev tools to find undocumented endpoints
- **Webhook Processing**: Real-time event handling
- **Batch Processing**: Historical data imports
- **Rate Limiting**: Respecting API limits with retry logic
- **Cookie Management**: Electron app for Airbnb scraping

### Data Architecture

- **TimescaleDB**: Time-series metrics and performance data
- **PostgreSQL**: Core relational data
- **Redis**: Caching and job queues
- **Vector DB**: RAG implementation for AI knowledge
- **S3-compatible**: Document and file storage

### Phone App Architecture

- **React Native**: Cross-platform development
- **Push Notifications**: Firebase Cloud Messaging
- **Offline Queue**: Actions available without connection
- **Quick Actions**: Widget shortcuts for common tasks
- **Biometric Auth**: Secure but convenient access

## Implementation Roadmap

### Phase 1: Core Foundation & Validation

The critical path to proving platform viability:

1. **Complete sync-hostaway service** - Full PMS data pipeline
2. **Complete sync-airbnb with metrics UI** - Performance visibility
3. **Build Org Service structure** - Who does what framework
4. **Implement Scheduled Workflows** - Recurring automation
5. **Deploy Notification Service + Phone App** - Stay connected
6. **Migrate lock automation from Zapier** - Prove replacement capability
7. **Implement invoice automation** - Financial workflows
8. **TEST: Can sync-airbnb handle messages/reservations?** - PMS replacement validation

### Post-Phase 1 Assessment

Based on results, evaluate:

**Technical Findings**:

- PMS replacement viability
- API stability and limits
- Performance at scale
- Integration challenges

**Market Feedback**:

- Most requested features
- Pricing sensitivity
- Integration priorities
- Support requirements

**Strategic Decisions**:

- Direct to consumer vs white-label
- Feature prioritization
- Partnership opportunities
- Geographic expansion

Future phases determined by:

- Technical feasibility discovered
- User demand and feedback
- Revenue opportunities
- Competitive landscape
- Resource availability

## Conclusion

This architecture represents a fundamental shift from tool collection to intelligent platform. By combining structure (Org Service), automation (Framework), intelligence (AI Agents), and data (Consolidation), we create businesses that truly run themselves.

The platform starts by solving immediate pain (3 hours → 30 minutes daily), delivers immediate ROI (save $600+/month), and scales to become the operating system for any operationally-intensive business.

Success isn't measured in features built, but in hours returned to operators and businesses that scale without scaling problems.
