# 08 -- Complete Decision Map

> A comprehensive catalog of every decision point, checkpoint, and conditional branch across the PMTwin Construction Collaboration Platform. Organized by business flow, then by page/step. Each entry clearly separates user-facing decisions from system-level decisions.

---

## Table of Contents

1. [Flow 1: Authentication (Login)](#flow-1-authentication-login)
2. [Flow 2: User Registration](#flow-2-user-registration)
3. [Flow 3: Route Access Control](#flow-3-route-access-control)
4. [Flow 4: Opportunity Creation](#flow-4-opportunity-creation)
5. [Flow 5: Opportunity Lifecycle & Status Transitions](#flow-5-opportunity-lifecycle--status-transitions)
6. [Flow 6: Application Process](#flow-6-application-process)
7. [Flow 7: Contract & Milestone Management](#flow-7-contract--milestone-management)
8. [Flow 8: Matching Engine](#flow-8-matching-engine)
9. [Flow 9: Opportunity Browsing & Filtering](#flow-9-opportunity-browsing--filtering)
10. [Flow 10: Find / Discovery (Public + Authenticated)](#flow-10-find--discovery-public--authenticated)
11. [Flow 11: People & Connections](#flow-11-people--connections)
12. [Flow 12: Messaging](#flow-12-messaging)
13. [Flow 13: Notifications](#flow-13-notifications)
14. [Flow 14: Admin -- User Vetting](#flow-14-admin----user-vetting)
15. [Flow 15: Admin -- Dashboard](#flow-15-admin----dashboard)
16. [Flow 16: Admin -- Opportunity Management](#flow-16-admin----opportunity-management)
17. [Flow 17: Admin -- Settings](#flow-17-admin----settings)
18. [Flow 18: Admin -- Collaboration Models](#flow-18-admin----collaboration-models)
19. [Flow 19: Admin -- Audit Trail](#flow-19-admin----audit-trail)
20. [Flow 20: Admin -- Reports](#flow-20-admin----reports)
21. [Flow 21: Collaboration Wizard (Public)](#flow-21-collaboration-wizard-public)
22. [Flow 22: Profile Management](#flow-22-profile-management)
23. [Flow 23: Pipeline Management](#flow-23-pipeline-management)
24. [Flow 24: Data Initialization](#flow-24-data-initialization)
25. [Flow 25: Layout & Navigation](#flow-25-layout--navigation)
26. [Summary: Undocumented / Implicit Behavior](#summary-undocumented--implicit-behavior)
27. [Appendix A: All Status Machines](#appendix-a-all-status-machines)
28. [Appendix B: Role Permission Matrix](#appendix-b-role-permission-matrix)

---

## Flow 1: Authentication (Login)

**Files:** `POC/features/login/login.js`, `POC/src/core/auth/auth-service.js`

### 1.1 Login Form Submission (User Decision)

- **Page:** Login Page (`/login`)
- **Decision Question:** Does the user provide valid credentials for an accessible account?
- **Possible Outcomes:**

| #   | Condition                                          | System Behavior                                                       | Next Step                 |
| --- | -------------------------------------------------- | --------------------------------------------------------------------- | ------------------------- |
| 1   | User not found (email lookup fails)                | Throw "Invalid email or password"                                     | Stay on login, show error |
| 2   | Wrong password (hash mismatch)                     | Throw "Invalid email or password"                                     | Stay on login, show error |
| 3   | `status === 'pending'`                             | Throw "Account pending approval. Please wait for admin verification." | Stay on login, show error |
| 4   | `status === 'rejected'`                            | Throw "Account registration was rejected. Please contact support."    | Stay on login, show error |
| 5   | `status === 'suspended'`                           | Throw "Account suspended. Please contact support."                    | Stay on login, show error |
| 6   | Valid credentials + `active` or `clarification_requested` | Create session (24hr expiry), store token in `sessionStorage`, set `currentUser`, create audit log | Navigate to `/dashboard`  |

- **Backend Logic Triggered:**
  - `authService.login()` -- looks up user/company by email via `dataService.getUserOrCompanyByEmail()`
  - Compares `encodePassword(password)` hash against stored `passwordHash`
  - Creates session via `dataService.createSession()`
  - Creates audit log entry (`user_logged_in`)
  - Stores token and user JSON in `sessionStorage`

- **Failure / Exception Scenarios:**
  - No rate limiting or account lockout implemented
  - No CAPTCHA
  - Error messages are intentionally generic for user-not-found vs wrong-password (security best practice)

### 1.2 Demo Credentials Modal (User Decision)

- **Page:** Login Page
- **Decision Question:** Does the user click "View Demo Credentials"?
- **Possible Outcomes:**
  - Click -> Modal opens with list of demo accounts
  - Click a row in modal -> Auto-fills email and password fields, closes modal
- **System Check:** If `window.modalService` exists, use custom modal; otherwise fall back to browser `alert()`
- **Next Step:** User can submit the pre-filled login form

### 1.3 Session Validation (System Decision)

- **Function:** `authService.checkAuth()`
- **Trigger:** Called on every protected page load (via `authGuard`)
- **Decision Question:** Is the current session valid?
- **Checks (sequential, fail-fast):**

| #   | Check                                              | If Fails                                  |
| --- | -------------------------------------------------- | ----------------------------------------- |
| 1   | Token exists in `sessionStorage`?                  | Return `false`                            |
| 2   | Matching session exists in data store?              | Clear `sessionStorage`, return `false`    |
| 3   | User referenced by session exists?                  | Return `false`                            |
| 4   | User status is `active` or `clarification_requested`? | Return `false`                         |
| 5   | All checks pass                                     | Set `currentUser` + `currentSession`, return `true` |

- **Exception:** No active session refresh mechanism -- sessions expire after 24 hours silently

### 1.4 Logout (User Decision)

- **Decision Question:** Does the user click "Logout"?
- **Backend Logic:**
  - If session exists: delete session record, create audit log (`user_logged_out`)
  - Clear `currentUser`, `currentSession`, remove `sessionStorage` items
  - Navigate to `/login` (handled by layout service)

---

## Flow 2: User Registration

**Files:** `POC/features/register/register.js`, `POC/src/core/auth/auth-service.js`

### 2.1 Account Type Selection (User Decision)

- **Page:** Registration Step 0
- **Decision Question:** Is the user registering as a Company or Individual?
- **Possible Outcomes:**
  - `company` -- Enter Company Registration Wizard (Steps A1 through A3)
  - `individual` -- Enter Individual Registration Wizard (Steps B1 through B3)
- **System Behavior:** "Continue" button disabled until a radio option is selected
- **Next Step:** Step A1 (company) or Step B1 (individual)

### 2.2 Company Registration -- Step A1: Company Role (User Decision)

- **Page:** Registration Step A1
- **Decision Question:** What is the company's role?
- **Possible Answers:** Dropdown populated from `lookups.json -> companyRoles`
- **Conditional Sub-Decision:** If the selected role has sub-types (checked via `lookups.companyRoleSubTypes[role]`), a sub-type dropdown appears and must also be selected
- **Validation Rules:**
  - Role must be selected -- failure: "Please select a company role"
  - Sub-type must be selected if visible -- failure: "Please select a sub-type"
- **Next Step:** Step A2

### 2.3 Company Registration -- Step A2: Company Details (User Decision + System Validation)

- **Page:** Registration Step A2
- **Decision Question:** Has the user provided all required company information?
- **Validation Rules (checked sequentially):**

| #   | Field              | Validation                  | Failure Message                           |
| --- | ------------------ | --------------------------- | ----------------------------------------- |
| 1   | Company Name       | Not empty                   | "Company name is required"                |
| 2   | Email              | Not empty                   | "Email is required"                       |
| 3   | Email Verification | OTP verified                | "Please verify your email with OTP"       |
| 4   | Mobile             | Not empty                   | "Mobile is required"                      |
| 5   | Mobile Verification| OTP verified                | "Please verify your mobile with OTP"      |
| 6   | Country            | Selected                    | "Country is required"                     |
| 7   | Password           | >= 6 characters             | "Password must be at least 6 characters"  |
| 8   | Confirm Password   | Matches password            | "Passwords do not match"                  |

- **OTP Sub-Flow (inline):**
  1. User clicks "Send OTP" for email or mobile
  2. System generates 6-digit random code (`Math.floor(100000 + Math.random() * 900000)`)
  3. Code is displayed on screen (POC only -- no real email/SMS)
  4. User enters code and clicks "Verify"
  5. System compares entered code against stored code
  6. Match: Set `emailVerified`/`mobileVerified` flag, show green badge
  7. No match: Show error "Invalid code"

- **Location Sub-Flow (cascading dropdowns):**
  - Country dropdown populated from `locations.json`
  - On country change: Region dropdown populated with that country's regions
  - On region change: City dropdown populated with that region's cities

- **Next Step:** Step A3

### 2.4 Company Registration -- Step A3: Documents & Terms (User Decision + System Validation)

- **Page:** Registration Step A3
- **Decision Question:** Has the user uploaded all required documents and accepted terms?
- **Validation Rules:**

| #   | Check                    | Validation                                      | Failure Message                        |
| --- | ----------------------- | ------------------------------------------------ | -------------------------------------- |
| 1   | Required Documents      | Each required doc for selected role is uploaded   | "Please upload: [document name]"       |
| 2   | File Size               | Each file <= 5MB                                  | "File size must be under 5MB"          |
| 3   | Terms & Conditions      | Checkbox checked                                  | "You must accept the Terms & Conditions" |

- **Document Requirements:** Determined by `lookups.companyRoleDocuments[selectedRole]` -- each document marked `required: true` must be present
- **Next Step:** Submission

### 2.5 Company Registration Submission (System Decision)

- **Decision Question:** Can the company be registered?
- **System Checks:**
  - Does a company with this email already exist? If yes: "A company with this email already exists"
- **Backend Logic:** `authService.registerCompany()`
  - Creates company record with `status: 'pending'`
  - Sets `profile.type = 'company'`
  - Sets location from address fields
- **On Success:** Display "Account created successfully. Your account is pending admin approval..." + redirect to `/login` after 3 seconds
- **On Failure:** Display error message, stay on form

### 2.6 Individual Registration -- Step B1: Professional Type (User Decision)

- **Page:** Registration Step B1
- **Decision Question:** Is the individual a Professional or Consultant?
- **Possible Answers:**
  - `professional` -- Shows specialty/discipline field in Step B2
  - `consultant` -- Shows expertise area field in Step B2
- **Validation:** A radio button must be selected -- failure: "Please select Professional or Consultant"
- **Next Step:** Step B2

### 2.7 Individual Registration -- Step B2: Personal Details (User Decision + System Validation)

- **Page:** Registration Step B2
- **Decision Question:** Has the user provided all required personal information?
- **Validation Rules:**

| #   | Field              | Validation                  | Failure Message                           |
| --- | ------------------ | --------------------------- | ----------------------------------------- |
| 1   | Full Name          | Not empty                   | "Full name is required"                   |
| 2   | Email              | Not empty                   | "Email is required"                       |
| 3   | Email Verification | OTP verified                | "Please verify your email with OTP"       |
| 4   | Mobile             | Not empty                   | "Mobile is required"                      |
| 5   | Mobile Verification| OTP verified                | "Please verify your mobile with OTP"      |
| 6   | Country            | Selected                    | "Country is required"                     |
| 7   | Password           | >= 6 characters             | "Password must be at least 6 characters"  |
| 8   | Confirm Password   | Matches password            | "Passwords do not match"                  |
| 9a  | Specialty (if Professional) | Not empty            | "Discipline / Specialty is required"      |
| 9b  | Expertise (if Consultant)   | Not empty            | "Expertise area is required"              |

- **Same OTP and Location sub-flows as Company registration**

### 2.8 Individual Registration -- Step B3: Documents & Terms

- **Same pattern as Company Step A3**
- **Document requirements from:** `lookups.individualTypeDocuments[individualType]`
- **Terms checkbox required**

### 2.9 Individual Registration Submission (System Decision)

- **Decision Question:** Can the individual be registered?
- **System Checks:**
  - Does a user with this email already exist? If yes: "User with this email already exists"
- **Backend Logic:** `authService.register()`
  - Role assignment: `professional` type gets `CONFIG.ROLES.PROFESSIONAL`, `consultant` type gets `CONFIG.ROLES.CONSULTANT`
  - Creates user with `status: 'pending'`
  - Conditional field assignment: `address`, `individualType`, `specialty`, `documents`, `emailVerified`, `mobileVerified`
- **On Success:** Display success message + redirect to `/login` after 3 seconds
- **On Failure:** Display error message, stay on form

### 2.10 Implicit Behaviors

- All new registrations start with `status: 'pending'` -- no automatic approval
- No email verification link is sent (OTP verification is in-page only, for POC)
- No admin notification is explicitly triggered at registration time (admins discover pending users by polling the dashboard)

---

## Flow 3: Route Access Control

**Files:** `POC/src/core/router/auth-guard.js`, `POC/src/core/init/app-init.js`, `POC/src/core/router/router.js`

### 3.1 Public vs Protected Routes (System Decision)

- **Decision Question:** Does this route require authentication?
- **Public Routes (no auth required):**
  - `/` (Home)
  - `/login`
  - `/register`
  - `/collaboration-wizard`
  - `/knowledge-base`
  - `/collaboration-models`
  - `/find`
- **Protected Routes:** All other routes require `authService.checkAuth()` to return `true`
- **Behavior if not authenticated:** Redirect to `/login` with reason "Authentication required"

### 3.2 Admin Route Role Requirements (System Decision)

- **Decision Question:** Does the user have the required role for this admin route?

| Route                          | Required Roles                    | Additional Check               |
| ------------------------------ | --------------------------------- | ------------------------------ |
| `/admin` (dashboard)           | admin, moderator, auditor         | Auditors redirected to `/admin/audit` |
| `/admin/users`                 | admin, moderator                  | `isAdmin()` check              |
| `/admin/vetting`               | admin, moderator                  | `isAdmin()` check              |
| `/admin/opportunities`         | admin, moderator                  | `isAdmin()` check              |
| `/admin/users/:id`             | admin, moderator                  | `isAdmin()` check              |
| `/admin/audit`                 | admin, moderator, auditor         | `canAccessAdmin()` check       |
| `/admin/reports`               | admin, moderator, auditor         | `canAccessAdmin()` check       |
| `/admin/settings`              | admin only                        | `isAdmin()` check              |
| `/admin/collaboration-models`  | admin only                        | `hasRole(ADMIN)` check         |

- **Failure:** Redirect to `/dashboard`, optionally with alert "You do not have permission to access this page"

### 3.3 Route Not Found (System Decision)

- **Decision Question:** Does the requested path match any registered route?
- **If no match:** Redirect to `/` (home page)
- **Route matching:** Supports parameterized segments (e.g., `/opportunities/:id`)

### 3.4 Role Check Functions (System Decision)

| Function            | Logic                                              |
| ------------------- | -------------------------------------------------- |
| `hasRole(role)`     | Exact match: `currentUser.role === role`            |
| `hasAnyRole(roles)` | Any match: `roles.includes(currentUser.role)`       |
| `isAdmin()`         | Role is `admin` or `moderator`                      |
| `canAccessAdmin()`  | Role is `admin`, `moderator`, or `auditor`           |
| `isCompanyUser()`   | Role is `company_owner`, `company_admin`, or `company_member` |
| `isProfessional()`  | Role is `professional` or `consultant`               |

---

## Flow 4: Opportunity Creation

**Files:** `POC/features/opportunity-create/opportunity-create.js`, `POC/src/services/opportunities/opportunity-form-service.js`, `POC/src/business-logic/models/opportunity-models.js`

### 4.1 Step 1: Title & Location (User Decision + Validation)

- **Page:** Opportunity Creation Wizard -- Step 1
- **Decision Question:** Has the user provided title and location?
- **Validation Rules:**

| #   | Field    | Validation          | Failure Message                |
| --- | -------- | ------------------- | ------------------------------ |
| 1   | Title    | Not empty           | "Title is required"            |
| 2   | Country  | Selected            | "Country is required"          |
| 3   | Region   | Selected            | "Region is required"           |
| 4   | City     | Selected (conditional) | "City is required" (only if country is not `remote`) |

- **Cascading Location Dropdowns:**
  - Country -> Region -> City -> District (optional)
  - If country is `remote`: Region auto-set to "Remote", city/district disabled
- **Next Step:** Step 2

### 4.2 Step 2: Intent Selection (User Decision)

- **Decision Question:** Is this a REQUEST or an OFFER?
- **Possible Answers:**
  - `request` -- The user is seeking something (services, resources, partners)
  - `offer` -- The user is providing something
- **Validation:** One radio button must be selected -- failure: "Please select an intent (REQUEST or OFFER)"
- **Next Step:** Step 3

### 4.3 Step 3: Scope / Skills (User Decision + Validation)

- **Decision Question:** What services or skills are involved?
- **Input:** Tag-based input (comma-separated)
- **Validation:** At least one skill/service required -- failure: "At least one service/skill is required"
- **Next Step:** Step 4

### 4.4 Step 4: Collaboration Model & Sub-Model (User Decision + System Validation)

- **Decision 1:** Select category (model type) from dropdown
- **Decision 2:** Select sub-model from filtered dropdown

- **Available Models (unless admin-disabled):**

| Model Type             | Sub-Models                                    |
| ---------------------- | --------------------------------------------- |
| Project-Based          | Task-Based, Consortium, Project JV, SPV       |
| Strategic Partnership  | Strategic JV, Strategic Alliance, Mentorship  |
| Resource Pooling       | Bulk Purchasing, Equipment Sharing, Resource Sharing |
| Hiring                 | Professional Hiring, Consultant Hiring        |
| Competition            | Competition / RFP                             |

- **System Behavior:** On sub-model selection, dynamically render model-specific form fields from `opportunity-models.js`
- **Conditional Fields:** Some attributes have `conditional` configuration
  - Example: `barterOffer` field only appears when `exchangeType` is "Barter" or "Mixed"
  - Example: `condition` field only appears when `resourceType` is "Materials" or "Equipment"
- **Validation:** All attributes marked `required: true` must be filled; conditional fields only validated when their condition is active
- **Special Field Types:**
  - `currency-range`: Both min and max required
  - `tags`: Parsed from comma-separated string
  - `boolean`: Checkbox checked state
  - Long text fields (containing "description", "scope", "details", etc.): Rendered with rich text editor
- **Model Filtering:** Admin can disable/reorder models via admin collaboration model settings. Disabled models excluded from dropdown.

### 4.5 Step 5: Exchange Mode & Budget (User Decision + Validation)

- **Decision 1:** Budget range
  - Min and max amounts required
  - Min must be <= max
  - Failure: "Budget range: both minimum and maximum are required" / "minimum must be less than or equal to maximum"

- **Decision 2:** Exchange mode selection

| Mode             | Required Fields                                        | Currency Required? |
| ---------------- | ------------------------------------------------------ | ------------------ |
| `cash`           | Cash amount, payment terms                             | Yes                |
| `equity`         | Equity percentage                                      | No                 |
| `profit_sharing` | Profit split                                           | No                 |
| `barter`         | What you offer, what you need                          | No                 |
| `hybrid`         | Cash%, equity%, barter% (must total exactly 100%)      | Yes                |

- **Hybrid Mode Real-Time Validation:** Sum updates as user types; visual indicator changes from blue to green when total equals 100%
- **Agreement Checkbox:** Must be checked -- failure: "You must agree to the exchange terms to proceed"

### 4.6 Step 6: Status Selection (User Decision)

- **Decision Question:** Save as Draft or Publish?
- **Possible Answers:**
  - `draft` -- Opportunity saved, visible only to creator, no matching triggered
  - `published` -- Opportunity saved AND matching engine triggered asynchronously
- **Validation:** Must choose one -- failure: "Please choose Save as Draft or Publish"

### 4.7 Submission (System Decision)

- **Pre-check:** User must be logged in -- failure: "You must be logged in to create an opportunity"
- **Backend Logic:**
  - `opportunityService.createOpportunity()` saves to data store with all collected data
  - Exchange mode data collected per selected mode
  - If `status === 'published'`: `matchingService.findMatchesForOpportunity()` fires in background
- **On Success:** Navigate to `/opportunities`
- **On Failure:** Display error message, stay on form

---

## Flow 5: Opportunity Lifecycle & Status Transitions

**Files:** `POC/features/opportunity-detail/opportunity-detail.js`, `POC/src/services/opportunities/opportunity-service.js`

### Complete Opportunity Status Machine

```
draft ---------> published         (user publishes; triggers matching engine)
published -----> in_negotiation    (SYSTEM: auto-transition on FIRST application received)
in_negotiation -> contracted       (SYSTEM: auto-transition when an application is ACCEPTED)
contracted ----> in_execution      (owner clicks "Start Execution")
in_execution --> completed         (owner clicks "Confirm Completion"; requires ALL milestones done)
completed -----> closed            (owner clicks "Close Opportunity")

draft ----------> cancelled        (owner cancels)
published ------> cancelled        (owner cancels)
in_negotiation -> cancelled        (owner cancels)
contracted+ ----> BLOCKED          (cannot cancel; must follow contract rules)
```

### 5.1 Can User Apply? (System Decision)

- **Decision Question:** Should the "Apply" button be visible?
- **Conditions (ALL must be true):**
  1. User is logged in
  2. User is NOT the opportunity creator (`creatorId !== user.id`)
  3. Opportunity status is `published` or `in_negotiation`
  4. User has NOT already submitted an application for this opportunity
- **If any condition fails:** "Apply" button is hidden

### 5.2 Can Owner Edit? (System Decision)

- **Decision Question:** Should the "Edit" button be visible?
- **Condition:** `opportunity.status === 'draft'`
- **If false:** Edit button hidden
- **Backend:** `POC/features/opportunity-edit/opportunity-edit.js` also checks: user must be the creator OR an admin

### 5.3 Can Owner Cancel? (System Decision)

- **Decision Question:** Is cancellation allowed?
- **Condition:** Status is `draft`, `published`, or `in_negotiation`
- **Blocked If:** `contracted`, `in_execution`, `completed`, `closed`
- **Error Message:** "Cancellation is not allowed once the opportunity is contracted or in execution. Termination must follow contract rules."
- **Confirmation:** Browser `confirm()` dialog required
- **Backend:** `opportunityService.updateOpportunityStatus(id, 'cancelled')` with validation

### 5.4 Can Owner Delete? (User Decision)

- **Decision Question:** Does the user confirm deletion?
- **Availability:** Always available to owner (no status restriction in code -- potential issue)
- **Confirmation:** Browser `confirm()` dialog
- **Backend:**
  - `dataService.deleteOpportunity(id)` -- permanent deletion
  - Creates audit log entry (`opportunity_deleted`)
  - Navigate to `/opportunities`

### 5.5 Start Execution (User Decision)

- **Decision Question:** Does the owner start execution?
- **Conditions:** Status is `contracted` AND user is owner
- **Backend:**
  - Updates opportunity status to `in_execution`
  - Updates contract status to `active`
- **Next Step:** Opportunity detail page reloads with execution view

### 5.6 Confirm Completion (User Decision)

- **Decision Question:** Are all milestones done and does the owner confirm?
- **Conditions:**
  - Status is `in_execution`
  - User is owner
  - ALL milestones have `status === 'completed'` (checked: `milestones.every(m => m.status === 'completed')`)
- **Backend:** Updates opportunity status to `completed`
- **Note:** Contract status is NOT updated to `completed` here (implicit gap)

### 5.7 Close Opportunity (User Decision)

- **Decision Question:** Does the owner close the opportunity?
- **Condition:** Status is `completed` AND user is owner
- **Backend:** Updates opportunity status to `closed`

---

## Flow 6: Application Process

**File:** `POC/features/opportunity-detail/opportunity-detail.js`

### Application Status Machine

```
(new) --------> pending
pending -------> reviewing
reviewing -----> shortlisted
shortlisted ---> accepted     (triggers contract creation + opportunity status change)
shortlisted ---> rejected
pending -------> withdrawn    (defined in config, not explicitly triggered in UI)
```

### 6.1 Application Wizard Steps (User Decisions)

The wizard has up to 6 steps, with conditional step skipping:

| Step | Name                  | Required? | Condition to Show                           | Validation                         |
| ---- | --------------------- | --------- | ------------------------------------------- | ---------------------------------- |
| 1    | Opportunity Overview  | Always    | Always                                      | None (read-only)                   |
| 2    | Proposal              | Always    | Always                                      | Text not empty                     |
| 3    | Detailed Responses    | Conditional | Model has relevant attributes              | Optional (per attribute settings)  |
| 4    | Payment Preference    | Always    | Always                                      | Selection required                 |
| 5    | Task Bidding          | Conditional | `subModelType === 'task_based'`            | Bid amount + comments required     |
| 6    | Review & Submit       | Always    | Always                                      | None (review only)                 |

- **Step Skipping Logic:**
  - `getNextStep()`: Skip step 3 if no detailed responses needed; skip step 5 if not task-based
  - `getPreviousStep()`: Same skip logic in reverse

### 6.2 Application Submission (System Decision)

- **Decision Question:** Is this a new application or an update?
- **Pre-check:** User must be logged in -- failure: alert "You must be logged in to apply"
- **Create vs Update:**
  - If `isEditMode && currentApplication`: Update existing application with new proposal and responses
  - Otherwise: Create new application record

- **Auto-Status Transition on First Application:**
  - After creating a new application, system counts all applications for this opportunity
  - If count === 1 AND opportunity status === `published`: Auto-change to `in_negotiation`

- **Notifications:**
  - New application: Creator notified (`application_received`)
  - Updated application: Creator notified (`application_updated`)

- **On Success:** Page reloads to show updated state
- **On Failure:** Alert "Failed to submit application. Please try again."

### 6.3 Application Status Update by Owner (User Decision)

- **Decision Question:** What action does the owner take on this application?
- **Available Actions:** Accept, Reject, Shortlist, Review (status names used directly)
- **Confirmation:** Browser `confirm()` for each action

- **On Accept (critical chain of operations):**
  1. Update application status to `accepted`
  2. Create a Contract record with:
     - `opportunityId`, `applicationId`, `creatorId`, `contractorId`
     - `paymentMode` from opportunity's `exchangeMode`
     - `status: 'pending'`
  3. Update opportunity status to `contracted`
  4. Send notification to applicant

- **On Reject/Shortlist/Review:**
  - Update application status to the selected value
  - Send notification to applicant

- **Failure:** Alert "Failed to update application status."

---

## Flow 7: Contract & Milestone Management

**File:** `POC/features/opportunity-detail/opportunity-detail.js`

### 7.1 Contract Visibility (System Decision)

- **Decision Question:** Should the contract section be displayed?
- **Condition:** Opportunity status is `contracted`, `in_execution`, or `completed`
- **If false:** Contract section not rendered

### 7.2 Contract Action Buttons (System Decision)

| Button               | Visible When                                              | Action                          |
| -------------------- | --------------------------------------------------------- | ------------------------------- |
| "Start Execution"    | status === `contracted` AND user is owner                 | Opp -> `in_execution`, Contract -> `active` |
| "Confirm Completion" | status === `in_execution` AND user is owner AND all milestones done | Opp -> `completed`   |
| "Close Opportunity"  | status === `completed` AND user is owner                   | Opp -> `closed`                 |

### 7.3 Milestone Completion (User Decision)

- **Decision Question:** Does the user mark this milestone as complete?
- **Action:** Click "Mark Complete" on individual milestone
- **Backend:** Updates milestone object with `status: 'completed'` and `completedAt` timestamp
- **System Check:** "Confirm Completion" button only appears when ALL milestones have `status === 'completed'`

### 7.4 Contract Status Machine

```
pending ------> active        (when owner clicks "Start Execution")
active -------> completed     (NOT IMPLEMENTED -- no explicit transition in code)
active -------> terminated    (DEFINED in CONFIG but NOT IMPLEMENTED in UI)
```

### 7.5 Undocumented Gaps

- Contract status is never explicitly set to `completed` when the opportunity completes
- Contract termination is defined in `CONFIG.CONTRACT_STATUS.TERMINATED` but has no UI trigger
- No dispute resolution or contract amendment flow exists

---

## Flow 8: Matching Engine

**File:** `POC/src/services/matching/matching-service.js`

### 8.1 Match Trigger (System Decision)

- **Decision Question:** When should matching run?
- **Trigger Conditions:**
  - Opportunity is created with `status === 'published'`
  - Opportunity status is updated to `published` (e.g., draft -> published)
- **Process runs asynchronously** (errors caught and logged, do not block the user)

### 8.2 Candidate Filtering (System Decision)

- **For each user in the system:**

| #   | Check                                    | Action if Fails    |
| --- | ---------------------------------------- | ------------------ |
| 1   | User status is `active`                  | Skip user          |
| 2   | User is NOT the opportunity creator      | Skip user          |
| 3   | Match score >= `MIN_THRESHOLD` (0.70)    | Skip user          |

### 8.3 Score Calculation (System Decision)

- **Decision Question:** How well does this candidate match the opportunity?

- **Base Scoring Components (max 100 points):**

| Component            | Weight | Calculation                                           |
| -------------------- | ------ | ----------------------------------------------------- |
| Skills Match         | 50 pts | Intersection of required skills vs user skills/specializations |
| Sectors Match        | 15 pts | Intersection of opportunity sectors vs user sectors     |
| Certifications Match | 15 pts | Intersection of required certs vs user certifications   |
| Payment Compatibility| 10 pts | Overlap in preferred payment modes                     |
| Past Performance     | 20 pts | Based on application acceptance rate (accepted / total) |

- **Model-Specific Scoring (additional detail scoring):**

| Model Type             | Sub-Model          | Components                                                    |
| ---------------------- | ------------------ | ------------------------------------------------------------- |
| PROJECT_BASED          | task_based         | Skills (40), Experience (20), Budget (20), Location (10), Availability (10) |
| PROJECT_BASED          | consortium/project_jv | Scope (30), Financial (30), Experience (20), Geographic (20) |
| PROJECT_BASED          | spv                | Financial capacity (50, min 50M SAR), Sector (30), Experience (20) |
| STRATEGIC_PARTNERSHIP  | all                | Alignment (40), Complementary (30), Financial (20), Market (10) |
| RESOURCE_POOLING       | all                | Resource match (50), Quantity (20), Timeline (20), Geographic (10) |
| HIRING                 | all                | Qualification (30), Experience (30), Skills (30), Location (10) |
| COMPETITION            | all                | Eligibility (60), Experience (40)                              |

### 8.4 Notification Threshold (System Decision)

- **Decision Question:** Should the candidate be notified?
- **Condition:** Match score >= `AUTO_NOTIFY_THRESHOLD` (default 0.80)
- **If yes:** Create notification for the candidate with match details
- **If no (but >= 0.70):** Create match record only, no notification

### 8.5 Data Normalization (System Decision)

Before scoring, the system normalizes data:

- **Users:** Backfill `yearsExperience` from `experience`, `specializations` from `skills`, derive `sectors` from `interests`, set default `preferredPaymentModes`
- **Companies:** Backfill `industry` from `sectors`, set default `financialCapacity` by company size:
  - Large: 100,000,000 SAR
  - Medium: 25,000,000 SAR
  - Small/Other: 5,000,000 SAR

---

## Flow 9: Opportunity Browsing & Filtering

**File:** `POC/features/opportunities/opportunities.js`

### 9.1 Opportunity Categorization (System Decision)

- **Decision Question:** What is this opportunity's relationship to the current user?
- **Categories assigned per opportunity:**

| Category    | Condition                                     | Sort Priority |
| ----------- | --------------------------------------------- | ------------- |
| `mine`      | `user.id === opp.creatorId`                   | 1 (highest)   |
| `applied`   | User has an application on this opportunity    | 2             |
| `available` | Neither of the above                          | 3 (lowest)    |

- Within each category, sorted by `createdAt` descending (newest first)

### 9.2 Filter Application (User Decisions)

| Filter        | Field Matched         | Type        |
| ------------- | --------------------- | ----------- |
| Model Type    | `opp.subModelType`    | Dropdown    |
| Status        | `opp.status`          | Dropdown    |
| Search        | `opp.title`, `opp.description` | Text input |
| Category      | Computed category     | Dropdown    |

- **Empty State:** Contextual message differs based on whether filters are active:
  - With filters: "Try adjusting your filters to see more results."
  - Without filters: "Be the first to create an opportunity and start building connections."

### 9.3 Match Score Display (System Decision)

- **If user is the opportunity owner:** Match score set to `null` (not applicable)
- **Otherwise:** Calculate match score using `matchingService.calculateMatchScore()` and display as percentage

### 9.4 Can Apply Badge (System Decision)

- **Condition:** User exists AND not owner AND status is `published`/`in_negotiation` AND hasn't applied
- **If true:** Show "Apply" action on the opportunity card

---

## Flow 10: Find / Discovery (Public + Authenticated)

**File:** `POC/features/find/find.js`

### 10.1 Authentication-Based Rendering (System Decision)

- **Decision Question:** Is the user authenticated?

| Feature                | Authenticated          | Not Authenticated        |
| ---------------------- | ---------------------- | ------------------------ |
| Card Display           | Full detail cards      | Preview cards (limited)  |
| Action Buttons         | Connect, Message, Apply| Hidden                   |
| Login Banner           | Hidden                 | Shown                    |
| Click Navigation       | Navigate to profile/detail | Disabled              |

### 10.2 Data Filtering (System Decision)

- **People:** `isPublic !== false` AND `status === 'active'` AND `profile.type !== 'admin'` AND type is `professional` or `consultant`
- **Companies:** `isPublic !== false` AND `status === 'active'`
- **Opportunities:** `status === 'published'`

### 10.3 Search & Filter (User Decisions)

- **Search:** 300ms debounce, searches across multiple fields (name, email, skills, specialty, etc.)
- **Tab switching:** People / Companies / Opportunities (only relevant filters shown per tab)
- **Filters:** Location, sector, opportunity type (REQUEST/OFFER), model type

---

## Flow 11: People & Connections

**Files:** `POC/features/people/people.js`, `POC/features/person-profile/person-profile.js`

### 11.1 People List Filtering (System + User Decisions)

- **System pre-filter:** Public, active, non-admin, professional or company type
- **User filters:**

| Filter        | Logic                                           |
| ------------- | ----------------------------------------------- |
| Type          | `user` (non-company) or `company`               |
| Search        | Text match across name, email, skills, specialty |
| Location      | Case-insensitive location string includes        |
| Availability  | Only for professionals                           |
| Skills        | Set intersection check                           |

- **Sort Options:** Connections count, name (alpha), experience, recent (creation date)

### 11.2 Connect Action (User Decision)

- **Decision Question:** Does the user want to connect?
- **Pre-check:** Must be authenticated (else redirect to `/login`)
- **Backend:** Creates connection record with `status: 'pending'`
- **Notification:** Sent to target user
- **On Success:** Success notification shown
- **On Error:** Error notification shown

### 11.3 Connection Status Display (System Decision)

- **Decision Question:** What is the connection status between current user and this person?

| Status            | Connect Button     | Message Button       | Other Actions           |
| ----------------- | ------------------ | -------------------- | ----------------------- |
| `self`            | Hidden             | Shows "Edit Profile" | Navigate to profile edit |
| `accepted`        | Hidden             | Enabled              | Can send messages       |
| `pending_sent`    | Shows "Pending" (disabled) | Disabled (tooltip) | None                  |
| `pending_received`| Hidden             | Hidden               | Show Accept/Ignore      |
| `none`            | Shows "Connect"    | Disabled (tooltip)   | None                    |

### 11.4 Accept / Ignore Connection Request (User Decision)

- **Available when:** Connection status is `pending_received`
- **Accept:** Connection status -> `accepted`, both users can now message each other
- **Ignore:** Connection removed or status changed (connection not established)

---

## Flow 12: Messaging

**File:** `POC/features/messages/messages.js`

### 12.1 Connection Verification (System Decision)

- **Decision Question:** Are the two users connected?
- **Check:** `getConnectionStatus() === 'accepted'`
- **If not connected:** Show notification "You need to be connected to message this user", navigate back
- **Gap:** No handling for connections that become `rejected` after messages were already sent

### 12.2 Conversation List (System Decision)

- **Sorting:** Conversations with messages prioritized; sorted by last message time or connection time
- **Display:** Unread badge, preview of last message, conditional date display
- **Empty State:** "No conversations yet"

### 12.3 Message Sending (User Decision + Validation)

- **Decision Question:** Is the message valid?
- **Validation:** Message text not empty after `trim()`
- **Pre-check:** User must be logged in
- **Double-Submit Prevention:** Form disabled during send
- **On Success:** Message appears in thread, form re-enabled
- **On Error:** Show notification, form re-enabled

### 12.4 Message Direction (System Decision)

- **Condition:** `message.senderId === currentUser.id`
- If true: Render as "sent" (right-aligned)
- If false: Render as "received" (left-aligned)

---

## Flow 13: Notifications

**File:** `POC/features/notifications/notifications.js`

### 13.1 Notification Filtering (User Decisions)

| Filter     | Options                    | Logic                              |
| ---------- | -------------------------- | ---------------------------------- |
| Type       | Dropdown of notification types | `n.type === typeFilter`          |
| Read Status| All, Unread, Read          | `!n.read` or `n.read`             |

- Sorted by date (newest first)

### 13.2 Mark as Read (User Decision)

- **Individual:** Click mark-read button on a notification
- **Bulk:** "Mark All Read" button
- **Backend:** Updates `read: true` on notification records

### 13.3 Notification Click (System Decision)

- **Decision Question:** Does the notification have a link?
- If link exists: Navigate to link AND auto-mark as read
- If no link: Just mark as read

### 13.4 Empty State (System Decision)

- "No notifications found" if no notifications match current filters

---

## Flow 14: Admin -- User Vetting

**Files:** `POC/features/admin-vetting/admin-vetting.js`, `POC/features/admin-users/admin-users.js`, `POC/features/admin-dashboard/admin-dashboard.js`

### 14.1 Vetting Queue Population (System Decision)

- **Decision Question:** Which users/companies should appear in the vetting queue?
- **Condition:** Users and companies where `status === 'pending'` OR `status === 'clarification_requested'`
- **Merge:** Both individual users and company users are combined into one list
- **Filters:** Status dropdown, search by email/name

### 14.2 Admin Actions on Pending/Clarification Users (User Decision)

| Action                 | Confirmation       | Status Change                  | Notification                                       | Audit Log                     |
| ---------------------- | ------------------ | ------------------------------ | -------------------------------------------------- | ----------------------------- |
| **Approve**            | `confirm()` dialog | `pending/clarification` -> `active` | "Your account has been approved. You can now access all features." | `user_approved` / `company_approved` |
| **Reject**             | `confirm()` dialog + optional reason prompt | `pending/clarification` -> `rejected` | Includes rejection reason if provided | `user_rejected` / `company_rejected` |
| **Request Clarification** | Reason prompt (cancel = abort) | `pending` -> `clarification_requested` | "Your registration needs clarification: [reason]" | `user_clarification_requested` |

### 14.3 Admin Actions on Active Users (User Decision)

| Action      | Confirmation       | Status Change     | Notification                     | Audit Log         |
| ----------- | ------------------ | ----------------- | -------------------------------- | ----------------- |
| **Suspend** | `confirm()` dialog | `active` -> `suspended` | "Your account has been suspended." | `user_suspended` |

### 14.4 Admin Actions on Suspended Users (User Decision)

| Action       | Confirmation       | Status Change         | Notification                      | Audit Log          |
| ------------ | ------------------ | --------------------- | --------------------------------- | ------------------ |
| **Activate** | `confirm()` dialog | `suspended` -> `active` | "Your account has been activated." | `user_activated` |

### 14.5 Company vs Individual Handling (System Decision)

- **Decision Question:** Is this a company or individual?
- **Check:** `user.profile?.type === 'company'`
- **Impact:** Uses `dataService.updateCompany()` vs `dataService.updateUser()` accordingly
- Both paths create same types of notifications and audit logs but with different entity types

---

## Flow 15: Admin -- Dashboard

**File:** `POC/features/admin-dashboard/admin-dashboard.js`

### 15.1 Role-Based Redirection (System Decision)

- **Decision Question:** What role does the admin user have?
- **Admin/Moderator:** Load admin dashboard
- **Auditor:** Redirect to `/admin/audit`
- **Non-admin:** Redirect to `/dashboard`

### 15.2 Health Monitoring KPIs (System Decision)

| KPI                    | Calculation                                                     |
| ---------------------- | --------------------------------------------------------------- |
| Total Users            | Count of all users + companies                                  |
| Active Users           | Count where `status === 'active'`                               |
| User Health %          | `(activeUsers / totalUsers) * 100`                              |
| Pending Vetting        | Count where `status === 'pending'` or `clarification_requested` |
| Active Projects        | Opportunities with active statuses                               |
| Project Health %       | `(activeProjects / totalProjects) * 100`                        |
| Active Sessions        | Sessions where `expiresAt > now`                                |
| Recent Activity (1hr)  | Audit logs with timestamp within last 60 minutes                |
| Unread Notifications   | Notifications where `read === false`                            |

### 15.3 Activity Status Assessment (System Decision)

- **Decision Question:** Is system activity level HIGH?
- **Condition:** `unreadNotifications > 20` OR `recentAuditEvents > 10` (last hour)
- **If HIGH:** Display "HIGH" badge with alert styling
- **If OK:** Display "OK" badge with normal styling

### 15.4 Quick Action Badges (System Decision)

- **Vetting badge:** Shows count of pending vetting items; hidden if count === 0
- **Opportunities badge:** Shows count of pending opportunities; hidden if count === 0

### 15.5 Model Distribution (System Decision)

- Opportunities grouped by `modelType`, showing total/active/pending counts per model
- Models with 0 total appear last in the list

### 15.6 Quick Approve/Reject from Dashboard (User Decision)

- Same approve/reject/clarify flow as vetting page, available inline in the pending approvals queue

---

## Flow 16: Admin -- Opportunity Management

**File:** `POC/features/admin-opportunities/admin-opportunities.js`

### 16.1 Opportunity Listing & Filtering (User Decisions)

| Filter     | Field Matched      | Type        |
| ---------- | ------------------ | ----------- |
| Status     | `opp.status`       | Dropdown    |
| Model Type | `opp.modelType`    | Dropdown    |
| Search     | Title, description | Text input  |

### 16.2 Admin Opportunity Actions (User Decision)

| Action    | Visibility Condition                       | Confirmation       | Result                                 |
| --------- | ------------------------------------------ | ------------------ | -------------------------------------- |
| **Close** | Status is `published` or `in_negotiation`  | `confirm()` dialog | Status -> `closed` + audit log         |
| **Delete**| Always (for admin)                          | `confirm()` dialog | Permanent deletion + audit log         |

### 16.3 Intent Label Display (System Decision)

- `opp.intent === 'offer'` -> Display "OFFER"
- Otherwise -> Display "REQUEST"

---

## Flow 17: Admin -- Settings

**File:** `POC/features/admin-settings/admin-settings.js`

### 17.1 Platform Settings Form (User Decision)

| Setting              | Input Type  | Stored Format                    | Default                      |
| -------------------- | ----------- | -------------------------------- | ---------------------------- |
| Platform Name        | Text        | String                           | `CONFIG.APP_NAME` ("PMTwin") |
| Maintenance Mode     | Checkbox    | Boolean                          | `false`                      |
| Matching Threshold   | Number (%)  | Decimal (value / 100)            | 0.70 (70%)                   |
| Auto-Notify Threshold| Number (%)  | Decimal (value / 100)            | 0.80 (80%)                   |
| Session Duration     | Number (hrs)| Milliseconds (value * 3600000)   | 24 hours                     |

- **Save:** Updates `pmtwin_system_settings` in localStorage
- **Post-save:** Triggers `layoutService.updateNavigation()` to reflect changes
- **Error:** Alert "Failed to save settings. Please try again."

### 17.2 Maintenance Mode Gap (Undocumented)

- Maintenance mode shows a banner in the layout (`renderMaintenanceBanner()`)
- **However:** No actual access restriction is enforced -- users can still use all features

---

## Flow 18: Admin -- Collaboration Models

**File:** `POC/features/admin-collaboration-models/admin-collaboration-models.js`

### 18.1 Model Configuration (User Decision)

- **Per Model Controls:**

| Control        | Input Type  | Effect                                           |
| -------------- | ----------- | ------------------------------------------------ |
| Enable/Disable | Checkbox    | Disabled models excluded from opportunity creation dropdown |
| Custom Label   | Text input  | Overrides default model name in UI               |
| Display Order  | Number      | Controls sort order in dropdowns                 |

- **Save Logic:**
  - Collects all overrides into a settings object
  - Stores via `dataService.setCollaborationModelOverrides()`
  - Creates audit log (`collaboration_models_updated`) with list of changed model keys
- **Validation:** Label falls back to default name if empty; order falls back to 1 if NaN

---

## Flow 19: Admin -- Audit Trail

**File:** `POC/features/admin-audit/admin-audit.js`

### 19.1 Audit Log Filtering (User Decisions)

| Filter     | Logic                                                           |
| ---------- | --------------------------------------------------------------- |
| User       | Exact match on `userId`                                         |
| Action     | Exact match on `action`                                         |
| Search     | Text search across `action`, `entityType`, and `details` (JSON) |

### 19.2 CSV Export (User Decision)

- **Pre-checks:**
  1. Data must be loaded first (stored in `data-export-logs` attribute)
  2. JSON must parse successfully
  3. Array must not be empty
- **Failure Messages:**
  - "Load audit logs first, then export."
  - "No data to export."
  - "No audit logs to export."
- **Output:** CSV file with proper escaping for commas, quotes, and newlines

---

## Flow 20: Admin -- Reports

**File:** `POC/features/admin-reports/admin-reports.js`

### 20.1 Report Aggregation (System Decision)

All reports are computed on the client side from loaded data:

| Report                     | Data Source          | Aggregation                              |
| -------------------------- | -------------------- | ---------------------------------------- |
| Opportunity Status Dist.   | Opportunities        | Count by `status`                        |
| Application Status Dist.   | Applications         | Count by `status`                        |
| Audit Action Dist. (30d)   | Audit logs           | Count by `action` (last 30 days only)    |
| User Status Distribution   | Users + Companies    | Count by `status`                        |
| User Role Distribution     | Users + Companies    | Count by `role`                          |
| Model Type Distribution    | Opportunities        | Count by `modelType`                     |
| Intent Distribution        | Opportunities        | Count by `intent` (request/offer)        |

---

## Flow 21: Collaboration Wizard (Public)

**File:** `POC/features/collaboration-wizard/collaboration-wizard.js`

### 21.1 Step Navigation (User Decision)

- **Multi-step questionnaire** with single-option selection per step
- **Validation:** Must select an answer before proceeding -- failure: `alert("Please select an answer")`
- **Previous Button:** Hidden on first step
- **Next Button:** Hidden on last step
- **Submit Button:** Visible only on last step

### 21.2 Result Calculation (System Decision)

- Each answer option contributes weight to one or more collaboration models
- System counts model occurrences across all answers
- Sorts by count (descending) and displays top 3 recommended models

### 21.3 Create Opportunity Button (System Decision)

- **Decision Question:** Is the user authenticated?
- **If yes:** Show "Create Opportunity" button linking to opportunity creation
- **If no:** Button hidden (user must register/login first)

---

## Flow 22: Profile Management

**File:** `POC/features/profile/profile.js`

### 22.1 Profile Type Detection (System Decision)

- **Decision Question:** What type of user is this?

| Check                    | Profile View                        |
| ------------------------ | ----------------------------------- |
| `isCompanyUser()`        | Company profile with company fields |
| `isProfessional()`       | Professional profile with individual fields |
| Otherwise                | Generic profile                     |

### 22.2 Clarification Resubmit Flow (User Decision)

- **Condition:** `user.status === 'clarification_requested'`
- **Display:** Yellow banner with instructions and "Resubmit for Review" button
- **On Click:**
  - If company: `dataService.updateCompany(id, { status: 'pending' })`
  - If individual: `dataService.updateUser(id, { status: 'pending' })`
- **Effect:** User goes back into vetting queue for admin review

### 22.3 Profile Completeness Score (System Decision)

- **Company (6 fields):** name, email, phone, website, address, industry
- **Professional (8 fields):** name, email, phone, specialty, skills, experience, certifications, availability
- **Display:** Percentage bar with contextual message based on completeness level

### 22.4 View / Edit Mode Toggle (User Decision)

- **Decision Question:** Is the user in view mode or edit mode?
- **Toggle:** Click "Edit" to switch to form, click "Cancel" to return to view
- **Form Submission:**
  - Collects form data via `FormData`
  - Merges with existing profile data
  - Handles arrays (payment modes, skills) from comma-separated values
  - Success: Show notification, re-render profile
  - Error: Show error notification

---

## Flow 23: Pipeline Management

**File:** `POC/features/pipeline/pipeline.js`

### 23.1 Tab Selection (User Decision)

- **Decision Question:** Which pipeline view does the user want?

| Tab               | Content                                      |
| ----------------- | -------------------------------------------- |
| My Opportunities  | Kanban board: Draft, Published, In Progress, Closed |
| My Applications   | Kanban board: Pending, Reviewing, Shortlisted, Accepted, Rejected |
| Matches           | List of recommended opportunities from matching engine |

### 23.2 Status-to-Column Mapping (System Decision)

- **My Opportunities:**

| Column       | Statuses Included                                |
| ------------ | ------------------------------------------------ |
| Draft        | `draft`                                          |
| Published    | `published`                                      |
| In Progress  | `in_negotiation`, `contracted`, `in_execution`   |
| Closed       | `closed`, `cancelled`, `completed`               |

- **My Applications:** Direct 1:1 mapping (each status = one column)

### 23.3 Empty State (System Decision)

- Per column: "No items" message if column is empty
- Per section: Empty state if user has no opportunities/applications/matches

---

## Flow 24: Data Initialization

**Files:** `POC/src/core/init/app-init.js`, `POC/src/core/data/data-service.js`

### 24.1 Seed Version Check (System Decision)

- **Decision Question:** Is the data store up to date?
- **Check:** Compare `storedVersion` vs `this.CURRENT_SEED_VERSION`
- **If mismatch:** Clear ALL localStorage data and reseed from JSON files
- **If match:** Skip seeding

### 24.2 Default Admin Creation (System Decision)

- **Decision Question:** Does an active admin user exist?
- **Check:** `users.some(u => u.role === CONFIG.ROLES.ADMIN && u.status === 'active')`
- **If no admin found:** Create default admin with `status: 'active'` (auto-approved, bypasses vetting)
- **Default Credentials:** Defined in `createDefaultAdmin()` function

### 24.3 Data Migration (System Decision)

Three migration/normalization processes run on initialization:

| Process                              | Purpose                                              |
| ------------------------------------ | ---------------------------------------------------- |
| `migrateOpportunitiesToUnifiedWorkflow()` | Backfill `intent`, `collaborationModel`, `paymentModes`, `scope` on existing opportunities |
| `normalizeUsersForMatching()`         | Fill `yearsExperience`, `specializations`, `sectors`, `preferredPaymentModes` from alternative fields |
| `normalizeCompaniesForMatching()`     | Set `industry`, set default `financialCapacity` by company size |

### 24.4 Reset App Data (User Decision)

- **Decision Question:** Does the user confirm data reset?
- **Trigger:** Admin or debug action calling `resetAppData()`
- **Confirmation:** Browser `confirm("This will reset all data to default. Continue?")`
- **On Confirm:** `dataService.reseedFromJSON()`, clear `sessionStorage`, reload page
- **On Cancel:** No action

---

## Flow 25: Layout & Navigation

**File:** `POC/src/core/layout/layout-service.js`

### 25.1 Layout Mode Selection (System Decision)

- **Decision Question:** Is the user authenticated?

| Condition        | Layout                          |
| ---------------- | ------------------------------- |
| Authenticated    | Sidebar navigation (portal mode)|
| Not authenticated| Top navigation bar (public mode)|
| In admin area    | Admin sidebar (role-filtered)   |

### 25.2 Admin Sidebar Menu Filtering (System Decision)

| Role        | Visible Menu Items                                                     |
| ----------- | ---------------------------------------------------------------------- |
| Auditor     | Audit Trail, Reports                                                   |
| Moderator   | Dashboard, Vetting, Users, Opportunities, Audit Trail, Reports        |
| Full Admin  | All of Moderator + Settings, Collaboration Models                     |

### 25.3 Active Route Highlighting (System Decision)

- Home route: Active only on exact match (`/`)
- Other routes: Active on exact match OR prefix match (e.g., `/admin/users/123` highlights `/admin/users`)

### 25.4 Language Toggle (User Decision)

- **Decision Question:** English or Arabic?
- **English:** `dir="ltr"`, `lang="en"`
- **Arabic:** `dir="rtl"`, `lang="ar"`
- **Effect:** Toggles `dir` attribute on document, re-renders layout

### 25.5 Maintenance Banner (System Decision)

- **Decision Question:** Is maintenance mode enabled in system settings?
- **If yes:** Create/show warning banner at top of page
- **If no:** Hide/remove banner
- **Gap:** Banner is informational only; no actual access blocking is enforced

### 25.6 User Dropdown (User Decision)

- **Click avatar:** Toggle dropdown visibility
- **Click outside:** Close dropdown
- **Dropdown items:** Profile, Settings, Logout (with appropriate navigation)

---

## Summary: Undocumented / Implicit Behavior

The following behaviors were discovered during analysis but are not explicitly documented in the BRD or code comments:

| #  | Finding                                              | Risk / Impact                                |
| -- | ---------------------------------------------------- | -------------------------------------------- |
| 1  | No admin notification on new registration            | Admins must poll dashboard to discover pending users |
| 2  | No rate limiting on login attempts                   | Brute-force attack vector                     |
| 3  | No real email/SMS delivery (OTP shown on screen)     | POC limitation; must be replaced for production |
| 4  | Contract termination defined in config but not in UI | Users cannot terminate contracts through the interface |
| 5  | Maintenance mode shows banner but does not block access | Users continue using platform during "maintenance" |
| 6  | Opportunity deletion has no status restriction       | Owner can delete even contracted opportunities |
| 7  | No undo on admin rejection                           | Rejected users cannot re-register with same email |
| 8  | No active session refresh mechanism                  | Sessions silently expire after 24 hours       |
| 9  | `clarification_requested` users can still log in     | By design, so they can update their profile   |
| 10 | Contract `completed` status never explicitly set     | Contract stays as `active` even after opportunity completes |
| 11 | No pagination on any listing page                    | All data loaded into memory; scalability concern |
| 12 | No connection rejection/blocking mechanism           | Users can only Accept or Ignore connection requests |

---

## Appendix A: All Status Machines

### User / Company Account Status

```
                        +--> active -----> suspended
                        |     ^              |
                        |     |              v
pending ---+----------->+     +---------> active
           |            |
           +----------->+--> rejected
           |
           +----------->+--> clarification_requested ---+
                              ^                          |
                              +--------------------------+
                              (can loop: request more info)
```

### Opportunity Status

```
draft ----> published ----> in_negotiation ----> contracted ----> in_execution ----> completed ----> closed
  |             |                 |
  +--- cancelled (from draft, published, or in_negotiation only)
```

### Application Status

```
(new) ----> pending ----> reviewing ----> shortlisted ---+---> accepted
                                                          +---> rejected
pending ----> withdrawn (config only, no UI trigger)
```

### Contract Status

```
pending ----> active ----> completed (NOT IMPLEMENTED)
                      ----> terminated (NOT IMPLEMENTED)
```

### Connection Status

```
(none) ----> pending ----> accepted
                      ----> rejected (implicit, via "Ignore")
```

---

## Appendix B: Role Permission Matrix

| Capability                    | company_owner | company_admin | company_member | professional | consultant | admin | moderator | auditor |
| ----------------------------- | ------------- | ------------- | -------------- | ------------ | ---------- | ----- | --------- | ------- |
| View public pages             | Yes           | Yes           | Yes            | Yes          | Yes        | Yes   | Yes       | Yes     |
| Create opportunities          | Yes           | Yes           | Yes            | Yes          | Yes        | Yes   | Yes       | No      |
| Apply to opportunities        | Yes           | Yes           | Yes            | Yes          | Yes        | No    | No        | No      |
| View dashboard                | Yes           | Yes           | Yes            | Yes          | Yes        | Yes   | Yes       | No      |
| Access admin panel            | No            | No            | No             | No           | No         | Yes   | Yes       | Yes     |
| Admin: Dashboard              | No            | No            | No             | No           | No         | Yes   | Yes       | No      |
| Admin: User management        | No            | No            | No             | No           | No         | Yes   | Yes       | No      |
| Admin: Vetting                | No            | No            | No             | No           | No         | Yes   | Yes       | No      |
| Admin: Opportunity management | No            | No            | No             | No           | No         | Yes   | Yes       | No      |
| Admin: Audit trail            | No            | No            | No             | No           | No         | Yes   | Yes       | Yes     |
| Admin: Reports                | No            | No            | No             | No           | No         | Yes   | Yes       | Yes     |
| Admin: Settings               | No            | No            | No             | No           | No         | Yes   | No        | No      |
| Admin: Collaboration models   | No            | No            | No             | No           | No         | Yes   | No        | No      |
| Approve/reject users          | No            | No            | No             | No           | No         | Yes   | Yes       | No      |
| Suspend/activate users        | No            | No            | No             | No           | No         | Yes   | Yes       | No      |
| Send/receive messages         | Yes           | Yes           | Yes            | Yes          | Yes        | Yes   | Yes       | No      |
| Connect with users            | Yes           | Yes           | Yes            | Yes          | Yes        | Yes   | Yes       | No      |
