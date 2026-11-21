# Staff Authentication and Herdbook Authorization

**Status:** Design for the next staff-access implementation; no staff authentication or Herdbook database integration is implemented yet.
**Scope:** Authorization design only. This document does not authorize changes to customer login, schema, application code, or hosted Supabase resources.
**Reviewed:** 2026-11-21

## Summary

The repository contains a public website and an installable customer experience, plus `herdbook.html`, a staff-oriented prototype. The customer pages use the existing local Supabase Auth client. Herdbook still uses seeded demo records and browser `localStorage`; it does not currently sign in staff or read/write the database. The local database foundation already separates Auth identity from farm membership and enforces farm-scoped animal access with RLS. The missing piece is a trusted staff lifecycle and a real staff client that uses the existing policies.

Use one Supabase Auth identity per person, with distinct customer and staff experiences. A valid login identifies a user; it does not make the user staff. Staff access requires a current `farm_memberships` row with `status = 'active'`, an allowed role, and the permission required for the requested farm and action. Enforce this at the database/API on every request. Do not use profile fields, user-editable metadata, cached browser state, or a hidden button as authority.

## 1. Findings from the repository

### Existing applications and routes

- The public site consists of its individual HTML pages, including `index.html`, `about-us.html`, `products-and-services.html`, `contact.html`, `gallery.html`, `blog.html`, and `auctions.html`.
- The Android-first customer app uses `app.html` and customer account flows. `JS/customer-auth.js` initializes the existing Supabase Auth browser client and stores customer profile details through the self-only `user_profiles` policies.
- The staff-oriented route is `herdbook.html`. It presents overview, animal records, marketplace, and sales/records views. Its current JavaScript branch in `JS/site.js` seeds sample animals, loads `herdbook-animals` from `localStorage`, and persists edits there. It does not consult `MarksFarmAuth` or query Supabase. The visible dashboard is therefore a local prototype, not an authenticated or authoritative farm-management system.
- No dedicated staff sign-in or staff invitation/activation screen or endpoint was found in the inspected implementation.

The direct URL remains a route compatibility requirement. `herdbook.html` being excluded from service-worker precaching and requiring a network response is useful cache hygiene; it is not access control. A client-side redirect can improve navigation but cannot protect farm data.

### Existing database authorization foundation

The current migration `supabase/migrations/20261120000100_farm_foundation.sql` defines:

- `farm_memberships`: one row per `(farm_id, user_id)`, role code `owner`, `manager`, or `employee`; status `invited`, `active`, or `disabled`; inviter and acceptance/disable timestamps; restrictive Auth/farm foreign keys.
- `role_permissions`: a controlled `(role_code, permission_code)` catalog with no browser write grant.
- `has_farm_permission(farm_id, permission_code)`: a `SECURITY DEFINER` SQL function with `search_path = ''`. It resolves `auth.uid()`, joins the current active membership to the role permission, and returns a boolean. Execution is denied to `anon`/`public` and granted to `authenticated`.
- RLS on all nine foundation tables. Farms, locations, animals, and identifiers are scoped through that helper. Membership reads are self-only or require `membership.read_all`.
- Explicit least-privilege grants. Authenticated users may read memberships but cannot insert, update, or delete memberships or edit role permissions. There is no authenticated animal delete grant. Employees have `farm.read`, `animal.read`, `animal.create`, and `animal.identifier.create`; they do not get animal update/archive from the current permission seed. Managers have the owner-like animal/location permissions but do not receive `membership.read_all`; owners receive `membership.read_all`.

The current database does not implement staff invitations, invite acceptance, membership administration, audit events, or an administrative API. The migration's `invited` status is a state value, not a complete invitation workflow. Do not enable real staff onboarding until the trusted lifecycle exists.

### Existing security-test evidence and limits

The existing pgTAP suite covers anonymous and customer denial, active employee/manager/owner farm scoping, a second-farm owner, disabled membership denial, direct-ID isolation, employee animal creation, attempted membership/role escalation, grants, function protections, and integrity constraints. The latest repository/task report says the full suite ran locally with 64 of 64 assertions passing after the employee animal INSERT grant fix. That result is prior-work evidence, not a test run performed while preparing this design. The suite verifies the present database policies; it does not test an invitation/activation endpoint, staff browser route, customer/staff UI separation, or production configuration.

## 2. Domain rules and identity lifecycle

