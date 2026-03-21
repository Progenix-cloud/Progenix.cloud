# IMPLEMENTATION ROADMAP — Complete Remaining Work

**Last Updated:** March 20, 2026 (IST)  
**Status:** Authoritative source for all remaining implementation tasks  
**Scope:** Software Agency Website — All remaining features, fixes, and integrations

## Progress Summary

| Phase                  | Status             | Completion         |
| ---------------------- | ------------------ | ------------------ |
| Phase 1 (Critical)     | 🟢 **In Progress** | 3/5 tasks complete |
| Phase 2 (Important)    | 🟢 **In Progress** | 3/5 tasks complete |
| Phase 3 (Enhancement)  | ⚪ **Not Started** | 0/7 tasks          |
| Phase 4 (Client Panel) | ⚪ **Not Started** | 0/4 tasks          |
| Phase 5 (Testing)      | ⚪ **Not Started** | 0/6 tasks          |

**Completed:**

- ✅ Section 1.1: Remove Mock Authentication (details in [SECTION_1_1_IMPLEMENTATION.md](SECTION_1_1_IMPLEMENTATION.md))
- ✅ Section 1.2: Unify Authentication Across Admin Pages
- ✅ Section 1.3: Session & Token Security
- ✅ Section 2.1: Task Scheduling & Review Pages Alignment
- ✅ Section 2.3: Business Engine — RICE Widget Editing

---

## Table of Contents

