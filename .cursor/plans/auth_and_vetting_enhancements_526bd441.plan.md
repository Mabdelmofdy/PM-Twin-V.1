---
name: Auth and Vetting Enhancements
overview: Implement sign-in options (social login, password reset, Remember Me), profile completion indicator enhancements, sample opportunities, and a structured vetting process integrated with registration (skippable), single/multiple expertise, limited access for non-vetted users, and differentiated Professional vs Consultant requirements with portfolio, references, and preferred collaboration models.
todos: []
isProject: false
---

# Authentication & User Management + Vetting Process

## Current state (summary)

- **Login:** Email/password only in [POC/features/login/login.js](POC/features/login/login.js) and [auth-service.js](POC/src/core/auth/auth-service.js). Session stored in **sessionStorage** only; no Remember Me, no social login, no password reset.
- **Registration:** Dual flow (company vs individual) in [POC/features/register/register.js](POC/features/register/register.js) with documents per role/type from [data/lookups.json](POC/data/lookups.json). New users get `status: 'pending'`; no explicit "skip vetting" or "complete later" option. No domain/expertise areas or preferred collaboration models in `regState`.
- **Vetting:** Admin approve/reject/clarify in [POC/features/admin-vetting/admin-vetting.js](POC/features/admin-vetting/admin-vetting.js). No structured vetting steps (certs, case study, interview) or differentiated Professional vs Consultant criteria in the data model or UI.
- **Profile:** Completeness indicator exists in [POC/features/profile/profile.js](POC/features/profile/profile.js) (`getCompanyCompleteness`, `getProfessionalCompleteness`, `renderCompleteness`). No portfolio, case studies, references, or preferred collaboration models in profile UI or user/company schema.
- **Opportunity access:** [opportunity-detail](POC/features/opportunity-detail/opportunity-detail.js) and Find list do not restrict by vetting status; any logged-in user can see full opportunity details.
- **Config:** [config.js](POC/src/core/config/config.js) has `MODELS`, `COLLABORATION_MODEL`, `ROLES` (professional, consultant, etc.). No user-level preferred models stored.

---

## 1. Account sign-in options

### 1.1 Remember Me

- **Auth service** ([POC/src/core/auth/auth-service.js](POC/src/core/auth/auth-service.js)): In `login()`, accept an optional `rememberMe` flag. If true, store token and user in **localStorage** instead of sessionStorage; if false, keep current sessionStorage behavior. In `checkAuth()`, look for token in both sessionStorage and localStorage (e.g. try session first, then localStorage). On logout, clear both.
- **Login page** ([POC/pages/login/index.html](POC/pages/login/index.html), [login.js](POC/features/login/login.js)): Add a checkbox "Remember me" and pass its value to `authService.login(email, password, { rememberMe })`.

### 1.2 Password reset

- **Flow:** "Forgot password?" link on login page → new page or modal to enter email → request reset (POC: store reset token and expiry in dataService or a dedicated key; production would send email). "Reset password" page (route e.g. `/reset-password?token=...`) to enter new password and submit; auth service validates token and updates password.
- **Data:** Add storage for reset tokens (e.g. `pmtwin_reset_tokens`: `{ email, token, expiresAt }`) and a method in dataService to create/validate token. Auth service: `requestPasswordReset(email)`, `resetPassword(token, newPassword)`.
- **UI:** [POC/pages/login/index.html](POC/pages/login/index.html) add "Forgot password?"; add [POC/pages/reset-password/index.html](POC/pages/reset-password/index.html) (or modal) and feature script to handle token and form. For POC without real email, show token in UI or console for testing.

### 1.3 Social login (LinkedIn, Google)

- **Reality check:** OAuth requires a backend (or a provider like Firebase Auth) to exchange code for tokens and create/link users. For POC, two options: (a) **Placeholder UI only**: add "Sign in with Google" and "Sign in with LinkedIn" buttons that show a message "Coming soon" or open provider consent URL with a client-side app id; (b) **Integrate a provider**: e.g. Firebase Auth or Auth0, then in auth-service add `loginWithGoogle()` / `loginWithLinkedIn()` that use the provider and create or match user in dataService by email.
- **Plan recommendation:** Add placeholder buttons and a config flag (e.g. `CONFIG.AUTH.SOCIAL_LOGIN_ENABLED`) and document that production will need backend OAuth or Firebase/Auth0. If you later add Firebase, auth-service can create user in dataService on first social sign-in (by email) and set a flag like `profile.authProvider: 'google'`.