1. **Identity:** `auth.users.id` is the canonical user identity. Keep one identity when the same person buys as a customer and works for a farm.
2. **Profile:** `user_profiles` stores self-service profile fields, not staff role, farm, permissions, or employment status. Profile metadata supplied by a browser is never authoritative for authorization.
3. **Customer status:** A customer account or customer session alone grants no staff access. This remains true even if a customer has the same email as an invited staff member; the invitation must be explicitly accepted and linked to the verified Auth user.
4. **Staff status:** An active membership is a farm-scoped relationship, not a global user flag. A user may have memberships at more than one farm and can have a different role at each farm.
5. **Permission decision:** For every private read or mutation, derive actor identity from the verified Supabase session, then check the current membership, selected farm, permission code, and requested state transition in RLS or a trusted server endpoint.
6. **Suspension:** A disabled membership must deny access immediately even when the browser holds an unexpired access token. The current `has_farm_permission` checks the live membership row on each database authorization evaluation, which is preferable to long-lived role claims in JWT metadata.
7. **Removal:** Preserve the Auth identity and historical records. Revoke access by disabling/tombstoning the membership; do not delete the person's customer identity. If a user must be barred from all farms, disable each membership and separately revoke sessions through a trusted Auth Admin process.
8. **No implicit promotion:** Signup, profile edits, accepting terms, guessing a route, or changing browser storage cannot create or promote a membership.

## 3. Staff role and capability matrix

The first three columns describe the **current seeded database behavior**, not every dashboard function. “Proposed” indicates a capability that requires a deliberate future permission and matching table/API policy before implementation.

| Capability | Employee (current) | Manager (current) | Owner (current) | Design guidance |
|---|---|---|---|---|
| Read own farm and locations | Yes | Yes | Yes | Farm-scoped by RLS |
| Read animal records and identifiers | Yes | Yes | Yes | Only assigned farm |
| Create animal and identifier records | Yes | Yes | Yes | Current RLS + table grants |
| Update animal records | No | Yes | Yes | Employee update requires an explicit policy decision and permission |
| Archive animal | No | Yes | Yes | Prefer archive/status over hard delete |
| Read all farm memberships | No | No | Yes | Owner permission is `membership.read_all` |
| Invite, activate, change role, disable/remove staff | No | No | No browser path | Proposed trusted endpoint; explicit owner authorization and audit required |
| Manage locations | No | Yes | Yes | Current permission is `location.manage` |
| Publish marketplace products/listings | Not in current foundation | Not in current foundation | Not in current foundation | Add an explicit publish permission and server-side approval rules |
| Manage auctions/bids | Not in current foundation | Not in current foundation | Not in current foundation | Define permission and use transactional auction services |
| View customer data/orders | Not in current foundation | Not in current foundation | Not in current foundation | Separate permission; minimum necessary access |
| View/post/reverse finance | Not in current foundation | Not in current foundation | Not in current foundation | Separate permissions, maker-checker controls, immutable audit trail |

Keep the role catalog static and migration-managed for the first release. Do not add a browser-facing “edit roles” feature. If the business later needs custom roles, design a separate auditable permission-assignment model rather than granting staff write access to `role_permissions`.

## 4. Proposed staff onboarding and access lifecycle

### Invite

- An authenticated active owner invokes a trusted server endpoint (for example, a Supabase Edge Function) to invite a person to one farm with one allowed role.
- The endpoint validates the caller's current farm membership and a dedicated staff-management permission. Do not infer authority from a request body or a UI role.
- It creates/sends a Supabase Auth invite through the server-side Auth Admin API and creates an `invited` membership tied to the invited Auth identity. Enforce one membership per farm/user and idempotent retries.
- Do not return account-existence details that enable user enumeration. Do not permit owner assignment through ordinary invites; define a controlled initial owner/bootstrap path separately.

### Accept and activate

- Recipient verifies the invitation using Supabase Auth and signs in to the same identity used for customer activity, if one exists.
- A trusted server verifies the invitation/verified identity and activates the matching invited membership transactionally, setting `accepted_at` and clearing `disabled_at`.
- Until activation is complete, `has_farm_permission` returns false. The invite email or client cannot set membership status directly.

### Change role, suspend, and remove

