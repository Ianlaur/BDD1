# Functional Specification Document
**Loft Project**  
Version: 1.0  
Date: November 19, 2025  
Status: Active  
Related Documents: [Product Requirements Document (PRD) v1.0](./PRD.md)  
Author: Project Documentation Agent

---

## 1. Overview

### 1.1 Purpose
This Functional Specification describes the behavior of the Association Connect Platform from a user and functional perspective. It translates the [Product Requirements Document (PRD)](./PRD.md) into functional behaviors, user interactions, validation rules, and acceptance criteria to guide implementation and testing.

### 1.2 Scope
Covers functional aspects including:
- User authentication & authorization
- Student and association profile management
- Association discovery and membership workflows
- Event creation, management, and registration
- Content publishing and news feed
- Messaging and notifications
- Administrative functions and dashboards

### 1.3 Audience
- Software Engineers
- QA Engineers
- Product Managers
- UX/UI Designers
- Stakeholders

### 1.4 System Context
Web app built with Next.js (document references Next.js 15), hosted on Vercel, using Neon PostgreSQL. Primary user types: Students and Associations; System Admin role for platform management.

*See [PRD - Technology Stack](./PRD.md#51-technology-stack) for complete technical architecture and [PRD - Database Schema](./PRD.md#54-database-schema) for data models.*

---

## 2. Actors and Roles

*These roles align with the user personas defined in [PRD - User Personas](./PRD.md#2-user-personas).*

### 2.1 Actor Definitions

#### 2.1.1 Guest User (Unauthenticated)
Capabilities:
- View landing page, public association listings, public event info
- Access sign-up/login pages

Restrictions:
- Cannot join associations, register for events, send messages, or create content

#### 2.1.2 Student
Capabilities:
- All Guest capabilities plus profile management, browse associations, request membership, register for events, messaging, notifications, view attendance

Restrictions:
- Cannot create associations, approve membership requests, create events/posts, or access association management dashboard

#### 2.1.3 Association Member
Capabilities:
- All Student capabilities plus view member lists and association-specific content

Restrictions:
- Cannot approve/reject membership, create/edit events/posts, or modify association profile

#### 2.1.4 Association Admin
Capabilities:
- Manage association profile, approve/reject membership, create/edit/delete events and posts, remove members, view association analytics and settings

Restrictions:
- Cannot verify own association (requires System Admin) or access other associations' dashboards

#### 2.1.5 System Administrator
Capabilities:
- Full system access: user management, association verification, content moderation, system monitoring, announcements, settings

Restrictions:
- Must follow data privacy regulations; actions are logged for audit

### 2.2 Role Hierarchy
System Administrator > Association Admin > Association Member > Student > Guest

### 2.3 Role Transition Rules
- Guest → Student: registration, email verification, profile creation
- Student → Association Member: request + admin approval
- Association Member → Association Admin: manual assignment (future)
- Any Role → System Administrator: manual assignment by existing SysAdmin

---

## 3. User Flows

### 3.1 Authentication Flows

*These flows implement the requirements from [PRD - Authentication System](./PRD.md#31-authentication-system).*

#### 3.1.1 User Registration (Email/Password)
Form fields: email, password (min 8 chars), confirm password, user type (Student/Association), TOS checkbox.  
Validation: email format/uniqueness, password requirements, matching passwords, TOS accepted.  
Success: bcrypt password hash (salt rounds ≥ 10), create User + profile, send verification email (future), create JWT session, redirect to profile completion.  
Failures: inline validation errors; rate limiting for repeated failures.

Alternate flows: email already exists, password too weak.

#### 3.1.2 User Registration (Google OAuth)
Flow: Google consent → verify token → create/link user → create session → redirect.  
Handles new user, existing user, cancellation and errors.

#### 3.1.3 User Login (Email/Password)
Fields: email, password, "Remember me".  
Validation: bcrypt compare, account status.  
Success: create JWT session (7 days if remember, otherwise 24 hours), update last login, redirect to dashboard.  
Failures: generic "Invalid email or password", log failed attempts, rate limit after 5 failures.

#### 3.1.4 Session Management
- Store JWT in HTTP-only, secure cookie; SameSite=Lax.
- Validate token on protected routes; refresh before expiry (sliding window).
- Logout: clear cookie, invalidate token server-side (future).

---

### 3.2 Student Profile Management

*Implements [PRD - Student Profiles](./PRD.md#321-student-profiles) requirements.*

#### 3.2.1 Profile Creation (First Time)
Fields: profile picture (optional), display name, bio, major, graduation year, interests/tags.  
Validation: display name 2–50 chars, bio ≤ 500 chars, graduation year current..+10 years, image types & sizes.  
Success: update StudentProfile, resize/upload image, mark profile complete, redirect to discovery. Skip option available.

#### 3.2.2 Profile Editing
Pre-filled form, same validation. Use optimistic locking for concurrent edits. Notify on success or no-changes.

#### 3.2.3 Profile Viewing
- Own profile: full info, edit button, joined associations, attendance history.
- Other students: public fields only per privacy settings, "Send Message" (future) if permitted.

---

### 3.3 Association Discovery and Joining

*Implements [PRD - Association Discovery & Search](./PRD.md#33-association-discovery--search) and [PRD - Design System](./PRD.md#41-design-system) requirements.*

#### 3.3.1 Browse Associations
Grid of association cards (responsive 1–4 columns) showing logo, name, description (truncated), category, member count, join button, verification badge. Sorted by member count by default; paginate after 24 items; lazy load images.

Card interactions: hover scale and shadow; click to detail; join triggers join flow.

#### 3.3.2 Search & Filtering
- Debounced (300ms) search across name, description, category; case-insensitive partial matching.
- Category chips (multi-select OR logic).
- Combined search + filters use AND logic.
- No-results message and clear filters option.

#### 3.3.3 Association Detail View
Sections: header (logo, name, badges, join button, links), about, events (upcoming 5), recent posts (3), members (sample avatars when member). Join button states: Not Joined / Pending / Joined.

#### 3.3.4 Join Association Flow
- Requires authentication, not already member/pending, and association accepting members.
- On request: create Membership(status=PENDING), notify admins, optimistic UI update to "Request Pending".

*See also [Section 3.6.1 - Membership Approval](#361-view-members-association-admin) and [PRD - Membership Request Flow](./PRD.md#64-membership-request-flow).*

#### 3.3.5 Membership Approval (Association Side)
Admin dashboard lists pending requests with approve/reject actions. Approve → Membership.ACTIVE, joinedAt timestamp, increment member count, notify student. Reject → Membership.REJECTED, notify student; option to include reason.

Bulk actions planned (future).

---

### 3.4 Event Management

*Implements [PRD - Event Management](./PRD.md#35-event-management) requirements. See also [PRD - Event Creation Flow](./PRD.md#63-event-creation--attendance-flow).*

#### 3.4.1 Event Creation (Association Admin)
Fields: title, description, image, date/time, location/virtual link, capacity, registration deadline, require approval, status (Draft/Published), visibility.  
Validation: title 5–200 chars, description 20–2000, start ≥ 1 hour in future, capacity 1–10000, image constraints.  
Success (Published): create Event, upload/optimize image, notify members, redirect to event detail.  
Success (Draft): save as draft without notifications.

#### 3.4.2 Event Editing
Pre-filled form, same validations. Significant changes (date/time/location) trigger attendee notifications; minor changes do not.

#### 3.4.3 Event Registration (Student)
Requires authentication and published event with open registration and capacity available. On register → EventRegistration(CONFIRMED), increment count, notify association, UI updates. States: CONFIRMED, WAITLIST (future), CANCELLED, ATTENDED, NO_SHOW.

#### 3.4.4 Cancel Registration
Confirmation modal; on cancel → set status=CANCELLED, decrement count, revert button. Allowed up to 1 hour before event start.

#### 3.4.5 Event Cancellation (Association Admin)
Confirmation modal with optional reason. On confirm → Event.status=CANCELLED, notify all registered attendees, update registrations to CANCELLED, display "CANCELLED" badge and reason.

---

### 3.5 Post Management

*Implements [PRD - News Feed & Posts](./PRD.md#36-news-feed--posts) requirements.*

#### 3.5.1 Create Post (Association Admin)
Fields: title, rich content, images (max 5), status (Draft/Published), optional scheduling.  
Validation: title 5–200 chars, content 20–5000 chars, images validated/optimized.  
Published posts notify members optionally.

Rich editor features: bold, italic, headings, lists, links, image embedding.

#### 3.5.2 Edit Post
Pre-filled form, same validation. Update timestamps; do not resend notifications by default.

#### 3.5.3 Delete Post
Confirmation modal. Prefer soft delete (status=DELETED) to retain audit trail. Provide option for hard delete.

#### 3.5.4 View Posts (Students)
Association profile shows published posts reverse-chronological, paginated after 10 posts. Post cards show title, excerpt (200 chars), first image, published date.

---

### 3.6 Membership Management

*Implements [PRD - Membership Management](./PRD.md#34-membership-management) requirements.*

#### 3.6.1 View Members (Association Admin)
Tabbed interface: Active Members, Pending Requests, (Inactive future). Active members show profile pic, name, major/year, join date, role badge, actions. Search and filters supported.

#### 3.6.2 Remove Member
Confirmation modal with optional reason. On remove → Membership.REMOVED, leftAt timestamp, cancel future event registrations, notify member, preserve historical data. Re-apply allowed after 90 days.

#### 3.6.3 Assign Member Roles
Future feature: change roles (Member/Moderator/Admin) with corresponding permissions and notifications.

---

### 3.7 Association Management Dashboard

*Implements [PRD - Association Management Dashboard](./PRD.md#39-association-management-dashboard) requirements with design specifications from [PRD - Design System](./PRD.md#41-design-system).*

#### 3.7.1 Dashboard Overview
Sections:
1. Statistics cards: total members, pending requests, total events, active members (month)
2. Quick actions: edit profile, create event/post, settings
3. Pending member requests (preview)
4. Recent events (preview)
5. Recent posts (preview)

Responsive layout and skeleton loading states. Real-time updates for pending requests and stats.

#### 3.7.2 Interactions
Real-time updates (WebSocket/polling future), responsive grid for breakpoints, optimistic updates for admin actions.

---

### 3.8 Notifications System

*Implements [PRD - Notifications](./PRD.md#372-notifications) requirements. See [PRD - Notification Types](./PRD.md#72-notification-types) for complete list.*

#### 3.8.1 Types & Triggers
Examples:
- MEMBERSHIP_REQUEST (to Association Admin)
- MEMBERSHIP_APPROVED / REJECTED (to Student)
- EVENT_CREATED / UPDATED / CANCELLED / REMINDER (to members/attendees)
- POST_CREATED (optional)
- NEW_MESSAGE (direct messaging)
- ASSOCIATION_VERIFIED (to Association Admin)

Each notification contains type, recipient, content, action link, priority, read status.

#### 3.8.2 Display
Notification bell with unread badge (cap "99+"); dropdown shows last 10 notifications; notification center page shows full list with filters, pagination, and bulk actions.

#### 3.8.3 Interactions
Automatic mark-as-read when clicked; manual and bulk mark-as-read; individual delete with 5-second undo; soft delete retained in DB.

---

### 3.9 Direct Messaging (Future)
One-on-one messaging: compose, real-time delivery (WebSocket), message threads, typing indicators, message actions (delete/report/block).

---

### 3.10 Admin Functions

*Implements [PRD - Admin Dashboard](./PRD.md#38-admin-dashboard) requirements.*

#### 3.10.1 User Management
Paginated user list with search and filters by role/status. Actions: view/edit, suspend, ban, delete, reset password, manual email verification. Suspensions require reason/duration.

#### 3.10.2 Association Verification
Admin workflow to review and verify associations; sets verified flag and notifies association. Rejection with feedback possible.

#### 3.10.3 Content Moderation
Reported content review flow: approve/remove content, warn/ban users. Proactive review for new associations and high-engagement content (future).

---

## 4. Detailed Functional Requirements

Summarized key FRs:

- FR-AUTH-001..004: Registration, login, session management, RBAC. Store JWTs in secure cookies; enforce role checks and return 403 on unauthorized actions.
- FR-PROFILE-001..003: Student and association profile creation, validation, privacy settings.
- FR-DISCOVERY-001..003: Browsing, searching, filtering associations with performance considerations (lazy load, caching).
- FR-MEMBER-001..004: Join, approve/reject, remove, leave flows with membership state transitions.
- FR-EVENT-001..005: Create, edit, cancel, register, cancel registration flows and validations.
- FR-POST-001..004: Create, edit, delete, view posts with rich text and image rules.
- FR-NOTIF-001..004: Notification creation, display, mark-as-read, delete semantics.
- FR-DASH-001: Association dashboard functionality and responsiveness.
- FR-ADMIN-001..002: Admin user and verification functions.

(Refer to earlier sections for detailed field-level validation and behaviors.)

---

## 5. Validation and Error Handling

*These validation rules enforce the security requirements from [PRD - Security Requirements](./PRD.md#53-security-requirements).*

### 5.1 Input Validation Rules
- Email: RFC 5322 format, max 254 chars, lowercase, unique.
- Password: 8–128 chars (future complexity rules).
- Display Name: 2–50 chars, alphanumeric + spaces.
- Association Name: 5–100 chars, unique.
- Description lengths: associations 50–1000, posts 20–5000.
- Dates: start at least 1 hour in future; end after start.
- Images: JPEG/PNG/WebP; profile ≤ 5MB, event ≤ 10MB; min dimensions for profile 100×100, event 400×300.

### 5.2 Error Handling Patterns
- Client-side: validate on blur & submit, inline messages.
- Server-side: always validate, return JSON with details; 400 for validation errors.
- Database errors: catch unique constraint violations and return user-friendly messages.
- Authentication errors: generic messages; rate limiting.
- Unexpected errors: HTTP 500 with generic UI message; log details.

### 5.3 Error Messages
Design principles: user-friendly, actionable, consistent. Examples:
- Success: "Profile updated successfully", "Event created and published"
- Validation: "Email is required", "Password must be at least 8 characters"
- Business: "You're already a member of this association", "Event capacity has been reached"
- Permission: "You don't have permission to perform this action"
- System: "Something went wrong. Please try again"

---

## 6. Acceptance Criteria (Selected highlights)

### 6.1 Authentication & Authorization
- Registration (email/Google) creates accounts and sessions correctly.
- Login redirects to appropriate dashboards; "Remember me" sets session length.
- 5 failed login attempts trigger temporary lock/rate limit.

### 6.2 Profile Management
- Student/association profiles must meet required fields and validations.
- Profile picture uploads validated, resized, and stored.

### 6.3 Discovery & Membership
- Associations browseable in grid; search debounced and case-insensitive; filters work with correct logic.
- Join requests create PENDING memberships and notify admins; approvals change status to ACTIVE and notify students.

### 6.4 Event Management
- Create/edit/cancel/register flows enforce validations and notify appropriate users.
- Registration respects capacity and deadlines; cancellations handled per rules.

### 6.5 Post Management
- Create/publish/draft behaviors as specified; images optimized and limited to 5 per post.

### 6.6 Notifications & Dashboard
- Notifications are created, displayed, and manageable (mark/read/delete) per spec.
- Association dashboard displays required statistics and recent items with responsive layouts.

### 6.7 Admin Functions
- Admins can manage users and verify associations; actions logged for audit.

(See detailed AC sections for full testable criteria.)

---

## 7. Assumptions, Dependencies & Constraints

*See [PRD - Technology Stack](./PRD.md#51-technology-stack) and [PRD - Technical Requirements](./PRD.md#5-technical-requirements) for complete technical context.*

### 7.1 Assumptions
- Primary users are university students; modern browsers; mobile significant usage.
- Hosting: Vercel; DB: Neon PostgreSQL.
- OAuth (Google) availability.

### 7.2 Dependencies
- External: Vercel, Neon, Google OAuth.
- Internal: Prisma schema, authentication, session management, complete profiles for some features.

### 7.3 Constraints
- Performance targets: <2s page load on 3G, API <200ms. *See [PRD - Performance Requirements](./PRD.md#52-performance-requirements).*
- Browser support: modern browsers only.
- Scalability: target 10k+ concurrent users. *See [PRD - Scalability Requirements](./PRD.md#55-scalability-requirements).*
- Regulatory: GDPR, FERPA considerations.
- Accessibility: WCAG 2.1 AA goal. *See [PRD - User Experience Principles](./PRD.md#42-user-experience-principles).*

Technology references in document: Next.js 15.x, React 19, TypeScript 5.x, Prisma 6.x, TailwindCSS 4.x, Node.js 18+.

---

## 8. Future Enhancements (Roadmap)

*Aligns with [PRD - Launch Strategy](./PRD.md#8-launch-strategy) phases.*

### Phase 2 (2–3 months)
- Direct messaging (real-time), email/push notifications, event calendar, improved search.
*See [PRD - Phase 2](./PRD.md#82-phase-2-enhanced-features).*

### Phase 3 (4–6 months)
- AI recommendations, analytics dashboard, paid event ticketing, PWA/native apps.
*See [PRD - Phase 3](./PRD.md#83-phase-3-growth--optimization).*

### Phase 4 (6–12 months)
- Multi-university support, advanced admin workflows, public API, enterprise features.
*See [PRD - Phase 4](./PRD.md#84-phase-4-enterprise-features) and [PRD - Future Considerations](./PRD.md#11-future-considerations).*

---

## 9. Glossary

### A
- **Acceptance Criteria (AC)**: Testable conditions that must be met for feature completion [See: [Section 6](#6-acceptance-criteria-selected-highlights)]
- **Actor**: User or system entity that interacts with the platform [See: [Section 2.1](#21-actor-definitions)]
- **API (Application Programming Interface)**: Programmatic interface for system interactions
- **API Route**: Next.js server-side endpoint (e.g., `/api/auth/register`)
- **Association**: Student organization, club, or group on the platform [See: [PRD §1.2](./PRD.md#12-problem-statement)]
- **Association Admin**: User role with full management permissions for an association [See: [Section 2.1.4](#214-association-admin)]
- **Association Member**: User role with limited association-specific access [See: [Section 2.1.3](#213-association-member)]
- **Association Profile**: Organization's public information and settings [See: [PRD §3.2.2](./PRD.md#322-association-profiles)]
- **Audit Trail**: Log of user actions for compliance and security
- **Authentication**: Process of verifying user identity [See: [Section 3.1](#31-authentication-flows)]
- **Authorization**: Process of granting permissions based on roles [See: [PRD §3.1](./PRD.md#31-authentication-system)]

### B
- **Badge**: Visual indicator (verification, role, status)
- **bcrypt**: Cryptographic password hashing algorithm (salt rounds ≥10) [See: [Section 3.1.1](#311-user-registration-emailpassword)]
- **Bulk Actions**: Operations on multiple items (mark read, approve members)
- **Business Logic**: Rules governing system behavior and workflows

### C
- **Capacity**: Maximum attendees allowed for an event [See: [Section 3.4.1](#341-event-creation-association-admin)]
- **CSRF (Cross-Site Request Forgery)**: Attack prevented by Next.js tokens
- **CRUD**: Create, Read, Update, Delete operations

### D
- **Dashboard**: Centralized management interface [See: [Section 3.7](#37-association-management-dashboard), [PRD §3.9](./PRD.md#39-association-management-dashboard)]
- **Dark Mode**: Low-light color scheme [See: [PRD §4.3](./PRD.md#43-dark-mode)]
- **Database Schema**: Data structure and relationships [See: [PRD §5.4](./PRD.md#54-database-schema)]
- **Debounce**: Delay technique for search input (300ms) [See: [Section 3.3.2](#332-search--filtering)]
- **Direct Messaging**: One-on-one communication feature (future) [See: [Section 3.9](#39-direct-messaging-future)]
- **Draft**: Unpublished status for events/posts [See: [Section 3.4.1](#341-event-creation-association-admin)]

### E
- **Edge Network**: Vercel's global CDN for content delivery
- **Error Handling**: System response to validation and system errors [See: [Section 5.2](#52-error-handling-patterns)]
- **Event**: Scheduled activity organized by an association [See: [Section 3.4](#34-event-management), [PRD §3.5](./PRD.md#35-event-management)]
- **Event Registration**: Student's commitment to attend event [See: [Section 3.4.3](#343-event-registration-student)]
- **EventRegistration Status**: CONFIRMED, WAITLIST, CANCELLED, ATTENDED, NO_SHOW [See: [Section 3.4.3](#343-event-registration-student)]

### F
- **FERPA**: U.S. education privacy regulation [See: [Section 7.3](#73-constraints)]
- **Filter**: Method to narrow results by criteria [See: [Section 3.3.2](#332-search--filtering)]
- **Functional Requirement (FR)**: Specific system behavior specification [See: [Section 4](#4-detailed-functional-requirements)]

### G
- **GDPR**: EU data protection regulation [See: [Section 7.3](#73-constraints)]
- **Google OAuth**: Third-party authentication via Google [See: [Section 3.1.2](#312-user-registration-google-oauth)]
- **Gradient**: Multi-color transition in UI design [See: [PRD §4.1](./PRD.md#41-design-system)]
- **Guest User**: Unauthenticated visitor with limited access [See: [Section 2.1.1](#211-guest-user-unauthenticated)]

### H
- **Hard Delete**: Permanent removal from database
- **HTTP-only Cookie**: Secure cookie inaccessible to client JavaScript [See: [Section 3.1.4](#314-session-management)]
- **HTTPS**: Encrypted HTTP protocol (enforced) [See: [PRD §5.3](./PRD.md#53-security-requirements)]

### I
- **Idempotent**: Operation that produces same result when repeated
- **Image Optimization**: Automatic compression/resizing by Next.js
- **Inline Validation**: Real-time field-level error checking [See: [Section 5.1](#51-input-validation-rules)]

### J
- **Join Request**: Student's application for association membership [See: [Section 3.3.4](#334-join-association-flow)]
- **JWT (JSON Web Token)**: Token-based session authentication [See: [Section 3.1.4](#314-session-management)]

### L
- **Lazy Loading**: Deferring resource load until needed [See: [Section 3.3.1](#331-browse-associations)]
- **Lighthouse**: Google's web performance tool (target >90)
- **LinkedIn-style**: Card-based visual layout pattern [See: [PRD §3.3](./PRD.md#33-association-discovery--search)]

### M
- **Member**: User with active association membership
- **Membership**: User-association relationship [See: [Section 3.3](#33-association-discovery-and-joining), [PRD §3.4](./PRD.md#34-membership-management)]
- **Membership Status**: PENDING, ACTIVE, REMOVED, REJECTED, INACTIVE [See: [Section 3.3.4](#334-join-association-flow)]
- **Middleware**: Next.js request interceptor (e.g., authentication check)
- **Migration**: Database schema version change (Prisma)
- **MVP (Minimum Viable Product)**: Initial feature set [See: [PRD §8.1](./PRD.md#81-phase-1-mvp-current)]

### N
- **Neon**: Serverless PostgreSQL database provider [See: [PRD §5.1](./PRD.md#51-technology-stack)]
- **Next.js**: React framework (v15.x) [See: [Section 1.4](#14-system-context)]
- **NextAuth.js**: Authentication library (v5) [See: [PRD §5.1](./PRD.md#51-technology-stack)]
- **Notification**: System message about platform activity [See: [Section 3.8](#38-notifications-system), [PRD §3.7.2](./PRD.md#372-notifications)]
- **Notification Type**: MEMBERSHIP_REQUEST, EVENT_CREATED, etc. [See: [Section 3.8.1](#381-types--triggers)]

### O
- **OAuth**: Open standard for authorization (Google, Microsoft)
- **Optimistic Locking**: Concurrency control using version checks [See: [Section 3.2.2](#322-profile-editing)]
- **Optimistic Update**: UI update before server confirmation [See: [Section 3.3.4](#334-join-association-flow)]
- **ORM (Object-Relational Mapping)**: Database abstraction (Prisma)

### P
- **Pagination**: Dividing content into pages [See: [Section 3.3.1](#331-browse-associations)]
- **Pending**: Membership/registration status awaiting approval [See: [Section 3.3.4](#334-join-association-flow)]
- **Persona**: Fictional representative user [See: [PRD §2](./PRD.md#2-user-personas)]
- **Post**: Association announcement or update [See: [Section 3.5](#35-post-management), [PRD §3.6](./PRD.md#36-news-feed--posts)]
- **PRD (Product Requirements Document)**: High-level product specification [See: [Related Documents](./PRD.md)]
- **Prisma**: TypeScript ORM (v6.x) [See: [PRD §5.1](./PRD.md#51-technology-stack)]
- **Profile**: User or association information [See: [Section 3.2](#32-student-profile-management)]
- **PWA (Progressive Web App)**: Web app with native features (future)

### R
- **Rate Limiting**: Throttling requests to prevent abuse [See: [Section 3.1.3](#313-user-login-emailpassword)]
- **RBAC (Role-Based Access Control)**: Permission model by user role [See: [Section 2](#2-actors-and-roles)]
- **React**: UI library (v19) [See: [PRD §5.1](./PRD.md#51-technology-stack)]
- **Real-time Update**: Immediate data refresh (WebSocket/polling) [See: [Section 3.7.2](#372-interactions)]
- **Registration Deadline**: Last date for event sign-up [See: [Section 3.4.1](#341-event-creation-association-admin)]
- **Responsive Design**: Adaptive UI for different screen sizes [See: [PRD §4.2](./PRD.md#42-user-experience-principles)]
- **RFC 5322**: Email address format specification [See: [Section 5.1](#51-input-validation-rules)]
- **Rich Text Editor**: Formatted text input interface [See: [Section 3.5.1](#351-create-post-association-admin)]
- **Role**: Permission level (Student, Association Admin, System Admin) [See: [Section 2](#2-actors-and-roles), [PRD §7.3](./PRD.md#73-user-roles--permissions)]
- **Role Hierarchy**: Ordered permission levels [See: [Section 2.2](#22-role-hierarchy)]

### S
- **Salt Rounds**: bcrypt hashing iterations (≥10) [See: [Section 3.1.1](#311-user-registration-emailpassword)]
- **SameSite**: Cookie attribute for CSRF protection (Lax) [See: [Section 3.1.4](#314-session-management)]
- **Search**: Finding content by keywords [See: [Section 3.3.2](#332-search--filtering)]
- **Session**: Authenticated user's active period [See: [Section 3.1.4](#314-session-management)]
- **Session Duration**: 24 hours default, 7 days with "Remember me" [See: [Section 3.1.3](#313-user-login-emailpassword)]
- **Skeleton Loading**: Placeholder UI during data fetch [See: [Section 3.7.1](#371-dashboard-overview)]
- **Sliding Window**: Session refresh mechanism [See: [Section 3.1.4](#314-session-management)]
- **Soft Delete**: Marking as deleted without removing from DB [See: [Section 3.5.3](#353-delete-post)]
- **SSO (Single Sign-On)**: Unified authentication system (future)
- **Student**: Primary user type joining associations [See: [Section 2.1.2](#212-student)]
- **Student Profile**: Extended student information [See: [Section 3.2.1](#321-profile-creation-first-time)]
- **System Administrator**: Platform-wide management role [See: [Section 2.1.5](#215-system-administrator), [PRD §3.8](./PRD.md#38-admin-dashboard)]

### T
- **TailwindCSS**: Utility-first CSS framework (v4.x) [See: [PRD §5.1](./PRD.md#51-technology-stack)]
- **Token**: Cryptographic string for authentication (JWT)
- **TOS (Terms of Service)**: Platform usage agreement
- **TypeScript**: Strongly-typed JavaScript (v5.x) [See: [PRD §5.1](./PRD.md#51-technology-stack)]

### U
- **UI/UX**: User Interface and User Experience design
- **Undo**: Reverting action (e.g., 5-second notification delete) [See: [Section 3.8.3](#383-interactions)]
- **User Flow**: Step-by-step user journey [See: [Section 3](#3-user-flows), [PRD §6](./PRD.md#6-user-flows)]

### V
- **Validation**: Input data verification [See: [Section 5.1](#51-input-validation-rules)]
- **Vercel**: Hosting and deployment platform [See: [Section 1.4](#14-system-context)]
- **Verification**: Association approval by System Admin [See: [Section 3.10.2](#3102-association-verification), [PRD §3.2.2](./PRD.md#322-association-profiles)]
- **Verification Badge**: Visual indicator of verified status [See: [Section 3.3.1](#331-browse-associations)]
- **Virtual Event**: Online event with meeting link [See: [Section 3.4.1](#341-event-creation-association-admin)]

### W
- **WCAG**: Web accessibility guidelines (2.1 AA target) [See: [Section 7.3](#73-constraints)]
- **WebSocket**: Real-time bidirectional communication protocol [See: [Section 3.7.2](#372-interactions)]
- **Workflow**: Multi-step process (e.g., approval workflow) [See: [PRD §3.4](./PRD.md#34-membership-management)]

### X
- **XSS (Cross-Site Scripting)**: Vulnerability prevented by React escaping [See: [PRD §5.3](./PRD.md#53-security-requirements)]

---

## 10. Document History

| Version | Date | Author | Changes |
|---:|---|---|---|
| 1.0 | Nov 19, 2025 | Project Documentation Agent | Initial comprehensive functional specification based on PRD v1.0 |

---

Related: Product Requirements Document (PRD) v1.0, Technical Specification (Pending), Test Plan (Pending)