---

## 2. Profile completion indicator

- **Current:** [profile.js](POC/features/profile/profile.js) already has `getCompanyCompleteness`, `getProfessionalCompleteness`, and `renderCompleteness`; profile page has the bar and percent.
- **Enhancement:** Extend the completeness rules to include new fields added for vetting: e.g. preferred collaboration models, portfolio/case studies (if added), and references. Ensure the indicator is visible for both company and professional/consultant and that the set of fields is documented (so "profile completion" aligns with what matters for matching and vetting).

---

## 3. Sample opportunities for exploration

- **Data:** Add a few opportunities in [POC/data/opportunities.json](POC/data/opportunities.json) (or seed via dataService) marked as sample, e.g. `isSample: true` or `tags: ['sample']`.
- **UI:** On Find or Dashboard, if the user is new or has not applied to any opportunity, show a short section "Sample opportunities to explore" that lists these (link to opportunity detail). Filter sample opportunities in the Find page or dashboard so they are clearly labeled and easy to find. Optionally show this block only when the user has no applications yet.

---

## 4. Vetting process (key feature)

### 4.1 Vetting as part of registration, skippable (A)

- **Registration flow** ([register.js](POC/features/register/register.js), [POC/pages/register/index.html](POC/pages/register/index.html)): After the main registration steps (and before or after document upload), add an optional step "Vetting" with a short explanation and a checkbox or button "Complete vetting now" vs "Skip and complete later". If skip: still create user/company with `status: 'pending'` (current behavior) and set a flag e.g. `profile.vettingSkippedAtRegistration: true` or `vettingStatus: 'not_started'`. If "complete now", show a shortened vetting form (see below). Users who skip can later complete vetting from Profile (link to "Complete your vetting").
- **Profile:** Add a card or banner for users with `status === 'pending'` or `vettingStatus === 'not_started'`: "Complete vetting to get full access" with CTA to the vetting/portfolio flow.

### 4.2 Single domain and multiple expertise (B, C)

- **Data model:** On user/company profile, add:
  - `vettingDomain` or `primaryDomain`: one professional domain (e.g. from lookups: "Civil Engineering", "Project Management") selected at registration or in profile.
  - `expertiseAreas`: array of `{ domain, role }` where role is "professional" or "consultant" (e.g. professional in one field, consultant in another).
- **Registration / Profile UI:** In registration (if not skipped) and in Profile, add:
  - Single select for "Primary professional domain" (from lookups or config).
  - Section "Expertise areas" with ability to add multiple rows: domain + role (Professional/Consultant). At least one required when vetting is completed.

### 4.3 Suggested vetting flow (D) – structured steps

- **Data model:** Store on user/company:
  - `vettingSteps` or equivalent: certifications (uploaded docs or links), case study (text + optional file), interview (e.g. `interviewRequestedAt`, `interviewCompletedAt`, `interviewLink`). Reuse existing `profile.documents` for certifications; add `profile.caseStudies` (array of `{ title, description, urlOrFile }`) and optional `profile.interview` object.
- **UI (profile or dedicated vetting flow):** Multi-step or accordion: (1) Upload certifications/qualifications (reuse document upload pattern), (2) Submit case study (form + optional file), (3) Interview – show "An interview may be scheduled (e.g. via Zoom); you will be notified." and optional link/date when set by admin. Admin side (vetting or user detail): allow viewing these and optionally setting interview status/link.

### 4.4 Limited access without vetting (E)

- **Definition of "vetted":** Treat user as vetted when `status === 'active'` (already approved by admin). Optionally add a stricter flag `profile.vettingCompleted: true` set when admin marks vetting complete (all steps reviewed).
- **Opportunity list (Find):** Keep showing all published opportunities to logged-in users (browse). No change to list visibility.
- **Opportunity detail** ([opportunity-detail.js](POC/features/opportunity-detail/opportunity-detail.js)): If the current user is **not** vetted (e.g. `status !== 'active'`), show a **teaser view**: title, short description, and a message "Complete vetting to view full details and apply." with a link to Profile/vetting. Do not render full description, attributes, application form, or apply button. If vetted, show full detail and allow apply as today.

### 4.5 Different requirements for Professionals vs Consultants (F)