- An authorized owner requests a role change or suspension through the trusted endpoint. Revalidate the actor's active membership and target farm at operation time; reject self-escalation and changes that would leave the farm without its required owner.
- Suspension sets `status = 'disabled'`, `disabled_at`, and audit data. Current RLS then rejects the user even if their session token remains valid.
- Removal is normally a disable/revoke operation, preserving the membership record and audit history. Permanently deleting a membership should not be a normal UI action.
- Session revocation is a separate server-side action using Auth Admin privileges when required. Never expose an admin/service-role key to HTML, JavaScript, PWA storage, or a browser request.

### Audit and schema additions to design before implementation

The current schema has no membership audit table or invitation lifecycle fields such as expiry, accepted invite reference, or actor/reason history. Before implementing the endpoint, decide whether to add a `staff_invitations` table and append-only `audit_events` table (or an equivalent existing service audit). Store only the necessary invitation state, expiry, target farm, intended role, inviter, acceptance, and revocation metadata. Avoid storing raw invite tokens. Add RLS/grants, retention rules, and tests in the same migration sequence. Treat Auth Admin operations and database membership changes as a consistency problem: define idempotency and recovery for partial failure rather than assuming the two systems commit atomically.

## 5. Herdbook route protection and data access

### Client experience

- Keep `herdbook.html` as the existing staff route to preserve links. Add a dedicated staff sign-in experience, either a clearly separate `staff-sign-in.html` route or a visually distinct staff mode, without changing customer signup/sign-in behavior.
- On direct `herdbook.html` load, show a neutral loading shell while session and active memberships are resolved. If no session exists, route to staff sign-in with a safe return path. If signed in but no active membership exists, show a generic “staff access is not available” state and a route back to the customer site. Do not reveal whether a particular email has an invitation.
- If the user has multiple active memberships, require an explicit farm selection and scope all subsequent data calls to that selection. Never trust the client-supplied farm ID without RLS evaluation.
- Hide or disable actions the current role cannot perform for usability, but treat those controls as advisory only. Refresh membership state after auth changes, tab focus, and authorization errors.
- Remove demo/localStorage records from any production staff data path. Any transition/import must identify and exclude sample rows and keep a separately reviewed backup; this design does not authorize a data migration.

### Server/data boundary

- Ordinary Herdbook farm-data requests should use the signed-in user's Supabase session and the existing RLS-enabled tables. RLS must remain effective for direct REST requests and guessed record IDs.
- Use a trusted endpoint only for privileged operations unavailable to browser roles, especially invitations, activation, role changes, suspension, and session revocation. The endpoint must validate the caller with the user-scoped JWT, check permission in the database, validate input, perform the privileged Auth Admin action server-side, and record an audit event. A service-role client bypasses RLS and must never be used as a shortcut for routine Herdbook reads/writes.
- Avoid a generic endpoint that accepts arbitrary table names, SQL, role codes, or unvalidated farm IDs. Use narrow operation-specific functions/endpoints.
- No private staff records should be cached by the service worker or exposed in public page markup. Online-only handling is acceptable for the first staff slice; offline staff writes require a separate conflict, revocation, and local-device security design.

## 6. Customer and staff application separation

Keep the customer site/PWA and staff workspace as distinct application areas in the existing repository for the first implementation. Reuse the existing Supabase Auth project, shared API/database, design tokens, safe utilities, and common public assets where appropriate. Do not create a second password database or grant customer app code a staff role.

The customer app remains the entry point for browsing, saved items, orders, and customer account tasks. The staff area gets its own navigation, route guard, session handling states, and farm selection. A shared Auth identity is not a shared authorization context: route both experiences through server-validated current permissions. If repository structure is physically separated later, preserve the established URLs or provide redirects and update service-worker scopes, Auth callbacks, and asset paths as a migration.

## 7. Required verification plan

### Database / pgTAP

Extend the existing transactional suite with synthetic fixtures only. For every new table, function, and endpoint contract, verify:

- Anonymous and authenticated customer cannot read private staff rows or invoke staff administration.
- Employee, manager, and owner get only the explicitly approved permissions for their farm.
- Farm A cannot be accessed through a Farm B ID, direct row ID, altered filters, or an insert/update carrying another `farm_id`.
- Invited and disabled memberships provide no private access; suspension takes effect with an already-authenticated JWT.
- Users cannot insert/modify/delete memberships, promote themselves, reactivate a disabled membership, change another user's role, or edit `role_permissions` through browser grants.
- Owner endpoint cannot grant an unauthorized role, remove the final owner, target another farm without membership, or bypass audit.
- Function execute grants, `SECURITY DEFINER` ownership/search path, table grants, constraints, and transaction rollback behave as intended.