1. [Authentication & Security](#1-authentication--security)
2. [Admin Panel Integration](#2-admin-panel-integration)
3. [Client Panel Enhancement](#3-client-panel-enhancement)
4. [Business Engines — Feature Completeness](#4-business-engines--feature-completeness)
5. [Real-time & Notifications](#5-real-time--notifications)
6. [API & Data Consistency](#6-api--data-consistency)
7. [RBAC & Permissions](#7-rbac--permissions)
8. [Audit Logging](#8-audit-logging)
9. [Testing & Quality](#9-testing--quality)

---

## 1. Authentication & Security

### 1.1 Remove Mock Authentication (CRITICAL) ✅ COMPLETED

**Current State:** (FIXED)

- ✅ `lib/auth.ts` now uses bcryptjs for password hashing
- ✅ Password verification uses secure bcryptjs.compare()
- ✅ `app/auth/login/page.tsx` no longer displays demo credentials
- ✅ `app/api/seed/route.ts` hashes passwords before storage

**Completed Tasks:**

- [x] **Install password hashing library** ✅
  - Installed bcryptjs v2.4.3 with types
  - Fixed @dnd-kit/sortable version conflict in package.json
- [x] **Replace mock verifyPassword() in `lib/auth.ts`** ✅
  - Now uses bcryptjs.compare() for secure password verification
  - Removed hardcoded "demo" / "password123" check
  - Salt rounds: 12 (industry standard)
- [x] **Replace mock hashPassword() in `lib/auth.ts`** ✅
  - Now uses bcryptjs.hash() with 12 salt rounds
  - Removed mockSalt2024 base64 encoding
- [x] **Update `app/api/seed/route.ts`** ✅
  - Passwords are hashed during seeding
  - Unique password per role for demo users
  - API no longer returns plaintext credentials
- [x] **Secure login page (`app/auth/login/page.tsx`)** ✅
  - Removed public demo credentials display
  - Credentials now in AUTH_CREDENTIALS.md documentation
- [x] **Update session verification in `lib/auth.ts`** ✅
  - Token expiration properly verified
  - User still exists check in place
  - Org membership validated

**Implementation Details:**

- **File:** `AUTH_CREDENTIALS.md` - Documents demo setup and security improvements
- **Password Hashing:** bcryptjs with 12 salt rounds (resistant to modern attacks)
- **Demo Passwords:** Unique per role, stored in code comments only
- **API Security:** No plaintext credentials returned from /api/seed

### 1.2 Unify Authentication Across Admin Pages

**Current State:**

- Most admin pages use custom token + localStorage auth
  `app/admin/task-scheduling/page.tsx` - Unified auth (confirmed no NextAuth)
- `app/admin/task-review/page.tsx` uses NextAuth
- Inconsistent auth patterns cause security gaps

**Tasks:**

- [✅] **Audit all admin pages for auth method** - No NextAuth found
  - Create inventory of auth patterns used
  - Map each page to its auth implementation
- [✅] **Choose single auth system** - Custom JWT used
  - Option A: Replace NextAuth with custom token system (recommended for consistency)
  - Option B: Migrate all to NextAuth (requires more changes)
- [✅] **Replace NextAuth in task-scheduling page** - No NextAuth codebase-wide
  - Use same token system as other admin pages
  - Migrate session to localStorage / sessionStorage
  - Update protected-route wrapper if needed
- [x] **Replace NextAuth in task-review page**
  - Use same token system as other admin pages
  - Verify role/permission checks work
- [x] **Create unified auth hook**
  - `lib/hooks/useAuthSession.ts` - provides current user, token, role
  - Use across all admin pages
  - Ensure consistent permission checks

### 1.3 Session & Token Security

**Tasks:**

- [x] **Implement secure session storage**
  - Use httpOnly cookies for tokens (not localStorage if possible)
  - Implement CSRF protection
  - Add secure flags to cookies
- [x] **Token expiration and refresh**
  - Implement token refresh endpoint
  - Handle token expiration on client
  - Auto-logout on invalid token
- [x] **Add rate limiting to login endpoint**
  - Prevent brute force attacks
  - Implement exponential backoff
- [x] **Validate JWT properly**
  - Verify signature with secret key
  - Check expiration timestamp
  - Verify issuer and audience

---

## 2. Admin Panel Integration

### 2.1 Task Scheduling & Review Pages Alignment

**Current State:**

- Both pages exist but use NextAuth (inconsistent with rest of system)
- May have different permission models
- Unclear what data each manages

**Tasks:**

- [x] **Define task scheduling workflow**
  - Scheduling now creates `scheduled` tasks with due dates
  - Assignees can start scheduled tasks from their queue
- [x] **Define task review workflow**
  - Review transitions to `reviewed`, then `completed` by PM approval
  - Review notes captured in audit details
- [x] **Audit database schema**
  - Verify Task model supports both workflows
  - Check if scheduledDate and reviewedDate exist
  - Ensure createdDate vs createdAt consistency
- [x] **Fix schema inconsistencies**
  - Task scheduling/review fields standardized
- [x] **Replace NextAuth authentication**
  - Switch to unified token system
  - Update permission checks
- [x] **Add task workflow state machine**
  - States: draft → scheduled → in-progress → review → completed
  - Transitions with validation
  - Audit trail for state changes

### 2.2 Dashboard Data Correctness

**Current State:**

- Dashboard fetches from `/api/dashboard`
- Uses `tasks.createdAt` but schema has `createdDate`
- References `project.deadline` which may not exist (only `endDate`)
- Global chat moderation missing

**Tasks:**

- [x] **Audit `lib/db.ts` Task model**
  - Verify exact field names for dates
  - Check what fields exist in schema
  - Document date naming convention
- [x] **Fix analytics API (`app/api/analytics/route.ts`)**
  - On-time delivery and completion timing now use completion dates
  - Pending task counts include scheduled tasks
- [x] **Fix dashboard queries**
  - Dashboard performance chart uses createdAt fallback
  - Project deadline mapping now includes `deadline`/`endDate`
- [ ] **Test dashboard with real data**
  - Seed sample data
  - Verify all widgets display correctly
  - Check for null/undefined errors

### 2.3 Business Engine: RICE Widget Editing

**Current State:**

- `components/business/rice-widget.tsx` has TODO comment
- Feature update logic not implemented
- Can read RICE scores but can't edit

**Tasks:**

- [x] **Implement RICE edit form**
  - R (Reach) input with validation
  - I (Impact) input with validation
  - C (Confidence) input with validation
  - E (Effort) input with validation
- [x] **Calculate RICE score on change**
  - Formula: (R _ I _ C) / E
  - Update display in real-time
  - Show before/after scores
- [x] **API integration for updates**
  - POST/PUT endpoint for feature updates
  - Validate input ranges (0-100 typical)
  - Return updated item
- [x] **Optimistic UI updates**
  - Update component state immediately
  - Call API asynchronously
  - Rollback on error
- [x] **Audit logging**
  - Log who changed what and when
  - Store previous values
  - Include rationale/notes field

---

## 3. Client Panel Enhancement

### 3.1 Core Functionality Gaps

**UX/UI Missing:**

- [ ] Infinite scroll for long lists
- [ ] Keyboard shortcuts (n=new, e=edit, / for commands)
- [ ] Theme color customization (light/dark already exists)
- [ ] PWA support (offline viewing, install prompt)
- [ ] Print & export PDF for all pages
- [ ] Accessibility: ARIA labels on all interactive elements
- [ ] Right-click context menus for common actions
- [ ] Bulk action checkboxes for lists
- [ ] Filter badges/chips with clear buttons
- [ ] Status timeline views for projects/tasks

**Data & Forms Missing:**

- [ ] Inline editing for tables
- [ ] Auto-save drafts to localStorage
- [ ] Rich text editor for messages/feedback
- [ ] Date pickers with range selection
- [ ] Multi-select for assignees/attendees
- [ ] Conditional form fields (show/hide based on selection)
- [ ] CSV/JSON data import capability
- [ ] Export to Excel/CSV for all tables
- [ ] Advanced filters (date ranges, status groups, custom)
- [ ] Real-time search with result highlighting
- [ ] Pagination with infinite scroll toggle
- [ ] Column sorting on table headers

**Analytics/Reporting Missing:**

- [ ] Interactive charts with drill-down
- [ ] Time-series project progress chart
- [ ] Budget forecast with trend lines
- [ ] Team utilization heatmaps
- [ ] NPS feedback trend analysis
- [ ] Milestone Gantt charts
- [ ] Burn-down sprint charts
- [ ] Velocity team charts
- [ ] Client satisfaction trends
- [ ] Custom dashboard widget builder

### 3.2 Real-time Features

**Tasks:**

- [ ] **WebSocket/SSE implementation**
  - Verify connection stability
  - Test reconnection logic
  - Measure latency (<3s required)
- [ ] **Notifications updates real-time**
  - Client gets instant notification of new items
  - Unread count updates immediately
  - Sound/visual indicators
- [ ] **Live collaboration in messages**
  - Show typing indicators
  - Online/offline status
  - Live message delivery status
- [ ] **Real-time task status sync**
  - Team member updates visible immediately
  - Conflict detection if edited simultaneously
  - Last-write-wins or merge strategy
- [ ] **Meeting auto-join countdown**
  - Show "meeting starts in 5 mins" warning
  - Auto-open meeting room at start time
  - Notification and visual indicators
- [ ] **Budget live updates**
  - Time logs instantly update budget
  - Budget bar updates in real-time
  - Overage warnings
- [ ] **Search as-you-type**
  - Debounced search queries
  - Show results with highlighting
  - Filter options displayed
- [ ] **Online status indicators**
  - Show who's currently online
  - Display last seen time
  - Presence in collaborative areas

---

## 4. Business Engines — Feature Completeness

### 4.1 Strategy Engine

**Current State:**

- Basic CRUD exists
- Dashboard home shows OKR progress
- Vision/mission/values storage works

**Still Missing:**

- [ ] **Vision Builder wizard** (multi-step form)
  - Step 1: Problem & solution
  - Step 2: Market & target
  - Step 3: Competitive advantage
  - Step 4: 3-year vision
  - Export to PDF
- [ ] **Business Model Canvas generator**
  - 9-box canvas editor
  - Visual layout
  - Export as image/PDF
- [ ] **ICP (Ideal Customer Profile) Profiler**
  - Multi-persona support
  - Buyer journey mapping
  - Decision criteria tracking
- [ ] **Market Gap Analyzer**
  - Competitor analysis matrix
  - Market opportunity scoring
  - Trend monitoring
- [ ] **OKR reminders & notifications**
  - Weekly progress reminders
  - Monthly review notifications
  - Quarterly reset alerts
  - Scheduled task creation

**Implementation Notes:**

- Use MongoDB collections: Vision, Canvas, ICP, OKR
- API endpoints: `/api/business/strategy/*`
- Notifications via existing notifications-bus

### 4.2 Product Engine

**Current State:**

- RICE scoring basic structure exists
- Sprint planner scaffold present
- Some alignment tracking

**Still Missing:**

- [ ] **MVP Validator**
  - Core assumptions list
  - Validation experiments tracker
  - Success metrics definition
  - Pivot/stay decision workflow
- [ ] **Feature Scoring Matrix automation**
  - RICE editing (see Section 2.3)
  - MoSCoW categorization option
  - Auto-calculation of scores
  - Leaderboard of top features
- [ ] **Sprint Planner integration**
  - Create sprints (name, start/end date)
  - Assign features to sprint
  - Sprint burndown chart
  - Sprint velocity tracking
- [ ] **Tech-Business Alignment monitor**
  - Map technical debt to business impact
  - Prioritize paydown vs feature work
  - Trend analysis

**Implementation Notes:**

- Expand Feature schema with MVP/sprint/alignment fields
- Add Sprint collection
- API endpoints: `/api/business/product/*`

### 4.3 Revenue Engine

**Current State:**

- CAC/LTV calculator exists
- Basic dashboard cards present

**Still Missing:**

- [ ] **Dynamic Pricing Simulator**
  - Multiple pricing tiers
  - Volume-based discounts
  - Scenario comparison
  - Revenue impact calculator
- [ ] **Revenue Model Builder**
  - Per-seat vs usage-based vs hybrid
  - Contract terms and MRR estimation
  - Customer segmentation pricing
- [ ] **CAC/LTV calculator enhancement**
  - Interactive inputs (add/remove cohorts)
  - Payback period calculation
  - Lifetime value projections
  - Segment-specific CAC/LTV
- [ ] **Break-even Analyzer**
  - Fixed vs variable cost breakdown
  - Unit economics visualization
  - Sensitivity analysis
  - Time to break-even chart
- [ ] **Forecast Engine**
  - Multi-scenario forecasts (conservative/base/optimistic)
  - Exportable charts
  - Monthly/quarterly projections
  - Currency selection

**Implementation Notes:**

- Add PricingScenario, RevenueProjection, Cohort models
- API endpoints: `/api/business/revenue/*`
- Charts use recharts

### 4.4 Marketing Engine

**Current State:**

- Basic structure scaffold present
- Dashboard home shows funnel steps

**Still Missing:**

- [ ] **GTM (Go-To-Market) Planner**
  - Market segments definition
  - Positioning statement
  - Launch timeline
  - Channel strategy matrix
- [ ] **Funnel Analyzer**
  - Define funnel stages (awareness → consideration → decision → retention)
  - Stage conversion rates
  - Drop-off analysis
  - Cohort analysis
- [ ] **Growth Experiment Tracker**
  - Hypothesis form
  - Experiment variants
  - Success metrics
  - Results logging
  - Attachment to features/OKRs
- [ ] **PMF (Product-Market Fit) Scoring System**
  - Customer interviews log
  - Scoring rubric
  - Timeline to PMF prediction
  - Pivot signals
- [ ] **Content ROI Tracker**
  - Content inventory (blog, video, etc.)
  - Performance metrics per piece
  - Attribution to conversions
  - ROI calculation

**Implementation Notes:**

- Add Funnel, Experiment, Content, PMF models
- Consider GA/Segment integration for analytics
- API endpoints: `/api/business/marketing/*`

### 4.5 Operations Engine

**Current State:**

- Basic CRUD scaffold exists
- Dashboard home shows metrics

**Still Missing:**

- [ ] **SOP (Standard Operating Procedure) Builder**
  - Template library
  - Step-by-step procedure editor
  - Media attachment (docs, videos)
  - Version control
  - Publish/review workflow
- [ ] **Workflow Visualizer**
  - Drag-and-drop workflow builder
  - Connect steps and decision points
  - Trigger/action pairs
  - Visual diagram export
- [ ] **Org Structure Designer**
  - Hierarchical org chart
  - Role definition per position
  - Responsibility matrix
  - Export org chart
- [ ] **Efficiency Heatmap**
  - Process bottleneck analysis
  - Time tracking per step
  - Parallelization opportunities
  - Cost per process

**Implementation Notes:**

- Add SOP, Workflow, Role, OrgChart models
- Consider basic webhook/trigger support
- API endpoints: `/api/business/operations/*`

### 4.6 Legal Engine

**Current State:**

- Basic CRUD structure exists
- Cap table, agreements, compliance tracking present
- Dashboard shows compliance items and risks

**Still Missing:**

- [ ] **Legal Checklist Tracker enhancement**
  - Pre-defined checklists (incorporation, IP, employment)
  - Checkbox completion states
  - Document attachment
  - Deadline tracking
  - Legal counsel assignment
- [ ] **Cap Table Manager enhancement**
  - Investor detail tracking
  - Liquidity event modeling
  - Dilution calculator
  - Historical version tracking
- [ ] **Compliance Monitor enhancement**
  - Compliance calendar
  - Document expiration alerts
  - Renewal tracking
  - Audit trail
- [ ] **Risk Alert Engine**
  - Risk registry
  - Impact/probability matrix
  - Mitigation plans
  - Risk escalation workflow

**Implementation Notes:**

- Enhance existing Legal, Agreement, CapTable models
- Add RBAC restrictions (sensitive data)
- API endpoints: `/api/business/legal/*`
- Audit logging critical for this engine

### 4.7 Fundraising Engine

**Current State:**

- Pitch, valuation, investor CRM, deal pipeline exist
- Dashboard shows investor interactions and pipeline

**Still Missing:**

- [ ] **Pitch Builder enhancement**
  - Guided wizard format
  - Deck outline generation
  - Narrative templates
  - Elevator pitch generator
- [ ] **Valuation Calculator enhancement**
  - Multiple valuation methods (DCF, comparable, startup stage formula)
  - Sensitivity analysis
  - Historical valuation tracking
- [ ] **Investor CRM workflow**
  - Contact enrichment
  - Interaction history timeline
  - Email/call logging
  - Meeting preparation templates
  - Follow-up reminders
- [ ] **Fundraising Pipeline Tracker**
  - Deal stages (prospecting, pitch, due diligence, LOI, closed)
  - Probability weighted pipeline
  - Deal size estimation
  - Timeline tracking

**Implementation Notes:**

- Enhance Pitch, Valuation, Investor, Deal models
- API endpoints: `/api/business/fundraising/*`
- Integrate with cap table and financial models

---

## 5. Real-time & Notifications

### 5.1 WebSocket/SSE Implementation

**Current State:**

- `lib/notifications-bus.ts` and `lib/notifications-service.ts` exist
- Need to verify delivery time and reliability

**Tasks:**

- [ ] **Audit current real-time system**
  - Check if using WebSocket or SSE
  - Measure latency in production
  - Test reconnection scenarios
  - Verify message ordering
- [ ] **Latency optimization**
  - Target <3 seconds for cross-panel updates
  - Implement batching if needed
  - Reduce payload size
  - Add compression
- [ ] **Reconnection handling**
  - Exponential backoff on reconnection attempts
  - Queue messages while offline
  - Replay queued messages on reconnect
  - User notification of connection state
- [ ] **Fallback to polling**
  - For browsers/networks that don't support WebSocket
  - Implement smart polling intervals
  - Detect when to switch back to WebSocket

### 5.2 Cross-Panel Event Distribution

**Tasks:**

- [ ] **Admin → Client events**
  - Task assignment notification to client
  - Project milestone update
  - Document shared
  - Meeting scheduled
  - Budget changed
- [ ] **Client → Admin events**
  - Team member created
  - Feedback submitted
  - Meeting attendance confirmed
  - Deliverable completed
  - Budget milestone reached
- [ ] **Business engine events**
  - OKR progress updated
  - Feature scored
  - Experiment result logged
  - Fundraising milestone
  - Risk escalated

**Implementation Notes:**

- Extend notifications-bus with business engine event types
- Add event filtering per user/role
- Ensure RBAC applies to visible events

---

## 6. API & Data Consistency

### 6.1 Schema Standardization

**Current Issues:**

- Mixed date field names (createdAt vs createdDate, updatedAt vs updatedDate)
- Field name inconsistencies across models
- Missing fields referenced in queries

**Tasks:**

- [ ] **Audit all mongoose schemas**
  - Document all date fields and naming pattern
  - Check for typos or inconsistencies
  - List all fields by model
- [x] **Create date field standard**
  - Decision: use createdAt, updatedAt consistently
  - Apply across all models
  - Add migration script for existing data
- [ ] **Fix all API queries**
  - Replace all createdDate with createdAt (or chosen standard)
  - Replace all date references
  - Add null-safety checks
- [ ] **Fix dashboard queries**
  - Update analytics API
  - Update admin dashboard queries
  - Update client dashboard queries
- [ ] **Add missing schema fields**
  - deadline vs endDate - standardize
  - Add any missing required fields
  - Document schema in comments

### 6.2 API Response Consistency

**Tasks:**

- [x] **Standardize error responses**
  - All errors return {error: string, code: string, status: number}
  - Consistent HTTP status codes
  - No data in error responses unless required
- [x] **Standardize success responses**
  - Format: {success: true, data: T, message?: string}
  - Consistent pagination for lists
  - Include total count for lists
- [ ] **Add API versioning**
  - Plan for v1 vs v2 endpoints
  - Document deprecation path
  - Support at least 1 version back
- [x] **Add request validation**
  - Use Zod schemas for all inputs
  - Validate before processing
  - Return validation errors in standard format
- [ ] **Add response documentation**
  - JSDoc comments for all endpoints
  - Example requests/responses
  - Error cases documented

### 6.3 Data Migration Strategy

**Tasks:**

- [ ] **Create migration framework**
  - Timestamp each migration
  - Create rollback scripts
  - Test migrations on dev first
- [ ] **Document data model changes**
  - Before/after comparison
  - Business logic for data transformation
  - Validation rules for new data
- [ ] **Schedule production migrations**
  - Off-peak windows only
  - Backup before migration
  - Monitor for errors
  - Rollback plan ready

---

## 7. RBAC & Permissions

### 7.1 Permission Model Completion

**Current State:**

- Basic roles exist (admin, project_manager, business_head, lead_architect, developer, client)
- Some permission checks in place
- Not consistently enforced across all endpoints

**Tasks:**

- [ ] **Define permission matrix**
  - Create table: Role × Resource × Action (read, create, update, delete)
  - Include business engines and admin sections
  - Define team/project-scoped permissions
  - Document inheritance rules
- [ ] **Admin permissions**
  - [ ] Create/read/update/delete any resource
  - [ ] Assign roles to users
  - [ ] View audit logs
  - [ ] Modify system settings
- [ ] **Project Manager permissions**
  - [ ] Full control over assigned projects
  - [ ] Create/manage tasks within project
  - [ ] Access analytics for project
  - [ ] Invite team members to project
- [ ] **Business Head permissions**
  - [ ] Create/edit business engine items
  - [ ] View cross-project metrics
  - [ ] Generate reports
  - [ ] Invite collaborators
- [ ] **Developer permissions**
  - [ ] Read tasks and projects
  - [ ] Update own tasks
  - [ ] View project documentation
  - [ ] Submit code/deliverables
- [ ] **Client permissions**
  - [ ] View own projects
  - [ ] View project-specific tasks
  - [ ] Submit feedback
  - [ ] Attend meetings
  - [ ] Cannot view other clients' data

### 7.2 Enforce RBAC Across APIs

**Tasks:**

- [x] **Audit all API endpoints**
  - List all endpoints
  - Document required role for each
  - Check current permission enforcement
  - Identify gaps
- [x] **Implement permission middleware**
  - Create reusable middleware function
  - Check user role/permissions
  - Return 403 if insufficient permissions
  - Log permission denials
- [x] **Add permission checks to critical endpoints**
  - Start with: auth, users, finance, admin operations
  - Then: projects, tasks, documents
  - Then: business engines, reports
- [ ] **Team/Project scoping**
  - Users can only see their team's projects
  - Clients can only see projects assigned to them
  - Managers can see projects they manage
  - Admins see everything
- [ ] **Cross-panel access control**
  - Ensure clients can't access admin routes
  - Ensure admin can access their data via client panel
  - Prevent role escalation

### 7.3 Permission Caching & Performance

**Tasks:**

- [ ] **Cache user permissions**
  - Store in session/token
  - Refresh on role change
  - 1-hour TTL minimum
- [ ] **Optimize permission checks**
  - Batch permission queries
  - Use indexes on role/org fields
  - Avoid N+1 permission lookups

---

## 8. Audit Logging

### 8.1 Comprehensive Audit Trail

**Current State:**

- Logging exists for auth, tasks, projects, meetings, business engines, and admin notifications/events
- Coverage is still partial and not comprehensive across all resources/actions

**Tasks:**

- [x] **Create audit log schema**
  - Fields: userId, action, resource, resourceId, timestamp, changes, ipAddress, userAgent
  - Store old value and new value for updates
  - Include reason/notes field
- [ ] **Implement audit logging for:**
  - [ ] **Auth**: login attempts, logout, password changes, session creation/destruction
  - [ ] **Users**: create, role change, deactivate, permission grant/revoke
  - [ ] **Projects**: create, update, archive, delete, team member add/remove
  - [ ] **Tasks**: create, assign, status change, comment, delete
  - [ ] **Documents**: upload, delete, share, version changes
  - [ ] **Business engines**: all CRUD operations per engine
  - [ ] **Meetings**: create, invite, attendee update, cancel
  - [ ] **Admin actions**: setting changes, system operations
- [ ] **Add audit log queries**
  - [x] List audit logs with filtering (date, user, action, resource)
  - [x] Export audit logs (CSV)
  - [ ] Search audit logs
  - [ ] Archive old logs
- [x] **Admin audit log viewer**
  - Page at `/admin/audit-logs`
  - Filter by user, date, action type
  - Show details modal per log entry
  - Export functionality
- [ ] **User audit trail**
  - Per-user audit history
  - Time travel: show state at any point in time
  - Undo capability where appropriate
  - Change attribution

### 8.2 Sensitive Operations Logging

**Tasks:**

- [ ] **Financial transaction logging**
  - Log all invoice/payment actions
  - Include amounts and approval
- [ ] **Permission changes logging**
  - Who granted/revoked what permission
  - Effective timestamp
  - Reason field
- [ ] **Sensitive data access logging**
  - Cap table access
  - Investor information access
  - Legal documents access
- [ ] **System admin actions**
  - Database backups
  - Settings modifications
  - API key rotations

---

## 9. Testing & Quality

### 9.1 Unit Tests

**Tasks:**

- [ ] **Test auth functions**
  - Password hashing and verification
  - Session creation and validation
  - Token expiration
- [ ] **Test permission checks**
  - User can access own resources
  - User cannot access others' resources
  - Role-based permission enforcement
- [ ] **Test business engine calculations**
  - RICE score calculation
  - CAC/LTV formulas
  - Breakeven point
  - Revenue projections
- [ ] **Test data validation**
  - Input sanitization
  - Required field validation
  - Format validation (email, dates, etc.)

### 9.2 Integration Tests

**Tasks:**

- [ ] **Test cross-panel workflows**
  - Admin creates project → Client sees it
  - Client books meeting → Admin notification received
  - Admin assigns task → Client receives notification
  - All within <3 second latency
- [ ] **Test API consistency**
  - Error responses consistent format
  - Success responses consistent format
  - Pagination works correctly
  - Filters work correctly
- [ ] **Test RBAC enforcement**
  - Client cannot access admin endpoints
  - Developer cannot modify other projects
  - Manager can only see own projects
  - Admin sees all data
- [ ] **Test data migrations**
  - Old data accessible after migration
  - New data uses new schema
  - No data loss
  - Rollback works

### 9.3 End-to-End Tests

**Tasks:**

- [ ] **Test user journey: Admin**
  - Login with credentials
  - View dashboard
  - Create project
  - Assign task to team member
  - View analytics
  - Use business engines
- [ ] **Test user journey: Client**
  - Login with credentials
  - View assigned projects
  - View tasks and status
  - Create team members
  - Book meeting
  - Submit feedback
- [ ] **Test real-time updates**
  - Admin updates task → Client sees update within 3s
  - Client creates team member → Admin sees in project
  - Business engine update → All users see metric changes
- [ ] **Test error scenarios**
  - Network timeout handling
  - Permission denied
  - Invalid data submission
  - Concurrent edits

### 9.4 Performance Testing

**Tasks:**

- [ ] **Load testing**
  - Simulate 100+ concurrent users
  - Monitor API response times
  - Check database query performance
  - Identify bottlenecks
- [ ] **Latency testing**
  - Measure real-time event delivery
  - Network latency impact
  - Database query latency
  - API endpoint latency
- [ ] **Memory profiling**
  - Check for memory leaks
  - Monitor client-side memory usage
  - Server-side memory under load
- [ ] **Database optimization**
  - Add indexes for common queries
  - Optimize slow queries
  - Consider denormalization for dashboards
  - Archive old data strategy

### 9.5 Security Testing

**Tasks:**

- [ ] **Penetration testing**
  - Test for SQL injection
  - Test for XSS vulnerabilities
  - Test for CSRF vulnerabilities
  - Test authentication bypass
- [ ] **Authorization testing**
  - Attempt to access unauthorized resources
  - Test role privilege escalation
  - Test token manipulation
  - Test session hijacking
- [ ] **Data privacy testing**
  - Verify PII is not logged
  - Check data isolation between orgs
  - Verify encryption where needed
  - Test data retention policies

### 9.6 Browser Compatibility

**Tasks:**

- [ ] **Test on major browsers**
  - Chrome (latest 2 versions)
  - Firefox (latest 2 versions)
  - Safari (latest 2 versions)
  - Edge (latest 2 versions)
- [ ] **Test responsive design**
  - Desktop (1920x1080)
  - Laptop (1366x768)
  - Tablet (768x1024)
  - Mobile (375x667)
- [ ] **Test accessibility**
  - Keyboard navigation
  - Screen reader compatibility
  - Color contrast ratios
  - Focus indicators

---

## Implementation Priority & Timeline

### Phase 1: Critical (Weeks 1-3)

- [x] Remove mock authentication (Section 1.1)
- [x] Unify auth system (Section 1.2)
- [ ] Fix schema/data inconsistencies (Section 6.1)
- [ ] Implement audit logging for critical operations (Section 8.1)
- [x] Add RBAC enforcement to APIs (Section 7.2)

### Phase 2: Important (Weeks 4-6)

- [ ] Complete permission matrix (Section 7.1)
- [x] Fix all dashboard queries (Section 2.2)
- [ ] Enhance real-time system (Section 5.1)
- [x] Business engine RICE widget (Section 2.3)
- [x] Comprehensive API validation (Section 6.2)

### Phase 3: Enhancement (Weeks 7-12)

- [ ] Strategy engine completeness (Section 4.1)
- [ ] Product engine completeness (Section 4.2)
- [ ] Revenue engine completeness (Section 4.3)
- [ ] Marketing engine completeness (Section 4.4)
- [ ] Operations engine completeness (Section 4.5)
- [ ] Legal engine completeness (Section 4.6)
- [ ] Fundraising engine completeness (Section 4.7)

### Phase 4: Client Panel (Weeks 13-15)

- [ ] UX/UI enhancements (Section 3.1)
- [ ] Data & forms features (Section 3.1)
- [ ] Analytics & reporting (Section 3.1)
- [ ] Real-time features (Section 3.2)

### Phase 5: Testing & Optimization (Weeks 16+)

- [ ] Unit tests (Section 9.1)
- [ ] Integration tests (Section 9.2)
- [ ] End-to-end tests (Section 9.3)
- [ ] Performance testing (Section 9.4)
- [ ] Security testing (Section 9.5)
- [ ] Browser compatibility (Section 9.6)

---

## Quick Reference: Existing Code Locations

### Auth & Session

- `lib/auth.ts` - Auth utilities (mock auth to fix)
- `app/auth/login/page.tsx` - Login page (demo credentials to remove)
- `app/api/seed/route.ts` - Seed endpoint (demo data)
- `lib/db.ts` - Database utilities

### Admin Panel

- `app/admin/dashboard/page.tsx` - Dashboard
- `app/admin/task-scheduling/page.tsx` - Task scheduling (NextAuth to replace)
- `app/admin/task-review/page.tsx` - Task review (NextAuth to replace)
- `app/admin/business/*` - Business engines

### Client Panel

- `app/client/*` - Client interface
- `app/client/dashboard/page.tsx` - Client dashboard

### Business Engines

- `app/admin/business/page.tsx` - Business home
- `app/admin/business/strategy/page.tsx` - Strategy engine
- `app/admin/business/product/page.tsx` - Product engine
- `app/admin/business/revenue/page.tsx` - Revenue engine
- `app/admin/business/marketing/page.tsx` - Marketing engine
- `app/admin/business/operations/page.tsx` - Operations engine
- `app/admin/business/legal/page.tsx` - Legal engine
- `app/admin/business/fundraising/page.tsx` - Fundraising engine

### APIs

- `app/api/admin/*` - Admin endpoints
- `app/api/business/*` - Business engine endpoints
- `app/api/analytics/*` - Analytics
- `app/api/dashboard` - Dashboard data
- `app/api/auth/*` - Auth endpoints

### Utilities

- `lib/notifications-bus.ts` - Event notification system
- `lib/notifications-service.ts` - Notification service
- `lib/rbac.ts` - RBAC utilities
- `lib/export-client.ts` - Export utilities
- `components/protected-route.tsx` - Protected route wrapper

### Database

- `prisma/schema.prisma` - Data schema
- `lib/db.ts` - Database operations

---

## Success Criteria

This roadmap is complete when:

1. ✅ All authentication uses bcrypt, no hardcoded passwords anywhere
2. ✅ All admin pages use same auth system (no NextAuth inconsistency)
3. ✅ Dashboard queries use correct schema fields without errors
4. ✅ RBAC enforced on all sensitive endpoints
5. ✅ Comprehensive audit logs for cross-panel and admin actions
6. ✅ All business engines have full CRUD + key features
7. ✅ Real-time sync working <3 seconds across panels
8. ✅ Unit, integration, and E2E tests passing
9. ✅ Zero mock data in production code
10. ✅ Security audit passed (no SQL injection, XSS, unauthorized access)

---

## Key Metrics to Track

- **Security**: 0 vulnerabilities in code scan results
- **Performance**: API response time <500ms (p95)
- **Real-time**: Event delivery <3 seconds
- **Test Coverage**: >80% for critical paths
- **Audit Completeness**: 100% of sensitive operations logged
- **RBAC Enforcement**: 100% of APIs validated

---

**Document Status:** Complete & Authoritative  
**Next Review:** After Phase 1 completion  
**Owner:** Development Team  
**Last Updated:** March 20, 2026 (IST)