- **Lookups/config:** In [lookups.json](POC/data/lookups.json) or config, define required vetting items per type, e.g.:
  - Professional: certifications (e.g. from individualTypeDocuments.professional), optional case study, interview.
  - Consultant: certifications (e.g. individualTypeDocuments.consultant), portfolio/case study required, interview.
- **Profile/vetting UI:** When user selects role "Professional" vs "Consultant" (or has multiple expertise with different roles), show the appropriate required/optional fields and labels. Admin vetting screen can show "Requirements: Professional" vs "Requirements: Consultant" and check against these.

### 4.6 References and testimonials (G)

- **Data model:** `profile.references` or `profile.testimonials`: array of `{ name, role, contact, text, createdAt }`.
- **Profile UI:** Section "References & testimonials" with add/remove entries (name, role, contact, testimonial text). Optional: mark as "verified" by admin later.

### 4.7 Portfolio / case studies (H)

- **Data model:** `profile.caseStudies` (or `portfolio`): array of `{ title, description, url, fileRef, createdAt }` (fileRef can be a data URL or key for POC).
- **Profile UI:** Section "Portfolio / case studies" (especially for SMEs and consultants) with add/edit/delete. Reuse document upload or link pattern. This feeds into vetting step (D).

### 4.8 Preferred collaboration models (I)

- **Data model:** `profile.preferredCollaborationModels`: array of ids from [CONFIG.COLLABORATION_MODEL](POC/src/core/config/config.js) or MODELS (e.g. project_based, hiring, etc.).
- **Registration / Profile UI:** Multi-select or checkbox group "Preferred collaboration models" (labels from config). Shown in registration (optional) and editable in Profile. Used for matching and display.

---

## 5. Implementation order (suggested)

1. **Remember Me** – auth-service + login page (small, no new routes).
2. **Password reset** – data model for tokens, auth methods, login link, reset-password page/modal.
3. **Social login placeholders** – buttons + config; optional Firebase later.
4. **Preferred collaboration models** – add to profile and registration (data + UI).
5. **Portfolio / case studies** – profile schema + UI.
6. **References & testimonials** – profile schema + UI.
7. **Vetting skippable + single domain + expertise areas** – registration and profile (data + UI).
8. **Structured vetting steps** – certifications (reuse docs), case study, interview fields; profile and admin view.
9. **Differentiated Professional vs Consultant** – lookups + conditional UI and admin checks.
10. **Limited access (non-vetted)** – opportunity-detail: teaser for non-active users.
11. **Profile completion** – extend completeness to new fields.
12. **Sample opportunities** – seed data + Find/Dashboard section.

---

## 6. Files to touch (summary)


| Area                                                                | Files                                                                                                                                                            |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Remember Me                                                         | [auth-service.js](POC/src/core/auth/auth-service.js), [login/index.html](POC/pages/login/index.html), [login.js](POC/features/login/login.js)                    |
| Password reset                                                      | auth-service.js, data-service.js (tokens), login page, new reset-password page + feature                                                                         |
| Social login                                                        | login page (buttons), config.js (flags), optionally auth-service                                                                                                 |
| Profile completion                                                  | [profile.js](POC/features/profile/profile.js) (extend rules)                                                                                                     |
| Sample opportunities                                                | data/opportunities.json or seed, [find.js](POC/features/find/find.js) or dashboard, optional route                                                               |
| Vetting in registration                                             | [register.js](POC/features/register/register.js), [register/index.html](POC/pages/register/index.html)                                                           |
| Profile: domain, expertise, portfolio, references, preferred models | [profile.js](POC/features/profile/profile.js), [profile/index.html](POC/pages/profile/index.html), data-service (no schema change if profile is flexible object) |
| Vetting steps (certs, case study, interview)                        | profile + [admin-user-detail](POC/features/admin-user-detail/admin-user-detail.js) or admin-vetting                                                              |
| Professional vs Consultant                                          | lookups.json or config, profile/vetting UI                                                                                                                       |
| Limited access opportunity detail                                   | [opportunity-detail.js](POC/features/opportunity-detail/opportunity-detail.js)                                                                                   |


---

## 7. Out of scope / notes

- **Email sending:** POC can use mock reset tokens (show in UI or console); production needs an email service.
- **Zoom integration:** Interview step is informational + optional link/date; no real Zoom API in POC unless you add it.
- **Backend:** Plan assumes current POC (localStorage + dataService). Moving to a real API will require migrating auth and tokens to the server.