Keep the current 64 assertions as regression coverage. Add tests for each newly introduced access path instead of replacing or weakening the existing assertions.

### Server/API tests

Use Node-level unit/integration tests with synthetic user and farm fixtures to cover invite authorization, idempotent retries, duplicate invitation, existing customer identity, expired/revoked invite, acceptance, role change, disable/revoke, Auth Admin failure after database failure and the reverse partial-failure case. Confirm that privileged credentials are not present in browser bundles or responses.

### Browser tests

Test direct navigation to `herdbook.html` as anonymous, customer-only, active employee, manager, owner, and disabled staff. Exercise loading/denied/error states, multiple-farm selection, tab refresh, logout, stale session, and direct API access. Confirm customer sign-in/signup and PWA launch still work, customer URLs remain compatible, and no private staff response enters Cache Storage. Run mobile and desktop layouts at supported viewport sizes.

Do not describe route redirects or button visibility as proof of authorization; assert the corresponding API/database denial as well.

## 8. Risks and unresolved decisions

- **Owner/bootstrap authority:** Choose how the first owner is established in a controlled, local-first bootstrap process without enabling self-promotion.
- **Role authority:** Confirm whether the proposed manager abilities in the matrix remain limited to the seeded permissions; specifically, employee update/archive and manager membership administration are currently denied.
- **Invitation identity collision:** A recipient may already have a customer Auth account. The endpoint must link the membership only after verified control of that identity, not create a duplicate user based on matching email text.
- **Cross-system transaction:** Auth invitations and PostgreSQL changes do not share an atomic transaction. Define idempotent retries, expiry, and reconciliation for partial failures.
- **Audit/retention:** Decide audit event fields, access, retention and whether inviter/target PII must be minimized.
- **MFA/session policy:** Decide whether MFA is required for owners/managers before production and what reauthentication is required for role/finance actions.
- **Existing prototype data:** Herdbook sample and locally entered data is browser-local and non-authoritative. Reconcile before connecting production users; do not silently import demo rows.
- **Security scope:** The 64-test suite covers the existing nine-table foundation only. It is not an audit of future invitation endpoints, website APIs, customer commerce, auctions, or production deployment.

## 9. Implementation sequence

1. **Approve the role and authority rules.** Confirm which owners may invite, whether managers can administer staff, employee update/archive needs, multi-farm behavior, owner bootstrap, and MFA requirement.
2. **Design the lifecycle schema and API contract.** Specify invitation expiry/acceptance, audit events, idempotency, final-owner invariants, failure recovery, and permission codes. Review the migration and threat model before coding.
3. **Implement trusted staff lifecycle endpoints.** Invite, accept/activate, role change, disable, session revoke; no browser writes to membership or role catalog. Add pgTAP and Node coverage before enabling the UI.
4. **Add staff sign-in and route admission.** Keep the existing Herdbook URL, make states explicit, load active farm memberships, and add farm selection for multi-farm users.
5. **Connect one Herdbook vertical slice.** Replace local-only animal reads/creates with session-scoped RLS queries, preserving the current screen and local demo data only as clearly marked, non-production preview. Verify denied requests and existing customer flows.
6. **Migrate remaining Herdbook features incrementally.** Each area (updates/archive, listings, sales, and later health/inventory/finance) gets a permission, migration, server boundary, audit expectations, and negative tests before becoming available.
7. **Release gate.** Review MFA, CSP/XSS, session revocation, backup/restore, logs, PWA caching, staging and rollback. Hosted deployment remains a separate explicit decision.

### Recommended next implementation task

Implement **staff lifecycle foundation** only after the role/owner-bootstrap decisions in step 1 are approved: write the migration/API contract for audited invitations, activation, role changes, and suspension; then add isolated pgTAP/Node tests. Do not connect Herdbook to real staff data until those tests pass. The first UI slice should follow that foundation.

## 10. Change boundary for this task

This is an architecture design. It does not create staff users, start or link a hosted project, change customer authentication, modify frontend code, alter migrations/database state, import local records, deploy services, or enable staff access. Current real staff onboarding remains blocked until the trusted lifecycle and tests are implemented.
